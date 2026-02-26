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

export function RequestsTable({ requests }: { requests: any[] }) {
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
            toast.success('Rejected successfully')
            setRejectDialog({ open: false, requestId: null })
            setRejectNote('')
        }
    }

    return (
        <>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Requester</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
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
                                        {req.status}
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
                                                Reject
                                            </Button>
                                            <Button
                                                size="sm"
                                                disabled={loadingId === req.id}
                                                onClick={() => onApprove(req.id)}
                                            >
                                                Approve
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {requests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-zinc-500">
                                    No requests found for your department.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={rejectDialog.open} onOpenChange={(open) => !open && setRejectDialog({ open: false, requestId: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Request</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Provide a reason for rejection (required)..."
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialog({ open: false, requestId: null })}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={onReject} disabled={!rejectNote.trim() || !!loadingId}>
                            Confirm Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
