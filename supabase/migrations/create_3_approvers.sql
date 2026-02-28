-- Script tạo 3 tài khoản duyệt tổng quát: Production, QA Admin, HR Admin
-- Password chung: Password@123

DO $$
DECLARE
  users_data JSON := '[
    {"email": "production@example.com", "name": "Production Approver"},
    {"email": "qa_admin@example.com", "name": "QA Admin Approver"},
    {"email": "hr_admin@example.com", "name": "HR Admin Approver"}
  ]';
  user_rec JSON;
  new_user_id UUID;
BEGIN
  CREATE EXTENSION IF NOT EXISTS pgcrypto;

  FOR user_rec IN SELECT * FROM json_array_elements(users_data)
  LOOP
    -- Kiểm tra xem user đã tồn tại chưa
    SELECT id INTO new_user_id FROM auth.users WHERE email = user_rec->>'email';
    
    -- Nếu chưa tồn tại, tiến hành tạo mới
    IF new_user_id IS NULL THEN
      new_user_id := gen_random_uuid();
      
      INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at, aud, role, 
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
        confirmation_token, recovery_token, email_change_token_new, email_change
      )
      VALUES (
        new_user_id, '00000000-0000-0000-0000-000000000000', 
        user_rec->>'email', crypt('Password@123', gen_salt('bf')), now(), 
        'authenticated', 'authenticated', 
        '{"provider":"email","providers":["email"]}', 
        json_build_object('name', user_rec->>'name'), 
        now(), now(), '', '', '', ''
      );
    END IF;

    -- Lưu/Cập nhật thông tin vào bảng app_users
    IF new_user_id IS NOT NULL THEN
      INSERT INTO public.app_users (auth_user_id, name, role)
      VALUES (new_user_id, user_rec->>'name', 'DEPT_HEAD')
      ON CONFLICT (auth_user_id) DO UPDATE 
      SET role = 'DEPT_HEAD';
    END IF;

  END LOOP;
END $$;
