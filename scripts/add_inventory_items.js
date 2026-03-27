const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const newItems = [
    {
        name_vn: 'Áo phản quang',
        name_en: 'Reflective Vest',
        unit: 'Cái',
        size: 'F',
        life_span_months: 12,
        unit_price: 50000,
        stock_quantity: 100
    },
    {
        name_vn: 'Yếm da',
        name_en: 'Leather Apron',
        unit: 'Cái',
        size: 'F',
        life_span_months: 24,
        unit_price: 150000,
        stock_quantity: 50
    },
    {
        name_vn: 'Kính đen',
        name_en: 'Dark Safety Glasses',
        unit: 'Cái',
        size: 'F',
        life_span_months: 6,
        unit_price: 30000,
        stock_quantity: 200
    },
    {
        name_vn: 'Kính trắng',
        name_en: 'Clear Safety Glasses',
        unit: 'Cái',
        size: 'F',
        life_span_months: 6,
        unit_price: 30000,
        stock_quantity: 200
    },
    {
        name_vn: 'Găng tay chống cắt',
        name_en: 'Cut-Resistant Gloves',
        unit: 'Đôi',
        size: 'M',
        life_span_months: 3,
        unit_price: 45000,
        stock_quantity: 300
    }
];

async function addItems() {
    const { data, error } = await supabase
        .from('ppe_master')
        .insert(newItems)
        .select();

    if (error) {
        console.error("Error inserting items:", error);
    } else {
        console.log("Successfully added 5 items to inventory:", data);
    }
}

addItems();
