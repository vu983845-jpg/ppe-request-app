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
        const { data: appUser, error: auError } = await supabase
            .from('app_users')
            .select('role')
            .eq('auth_user_id', user.id)
            .single()

        if (auError) {
            console.error("Role Fetch Error:", auError)
            return { error: `Role Fetch Error: ${auError.message}` }
        }

        console.log("Logged in user UUID:", user.id)
        console.log("Found appUser record:", appUser)

        if (appUser?.role === 'ADMIN') {
            redirect('/admin')
        } else if (appUser?.role === 'HSE') {
            redirect('/dashboard/hse')
        } else if (appUser?.role === 'DEPT_HEAD') {
            redirect('/dashboard/dept-head')
        } else if (appUser?.role === 'PLANT_MANAGER') {
            redirect('/dashboard/plant-manager')
        } else if (appUser?.role === 'HR') {
            redirect('/dashboard/hr')
        } else {
            return { error: `No valid role found. Mapped role is: "${appUser?.role}". Expected "PLANT_MANAGER".` }
        }
    }

    return { success: true }
}

export async function logoutAction() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
