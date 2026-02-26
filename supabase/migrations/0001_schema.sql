-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('HSE', 'DEPT_HEAD', 'ADMIN');
CREATE TYPE request_status AS ENUM (
    'PENDING_DEPT',
    'REJECTED_BY_DEPT',
    'PENDING_HSE',
    'REJECTED_BY_HSE',
    'APPROVED_ISSUED'
);

-- 2. TABLES
-- departments
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    dept_head_user_id UUID,
    dept_head_email TEXT NOT NULL
);

-- app_users (mapping with supabase auth)
CREATE TABLE public.app_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role user_role NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL
);

-- Resolve circular dependency between departments and app_users
ALTER TABLE public.departments ADD CONSTRAINT fk_dept_head
    FOREIGN KEY (dept_head_user_id) REFERENCES public.app_users(id) ON DELETE SET NULL;

-- ppe_master
CREATE TABLE public.ppe_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    stock_quantity NUMERIC NOT NULL DEFAULT 0,
    minimum_stock NUMERIC NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true
);

-- ppe_requests
CREATE TABLE public.ppe_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_name TEXT NOT NULL,
    requester_emp_code TEXT,
    requester_email TEXT,
    requester_department_id UUID NOT NULL REFERENCES public.departments(id),
    requester_location TEXT,
    ppe_id UUID NOT NULL REFERENCES public.ppe_master(id),
    quantity NUMERIC NOT NULL CHECK (quantity > 0),
    note TEXT,
    attachment_url TEXT,
    status request_status NOT NULL DEFAULT 'PENDING_DEPT',
    dept_decision_note TEXT,
    hse_decision_note TEXT,
    dept_approved_at TIMESTAMPTZ,
    dept_approved_by UUID REFERENCES public.app_users(id),
    hse_approved_at TIMESTAMPTZ,
    hse_approved_by UUID REFERENCES public.app_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ppe_issue_log
CREATE TABLE public.ppe_issue_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.ppe_requests(id),
    issued_quantity NUMERIC NOT NULL,
    unit_price_at_issue NUMERIC NOT NULL,
    total_cost NUMERIC NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    issued_by UUID NOT NULL REFERENCES public.app_users(id)
);

-- yearly_budget
CREATE TABLE public.yearly_budget (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year INT NOT NULL UNIQUE,
    total_budget NUMERIC NOT NULL DEFAULT 0,
    used_budget NUMERIC NOT NULL DEFAULT 0
);

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX idx_ppe_requests_status ON public.ppe_requests(status);
CREATE INDEX idx_ppe_requests_department ON public.ppe_requests(requester_department_id);
CREATE INDEX idx_idx_ppe_master_stock ON public.ppe_master(stock_quantity);
