import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: {
                // Setting maxAge to undefined turns this into a session-only cookie
                // which will expire when the browser window closes.
                maxAge: undefined
            }
        }
    )
}
