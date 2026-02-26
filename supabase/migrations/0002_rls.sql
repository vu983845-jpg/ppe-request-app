-- Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppe_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppe_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppe_issue_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yearly_budget ENABLE ROW LEVEL SECURITY;

-- Utility Function to get current user ID from our app_users table
CREATE OR REPLACE FUNCTION public.get_current_app_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM public.app_users WHERE auth_user_id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Utility Function to get current user Role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (SELECT role FROM public.app_users WHERE auth_user_id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. departments
-- Read-only for public (so form can fetch departments)
CREATE POLICY "Departments are viewable by everyone" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Departments insert/update/delete by ADMIN" ON public.departments 
USING (get_current_user_role() = 'ADMIN');

-- 2. ppe_master
-- Read-only for public (so form can fetch PPE items)
CREATE POLICY "PPE Master viewable by everyone" ON public.ppe_master FOR SELECT USING (true);
CREATE POLICY "PPE Master managed by ADMIN and HSE" ON public.ppe_master FOR ALL 
USING (get_current_user_role() IN ('ADMIN', 'HSE'));

-- 3. ppe_requests
-- Public can INSERT
CREATE POLICY "Public can create PPE requests" ON public.ppe_requests FOR INSERT WITH CHECK (true);

-- DEPT HEAD can SELECT requests in their department
CREATE POLICY "DEPT HEAD can view own dept requests" ON public.ppe_requests FOR SELECT 
USING (
    get_current_user_role() = 'DEPT_HEAD' AND 
    requester_department_id = (SELECT department_id FROM public.app_users WHERE auth_user_id = auth.uid() LIMIT 1)
);

-- HSE and ADMIN can SELECT all requests
CREATE POLICY "HSE and ADMIN can view all requests" ON public.ppe_requests FOR SELECT 
USING (get_current_user_role() IN ('HSE', 'ADMIN'));

-- DEPT HEAD can UPDATE requests in their department
CREATE POLICY "DEPT HEAD can update own dept requests" ON public.ppe_requests FOR UPDATE 
USING (
    get_current_user_role() = 'DEPT_HEAD' AND 
    requester_department_id = (SELECT department_id FROM public.app_users WHERE auth_user_id = auth.uid() LIMIT 1)
);

-- HSE and ADMIN can UPDATE all requests
CREATE POLICY "HSE and ADMIN can update all requests" ON public.ppe_requests FOR UPDATE 
USING (get_current_user_role() IN ('HSE', 'ADMIN'));

-- 4. ppe_issue_log
-- Viewable by HSE and ADMIN
CREATE POLICY "Issue log viewable by HSE and ADMIN" ON public.ppe_issue_log FOR SELECT 
USING (get_current_user_role() IN ('HSE', 'ADMIN'));

CREATE POLICY "HSE and ADMIN can insert issue log" ON public.ppe_issue_log FOR INSERT 
WITH CHECK (get_current_user_role() IN ('HSE', 'ADMIN'));

-- 5. yearly_budget
CREATE POLICY "Budget viewable by HSE and ADMIN" ON public.yearly_budget FOR SELECT 
USING (get_current_user_role() IN ('HSE', 'ADMIN'));

CREATE POLICY "Budget managed by ADMIN and HSE" ON public.yearly_budget FOR ALL 
USING (get_current_user_role() IN ('ADMIN', 'HSE'));

-- 6. app_users
CREATE POLICY "Users can view all users" ON public.app_users FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users managed by ADMIN" ON public.app_users FOR ALL 
USING (get_current_user_role() = 'ADMIN');
