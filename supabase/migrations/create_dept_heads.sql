-- Script to auto-generate Department Head accounts based on the departments table
-- Note: This requires the pgcrypto extension to hash passwords.
-- Users created will have the password: Password@123

DO $$
DECLARE
  dept RECORD;
  new_user_id UUID;
BEGIN
  -- Ensure pgcrypto is enabled for gen_salt and crypt
  CREATE EXTENSION IF NOT EXISTS pgcrypto;

  FOR dept IN SELECT id, name, dept_head_email FROM public.departments WHERE dept_head_email IS NOT NULL LOOP
    new_user_id := gen_random_uuid();
    
    -- Insert into auth.users (This safely skips if the email is already registered)
    INSERT INTO auth.users (
      id, 
      instance_id, 
      email, 
      encrypted_password, 
      email_confirmed_at, 
      aud, 
      role, 
      raw_app_meta_data, 
      raw_user_meta_data, 
      created_at, 
      updated_at, 
      confirmation_token, 
      recovery_token, 
      email_change_token_new, 
      email_change
    )
    VALUES (
      new_user_id, 
      '00000000-0000-0000-0000-000000000000', 
      dept.dept_head_email, 
      crypt('Password@123', gen_salt('bf')), 
      now(), 
      'authenticated', 
      'authenticated', 
      '{"provider":"email","providers":["email"]}', 
      '{"name":"Dept Head - ' || dept.name || '"}', 
      now(), 
      now(), 
      '', 
      '', 
      '', 
      ''
    )
    ON CONFLICT (email) DO NOTHING;

    -- Fetch the actual ID just in case it already existed and we skipped insertion
    SELECT id INTO new_user_id FROM auth.users WHERE email = dept.dept_head_email;

    -- Insert or Update app_users
    IF new_user_id IS NOT NULL THEN
      INSERT INTO public.app_users (auth_user_id, name, role, department_id)
      VALUES (new_user_id, 'Trưởng BP ' || dept.name, 'DEPT_HEAD', dept.id)
      ON CONFLICT (auth_user_id) DO UPDATE 
      SET role = 'DEPT_HEAD', department_id = dept.id;
    END IF;

  END LOOP;
END $$;
