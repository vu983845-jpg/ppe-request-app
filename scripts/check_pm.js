const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('email', 'thien.nguyen@viccla.com');

    console.log("Check app_users by email:", data, error);

    const { data: authUsers, error: authErr } = await supabase.auth.admin.listUsers();
    if (authErr && !authUsers) {
        console.log("Auth admin list failed (expected if using Anon Key)");
    } else {
        const pm = authUsers.users.find(u => u.email === 'thien.nguyen@viccla.com');
        console.log("Found in auth.users:", pm?.id, pm?.email);

        if (pm) {
            const { data: match } = await supabase.from('app_users').select('*').eq('auth_user_id', pm.id);
            console.log("Matching app_users by auth_user_id:", match);
        }
    }
}

checkUser();
