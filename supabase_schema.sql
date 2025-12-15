-- Safe Schema Update (Preserves Data)
-- Only creates tables/columns if they don't exist.

-- Ensure extensions if needed
create extension if not exists "uuid-ossp";

-- Create a table for public profiles
-- Create a table for public profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text check (role in ('admin', 'associate')) default 'associate',
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a table for projects
create table if not exists projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  service text not null,
  status text check (status in ('Contratado', 'Em Desenvolvimento', 'Homologação', 'Concluído')) default 'Contratado',
  start_date date not null,
  value numeric default 0,
  currency text default 'BRL',
  hours_balance numeric default 0,
  maintenance_end_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add currency column if it doesn't exist
alter table projects add column if not exists currency text default 'BRL';

-- Set up RLS for projects
alter table projects enable row level security;

drop policy if exists "Users can view own projects." on projects;
create policy "Users can view own projects." on projects
  for select using (auth.uid() = user_id);

drop policy if exists "Authenticated users can insert projects." on projects;
create policy "Authenticated users can insert projects." on projects
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Users can update own projects." on projects;
create policy "Users can update own projects." on projects
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own projects." on projects;
create policy "Users can delete own projects." on projects
  for delete using (auth.uid() = user_id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case 
      when new.email = 'adm@neovertex.com' then 'admin'
      else 'associate'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on new user creation
drop trigger if exists on_auth_user_created on auth.users;
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create a table for expenses
create table if not exists expenses (
  id uuid default uuid_generate_v4() primary key,
  description text not null,
  amount numeric not null,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for expenses
alter table expenses enable row level security;

drop policy if exists "Authenticated users can view expenses." on expenses;
create policy "Authenticated users can view expenses." on expenses
  for select using (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can insert expenses." on expenses;
create policy "Authenticated users can insert expenses." on expenses
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can delete expenses." on expenses;
create policy "Authenticated users can delete expenses." on expenses
  for delete using (auth.role() = 'authenticated');

-- Backfill profiles for existing users (Fix for 'Error verifying user profile')
insert into public.profiles (id, email, role)
select id, email, case when email = 'adm@neovertex.com' then 'admin' else 'associate' end
from auth.users
on conflict (id) do nothing;

-- Create table for Colab Brands
create table if not exists colab_brands (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create table for Products
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  base_value numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add new columns to profiles
alter table profiles add column if not exists country text;
alter table profiles add column if not exists location text;
alter table profiles add column if not exists language text;
alter table profiles add column if not exists birth_date date;
alter table profiles add column if not exists referral_source text;
alter table profiles add column if not exists is_colab boolean default false;
alter table profiles add column if not exists colab_brand_id uuid references colab_brands(id);

-- New Profile Fields
alter table profiles add column if not exists full_name text;
alter table profiles add column if not exists phone text;
alter table profiles add column if not exists company_name text;
alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists bio text;

-- RLS for new tables
alter table colab_brands enable row level security;
alter table products enable row level security;

drop policy if exists "Authenticated users can view colab_brands." on colab_brands;
create policy "Authenticated users can view colab_brands." on colab_brands
  for select using (auth.role() = 'authenticated');

drop policy if exists "Admins can manage colab_brands." on colab_brands;
create policy "Admins can manage colab_brands." on colab_brands
  for all using (auth.uid() in (select id from profiles where role = 'admin'));

drop policy if exists "Authenticated users can view products." on products;
create policy "Authenticated users can view products." on products
  for select using (auth.role() = 'authenticated');

drop policy if exists "Admins can manage products." on products;
create policy "Admins can manage products." on products
  for all using (auth.uid() in (select id from profiles where role = 'admin'));

-- Create table for Services
create table if not exists services (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for services
alter table services enable row level security;

drop policy if exists "Authenticated users can view services." on services;
create policy "Authenticated users can view services." on services
  for select using (auth.role() = 'authenticated');

drop policy if exists "Admins can manage services." on services;
create policy "Admins can manage services." on services
  for all using (auth.uid() in (select id from profiles where role = 'admin'));

-- Create table for Project Logs (Time Tracking)
create table if not exists project_logs (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  description text not null,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  duration_minutes integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for project_logs
alter table project_logs enable row level security;

drop policy if exists "Admins can manage project_logs." on project_logs;
create policy "Admins can manage project_logs." on project_logs
  for all using (auth.uid() in (select id from profiles where role = 'admin'));

drop policy if exists "Associates can view own project_logs." on project_logs;
create policy "Associates can view own project_logs." on project_logs
  for select using (
    project_id in (select id from projects where user_id = auth.uid())
  );

-- Add project_url to projects
alter table projects add column if not exists project_url text;

-- Create table for Financial Records (Advanced Financials)
create table if not exists financial_records (
  id uuid default uuid_generate_v4() primary key,
  type text check (type in ('income', 'expense')) not null,
  description text not null,
  amount numeric not null, -- Value in BRL (after conversion if applicable)
  original_amount numeric, -- Value in original currency
  currency text default 'BRL',
  exchange_rate numeric default 1,
  payer text, -- Who paid (for income) or who was paid (for expense)
  payment_method text,
  tax_amount numeric default 0,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for financial_records
alter table financial_records enable row level security;

drop policy if exists "Admins can manage financial_records." on financial_records;
create policy "Admins can manage financial_records." on financial_records
  for all using (auth.uid() in (select id from profiles where role = 'admin'));

-- Create table for Messages
create table if not exists messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for messages
alter table messages enable row level security;

drop policy if exists "Users can view own messages." on messages;
create policy "Users can view own messages." on messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users can insert messages." on messages;
create policy "Users can insert messages." on messages
  for insert with check (auth.uid() = sender_id);

drop policy if exists "Users can update own messages (mark as read)." on messages;
create policy "Users can update own messages (mark as read)." on messages
  for update using (auth.uid() = receiver_id);

-- Create table for Contact Requests (Public Form)
create table if not exists contact_requests (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  country text not null,
  country_code text not null,
  phone text not null,
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for contact_requests
alter table contact_requests enable row level security;

-- Allow public to insert (for contact form)
drop policy if exists "Public can insert contact_requests." on contact_requests;
create policy "Public can insert contact_requests." on contact_requests
  for insert with check (true);

-- Allow admins to view/manage
drop policy if exists "Admins can manage contact_requests." on contact_requests;
create policy "Admins can manage contact_requests." on contact_requests
  for all using (auth.uid() in (select id from profiles where role = 'admin'));

-- Insert initial products (if not exist)
insert into products (name, description, base_value)
select 'Desenvolvimento de Web Site', 'Criação de site institucional moderno, responsivo e otimizado para SEO.', 2500.00
where not exists (select 1 from products where name = 'Desenvolvimento de Web Site');

insert into products (name, description, base_value)
select 'E-commerce Completo', 'Loja virtual com gestão de produtos, pagamentos e painel administrativo.', 5000.00
where not exists (select 1 from products where name = 'E-commerce Completo');

insert into products (name, description, base_value)
select 'Consultoria de TI', 'Análise técnica e estratégica para otimização de processos e infraestrutura.', 350.00
where not exists (select 1 from products where name = 'Consultoria de TI');

insert into products (name, description, base_value)
select 'Implementação de Agente de IA no Site', 'Integração de assistente virtual inteligente para atendimento automatizado.', 1500.00
where not exists (select 1 from products where name = 'Implementação de Agente de IA no Site');
