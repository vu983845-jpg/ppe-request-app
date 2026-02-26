'use server'

import { createClient } from '@/lib/supabase/server'
import { sendEmail, generateStatusEmailHtml } from '@/lib/email'
import { z } from 'zod'

const PPE_REQUEST_SCHEMA = z.object({
    requesterName: z.string().min(1, 'Name is required'),
    requesterEmpCode: z.string().optional(),
    requesterEmail: z.string().email('Invalid email').optional().or(z.literal('')),
    departmentId: z.string().uuid('Please select a department'),
    location: z.string().optional(),
    ppeId: z.string().uuid('Please select an item'),
    quantity: z.number().positive().min(1, 'At least 1 item is required'),
    note: z.string().optional(),
    attachmentUrl: z.string().optional()
})

export async function submitPpeRequest(formData: z.infer<typeof PPE_REQUEST_SCHEMA>) {
    try {
        const supabase = await createClient()

        // 1. Fetch related data (Department and PPE) to construct the email
        const { data: dept } = await supabase
            .from('departments')
            .select('name, dept_head_email')
            .eq('id', formData.departmentId)
            .single()

        const { data: ppe } = await supabase
            .from('ppe_master')
            .select('name, unit')
            .eq('id', formData.ppeId)
            .single()

        if (!dept || !ppe) {
            return { error: 'Invalid department or PPE item.' }
        }

        // 2. Insert the request
        const { data: newRequest, error: insertError } = await supabase
            .from('ppe_requests')
            .insert({
                requester_name: formData.requesterName,
                requester_emp_code: formData.requesterEmpCode || null,
                requester_email: formData.requesterEmail || null,
                requester_department_id: formData.departmentId,
                requester_location: formData.location || null,
                ppe_id: formData.ppeId,
                quantity: formData.quantity,
                note: formData.note || null,
                attachment_url: formData.attachmentUrl || null,
                status: 'PENDING_DEPT'
            })
            .select('id')
            .single()

        if (insertError) {
            console.error(insertError)
            return { error: insertError.message }
        }

        // 3. Send email to Department Head
        const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000'
        const notifyHtml = generateStatusEmailHtml({
            requestName: formData.requesterName,
            status: 'Action Required: Waiting for your approval',
            department: dept.name,
            ppeName: ppe.name,
            quantity: formData.quantity,
            unit: ppe.unit,
            note: formData.note,
            ctaLink: `${baseUrl}/login`
        })

        await sendEmail({
            to: dept.dept_head_email,
            subject: `[PPE Request] Action Required for ${formData.requesterName}`,
            html: notifyHtml
        })

        return { success: true, id: newRequest.id }
    } catch (err: any) {
        console.error(err)
        return { error: 'An unexpected error occurred.' }
    }
}
