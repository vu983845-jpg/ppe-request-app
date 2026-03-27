'use server'

import { createClient } from '@/lib/supabase/server'

export type DashboardStats = {
    totalRequestsThisMonth: number;
    pendingApprovalsAmount: number;
    totalCostThisMonth: number;
    lostBrokenCountThisMonth: number;
    requestsByDepartment: { name: string; value: number }[];
    requestsByCategory: { name: string; value: number }[];
}

export async function getDashboardStats(role: 'HR' | 'PLANT_MANAGER' | 'DEPT_HEAD' | 'HSE' | 'ADMIN', departmentId?: string): Promise<DashboardStats> {
    const supabase = await createClient()
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

    // 1. Base Query for the current month
    let query = supabase
        .from('ppe_requests')
        .select(`
            id, 
            quantity, 
            status, 
            request_type, 
            created_at,
            departments(name), 
            ppe_master(name, unit_price)
        `)
        .gte('created_at', firstDayOfMonth)
        .lte('created_at', lastDayOfMonth)

    // Filter by department if Dept Head
    if (role === 'DEPT_HEAD' && departmentId) {
        query = query.eq('requester_department_id', departmentId)
    }

    const { data: requests, error } = await query

    if (error || !requests) {
        console.error('Error fetching dashboard stats:', error)
        return {
            totalRequestsThisMonth: 0,
            pendingApprovalsAmount: 0,
            totalCostThisMonth: 0,
            lostBrokenCountThisMonth: 0,
            requestsByDepartment: [],
            requestsByCategory: []
        }
    }

    // 2. Calculate KPIs
    let totalRequestsThisMonth = requests.length
    let pendingApprovalsAmount = 0
    let totalCostThisMonth = 0
    let lostBrokenCountThisMonth = 0

    const deptMap: Record<string, number> = {}
    const categoryMap: Record<string, number> = {}

    requests.forEach(req => {
        // Pending logic based on role context.
        // For general KPI, we can count anything not COMPLETED/ISSUED/REJECTED as pending in the pipeline.
        if (req.status.startsWith('PENDING_') || req.status === 'READY_FOR_PICKUP') {
            // But if we want to be specific to the viewer's role:
            if (role === 'DEPT_HEAD' && req.status === 'PENDING_DEPT') pendingApprovalsAmount++;
            if (role === 'HSE' && req.status === 'PENDING_HSE') pendingApprovalsAmount++;
            if (role === 'PLANT_MANAGER' && req.status === 'PENDING_PLANT_MANAGER') pendingApprovalsAmount++;
            if (role === 'HR' && req.status === 'PENDING_HR') pendingApprovalsAmount++;
            // Admin sees all pending
            if (role === 'ADMIN' && req.status !== 'COMPLETED' && req.status !== 'APPROVED_ISSUED' && !req.status.startsWith('REJECTED')) {
                pendingApprovalsAmount++;
            }
        }

        if (req.request_type === 'LOST_BROKEN') {
            lostBrokenCountThisMonth++;
        }

        // Cost Calculation
        const ppe = (req.ppe_master as any)
        const unitPrice = ppe?.unit_price || 0
        totalCostThisMonth += (req.quantity * unitPrice)

        // Aggregations for charts
        const dept = (req.departments as any)
        const deptName = dept?.name || 'Unknown'
        deptMap[deptName] = (deptMap[deptName] || 0) + req.quantity

        const itemName = ppe?.name || 'Unknown'
        categoryMap[itemName] = (categoryMap[itemName] || 0) + req.quantity
    })

    const requestsByDepartment = Object.entries(deptMap).map(([name, value]) => ({ name, value }))
    const requestsByCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))

    return {
        totalRequestsThisMonth,
        pendingApprovalsAmount,
        totalCostThisMonth,
        lostBrokenCountThisMonth,
        requestsByDepartment,
        requestsByCategory
    }
}
