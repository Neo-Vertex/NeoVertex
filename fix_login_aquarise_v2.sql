-- Corrected script to fix the login
-- Only updates email_confirmed_at, avoiding the "generated column" error

UPDATE auth.users
SET 
  email_confirmed_at = now(),
  updated_at = now()
WHERE email = 'aquarise@neovertex.com';

-- Ensure the profile exists (just in case)
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'associate'
FROM auth.users
WHERE email = 'aquarise@neovertex.com'
ON CONFLICT (id) DO NOTHING;
