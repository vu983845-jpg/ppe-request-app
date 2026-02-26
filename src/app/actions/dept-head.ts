'use server'

import { createClient } from '@/lib/supabase/server'
import { sendEmail, generateStatusEmailHtml } from '@/lib/email'
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

  // Fetch request to ensure it belongs to this dept and get details for email
  const { data: request } = await supabase
    .from('ppe_requests')
    .select('*, ppe_master(name, unit), departments(name)')
    .eq('id', requestId)
    .eq('requester_department_id', approver.department_id)
    .single()

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
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000'

  // 1. To HSE
  const hseHtml = generateStatusEmailHtml({
    requestName: request.requester_name,
    status: 'Dept Approved - PENDING HSE Approval',
    department: request.departments.name,
    ppeName: request.ppe_master.name,
    quantity: request.quantity,
    unit: request.ppe_master.unit,
    ctaLink: `${baseUrl}/dashboard/hse`
  })

  await sendEmail({
    to: process.env.HSE_NOTIFY_EMAIL || 'hse@company.com',
    subject: `[PPE Request] Dept Approved - Pending HSE`,
    html: hseHtml
  })

  // 2. To Requester (if has email)
  if (request.requester_email) {
    const reqHtml = generateStatusEmailHtml({
      requestName: request.requester_name,
      status: 'Department Head Approved',
      department: request.departments.name,
      ppeName: request.ppe_master.name,
      quantity: request.quantity,
      unit: request.ppe_master.unit,
      ctaLink: baseUrl
    })
    await sendEmail({
      to: request.requester_email,
      subject: `[PPE Request Update] Department Approved`,
      html: reqHtml
    })
  }

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

  const { data: request } = await supabase
    .from('ppe_requests')
    .select('*, ppe_master(name, unit), departments(name)')
    .eq('id', requestId)
    .eq('requester_department_id', approver.department_id)
    .single()

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

  // Mail Requester
  if (request.requester_email) {
    const reqHtml = generateStatusEmailHtml({
      requestName: request.requester_name,
      status: 'Rejected by Department Head',
      department: request.departments.name,
      ppeName: request.ppe_master.name,
      quantity: request.quantity,
      unit: request.ppe_master.unit,
      note,
      ctaLink: 'javascript:void(0)'
    })
    await sendEmail({
      to: request.requester_email,
      subject: `[PPE Request Update] Rejected`,
      html: reqHtml
    })
  }

  revalidatePath('/dashboard/dept-head')
  return { success: true }
}
