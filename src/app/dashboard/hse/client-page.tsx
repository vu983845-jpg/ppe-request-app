'use client'

import { useState } from 'react'
import { approveRequestByHSE, rejectRequestByHSE } from '@/app/actions/hse'
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
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export function HseRequestsTable({ requests }: { requests: any[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [rejectDialog, setRejectDialog] = useState<{ open: boolean; requestId: string | null }>({
        open: false,
        requestId: null,
    })
    const [rejectNote, setRejectNote] = useState('')

    async function onApprove(id: string) {
        setLoadingId(id)
        const res = await approveRequestByHSE(id)
        setLoadingId(null)
        if (res?.error) toast.error(res.error)
        else toast.success('Approved and Issued successfully')
    }

    async function onReject() {
        if (!rejectDialog.requestId) return
        setLoadingId(rejectDialog.requestId)
        const res = await rejectRequestByHSE(rejectDialog.requestId, rejectNote)
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
                            <TableHead>Dept / Date</TableHead>
                            <TableHead>Requester</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Stock / Warning</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
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
                                                Stock: {stock}
                                            </Badge>
                                            {isInsufficient && <span className="text-xs text-red-500 font-medium">Insufficient</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={req.status === 'PENDING_HSE' ? 'default' : 'outline'}>
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {req.status === 'PENDING_HSE' && (
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
                                                    disabled={loadingId === req.id || isInsufficient}
                                                    onClick={() => onApprove(req.id)}
                                                >
                                                    Issue
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
                                    No requests pending HSE approval.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={rejectDialog.open} onOpenChange={(open) => !open && setRejectDialog({ open: false, requestId: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject HSE Request</DialogTitle>
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

export function InventoryTable({ inventory }: { inventory: any[] }) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Min Stock</TableHead>
                        <TableHead className="text-right">Current Stock</TableHead>
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
                            </TableRow>
                        )
                    })}
                    {inventory.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-6 text-zinc-500">
                                No inventory items found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
