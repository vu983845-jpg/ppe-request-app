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
  const { data: req } = await supabase
    .from('ppe_requests')
    .select('*, ppe_master(*), departments(name, dept_head_email)')
    .eq('id', requestId)
    .single()

  if (!req || req.status !== 'PENDING_HSE') return { error: 'Request invalid or not pending HSE.' }

  const ppe = req.ppe_master
  if (ppe.stock_quantity < req.quantity) {
    return { error: `Insufficient stock. Requested: ${req.quantity}, Available: ${ppe.stock_quantity}` }
  }

  const totalCost = req.quantity * ppe.unit_price

  // 3. Perform Updates using RPC (or sequentially if no complex RPC setup)
  // For robustness, multiple queries from an authenticated server client acts as a pseudo-transaction in Supabase Edge without custom RPC,
  // but a Postgres function is safer. We'll do sequential updates securely.

  // Deduct stock
  const { error: stockError } = await supabase
    .from('ppe_master')
    .update({ stock_quantity: ppe.stock_quantity - req.quantity })
    .eq('id', ppe.id)

  if (stockError) return { error: 'Failed to deduct stock' }

  // Update request status
  await supabase
    .from('ppe_requests')
    .update({
      status: 'APPROVED_ISSUED',
      hse_approved_at: new Date().toISOString(),
      hse_approved_by: approver.id
    })
    .eq('id', req.id)

  // Insert to log
  await supabase
    .from('ppe_issue_log')
    .insert({
      request_id: req.id,
      issued_quantity: req.quantity,
      unit_price_at_issue: ppe.unit_price,
      total_cost: totalCost,
      issued_by: approver.id
    })

  // Update yearly budget
  const currentYear = new Date().getFullYear()
  const { data: budget } = await supabase.from('yearly_budget').select('*').eq('year', currentYear).single()

  if (budget) {
    await supabase
      .from('yearly_budget')
      .update({ used_budget: Number(budget.used_budget) + totalCost })
      .eq('id', budget.id)
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

  const { data: req } = await supabase
    .from('ppe_requests')
    .select('*, ppe_master(name, unit), departments(name, dept_head_email)')
    .eq('id', requestId)
    .single()

  if (!req) return { error: 'Request not found' }

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
