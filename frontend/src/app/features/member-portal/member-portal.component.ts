import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MemberService } from '../../core/services/member.service';
import { ContributionService } from '../../core/services/contribution.service';
import { LoanService } from '../../core/services/loan.service';
import { WelfareService } from '../../core/services/welfare.service';
import { Member } from '../../core/models/member.model';
import { MemberContributionBalance, MemberStatement } from '../../core/models/contribution.model';
import { Loan, LoanProduct, AmortizationSchedule } from '../../core/models/loan.model';
import { BenevolenceRecord } from '../../core/models/welfare.model';

@Component({
  selector: 'app-member-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 font-sans animate-page">
      
      <!-- Member Official ID Card Header -->
      <div class="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover-lift transition-all duration-200">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Self-Service Docket</span>
            <span class="text-slate-300">•</span>
            <span class="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
              NARL Active Member
            </span>
          </div>
          <h1 class="text-xl font-bold tracking-tight text-slate-900">{{ member?.firstName }} {{ member?.lastName }}</h1>
          <p class="text-xs text-slate-600 mt-0.5 font-mono">
            Payroll: <span class="font-bold text-slate-900">{{ member?.payrollNo || currentUser?.payrollNo }}</span> • {{ member?.designation || 'Agricultural Research Officer' }} • {{ member?.department || 'Crop Science' }}
          </p>
        </div>

        <div class="bg-slate-50 p-3.5 rounded border border-slate-200 text-left md:text-right">
          <p class="text-[10px] font-mono uppercase text-slate-500 font-semibold">Statutory Retirement</p>
          <p class="text-sm font-bold text-slate-900 font-mono mt-0.5">{{ member?.retirementDate || 'Calculated automatically' }}</p>
          <p class="text-[11px] text-amber-800 font-mono font-medium">({{ member?.yearsToRetirement || 0 }} years remaining • {{ member?.employmentCategory === 'SCIENTIST' ? 'Scientist at 65y' : 'Staff at 60y' }})</p>
        </div>
      </div>

      <!-- Financial Holdings Strip -->
      <div class="bg-white border border-slate-200 rounded-lg shadow-2xs divide-y sm:divide-y-0 sm:divide-x divide-slate-200 grid grid-cols-1 sm:grid-cols-3">
        <div class="p-5 hover-lift transition-all duration-200">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Accumulated Shares</span>
            <span class="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">Borrowing Base</span>
          </div>
          <div class="text-2xl font-bold tracking-tight text-slate-900 font-mono mt-2">
            KES {{ (balance?.totalShares || 0) | number:'1.2-2' }}
          </div>
          <p class="text-[11px] text-slate-500 mt-1">Multiplies up to 3x loan ceiling eligibility.</p>
        </div>

        <div class="p-5 hover-lift transition-all duration-200">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Benevolence Reserve</span>
            <span class="text-[10px] font-mono text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-medium">Contributed</span>
          </div>
          <div class="text-2xl font-bold tracking-tight text-slate-900 font-mono mt-2">
            KES {{ (balance?.totalBenevolence || 0) | number:'1.2-2' }}
          </div>
          <p class="text-[11px] text-slate-500 mt-1">Non-withdrawable mutual welfare entitlement pool.</p>
        </div>

        <div class="p-5 hover-lift transition-all duration-200">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Active Loan Exposure</span>
            <span class="text-[10px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-medium">{{ loans.length }} Facility</span>
          </div>
          <div class="text-2xl font-bold tracking-tight text-slate-900 font-mono mt-2">
            KES {{ getTotalActiveLoanBalance() | number:'1.2-2' }}
          </div>
          <p class="text-[11px] text-slate-500 mt-1">Total outstanding amortized credit obligation.</p>
        </div>
      </div>

      <!-- Active Loans & Repayment Schedules Section -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div class="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-900">Active Credit Facilities &amp; Schedules</h2>
          <span class="text-[11px] font-mono text-slate-500">{{ loans.length }} active loan(s)</span>
        </div>

        <div class="p-5">
          <div *ngIf="loans.length > 0; else noLoans" class="space-y-3">
            <div *ngFor="let l of loans" class="p-4 rounded border border-slate-200 bg-slate-50/50">
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                <div class="flex items-center gap-2">
                  <span class="font-mono font-bold text-xs text-slate-900">{{ l.loanNumber }}</span>
                  <span class="text-slate-300">•</span>
                  <span class="font-semibold text-xs text-slate-700">{{ l.productName }}</span>
                </div>
                <span [ngClass]="l.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'" class="px-2 py-0.5 rounded text-[10px] font-mono font-bold border">
                  {{ l.status }}
                </span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <p class="text-[11px] text-slate-500">Principal Disbursed</p>
                  <p class="font-bold text-slate-900 font-mono">KES {{ l.principalAmount | number:'1.2-2' }}</p>
                </div>
                <div>
                  <p class="text-[11px] text-slate-500">Monthly Checkoff Deduction</p>
                  <p class="font-bold text-emerald-800 font-mono">KES {{ l.monthlyPayment | number:'1.2-2' }}</p>
                </div>
                <div>
                  <p class="text-[11px] text-slate-500">Outstanding Balance</p>
                  <p class="font-bold text-slate-900 font-mono">KES {{ l.outstandingBalance | number:'1.2-2' }}</p>
                </div>
                <div>
                  <p class="text-[11px] text-slate-500">Final Maturity Date</p>
                  <p class="font-medium text-slate-700 font-mono">{{ l.maturityDate }}</p>
                </div>
              </div>

              <div class="mt-3 pt-3 border-t border-slate-200 flex justify-end">
                <button (click)="viewSchedule(l.loanNumber)" class="text-xs font-mono font-medium text-emerald-800 hover:text-emerald-950 flex items-center gap-1">
                  <span>View Monthly Amortization Schedule</span> &rarr;
                </button>
              </div>
            </div>
          </div>

          <ng-template #noLoans>
            <div class="py-6 text-center text-slate-500 text-xs font-mono">
              You currently have no active credit obligations.
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Benevolence Grants & Occasion Assistance History -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div class="px-5 py-3.5 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 class="text-sm font-bold text-slate-900">Benevolence &amp; Welfare Assistance Record</h2>
            <p class="text-[11px] text-slate-500">Mutual aid disbursed for illness, bereavement, and special occasions</p>
          </div>
          <span class="text-[11px] font-mono text-slate-500">{{ welfareRecords.length }} record(s)</span>
        </div>

        <div *ngIf="welfareRecords.length > 0; else noWelfare" class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 font-mono text-[10px]">
              <tr>
                <th class="py-2.5 px-4">Event Date</th>
                <th class="py-2.5 px-4">Category</th>
                <th class="py-2.5 px-4">Beneficiary</th>
                <th class="py-2.5 px-4">Voucher No</th>
                <th class="py-2.5 px-4 text-right">Amount (KES)</th>
                <th class="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let rec of welfareRecords" class="hover:bg-slate-50/60 transition">
                <td class="py-2.5 px-4 font-mono text-slate-600">{{ rec.eventDate }}</td>
                <td class="py-2.5 px-4 font-semibold text-slate-900">{{ rec.benevolenceType }}</td>
                <td class="py-2.5 px-4 text-slate-700">{{ rec.beneficiaryName }} ({{ rec.relationship }})</td>
                <td class="py-2.5 px-4 font-mono text-slate-500">{{ rec.voucherReference || '—' }}</td>
                <td class="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{{ rec.amountProvided | number:'1.2-2' }}</td>
                <td class="py-2.5 px-4 text-center">
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {{ rec.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #noWelfare>
          <div class="py-6 text-center text-slate-500 text-xs font-mono">
            No benevolence or welfare claims recorded for your account.
          </div>
        </ng-template>
      </div>

      <!-- Contribution Statement Section -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div class="px-5 py-3.5 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 class="text-sm font-bold text-slate-900">Member Official Contribution Statement</h2>
            <p class="text-[11px] text-slate-500">Monthly employer payroll deductions and direct receipts</p>
          </div>
          <div class="flex items-center gap-2">
            <button (click)="printStatement()" class="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono text-xs border border-slate-200 transition">
              Print Official Statement
            </button>
            <button (click)="loadStatement()" class="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono text-xs border border-slate-200 transition">
              Refresh
            </button>
          </div>
        </div>

        <div *ngIf="statement" class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 font-mono text-[10px]">
              <tr>
                <th class="py-2.5 px-4">Effective Date</th>
                <th class="py-2.5 px-4">Particulars / Source</th>
                <th class="py-2.5 px-4 text-right">Shares (KES)</th>
                <th class="py-2.5 px-4 text-right">Benevolence (KES)</th>
                <th class="py-2.5 px-4 text-right">Closing Cumulative</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-normal">
              <tr *ngFor="let item of statement.items" class="hover:bg-slate-50/60 transition">
                <td class="py-2.5 px-4 font-mono text-slate-600">{{ item.date }}</td>
                <td class="py-2.5 px-4 font-medium text-slate-900">{{ item.description }}</td>
                <td class="py-2.5 px-4 text-right font-mono font-medium text-emerald-800">{{ item.shareAmount | number:'1.2-2' }}</td>
                <td class="py-2.5 px-4 text-right font-mono font-medium text-blue-800">{{ item.benevolenceAmount | number:'1.2-2' }}</td>
                <td class="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{{ (item.runningShareBalance + item.runningBenevolenceBalance) | number:'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Schedule Modal for Self Service -->
      <div *ngIf="showScheduleModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <div class="bg-white rounded-lg shadow-lg border border-slate-200 max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 text-xs">
          <div class="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Loan Amortization Breakdown</h3>
              <p class="text-[11px] text-slate-500 font-mono">Contractual monthly repayment obligations</p>
            </div>
            <button (click)="showScheduleModal = false" class="text-slate-400 hover:text-slate-700 font-mono">✕</button>
          </div>

          <div class="mt-4 max-h-72 overflow-y-auto border border-slate-200 rounded">
            <table class="w-full text-left font-mono">
              <thead class="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200 text-[11px]">
                <tr>
                  <th class="py-2 px-3">#</th>
                  <th class="py-2 px-3">Due Date</th>
                  <th class="py-2 px-3 text-right">Principal</th>
                  <th class="py-2 px-3 text-right">Interest</th>
                  <th class="py-2 px-3 text-right">Total Due</th>
                  <th class="py-2 px-3 text-right">Balance</th>
                  <th class="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-[11px]">
                <tr *ngFor="let s of currentSchedule" class="hover:bg-slate-50/60">
                  <td class="py-1.5 px-3 font-sans font-bold text-slate-700">{{ s.installmentNo }}</td>
                  <td class="py-1.5 px-3 text-slate-600">{{ s.dueDate }}</td>
                  <td class="py-1.5 px-3 text-right text-emerald-800">{{ s.principalAmount | number:'1.2-2' }}</td>
                  <td class="py-1.5 px-3 text-right text-slate-700">{{ s.interestAmount | number:'1.2-2' }}</td>
                  <td class="py-1.5 px-3 text-right font-bold text-slate-900">{{ s.totalInstallment | number:'1.2-2' }}</td>
                  <td class="py-1.5 px-3 text-right font-bold text-slate-900">{{ s.closingBalance | number:'1.2-2' }}</td>
                  <td class="py-1.5 px-3 text-center">
                    <span [ngClass]="s.status === 'PAID' ? 'text-emerald-700 font-bold' : 'text-slate-400'">{{ s.status }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  `
})
export class MemberPortalComponent implements OnInit {
  member: Member | null = null;
  balance: MemberContributionBalance | null = null;
  loans: Loan[] = [];
  statement: MemberStatement | null = null;
  welfareRecords: BenevolenceRecord[] = [];

  showScheduleModal = false;
  currentSchedule: any[] = [];

  constructor(
    private authService: AuthService,
    private memberService: MemberService,
    private contributionService: ContributionService,
    private loanService: LoanService,
    private welfareService: WelfareService
  ) {}

  get currentUser() {
    return this.authService.currentUser;
  }

  ngOnInit() {
    this.loadMemberData();
  }

  loadMemberData() {
    // Member data isolation: strictly derive identity from JWT and authenticated session
    this.memberService.getMyProfile().subscribe({
      next: res => { this.member = res.data; },
      error: () => {
        const payroll = this.currentUser?.payrollNo;
        if (payroll) {
          this.memberService.getMemberByPayroll(payroll).subscribe(res => {
            this.member = res.data;
          });
        }
      }
    });

    this.contributionService.getMyBalance().subscribe({
      next: res => { this.balance = res.data; },
      error: () => {
        const payroll = this.currentUser?.payrollNo;
        if (payroll) {
          this.contributionService.getMemberBalance(payroll).subscribe(res => {
            this.balance = res.data;
          });
        }
      }
    });

    this.loanService.getMyLoans().subscribe({
      next: res => { this.loans = res.data || []; },
      error: () => {
        const payroll = this.currentUser?.payrollNo;
        if (payroll) {
          this.loanService.getMemberLoans(payroll).subscribe(res => {
            this.loans = res.data || [];
          });
        }
      }
    });

    this.welfareService.getMyRecords().subscribe({
      next: res => { this.welfareRecords = res.data || []; },
      error: () => {
        const payroll = this.currentUser?.payrollNo;
        if (payroll) {
          this.welfareService.getMemberRecords(payroll).subscribe(res => {
            this.welfareRecords = res.data || [];
          });
        }
      }
    });

    this.loadStatement();
  }

  loadStatement() {
    this.contributionService.getMyStatement().subscribe({
      next: res => { this.statement = res.data; },
      error: () => {
        const payroll = this.currentUser?.payrollNo;
        if (payroll) {
          this.contributionService.getMemberStatement(payroll).subscribe(res => {
            this.statement = res.data;
          });
        }
      }
    });
  }

  getTotalActiveLoanBalance(): number {
    return this.loans
      .filter(l => l.status === 'ACTIVE')
      .reduce((acc, curr) => acc + (curr.outstandingBalance || 0), 0);
  }

  viewSchedule(loanNumber: string) {
    this.loanService.getLoanSchedule(loanNumber).subscribe(res => {
      this.currentSchedule = res.data;
      this.showScheduleModal = true;
    });
  }

  printStatement() {
    window.print();
  }
}
