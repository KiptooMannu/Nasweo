import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MemberService } from '../../core/services/member.service';
import { ContributionService } from '../../core/services/contribution.service';
import { LoanService } from '../../core/services/loan.service';
import { WelfareService } from '../../core/services/welfare.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Institutional Masthead & Primary Actions -->
      <div class="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-200 gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Executive Governance</span>
            <span class="text-slate-300">•</span>
            <span class="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
              Live RFQ Demonstration Environment
            </span>
          </div>
          <h1 class="text-xl font-bold tracking-tight text-slate-900">
            Welfare Financial Position &amp; Operational Radar
          </h1>
          <p class="text-xs text-slate-600 mt-0.5">
            Real-time balance sheet of member shares, amortized loan portfolios, checkoff reconciliations, and statutory retirement horizons.
          </p>
        </div>

        <!-- Quick Institutional Action Buttons -->
        <div class="flex items-center gap-2">
          <a routerLink="/contributions" class="px-3 py-1.5 rounded bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-300 shadow-2xs transition inline-flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            <span>Import Checkoff Excel</span>
          </a>
          <a routerLink="/loans" class="px-3 py-1.5 rounded bg-[#0F291E] hover:bg-[#1B4332] text-white font-medium text-xs shadow-2xs transition inline-flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>Issue Loan Schedule</span>
          </a>
        </div>
      </div>

      <!-- Financial Ledger Overview Strip (Unified Financial Panel) -->
      <div class="bg-white border border-slate-200 rounded-lg shadow-2xs divide-y lg:divide-y-0 lg:divide-x divide-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        
        <!-- Ledger Metric 1: Member Shares Capital -->
        <div class="p-5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Member Shares Pool</span>
            <span class="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Equity</span>
          </div>
          <div class="mt-2.5">
            <div class="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              KES {{ (financialSummary?.totalSharesAllTime || 0) | number:'1.2-2' }}
            </div>
            <p class="text-[11px] text-slate-500 mt-1">
              Cumulative member share contributions across all payroll checkoffs.
            </p>
          </div>
        </div>

        <!-- Ledger Metric 2: Benevolence Pool -->
        <div class="p-5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Benevolence Reserve</span>
            <span class="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Reserve</span>
          </div>
          <div class="mt-2.5">
            <div class="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              KES {{ (financialSummary?.totalBenevolenceAllTime || 0) | number:'1.2-2' }}
            </div>
            <p class="text-[11px] text-slate-500 mt-1">
              Disbursed to date: <span class="font-medium text-slate-700 font-mono">KES {{ (welfareSummary?.totalDisbursedAllTime || 0) | number:'1.2-2' }}</span>
            </p>
          </div>
        </div>

        <!-- Ledger Metric 3: Outstanding Loan Portfolio -->
        <div class="p-5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Active Loan Portfolio</span>
            <span class="text-[10px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Asset</span>
          </div>
          <div class="mt-2.5">
            <div class="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              KES {{ (loanAnalytics?.totalOutstandingBalance || 0) | number:'1.2-2' }}
            </div>
            <p class="text-[11px] text-slate-500 mt-1">
              Active facilities: <span class="font-medium text-slate-800 font-mono">{{ loanAnalytics?.activeLoansCount || 0 }}</span> active amortization schedules.
            </p>
          </div>
        </div>

        <!-- Ledger Metric 4: Organization Membership -->
        <div class="p-5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Staff Membership</span>
            <span class="text-[10px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">~300 Cap</span>
          </div>
          <div class="mt-2.5">
            <div class="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {{ memberStats?.totalMembers || 0 }} <span class="text-xs font-normal text-slate-500">Active</span>
            </div>
            <div class="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
              <span class="text-emerald-700 font-semibold font-mono">{{ memberStats?.scientists || 0 }} Scientists</span>
              <span>•</span>
              <span class="font-mono">{{ memberStats?.nonScientists || 0 }} Staff</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Mid-Section: Retirement Horizon Radar & Benevolence Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Statutory Retirement Radar (2 cols) -->
        <div class="lg:col-span-2 bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 class="text-sm font-bold text-slate-900">Statutory Retirement Horizon Radar</h2>
              <p class="text-[11px] text-slate-500">
                Automatic statutory retirement rule: <span class="font-semibold text-slate-700">Scientists at 65</span>, <span class="font-semibold text-slate-700">Non-Scientists at 60</span>.
              </p>
            </div>
            <span class="px-2 py-0.5 text-[11px] font-mono font-medium rounded bg-amber-50 text-amber-800 border border-amber-200">
              {{ upcomingRetirements?.length || 0 }} Due &le; 24 Months
            </span>
          </div>

          <div *ngIf="upcomingRetirements && upcomingRetirements.length > 0; else noRetirements" class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th class="py-2.5 px-4 font-mono">Staff Member</th>
                  <th class="py-2.5 px-4 font-mono">Payroll</th>
                  <th class="py-2.5 px-4 font-mono">Cadre</th>
                  <th class="py-2.5 px-4 font-mono">Current Age</th>
                  <th class="py-2.5 px-4 font-mono">Retirement Date</th>
                  <th class="py-2.5 px-4 text-right font-mono">Horizon</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-normal">
                <tr *ngFor="let m of upcomingRetirements" class="hover:bg-slate-50/60 transition">
                  <td class="py-3 px-4 font-medium text-slate-900">{{ m.firstName }} {{ m.lastName }}</td>
                  <td class="py-3 px-4 font-mono text-slate-500 text-[11px]">{{ m.payrollNo }}</td>
                  <td class="py-3 px-4">
                    <span [ngClass]="m.employmentCategory === 'SCIENTIST' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-700 border-slate-200'" class="px-1.5 py-0.5 rounded text-[10px] font-mono border">
                      {{ m.employmentCategory === 'SCIENTIST' ? 'Scientist (65y)' : 'Staff (60y)' }}
                    </span>
                  </td>
                  <td class="py-3 px-4 font-mono text-slate-700">{{ m.currentAge }}y</td>
                  <td class="py-3 px-4 font-mono font-medium text-slate-800">{{ m.retirementDate }}</td>
                  <td class="py-3 px-4 text-right">
                    <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
                      {{ m.yearsToRetirement }}y remaining
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <ng-template #noRetirements>
            <div class="py-8 text-center text-slate-500 text-xs font-mono">
              All staff members currently have more than 24 months before mandatory statutory retirement.
            </div>
          </ng-template>

          <div class="px-5 py-3 bg-slate-50/70 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between font-mono">
            <span>Retirement radar recalculates automatically upon DOB updates.</span>
            <a routerLink="/members" class="text-emerald-800 hover:text-emerald-950 font-semibold underline">
              View All Members &rarr;
            </a>
          </div>
        </div>

        <!-- Benevolence & Assistance Breakdown (1 col) -->
        <div class="bg-white border border-slate-200 rounded-lg shadow-2xs flex flex-col justify-between">
          <div>
            <div class="px-5 py-4 border-b border-slate-200">
              <h2 class="text-sm font-bold text-slate-900">Benevolence Claims &amp; Assistance</h2>
              <p class="text-[11px] text-slate-500">Distribution by constitutional support category</p>
            </div>

            <div class="p-5 space-y-3">
              <div *ngFor="let cat of welfareSummary?.categoryBreakdowns" class="p-3 rounded border border-slate-200 bg-slate-50/50">
                <div class="flex justify-between text-xs font-medium text-slate-800 mb-1">
                  <span class="font-semibold">{{ formatCategoryName(cat.category) }}</span>
                  <span class="font-mono font-bold text-slate-900">KES {{ cat.totalAmount | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>{{ cat.count }} case(s) disbursed</span>
                  <span class="text-emerald-700">Verified</span>
                </div>
              </div>
            </div>
          </div>

          <div class="px-5 py-3 bg-slate-50/70 border-t border-slate-200">
            <a routerLink="/welfare" class="text-xs font-medium text-emerald-800 hover:text-emerald-950 flex items-center justify-center gap-1 font-mono">
              Open Benevolence Register &rarr;
            </a>
          </div>
        </div>

      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  memberStats: any = null;
  financialSummary: any = null;
  loanAnalytics: any = null;
  welfareSummary: any = null;
  upcomingRetirements: any[] = [];

  constructor(
    private memberService: MemberService,
    private contributionService: ContributionService,
    private loanService: LoanService,
    private welfareService: WelfareService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.memberService.getMembershipStatistics().subscribe(res => this.memberStats = res.data);
    this.memberService.getUpcomingRetirements(24).subscribe(res => this.upcomingRetirements = res.data);
    this.contributionService.getFinancialSummary().subscribe(res => this.financialSummary = res.data);
    this.loanService.getLoanAnalytics().subscribe(res => this.loanAnalytics = res.data);
    this.welfareService.getExpenditureSummary().subscribe(res => this.welfareSummary = res.data);
  }

  formatCategoryName(cat: string): string {
    return cat.replace(/_/g, ' ');
  }
}
