import { createClient } from '@/lib/supabase/server'
import { RequestForm } from './form'
import { Department, PPEMaster } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function RequestPage() {
    const supabase = await createClient()

    const { data: departments } = await supabase
        .from('departments')
        .select('*')
        .order('name')

    const { data: ppes } = await supabase
        .from('ppe_master')
        .select('*')
        .eq('active', true)
        .order('name')

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">PPE Request Form</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Fill out this public form to request PPE. No login required.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Request Details</CardTitle>
                        <CardDescription>All fields with * are required.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RequestForm
                            departments={(departments as Department[]) || []}
                            ppes={(ppes as PPEMaster[]) || []}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
