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

    const { data: appUser, error: auError } = await supabase
        .from('app_users')
        .select('role')
        .eq('auth_user_id', user.id)
        .single()

    if (auError) {
        return <div className="p-8 text-red-500">Error fetching user role: {auError.message}</div>
    }

    if (appUser?.role === 'ADMIN') {
        redirect('/admin')
    } else if (appUser?.role === 'HSE') {
        redirect('/dashboard/hse')
    } else if (appUser?.role === 'DEPT_HEAD') {
        redirect('/dashboard/dept-head')
    } else if (appUser?.role === 'PLANT_MANAGER') {
        redirect('/dashboard/plant-manager')
    } else if (appUser?.role === 'HR') {
        redirect('/dashboard/hr')
    } else {
        // If they don't have a role, send them to home
        return <div className="p-8 text-red-500 text-xl font-bold">Error: Role unrecognized in system. Found: "{appUser?.role}"</div>
    }
}
