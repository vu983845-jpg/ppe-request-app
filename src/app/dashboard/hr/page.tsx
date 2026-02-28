import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RequestsTable } from './client-page'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { getLocale } from '@/app/actions/locale'
import { dictionaries } from '@/lib/i18n/dictionaries'

export default async function HRDashboard() {
    const locale = await getLocale()
    const t = dictionaries[locale] // Type issues with nested union if not careful, fallback to basic translation later.
    const _t = t as any
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

    if (appUser?.role !== 'HR') {
        return <div className="p-8">Unauthorized. Only HR can access this page.</div>
    }

    // Fetch Requests for HR Review (Lost/Broken flow after Plant Manager)
    const { data: requests, error: reqError } = await supabase
        .from('ppe_requests')
        .select(`
            *, 
            ppe_master(name, unit, unit_price), 
            departments(name),
            dept_approver:app_users!dept_approved_by(name),
            hse_approver:app_users!hse_approved_by(name),
            pm_approver:app_users!plant_manager_approved_by(name),
            hr_approver:app_users!hr_approved_by(name)
        `)
        .eq('status', 'PENDING_HR')
        .order('created_at', { ascending: false })

    if (reqError) {
        console.error("HR fetch error:", reqError)
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{_t.hr.title}</h1>
                        <p className="text-sm sm:text-base text-zinc-500">
                            {_t.hr.subtitle}
                        </p>
                    </div>
                    <form action={logoutAction} className="w-full sm:w-auto">
                        <Button variant="outline" type="submit" className="w-full sm:w-auto">{_t.common.signOut}</Button>
                    </form>
                </div>

                <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">{_t.hr.pendingTitle}</h2>
                    {reqError && (
                        <div className="p-4 mb-4 text-red-800 bg-red-100 rounded-lg">
                            Fetch Error: {reqError.message}
                        </div>
                    )}
                    <RequestsTable requests={requests || []} />
                </div>
            </div>
        </div>
    )
}
