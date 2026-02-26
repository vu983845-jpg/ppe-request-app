'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    const supabase = await createClient()

    // Authenticate user
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    // Get user role logic to redirect
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const { data: appUser } = await supabase
            .from('app_users')
            .select('role')
            .eq('auth_user_id', user.id)
            .single()

        if (appUser?.role === 'ADMIN') {
            redirect('/admin')
        } else if (appUser?.role === 'HSE') {
            redirect('/dashboard/hse')
        } else if (appUser?.role === 'DEPT_HEAD') {
            redirect('/dashboard/dept-head')
        } else {
            redirect('/')
        }
    }

    return { success: true }
}

export async function logoutAction() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
