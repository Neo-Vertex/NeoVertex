-- Confirm the specific user email to allow login
-- This works by manually setting the verification timestamp in the auth.users table

UPDATE auth.users
SET 
  email_confirmed_at = now(),
  confirmed_at = now(),
  last_sign_in_at = now(),
  raw_app_meta_data = raw_app_meta_data || '{"provider": "email", "providers": ["email"]}'::jsonb
WHERE email = 'aquarise@neovertex.com';

-- Ensure the profile exists and is correctly linked
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'associate'
FROM auth.users
WHERE email = 'aquarise@neovertex.com'
ON CONFLICT (id) DO UPDATE
SET role = 'associate'; -- Ensure role is correct
