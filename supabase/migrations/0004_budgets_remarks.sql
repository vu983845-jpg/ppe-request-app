-- 1. Create department_budgets table
CREATE TABLE public.department_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    year INT NOT NULL,
    total_budget NUMERIC NOT NULL DEFAULT 0,
    used_budget NUMERIC NOT NULL DEFAULT 0,
    UNIQUE(department_id, year)
);

ALTER TABLE public.department_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Budget viewable by DEPT_HEAD, HSE and ADMIN" ON public.department_budgets FOR SELECT 
USING (
    get_current_user_role() IN ('HSE', 'ADMIN') OR
    (get_current_user_role() = 'DEPT_HEAD' AND department_id = (SELECT department_id FROM public.app_users WHERE auth_user_id = auth.uid() LIMIT 1))
);

CREATE POLICY "Budget managed by ADMIN and HSE" ON public.department_budgets FOR ALL 
USING (get_current_user_role() IN ('ADMIN', 'HSE'));
