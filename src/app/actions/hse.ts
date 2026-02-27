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
      ppe_id: ppe.id,
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

export async function addPpeStock(ppeId: string, quantity: number, unitPrice: number, note?: string) {
  const supabase = await createClient()

  // 1. Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: approver } = await supabase.from('app_users').select('id, role').eq('auth_user_id', user.id).single()
  if (approver?.role !== 'HSE') return { error: 'Only HSE can do this.' }

  // 2. Fetch current PPE stock
  const { data: ppe, error: selError } = await supabase.from('ppe_master').select('*').eq('id', ppeId).single()
  if (!ppe) return { error: 'PPE not found. ' + (selError?.message || '') }

  // 3. Insert Purchase Log and Update Master
  const totalCost = quantity * unitPrice

  const { error: purError } = await supabase
    .from('ppe_purchases')
    .insert({
      ppe_id: ppeId,
      quantity,
      unit_price: unitPrice,
      total_cost: totalCost,
      purchased_by: approver.id,
      note
    })

  if (purError) return { error: 'Failed to log purchase: ' + purError.message }

  const { error: updError } = await supabase
    .from('ppe_master')
    .update({ stock_quantity: Number(ppe.stock_quantity) + quantity })
    .eq('id', ppeId)

  if (updError) return { error: 'Failed to update stock quantity: ' + updError.message }

  revalidatePath('/dashboard/hse')
  return { success: true }
}

export async function getInventoryAnalytics(year: number, month?: number) {
  const supabase = await createClient()

  // Build the time ranges
  // If month is provided, we calculate the balance for that specific month, and opening balance is prior to that month.
  // If month is NOT provided, we get the overview for the entire year, opening balance is prior to Jan 1st of that year.

  const startDate = month
    ? new Date(year, month - 1, 1).toISOString()
    : new Date(year, 0, 1).toISOString()

  const endDate = month
    ? new Date(year, month, 1).toISOString()
    : new Date(year + 1, 0, 1).toISOString()

  // Fetch all items
  const { data: items } = await supabase.from('ppe_master').select('id, name, unit, stock_quantity')
  if (!items) return []

  // Note: RLS allows us to fetch all, but we only really need aggregations
  const { data: allPurchases } = await supabase.from('ppe_purchases').select('ppe_id, quantity, purchased_at')
  const { data: allIssues } = await supabase.from('ppe_issue_log').select('ppe_id, issued_quantity, issued_at')

  const analytics = items.map(item => {
    // Purchases
    const itemPurchases = (allPurchases || []).filter(p => p.ppe_id === item.id)
    const inPeriodPurchases = itemPurchases.filter(p => p.purchased_at >= startDate && p.purchased_at < endDate)
    const totalInPeriod = inPeriodPurchases.reduce((acc, p) => acc + Number(p.quantity), 0)

    // Issues
    const itemIssues = (allIssues || []).filter(i => i.ppe_id === item.id)
    const inPeriodIssues = itemIssues.filter(i => i.issued_at >= startDate && i.issued_at < endDate)
    const totalOutPeriod = inPeriodIssues.reduce((acc, i) => acc + Number(i.issued_quantity), 0)

    // Calculate Opening Balance
    // Current Stock = Opening Balance + Total In (from start of time) - Total Out (from start of time)
    // Actually, it's easier: 
    // Opening Balance = Current Stock - Total In (from StartDate to Now) + Total Out (from StartDate to Now)

    const postPeriodPurchases = itemPurchases.filter(p => p.purchased_at >= startDate)
    const postPeriodTotalIn = postPeriodPurchases.reduce((acc, p) => acc + Number(p.quantity), 0)

    const postPeriodIssues = itemIssues.filter(i => i.issued_at >= startDate)
    const postPeriodTotalOut = postPeriodIssues.reduce((acc, i) => acc + Number(i.issued_quantity), 0)

    const openingBalance = Number(item.stock_quantity) - postPeriodTotalIn + postPeriodTotalOut
    const closingBalance = openingBalance + totalInPeriod - totalOutPeriod

    return {
      id: item.id,
      name: item.name,
      unit: item.unit,
      openingBalance,
      in: totalInPeriod,
      out: totalOutPeriod,
      closingBalance,
      currentRealStock: Number(item.stock_quantity) // for debugging/reference
    }
  })

  return analytics
}
