import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: 'Missing env vars' })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Find requests that are APPROVED_ISSUED but don't exist in ppe_issue_log
    const { data: requests, error: reqErr } = await supabase
        .from('ppe_requests')
        .select('*, ppe_master(*)')
        .eq('status', 'APPROVED_ISSUED')

    if (reqErr) return NextResponse.json({ error: reqErr })

    const { data: logs, error: logErr } = await supabase
        .from('ppe_issue_log')
        .select('request_id')

    if (logErr) return NextResponse.json({ error: logErr })

    const loggedRequestIds = new Set(logs.map((l: any) => l.request_id))

    const missingLogs = requests.filter((r: any) => !loggedRequestIds.has(r.id))

    const inserts = missingLogs.map((req: any) => ({
        request_id: req.id,
        ppe_id: req.ppe_id,
        issued_quantity: Number(req.quantity),
        unit_price_at_issue: Number(req.ppe_master.unit_price),
        total_cost: Number(req.quantity) * Number(req.ppe_master.unit_price),
        issued_by: req.hse_approved_by || req.dept_approved_by || '00000000-0000-0000-0000-000000000000',
        issued_at: req.hse_approved_at || req.created_at
    }))

    if (inserts.length > 0) {
        const { error: insErr } = await supabase.from('ppe_issue_log').insert(inserts)
        if (insErr) {
            return NextResponse.json({ error: insErr, inserts })
        }
    }

    return NextResponse.json({ success: true, fixedCount: inserts.length, inserts })
}
