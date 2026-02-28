import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HseRequestsTable, InventoryTable, AnalyticsTable, BudgetCostsTable } from './client-page'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getLocale } from '@/app/actions/locale'
import { dictionaries } from '@/lib/i18n/dictionaries'

export default async function HseDashboard() {
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

    if (appUser?.role !== 'HSE') {
        return <div className="p-8">Unauthorized. Only HSE can access this page.</div>
    }

    // Fetch All requests + history
    const { data: requests } = await supabase
        .from('ppe_requests')
        .select(`
            *, 
            ppe_master(*), 
            departments(*),
            dept_approver:app_users!fk_dept_approver(name),
            hse_approver:app_users!fk_hse_approver(name),
            pm_approver:app_users!fk_pm_approver(name),
            hr_approver:app_users!fk_hr_approver(name)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

    // Fetch PPE Inventory
    const { data: inventory } = await supabase
        .from('ppe_master')
        .select('*')
        .order('name')

    // Fetch Purchase History
    const { data: purchases, error: purError } = await supabase
        .from('ppe_purchases')
        .select('*, ppe_master(name, unit)')
        .order('purchased_at', { ascending: false })
        .limit(100)

    // Fetch Budgets
    const currentYear = new Date().getFullYear()
    const { data: factoryBudget } = await supabase.from('yearly_budget').select('*').eq('year', currentYear).single()
    const { data: deptBudgets } = await supabase.from('department_budgets').select('*, departments(name)').eq('year', currentYear)


    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t.hse.title}</h1>
                        <p className="text-sm sm:text-base text-zinc-500">
                            {t.hse.subtitle}
                        </p>
                    </div>
                    <form action={logoutAction} className="w-full sm:w-auto">
                        <Button variant="outline" type="submit" className="w-full sm:w-auto">{t.common.signOut}</Button>
                    </form>
                </div>

                <Tabs defaultValue="approvals" className="w-full">
                    <div className="w-full overflow-x-auto pb-2 mb-6">
                        <TabsList className="inline-flex min-w-max sm:grid sm:w-full sm:grid-cols-4 h-auto p-1">
                            <TabsTrigger value="approvals" className="whitespace-nowrap px-4 py-2">{t.hse.tabs?.approvals || "Phê Duyệt"}</TabsTrigger>
                            <TabsTrigger value="inventory" className="whitespace-nowrap px-4 py-2">{t.hse.tabs?.inventory || "Kho Chứa"}</TabsTrigger>
                            <TabsTrigger value="analytics" className="whitespace-nowrap px-4 py-2">{t.hse.tabs?.analytics || "Phân Tích & Lịch Sử"}</TabsTrigger>
                            <TabsTrigger value="budgets" className="whitespace-nowrap px-4 py-2">{t.hse.tabs?.budgets || "Ngân sách & Chi phí"}</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="approvals">
                        <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">{t.hse.pendingTitle}</h2>
                            <HseRequestsTable requests={requests || []} />
                        </div>
                    </TabsContent>

                    <TabsContent value="inventory">
                        <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">{t.hse.inventoryTitle}</h2>
                            {purError && <div className="text-red-500 mb-4">Error loading purchases: {purError.message}</div>}
                            <InventoryTable inventory={inventory || []} purchases={purchases || []} />
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics">
                        <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">{t.hse.historyTitle}</h2>
                            <AnalyticsTable triggerRefetch={(inventory || []).reduce((acc: number, curr: any) => acc + curr.stock_quantity, 0)} />
                        </div>
                    </TabsContent>

                    <TabsContent value="budgets">
                        <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Quản Lý Ngân Sách (Năm {currentYear})</h2>
                            <BudgetCostsTable factory={factoryBudget} departments={deptBudgets || []} />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
