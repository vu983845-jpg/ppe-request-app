import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RequestsTable } from './client-page'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { getLocale } from '@/app/actions/locale'
import { dictionaries } from '@/lib/i18n/dictionaries'

export default async function DeptHeadDashboard() {
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
        .select('role, department_id, departments(name)')
        .eq('auth_user_id', user.id)
        .single()

    if (appUser?.role !== 'DEPT_HEAD') {
        return <div className="p-8">Unauthorized. Only Department Heads can access this page.</div>
    }

    // Fetch Requests
    const { data: requests, error: reqError } = await supabase
        .from('ppe_requests')
        .select('*, ppe_master(name, unit)')
        .eq('requester_department_id', appUser.department_id)
        .order('created_at', { ascending: false })

    if (reqError) {
        console.error("Dept Head fetch error:", reqError)
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t.deptHead.title}</h1>
                        <p className="text-zinc-500">
                            {t.deptHead.subtitle} - {(appUser.departments as any)?.name}
                        </p>
                    </div>
                    <form action={logoutAction}>
                        <Button variant="outline" type="submit">{t.common.signOut}</Button>
                    </form>
                </div>

                <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">{t.deptHead.pendingTitle}</h2>
                    {reqError && (
                        <div className="p-4 mb-4 text-red-800 bg-red-100 rounded-lg">
                            Fetch Error: {reqError.message}
                            <pre className="text-xs">{JSON.stringify(reqError, null, 2)}</pre>
                        </div>
                    )}
                    <RequestsTable requests={requests || []} />
                </div>
            </div>
        </div>
    )
}
