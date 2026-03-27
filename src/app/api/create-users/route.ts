import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: 'Missing Supabase credentials in Next.js backend' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const usersToCreate = [
        { email: 'admin@example.com', password: 'password123', name: 'System Admin', role: 'ADMIN' },
        { email: 'plant_manager@example.com', password: 'password123', name: 'Plant Manager', role: 'PLANT_MANAGER' },
    ];

    const results = [];

    for (const u of usersToCreate) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: u.email,
            password: u.password,
        });

        if (authError) {
            results.push(`Error signing up ${u.email}: ${authError.message}`);
            continue;
        }

        const userId = authData.user?.id;
        if (!userId) {
            results.push(`Could not get user ID for ${u.email}`);
            continue;
        }

        const { error: dbError } = await supabase
            .from('app_users')
            .upsert({
                id: userId,
                email: u.email,
                name: u.name,
                role: u.role,
            });

        if (dbError) {
            results.push(`Error inserting ${u.email} into app_users: ${dbError.message}`);
        } else {
            results.push(`Successfully created ${u.name} (${u.role})`);
        }
    }

    return NextResponse.json({ results });
}
