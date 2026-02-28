-- Script to auto-generate Department Head accounts based on the departments table
-- Note: This requires the pgcrypto extension to hash passwords.
-- Users created will have the password: Password@123

DO $$
DECLARE
  dept RECORD;
  new_user_id UUID;
  existing_app_user UUID;
BEGIN
  -- Ensure pgcrypto is enabled for gen_salt and crypt
  CREATE EXTENSION IF NOT EXISTS pgcrypto;

  FOR dept IN SELECT id, name, dept_head_email FROM public.departments WHERE dept_head_email IS NOT NULL LOOP
    -- 1. Check if auth user already exists
    new_user_id := NULL;
    SELECT id INTO new_user_id FROM auth.users WHERE email = dept.dept_head_email;
    
    -- Insert into auth.users if not exists
    IF new_user_id IS NULL THEN
      new_user_id := gen_random_uuid();
      
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
      );
    END IF;

    -- 2. Check and Insert/Update app_users
    IF new_user_id IS NOT NULL THEN
      existing_app_user := NULL;
      SELECT id INTO existing_app_user FROM public.app_users WHERE auth_user_id = new_user_id;

      IF existing_app_user IS NULL THEN
        -- Insert
        INSERT INTO public.app_users (auth_user_id, name, role, department_id)
        VALUES (new_user_id, 'Trưởng BP ' || dept.name, 'DEPT_HEAD', dept.id);
      ELSE
         -- Update
         UPDATE public.app_users SET role = 'DEPT_HEAD', department_id = dept.id WHERE id = existing_app_user;
      END IF;
    END IF;

  END LOOP;
END $$;
