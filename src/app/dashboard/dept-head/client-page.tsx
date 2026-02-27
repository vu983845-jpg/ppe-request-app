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

export function RequestsTable({ requests }: { requests: any[] }) {
    const { t } = useLanguage()
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [rejectDialog, setRejectDialog] = useState<{ open: boolean; requestId: string | null }>({
        open: false,
        requestId: null,
    })
    const [rejectNote, setRejectNote] = useState('')

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
            toast.success(t.common.save) // We can keep a generic success here or reuse
            setRejectDialog({ open: false, requestId: null })
            setRejectNote('')
        }
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
                            <TableHead>{t.deptHead.table.status}</TableHead>
                            <TableHead className="text-right">{t.deptHead.table.actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((req) => (
                            <TableRow key={req.id}>
                                <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                                <TableCell className="font-medium">
                                    {req.requester_name}
                                    {req.note && <div className="text-sm text-zinc-500">Note: {req.note}</div>}
                                </TableCell>
                                <TableCell>
                                    {req.ppe_master.name}
                                    <div className="text-sm text-zinc-500">{req.ppe_master.unit}</div>
                                </TableCell>
                                <TableCell>{req.quantity}</TableCell>
                                <TableCell>
                                    <Badge variant={req.status === 'PENDING_DEPT' ? 'default' : 'secondary'}>
                                        {req.status === 'PENDING_DEPT' ? 'Chờ BP duyệt' :
                                            req.status === 'PENDING_HSE' ? 'Chờ HSE duyệt' :
                                                req.status === 'APPROVED_ISSUED' ? 'Đã cấp phát' :
                                                    req.status === 'REJECTED_BY_DEPT' ? 'BP từ chối' :
                                                        req.status === 'REJECTED_BY_HSE' ? 'HSE từ chối' : req.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {req.status === 'PENDING_DEPT' && (
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
                            </TableRow>
                        ))}
                        {requests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-zinc-500">
                                    {t.deptHead.noRequests}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

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
