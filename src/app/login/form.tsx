'use client'

import { useState } from 'react'
import { loginAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLanguage } from '@/lib/i18n/context'

export function LoginForm() {
    const { t } = useLanguage()
    const [isPending, setIsPending] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        const result = await loginAction(formData)

        if (result?.error) {
            toast.error(t.login.error + ' ' + result.error)
        } else {
            toast.success(t.login.success)
        }
        setIsPending(false)
    }

    return (
        <Card className="w-full max-w-sm mx-auto mt-12">
            <CardHeader className="flex flex-col items-center">
                <img src="/intersnack-logo.png" alt="Intersnack Logo" className="h-12 object-contain mb-4" />
                <CardTitle className="text-2xl">{t.login.title}</CardTitle>
                <CardDescription>{t.login.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">{t.login.emailLabel}</Label>
                        <Input id="email" name="email" type="email" placeholder={t.login.emailPlaceholder} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">{t.login.passwordLabel}</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? t.login.loggingIn : t.login.loginBtn}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
