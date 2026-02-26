'use server'

import { cookies } from 'next/headers'

export async function getLocale(): Promise<'vi' | 'en'> {
    const cookieStore = await cookies()
    const localeValue = cookieStore.get('NEXT_LOCALE')?.value
    if (localeValue === 'en') return 'en'
    return 'vi'
}
