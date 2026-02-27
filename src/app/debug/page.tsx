import { createClient } from '@/lib/supabase/server'

export default async function DebugPage() {
    const supabase = await createClient()

    // Retrieve enum values for request_status
    // Supabase JS doesn't have a direct way to query pg_type easily via standard API without RPC, 
    // but we can query it via a raw postgres call if we had one. 
    // Since we only have the standard REST API, we can't query pg_type directly. 
    // Wait, we CAN just try to trigger an error and parse it, OR we can fetch all distinct statuses from ppe_requests!

    // Fetch unique statuses currently in the table
    const { data: requests, error } = await supabase
        .from('ppe_requests')
        .select('status')

    // Deduplicate
    const existingStatuses = Array.from(new Set((requests || []).map(r => r.status)))

    return (
        <div className="p-10 font-mono">
            <h1 className="text-2xl font-bold mb-4">Database Debug Info</h1>

            <h2 className="text-xl mt-6 mb-2">Unique Statuses found in existing requests:</h2>
            {existingStatuses.length > 0 ? (
                <ul className="list-disc pl-5">
                    {existingStatuses.map(s => <li key={s} className="text-blue-600 font-bold">{s}</li>)}
                </ul>
            ) : (
                <p>No requests found to extract statuses from.</p>
            )}

            <div className="mt-8 p-4 bg-red-50 text-red-800 border-l-4 border-red-500">
                <p>If you see an error like "invalid input value for enum request_status", it means the database ONLY accepts specific strings.</p>
                <p className="mt-2">Please take a screenshot of this page so the AI can fix the strings!</p>
            </div>
        </div>
    )
}
