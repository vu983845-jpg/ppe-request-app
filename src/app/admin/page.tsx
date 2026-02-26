import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminDashboardClient } from './client-page'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export default async function AdminDashboard() {
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
        .select('*, ppe_master(*), departments(*)')
        .order('created_at', { ascending: false })

    // Fetch PPE stock
    const { data: ppeStats } = await supabase
        .from('ppe_master')
        .select('*')
        .order('name')

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">System Admin Dashboard</h1>
                        <p className="text-zinc-500">
                            Overview of costs, requests, and budget.
                        </p>
                    </div>
                    <form action={logoutAction}>
                        <Button variant="outline" type="submit">Sign Out</Button>
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
