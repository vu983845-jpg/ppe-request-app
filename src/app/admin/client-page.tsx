'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as xlsx from 'xlsx'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/lib/i18n/context'

export function AdminDashboardClient({
    budget,
    requests,
    ppeStats
}: {
    budget: any
    requests: any[]
    ppeStats: any[]
}) {
    const { t } = useLanguage()

    const currentMonthRequests = requests.filter(r => {
        const d = new Date(r.created_at)
        const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })

    const currentMonthCost = currentMonthRequests
        .filter(r => r.status === 'APPROVED_ISSUED')
        .reduce((acc, r) => acc + (r.quantity * (r.ppe_master?.unit_price || 0)), 0)

    const usedBudget = Number(budget?.used_budget || 0)
    const totalBudget = Number(budget?.total_budget || 1)
    const budgetPct = ((usedBudget / totalBudget) * 100).toFixed(1)
    const lowStockItems = ppeStats.filter(p => p.stock_quantity <= p.minimum_stock)

    function handleExport() {
        const exportData = requests.map(r => ({
            'Date': new Date(r.created_at).toLocaleDateString(),
            'Requester': r.requester_name,
            'Department': r.departments?.name,
            'Item': r.ppe_master?.name,
            'Qty': r.quantity,
            'Unit Price': r.ppe_master?.unit_price,
            'Total Cost': r.quantity * (r.ppe_master?.unit_price || 0),
            'Status': r.status,
            'Dept Approver': r.dept_approver?.name || '',
            'HSE Approver': r.hse_approver?.name || '',
            'PM Approver': r.pm_approver?.name || '',
            'HR Approver': r.hr_approver?.name || '',
        }))

        const ws = xlsx.utils.json_to_sheet(exportData)
        const wb = xlsx.utils.book_new()
        xlsx.utils.book_append_sheet(wb, ws, 'Requests')
        xlsx.writeFile(wb, `ppe_requests_export_${new Date().getTime()}.xlsx`)
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">{t.admin.metrics.thisMonthRequests}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currentMonthRequests.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">{t.admin.metrics.thisMonthCost}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">\${currentMonthCost.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">{t.admin.metrics.budgetUsed}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{budgetPct}%</div>
                        <p className="text-xs text-zinc-500 mt-1">\${usedBudget} / \${totalBudget}</p>
                    </CardContent>
                </Card>
                <Card className={lowStockItems.length > 0 ? "border-red-500 bg-red-50/50 dark:bg-red-950/20" : ""}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-500">{t.admin.metrics.lowStockAlerts}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{lowStockItems.length} items</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleExport}>
                    {t.admin.exportBtn}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t.admin.metrics.lowStockItems}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {lowStockItems.length === 0 ? (
                            <p className="text-sm text-zinc-500">{t.admin.metrics.allStocked}</p>
                        ) : (
                            <div className="space-y-4">
                                {lowStockItems.map(item => (
                                    <div key={item.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-xs text-zinc-500">{t.admin.metrics.min}: {item.minimum_stock}</p>
                                        </div>
                                        <Badge variant="destructive">
                                            {t.admin.metrics.stock}: {item.stock_quantity}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
