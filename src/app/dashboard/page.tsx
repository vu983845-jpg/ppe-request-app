import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardIndex() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: appUser } = await supabase
        .from('app_users')
        .select('role')
        .eq('auth_user_id', user.id)
        .single()

    if (appUser?.role === 'ADMIN') {
        redirect('/admin')
    } else if (appUser?.role === 'HSE') {
        redirect('/dashboard/hse')
    } else if (appUser?.role === 'DEPT_HEAD') {
        redirect('/dashboard/dept-head')
    } else {
        // If they don't have a role, send them to home
        redirect('/')
    }
}
