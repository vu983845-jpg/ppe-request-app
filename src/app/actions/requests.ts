'use server'

import { createClient } from '@/lib/supabase/server'
import { sendEmail, generateStatusEmailHtml } from '@/lib/email'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

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
    attachmentUrl: z.string().optional()
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
            status: 'PENDING_DEPT'
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

        revalidatePath('/dashboard/dept-head')
        revalidatePath('/dashboard/hse')

        return { success: true }
    } catch (err: any) {
        console.error(err)
        return { error: 'An unexpected error occurred.' }
    }
}
