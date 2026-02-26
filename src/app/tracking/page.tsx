'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/lib/i18n/context'

export default function TrackingPage() {
    const { t } = useLanguage()
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchRequests() {
            const supabase = createClient()
            const { data } = await supabase
                .from('ppe_requests')
                .select('*, ppe_master(name, unit), departments(name)')
                .in('status', ['PENDING_DEPT', 'PENDING_HSE'])
                .order('created_at', { ascending: false })

            if (data) setRequests(data)
            setLoading(false)
        }
        fetchRequests()
    }, [])

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">{t.tracking.title}</h1>
            <p className="text-zinc-500 mb-8">{t.tracking.subtitle}</p>

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4 font-medium">{t.tracking.table.date}</th>
                                <th className="px-6 py-4 font-medium">{t.tracking.table.requester}</th>
                                <th className="px-6 py-4 font-medium">{t.tracking.table.dept}</th>
                                <th className="px-6 py-4 font-medium">{t.tracking.table.item}</th>
                                <th className="px-6 py-4 font-medium">{t.tracking.table.qty}</th>
                                <th className="px-6 py-4 font-medium">{t.tracking.table.status}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {loading && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                                        {t.common.loading}
                                    </td>
                                </tr>
                            )}
                            {!loading && requests.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                                        {t.tracking.noRequests}
                                    </td>
                                </tr>
                            )}
                            {!loading && requests.map((req) => (
                                <tr key={req.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{req.requester_name}</div>
                                        {req.requester_emp_code && (
                                            <div className="text-xs text-zinc-500">{req.requester_emp_code}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {req.departments?.name}
                                    </td>
                                    <td className="px-6 py-4 max-w-[200px] truncate">
                                        {req.ppe_master?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {req.quantity} <span className="text-xs text-zinc-500">{req.ppe_master?.unit}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {req.status === 'PENDING_DEPT' && <Badge variant="secondary" className="bg-yellow-100/50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-500 hover:bg-yellow-100/50">Dept Pending</Badge>}
                                        {req.status === 'PENDING_HSE' && <Badge variant="secondary" className="bg-orange-100/50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-500 hover:bg-orange-100/50">HSE Pending</Badge>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
