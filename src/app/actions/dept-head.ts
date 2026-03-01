'use server'

import { createClient } from '@/lib/supabase/server'

import { revalidatePath } from 'next/cache'

export async function approveRequestByDept(requestId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  // Get the app_user ID
  const { data: approver } = await supabase
    .from('app_users')
    .select('id, department_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!approver) return { error: 'Approver profile not found' }

  // Fetch request to ensure it belongs to this dept (if specifically assigned) and get details for email
  let query = supabase
    .from('ppe_requests')
    .select('*, ppe_master(name, unit, size), departments(name)')
    .eq('id', requestId)

  if (approver.department_id) {
    query = query.eq('requester_department_id', approver.department_id)
  }

  const { data: request } = await query.single()

  if (!request) return { error: 'Request not found or unauthorized' }

  // Update status
  const { error: updateError } = await supabase
    .from('ppe_requests')
    .update({
      status: 'PENDING_HSE',
      dept_approved_at: new Date().toISOString(),
      dept_approved_by: approver.id,
    })
    .eq('id', requestId)

  if (updateError) return { error: updateError.message }

  // Send Emails
  

  
  

  

  
  

  revalidatePath('/dashboard/dept-head')
  return { success: true }
}

export async function rejectRequestByDept(requestId: string, note: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Unauthorized' }

  const { data: approver } = await supabase
    .from('app_users')
    .select('id, department_id')
    .eq('auth_user_id', user.id)
    .single()

  if (!approver) return { error: 'Approver profile not found' }

  let query = supabase
    .from('ppe_requests')
    .select('*, ppe_master(name, unit, size), departments(name)')
    .eq('id', requestId)

  if (approver.department_id) {
    query = query.eq('requester_department_id', approver.department_id)
  }

  const { data: request } = await query.single()

  if (!request) return { error: 'Request not found or unauthorized' }

  const { error: updateError } = await supabase
    .from('ppe_requests')
    .update({
      status: 'REJECTED_BY_DEPT',
      dept_decision_note: note,
      dept_approved_at: new Date().toISOString(),
      dept_approved_by: approver.id,
    })
    .eq('id', requestId)

  if (updateError) return { error: updateError.message }

  
  

  revalidatePath('/dashboard/dept-head')
  return { success: true }
}
