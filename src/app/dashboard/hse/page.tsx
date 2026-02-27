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
        .select('*, ppe_master(*), departments(*)')
        .order('created_at', { ascending: false })
        .limit(100)

    // Fetch PPE Inventory
    const { data: inventory } = await supabase
        .from('ppe_master')
        .select('*')
        .order('name')

    // Fetch Purchase History
    const { data: purchases } = await supabase
        .from('ppe_purchases')
        .select('*, ppe_master(name, unit), app_users(name)')
        .order('purchased_at', { ascending: false })
        .limit(100)

    // Fetch Budgets
    const currentYear = new Date().getFullYear()
    const { data: factoryBudget } = await supabase.from('yearly_budget').select('*').eq('year', currentYear).single()
    const { data: deptBudgets } = await supabase.from('department_budgets').select('*, departments(name)').eq('year', currentYear)


    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t.hse.title}</h1>
                        <p className="text-zinc-500">
                            {t.hse.subtitle}
                        </p>
                    </div>
                    <form action={logoutAction}>
                        <Button variant="outline" type="submit">{t.common.signOut}</Button>
                    </form>
                </div>

                <Tabs defaultValue="approvals" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-8">
                        <TabsTrigger value="approvals">{t.hse.tabs?.approvals || "Phê Duyệt"}</TabsTrigger>
                        <TabsTrigger value="inventory">{t.hse.tabs?.inventory || "Kho Chứa"}</TabsTrigger>
                        <TabsTrigger value="analytics">{t.hse.tabs?.analytics || "Phân Tích & Lịch Sử"}</TabsTrigger>
                        <TabsTrigger value="budgets">{t.hse.tabs?.budgets || "Ngân sách & Chi phí"}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="approvals">
                        <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">{t.hse.pendingTitle}</h2>
                            <HseRequestsTable requests={requests || []} />
                        </div>
                    </TabsContent>

                    <TabsContent value="inventory">
                        <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">{t.hse.inventoryTitle}</h2>
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
