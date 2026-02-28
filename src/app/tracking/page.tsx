'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/lib/i18n/context'
import { searchRequestsByEmpCode, confirmReceipt } from '@/app/actions/requests'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function TrackingPage() {
    const { t } = useLanguage()
    const [empCode, setEmpCode] = useState('')
    const [captchaAnswer, setCaptchaAnswer] = useState('')
    const [mathCaptcha, setMathCaptcha] = useState({ num1: 0, num2: 0 })

    const [requests, setRequests] = useState<any[]>([])
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const [confirmingId, setConfirmingId] = useState<string | null>(null)

    useEffect(() => {
        regenerateCaptcha()
    }, [])

    const regenerateCaptcha = () => {
        setMathCaptcha({
            num1: Math.floor(Math.random() * 20) + 1,
            num2: Math.floor(Math.random() * 20) + 1
        })
        setCaptchaAnswer('')
    }

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault()

        if (!empCode.trim()) return

        const expectedAnswer = mathCaptcha.num1 + mathCaptcha.num2
        if (parseInt(captchaAnswer) !== expectedAnswer) {
            toast.error(t.tracking.captchaError || t.requestForm.captchaError)
            regenerateCaptcha()
            return
        }

        setLoading(true)
        const res = await searchRequestsByEmpCode(empCode.trim())

        if (res.error) {
            toast.error(res.error)
        } else {
            setRequests(res.requests || [])
            setHistory(res.history || [])
            setHasSearched(true)
        }

        setLoading(false)
    }

    async function handleConfirmReceipt(requestId: string) {
        setConfirmingId(requestId)
        const res = await confirmReceipt(requestId, empCode.trim())
        setConfirmingId(null)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(t.tracking.confirmSuccess || 'Receipt confirmed successfully!')
            setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: 'COMPLETED' } : req))
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">{t.tracking.title}</h1>
                <p className="text-zinc-500">{t.tracking.subtitle}</p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-sm space-y-4 max-w-xl">
                <div>
                    <label className="block text-sm font-medium mb-1.5">{t.tracking.empCode}</label>
                    <Input
                        placeholder={t.tracking.empCodePlaceholder}
                        value={empCode}
                        onChange={(e) => setEmpCode(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
                        <span>🛡️</span> {t.tracking.captchaPrompt}
                        <strong className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                            {mathCaptcha.num1} + {mathCaptcha.num2} = ?
                        </strong>
                    </label>
                    <Input
                        type="number"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        required
                    />
                </div>

                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading ? t.tracking.searching : t.tracking.searchBtn}
                </Button>
            </form>

            {hasSearched && (
                <div className="space-y-8 animate-in fade-in duration-300">

                    {/* Active/Recent Requests */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">{t.tracking.myRequests || 'My Requests'}</h2>
                        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">{t.tracking.table.date}</th>
                                            <th className="px-6 py-4 font-medium">{t.tracking.table.dept}</th>
                                            <th className="px-6 py-4 font-medium">{t.tracking.table.item}</th>
                                            <th className="px-6 py-4 font-medium">{t.tracking.table.qty}</th>
                                            <th className="px-6 py-4 font-medium">{t.tracking.table.status}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                        {requests.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                                                    {t.tracking.noRequests}
                                                </td>
                                            </tr>
                                        )}
                                        {requests.map((req) => (
                                            <tr key={req.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {new Date(req.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">{req.departments?.name}</td>
                                                <td className="px-6 py-4 max-w-[200px] truncate">{req.ppe_master?.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {req.quantity} <span className="text-xs text-zinc-500">{req.ppe_master?.unit}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {(req.status === 'READY_FOR_PICKUP') ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleConfirmReceipt(req.id)}
                                                            disabled={confirmingId === req.id}
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                        >
                                                            {confirmingId === req.id ? t.common.loading : (t.tracking.confirmReceiptBtn || 'Confirm Receipt')}
                                                        </Button>
                                                    ) : (
                                                        <Badge variant={req.status.includes('REJECTED') ? "destructive" : "secondary"} className={
                                                            req.status === 'APPROVED_ISSUED' || req.status === 'COMPLETED' ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400" :
                                                                req.status === 'PENDING_DEPT' ? "bg-yellow-100/50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-500 hover:bg-yellow-100/50" :
                                                                    req.status.includes('PENDING') ? "bg-orange-100/50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-500 hover:bg-orange-100/50" : ""
                                                        }>
                                                            {(t.tracking.statusMap as any)?.[req.status] || req.status}
                                                        </Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Issuance History */}
                    {history.length > 0 && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">{t.tracking.history || 'Issuance History'}</h2>
                            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                                            <tr>
                                                <th className="px-6 py-4 font-medium">{t.tracking.historyTable?.date || 'Issued Date'}</th>
                                                <th className="px-6 py-4 font-medium">{t.tracking.historyTable?.item || 'Item'}</th>
                                                <th className="px-6 py-4 font-medium">{t.tracking.historyTable?.qty || 'Qty'}</th>
                                                <th className="px-6 py-4 font-medium">{t.tracking.historyTable?.cost || 'Cost'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                            {history.map((log) => (
                                                <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {new Date(log.issued_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {log.ppe_requests?.ppe_master?.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {log.issued_quantity} <span className="text-xs text-zinc-500">{log.ppe_requests?.ppe_master?.unit}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        ${log.total_cost}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    )
}
