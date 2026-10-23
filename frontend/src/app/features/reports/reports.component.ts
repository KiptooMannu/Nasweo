import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemberService } from '../../core/services/member.service';
import { ContributionService } from '../../core/services/contribution.service';
import { LoanService } from '../../core/services/loan.service';
import { WelfareService } from '../../core/services/welfare.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-page">
      <!-- Institutional Report Masthead -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4 no-print">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Statutory Governance</span>
            <span class="text-slate-300">•</span>
            <span class="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
              RFQ Section 2.F Compliance Reporting
            </span>
          </div>
          <h1 class="text-xl font-bold text-slate-900 tracking-tight">Financial &amp; Operational Reports Workbench</h1>
          <p class="text-xs text-slate-600 mt-0.5">Audited registers, contribution schedules, loan portfolio exposure, arrears tracking &amp; benevolence statements.</p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="exportToCSV()" class="px-3 py-1.5 rounded bg-white hover:bg-slate-50 text-slate-700 font-mono text-xs border border-slate-300 shadow-2xs flex items-center gap-1.5 transition btn-press hover-lift">
            <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            <span>Export CSV</span>
          </button>
          <button (click)="printReport()" class="px-3 py-1.5 rounded bg-[#0F291E] hover:bg-[#1B4332] text-white font-mono text-xs shadow-2xs flex items-center gap-1.5 transition btn-press hover-lift">
            <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            <span>Print Official Report</span>
          </button>
        </div>
      </div>

      <!-- Print Letterhead (visible ONLY in @media print) -->
      <div class="hidden print-only mb-6 text-center border-b pb-4">
        <h2 class="text-xl font-bold uppercase tracking-wider text-black">National Agricultural Research Laboratories</h2>
        <h3 class="text-base font-semibold text-gray-800">NARL Staff Welfare Organization (NASWEO)</h3>
        <p class="text-xs text-gray-600 font-mono">P.O. Box 14733-00800, Nairobi, Kenya • Kabete Campus</p>
        <p class="text-xs font-mono font-bold mt-2 text-black">OFFICIAL STATUTORY AUDIT REPORT — {{ getActiveReportTitle() | uppercase }}</p>
        <p class="text-[10px] text-gray-500 font-mono">Generated: {{ reportDate }} • Fiscal Year 2026/27</p>
      </div>

      <!-- Report Type Selector Tabs (Horizontal Navigation) -->
      <div class="border-b border-slate-200 no-print overflow-x-auto custom-scrollbar">
        <div class="flex space-x-1 sm:space-x-2 min-w-max pb-1">
          <button (click)="activeTab = 'members'"
                  [ngClass]="activeTab === 'members' ? 'border-[#0F291E] text-[#0F291E] font-bold bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'"
                  class="py-2.5 px-3.5 border-b-2 text-xs font-medium rounded-t-lg transition flex items-center gap-2">
            <span>Member Register &amp; Radar</span>
            <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border">{{ members.length }}</span>
          </button>

          <button (click)="activeTab = 'contributions'"
                  [ngClass]="activeTab === 'contributions' ? 'border-[#0F291E] text-[#0F291E] font-bold bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'"
                  class="py-2.5 px-3.5 border-b-2 text-xs font-medium rounded-t-lg transition flex items-center gap-2">
            <span>Contributions &amp; Checkoff</span>
            <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border">{{ contributions.length }}</span>
          </button>

          <button (click)="activeTab = 'loans'"
                  [ngClass]="activeTab === 'loans' ? 'border-[#0F291E] text-[#0F291E] font-bold bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'"
                  class="py-2.5 px-3.5 border-b-2 text-xs font-medium rounded-t-lg transition flex items-center gap-2">
            <span>Loan Portfolio &amp; Arrears</span>
            <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border">{{ loans.length }}</span>
          </button>

          <button (click)="activeTab = 'welfare'"
                  [ngClass]="activeTab === 'welfare' ? 'border-[#0F291E] text-[#0F291E] font-bold bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'"
                  class="py-2.5 px-3.5 border-b-2 text-xs font-medium rounded-t-lg transition flex items-center gap-2">
            <span>Benevolence &amp; Grants</span>
            <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border">{{ welfareRecords.length }}</span>
          </button>

          <button (click)="activeTab = 'statements'"
                  [ngClass]="activeTab === 'statements' ? 'border-[#0F291E] text-[#0F291E] font-bold bg-white' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'"
                  class="py-2.5 px-3.5 border-b-2 text-xs font-medium rounded-t-lg transition flex items-center gap-2">
            <span>Member Statements</span>
          </button>
        </div>
      </div>

      <!-- ==========================================
           TAB 1: MEMBER REGISTER & RETIREMENT RADAR
           ========================================== -->
      <div *ngIf="activeTab === 'members'" class="space-y-4">
        <!-- Summary Strip -->
        <div class="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <p class="text-[10px] font-mono uppercase text-slate-500 font-semibold">Total Roster</p>
            <p class="text-lg font-bold font-mono text-slate-900">{{ members.length }} Members</p>
          </div>
          <div>
            <p class="text-[10px] font-mono uppercase text-slate-500 font-semibold">Research Scientists (65y)</p>
            <p class="text-lg font-bold font-mono text-emerald-800">{{ getScientistCount() }} Staff</p>
          </div>
          <div>
            <p class="text-[10px] font-mono uppercase text-slate-500 font-semibold">Non-Scientists (60y)</p>
            <p class="text-lg font-bold font-mono text-slate-800">{{ getNonScientistCount() }} Staff</p>
          </div>
          <div>
            <p class="text-[10px] font-mono uppercase text-slate-500 font-semibold">Retiring &le; 24 Months</p>
            <p class="text-lg font-bold font-mono text-amber-800">{{ getUpcomingRetirementsCount() }} Due</p>
          </div>
        </div>

        <!-- Table -->
        <div class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs" id="report-table-members">
              <thead class="bg-slate-50/80 border-b border-slate-200 font-mono text-slate-600">
                <tr>
                  <th class="py-2.5 px-4">Payroll</th>
                  <th class="py-2.5 px-4">Member Name</th>
                  <th class="py-2.5 px-4">National ID</th>
                  <th class="py-2.5 px-4">Cadre</th>
                  <th class="py-2.5 px-4">Division / Dept</th>
                  <th class="py-2.5 px-4">Date of Birth</th>
                  <th class="py-2.5 px-4">Age</th>
                  <th class="py-2.5 px-4">Retirement Date</th>
                  <th class="py-2.5 px-4 text-right">Years Left</th>
                  <th class="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-normal">
                <tr *ngFor="let m of members" class="hover:bg-slate-50/60">
                  <td class="py-2.5 px-4 font-mono font-bold text-slate-900">{{ m.payrollNo }}</td>
                  <td class="py-2.5 px-4 font-medium text-slate-900">{{ m.firstName }} {{ m.lastName }}</td>
                  <td class="py-2.5 px-4 font-mono text-slate-600">{{ m.nationalId }}</td>
                  <td class="py-2.5 px-4">
                    <span [ngClass]="m.employmentCategory === 'SCIENTIST' ? 'bg-purple-50 text-purple-800 border-purple-200' : 'bg-slate-100 text-slate-700 border-slate-200'" class="px-1.5 py-0.5 rounded text-[10px] font-mono border">
                      {{ m.employmentCategory === 'SCIENTIST' ? 'Scientist (65y)' : 'Staff (60y)' }}
                    </span>
                  </td>
                  <td class="py-2.5 px-4 text-slate-700">{{ m.department || 'General Services' }}</td>
                  <td class="py-2.5 px-4 font-mono text-slate-600">{{ m.dob }}</td>
                  <td class="py-2.5 px-4 font-mono text-slate-700">{{ m.currentAge }}y</td>
                  <td class="py-2.5 px-4 font-mono font-medium text-slate-900">{{ m.retirementDate }}</td>
                  <td class="py-2.5 px-4 text-right font-mono font-bold text-amber-900">{{ m.yearsToRetirement }}y</td>
                  <td class="py-2.5 px-4 text-center">
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {{ m.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ==========================================
           TAB 2: CONTRIBUTIONS & CHECKOFF REPORT
           ========================================== -->
      <div *ngIf="activeTab === 'contributions'" class="space-y-4">
        <!-- Financial Metric Strip -->
        <div class="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <p class="text-[10px] font-mono uppercase text-slate-500 font-semibold">Total Share Deposits</p>
            <p class="text-lg font-bold font-mono text-slate-900">KES {{ (financialSummary?.totalSharesAllTime || 0) | number:'1.2-2' }}</p>
          </div>
          <div>
            <p class="text-[10px] font-mono uppercase text-slate-500 font-semibold">Total Benevolence Pool</p>
            <p class="text-lg font-bold font-mono text-blue-900">KES {{ (financialSummary?.totalBenevolenceAllTime || 0) | number:'1.2-2' }}</p>
          </div>
          <div>
            <p class="text-[10px] font-mono uppercase text-slate-500 font-semibold">Cumulative Net Inflow</p>
            <p class="text-lg font-bold font-mono text-emerald-800">KES {{ (financialSummary?.grandTotalContributions || 0) | number:'1.2-2' }}</p>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs" id="report-table-contributions">
              <thead class="bg-slate-50/80 border-b border-slate-200 font-mono text-slate-600">
                <tr>
                  <th class="py-2.5 px-4">Posting Date</th>
                  <th class="py-2.5 px-4">Payroll</th>
                  <th class="py-2.5 px-4">Member Name</th>
                  <th class="py-2.5 px-4">Period</th>
                  <th class="py-2.5 px-4 text-right">Shares (KES)</th>
                  <th class="py-2.5 px-4 text-right">Benevolence (KES)</th>
                  <th class="py-2.5 px-4 text-right">Total (KES)</th>
                  <th class="py-2.5 px-4">Channel</th>
                  <th class="py-2.5 px-4">Reference</th>
                  <th class="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-normal">
                <tr *ngFor="let c of contributions" class="hover:bg-slate-50/60">
                  <td class="py-2.5 px-4 font-mono text-slate-600">{{ c.paymentDate }}</td>
                  <td class="py-2.5 px-4 font-mono font-bold text-slate-900">{{ c.payrollNo }}</td>
                  <td class="py-2.5 px-4 font-medium text-slate-900">{{ c.memberName || '-' }}</td>
                  <td class="py-2.5 px-4 font-mono">{{ c.periodMonth }}/{{ c.periodYear }}</td>
                  <td class="py-2.5 px-4 text-right font-mono text-emerald-800">{{ c.shareAmount | number:'1.2-2' }}</td>
                  <td class="py-2.5 px-4 text-right font-mono text-blue-800">{{ c.benevolenceAmount | number:'1.2-2' }}</td>
                  <td class="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{{ c.totalAmount | number:'1.2-2' }}</td>
                  <td class="py-2.5 px-4 font-mono text-[11px]">{{ c.paymentMode }}</td>
                  <td class="py-2.5 px-4 font-mono text-[11px] text-slate-500">{{ c.referenceNo || '—' }}</td>
                  <td class="py-2.5 px-4 text-center font-mono">
                    <span class="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {{ c.reconciled ? 'Reconciled' : 'Pending' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ==========================================
           TAB 3: LOAN PORTFOLIO & ARREARS REPORT
           ========================================== -->
      <div *ngIf="activeTab === 'loans'" class="space-y-4">
        <!-- Summary Cards -->
        <div class="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <p class="text-[10px] font-mono uppercase text-slate-500 font-semibold">Total Loan Portfolio</p>
            <p class="text-lg font-bold font-mono text-slate-900">KES {{ (loanAnalytics?.totalOutstandingBalance || 0) | number:'1.2-2' }}</p>
          </div>
          <div>
            <p class="text-[10px] font-mono uppercase text-slate-500 font-semibold">Active Loan Count</p>
            <p class="text-lg font-bold font-mono text-emerald-800">{{ loanAnalytics?.activeLoansCount || 0 }} Loans</p>
          </div>
          <div>
            <p class="text-[10px] font-mono uppercase text-slate-500 font-semibold">Principal Disbursed</p>
            <p class="text-lg font-bold font-mono text-slate-900">KES {{ (loanAnalytics?.totalPrincipalDisbursed || 0) | number:'1.2-2' }}</p>
          </div>
          <div>
            <p class="text-[10px] font-mono uppercase text-slate-500 font-semibold">Overdue / Arrears</p>
            <p class="text-lg font-bold font-mono text-rose-800">{{ overdueLoans.length }} In Arrears</p>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs" id="report-table-loans">
              <thead class="bg-slate-50/80 border-b border-slate-200 font-mono text-slate-600">
                <tr>
                  <th class="py-2.5 px-4">Loan No</th>
                  <th class="py-2.5 px-4">Borrower / Payroll</th>
                  <th class="py-2.5 px-4">Product</th>
                  <th class="py-2.5 px-4 text-right">Principal (KES)</th>
                  <th class="py-2.5 px-4 text-right">Monthly Installment</th>
                  <th class="py-2.5 px-4 text-right">Total Repayable</th>
                  <th class="py-2.5 px-4 text-right">Outstanding (KES)</th>
                  <th class="py-2.5 px-4">Maturity</th>
                  <th class="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-normal">
                <tr *ngFor="let l of loans" class="hover:bg-slate-50/60">
                  <td class="py-2.5 px-4 font-mono font-bold text-slate-900">{{ l.loanNumber }}</td>
                  <td class="py-2.5 px-4">
                    <div class="font-medium text-slate-900">{{ l.memberName || l.payrollNo }}</div>
                    <div class="text-[10px] text-slate-400 font-mono">{{ l.payrollNo }}</div>
                  </td>
                  <td class="py-2.5 px-4">{{ l.productName }}</td>
                  <td class="py-2.5 px-4 text-right font-mono">{{ l.principalAmount | number:'1.2-2' }}</td>
                  <td class="py-2.5 px-4 text-right font-mono text-emerald-800 font-medium">{{ l.monthlyPayment | number:'1.2-2' }}</td>
                  <td class="py-2.5 px-4 text-right font-mono">{{ l.totalRepayable | number:'1.2-2' }}</td>
                  <td class="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{{ l.outstandingBalance | number:'1.2-2' }}</td>
                  <td class="py-2.5 px-4 font-mono text-slate-600">{{ l.maturityDate }}</td>
                  <td class="py-2.5 px-4 text-center">
                    <span [ngClass]="{
                      'bg-emerald-50 text-emerald-800 border-emerald-200': l.status === 'ACTIVE',
                      'bg-slate-100 text-slate-700 border-slate-200': l.status === 'CLOSED',
                      'bg-blue-50 text-blue-800 border-blue-200': l.status === 'TOPPED_UP',
                      'bg-rose-50 text-rose-800 border-rose-200': l.status === 'DEFAULTED'
                    }" class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border">
                      {{ l.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ==========================================
           TAB 4: BENEVOLENCE & GIFTS REPORT
           ========================================== -->
      <div *ngIf="activeTab === 'welfare'" class="space-y-4">
        <div class="bg-white border border-slate-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <p class="text-[10px] font-mono uppercase text-slate-500 font-semibold">Total Cumulative Benevolence</p>
            <p class="text-lg font-bold font-mono text-slate-900">KES {{ (welfareSummary?.totalDisbursedAllTime || 0) | number:'1.2-2' }}</p>
          </div>
          <div>
            <p class="text-[10px] font-mono uppercase text-slate-500 font-semibold">Total Verified Incidents</p>
            <p class="text-lg font-bold font-mono text-emerald-800">{{ welfareSummary?.totalClaimsCount || 0 }} Cases</p>
          </div>
          <div>
            <p class="text-[10px] font-mono uppercase text-slate-500 font-semibold">Current FY Expenditure</p>
            <p class="text-lg font-bold font-mono text-slate-800">KES {{ (welfareSummary?.totalDisbursedThisYear || 0) | number:'1.2-2' }}</p>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs" id="report-table-welfare">
              <thead class="bg-slate-50/80 border-b border-slate-200 font-mono text-slate-600">
                <tr>
                  <th class="py-2.5 px-4">Event Date</th>
                  <th class="py-2.5 px-4">Member Payroll</th>
                  <th class="py-2.5 px-4">Category</th>
                  <th class="py-2.5 px-4">Beneficiary</th>
                  <th class="py-2.5 px-4">Particulars</th>
                  <th class="py-2.5 px-4 text-right">Amount (KES)</th>
                  <th class="py-2.5 px-4">Voucher No</th>
                  <th class="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-normal">
                <tr *ngFor="let w of welfareRecords" class="hover:bg-slate-50/60">
                  <td class="py-2.5 px-4 font-mono text-slate-600">{{ w.eventDate }}</td>
                  <td class="py-2.5 px-4 font-mono font-bold text-slate-900">{{ w.payrollNo }}</td>
                  <td class="py-2.5 px-4 font-mono text-[11px]">{{ formatCategory(w.benevolenceType) }}</td>
                  <td class="py-2.5 px-4">
                    <div class="font-medium text-slate-900">{{ w.beneficiaryName }}</div>
                    <div class="text-[10px] text-slate-400 font-mono">Rel: {{ w.relationship }}</div>
                  </td>
                  <td class="py-2.5 px-4 text-slate-600 max-w-xs truncate">{{ w.occasionDescription }}</td>
                  <td class="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{{ w.amountProvided | number:'1.2-2' }}</td>
                  <td class="py-2.5 px-4 font-mono text-[11px] text-slate-500">{{ w.voucherReference || '—' }}</td>
                  <td class="py-2.5 px-4 text-center font-mono">
                    <span class="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {{ w.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ==========================================
           TAB 5: INDIVIDUAL MEMBER STATEMENTS
           ========================================== -->
      <div *ngIf="activeTab === 'statements'" class="space-y-4">
        <div class="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-center gap-3 no-print">
          <input [(ngModel)]="statementPayroll" placeholder="Enter Staff Payroll No (e.g. NARL-1001)..."
                 class="px-3 py-2 rounded bg-slate-50 border border-slate-300 font-mono text-xs w-full sm:w-72 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E]">
          <button (click)="generateStatement()" class="px-4 py-2 rounded bg-[#0F291E] hover:bg-[#1B4332] text-white font-mono text-xs font-medium transition">
            Generate Member Statement
          </button>
        </div>

        <div *ngIf="statement" class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Member Official Financial Statement</h3>
              <p class="text-[11px] font-mono text-slate-600">Payroll Identifier: <span class="font-bold text-slate-900">{{ statement.payrollNo }}</span> • Period: {{ statement.fromDate }} to {{ statement.toDate }}</p>
            </div>
            <div class="flex gap-4 text-xs font-mono">
              <div>Opening Shares: <span class="font-bold text-slate-800">KES {{ statement.openingShareBalance | number:'1.2-2' }}</span></div>
              <div>Closing Cumulative: <span class="font-bold text-emerald-800">KES {{ statement.closingShareBalance | number:'1.2-2' }}</span></div>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs" id="report-table-statement">
              <thead class="bg-slate-50/80 border-b border-slate-200 font-mono text-slate-600">
                <tr>
                  <th class="py-2.5 px-4">Transaction Date</th>
                  <th class="py-2.5 px-4">Particulars / Source</th>
                  <th class="py-2.5 px-4 text-right">Shares Deposit (KES)</th>
                  <th class="py-2.5 px-4 text-right">Benevolence (KES)</th>
                  <th class="py-2.5 px-4 text-right">Running Total Balance</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-normal">
                <tr *ngFor="let item of statement.items" class="hover:bg-slate-50/60">
                  <td class="py-2.5 px-4 font-mono text-slate-600">{{ item.date }}</td>
                  <td class="py-2.5 px-4 font-medium text-slate-900">{{ item.description }}</td>
                  <td class="py-2.5 px-4 text-right font-mono text-emerald-800 font-medium">{{ item.shareAmount | number:'1.2-2' }}</td>
                  <td class="py-2.5 px-4 text-right font-mono text-blue-800 font-medium">{{ item.benevolenceAmount | number:'1.2-2' }}</td>
                  <td class="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{{ (item.runningShareBalance + item.runningBenevolenceBalance) | number:'1.2-2' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  `
})
export class ReportsComponent implements OnInit {
  activeTab: 'members' | 'contributions' | 'loans' | 'welfare' | 'statements' = 'members';
  reportDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  members: any[] = [];
  contributions: any[] = [];
  loans: any[] = [];
  overdueLoans: any[] = [];
  welfareRecords: any[] = [];
  financialSummary: any = null;
  loanAnalytics: any = null;
  welfareSummary: any = null;

  statementPayroll = 'NARL-1001';
  statement: any = null;

  constructor(
    private memberService: MemberService,
    private contributionService: ContributionService,
    private loanService: LoanService,
    private welfareService: WelfareService
  ) {}

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.memberService.searchMembers('', '', '', 0, 300).subscribe(res => {
      this.members = res.data.content || [];
    });

    this.contributionService.searchContributions(undefined, undefined, undefined, undefined, 0, 300).subscribe(res => {
      this.contributions = res.data.content || [];
    });

    this.contributionService.getFinancialSummary().subscribe(res => {
      this.financialSummary = res.data;
    });

    this.loanService.searchLoans(undefined, undefined, undefined, 0, 300).subscribe(res => {
      this.loans = res.data.content || [];
    });

    this.loanService.getOverdueLoans().subscribe(res => {
      this.overdueLoans = res.data || [];
    });

    this.loanService.getLoanAnalytics().subscribe(res => {
      this.loanAnalytics = res.data;
    });

    this.welfareService.searchRecords('', undefined, undefined, 0, 300).subscribe(res => {
      this.welfareRecords = res.data.content || [];
    });

    this.welfareService.getExpenditureSummary().subscribe(res => {
      this.welfareSummary = res.data;
    });

    this.generateStatement();
  }

  generateStatement() {
    if (!this.statementPayroll) return;
    this.contributionService.getMemberStatement(this.statementPayroll).subscribe(res => {
      this.statement = res.data;
    });
  }

  getActiveReportTitle(): string {
    switch (this.activeTab) {
      case 'members': return 'Member Register and Statutory Retirement Schedule';
      case 'contributions': return 'Monthly & Annual Contribution Audit Report';
      case 'loans': return 'Loan Portfolio, Amortization and Arrears Report';
      case 'welfare': return 'Benevolence and Special Occasion Gifts Ledger';
      case 'statements': return 'Individual Member Welfare Financial Statement';
    }
  }

  getScientistCount(): number {
    return this.members.filter(m => m.employmentCategory === 'SCIENTIST').length;
  }

  getNonScientistCount(): number {
    return this.members.filter(m => m.employmentCategory !== 'SCIENTIST').length;
  }

  getUpcomingRetirementsCount(): number {
    return this.members.filter(m => (m.yearsToRetirement || 10) <= 2).length;
  }

  formatCategory(type: string): string {
    return (type || '').replace(/_/g, ' ');
  }

  printReport() {
    window.print();
  }

  exportToCSV() {
    let tableId = 'report-table-' + this.activeTab;
    if (this.activeTab === 'statements') tableId = 'report-table-statement';
    const table = document.getElementById(tableId) as HTMLTableElement;
    if (!table) return;

    let csv = [];
    const rows = table.querySelectorAll('tr');
    for (let i = 0; i < rows.length; i++) {
      const row = [];
      const cols = rows[i].querySelectorAll('th, td');
      for (let j = 0; j < cols.length; j++) {
        let text = (cols[j] as HTMLElement).innerText.replace(/"/g, '""').replace(/\n/g, ' ').trim();
        row.push('"' + text + '"');
      }
      csv.push(row.join(','));
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + csv.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NASWEO_${this.activeTab}_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
