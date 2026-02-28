'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

const formSchema = z.object({
    requestType: z.enum(['NORMAL', 'LOST_BROKEN']),
    requesterName: z.string().min(1, 'Name is required'),
    requesterEmpCode: z.string().min(1, 'Employee Code is required for tracking'),
    requesterEmail: z.string().optional().or(z.literal('')),
    departmentId: z.string().uuid('Please select a department'),
    location: z.string().optional(),
    items: z.array(z.object({
        ppeId: z.string().uuid('Please select an item'),
        quantity: z.number().positive().min(1, 'At least 1 item is required'),
    })).min(1, 'You must request at least one item.'),
    note: z.string().optional(),
    attachmentUrl: z.string().optional(),
    captchaAnswer: z.string().min(1, 'Required'),
    incidentDescription: z.string().optional(),
    incidentDate: z.string().optional(),
    employeeAcceptsCompensation: z.boolean(),
}).superRefine((data, ctx) => {
    if (data.requestType === 'LOST_BROKEN') {
        if (!data.incidentDescription || data.incidentDescription.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Required for Lost/Broken reports',
                path: ['incidentDescription']
            });
        }
        if (!data.incidentDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Required',
                path: ['incidentDate']
            });
        }
        if (!data.employeeAcceptsCompensation) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'You must accept compensation to proceed',
                path: ['employeeAcceptsCompensation']
            });
        }
    }
})

export function RequestForm({
    departments,
    ppes,
}: {
    departments: Department[]
    ppes: PPEMaster[]
}) {
    const { t } = useLanguage()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isConfirming, setIsConfirming] = useState(false)
    const [confirmedValues, setConfirmedValues] = useState<z.infer<typeof formSchema> | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            requestType: 'NORMAL',
            requesterName: '',
            requesterEmpCode: '',
            requesterEmail: '',
            departmentId: '',
            location: '',
            items: [{ ppeId: '', quantity: 1 }],
            note: '',
            attachmentUrl: '',
            captchaAnswer: '',
            incidentDescription: '',
            incidentDate: '',
            employeeAcceptsCompensation: false,
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

    const currentRequestType = form.watch('requestType')

    const [file, setFile] = useState<File | null>(null)

    async function handleInitialSubmit(values: z.infer<typeof formSchema>) {
        const expectedAnswer = mathCaptcha.num1 + mathCaptcha.num2
        if (parseInt(values.captchaAnswer) !== expectedAnswer) {
            form.setError('captchaAnswer', { message: t.requestForm.captchaError })
            regenerateCaptcha()
            return
        }

        // Switch to confirmation mode
        setConfirmedValues(values)
        setIsConfirming(true)
    }

    async function handleConfirmSubmit() {
        if (!confirmedValues) return

        setIsSubmitting(true)
        let attachmentUrl = ''
        const values = confirmedValues

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
            setIsSubmitting(false)
        } else {
            toast.success(t.requestForm.success)
            form.reset()
            router.push('/tracking')
        }
    }

    if (isConfirming && confirmedValues) {
        return (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-zinc-50 dark:bg-zinc-900/40 p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4">
                    <h3 className="text-xl font-semibold mb-2">{t.requestForm.confirmTitle}</h3>
                    <p className="text-zinc-500 mb-4">{t.requestForm.confirmSubtitle}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-zinc-500 block">{t.requestForm.fullName}</span>
                            <span className="font-medium">{confirmedValues.requesterName}</span>
                        </div>
                        <div>
                            <span className="text-zinc-500 block">{t.requestForm.dept}</span>
                            <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                {departments.find(d => d.id === confirmedValues.departmentId)?.name}
                            </span>
                        </div>
                        {confirmedValues.requesterEmpCode && (
                            <div>
                                <span className="text-zinc-500 block">{t.requestForm.empCode}</span>
                                <span className="font-medium">{confirmedValues.requesterEmpCode}</span>
                            </div>
                        )}
                        {confirmedValues.location && (
                            <div>
                                <span className="text-zinc-500 block">{t.requestForm.location}</span>
                                <span className="font-medium">{confirmedValues.location}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                        <h4 className="font-medium mb-3">{t.requestForm.requestedItems}</h4>
                        <ul className="space-y-2">
                            {confirmedValues.items.map((item, idx) => {
                                const ppe = ppes.find(p => p.id === item.ppeId)
                                return (
                                    <li key={idx} className="flex justify-between items-center bg-white dark:bg-zinc-950 p-3 rounded border border-zinc-100 dark:border-zinc-800">
                                        <span>{ppe?.name}</span>
                                        <span className="font-medium bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                                            {item.quantity} {ppe?.unit}
                                        </span>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsConfirming(false)}
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        {t.requestForm.goBackBtn}
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirmSubmit}
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        {isSubmitting ? t.requestForm.submitting : t.requestForm.confirmBtn}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleInitialSubmit)} className="space-y-6">

                <FormField
                    control={form.control}
                    name="requestType"
                    render={({ field }) => (
                        <FormItem className="space-y-3 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-8"
                                >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="NORMAL" />
                                        </FormControl>
                                        <FormLabel className="font-medium cursor-pointer text-base">
                                            {t.requestForm.typeNormal || "Normal Request"}
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <RadioGroupItem value="LOST_BROKEN" />
                                        </FormControl>
                                        <FormLabel className="font-medium cursor-pointer text-base">
                                            {t.requestForm.typeLostBroken || "Lost / Broken Report"}
                                        </FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {currentRequestType === 'LOST_BROKEN' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <Alert variant="destructive" className="bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-950/40 dark:text-orange-200 dark:border-orange-900">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>{t.requestForm.lostBrokenAlert?.title || "Important Notice"}</AlertTitle>
                            <AlertDescription>
                                {t.requestForm.lostBrokenAlert?.desc || "For Lost/Broken reports, please provide accurate details. Per company policy, replacement costs may be subject to payroll deduction after review."}
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="requesterName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t.requestForm.fullName} *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nguyễn Văn A" {...field} />
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
                                <FormLabel>{t.requestForm.empCode} *</FormLabel>
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
                                    <Input type="text" placeholder="0912345678" {...field} />
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

                {currentRequestType === 'LOST_BROKEN' && (
                    <div className="space-y-4 p-4 border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="incidentDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-red-800 dark:text-red-200">{t.requestForm.incidentDate || "Date of Incident"} *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="incidentDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-red-800 dark:text-red-200">{t.requestForm.incidentDesc || "Incident Description"} *</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={t.requestForm.incidentDescPlaceholder} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="employeeAcceptsCompensation"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-red-100 dark:border-red-900 bg-white dark:bg-zinc-950 rounded-md">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="font-medium cursor-pointer">
                                            {t.requestForm.acceptCompensation || "I confirm the above information is accurate and accept responsibility for compensation."}
                                        </FormLabel>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                )}

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
