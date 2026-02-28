import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testQuery() {
    const { data, error } = await supabase.rpc('get_foreign_keys');
    console.log("Error:", error)
    console.log("Data:", data)
}

testQuery()
