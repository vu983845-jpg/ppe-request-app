-- Rename foreign keys explicitly so PostgREST can use them as relation aliases

DO $$
DECLARE
    rec_dept RECORD;
    rec_hse RECORD;
    rec_pm RECORD;
    rec_hr RECORD;
BEGIN
    -- Find and drop the system-generated foreign keys for dept_approved_by
    SELECT constraint_name INTO rec_dept
    FROM information_schema.key_column_usage
    WHERE table_name = 'ppe_requests' AND column_name = 'dept_approved_by';

    IF rec_dept.constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.ppe_requests DROP CONSTRAINT ' || rec_dept.constraint_name;
    END IF;

    -- Find and drop for hse_approved_by
    SELECT constraint_name INTO rec_hse
    FROM information_schema.key_column_usage
    WHERE table_name = 'ppe_requests' AND column_name = 'hse_approved_by';

    IF rec_hse.constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.ppe_requests DROP CONSTRAINT ' || rec_hse.constraint_name;
    END IF;

    -- Find and drop for plant_manager_approved_by
    SELECT constraint_name INTO rec_pm
    FROM information_schema.key_column_usage
    WHERE table_name = 'ppe_requests' AND column_name = 'plant_manager_approved_by';

    IF rec_pm.constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.ppe_requests DROP CONSTRAINT ' || rec_pm.constraint_name;
    END IF;

    -- Find and drop for hr_approved_by
    SELECT constraint_name INTO rec_hr
    FROM information_schema.key_column_usage
    WHERE table_name = 'ppe_requests' AND column_name = 'hr_approved_by';

    IF rec_hr.constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.ppe_requests DROP CONSTRAINT ' || rec_hr.constraint_name;
    END IF;

END $$;

-- Recreate constraints with explicit names
ALTER TABLE public.ppe_requests
  ADD CONSTRAINT fk_dept_approver FOREIGN KEY (dept_approved_by) REFERENCES public.app_users(id),
  ADD CONSTRAINT fk_hse_approver FOREIGN KEY (hse_approved_by) REFERENCES public.app_users(id),
  ADD CONSTRAINT fk_pm_approver FOREIGN KEY (plant_manager_approved_by) REFERENCES public.app_users(id),
  ADD CONSTRAINT fk_hr_approver FOREIGN KEY (hr_approved_by) REFERENCES public.app_users(id);

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
