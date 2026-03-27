-- ============================================================
-- NeoVertex — Agenda / Compromissos
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela de compromissos
create table if not exists appointments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  start_at timestamp with time zone not null,
  end_at timestamp with time zone,
  location text,
  type text check (type in ('meeting', 'call', 'deadline', 'reminder', 'other')) default 'other',
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  status text check (status in ('pending', 'completed', 'cancelled')) default 'pending',
  related_user_id uuid references profiles(id) on delete set null,
  related_project_id uuid references projects(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. RLS para appointments
alter table appointments enable row level security;

drop policy if exists "Admins can manage appointments." on appointments;
create policy "Admins can manage appointments." on appointments
  for all using (auth.uid() in (select id from profiles where role = 'admin'));

drop policy if exists "Users can view own appointments." on appointments;
create policy "Users can view own appointments." on appointments
  for select using (auth.uid() = user_id or auth.uid() = related_user_id);

-- ============================================================
-- 3. Criar usuário nelson@neovertex.com com role admin
--    (Senha: NeoVtx@Agenda26!)
-- ============================================================

-- Habilitar pgcrypto se ainda não estiver ativo
create extension if not exists pgcrypto;

-- Inserir usuário no sistema de autenticação do Supabase
DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- Criar na tabela de auth
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    role,
    aud,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'nelson@neovertex.com',
    crypt('NeoVtx@Agenda26!', gen_salt('bf')),
    now(),                 -- email já confirmado
    'authenticated',
    'authenticated',
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    false,
    '',
    '',
    '',
    ''
  )
  ON CONFLICT (email) DO NOTHING;

  -- Garantir profile com role admin
  INSERT INTO public.profiles (id, email, role)
  VALUES (new_user_id, 'nelson@neovertex.com', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin';

  -- Se o usuário já existia, atualizar role para admin
  UPDATE public.profiles
  SET role = 'admin'
  WHERE email = 'nelson@neovertex.com';

END $$;
