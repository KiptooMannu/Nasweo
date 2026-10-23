import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContributionService } from '../../core/services/contribution.service';
import { Contribution, MemberStatement, CheckoffImportResult } from '../../core/models/contribution.model';

@Component({
  selector: 'app-contributions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-page">
      <!-- Header Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Treasury Docket</span>
            <span class="text-slate-300">•</span>
            <span class="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
              POI Excel Checkoff Engine
            </span>
          </div>
          <h1 class="text-xl font-bold text-slate-900 tracking-tight">Contributions &amp; Employer Checkoff</h1>
          <p class="text-xs text-slate-600 mt-0.5">Track monthly share capital, benevolence funds, Excel bulk import, and direct bank/M-Pesa reconciliations.</p>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="openStatementModal()" class="px-3 py-1.5 rounded bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-300 shadow-2xs flex items-center gap-1.5 transition btn-press hover-lift">
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>Member Statement</span>
          </button>
          <button (click)="openCheckoffModal()" class="px-3 py-1.5 rounded bg-[#0F291E] hover:bg-[#1B4332] text-white font-medium text-xs shadow-2xs flex items-center gap-1.5 transition btn-press hover-lift">
            <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            <span>Import Checkoff Excel</span>
          </button>
          <button (click)="openManualModal()" class="px-3 py-1.5 rounded bg-white hover:bg-slate-50 text-slate-800 font-medium text-xs border border-slate-300 shadow-2xs flex items-center gap-1.5 transition btn-press hover-lift">
            <svg class="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>Record Direct Receipt</span>
          </button>
        </div>
      </div>

      <!-- Financial Pool Summary Widgets -->
      <div class="bg-white border border-slate-200 rounded-lg shadow-2xs divide-y sm:divide-y-0 sm:divide-x divide-slate-200 grid grid-cols-1 sm:grid-cols-3">
        <div class="p-5 hover-lift transition-all duration-200">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Total Shares Pool</span>
            <span class="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Equity</span>
          </div>
          <div class="text-2xl font-bold tracking-tight text-slate-900 font-mono mt-2">
            KES {{ (financialSummary?.totalSharesAllTime || 0) | number:'1.2-2' }}
          </div>
          <p class="text-[11px] text-slate-500 mt-1">Total member withdrawable capital deposits.</p>
        </div>
        <div class="p-5 hover-lift transition-all duration-200">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Total Benevolence Pool</span>
            <span class="text-[10px] font-mono text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Reserve</span>
          </div>
          <div class="text-2xl font-bold tracking-tight text-slate-900 font-mono mt-2">
            KES {{ (financialSummary?.totalBenevolenceAllTime || 0) | number:'1.2-2' }}
          </div>
          <p class="text-[11px] text-slate-500 mt-1">Non-withdrawable emergency &amp; bereavement fund.</p>
        </div>
        <div class="p-5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Grand Total Receipts</span>
            <span class="text-[10px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Reconciled</span>
          </div>
          <div class="text-2xl font-bold tracking-tight text-emerald-800 font-mono mt-2">
            KES {{ (financialSummary?.grandTotalContributions || 0) | number:'1.2-2' }}
          </div>
          <p class="text-[11px] text-slate-500 mt-1">Combined cumulative inflow across all batches.</p>
        </div>
      </div>

      <!-- Search & Filter Filter -->
      <div class="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3 text-xs">
        <input [(ngModel)]="payrollFilter" (input)="onSearch()" placeholder="Search by payroll (e.g. NARL-1001)..." class="px-3 py-2 rounded bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E] w-full sm:w-64 font-mono">
        <select [(ngModel)]="yearFilter" (change)="onSearch()" class="px-3 py-2 rounded bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E] font-mono">
          <option [ngValue]="null">All Audit Years</option>
          <option [ngValue]="2026">2026</option>
          <option [ngValue]="2025">2025</option>
          <option [ngValue]="2024">2024</option>
        </select>
        <select [(ngModel)]="monthFilter" (change)="onSearch()" class="px-3 py-2 rounded bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E] font-mono">
          <option [ngValue]="null">All Months</option>
          <option *ngFor="let m of [1,2,3,4,5,6,7,8,9,10,11,12]" [ngValue]="m">Month {{ m }}</option>
        </select>
      </div>

      <!-- Contributions Table -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left text-xs min-w-[800px]">
            <thead class="bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 font-mono">
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
                <th class="py-2.5 px-4 text-right">Reconciliation</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-normal">
              <tr *ngFor="let c of contributions" class="hover:bg-slate-50/60 transition">
                <td class="py-2.5 px-4 font-mono text-slate-600">{{ c.paymentDate }}</td>
                <td class="py-2.5 px-4 font-mono font-bold text-slate-900">{{ c.payrollNo }}</td>
                <td class="py-2.5 px-4 font-medium text-slate-800">{{ c.memberName || '-' }}</td>
                <td class="py-2.5 px-4 font-mono">{{ c.periodMonth }}/{{ c.periodYear }}</td>
                <td class="py-2.5 px-4 text-right font-mono font-medium text-emerald-800">{{ c.shareAmount | number:'1.2-2' }}</td>
                <td class="py-2.5 px-4 text-right font-mono font-medium text-blue-800">{{ c.benevolenceAmount | number:'1.2-2' }}</td>
                <td class="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{{ c.totalAmount | number:'1.2-2' }}</td>
                <td class="py-2.5 px-4">
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {{ c.paymentMode }}
                  </span>
                </td>
                <td class="py-2.5 px-4 font-mono text-[11px] text-slate-500">{{ c.referenceNo || '—' }}</td>
                <td class="py-2.5 px-4 text-right">
                  <span *ngIf="c.reconciled" class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Verified
                  </span>
                  <button *ngIf="!c.reconciled" (click)="reconcile(c.id!)" class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-2xs">
                    Reconcile
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Employer Checkoff Import Wizard Modal -->
      <div *ngIf="showCheckoffModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Import Monthly Employer Checkoff Excel</h3>
            <button (click)="closeCheckoffModal()" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <div class="mt-4 space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Checkoff Month</label>
                <select [(ngModel)]="importMonth" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
                  <option *ngFor="let m of [1,2,3,4,5,6,7,8,9,10,11,12]" [ngValue]="m">Month {{ m }}</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Checkoff Year</label>
                <input [(ngModel)]="importYear" type="number" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
              </div>
            </div>

            <div class="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-emerald-500 transition">
              <input type="file" (change)="onCheckoffFileSelected($event)" accept=".xlsx, .xls" class="hidden" #checkoffInput>
              <p class="text-slate-700 font-bold mb-1">Upload Employer Checkoff Spreadsheet</p>
              <p class="text-[11px] text-slate-400 mb-3">Columns: PayrollNo, MemberName, ShareContribution, BenevolenceContribution</p>
              <button (click)="checkoffInput.click()" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700">Choose File</button>
              <p *ngIf="selectedCheckoffFile" class="mt-2 text-emerald-600 font-bold font-mono">{{ selectedCheckoffFile.name }}</p>
            </div>

            <div *ngIf="checkoffResult" class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <p class="font-bold text-slate-800">Checkoff Validation Summary:</p>
              <p class="text-emerald-700 font-medium">✓ Valid rows: {{ checkoffResult.successfulRows }}</p>
              <p class="text-slate-700">Total Shares: <span class="font-bold">KES {{ checkoffResult.totalSharesImported | number:'1.2-2' }}</span></p>
              <p class="text-slate-700">Total Benevolence: <span class="font-bold">KES {{ checkoffResult.totalBenevolenceImported | number:'1.2-2' }}</span></p>
              <p *ngIf="checkoffResult.duplicateRows > 0" class="text-amber-600">⚠ Duplicates detected: {{ checkoffResult.duplicateRows }}</p>
              <p *ngIf="checkoffResult.failedRows > 0" class="text-rose-600">✕ Erroneous rows: {{ checkoffResult.failedRows }}</p>
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button (click)="executeCheckoffImport(true)" [disabled]="!selectedCheckoffFile" class="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-semibold text-slate-700 disabled:opacity-50">Validate Only</button>
              <button (click)="executeCheckoffImport(false)" [disabled]="!selectedCheckoffFile" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white disabled:opacity-50">Post to Member Accounts</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Manual M-Pesa / Bank Slip Modal -->
      <div *ngIf="showManualModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Record Direct M-Pesa or Bank Slip</h3>
            <button (click)="closeManualModal()" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <form (ngSubmit)="saveManualContribution()" class="mt-4 space-y-3">
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Payroll Number *</label>
              <input [(ngModel)]="manualEntry.payrollNo" name="payrollNo" required placeholder="e.g. NARL-1001" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Period Month</label>
                <select [(ngModel)]="manualEntry.periodMonth" name="periodMonth" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
                  <option *ngFor="let m of [1,2,3,4,5,6,7,8,9,10,11,12]" [ngValue]="m">Month {{ m }}</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Period Year</label>
                <input [(ngModel)]="manualEntry.periodYear" name="periodYear" type="number" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Share Amount (KES)</label>
                <input [(ngModel)]="manualEntry.shareAmount" name="shareAmount" type="number" step="0.01" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
              </div>
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Benevolence (KES)</label>
                <input [(ngModel)]="manualEntry.benevolenceAmount" name="benevolenceAmount" type="number" step="0.01" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
              </div>
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Payment Channel</label>
              <select [(ngModel)]="manualEntry.paymentMode" name="paymentMode" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
                <option value="MPESA">M-Pesa Mobile Payment</option>
                <option value="DIRECT_BANK">Direct Bank Deposit / EFT</option>
                <option value="CASH">Cash Office Receipt</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Reference No (M-Pesa Code / Bank Slip)</label>
              <input [(ngModel)]="manualEntry.referenceNo" name="referenceNo" placeholder="e.g. QKH782199B" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" (click)="closeManualModal()" class="px-4 py-2 rounded-xl bg-slate-100 font-semibold text-slate-700">Cancel</button>
              <button type="submit" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white">Save Record</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Member Statement Modal -->
      <div *ngIf="showStatementModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 text-xs">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Member Contribution Statement Generator</h3>
            <button (click)="closeStatementModal()" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <div class="mt-4 flex gap-2 items-center">
            <input [(ngModel)]="statementPayroll" placeholder="Enter Member Payroll (e.g. NARL-1001)" class="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
            <button (click)="loadStatement()" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white">Generate</button>
          </div>

          <div *ngIf="statement" class="mt-4 space-y-3">
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-slate-800">Payroll: {{ statement.payrollNo }}</span>
                <span class="text-[11px] text-slate-500">Period: {{ statement.fromDate }} to {{ statement.toDate }}</span>
              </div>
              <div class="grid grid-cols-2 gap-4 text-slate-700 pt-2 border-t border-slate-200">
                <div>Opening Shares: <span class="font-bold">KES {{ statement.openingShareBalance | number:'1.2-2' }}</span></div>
                <div>Closing Shares: <span class="font-bold text-emerald-700">KES {{ statement.closingShareBalance | number:'1.2-2' }}</span></div>
              </div>
            </div>

            <div class="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
              <table class="w-full text-left">
                <thead class="bg-slate-100 text-slate-500 font-semibold">
                  <tr>
                    <th class="py-2 px-3">Date</th>
                    <th class="py-2 px-3">Description</th>
                    <th class="py-2 px-3">Share</th>
                    <th class="py-2 px-3">Benev</th>
                    <th class="py-2 px-3 text-right">Running Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr *ngFor="let item of statement.items">
                    <td class="py-2 px-3">{{ item.date }}</td>
                    <td class="py-2 px-3">{{ item.description }}</td>
                    <td class="py-2 px-3 font-semibold text-emerald-600">{{ item.shareAmount | number:'1.2-2' }}</td>
                    <td class="py-2 px-3 font-semibold text-blue-600">{{ item.benevolenceAmount | number:'1.2-2' }}</td>
                    <td class="py-2 px-3 text-right font-bold text-slate-900">{{ (item.runningShareBalance + item.runningBenevolenceBalance) | number:'1.2-2' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class ContributionsComponent implements OnInit {
  contributions: Contribution[] = [];
  financialSummary: any = null;
  payrollFilter = '';
  yearFilter: number | null = null;
  monthFilter: number | null = null;

  showCheckoffModal = false;
  showManualModal = false;
  showStatementModal = false;

  importMonth = new Date().getMonth() + 1;
  importYear = new Date().getFullYear();
  selectedCheckoffFile: File | null = null;
  checkoffResult: CheckoffImportResult | null = null;

  statementPayroll = 'NARL-1001';
  statement: MemberStatement | null = null;

  manualEntry: Partial<Contribution> = {
    payrollNo: '',
    periodMonth: new Date().getMonth() + 1,
    periodYear: new Date().getFullYear(),
    shareAmount: 5000,
    benevolenceAmount: 1000,
    paymentMode: 'MPESA',
    paymentDate: new Date().toISOString().split('T')[0],
    reconciled: true
  };

  constructor(private contributionService: ContributionService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.contributionService.searchContributions(this.payrollFilter, this.yearFilter || undefined, this.monthFilter || undefined).subscribe(res => {
      this.contributions = res.data.content;
    });
    this.contributionService.getFinancialSummary().subscribe(res => {
      this.financialSummary = res.data;
    });
  }

  onSearch() {
    this.loadData();
  }

  reconcile(id: number) {
    this.contributionService.reconcileContribution(id).subscribe(() => this.loadData());
  }

  openCheckoffModal() {
    this.selectedCheckoffFile = null;
    this.checkoffResult = null;
    this.showCheckoffModal = true;
  }

  closeCheckoffModal() {
    this.showCheckoffModal = false;
  }

  onCheckoffFileSelected(e: any) {
    if (e.target.files && e.target.files.length > 0) {
      this.selectedCheckoffFile = e.target.files[0];
    }
  }

  executeCheckoffImport(dryRun: boolean) {
    if (!this.selectedCheckoffFile) return;
    this.contributionService.importCheckoff(this.selectedCheckoffFile, this.importMonth, this.importYear, dryRun).subscribe(res => {
      this.checkoffResult = res.data;
      if (!dryRun) {
        this.loadData();
      }
    });
  }

  openManualModal() {
    this.showManualModal = true;
  }

  closeManualModal() {
    this.showManualModal = false;
  }

  saveManualContribution() {
    this.contributionService.recordContribution(this.manualEntry).subscribe(() => {
      this.closeManualModal();
      this.loadData();
    });
  }

  openStatementModal() {
    this.showStatementModal = true;
    this.loadStatement();
  }

  closeStatementModal() {
    this.showStatementModal = false;
  }

  loadStatement() {
    if (!this.statementPayroll) return;
    this.contributionService.getMemberStatement(this.statementPayroll).subscribe(res => {
      this.statement = res.data;
    });
  }
}
