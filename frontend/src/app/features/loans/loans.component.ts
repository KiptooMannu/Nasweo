import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoanService } from '../../core/services/loan.service';
import { Loan, LoanProduct, AmortizationSchedule, TopUpCalculationResult } from '../../core/models/loan.model';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Credit Facilities</span>
            <span class="text-slate-300">•</span>
            <span class="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
              Amortization &amp; Settlement Engine
            </span>
          </div>
          <h1 class="text-xl font-bold text-slate-900 tracking-tight">Credit Portfolio &amp; Amortization Schedules</h1>
          <p class="text-xs text-slate-600 mt-0.5">Reducing-balance schedules, flat rate options, top-ups with settlement deduction calculation, and recovery tracking.</p>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="openCalculatorModal()" class="px-3 py-1.5 rounded bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-300 shadow-2xs flex items-center gap-1.5 transition">
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            <span>Amortization Simulator</span>
          </button>
          <button (click)="openTopUpModal()" class="px-3 py-1.5 rounded bg-white hover:bg-slate-50 text-slate-800 font-medium text-xs border border-slate-300 shadow-2xs flex items-center gap-1.5 transition">
            <svg class="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            <span>Process Loan Top-Up</span>
          </button>
          <button (click)="openApplyModal()" class="px-3 py-1.5 rounded bg-[#0F291E] hover:bg-[#1B4332] text-white font-medium text-xs shadow-2xs flex items-center gap-1.5 transition">
            <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>Issue New Facility</span>
          </button>
        </div>
      </div>

      <!-- Active Loan Products Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div *ngFor="let p of products" class="p-4 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div class="flex items-center justify-between mb-2">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">{{ p.code }}</span>
            <span class="text-xs font-bold text-slate-900 font-mono">{{ p.annualInterestRate }}% p.a.</span>
          </div>
          <h4 class="font-bold text-xs text-slate-900">{{ p.name }}</h4>
          <p class="text-[11px] text-slate-500 mt-1 line-clamp-2">{{ p.description }}</p>
          <div class="mt-3 pt-3 border-t border-slate-100 flex justify-between text-[11px] text-slate-600 font-mono">
            <span>Tenor: &le; {{ p.maxRepaymentMonths }}m</span>
            <span class="text-emerald-800 font-semibold">{{ p.interestType === 'REDUCING_BALANCE' ? 'Reducing Bal.' : 'Flat Rate' }}</span>
          </div>
        </div>
      </div>

      <!-- Loans Portfolio Table -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div class="px-5 py-3.5 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 class="font-bold text-sm text-slate-900">Active &amp; Historic Credit Facilities</h3>
            <p class="text-[11px] text-slate-500 font-mono">Total {{ loans.length }} loan ledger accounts</p>
          </div>
        </div>
        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left text-xs min-w-[760px]">
            <thead class="bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 font-mono">
              <tr>
                <th class="py-2.5 px-4">Loan No</th>
                <th class="py-2.5 px-4">Borrower / Payroll</th>
                <th class="py-2.5 px-4">Facility Type</th>
                <th class="py-2.5 px-4 text-right">Principal (KES)</th>
                <th class="py-2.5 px-4 text-right">Monthly (KES)</th>
                <th class="py-2.5 px-4 text-right">Outstanding (KES)</th>
                <th class="py-2.5 px-4">Status</th>
                <th class="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-normal">
              <tr *ngFor="let l of loans" class="hover:bg-slate-50/60 transition">
                <td class="py-2.5 px-4 font-mono font-bold text-slate-900">{{ l.loanNumber }}</td>
                <td class="py-2.5 px-4">
                  <div class="font-medium text-slate-900">{{ l.memberName || l.payrollNo }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">{{ l.payrollNo }}</div>
                </td>
                <td class="py-2.5 px-4 text-slate-700">{{ l.productName }}</td>
                <td class="py-2.5 px-4 text-right font-mono font-medium text-slate-900">{{ l.principalAmount | number:'1.2-2' }}</td>
                <td class="py-2.5 px-4 text-right font-mono font-bold text-emerald-800">{{ l.monthlyPayment | number:'1.2-2' }}</td>
                <td class="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{{ l.outstandingBalance | number:'1.2-2' }}</td>
                <td class="py-2.5 px-4">
                  <span [ngClass]="{
                    'bg-emerald-50 text-emerald-800 border-emerald-200': l.status === 'ACTIVE',
                    'bg-slate-100 text-slate-700 border-slate-200': l.status === 'CLOSED',
                    'bg-blue-50 text-blue-800 border-blue-200': l.status === 'TOPPED_UP',
                    'bg-rose-50 text-rose-800 border-rose-200': l.status === 'DEFAULTED'
                  }" class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border">
                    {{ l.status }}
                  </span>
                </td>
                <td class="py-2.5 px-4 text-right space-x-1">
                  <button (click)="viewSchedule(l.loanNumber)" class="px-2 py-0.5 text-slate-700 hover:bg-slate-100 rounded border border-slate-200 font-mono text-[11px]">Schedule</button>
                  <button *ngIf="l.status === 'ACTIVE'" (click)="openRepayModal(l)" class="px-2 py-0.5 text-emerald-800 hover:bg-emerald-50 rounded border border-emerald-200 font-mono text-[11px] font-medium">Repay</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Interactive Loan Calculator & Amortization Modal -->
      <div *ngIf="showCalculatorModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 text-xs">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Loan Amortization Schedule Simulator</h3>
            <button (click)="closeCalculatorModal()" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <div class="mt-4 grid grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Select Product</label>
              <select [(ngModel)]="calcProductCode" (change)="runCalculator()" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
                <option *ngFor="let p of products" [value]="p.code">{{ p.name }} ({{ p.annualInterestRate }}%)</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Principal Amount (KES)</label>
              <input [(ngModel)]="calcPrincipal" (input)="runCalculator()" type="number" step="10000" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Repayment Period (Months)</label>
              <input [(ngModel)]="calcMonths" (input)="runCalculator()" type="number" min="1" max="60" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
            </div>
          </div>

          <!-- Amortization Summary Cards -->
          <div *ngIf="amortizationPreview" class="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-3 text-center">
            <div>
              <p class="text-slate-400 font-bold uppercase text-[10px]">Monthly Payment</p>
              <p class="text-lg font-black text-emerald-700">KES {{ amortizationPreview.monthlyPayment | number:'1.2-2' }}</p>
            </div>
            <div>
              <p class="text-slate-400 font-bold uppercase text-[10px]">Total Interest</p>
              <p class="text-lg font-black text-slate-800">KES {{ amortizationPreview.totalInterest | number:'1.2-2' }}</p>
            </div>
            <div>
              <p class="text-slate-400 font-bold uppercase text-[10px]">Total Repayable</p>
              <p class="text-lg font-black text-indigo-700">KES {{ amortizationPreview.totalRepayable | number:'1.2-2' }}</p>
            </div>
          </div>

          <!-- Breakdown Table -->
          <div *ngIf="amortizationPreview" class="mt-4 max-h-56 overflow-y-auto border border-slate-200 rounded-xl">
            <table class="w-full text-left">
              <thead class="bg-slate-100 text-slate-500 font-semibold sticky top-0">
                <tr>
                  <th class="py-2 px-3">Inst #</th>
                  <th class="py-2 px-3">Due Date</th>
                  <th class="py-2 px-3">Opening Bal</th>
                  <th class="py-2 px-3">Principal</th>
                  <th class="py-2 px-3">Interest</th>
                  <th class="py-2 px-3">Total Installment</th>
                  <th class="py-2 px-3">Closing Bal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-mono text-[11px]">
                <tr *ngFor="let item of amortizationPreview.scheduleItems">
                  <td class="py-1.5 px-3 font-sans font-bold">{{ item.installmentNo }}</td>
                  <td class="py-1.5 px-3 font-sans">{{ item.dueDate }}</td>
                  <td class="py-1.5 px-3">{{ item.openingBalance | number:'1.2-2' }}</td>
                  <td class="py-1.5 px-3 text-emerald-700 font-semibold">{{ item.principalAmount | number:'1.2-2' }}</td>
                  <td class="py-1.5 px-3 text-blue-700 font-semibold">{{ item.interestAmount | number:'1.2-2' }}</td>
                  <td class="py-1.5 px-3 font-bold">{{ item.totalInstallment | number:'1.2-2' }}</td>
                  <td class="py-1.5 px-3 font-bold text-slate-900">{{ item.closingBalance | number:'1.2-2' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Loan Application Modal -->
      <div *ngIf="showApplyModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Originate New Welfare Loan</h3>
            <button (click)="closeApplyModal()" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <form (ngSubmit)="submitLoanApplication()" class="mt-4 space-y-3">
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Member Payroll Number *</label>
              <input [(ngModel)]="newLoanApp.payrollNo" name="payrollNo" required placeholder="e.g. NARL-1001" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Loan Product *</label>
              <select [(ngModel)]="newLoanApp.productCode" name="productCode" required class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
                <option *ngFor="let p of products" [value]="p.code">{{ p.name }} ({{ p.annualInterestRate }}% - Max {{ p.maxRepaymentMonths }}m)</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Principal Amount (KES) *</label>
              <input [(ngModel)]="newLoanApp.principalAmount" name="principalAmount" type="number" step="1000" required class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Repayment Term (Months) *</label>
              <input [(ngModel)]="newLoanApp.repaymentMonths" name="repaymentMonths" type="number" min="1" max="48" required class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" (click)="closeApplyModal()" class="px-4 py-2 rounded-xl bg-slate-100 font-semibold text-slate-700">Cancel</button>
              <button type="submit" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white">Approve &amp; Disburse</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Loan Top-Up Wizard Modal -->
      <div *ngIf="showTopUpModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Loan Top-Up &amp; Settlement Calculator</h3>
            <button (click)="closeTopUpModal()" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <div class="mt-4 space-y-3">
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Select Active Existing Loan</label>
              <select [(ngModel)]="topUpLoanNumber" (change)="checkTopUpPreview()" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
                <option value="">-- Choose Existing Active Loan --</option>
                <option *ngFor="let l of getActiveLoans()" [value]="l.loanNumber">
                  {{ l.loanNumber }} - {{ l.memberName }} (Bal: KES {{ l.outstandingBalance | number:'1.2-2' }})
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-600 mb-1">New Total Principal (KES)</label>
                <input [(ngModel)]="topUpNewPrincipal" (input)="checkTopUpPreview()" type="number" step="5000" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
              </div>
              <div>
                <label class="block font-semibold text-slate-600 mb-1">New Term (Months)</label>
                <input [(ngModel)]="topUpMonths" type="number" min="1" max="48" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
              </div>
            </div>

            <!-- Settlement Calculation Result Box -->
            <div *ngIf="topUpResult" class="p-3.5 rounded-xl border space-y-1.5"
                 [ngClass]="topUpResult.eligible ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'">
              <div class="flex justify-between font-bold" [ngClass]="topUpResult.eligible ? 'text-emerald-900' : 'text-rose-900'">
                <span>Settlement Required on Old Loan:</span>
                <span>KES {{ topUpResult.totalSettlementRequired | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between text-slate-700">
                <span>Requested New Principal:</span>
                <span class="font-bold">KES {{ topUpResult.requestedNewPrincipal | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between text-sm font-extrabold pt-2 border-t" [ngClass]="topUpResult.eligible ? 'border-emerald-300 text-emerald-800' : 'border-rose-300 text-rose-800'">
                <span>Net Disbursement to Member:</span>
                <span>KES {{ topUpResult.netDisbursementToMember | number:'1.2-2' }}</span>
              </div>
              <p *ngIf="!topUpResult.eligible" class="text-rose-600 font-bold text-[11px] pt-1">
                ✕ {{ topUpResult.ineligibleReason }}
              </p>
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button (click)="closeTopUpModal()" class="px-4 py-2 rounded-xl bg-slate-100 font-semibold text-slate-700">Cancel</button>
              <button (click)="submitTopUp()" [disabled]="!topUpResult || !topUpResult.eligible" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white disabled:opacity-50">Confirm Top-Up</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Repayment Modal -->
      <div *ngIf="showRepayModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-xs">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Post Loan Repayment</h3>
            <button (click)="closeRepayModal()" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <form (ngSubmit)="submitRepayment()" class="mt-4 space-y-3">
            <p class="font-bold text-slate-800">Loan: {{ activeRepayLoan?.loanNumber }}</p>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Repayment Amount (KES) *</label>
              <input [(ngModel)]="repayAmount" name="repayAmount" type="number" step="0.01" required class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Channel</label>
              <select [(ngModel)]="repayChannel" name="repayChannel" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
                <option value="EMPLOYER_CHECKOFF">Employer Checkoff</option>
                <option value="MPESA">M-Pesa</option>
                <option value="DIRECT_BANK">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Reference No</label>
              <input [(ngModel)]="repayRef" name="repayRef" placeholder="e.g. MPESA-ABC12345" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" (click)="closeRepayModal()" class="px-4 py-2 rounded-xl bg-slate-100 font-semibold text-slate-700">Cancel</button>
              <button type="submit" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white">Post Repayment</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class LoansComponent implements OnInit {
  products: LoanProduct[] = [];
  loans: Loan[] = [];

  showCalculatorModal = false;
  calcProductCode = 'DEV-01';
  calcPrincipal = 200000;
  calcMonths = 24;
  amortizationPreview: AmortizationSchedule | null = null;

  showApplyModal = false;
  newLoanApp = {
    payrollNo: 'NARL-1001',
    productCode: 'DEV-01',
    principalAmount: 150000,
    repaymentMonths: 24
  };

  showTopUpModal = false;
  topUpLoanNumber = '';
  topUpNewPrincipal = 350000;
  topUpMonths = 24;
  topUpResult: TopUpCalculationResult | null = null;

  showRepayModal = false;
  activeRepayLoan: Loan | null = null;
  repayAmount = 15000;
  repayChannel = 'EMPLOYER_CHECKOFF';
  repayRef = '';

  constructor(private loanService: LoanService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loanService.getActiveProducts().subscribe(res => {
      this.products = res.data;
      if (this.products.length > 0) {
        this.calcProductCode = this.products[0].code;
        this.newLoanApp.productCode = this.products[0].code;
      }
    });

    this.loanService.searchLoans().subscribe(res => {
      this.loans = res.data.content;
    });
  }

  getActiveLoans(): Loan[] {
    return this.loans.filter(l => l.status === 'ACTIVE');
  }

  openCalculatorModal() {
    this.showCalculatorModal = true;
    this.runCalculator();
  }

  closeCalculatorModal() {
    this.showCalculatorModal = false;
  }

  runCalculator() {
    if (!this.calcProductCode || !this.calcPrincipal) return;
    this.loanService.calculateAmortization(this.calcProductCode, this.calcPrincipal, this.calcMonths).subscribe(res => {
      this.amortizationPreview = res.data;
    });
  }

  openApplyModal() {
    this.showApplyModal = true;
  }

  closeApplyModal() {
    this.showApplyModal = false;
  }

  submitLoanApplication() {
    this.loanService.applyLoan(this.newLoanApp).subscribe(() => {
      this.closeApplyModal();
      this.loadData();
    });
  }

  openTopUpModal() {
    this.showTopUpModal = true;
    this.topUpLoanNumber = '';
    this.topUpResult = null;
  }

  closeTopUpModal() {
    this.showTopUpModal = false;
  }

  checkTopUpPreview() {
    if (!this.topUpLoanNumber || !this.topUpNewPrincipal) return;
    this.loanService.previewTopUp(this.topUpLoanNumber, this.topUpNewPrincipal).subscribe(res => {
      this.topUpResult = res.data;
    });
  }

  submitTopUp() {
    if (!this.topUpLoanNumber || !this.topUpNewPrincipal) return;
    this.loanService.processTopUp({
      existingLoanNumber: this.topUpLoanNumber,
      newPrincipalAmount: this.topUpNewPrincipal,
      newRepaymentMonths: this.topUpMonths
    }).subscribe(() => {
      this.closeTopUpModal();
      this.loadData();
    });
  }

  openRepayModal(l: Loan) {
    this.activeRepayLoan = l;
    this.repayAmount = l.monthlyPayment;
    this.showRepayModal = true;
  }

  closeRepayModal() {
    this.showRepayModal = false;
  }

  submitRepayment() {
    if (!this.activeRepayLoan) return;
    this.loanService.processRepayment({
      loanNumber: this.activeRepayLoan.loanNumber,
      amount: this.repayAmount,
      paymentMode: this.repayChannel,
      referenceNo: this.repayRef,
      paymentDate: new Date().toISOString().split('T')[0]
    }).subscribe(() => {
      this.closeRepayModal();
      this.loadData();
    });
  }

  viewSchedule(loanNumber: string) {
    this.loanService.getLoanSchedule(loanNumber).subscribe(res => {
      this.amortizationPreview = {
        principalAmount: 0,
        annualInterestRate: 0,
        repaymentMonths: res.data.length,
        interestType: 'Amortization',
        monthlyPayment: 0,
        totalInterest: 0,
        totalRepayable: 0,
        scheduleItems: res.data
      };
      this.showCalculatorModal = true;
    });
  }
}
