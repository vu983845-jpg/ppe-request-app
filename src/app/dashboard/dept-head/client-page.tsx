'use client'

import { useState } from 'react'
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
import { approveRequestByDept, rejectRequestByDept } from '@/app/actions/dept-head'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useLanguage } from '@/lib/i18n/context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function RequestsTable({ requests }: { requests: any[] }) {
    const { t } = useLanguage()
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [rejectDialog, setRejectDialog] = useState<{ open: boolean; requestId: string | null }>({
        open: false,
        requestId: null,
    })
    const [rejectNote, setRejectNote] = useState('')

    const pendingRequests = requests.filter(r => r.status === 'PENDING_DEPT')
    const historyRequests = requests.filter(r => r.status !== 'PENDING_DEPT')

    async function onApprove(id: string) {
        setLoadingId(id)
        const res = await approveRequestByDept(id)
        setLoadingId(null)
        if (res?.error) toast.error(res.error)
        else toast.success('Approved successfully')
    }

    async function onReject() {
        if (!rejectDialog.requestId) return
        setLoadingId(rejectDialog.requestId)
        const res = await rejectRequestByDept(rejectDialog.requestId, rejectNote)
        setLoadingId(null)
        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success(t.common.save)
            setRejectDialog({ open: false, requestId: null })
            setRejectNote('')
        }
    }

    const renderTable = (data: any[], isHistory: boolean) => (
        <div className="rounded-md border bg-white dark:bg-zinc-950">
            <Table className="whitespace-nowrap">
                <TableHeader>
                    <TableRow>
                        <TableHead>{t.deptHead.table.date}</TableHead>
                        <TableHead>{t.deptHead.table.requester}</TableHead>
                        <TableHead>{t.deptHead.table.dept}</TableHead>
                        <TableHead>{t.deptHead.table.item}</TableHead>
                        <TableHead>{t.deptHead.table.qty}</TableHead>
                        <TableHead>{t.deptHead.table.status}</TableHead>
                        {!isHistory && <TableHead className="text-right">{t.deptHead.table.actions}</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((req) => (
                        <TableRow key={req.id}>
                            <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium">
                                {req.requester_name}
                                {req.note && <div className="text-sm text-zinc-500">Note: {req.note}</div>}
                            </TableCell>
                            <TableCell className="text-zinc-600 dark:text-zinc-400">
                                {req.departments?.name || '-'}
                            </TableCell>
                            <TableCell>
                                {req.ppe_master?.name}
                                <div className="text-sm text-zinc-500">{req.ppe_master?.unit}</div>
                            </TableCell>
                            <TableCell>{req.quantity}</TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1 items-start">
                                    <Badge variant={req.status === 'PENDING_DEPT' ? 'default' : 'secondary'}>
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
                            {!isHistory && (
                                <TableCell className="text-right">
                                    {(req.status === 'PENDING_DEPT') && (
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
                                                disabled={loadingId === req.id}
                                                onClick={() => onApprove(req.id)}
                                            >
                                                {t.common.approve}
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={isHistory ? 5 : 6} className="text-center py-6 text-zinc-500">
                                {isHistory ? t.hse.historyTable?.noHistory || "Không có dữ liệu lịch sử." : t.deptHead.noRequests}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )

    return (
        <>
            <Tabs defaultValue="pending" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="pending">{t.deptHead.tabs?.approvals || "Pending Approvals"}</TabsTrigger>
                    <TabsTrigger value="history">{t.deptHead.tabs?.history || "Issuance History"}</TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="m-0">
                    {renderTable(pendingRequests, false)}
                </TabsContent>
                <TabsContent value="history" className="m-0 space-y-4">
                    <h3 className="font-medium text-lg mt-4">{t.deptHead.historyTitle || "Lịch Sử Cấp Phát Của Bộ Phận"}</h3>
                    {renderTable(historyRequests, true)}
                </TabsContent>
            </Tabs>

            <Dialog open={rejectDialog.open} onOpenChange={(open) => !open && setRejectDialog({ open: false, requestId: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.deptHead.rejectDialogTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder={t.deptHead.rejectDialogPlaceholder}
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialog({ open: false, requestId: null })}>
                            {t.common.cancel}
                        </Button>
                        <Button variant="destructive" onClick={onReject} disabled={!rejectNote.trim() || !!loadingId}>
                            {t.deptHead.rejectConfirmBtn}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
