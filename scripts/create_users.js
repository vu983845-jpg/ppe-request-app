const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in process.env", process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUsers() {
    const usersToCreate = [
        { email: 'admin@example.com', password: 'password123', name: 'System Admin', role: 'ADMIN' },
        { email: 'plant_manager@example.com', password: 'password123', name: 'Plant Manager', role: 'PLANT_MANAGER' },
    ];

    for (const u of usersToCreate) {
        console.log(`Signing up ${u.email}...`);
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: u.email,
            password: u.password,
        });

        if (authError) {
            console.error(`Error signing up ${u.email}:`, authError.message);
            continue;
        }

        const userId = authData.user?.id;
        if (!userId) {
            console.error(`Could not get user ID for ${u.email}`);
            continue;
        }

        console.log(`User created in Auth with ID: ${userId}. Inserting into app_users...`);

        const { error: dbError } = await supabase
            .from('app_users')
            .upsert({
                id: userId,
                email: u.email,
                name: u.name,
                role: u.role,
                department_id: null
            });

        if (dbError) {
            console.error(`Error inserting ${u.email} into app_users:`, dbError.message);
        } else {
            console.log(`Successfully created ${u.name} (${u.role})`);
        }
    }
}

createUsers();
