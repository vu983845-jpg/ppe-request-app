'use server'

import { createClient } from '@/lib/supabase/server'
import { sendEmail, generateStatusEmailHtml } from '@/lib/email'
import { revalidatePath } from 'next/cache'

export async function approveRequestByHSE(requestId: string) {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: approver } = await supabase
    .from('app_users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (approver?.role !== 'HSE') return { error: 'Only HSE can approve this step.' }

  // 2. Fetch Request Data
  const { data: req, error: selError } = await supabase
    .from('ppe_requests')
    .select('*, ppe_master(*), departments(name, dept_head_email)')
    .eq('id', requestId)
    .single()

  if (!req) {
    return { error: 'Request not found in DB. DB error: ' + (selError?.message || 'unknown') }
  }

  if (req.status !== 'PENDING_HSE' && req.status !== 'PENDING_DEPT') {
    return { error: `Request invalid. Expected PENDING_HSE or PENDING_DEPT but got: "${req.status}"` }
  }

  const ppe = req.ppe_master
  if (ppe.stock_quantity < req.quantity) {
    return { error: `Insufficient stock. Requested: ${req.quantity}, Available: ${ppe.stock_quantity}` }
  }

  const totalCost = req.quantity * ppe.unit_price

  // 3. Perform Updates using RPC (or sequentially if no complex RPC setup)

  // Deduct stock
  const { error: stockError } = await supabase
    .from('ppe_master')
    .update({ stock_quantity: Number(ppe.stock_quantity) - Number(req.quantity) })
    .eq('id', ppe.id)

  if (stockError) return { error: 'Failed to deduct stock: ' + stockError.message }

  // Update request status
  const { error: reqError } = await supabase
    .from('ppe_requests')
    .update({
      status: 'APPROVED_ISSUED',
      hse_approved_at: new Date().toISOString(),
      hse_approved_by: approver.id
    })
    .eq('id', req.id)

  if (reqError) return { error: 'Failed to update request: ' + reqError.message }

  // Insert to log
  const { error: logError } = await supabase
    .from('ppe_issue_log')
    .insert({
      request_id: req.id,
      issued_quantity: Number(req.quantity),
      unit_price_at_issue: Number(ppe.unit_price),
      total_cost: Number(totalCost),
      issued_by: approver.id
    })

  if (logError) return { error: 'Failed to insert log: ' + logError.message }

  // Update yearly budget
  const currentYear = new Date().getFullYear()
  const { data: budget } = await supabase.from('yearly_budget').select('*').eq('year', currentYear).single()

  if (budget) {
    const { error: budgetError } = await supabase
      .from('yearly_budget')
      .update({ used_budget: Number(budget.used_budget) + Number(totalCost) })
      .eq('id', budget.id)

    if (budgetError) return { error: 'Failed to update budget: ' + budgetError.message }
  }

  // 4. Send Emails
  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000'

  const emailHtml = generateStatusEmailHtml({
    requestName: req.requester_name,
    status: 'APPROVED & ISSUED',
    department: req.departments.name,
    ppeName: ppe.name,
    quantity: req.quantity,
    unit: ppe.unit,
    ctaLink: baseUrl
  })

  // To Dept Head
  await sendEmail({
    to: req.departments.dept_head_email,
    subject: `[PPE Request] ISSUED for ${req.requester_name}`,
    html: emailHtml
  })

  // To Requester
  if (req.requester_email) {
    await sendEmail({
      to: req.requester_email,
      subject: `[PPE Request] Your PPE has been ISSUED`,
      html: emailHtml
    })
  }

  revalidatePath('/dashboard/hse')
  return { success: true }
}

export async function rejectRequestByHSE(requestId: string, note: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: approver } = await supabase.from('app_users').select('id, role').eq('auth_user_id', user.id).single()
  if (approver?.role !== 'HSE') return { error: 'Only HSE can do this.' }

  const { data: req, error: selError } = await supabase
    .from('ppe_requests')
    .select('*, ppe_master(name, unit), departments(name, dept_head_email)')
    .eq('id', requestId)
    .single()

  if (!req) {
    return { error: 'Request not found in DB. DB error: ' + (selError?.message || 'unknown') }
  }

  if (req.status !== 'PENDING_HSE' && req.status !== 'PENDING_DEPT') {
    return { error: `Request invalid. Expected PENDING_HSE or PENDING_DEPT but got: "${req.status}"` }
  }

  const { error } = await supabase
    .from('ppe_requests')
    .update({
      status: 'REJECTED_BY_HSE',
      hse_decision_note: note,
      hse_approved_at: new Date().toISOString(),
      hse_approved_by: approver.id
    })
    .eq('id', req.id)

  if (error) return { error: error.message }

  // Mail
  const emailHtml = generateStatusEmailHtml({
    requestName: req.requester_name,
    status: 'REJECTED by HSE',
    department: req.departments.name,
    ppeName: req.ppe_master.name,
    quantity: req.quantity,
    unit: req.ppe_master.unit,
    note,
    ctaLink: 'javascript:void(0)'
  })

  await sendEmail({
    to: req.departments.dept_head_email,
    subject: `[PPE Request] HSE Rejected`,
    html: emailHtml
  })

  if (req.requester_email) {
    await sendEmail({
      to: req.requester_email,
      subject: `[PPE Request] HSE Rejected`,
      html: emailHtml
    })
  }

  revalidatePath('/dashboard/hse')
  return { success: true }
}
