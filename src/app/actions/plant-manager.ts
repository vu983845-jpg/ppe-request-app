'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveRequestByPlantManager(requestId: string, note?: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: appUser } = await supabase
        .from('app_users')
        .select('role')
        .eq('auth_user_id', user.id)
        .single()

    if (appUser?.role !== 'PLANT_MANAGER') return { error: 'Unauthorized' }

    // Check request current status
    const { data: request } = await supabase
        .from('ppe_requests')
        .select('status, request_type')
        .eq('id', requestId)
        .single()

    if (!request || request.status !== 'PENDING_PLANT_MANAGER') {
        return { error: 'Request is not pending your approval' }
    }

    const { error } = await supabase
        .from('ppe_requests')
        .update({
            status: 'PENDING_HR',
            plant_manager_decision_note: note || null,
            plant_manager_approved_at: new Date().toISOString(),
            plant_manager_approved_by: user.id
        })
        .eq('id', requestId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/plant-manager')
    revalidatePath('/dashboard/hr')
    revalidatePath('/dashboard/hse')
    return { success: true }
}

export async function rejectRequestByPlantManager(requestId: string, reason: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: appUser } = await supabase
        .from('app_users')
        .select('role')
        .eq('auth_user_id', user.id)
        .single()

    if (appUser?.role !== 'PLANT_MANAGER') return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('ppe_requests')
        .update({
            status: 'REJECTED_BY_PLANT_MANAGER',
            plant_manager_decision_note: reason,
            plant_manager_approved_at: new Date().toISOString(),
            plant_manager_approved_by: user.id
        })
        .eq('id', requestId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/plant-manager')
    return { success: true }
}
