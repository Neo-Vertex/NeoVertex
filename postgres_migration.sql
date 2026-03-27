-- ============================================================
-- NeoVertex — Schema PostgreSQL Completo (sem Supabase)
-- Execute no terminal do PostgreSQL no Coolify:
--   psql -U postgres postgres
--   \i /path/to/postgres_migration.sql
-- OU cole diretamente no terminal psql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── USERS (substitui auth.users do Supabase) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ── PROFILES ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
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
);

-- ── COLAB BRANDS ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS colab_brands (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name       TEXT NOT NULL,
  logo_url   TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE profiles
  ADD CONSTRAINT fk_colab_brand
  FOREIGN KEY (colab_brand_id) REFERENCES colab_brands(id) ON DELETE SET NULL
  NOT VALID;

-- ── PROJECTS ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS projects (
  id                      UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id                 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  service                 TEXT NOT NULL,
  status                  TEXT CHECK (status IN ('Contratado','Em Desenvolvimento','Homologação','Concluído')) DEFAULT 'Contratado',
  start_date              DATE NOT NULL,
  value                   NUMERIC DEFAULT 0,
  currency                TEXT DEFAULT 'BRL',
  hours_balance           NUMERIC DEFAULT 0,
  maintenance_end_date    DATE,
  maintenance_value       NUMERIC DEFAULT 0,
  monthly_maintenance_value NUMERIC DEFAULT 0,
  maintenance_due_day     INTEGER,
  maintenance_start_date  DATE,
  project_url             TEXT,
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ── PROJECT LOGS ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS project_logs (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id       UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  description      TEXT NOT NULL,
  start_time       TIMESTAMP WITH TIME ZONE,
  end_time         TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ── FINANCIAL RECORDS ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS financial_records (
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
);

-- ── EXPENSES (legado) ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS expenses (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  description TEXT NOT NULL,
  amount      NUMERIC NOT NULL,
  date        DATE NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ── MESSAGES ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS messages (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content     TEXT NOT NULL,
  read        BOOLEAN DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ── CONTACT REQUESTS ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS contact_requests (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name         TEXT NOT NULL,
  country      TEXT NOT NULL,
  country_code TEXT NOT NULL,
  phone        TEXT NOT NULL,
  message      TEXT NOT NULL,
  read         BOOLEAN DEFAULT false,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ── SERVICES ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS services (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name                  TEXT NOT NULL,
  description           TEXT,
  active                BOOLEAN DEFAULT true,
  has_implementation    BOOLEAN DEFAULT false,
  has_monthly_fee       BOOLEAN DEFAULT false,
  monthly_fee_value     NUMERIC DEFAULT 0,
  monthly_fee_start_date DATE,
  payment_methods       TEXT,
  features              TEXT,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ── PRODUCTS ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  base_value  NUMERIC DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ── LANGUAGES ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS languages (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code       TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  active     BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ── APPOINTMENTS (AGENDA) ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS appointments (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id             TEXT NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT,
  start_at            TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at              TIMESTAMP WITH TIME ZONE,
  location            TEXT,
  type                TEXT CHECK (type IN ('meeting','call','deadline','reminder','other')) DEFAULT 'other',
  priority            TEXT CHECK (priority IN ('low','medium','high')) DEFAULT 'medium',
  status              TEXT CHECK (status IN ('pending','completed','cancelled')) DEFAULT 'pending',
  related_user_id     TEXT,
  related_project_id  TEXT,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ── CRM ───────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS crm_pipelines (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name       TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS crm_stages (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pipeline_id UUID REFERENCES crm_pipelines(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  color       TEXT DEFAULT '#6B7280',
  "order"     INTEGER DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS crm_leads (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pipeline_id  UUID REFERENCES crm_pipelines(id) ON DELETE CASCADE,
  stage_id     UUID REFERENCES crm_stages(id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  company      TEXT,
  email        TEXT,
  phone        TEXT,
  position     TEXT,
  address      TEXT,
  country      TEXT,
  observation  TEXT,
  value        NUMERIC DEFAULT 0,
  source       TEXT,
  status       TEXT DEFAULT 'active',
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS crm_interactions (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lead_id    UUID REFERENCES crm_leads(id) ON DELETE CASCADE NOT NULL,
  type       TEXT NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ── DADOS INICIAIS ────────────────────────────────────────────────────────────

INSERT INTO languages (code, name, active) VALUES
  ('pt-BR', 'Português (Brasil)', true),
  ('en-US', 'Inglês (Estados Unidos)', true),
  ('fr-FR', 'Francês', false),
  ('es-ES', 'Espanhol', false)
ON CONFLICT (code) DO NOTHING;

INSERT INTO products (name, description, base_value) VALUES
  ('Desenvolvimento de Web Site', 'Criação de site institucional moderno, responsivo e otimizado para SEO.', 2500.00),
  ('E-commerce Completo', 'Loja virtual com gestão de produtos, pagamentos e painel administrativo.', 5000.00),
  ('Consultoria de TI', 'Análise técnica e estratégica para otimização de processos.', 350.00),
  ('Implementação de Agente de IA', 'Integração de assistente virtual inteligente para atendimento automatizado.', 1500.00)
ON CONFLICT DO NOTHING;

INSERT INTO crm_pipelines (id, name) VALUES
  (uuid_generate_v4(), 'Pipeline Principal')
ON CONFLICT DO NOTHING;

-- ── ADMIN USER ────────────────────────────────────────────────────────────────
-- Cria usuário admin padrão
-- Login: adm@neovertex.com | Senha: NeoVertex@2026!

DO $$
DECLARE
  admin_id UUID := uuid_generate_v4();
BEGIN
  INSERT INTO users (id, email, password_hash)
  VALUES (admin_id, 'adm@neovertex.com', crypt('NeoVertex@2026!', gen_salt('bf')))
  ON CONFLICT (email) DO NOTHING;

  INSERT INTO profiles (id, email, role)
  VALUES (admin_id, 'adm@neovertex.com', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin';
END $$;

-- Usuário Nelson
DO $$
DECLARE
  nelson_id UUID := uuid_generate_v4();
BEGIN
  INSERT INTO users (id, email, password_hash)
  VALUES (nelson_id, 'nelson@neovertex.com', crypt('NeoVtx@Agenda26!', gen_salt('bf')))
  ON CONFLICT (email) DO NOTHING;

  INSERT INTO profiles (id, email, role)
  VALUES (nelson_id, 'nelson@neovertex.com', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin';
END $$;

SELECT 'Schema criado com sucesso!' AS resultado;
