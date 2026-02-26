'use client'

import { useState } from 'react'
import { loginAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function LoginForm() {
    const [isPending, setIsPending] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsPending(true)
        const result = await loginAction(formData)

        if (result?.error) {
            toast.error(result.error)
        }
        setIsPending(false)
    }

    return (
        <Card className="w-full max-w-sm mx-auto mt-12">
            <CardHeader className="flex flex-col items-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Intersnack_logo.svg/1024px-Intersnack_logo.svg.png" alt="Intersnack Logo" className="h-12 object-contain mb-4" />
                <CardTitle className="text-2xl">Staff Login</CardTitle>
                <CardDescription>Enter your email below to login.</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? 'Logging in...' : 'Log in'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
