import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HseRequestsTable, InventoryTable } from './client-page'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { getLocale } from '@/app/actions/locale'
import { dictionaries } from '@/lib/i18n/dictionaries'

export default async function HseDashboard() {
    const locale = await getLocale()
    const t = dictionaries[locale]
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: appUser } = await supabase
        .from('app_users')
        .select('role')
        .eq('auth_user_id', user.id)
        .single()

    if (appUser?.role !== 'HSE') {
        return <div className="p-8">Unauthorized. Only HSE can access this page.</div>
    }

    // Fetch PENDING_HSE requests + history
    const { data: requests } = await supabase
        .from('ppe_requests')
        .select('*, ppe_master(*), departments(*)')
        .order('created_at', { ascending: false })
        // In a real app we might only fetch PENDING_HSE or recent ones to avoid large payloads
        .limit(100)

    // Fetch PPE Inventory
    const { data: inventory } = await supabase
        .from('ppe_master')
        .select('*')
        .order('name')

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t.hse.title}</h1>
                        <p className="text-zinc-500">
                            {t.hse.subtitle}
                        </p>
                    </div>
                    <form action={logoutAction}>
                        <Button variant="outline" type="submit">{t.common.signOut}</Button>
                    </form>
                </div>

                <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">{t.hse.pendingTitle}</h2>
                    <HseRequestsTable requests={requests || []} />
                </div>

                <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-lg p-6 mt-8">
                    <h2 className="text-xl font-semibold mb-4">{t.hse.inventoryTitle}</h2>
                    <InventoryTable inventory={inventory || []} />
                </div>
            </div>
        </div>
    )
}
