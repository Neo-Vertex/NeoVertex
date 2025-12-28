-- Function to allow admins to reset user passwords
create extension if not exists pgcrypto;

-- Drop function if it exists with previous signature
drop function if exists public.admin_reset_password(uuid, text);
drop function if exists public.admin_reset_password(text, text);

create or replace function public.admin_reset_password(target_user_id text, new_password text)
returns void
security definer
as $$
declare
  tgt_uuid uuid;
begin
  -- Validate Admin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Acesso negado. Apenas administradores podem redefinir senhas.';
  end if;

  -- Cast ID
  begin
    tgt_uuid := target_user_id::uuid;
  exception when others then
    raise exception 'ID de usuário inválido.';
  end;

  -- Update Password
  update auth.users
  set encrypted_password = crypt(new_password, gen_salt('bf'))
  where id = tgt_uuid;
  
  -- Verify update
  if not found then
    raise exception 'Usuário não encontrado.';
  end if;
end;
$$ language plpgsql;
