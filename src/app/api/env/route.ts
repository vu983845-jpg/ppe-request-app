import { NextResponse } from 'next/server'

export async function GET() {
    const envVars = Object.keys(process.env).filter(k =>
        k.includes('DB') ||
        k.includes('DATABASE') ||
        k.includes('SUPABASE') ||
        k.includes('POSTGRES') ||
        k.includes('URL')
    ).reduce((acc: any, k) => {
        acc[k] = process.env[k]
        return acc
    }, {})

    return NextResponse.json(envVars)
}
