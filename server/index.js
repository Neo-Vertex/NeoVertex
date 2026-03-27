const express = require('express');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'neovertex-change-this-secret';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

app.use(cors({ origin: '*' }));
app.use(express.json());

// ── Auth Middleware ──────────────────────────────────────────────────────────

app.use((req, _res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try { req.user = jwt.verify(token, JWT_SECRET); } catch { req.user = null; }
  }
  next();
});

// ── Auth Routes ──────────────────────────────────────────────────────────────

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email e senha são obrigatórios' });

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const { rows: pRows } = await pool.query('SELECT role FROM profiles WHERE id = $1', [user.id]);
    const role = pRows[0]?.role || 'associate';

    const token = jwt.sign({ id: user.id, email: user.email, role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, role } });
  } catch (err) {
    console.error('login error:', err.message);
    res.status(500).json({ message: 'Erro interno' });
  }
});

app.get('/api/auth/me', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Não autenticado' });
  res.json({ id: req.user.id, email: req.user.email, role: req.user.role });
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(400).json({ message: 'Usuário já existe' });

    const id = uuidv4();
    const hash = await bcrypt.hash(password, 10);

    await pool.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)', [id, email, hash]);
    await pool.query(
      'INSERT INTO profiles (id, email, role) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
      [id, email, 'associate']
    );

    res.status(201).json({ user: { id, email } });
  } catch (err) {
    console.error('signup error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── Query Parser ─────────────────────────────────────────────────────────────

const ALLOWED_TABLES = [
  'profiles', 'projects', 'financial_records', 'contact_requests', 'messages',
  'services', 'products', 'colab_brands', 'appointments', 'crm_pipelines',
  'crm_stages', 'crm_leads', 'crm_interactions', 'project_logs', 'languages',
  'expenses',
];

const SQL_OPS = { eq: '=', neq: '!=', gt: '>', lt: '<', gte: '>=', lte: '<=', like: 'LIKE', ilike: 'ILIKE' };

function parseFilters(query) {
  const conditions = [];
  const params = [];
  let idx = 1;

  for (const [key, rawVal] of Object.entries(query)) {
    if (['select', 'order', 'limit', 'count', 'offset'].includes(key)) continue;
    const val = String(rawVal);

    if (key === 'or') {
      const inner = val.replace(/^\(|\)$/g, '').split(',');
      const orParts = [];
      for (const part of inner) {
        const m = part.match(/^(\w+)\.(eq|neq|gt|lt|gte|lte|like|ilike)\.(.+)$/);
        if (m) {
          orParts.push(`${m[1]} ${SQL_OPS[m[2]]} $${idx++}`);
          params.push(m[3]);
        }
      }
      if (orParts.length) conditions.push(`(${orParts.join(' OR ')})`);
      continue;
    }

    const m = val.match(/^(eq|neq|gt|lt|gte|lte|like|ilike|in|is)\.(.+)$/);
    if (!m) continue;
    const [, op, opVal] = m;

    if (op === 'in') {
      const vals = opVal.replace(/^\(|\)$/g, '').split(',').filter(Boolean);
      if (!vals.length) continue;
      const ph = vals.map(() => `$${idx++}`).join(', ');
      conditions.push(`${key} IN (${ph})`);
      params.push(...vals);
    } else if (op === 'is') {
      conditions.push(`${key} IS ${opVal.toUpperCase() === 'NULL' ? 'NULL' : 'NOT NULL'}`);
    } else {
      conditions.push(`${key} ${SQL_OPS[op]} $${idx++}`);
      params.push(opVal);
    }
  }

  return { conditions, params };
}

// ── Generic CRUD ─────────────────────────────────────────────────────────────

// GET / HEAD
app.get('/api/:table', async (req, res) => {
  const { table } = req.params;
  if (!ALLOWED_TABLES.includes(table)) return res.status(400).json({ message: 'Tabela não permitida' });

  try {
    const { select, order, limit, offset, count: countMode } = req.query;
    const columns = select ? select.split(',').map(c => c.trim()).join(', ') : '*';
    const { conditions, params } = parseFilters(req.query);
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    if (countMode === 'exact') {
      const r = await pool.query(`SELECT COUNT(*) FROM ${table} ${where}`, params);
      res.set('x-total-count', r.rows[0].count);
      return res.json({ count: parseInt(r.rows[0].count), data: [] });
    }

    let sql = `SELECT ${columns} FROM ${table} ${where}`;
    if (order) {
      const [col, dir] = order.split('.');
      sql += ` ORDER BY ${col} ${dir?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}`;
    }
    if (limit) sql += ` LIMIT ${parseInt(limit)}`;
    if (offset) sql += ` OFFSET ${parseInt(offset)}`;

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(`GET /${table}:`, err.message);
    res.status(500).json({ message: err.message });
  }
});

app.head('/api/:table', async (req, res) => {
  const { table } = req.params;
  if (!ALLOWED_TABLES.includes(table)) return res.status(400).end();
  try {
    const { conditions, params } = parseFilters(req.query);
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const r = await pool.query(`SELECT COUNT(*) FROM ${table} ${where}`, params);
    res.set('x-total-count', r.rows[0].count);
    res.status(200).end();
  } catch { res.status(500).end(); }
});

// POST
app.post('/api/:table', async (req, res) => {
  const { table } = req.params;
  if (!ALLOWED_TABLES.includes(table)) return res.status(400).json({ message: 'Tabela não permitida' });

  try {
    const rows = Array.isArray(req.body) ? req.body : [req.body];
    const results = [];

    for (const row of rows) {
      if (!row.id) row.id = uuidv4();
      const cols = Object.keys(row);
      const vals = Object.values(row);
      const ph = cols.map((_, i) => `$${i + 1}`).join(', ');
      const r = await pool.query(
        `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${ph}) RETURNING *`,
        vals
      );
      results.push(r.rows[0]);
    }

    res.status(201).json(results.length === 1 ? results[0] : results);
  } catch (err) {
    console.error(`POST /${table}:`, err.message);
    res.status(500).json({ message: err.message });
  }
});

// PATCH
app.patch('/api/:table', async (req, res) => {
  const { table } = req.params;
  if (!ALLOWED_TABLES.includes(table)) return res.status(400).json({ message: 'Tabela não permitida' });

  try {
    const { conditions, params: filterParams } = parseFilters(req.query);
    if (!conditions.length) return res.status(400).json({ message: 'Filtro obrigatório' });

    const setCols = Object.keys(req.body);
    const setVals = Object.values(req.body);
    const setClause = setCols.map((c, i) => `${c} = $${i + 1}`).join(', ');
    const offset = setCols.length;
    const shiftedConditions = conditions.map(c =>
      c.replace(/\$(\d+)/g, (_, n) => `$${parseInt(n) + offset}`)
    );

    const r = await pool.query(
      `UPDATE ${table} SET ${setClause} WHERE ${shiftedConditions.join(' AND ')} RETURNING *`,
      [...setVals, ...filterParams]
    );
    res.json(r.rows);
  } catch (err) {
    console.error(`PATCH /${table}:`, err.message);
    res.status(500).json({ message: err.message });
  }
});

// DELETE
app.delete('/api/:table', async (req, res) => {
  const { table } = req.params;
  if (!ALLOWED_TABLES.includes(table)) return res.status(400).json({ message: 'Tabela não permitida' });

  try {
    const { conditions, params } = parseFilters(req.query);
    if (!conditions.length) return res.status(400).json({ message: 'Filtro obrigatório' });

    const r = await pool.query(
      `DELETE FROM ${table} WHERE ${conditions.join(' AND ')} RETURNING *`,
      params
    );
    res.json(r.rows);
  } catch (err) {
    console.error(`DELETE /${table}:`, err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── RPC Routes ────────────────────────────────────────────────────────────────

app.post('/api/rpc/admin_delete_associate', async (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Acesso negado' });
  try {
    const { target_user_id } = req.body;
    await pool.query('DELETE FROM users WHERE id = $1', [target_user_id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/rpc/admin_reset_password', async (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Acesso negado' });
  try {
    const { target_user_id, new_password } = req.body;
    const hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, target_user_id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ── Health Check ──────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Auto Migration ────────────────────────────────────────────────────────────

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    await client.query(`CREATE TABLE IF NOT EXISTS users (
      id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS profiles (
      id               UUID REFERENCES users(id) ON DELETE CASCADE PRIMARY KEY,
      role             TEXT CHECK (role IN ('admin', 'associate')) DEFAULT 'associate',
      email            TEXT UNIQUE NOT NULL,
      full_name        TEXT,
      phone            TEXT,
      company_name     TEXT,
      avatar_url       TEXT,
      bio              TEXT,
      country          TEXT,
      location         TEXT,
      language         TEXT,
      birth_date       DATE,
      referral_source  TEXT,
      is_colab         BOOLEAN DEFAULT false,
      colab_brand_id   UUID,
      active           BOOLEAN DEFAULT true,
      created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS colab_brands (
      id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name       TEXT NOT NULL,
      logo_url   TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS projects (
      id                        UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id                   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      service                   TEXT NOT NULL,
      status                    TEXT CHECK (status IN ('Contratado','Em Desenvolvimento','Homologação','Concluído')) DEFAULT 'Contratado',
      start_date                DATE NOT NULL,
      value                     NUMERIC DEFAULT 0,
      currency                  TEXT DEFAULT 'BRL',
      hours_balance             NUMERIC DEFAULT 0,
      maintenance_end_date      DATE,
      maintenance_value         NUMERIC DEFAULT 0,
      monthly_maintenance_value NUMERIC DEFAULT 0,
      maintenance_due_day       INTEGER,
      maintenance_start_date    DATE,
      project_url               TEXT,
      created_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS project_logs (
      id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      project_id       UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
      description      TEXT NOT NULL,
      start_time       TIMESTAMP WITH TIME ZONE,
      end_time         TIMESTAMP WITH TIME ZONE,
      duration_minutes INTEGER,
      created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS financial_records (
      id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      type            TEXT CHECK (type IN ('income','expense')) NOT NULL,
      description     TEXT NOT NULL,
      amount          NUMERIC NOT NULL,
      original_amount NUMERIC,
      currency        TEXT DEFAULT 'BRL',
      exchange_rate   NUMERIC DEFAULT 1,
      payer           TEXT,
      payment_method  TEXT,
      tax_amount      NUMERIC DEFAULT 0,
      date            DATE NOT NULL,
      associate_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
      status          TEXT DEFAULT 'confirmed',
      created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS expenses (
      id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      description TEXT NOT NULL,
      amount      NUMERIC NOT NULL,
      date        DATE NOT NULL,
      created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS messages (
      id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      sender_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
      content     TEXT NOT NULL,
      read        BOOLEAN DEFAULT false,
      created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS contact_requests (
      id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name         TEXT NOT NULL,
      country      TEXT NOT NULL,
      country_code TEXT NOT NULL,
      phone        TEXT NOT NULL,
      message      TEXT NOT NULL,
      read         BOOLEAN DEFAULT false,
      created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS services (
      id                     UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name                   TEXT NOT NULL,
      description            TEXT,
      active                 BOOLEAN DEFAULT true,
      has_implementation     BOOLEAN DEFAULT false,
      has_monthly_fee        BOOLEAN DEFAULT false,
      monthly_fee_value      NUMERIC DEFAULT 0,
      monthly_fee_start_date DATE,
      payment_methods        TEXT,
      features               TEXT,
      created_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS products (
      id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT,
      base_value  NUMERIC DEFAULT 0,
      created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS languages (
      id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      code       TEXT UNIQUE NOT NULL,
      name       TEXT NOT NULL,
      active     BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS appointments (
      id                 UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id            TEXT NOT NULL,
      title              TEXT NOT NULL,
      description        TEXT,
      start_at           TIMESTAMP WITH TIME ZONE NOT NULL,
      end_at             TIMESTAMP WITH TIME ZONE,
      location           TEXT,
      type               TEXT CHECK (type IN ('meeting','call','deadline','reminder','other')) DEFAULT 'other',
      priority           TEXT CHECK (priority IN ('low','medium','high')) DEFAULT 'medium',
      status             TEXT CHECK (status IN ('pending','completed','cancelled')) DEFAULT 'pending',
      related_user_id    TEXT,
      related_project_id TEXT,
      created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS crm_pipelines (
      id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name       TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS crm_stages (
      id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      pipeline_id UUID REFERENCES crm_pipelines(id) ON DELETE CASCADE NOT NULL,
      name        TEXT NOT NULL,
      color       TEXT DEFAULT '#6B7280',
      "order"     INTEGER DEFAULT 0,
      created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS crm_leads (
      id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      pipeline_id UUID REFERENCES crm_pipelines(id) ON DELETE CASCADE,
      stage_id    UUID REFERENCES crm_stages(id) ON DELETE SET NULL,
      name        TEXT NOT NULL,
      company     TEXT,
      email       TEXT,
      phone       TEXT,
      position    TEXT,
      address     TEXT,
      country     TEXT,
      observation TEXT,
      value       NUMERIC DEFAULT 0,
      source      TEXT,
      status      TEXT DEFAULT 'active',
      created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    await client.query(`CREATE TABLE IF NOT EXISTS crm_interactions (
      id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      lead_id    UUID REFERENCES crm_leads(id) ON DELETE CASCADE NOT NULL,
      type       TEXT NOT NULL,
      content    TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    )`);

    // Seed default data
    await client.query(`INSERT INTO languages (code, name, active) VALUES
      ('pt-BR','Português (Brasil)',true),('en-US','Inglês (Estados Unidos)',true),
      ('fr-FR','Francês',false),('es-ES','Espanhol',false)
      ON CONFLICT (code) DO NOTHING`);

    await client.query(`INSERT INTO products (name, description, base_value) VALUES
      ('Desenvolvimento de Web Site','Criação de site institucional moderno, responsivo e otimizado para SEO.',2500),
      ('E-commerce Completo','Loja virtual com gestão de produtos, pagamentos e painel administrativo.',5000),
      ('Consultoria de TI','Análise técnica e estratégica para otimização de processos.',350),
      ('Implementação de Agente de IA','Integração de assistente virtual inteligente para atendimento automatizado.',1500)
      ON CONFLICT DO NOTHING`);

    // Admin users
    const adminId = uuidv4();
    const nelsonId = uuidv4();
    const adminHash = await bcrypt.hash('NeoVertex@2026!', 10);
    const nelsonHash = await bcrypt.hash('NeoVtx@Agenda26!', 10);

    await client.query(
      `INSERT INTO users (id, email, password_hash) VALUES ($1,$2,$3) ON CONFLICT (email) DO NOTHING`,
      [adminId, 'adm@neovertex.com', adminHash]
    );
    const { rows: [adm] } = await client.query('SELECT id FROM users WHERE email=$1', ['adm@neovertex.com']);
    await client.query(
      `INSERT INTO profiles (id, email, role) VALUES ($1,$2,'admin') ON CONFLICT (id) DO UPDATE SET role='admin'`,
      [adm.id, 'adm@neovertex.com']
    );

    await client.query(
      `INSERT INTO users (id, email, password_hash) VALUES ($1,$2,$3) ON CONFLICT (email) DO NOTHING`,
      [nelsonId, 'nelson@neovertex.com', nelsonHash]
    );
    const { rows: [nelson] } = await client.query('SELECT id FROM users WHERE email=$1', ['nelson@neovertex.com']);
    await client.query(
      `INSERT INTO profiles (id, email, role) VALUES ($1,$2,'admin') ON CONFLICT (id) DO UPDATE SET role='admin'`,
      [nelson.id, 'nelson@neovertex.com']
    );

    console.log('Migrations concluídas com sucesso.');
  } catch (err) {
    console.error('Erro na migration:', err.message);
  } finally {
    client.release();
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, async () => {
  console.log(`NeoVertex API rodando na porta ${PORT}`);
  await runMigrations();
});
