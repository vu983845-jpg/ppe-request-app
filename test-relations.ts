import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testQuery() {
    const { data, error } = await supabase
        .from('ppe_requests')
        .select(`
      id,
      dept_approver:app_users!dept_approved_by(name),
      hse_approver:app_users!hse_approved_by(name)
    `)
        .limit(1)

    console.log("Error:", error)
    console.log("Data:", JSON.stringify(data, null, 2))
}

testQuery()
