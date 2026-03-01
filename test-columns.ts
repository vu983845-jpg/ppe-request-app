import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function testQuery() {
    const { data, error } = await supabase.from('ppe_requests').select('*').limit(1)

    if (error) {
        console.error("Error fetching request:", error)
    } else if (data && data.length > 0) {
        console.log("Columns found in ppe_requests:")
        console.log(Object.keys(data[0]))
    } else {
        console.log("No data found, can't infer schema directly via select *")
    }
}

testQuery()
