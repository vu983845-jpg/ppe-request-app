'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveRequestByHR(requestId: string, note?: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: appUser } = await supabase
        .from('app_users')
        .select('role')
        .eq('auth_user_id', user.id)
        .single()

    if (appUser?.role !== 'HR') return { error: 'Unauthorized' }

    // Check request current status
    const { data: request } = await supabase
        .from('ppe_requests')
        .select('status, request_type')
        .eq('id', requestId)
        .single()

    if (!request || request.status !== 'PENDING_HR') {
        return { error: 'Request is not pending your approval' }
    }

    const { error } = await supabase
        .from('ppe_requests')
        .update({
            status: 'READY_FOR_PICKUP', // Goes back to HSE/Storage for delivery
            hr_decision_note: note || null,
            hr_approved_at: new Date().toISOString(),
            hr_approved_by: user.id
        })
        .eq('id', requestId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/hr')
    revalidatePath('/dashboard/hse')
    return { success: true }
}

export async function rejectRequestByHR(requestId: string, reason: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: appUser } = await supabase
        .from('app_users')
        .select('role')
        .eq('auth_user_id', user.id)
        .single()

    if (appUser?.role !== 'HR') return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('ppe_requests')
        .update({
            status: 'REJECTED_BY_HR',
            hr_decision_note: reason,
            hr_approved_at: new Date().toISOString(),
            hr_approved_by: user.id
        })
        .eq('id', requestId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/hr')
    return { success: true }
}
