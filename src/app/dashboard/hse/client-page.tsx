'use client'

import React, { useState, useEffect, Fragment } from 'react'
import { approveRequestByHSE, rejectRequestByHSE, addPpeStock, getInventoryAnalytics, getYearlyChartData, deletePpeRequest, updatePpeMasterInfo } from '@/app/actions/hse'
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChevronDown, ChevronRight, User, Hash, Building2, Calendar, Trash2, Pencil } from 'lucide-react'

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

    async function onDelete(id: string) {
        if (!window.confirm("Are you sure you want to delete this request? This action cannot be undone.")) return
        setLoadingId(id)
        try {
            const res = await deletePpeRequest(id)
            if (res?.error) {
                toast.error(res.error)
            } else {
                toast.success(t.hse.deleteRequestSuccess || "Request deleted successfully.")
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
            <div className="rounded-md border bg-white dark:bg-zinc-950">
                <Table className="whitespace-nowrap">
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
                                        <div className="flex flex-col gap-1 items-start">
                                            <Badge variant={req.status === 'PENDING_HSE' || req.status === 'PENDING_DEPT' ? 'default' : 'outline'}>
                                                {req.status === 'PENDING_DEPT' ? 'Chờ BP duyệt' :
                                                    req.status === 'PENDING_HSE' ? 'Chờ HSE duyệt' :
                                                        req.status === 'PENDING_PLANT_MANAGER' ? 'Chờ GĐ duyệt' :
                                                            req.status === 'PENDING_HR' ? 'Chờ NS duyệt' :
                                                                req.status === 'READY_FOR_PICKUP' ? 'Chờ Nhận' :
                                                                    req.status === 'APPROVED_ISSUED' || req.status === 'COMPLETED' ? 'Đã hoàn tất' :
                                                                        req.status === 'REJECTED_BY_DEPT' ? 'BP từ chối' :
                                                                            req.status === 'REJECTED_BY_HSE' ? 'HSE từ chối' : req.status}
                                            </Badge>
                                            <div className="text-[11px] text-zinc-500 font-medium mt-1 leading-tight">
                                                {req.dept_approver?.name && <div>BP: {req.dept_approver.name}</div>}
                                                {req.hse_approver?.name && <div>HSE: {req.hse_approver.name}</div>}
                                                {req.pm_approver?.name && <div>GĐ: {req.pm_approver.name}</div>}
                                                {req.hr_approver?.name && <div>HR: {req.hr_approver.name}</div>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {(req.status === 'PENDING_HSE' || req.status === 'PENDING_DEPT') && (
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                                    disabled={loadingId === req.id}
                                                    onClick={() => onDelete(req.id)}
                                                    title={t.common.delete || "Delete"}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
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
                                        {req.status !== 'PENDING_HSE' && req.status !== 'PENDING_DEPT' && (
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                                                    disabled={loadingId === req.id}
                                                    onClick={() => onDelete(req.id)}
                                                    title={t.common.delete || "Delete"}
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
            </div >

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

export function InventoryTable({ inventory, purchases }: { inventory: any[], purchases: any[] }) {
    const { t } = useLanguage()
    const router = useRouter()

    // Add Stock States
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
    const [selectedPpeId, setSelectedPpeId] = useState<string | null>(null)
    const [addQty, setAddQty] = useState<number>(0)
    const [addPrice, setAddPrice] = useState<number>(0)
    const [addNote, setAddNote] = useState('')
    const [isAdding, setIsAdding] = useState(false)

    const [isEditMenuOpen, setIsEditMenuOpen] = useState(false)
    const [editPrice, setEditPrice] = useState<number>(0)
    const [editQty, setEditQty] = useState<number>(0)
    const [isUpdating, setIsUpdating] = useState(false)

    function openEditMenu(ppe: any) {
        setSelectedPpeId(ppe.id)
        setEditPrice(ppe.unit_price)
        setEditQty(ppe.stock_quantity)
        setIsEditMenuOpen(true)
    }

    async function handleEditPpe() {
        if (!selectedPpeId || editPrice < 0 || editQty < 0) return
        if (!window.confirm("Cảnh báo: Việc điều chỉnh số lượng và đơn giá thủ công có thể ảnh hưởng đến sai lệch hồ sơ tồn kho cuối tháng. Hãy chắc chắn trước khi thực hiện.")) return
        setIsUpdating(true)
        try {
            const res = await updatePpeMasterInfo(selectedPpeId, editPrice, editQty)
            if (res?.error) {
                toast.error(res.error)
            } else {
                toast.success(t.hse.inventoryTable.updatePriceSuccess || "Stock updated successfully")
                setIsEditMenuOpen(false)
                router.refresh()
            }
        } catch (err: any) {
            toast.error(err.message || 'Error occurred')
        } finally {
            setIsUpdating(false)
        }
    }

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
                    <h3 className="font-medium text-sm">Add / Edit Stock (Nhập / Sửa Kho)</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        To manage stock, click the actions next to any item below.
                    </p>
                    <div className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                        Tổng giá trị tồn kho: ${(
                            inventory.reduce((acc, item) => acc + (item.unit_price * item.stock_quantity), 0)
                        ).toLocaleString()}
                    </div>
                </div>
                <Button onClick={handleExport} variant="outline" size="sm" className="w-full sm:w-auto">
                    {t.admin?.exportBtn || "Export to Excel"}
                </Button>
            </div>
            <div className="rounded-md border bg-white dark:bg-zinc-950">
                <Table className="whitespace-nowrap">
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
                                        <div className="flex justify-end gap-2 items-center">
                                            <Button size="icon" variant="ghost" onClick={() => openEditMenu(item)} title={t.common.edit || "Edit"}>
                                                <Pencil className="w-4 h-4 text-blue-500" />
                                            </Button>
                                            <Button size="sm" variant="secondary" onClick={() => openAddMenu(item)}>
                                                {t.hse.inventoryTable.addStockBtn || "+ Add Stock"}
                                            </Button>
                                        </div>
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

            <h3 className="font-semibold text-lg mt-12 mb-4">Lịch Sử Nhập Hàng (Purchase History)</h3>
            <div className="rounded-md border bg-white dark:bg-zinc-950">
                <Table className="whitespace-nowrap">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ngày Nhập</TableHead>
                            <TableHead>Vật Phẩm</TableHead>
                            <TableHead>Số Lượng</TableHead>
                            <TableHead>Đơn Giá</TableHead>
                            <TableHead>Tổng Tiền</TableHead>
                            <TableHead>Người Nhập</TableHead>
                            <TableHead>Ghi chú (Remark)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {purchases.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell className="text-sm">
                                    {new Date(p.purchased_at).toLocaleDateString()}
                                    <div className="text-xs text-zinc-500">{new Date(p.purchased_at).toLocaleTimeString()}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{p.ppe_master?.name}</div>
                                    <div className="text-xs text-zinc-500">{p.ppe_master?.unit}</div>
                                </TableCell>
                                <TableCell className="font-medium text-green-600 dark:text-green-400">+{p.quantity}</TableCell>
                                <TableCell>{Number(p.unit_price).toLocaleString()}</TableCell>
                                <TableCell>{Number(p.total_cost).toLocaleString()}</TableCell>
                                <TableCell>{p.app_users?.name || 'Unknown'}</TableCell>
                                <TableCell className="max-w-[200px] truncate" title={p.note || ''}>
                                    {p.note || '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                        {purchases.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-6 text-zinc-500">
                                    Chưa có lịch sử nhập kho.
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

            <Dialog open={isEditMenuOpen} onOpenChange={setIsEditMenuOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.common.edit || "Edit Stock & Price"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded text-sm text-amber-800 dark:text-amber-300">
                            <strong>Cảnh báo:</strong> Việc điều chỉnh số lượng và đơn giá thủ công có thể ảnh hưởng đến sai lệch hồ sơ tồn kho cuối tháng. Hãy chắc chắn trước khi thực hiện.
                        </div>
                        <div className="space-y-2">
                            <Label>{t.hse.inventoryTable.price || "Price"}</Label>
                            <Input
                                type="number"
                                min="0"
                                value={editPrice || ''}
                                onChange={(e) => setEditPrice(Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t.hse.inventoryTable.currStock || "Stock Quantity"}</Label>
                            <Input
                                type="number"
                                min="0"
                                value={editQty === 0 ? 0 : (editQty || '')}
                                onChange={(e) => setEditQty(Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditMenuOpen(false)} disabled={isUpdating}>
                            {t.common.cancel || "Cancel"}
                        </Button>
                        <Button
                            onClick={handleEditPpe}
                            disabled={isUpdating || editPrice < 0 || editQty < 0}
                        >
                            {isUpdating ? (t.common.loading || "Loading...") : (t.common.save || "Save")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export function AnalyticsTable({ triggerRefetch }: { triggerRefetch?: number }) {
    const { t } = useLanguage()

    const [year, setYear] = useState<number>(new Date().getFullYear())
    const [month, setMonth] = useState<string>("all") // "all" string for Entire Year, or "1"-"12"
    const [data, setData] = useState<any[]>([])
    const [chartData, setChartData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [expandedItems, setExpandedItems] = useState<string[]>([])

    const toggleExpand = (id: string) => {
        setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    useEffect(() => {
        async function load() {
            setLoading(true)
            const m = month === "all" ? undefined : parseInt(month)
            const [resData, resChart] = await Promise.all([
                getInventoryAnalytics(year, m),
                month === "all" ? getYearlyChartData(year) : Promise.resolve([])
            ])
            setData(resData || [])
            setChartData(resChart || [])
            setLoading(false)
        }
        load()
    }, [year, month, triggerRefetch])

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

            {month === "all" && chartData.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 mb-8 mt-4">
                    <h3 className="text-lg font-semibold mb-6 text-zinc-800 dark:text-zinc-200">
                        {t.hse.chartTitle || "Yearly Overview (In vs Out)"} - {year}
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-zinc-800" />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `T${value}`}
                                    className="text-xs text-zinc-500"
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    className="text-xs text-zinc-500"
                                />
                                <RechartsTooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', backgroundColor: 'var(--tooltip-bg, #fff)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="in" name={t.hse.historyTable.in || "IN"} fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="out" name={t.hse.historyTable.out || "OUT"} fill="#f97316" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <div className="rounded-md border relative bg-white dark:bg-zinc-950">
                <Table className="whitespace-nowrap">
                    <TableHeader>
                        <TableRow className="bg-zinc-50 dark:bg-zinc-900/50">
                            <TableHead className="w-[40px]"></TableHead>
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
                                <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                                    {t.common.loading}
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && data.map((item) => (
                            <Fragment key={item.id}>
                                <TableRow key={item.id} className={item.issueDetails?.length > 0 ? "cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50" : ""} onClick={() => item.issueDetails?.length > 0 && toggleExpand(item.id)}>
                                    <TableCell>
                                        {item.issueDetails?.length > 0 && (
                                            expandedItems.includes(item.id)
                                                ? <ChevronDown className="h-4 w-4 text-zinc-500" />
                                                : <ChevronRight className="h-4 w-4 text-zinc-500" />
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">{item.name}</TableCell>
                                    <TableCell className="text-zinc-500">{item.unit}</TableCell>
                                    <TableCell className="text-right font-medium">{item.openingBalance}</TableCell>
                                    <TableCell className="text-right text-blue-600 dark:text-blue-400 font-medium">+{item.in}</TableCell>
                                    <TableCell className="text-right text-orange-600 dark:text-orange-400 font-medium">-{item.out}</TableCell>
                                    <TableCell className="text-right font-bold text-zinc-900 dark:text-zinc-100">{item.closingBalance}</TableCell>
                                </TableRow>
                                {expandedItems.includes(item.id) && item.issueDetails && item.issueDetails.length > 0 && (
                                    <TableRow key={`${item.id}-details`} className="bg-zinc-50/50 dark:bg-zinc-900/20">
                                        <TableCell colSpan={7} className="p-0 border-b-0">
                                            <div className="py-4 pl-14 pr-4 bg-zinc-50/50 dark:bg-zinc-900/20 border-l-4 border-l-orange-400">
                                                <h4 className="text-sm font-semibold mb-3 text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                                    Lịch sử cấp phát (Issue Details)
                                                </h4>
                                                <div className="rounded-md border bg-white dark:bg-zinc-950 overflow-hidden shadow-sm">
                                                    <Table className="text-sm">
                                                        <TableHeader className="bg-zinc-100 dark:bg-zinc-900/80">
                                                            <TableRow>
                                                                <TableHead className="h-10"><div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Ngày (Date)</div></TableHead>
                                                                <TableHead className="h-10"><div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Người nhận (Requester)</div></TableHead>
                                                                <TableHead className="h-10"><div className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> Mã NV (Emp Code)</div></TableHead>
                                                                <TableHead className="h-10"><div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Phòng ban (Dept)</div></TableHead>
                                                                <TableHead className="text-right h-10 text-orange-600 dark:text-orange-400">SL Xuất</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {item.issueDetails.map((detail: any, idx: number) => (
                                                                <TableRow key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 border-b-zinc-100 dark:border-b-zinc-800">
                                                                    <TableCell className="text-zinc-600 dark:text-zinc-400">
                                                                        {new Date(detail.date).toLocaleDateString()}
                                                                    </TableCell>
                                                                    <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                                                                        {detail.requester}
                                                                    </TableCell>
                                                                    <TableCell className="font-mono text-zinc-500 text-xs">
                                                                        {detail.empCode || '-'}
                                                                    </TableCell>
                                                                    <TableCell className="text-zinc-600 dark:text-zinc-400">
                                                                        {detail.department}
                                                                    </TableCell>
                                                                    <TableCell className="text-right font-medium text-orange-600 dark:text-orange-400">
                                                                        {detail.qty} {item.unit}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </Fragment>
                        ))}
                        {!loading && data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
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

export function BudgetCostsTable({ factory, departments }: { factory: any, departments: any[] }) {
    const factoryUsed = Number(factory?.used_budget || 0)
    const factoryTotal = Number(factory?.total_budget || 0)
    const factoryPercent = factoryTotal > 0 ? (factoryUsed / factoryTotal) * 100 : 0

    return (
        <div className="space-y-8">
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">Tổng Khoản Nhà Máy (Factory Level)</h3>
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-2 w-full">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Đã sử dụng (Used)</span>
                            <span className="font-medium text-red-600 dark:text-red-400">{factoryUsed.toLocaleString()} VND</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Tổng ngân sách (Total)</span>
                            <span className="font-medium">{factoryTotal.toLocaleString()} VND</span>
                        </div>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-4 mt-4 overflow-hidden">
                            <div
                                className={`h-4 rounded-full ${factoryPercent > 90 ? 'bg-red-500' : factoryPercent > 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(factoryPercent, 100)}%` }}
                            ></div>
                        </div>
                        <div className="text-xs text-right text-zinc-500 mt-1">{factoryPercent.toFixed(1)}%</div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-lg mb-4">Định Biên Theo Bộ Phận (Department Quotas)</h3>
                <div className="rounded-md border bg-white dark:bg-zinc-950">
                    <Table className="whitespace-nowrap">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Phòng Ban</TableHead>
                                <TableHead className="text-right">Đã Sử Dụng (Cost)</TableHead>
                                <TableHead className="text-right">Ngân Sách (Quota)</TableHead>
                                <TableHead className="text-right">Tỷ Lệ (%)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {departments.map(d => {
                                const used = Number(d.used_budget || 0)
                                const total = Number(d.total_budget || 0)
                                const pct = total > 0 ? (used / total) * 100 : 0
                                return (
                                    <TableRow key={d.id}>
                                        <TableCell className="font-medium">{d.departments?.name}</TableCell>
                                        <TableCell className="text-right text-red-600 dark:text-red-400 font-medium">{used.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{total.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${pct > 90 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : pct > 70 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                {pct.toFixed(1)}%
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                            {departments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-6 text-zinc-500">
                                        Chưa có chi tiết định biên bộ phận. (Vui lòng thiết lập trong CSDL)
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
