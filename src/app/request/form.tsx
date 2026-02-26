'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { submitPpeRequest } from '@/app/actions/requests'
import { Department, PPEMaster } from '@/lib/types'
import { useLanguage } from '@/lib/i18n/context'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

const formSchema = z.object({
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

export function RequestForm({
    departments,
    ppes,
}: {
    departments: Department[]
    ppes: PPEMaster[]
}) {
    const { t } = useLanguage()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            requesterName: '',
            requesterEmpCode: '',
            requesterEmail: '',
            departmentId: '',
            location: '',
            ppeId: '',
            quantity: 1,
            note: '',
            attachmentUrl: '',
        },
    })

    const [file, setFile] = useState<File | null>(null)

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true)
        let attachmentUrl = ''

        if (file) {
            const supabase = createClient()
            const ext = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
            const { data, error } = await supabase.storage
                .from('ppe_attachments')
                .upload(fileName, file)

            if (error) {
                toast.error('Failed to upload attachment: ' + error.message)
            } else if (data) {
                // Since the bucket is public, we can construct the base public URL easily:
                const { data: publicUrlData } = supabase.storage.from('ppe_attachments').getPublicUrl(data.path)
                attachmentUrl = publicUrlData.publicUrl
            }
        }

        const payload = { ...values, attachmentUrl }
        const result = await submitPpeRequest(payload)

        if (result?.error) {
            toast.error(t.requestForm.error + ' ' + result.error)
        } else {
            toast.success(t.requestForm.success)
            form.reset()
        }
        setIsSubmitting(false)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="requesterName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.requestForm.fullName} *</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="requesterEmpCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.requestForm.empCode} ({t.common.optional})</FormLabel>
                                <FormControl>
                                    <Input placeholder="EMP123" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="requesterEmail"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.requestForm.email} ({t.common.optional})</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.requestForm.location}</FormLabel>
                                <FormControl>
                                    <Input placeholder="Line 3, Zone A" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="departmentId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.requestForm.dept} *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t.requestForm.selectDept} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="ppeId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.requestForm.ppeItem} *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t.requestForm.selectItem} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {ppes.map((ppe) => (
                                            <SelectItem key={ppe.id} value={ppe.id}>
                                                {ppe.name} ({ppe.unit})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2 max-w-xs">
                                <FormLabel>{t.requestForm.qty} *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="1"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="note"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.requestForm.reason}</FormLabel>
                                <FormControl>
                                    <Textarea placeholder={t.requestForm.reasonPlaceholder} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormItem>
                        <FormLabel>{t.requestForm.attachment}</FormLabel>
                        <FormControl>
                            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        </FormControl>
                        <p className="text-xs text-zinc-500">{t.requestForm.attachmentDesc}</p>
                    </FormItem>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                    {isSubmitting ? t.requestForm.submitting : t.common.submit}
                </Button>
            </form>
        </Form>
    )
}
