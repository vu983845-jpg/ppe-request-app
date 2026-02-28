'use server'

import { createClient } from '@/lib/supabase/server'
import { sendEmail, generateStatusEmailHtml } from '@/lib/email'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { sendTeamsNotification } from '@/lib/teams'

const PPE_REQUEST_SCHEMA = z.object({
    requesterName: z.string().min(1, 'Name is required'),
    requesterEmpCode: z.string().optional(),
    requesterEmail: z.string().email('Invalid email').optional().or(z.literal('')),
    departmentId: z.string().uuid('Please select a department'),
    location: z.string().optional(),
    items: z.array(z.object({
        ppeId: z.string().uuid('Please select an item'),
        quantity: z.number().positive().min(1, 'At least 1 item is required'),
    })).min(1, 'You must request at least one item.'),
    note: z.string().optional(),
    attachmentUrl: z.string().optional(),
    requestType: z.enum(['NORMAL', 'LOST_BROKEN']),
    incidentDescription: z.string().optional(),
    incidentDate: z.string().optional(),
    employeeAcceptsCompensation: z.boolean().default(false),
})

export async function submitPpeRequest(formData: z.infer<typeof PPE_REQUEST_SCHEMA>) {
    try {
        const supabase = await createClient()

        // 1. Fetch related data (Department and PPEs)
        const { data: dept } = await supabase
            .from('departments')
            .select('name, dept_head_email')
            .eq('id', formData.departmentId)
            .single()

        if (!dept) return { error: 'Invalid department.' }

        const itemIds = formData.items.map(i => i.ppeId)
        const { data: ppeList } = await supabase
            .from('ppe_master')
            .select('id, name, unit')
            .in('id', itemIds)

        // 2. Prepare and Insert the requests
        const requestsToInsert = formData.items.map(item => ({
            requester_name: formData.requesterName,
            requester_emp_code: formData.requesterEmpCode || null,
            requester_email: formData.requesterEmail || null,
            requester_department_id: formData.departmentId,
            location: formData.location || null,
            ppe_id: item.ppeId,
            quantity: item.quantity,
            note: formData.note || null,
            attachment_url: formData.attachmentUrl || null,
            status: 'PENDING_DEPT',
            request_type: formData.requestType,
            incident_description: formData.incidentDescription || null,
            incident_date: formData.incidentDate || null,
            employee_accepts_compensation: formData.employeeAcceptsCompensation
        }))

        const { error: insertError } = await supabase
            .from('ppe_requests')
            .insert(requestsToInsert)

        if (insertError) {
            console.error(insertError)
            return { error: insertError.message }
        }

        // 3. Send email to Department Head
        const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000'

        let itemsHtml = '<ul>'
        for (const item of formData.items) {
            const ppeDetails = ppeList?.find(p => p.id === item.ppeId)
            itemsHtml += `<li><strong>${ppeDetails?.name || 'Unknown Item'}</strong>: ${item.quantity} ${ppeDetails?.unit || ''}</li>`
        }
        itemsHtml += '</ul>'

        const notifyHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">PPE Request Update</h2>
                <p>A new multi-item PPE Request requires your approval.</p>
                
                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Requester:</strong> ${formData.requesterName}</p>
                    <p><strong>Department:</strong> ${dept.name}</p>
                    <p><strong>Items Requested:</strong></p>
                    ${itemsHtml}
                    ${formData.note ? `<p><strong>Note:</strong> ${formData.note}</p>` : ''}
                </div>

                <a href="${baseUrl}/login" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Review Requests</a>
            </div>
        `

        await sendEmail({
            to: dept.dept_head_email,
            subject: `[PPE Request] Action Required for ${formData.requesterName}`,
            html: notifyHtml
        })

        // 4. Send Teams Notification
        let teamsItemsText = '';
        for (const item of formData.items) {
            const ppeDetails = ppeList?.find(p => p.id === item.ppeId)
            teamsItemsText += `- **${ppeDetails?.name || 'Unknown Item'}**: ${item.quantity} ${ppeDetails?.unit || ''}\n`
        }

        await sendTeamsNotification({
            requesterName: formData.requesterName,
            department: dept.name,
            items: teamsItemsText,
            requestType: formData.requestType,
            incidentDescription: formData.incidentDescription
        });

        revalidatePath('/dashboard/dept-head')
        revalidatePath('/dashboard/hse')

        return { success: true }
    } catch (err: any) {
        console.error(err)
        return { error: 'An unexpected error occurred.' }
    }
}

export async function searchRequestsByEmpCode(empCode: string) {
    const supabase = await createClient()

    // 1. Fetch pending/recent requests
    const { data: requests, error: reqError } = await supabase
        .from('ppe_requests')
        .select(`
            *, 
            ppe_master(name, unit), 
            departments(name),
            dept_approver:app_users!dept_approved_by(name),
            hse_approver:app_users!hse_approved_by(name),
            pm_approver:app_users!plant_manager_approved_by(name),
            hr_approver:app_users!hr_approved_by(name)
        `)
        .eq('requester_emp_code', empCode)
        .order('created_at', { ascending: false })
        .limit(20)

    if (reqError) {
        return { error: 'Failed to fetch requests: ' + reqError.message }
    }

    // 2. We can also fetch issuance history (ppe_issue_log) linked to these requests
    const requestIds = requests?.map(r => r.id) || []
    let history: any[] = []

    if (requestIds.length > 0) {
        const { data: issueLog, error: logError } = await supabase
            .from('ppe_issue_log')
            .select('*, ppe_requests!inner(ppe_master(name, unit))')
            .in('request_id', requestIds)
            .order('issued_at', { ascending: false })

        if (!logError && issueLog) {
            history = issueLog
        }
    }

    return { requests, history }
}

export async function confirmReceipt(requestId: string, empCode: string) {
    const supabase = await createClient()

    // Verify ownership
    const { data: request, error: fetchErr } = await supabase
        .from('ppe_requests')
        .select('id, requester_emp_code, status')
        .eq('id', requestId)
        .single()

    if (fetchErr || !request) return { error: 'Request not found' }
    if (request.requester_emp_code !== empCode) return { error: 'Unauthorized to confirm this request' }
    if (request.status !== 'READY_FOR_PICKUP') return { error: 'Request is not ready for pickup' }

    const { error: updateErr } = await supabase
        .from('ppe_requests')
        .update({ status: 'COMPLETED' })
        .eq('id', requestId)

    if (updateErr) return { error: updateErr.message }

    revalidatePath('/tracking')
    return { success: true }
}
