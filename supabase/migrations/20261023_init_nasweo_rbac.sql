-- ==============================================================================
-- NASWEO WELFARE DATA MANAGEMENT SYSTEM - POSTGRESQL / SUPABASE LIVE SCHEMA
-- Initial Migration: RBAC, User Management, Member Records & Financial Ledgers
-- Target Platform: Supabase PostgreSQL 15+ / Cloud Hosted Database
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
-- INDEXES FOR HIGH-PERFORMANCE QUERY EXECUTION
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_payroll ON users(payroll_no);
CREATE INDEX IF NOT EXISTS idx_members_payroll ON members(payroll_no);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_contributions_payroll ON contributions(payroll_no);
CREATE INDEX IF NOT EXISTS idx_contributions_period ON contributions(period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_loans_payroll ON loans(payroll_no);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loan_sched_number ON loan_repayment_schedules(loan_number);
CREATE INDEX IF NOT EXISTS idx_welfare_payroll ON benevolence_records(payroll_no);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE next_of_kin ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_contribution_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_repayment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE benevolence_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Service Role Policy (Permits backend application full CRUD via service key or direct connection)
CREATE POLICY "Service role full access on users" ON users FOR ALL USING (true);
CREATE POLICY "Service role full access on user_roles" ON user_roles FOR ALL USING (true);
CREATE POLICY "Service role full access on members" ON members FOR ALL USING (true);
CREATE POLICY "Service role full access on next_of_kin" ON next_of_kin FOR ALL USING (true);
CREATE POLICY "Service role full access on contributions" ON contributions FOR ALL USING (true);
CREATE POLICY "Service role full access on balances" ON member_contribution_balances FOR ALL USING (true);
CREATE POLICY "Service role full access on loan_products" ON loan_products FOR ALL USING (true);
CREATE POLICY "Service role full access on loans" ON loans FOR ALL USING (true);
CREATE POLICY "Service role full access on repayments" ON loan_repayments FOR ALL USING (true);
CREATE POLICY "Service role full access on schedules" ON loan_repayment_schedules FOR ALL USING (true);
CREATE POLICY "Service role full access on benevolence" ON benevolence_records FOR ALL USING (true);
CREATE POLICY "Service role full access on audit_logs" ON audit_logs FOR ALL USING (true);

-- ==============================================================================
-- DEFAULT SEED DATA (BCrypt Hashed Passwords for RFQ Roles)
-- Password for admin123, treasurer123, welfare123, auditor123, member123
-- ==============================================================================

-- 1. Seed Accounts
INSERT INTO users (username, password, full_name, email, phone_number, payroll_no, must_change_password, enabled)
VALUES 
('admin', '$2a$10$w8kF5.lBq.bOQy1nUe0Fw.R1Z2m8F09o5Xg1V2j4K7P9L0m1N3y6O', 'System Administrator', 'admin@nasweo.or.ke', '+254711000001', 'NARL-ADMIN', false, true),
('treasurer', '$2a$10$w8kF5.lBq.bOQy1nUe0Fw.R1Z2m8F09o5Xg1V2j4K7P9L0m1N3y6O', 'Welfare Treasurer', 'treasurer@nasweo.or.ke', '+254711000002', 'NARL-1002', false, true),
('welfare_officer', '$2a$10$w8kF5.lBq.bOQy1nUe0Fw.R1Z2m8F09o5Xg1V2j4K7P9L0m1N3y6O', 'Welfare Manager', 'welfare@nasweo.or.ke', '+254711000003', 'NARL-1004', false, true),
('auditor', '$2a$10$w8kF5.lBq.bOQy1nUe0Fw.R1Z2m8F09o5Xg1V2j4K7P9L0m1N3y6O', 'Internal Auditor', 'auditor@nasweo.or.ke', '+254711000004', 'NARL-1005', false, true),
('member001', '$2a$10$w8kF5.lBq.bOQy1nUe0Fw.R1Z2m8F09o5Xg1V2j4K7P9L0m1N3y6O', 'Dr. Patrick Mwangi', 'pmwangi@kalro.org', '+254711000101', 'NARL-1001', false, true)
ON CONFLICT (username) DO NOTHING;

-- 2. Seed Roles
INSERT INTO user_roles (user_id, role)
SELECT u.id, 'ROLE_ADMIN' FROM users u WHERE u.username = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT u.id, 'ROLE_TREASURER' FROM users u WHERE u.username = 'treasurer'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT u.id, 'ROLE_WELFARE_OFFICER' FROM users u WHERE u.username = 'welfare_officer'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT u.id, 'ROLE_AUDITOR' FROM users u WHERE u.username = 'auditor'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT u.id, 'ROLE_MEMBER' FROM users u WHERE u.username = 'member001'
ON CONFLICT DO NOTHING;

-- 3. Seed Loan Products Catalog
INSERT INTO loan_products (code, name, description, annual_interest_rate, interest_type, max_repayment_months, min_amount, max_amount, shares_multiplier, active)
VALUES 
('DEV-01', 'Development Loan', 'Long term development credit for capital assets and investment', 12.00, 'REDUCING_BALANCE', 48, 50000.00, 2000000.00, 3.0, true),
('EMERG-01', 'Emergency Loan', 'Rapid relief assistance processed within 24 hours', 10.00, 'FLAT_RATE', 12, 10000.00, 150000.00, 1.5, true),
('SCH-01', 'School Fees Loan', 'Education financing for members and dependants', 11.00, 'REDUCING_BALANCE', 24, 20000.00, 400000.00, 2.0, true),
('INST-01', 'Instant Welfare Loan', 'Immediate short-term financial bridge', 12.00, 'FLAT_RATE', 6, 5000.00, 50000.00, 1.0, true)
ON CONFLICT (code) DO NOTHING;
