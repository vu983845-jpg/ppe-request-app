-- Insert Initial Departments (Without dept_head mapping at first)
INSERT INTO public.departments (name, dept_head_email) VALUES
('Boiler', 'boiler_head@example.com'),
('Borma', 'borma_head@example.com'),
('Shelling', 'shelling_head@example.com'),
('Office', 'office_head@example.com'),
('HSE', 'hse_head@example.com'),
('Technical', 'technical_head@example.com'),
('Machine Grading', 'ml_grading_head@example.com'),
('Machine Peeling', 'ml_peeling_head@example.com'),
('Maint', 'maint_head@example.com'),
('Manual Grading + Manual Peeling', 'manual_head@example.com'),
('Packing', 'packing_head@example.com'),
('Warehouse', 'warehouse_head@example.com'),
('Steaming', 'steaming_head@example.com');

-- Insert Initial Master Data for PPE
INSERT INTO public.ppe_master (name, category, unit, unit_price, stock_quantity, minimum_stock, active) VALUES
('Safety Goggles', 'Eye Protection', 'Pair', 15.50, 100, 20, true),
('Earplugs', 'Hearing Protection', 'Box', 25.00, 50, 10, true),
('Nitrile Gloves', 'Hand Protection', 'Box', 12.00, 200, 50, true),
('High-Vis Vest', 'Body Protection', 'Piece', 20.00, 40, 15, true),
('Steel Toe Boots', 'Foot Protection', 'Pair', 85.00, 30, 5, true),
('Hairnet', 'Hygiene', 'Pack (100)', 5.00, 300, 50, true),
('Face Mask', 'Respiratory', 'Box (50)', 10.00, 150, 30, true);

-- Insert Current Year Budget
INSERT INTO public.yearly_budget (year, total_budget, used_budget) VALUES
(EXTRACT(YEAR FROM CURRENT_DATE), 50000.00, 0.00);

-- NOTE: app_users will need to be populated after users sign up via Supabase Auth
-- Example mapping update query (to be run manually after auth creation):
-- UPDATE public.departments SET dept_head_user_id = '<uuid_from_app_users>' WHERE name = 'Production';
