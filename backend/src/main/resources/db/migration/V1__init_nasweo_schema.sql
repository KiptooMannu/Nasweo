-- ==============================================================================
-- NASWEO WELFARE DATA MANAGEMENT SYSTEM - POSTGRESQL / SUPABASE LIVE SCHEMA
-- Initial Migration: RBAC, User Management, Member Records & Financial Ledgers
-- ==============================================================================

-- 1. USERS & AUTHENTICATION TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(50),
    payroll_no VARCHAR(50) UNIQUE,
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 2. USER ROLES JUNCTION TABLE
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role)
);

-- 3. MEMBERS REGISTRY TABLE (Scientist at 65, Non-Scientist at 60)
CREATE TABLE IF NOT EXISTS members (
    id BIGSERIAL PRIMARY KEY,
    payroll_no VARCHAR(50) UNIQUE NOT NULL,
    national_id VARCHAR(50),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    other_names VARCHAR(100),
    email VARCHAR(255),
    phone_number VARCHAR(50),
    dob DATE NOT NULL,
    employment_category VARCHAR(50) NOT NULL,
    employment_date DATE NOT NULL,
    retirement_date DATE NOT NULL,
    department VARCHAR(100),
    designation VARCHAR(100),
    station VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 4. NEXT OF KIN REGISTRY TABLE
CREATE TABLE IF NOT EXISTS next_of_kin (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    phone_number VARCHAR(50),
    national_id VARCHAR(50),
    allocation_percentage DOUBLE PRECISION NOT NULL DEFAULT 100.0
);

-- 5. MONTHLY CONTRIBUTIONS & CHECKOFF LEDGER TABLE
CREATE TABLE IF NOT EXISTS contributions (
    id BIGSERIAL PRIMARY KEY,
    payroll_no VARCHAR(50) NOT NULL,
    member_name VARCHAR(255),
    period_month INT NOT NULL,
    period_year INT NOT NULL,
    share_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    benevolence_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'EMPLOYER_CHECKOFF',
    reference_no VARCHAR(100),
    payment_date DATE NOT NULL,
    reconciled BOOLEAN NOT NULL DEFAULT FALSE,
    recorded_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. CUMULATIVE MEMBER CONTRIBUTION BALANCES TABLE
CREATE TABLE IF NOT EXISTS member_contribution_balances (
    id BIGSERIAL PRIMARY KEY,
    payroll_no VARCHAR(50) UNIQUE NOT NULL,
    total_shares NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_benevolence NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    cumulative_total NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    last_contribution_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. LOAN PRODUCTS CATALOG TABLE
CREATE TABLE IF NOT EXISTS loan_products (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    annual_interest_rate NUMERIC(6,2) NOT NULL,
    interest_type VARCHAR(50) NOT NULL,
    max_repayment_months INT NOT NULL,
    min_amount NUMERIC(15,2) NOT NULL,
    max_amount NUMERIC(15,2) NOT NULL,
    shares_multiplier NUMERIC(6,2) NOT NULL DEFAULT 3.0,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 8. LOANS FACILITY TABLE
CREATE TABLE IF NOT EXISTS loans (
    id BIGSERIAL PRIMARY KEY,
    loan_number VARCHAR(100) UNIQUE NOT NULL,
    payroll_no VARCHAR(50) NOT NULL,
    member_name VARCHAR(255),
    product_code VARCHAR(50) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    principal_amount NUMERIC(15,2) NOT NULL,
    annual_interest_rate NUMERIC(6,2) NOT NULL,
    repayment_months INT NOT NULL,
    monthly_payment NUMERIC(15,2) NOT NULL,
    total_interest NUMERIC(15,2) NOT NULL,
    total_repayable NUMERIC(15,2) NOT NULL,
    outstanding_balance NUMERIC(15,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    disbursed_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    top_up_from_loan_number VARCHAR(100),
    top_up_settlement_amount NUMERIC(15,2),
    approved_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 9. LOAN REPAYMENT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS loan_repayments (
    id BIGSERIAL PRIMARY KEY,
    loan_number VARCHAR(100) NOT NULL,
    payroll_no VARCHAR(50) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    principal_portion NUMERIC(15,2) NOT NULL,
    interest_portion NUMERIC(15,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_mode VARCHAR(50) NOT NULL,
    reference_no VARCHAR(100),
    received_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. LOAN REPAYMENT SCHEDULES (AMORTIZATION) TABLE
CREATE TABLE IF NOT EXISTS loan_repayment_schedules (
    id BIGSERIAL PRIMARY KEY,
    loan_number VARCHAR(100) NOT NULL,
    installment_no INT NOT NULL,
    due_date DATE NOT NULL,
    principal_amount NUMERIC(15,2) NOT NULL,
    interest_amount NUMERIC(15,2) NOT NULL,
    total_installment NUMERIC(15,2) NOT NULL,
    closing_balance NUMERIC(15,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    paid_date DATE
);

-- 11. BENEVOLENCE & SPECIAL OCCASIONS GIFTS TABLE
CREATE TABLE IF NOT EXISTS benevolence_records (
    id BIGSERIAL PRIMARY KEY,
    payroll_no VARCHAR(50) NOT NULL,
    member_name VARCHAR(255) NOT NULL,
    benevolence_type VARCHAR(50) NOT NULL,
    beneficiary_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    occasion_description TEXT,
    amount_provided NUMERIC(15,2) NOT NULL,
    event_date DATE NOT NULL,
    disbursed_date DATE NOT NULL,
    payment_mode VARCHAR(50) NOT NULL,
    voucher_reference VARCHAR(100),
    approved_by VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'DISBURSED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. IMMUTABLE SECURITY AUDIT TRAIL TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100),
    entity_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_payroll ON users(payroll_no);
CREATE INDEX IF NOT EXISTS idx_members_payroll ON members(payroll_no);
CREATE INDEX IF NOT EXISTS idx_contributions_payroll ON contributions(payroll_no);
CREATE INDEX IF NOT EXISTS idx_loans_payroll ON loans(payroll_no);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
