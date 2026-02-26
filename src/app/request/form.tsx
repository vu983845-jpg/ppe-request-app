'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
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
    items: z.array(z.object({
        ppeId: z.string().uuid('Please select an item'),
        quantity: z.number().positive().min(1, 'At least 1 item is required'),
    })).min(1, 'You must request at least one item.'),
    note: z.string().optional(),
    attachmentUrl: z.string().optional(),
    captchaAnswer: z.string().min(1, 'Required')
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
            items: [{ ppeId: '', quantity: 1 }],
            note: '',
            attachmentUrl: '',
            captchaAnswer: '',
        },
    })

    const [mathCaptcha, setMathCaptcha] = useState({ num1: 0, num2: 0 })

    // Generate initial math problem
    useEffect(() => {
        setMathCaptcha({
            num1: Math.floor(Math.random() * 20) + 1,
            num2: Math.floor(Math.random() * 20) + 1
        })
    }, [])

    const regenerateCaptcha = () => {
        setMathCaptcha({
            num1: Math.floor(Math.random() * 20) + 1,
            num2: Math.floor(Math.random() * 20) + 1
        })
        form.setValue('captchaAnswer', '')
    }

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items"
    })

    const [file, setFile] = useState<File | null>(null)

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const expectedAnswer = mathCaptcha.num1 + mathCaptcha.num2
        if (parseInt(values.captchaAnswer) !== expectedAnswer) {
            form.setError('captchaAnswer', { message: t.requestForm.captchaError })
            regenerateCaptcha()
            return
        }

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
            regenerateCaptcha()
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

                    {/* Dynamic Items Array */}
                    {fields.map((field, index) => (
                        <div key={field.id} className="col-span-1 md:col-span-2 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-4 relative bg-zinc-50/50 dark:bg-zinc-900/50">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium text-sm text-zinc-700 dark:text-zinc-300">
                                    Item {index + 1}
                                </h4>
                                {fields.length > 1 && (
                                    <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                                        {t.requestForm.removeItem}
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.ppeId`}
                                    render={({ field: itemField }) => (
                                        <FormItem>
                                            <FormLabel>{t.requestForm.ppeItem} *</FormLabel>
                                            <Select onValueChange={itemField.onChange} value={itemField.value}>
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
                                    name={`items.${index}.quantity`}
                                    render={({ field: itemField }) => (
                                        <FormItem className="max-w-xs">
                                            <FormLabel>{t.requestForm.qty} *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    {...itemField}
                                                    onChange={(e) => itemField.onChange(e.target.value ? Number(e.target.value) : '')}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    ))}

                    <div className="col-span-1 md:col-span-2 flex justify-start">
                        <Button
                            type="button"
                            variant="secondary"
                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100"
                            onClick={() => append({ ppeId: '', quantity: 1 })}
                        >
                            {t.requestForm.addItem}
                        </Button>
                    </div>
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

                <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg max-w-sm">
                    <FormField
                        control={form.control}
                        name="captchaAnswer"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                    <span className="text-zinc-500">🛡️</span> {t.requestForm.captchaPrompt}
                                    <strong className="text-lg bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">
                                        {mathCaptcha.num1} + {mathCaptcha.num2} = ?
                                    </strong>
                                </FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="Enter result" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
                    {isSubmitting ? t.requestForm.submitting : t.common.submit}
                </Button>
            </form>
        </Form>
    )
}
