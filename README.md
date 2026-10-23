# NARL STAFF WELFARE ORGANIZATION (NASWEO)
## DATA MANAGEMENT SYSTEM — TECHNICAL ARCHITECTURE & IMPLEMENTATION

This repository contains the complete enterprise source code for the **NASWEO Welfare Data Management System** developed in response to the **Request for Quotation (RFQ)** for the **NARL Staff Welfare Organization**.

The solution provides a secure, cloud-ready, mobile-responsive data management platform designed for ~300 members with high horizontal scalability for future expansion.

---

## Technical Stack & Architecture

- **Backend**: Java 17+, Spring Boot 3.2.x Microservices Architecture
  - `api-gateway` (Port `8080`): Reactive Spring Cloud Gateway with routing, JWT verification, and CORS controls.
  - `auth-service` (Port `8081`): Spring Security, JWT token issuance, User management, and immutable Audit Trail Logging.
  - `member-service` (Port `8082`): Member biodata, Next-of-Kin management, and automatic retirement date calculation based on employment category (**Scientists at 65**, **Non-scientists at 60**).
  - `contribution-service` (Port `8083`): Monthly share and benevolence tracking, Excel bulk checkoff importation (Apache POI), reconciliation of direct bank / M-Pesa receipts, and member statements.
  - `loan-service` (Port `8084`): Multiple loan products, reducing-balance / flat amortization schedule engine, loan top-ups with settlement deduction calculation, and arrears/defaulters tracking.
  - `welfare-service` (Port `8085`): Benevolence assistance (member illness, bereavement, dependants) and approved special occasions gifts with category analytics.
- **Frontend**: Angular 17+ (Standalone Components), Tailwind CSS 3.4+, HTML5 / Responsive UI.

---

## Pre-Configured Seed Users & RFQ Roles

When services initialize, the database automatically provisions user accounts corresponding to the RFQ security roles:

| Role | Username | Password | Purpose / Scope |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | `admin123` | System configuration, user account provisioning, system parameters |
| **Treasurer / Finance Officer** | `treasurer` | `treasurer123` | Checkoff upload, reconciliation, loan approval, financial statements |
| **Welfare / Management Officer** | `welfare_officer` | `welfare123` | Benevolence claims, gift registers, member biodata updates |
| **Internal Auditor** | `auditor` | `auditor123` | Read-only compliance inspection, verification of audit trails |
| **Ordinary Member** | `member001` | `member123` | Self-service portal: personal shares, loan amortization, statement download |

---

## Key Functional Modules

### 1. Member Management (Retirement Rule)
- Automatic calculation of retirement date:
  $$\text{Retirement Date} = \text{DOB} + (\text{Category} == \text{SCIENTIST} ? 65 : 60)\text{ years}$$
- Next of kin registry with allocation percentages.
- Retirement radar detecting members due to retire within 12, 24, or 36 months.

### 2. Contributions & Excel Checkoff Import
- Handles monthly employer checkoff in Excel format (`.xlsx` / `.xls`).
- Apache POI parser validates rows, identifies missing payroll numbers, detects duplicates in the same file or already-posted periods, and reports errors.
- Real-time reconciliation of M-Pesa codes and bank slips.
- Member statement generator with opening balance, period movements, and closing balance.

### 3. Loan Amortization Engine & Top-Up Processing
- **Reducing Balance Formula**:
  $$M = P \times \frac{r(1+r)^n}{(1+r)^n - 1}$$
  where $r = \frac{\text{Annual Rate}}{12 \times 100}$
- Generates full month-by-month repayment schedules (Principal, Interest, Total Installment, Closing Balance).
- **Loan Top-Up Engine**:
  - Automatically fetches the outstanding balance of existing active loans.
  - Calculates settlement deduction: $\text{Net Disbursed} = \text{New Principal} - \text{Existing Settlement}$.
  - Automatically transitions old loan to `TOPPED_UP` and establishes the consolidated loan.

### 4. Benevolence & Gifts
- Captures assistance categories: Member Illness/Hospitalization, Death of Member, Death of Dependant, Retirement Send-off Gifts, Wedding Congratulatory Gifts.
- Tracks beneficiary name, relationship, occasion narrative, payment mode, and voucher reference.

### 5. Statutory Reports & Statements Workbench (RFQ Scope 2.F)
- Dedicated comprehensive reports module (`/reports`) providing:
  - **Member Register & Retirement Horizon Report**: Full personnel roster, scientists retiring at 65, non-scientists at 60, next of kin allocation stats.
  - **Monthly & Annual Contribution Schedules**: Share capital deposits, benevolence pool growth, checkoff reconciliation verification.
  - **Loan Portfolio & Arrears/Defaulters Report**: Outstanding principal/interest, loan aging, and arrears recovery radar.
  - **Principal and Interest Reports**: Product-by-product revenue distribution (Development, Emergency, School Fees, Instant relief).
  - **Benevolence & Occasion Grants Register**: Claims breakdown by category, beneficiaries, and payment voucher references.
  - **Individual Member Statements**: Interactive lookup by payroll with opening balance, movements, and closing balance.
  - **Export to CSV & Print Official Report**: Browser-native CSV generator and `@media print` audit formatting with official NARL letterhead.

### 6. Interactive Navbar Profile & Responsive Sidenav
- **Top Navbar Profile Flyout**:
  - Interactive clickable profile on top navbar displaying user credentials, staff payroll number, assigned roles, security clearance, and session encryption stats.
  - Integrated **RFQ Role Switcher** enabling instant evaluation across all 5 RFQ roles (Admin, Treasurer, Welfare Officer, Auditor, Member).
- **Responsive Sidenav & Media Queries**:
  - Mobile off-canvas drawer with smooth slide animation (`transform -translate-x-full` to `translate-x-0`) and backdrop overlay.
  - Desktop collapsible state (`w-64` to `w-20` compact mode) with animated indicator bars and micro-interactions.
  - Media queries tested across mobile (360px–640px), tablet (768px–1024px), and desktop (1440px+).

---

## Running the Services

### Backend (Maven)
In the `backend` directory:
```bash
# Build the entire multi-module project
mvn clean install

# Run the microservices (in separate terminal windows or as background processes):
mvn -pl auth-service spring-boot:run
mvn -pl member-service spring-boot:run
mvn -pl contribution-service spring-boot:run
mvn -pl loan-service spring-boot:run
mvn -pl welfare-service spring-boot:run
mvn -pl api-gateway spring-boot:run
```

### Frontend (Angular + Tailwind CSS)
In the `frontend` directory:
```bash
# Install node dependencies
npm install

# Start development server
npm start
# Open http://localhost:4200 in your browser
```

---

## RFQ Technical Architecture & Quotation Response Summary

1. **Architecture Recommendation**:
   - Modern RESTful microservices decoupled via an API Gateway.
   - Allows independent scaling, straightforward database backup isolation, and integration with employer checkoff systems.
2. **Hosting Environment**:
   - Cloud VM (Ubuntu LTS or AWS / Azure / DigitalOcean) or on-premise server at NARL Kabete.
   - Docker containerization supported.
3. **Data Backup & Recovery**:
   - Automated nightly database dumps (PostgreSQL `pg_dump`) with S3/offsite replication.
   - Point-in-time recovery enabled.
4. **Warranty & Support**:
   - 6-month post-commissioning warranty covering defect resolution and stability monitoring.
   - Service Level Agreement (SLA) for ongoing updates and staff training.
