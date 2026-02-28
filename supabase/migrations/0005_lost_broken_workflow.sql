-- 1. Create a new Enum type for Request Type
CREATE TYPE request_type AS ENUM ('NORMAL', 'LOST_BROKEN');

-- 2. Add New Roles to user_role ENUM
-- Note: In Postgres, ALTER TYPE ADD VALUE cannot be executed inside a transaction block
-- if the new value is used in the same transaction. Supabase migrations usually run in transactions. 
-- For safety, we commit before running alters if run manually, but typical Supabase `db push` handles it.
COMMIT;
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'HR';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'PLANT_MANAGER';

-- 3. Add New Statuses to request_status ENUM
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'PENDING_PLANT_MANAGER';
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'PENDING_HR';
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'READY_FOR_PICKUP';
ALTER TYPE request_status ADD VALUE IF NOT EXISTS 'COMPLETED';
BEGIN;

-- 4. Alter ppe_requests table to support the new columns
ALTER TABLE public.ppe_requests 
ADD COLUMN request_type request_type NOT NULL DEFAULT 'NORMAL',
ADD COLUMN incident_description TEXT,
ADD COLUMN incident_date TIMESTAMPTZ,
ADD COLUMN employee_accepts_compensation BOOLEAN DEFAULT false,
ADD COLUMN plant_manager_decision_note TEXT,
ADD COLUMN plant_manager_approved_at TIMESTAMPTZ,
ADD COLUMN plant_manager_approved_by UUID REFERENCES public.app_users(id),
ADD COLUMN hr_decision_note TEXT,
ADD COLUMN hr_approved_at TIMESTAMPTZ,
ADD COLUMN hr_approved_by UUID REFERENCES public.app_users(id),
ADD COLUMN completed_at TIMESTAMPTZ;

-- 5. Update RLS policies to include new Roles
-- Drop old policies on ppe_master to update them
DROP POLICY IF EXISTS "PPE Master managed by ADMIN and HSE" ON public.ppe_master;
CREATE POLICY "PPE Master managed by ADMIN and HSE" ON public.ppe_master FOR ALL 
USING (get_current_user_role()::text IN ('ADMIN', 'HSE'));

-- Drop old policies on ppe_requests to update them
-- Allow everyone to SELECT their own requests or view public requests if tracking by code
DROP POLICY IF EXISTS "Public can view all requests" ON public.ppe_requests;
CREATE POLICY "Public can view all requests" ON public.ppe_requests FOR SELECT USING (true);

-- Plant Manager and HR need to view requests
CREATE POLICY "Plant Manager can view Lost/Broken requests" ON public.ppe_requests FOR SELECT 
USING (get_current_user_role()::text = 'PLANT_MANAGER' AND request_type = 'LOST_BROKEN');

CREATE POLICY "HR can view Lost/Broken requests" ON public.ppe_requests FOR SELECT 
USING (get_current_user_role()::text = 'HR' AND request_type = 'LOST_BROKEN');
