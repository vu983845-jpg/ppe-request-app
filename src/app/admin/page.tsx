import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminDashboardClient } from './client-page'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { getLocale } from '@/app/actions/locale'
import { dictionaries } from '@/lib/i18n/dictionaries'

export default async function AdminDashboard() {
    const locale = await getLocale()
    const t = dictionaries[locale]
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

    if (appUser?.role !== 'ADMIN') {
        return <div className="p-8">Unauthorized. Only Admins can access this page.</div>
    }

    const currentYear = new Date().getFullYear()

    // Fetch Budget
    const { data: budget } = await supabase
        .from('yearly_budget')
        .select('*')
        .eq('year', currentYear)
        .single()

    // Fetch all requests
    const { data: requests } = await supabase
        .from('ppe_requests')
        .select(`
            *, 
            ppe_master(*), 
            departments(*),
            dept_approver:app_users!dept_approved_by(name),
            hse_approver:app_users!hse_approved_by(name),
            pm_approver:app_users!plant_manager_approved_by(name),
            hr_approver:app_users!hr_approved_by(name)
        `)
        .order('created_at', { ascending: false })

    // Fetch PPE stock
    const { data: ppeStats } = await supabase
        .from('ppe_master')
        .select('*')
        .order('name')

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t.admin.title}</h1>
                        <p className="text-sm sm:text-base text-zinc-500">
                            {t.admin.subtitle}
                        </p>
                    </div>
                    <form action={logoutAction} className="w-full sm:w-auto">
                        <Button variant="outline" type="submit" className="w-full sm:w-auto">{t.common.signOut}</Button>
                    </form>
                </div>

                <AdminDashboardClient
                    budget={budget}
                    requests={requests || []}
                    ppeStats={ppeStats || []}
                />
            </div>
        </div>
    )
}
