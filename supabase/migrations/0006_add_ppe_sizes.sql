ALTER TABLE public.ppe_master ADD COLUMN IF NOT EXISTS size TEXT;

-- Seed Shoes
INSERT INTO public.ppe_master (name, category, unit, unit_price, stock_quantity, size)
SELECT name, category, unit, unit_price, 100, size
FROM (
  VALUES 
    ('Giày bảo hộ đen', 'Safety', 'Pair', 150000),
    ('Giày bảo hộ trắng', 'Safety', 'Pair', 150000)
) AS items(name, category, unit, unit_price)
CROSS JOIN (
  VALUES ('37'), ('38'), ('39'), ('40'), ('41'), ('42'), ('43'), ('44')
) AS sizes(size);

-- Seed Uniforms
INSERT INTO public.ppe_master (name, category, unit, unit_price, stock_quantity, size)
SELECT name, category, unit, unit_price, 100, size
FROM (
  VALUES 
    ('Uniform LCA', 'Uniform', 'Set', 200000),
    ('Uniform bảo trì', 'Uniform', 'Set', 200000),
    ('Uniform Office', 'Uniform', 'Set', 200000),
    ('Uniform HCA', 'Uniform', 'Set', 200000)
) AS items(name, category, unit, unit_price)
CROSS JOIN (
  VALUES ('M'), ('L'), ('XL'), ('2XL'), ('3XL')
) AS sizes(size);

NOTIFY pgrst, 'reload schema';
