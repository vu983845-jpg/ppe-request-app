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
import { approveRequestByPlantManager, rejectRequestByPlantManager } from '@/app/actions/plant-manager'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { checkEarlyReplacement, getPpeName } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n/context'

export function RequestsTable({ requests }: { requests: any[] }) {
    const { t, locale } = useLanguage()
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [rejectDialog, setRejectDialog] = useState<{ open: boolean; requestId: string | null }>({
        open: false,
        requestId: null,
    })
    const [rejectNote, setRejectNote] = useState('')

    async function onApprove(id: string) {
        setLoadingId(id)
        const res = await approveRequestByPlantManager(id)
        setLoadingId(null)
        if (res?.error) toast.error(res.error)
        else toast.success('Approved incident successfully')
    }

    async function onReject() {
        if (!rejectDialog.requestId) return
        setLoadingId(rejectDialog.requestId)
        const res = await rejectRequestByPlantManager(rejectDialog.requestId, rejectNote)
        setLoadingId(null)
        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success(t.common.save)
            setRejectDialog({ open: false, requestId: null })
            setRejectNote('')
        }
    }

    if (!requests || requests.length === 0) {
        return (
            <div className="text-center py-8 text-zinc-500">
                {t.plantManager.noRequests}
            </div>
        )
    }

    return (
        <>
            <div className="rounded-md border bg-white dark:bg-zinc-950">
                <Table className="whitespace-nowrap">
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t.deptHead.table.date}</TableHead>
                            <TableHead>{t.deptHead.table.requester}</TableHead>
                            <TableHead>{t.deptHead.table.item}</TableHead>
                            <TableHead>{t.deptHead.table.qty}</TableHead>
                            <TableHead>Incident Info</TableHead>
                            <TableHead>Approvers History</TableHead>
                            <TableHead className="text-right">{t.deptHead.table.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((req) => (
                            <TableRow key={req.id}>
                                <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="font-medium">
                                    {req.requester_name}
                                </TableCell>
                                <TableCell className="text-zinc-600 dark:text-zinc-400">
                                    {req.departments?.name || '-'}
                                </TableCell>
                                <TableCell>
                                    {getPpeName(req.ppe_master, locale)} {req.ppe_master?.size ? `- Size ${req.ppe_master.size}` : ''}
                                    <div className="text-sm text-zinc-500">{req.ppe_master?.unit}</div>
                                    {req.request_type === 'LOST_BROKEN' ? (
                                        <div className="mt-1 flex flex-col gap-1">
                                            <Badge variant="destructive" className="w-fit text-[10px] px-1.5 py-0 h-4 uppercase">Mất/Hỏng</Badge>
                                            {req.last_receipt_date && <div className="text-[11px] text-zinc-500">Nhận gần nhất: {new Date(req.last_receipt_date).toLocaleDateString()}</div>}
                                        </div>
                                    ) : (
                                        <div className="mt-1 flex flex-col gap-1">
                                            <Badge variant="secondary" className="w-fit text-[10px] px-1.5 py-0 h-4 bg-blue-100 text-blue-700 hover:bg-blue-100 uppercase dark:bg-blue-900/50 dark:text-blue-300">Cấp Mới</Badge>
                                            {req.last_receipt_date && <div className="text-[11px] text-zinc-500">Nhận gần nhất: {new Date(req.last_receipt_date).toLocaleDateString()}</div>}
                                        </div>
                                    )}
                                    {checkEarlyReplacement(req) && (
                                        <Badge variant="destructive" className="mt-1 w-fit text-[10px] px-1.5 py-0 h-4">
                                            ⚠️ Cấp sớm so với chu kỳ ({req.ppe_master.life_span_months} tháng)
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>{req.quantity}</TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                    <Badge variant="destructive" className="mb-1">Lost/Broken</Badge>
                                    <div className="text-xs text-zinc-500 truncate" title={req.incident_description}>
                                        {req.incident_date} - {req.incident_description}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-[11px] text-zinc-500 font-medium leading-tight space-y-1">
                                        {req.dept_approver?.email && <div>BP: {req.dept_approver.email}</div>}
                                        {req.hse_approver?.email && <div>HSE: {req.hse_approver.email}</div>}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
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
                                            {loadingId === req.id ? t.common.loading : t.common.approve || "Approve"}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog(prev => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Request</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Reason for rejection..."
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialog({ open: false, requestId: null })}>
                            {t.common.cancel}
                        </Button>
                        <Button variant="destructive" onClick={onReject} disabled={!rejectNote || loadingId !== null}>
                            {t.common.reject}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
