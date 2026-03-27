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

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => console.log(`NeoVertex API rodando na porta ${PORT}`));
