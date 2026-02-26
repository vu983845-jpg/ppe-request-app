import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailParams {
    to: string | string[]
    subject: string
    html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Mocking email send:', { to, subject })
        return { success: true, mocked: true }
    }

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'PPE System <no-reply@resend.dev>',
            to,
            subject,
            html,
        })

        if (error) {
            console.error('Resend API Error:', error)
            return { success: false, error }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Failed to send email:', error)
        return { success: false, error }
    }
}

// Helper Templates
export function generateStatusEmailHtml({
    requestName,
    status,
    department,
    ppeName,
    quantity,
    unit,
    note,
    ctaLink
}: {
    requestName: string
    status: string
    department: string
    ppeName: string
    quantity: number
    unit: string
    note?: string
    ctaLink: string
}) {
    return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">PPE Request Update</h2>
      <p>A PPE Request status has been updated to: <strong>${status}</strong></p>
      
      <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Requester:</strong> ${requestName}</p>
        <p><strong>Department:</strong> ${department}</p>
        <p><strong>Item:</strong> ${ppeName}</p>
        <p><strong>Quantity:</strong> ${quantity} ${unit}</p>
        ${note ? `<p><strong>Note:</strong> ${note}</p>` : ''}
      </div>

      <a href="${ctaLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">View Request / Action</a>
    </div>
  `
}
