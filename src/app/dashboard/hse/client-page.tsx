'use client'

import { useState, useEffect } from 'react'
import { approveRequestByHSE, rejectRequestByHSE, addPpeStock, getInventoryAnalytics } from '@/app/actions/hse'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/lib/i18n/context'
import { useRouter } from 'next/navigation'
import * as xlsx from 'xlsx'

export function HseRequestsTable({ requests }: { requests: any[] }) {
    const { t } = useLanguage()
    const router = useRouter()
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [rejectDialog, setRejectDialog] = useState<{ open: boolean; requestId: string | null }>({
        open: false,
        requestId: null,
    })
    const [rejectNote, setRejectNote] = useState('')

    async function onApprove(id: string) {
        setLoadingId(id)
        try {
            const res = await approveRequestByHSE(id)
            if (res?.error) {
                toast.error(res.error)
            } else {
                toast.success(t.common.save)
                router.refresh()
            }
        } catch (err: any) {
            toast.error(err.message || 'Unknown error occurred')
        } finally {
            setLoadingId(null)
        }
    }

    async function onReject() {
        if (!rejectDialog.requestId) return
        setLoadingId(rejectDialog.requestId)
        try {
            const res = await rejectRequestByHSE(rejectDialog.requestId, rejectNote)
            if (res?.error) {
                toast.error(res.error)
            } else {
                toast.success(t.common.save)
                setRejectDialog({ open: false, requestId: null })
                setRejectNote('')
                router.refresh()
            }
        } catch (err: any) {
            toast.error(err.message || 'Unknown error occurred')
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t.hse.table.deptDate}</TableHead>
                            <TableHead>{t.hse.table.requester}</TableHead>
                            <TableHead>{t.hse.table.item}</TableHead>
                            <TableHead>{t.hse.table.qty}</TableHead>
                            <TableHead>{t.hse.table.stockWarning}</TableHead>
                            <TableHead>{t.hse.table.status}</TableHead>
                            <TableHead className="text-right">{t.hse.table.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((req) => {
                            const stock = req.ppe_master?.stock_quantity || 0
                            const minStock = req.ppe_master?.minimum_stock || 0
                            const isInsufficient = stock < req.quantity
                            const isLow = stock <= minStock

                            return (
                                <TableRow key={req.id}>
                                    <TableCell>
                                        <div className="font-medium">{req.departments?.name}</div>
                                        <div className="text-xs text-zinc-500">{new Date(req.created_at).toLocaleDateString()}</div>
                                    </TableCell>
                                    <TableCell>
                                        {req.requester_name}
                                        {req.note && <div className="text-xs text-zinc-500 truncate max-w-[150px]" title={req.note}>{req.note}</div>}
                                    </TableCell>
                                    <TableCell>
                                        {req.ppe_master?.name}
                                        <div className="text-xs text-zinc-500">{req.ppe_master?.unit}</div>
                                    </TableCell>
                                    <TableCell>{req.quantity}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 items-start">
                                            <Badge variant={isInsufficient ? "destructive" : isLow ? "secondary" : "outline"}>
                                                {t.hse.table.stock}: {stock}
                                            </Badge>
                                            {isInsufficient && <span className="text-xs text-red-500 font-medium">{t.hse.table.insufficient}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={req.status === 'PENDING_HSE' ? 'default' : 'outline'}>
                                            {req.status === 'PENDING_DEPT' ? 'Chờ BP duyệt' :
                                                req.status === 'PENDING_HSE' ? 'Chờ HSE duyệt' :
                                                    req.status === 'APPROVED_ISSUED' ? 'Đã cấp phát' :
                                                        req.status === 'REJECTED_BY_DEPT' ? 'BP từ chối' :
                                                            req.status === 'REJECTED_BY_HSE' ? 'HSE từ chối' : req.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {(req.status === 'PENDING_HSE' || req.status === 'PENDING_DEPT') && (
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    disabled={loadingId === req.id}
                                                    onClick={() => setRejectDialog({ open: true, requestId: req.id })}
                                                >
                                                    {t.common.reject}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    disabled={loadingId === req.id || isInsufficient}
                                                    onClick={() => onApprove(req.id)}
                                                >
                                                    {t.hse.issueBtn}
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {requests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-6 text-zinc-500">
                                    {t.hse.noRequests}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={rejectDialog.open} onOpenChange={(open) => !open && setRejectDialog({ open: false, requestId: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.hse.rejectDialogTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder={t.deptHead?.rejectDialogPlaceholder || "Provide a reason for rejection (required)..."}
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialog({ open: false, requestId: null })}>
                            {t.common.cancel}
                        </Button>
                        <Button variant="destructive" onClick={onReject} disabled={!rejectNote.trim() || !!loadingId}>
                            {t.deptHead?.rejectConfirmBtn || "Confirm Reject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export function InventoryTable({ inventory }: { inventory: any[] }) {
    const { t } = useLanguage()
    const router = useRouter()

    // Add Stock States
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
    const [selectedPpeId, setSelectedPpeId] = useState<string | null>(null)
    const [addQty, setAddQty] = useState<number>(0)
    const [addPrice, setAddPrice] = useState<number>(0)
    const [addNote, setAddNote] = useState('')
    const [isAdding, setIsAdding] = useState(false)

    function openAddMenu(ppe: any) {
        setSelectedPpeId(ppe.id)
        setAddPrice(ppe.unit_price) // Default to current price
        setAddQty(0)
        setAddNote('')
        setIsAddMenuOpen(true)
    }

    async function handleAddStock() {
        if (!selectedPpeId || addQty <= 0 || addPrice < 0) return

        setIsAdding(true)
        try {
            const res = await addPpeStock(selectedPpeId, addQty, addPrice, addNote)
            if (res?.error) {
                toast.error(res.error)
            } else {
                toast.success(t.hse.inventoryTable.addStockSuccess || "Stock added successfully!")
                setIsAddMenuOpen(false)
                router.refresh()
            }
        } catch (err: any) {
            toast.error(err.message || 'Error occurred')
        } finally {
            setIsAdding(false)
        }
    }

    function handleExport() {
        const exportData = inventory.map(item => ({
            [t.hse.inventoryTable.itemName]: item.name,
            [t.hse.inventoryTable.category]: item.category,
            [t.hse.inventoryTable.unit]: item.unit,
            [t.hse.inventoryTable.price]: item.unit_price,
            [t.hse.inventoryTable.minStock]: item.minimum_stock,
            [t.hse.inventoryTable.currStock]: item.stock_quantity,
        }))

        const ws = xlsx.utils.json_to_sheet(exportData)
        const wb = xlsx.utils.book_new()
        xlsx.utils.book_append_sheet(wb, ws, 'Inventory')
        xlsx.writeFile(wb, `inventory_export_${new Date().getTime()}.xlsx`)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg">
                <div className="space-y-1">
                    <h3 className="font-medium text-sm">Add Stock (Nhập Kho)</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        To add stock, click the "+ Add Stock" button next to any item in the table below.
                    </p>
                </div>
                <Button onClick={handleExport} variant="outline" size="sm" className="w-full sm:w-auto">
                    {t.admin?.exportBtn || "Export to Excel"}
                </Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t.hse.inventoryTable.itemName}</TableHead>
                            <TableHead>{t.hse.inventoryTable.category}</TableHead>
                            <TableHead>{t.hse.inventoryTable.unit}</TableHead>
                            <TableHead className="text-right">{t.hse.inventoryTable.price}</TableHead>
                            <TableHead className="text-right">{t.hse.inventoryTable.minStock}</TableHead>
                            <TableHead className="text-right">{t.hse.inventoryTable.currStock}</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inventory.map((item) => {
                            const isLow = item.stock_quantity <= item.minimum_stock
                            return (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{item.category}</Badge>
                                    </TableCell>
                                    <TableCell className="text-zinc-500">{item.unit}</TableCell>
                                    <TableCell className="text-right">${item.unit_price}</TableCell>
                                    <TableCell className="text-right text-zinc-500">{item.minimum_stock}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={isLow ? "destructive" : "secondary"}>
                                            {item.stock_quantity}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="secondary" onClick={() => openAddMenu(item)}>
                                            {t.hse.inventoryTable.addStockBtn || "+ Add Stock"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {inventory.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-zinc-500">
                                    {t.hse.inventoryTable.noItems}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.hse.inventoryTable.addStockTitle || "Add Stock"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>{t.hse.inventoryTable.addStockQty || "Quantity to Add"}</Label>
                            <Input
                                type="number"
                                min="1"
                                value={addQty || ''}
                                onChange={(e) => setAddQty(Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t.hse.inventoryTable.addStockPrice || "Unit Price"}</Label>
                            <Input
                                type="number"
                                min="0"
                                value={addPrice || ''}
                                onChange={(e) => setAddPrice(Number(e.target.value))}
                            />
                            {addQty > 0 && addPrice > 0 && (
                                <p className="text-xs text-zinc-500 mt-1">
                                    Total: ${(addQty * addPrice).toLocaleString()}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>{t.hse.inventoryTable.addStockNote || "Note / Supplier"}</Label>
                            <Textarea
                                placeholder="Supplier name or invoice id..."
                                value={addNote}
                                onChange={(e) => setAddNote(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddMenuOpen(false)} disabled={isAdding}>
                            {t.common.cancel}
                        </Button>
                        <Button
                            onClick={handleAddStock}
                            disabled={isAdding || addQty <= 0 || addPrice < 0}
                        >
                            {isAdding ? t.common.loading : (t.hse.inventoryTable.addStockConfirm || "Confirm Purchase")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export function AnalyticsTable() {
    const { t } = useLanguage()

    const [year, setYear] = useState<number>(new Date().getFullYear())
    const [month, setMonth] = useState<string>("all") // "all" string for Entire Year, or "1"-"12"
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function load() {
            setLoading(true)
            const m = month === "all" ? undefined : parseInt(month)
            const res = await getInventoryAnalytics(year, m)
            setData(res || [])
            setLoading(false)
        }
        load()
    }, [year, month])

    function handleExport() {
        const exportData = data.map(item => {
            return {
                [t.hse.historyTable.item]: item.name,
                [t.hse.historyTable.unit]: item.unit,
                [t.hse.historyTable.openBal]: item.openingBalance,
                [t.hse.historyTable.in]: item.in,
                [t.hse.historyTable.out]: item.out,
                [t.hse.historyTable.closeBal]: item.closingBalance,
            }
        })

        const ws = xlsx.utils.json_to_sheet(exportData)
        const wb = xlsx.utils.book_new()
        xlsx.utils.book_append_sheet(wb, ws, 'Analytics')
        xlsx.writeFile(wb, `inventory_analytics_${year}_${month}.xlsx`)
    }

    const availableYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg">
                <div className="flex gap-2 items-center w-full sm:w-auto">
                    <Select value={month} onValueChange={setMonth}>
                        <SelectTrigger className="w-[180px] bg-white dark:bg-zinc-950">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t.hse.historyTable.entireYear || "Entire Year"}</SelectItem>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <SelectItem key={m} value={m.toString()}>Tháng {m}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                        <SelectTrigger className="w-[120px] bg-white dark:bg-zinc-950">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableYears.map(y => (
                                <SelectItem key={y} value={y.toString()}>Năm {y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button onClick={handleExport} variant="outline" size="sm" className="w-full sm:w-auto whitespace-nowrap" disabled={loading}>
                    {t.admin?.exportBtn || "Export to Excel"}
                </Button>
            </div>

            <div className="rounded-md border relative">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50 dark:bg-zinc-900/50">
                            <TableHead className="font-semibold">{t.hse.historyTable.item}</TableHead>
                            <TableHead className="font-semibold">{t.hse.historyTable.unit}</TableHead>
                            <TableHead className="text-right font-semibold">{t.hse.historyTable.openBal}</TableHead>
                            <TableHead className="text-right font-semibold text-blue-600 dark:text-blue-400">{t.hse.historyTable.in}</TableHead>
                            <TableHead className="text-right font-semibold text-orange-600 dark:text-orange-400">{t.hse.historyTable.out}</TableHead>
                            <TableHead className="text-right font-semibold">{t.hse.historyTable.closeBal}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                                    {t.common.loading}
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && data.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">{item.name}</TableCell>
                                <TableCell className="text-zinc-500">{item.unit}</TableCell>
                                <TableCell className="text-right font-medium">{item.openingBalance}</TableCell>
                                <TableCell className="text-right text-blue-600 dark:text-blue-400 font-medium">+{item.in}</TableCell>
                                <TableCell className="text-right text-orange-600 dark:text-orange-400 font-medium">-{item.out}</TableCell>
                                <TableCell className="text-right font-bold text-zinc-900 dark:text-zinc-100">{item.closingBalance}</TableCell>
                            </TableRow>
                        ))}
                        {!loading && data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                                    {t.hse.historyTable.noHistory}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
