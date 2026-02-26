export type Role = 'HSE' | 'DEPT_HEAD' | 'ADMIN'

export type RequestStatus =
    | 'PENDING_DEPT'
    | 'REJECTED_BY_DEPT'
    | 'PENDING_HSE'
    | 'REJECTED_BY_HSE'
    | 'APPROVED_ISSUED'

export interface Department {
    id: string
    name: string
    dept_head_user_id: string | null
    dept_head_email: string
}

export interface AppUser {
    id: string
    auth_user_id: string
    name: string
    email: string
    role: Role
    department_id: string | null
}

export interface PPEMaster {
    id: string
    name: string
    category: string
    unit: string
    unit_price: number
    stock_quantity: number
    minimum_stock: number
    active: boolean
}

export interface PperRequest {
    id: string
    requester_name: string
    requester_emp_code: string | null
    requester_email: string | null
    requester_department_id: string
    requester_location: string | null
    ppe_id: string
    quantity: number
    note: string | null
    attachment_url: string | null
    status: RequestStatus
    dept_decision_note: string | null
    hse_decision_note: string | null
    dept_approved_at: string | null
    dept_approved_by: string | null
    hse_approved_at: string | null
    hse_approved_by: string | null
    created_at: string

    // Joins (optional for typed responses)
    department?: Department
    ppe?: PPEMaster
    requester?: AppUser
    dept_approver?: AppUser
    hse_approver?: AppUser
}

export interface PpeIssueLog {
    id: string
    request_id: string
    issued_quantity: number
    unit_price_at_issue: number
    total_cost: number
    issued_at: string
    issued_by: string
}

export interface YearlyBudget {
    id: string
    year: number
    total_budget: number
    used_budget: number
}
