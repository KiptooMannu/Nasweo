import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WelfareService } from '../../core/services/welfare.service';
import { BenevolenceRecord, WelfareExpenditureSummary } from '../../core/models/welfare.model';

@Component({
  selector: 'app-welfare',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Welfare &amp; Relief</span>
            <span class="text-slate-300">•</span>
            <span class="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
              Benevolence Fund Ledger
            </span>
          </div>
          <h1 class="text-xl font-bold text-slate-900 tracking-tight">Benevolence Assistance &amp; Occasion Grants</h1>
          <p class="text-xs text-slate-600 mt-0.5">Statutory assistance for member illness, bereavement, retirement gifts, and constitutional welfare grants.</p>
        </div>
        <button (click)="openAddModal()" class="px-3 py-1.5 rounded bg-[#0F291E] hover:bg-[#1B4332] text-white font-medium text-xs shadow-2xs flex items-center gap-1.5 transition">
          <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          <span>Record Relief / Grant</span>
        </button>
      </div>

      <!-- Expenditures Summary Strip -->
      <div class="bg-white border border-slate-200 rounded-lg shadow-2xs divide-y sm:divide-y-0 sm:divide-x divide-slate-200 grid grid-cols-1 sm:grid-cols-3">
        <div class="p-5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Total Disbursed All Time</span>
            <span class="text-[10px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-medium">{{ summary?.totalClaimsCount || 0 }} Cases</span>
          </div>
          <div class="text-2xl font-bold tracking-tight text-slate-900 font-mono mt-2">
            KES {{ (summary?.totalDisbursedAllTime || 0) | number:'1.2-2' }}
          </div>
          <p class="text-[11px] text-slate-500 mt-1">Cumulative mutual welfare payouts across all incidents.</p>
        </div>
        <div class="p-5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Current FY Disbursed</span>
            <span class="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">FY 2026/27</span>
          </div>
          <div class="text-2xl font-bold tracking-tight text-slate-900 font-mono mt-2">
            KES {{ (summary?.totalDisbursedThisYear || 0) | number:'1.2-2' }}
          </div>
          <p class="text-[11px] text-slate-500 mt-1">Total claims honored within active financial year.</p>
        </div>
        <div class="p-5">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Active Month Movement</span>
            <span class="text-[10px] font-mono text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-medium">Current Month</span>
          </div>
          <div class="text-2xl font-bold tracking-tight text-slate-900 font-mono mt-2">
            KES {{ (summary?.totalDisbursedThisMonth || 0) | number:'1.2-2' }}
          </div>
          <p class="text-[11px] text-slate-500 mt-1">Outflows processed in current billing cycle.</p>
        </div>
      </div>

      <!-- Benevolence Records Table -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div class="px-5 py-3.5 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 class="font-bold text-sm text-slate-900">Disbursement &amp; Relief Audit Register</h3>
            <p class="text-[11px] text-slate-500 font-mono">Total {{ records.length }} verified payout vouchers</p>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 font-mono">
              <tr>
                <th class="py-2.5 px-4">Event Date</th>
                <th class="py-2.5 px-4">Member Payroll</th>
                <th class="py-2.5 px-4">Assistance Type</th>
                <th class="py-2.5 px-4">Beneficiary</th>
                <th class="py-2.5 px-4">Particulars</th>
                <th class="py-2.5 px-4 text-right">Amount (KES)</th>
                <th class="py-2.5 px-4">Voucher No</th>
                <th class="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-normal">
              <tr *ngFor="let r of records" class="hover:bg-slate-50/60 transition">
                <td class="py-2.5 px-4 font-mono text-slate-600">{{ r.eventDate }}</td>
                <td class="py-2.5 px-4 font-mono font-bold text-slate-900">{{ r.payrollNo }}</td>
                <td class="py-2.5 px-4">
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {{ formatTypeName(r.benevolenceType) }}
                  </span>
                </td>
                <td class="py-2.5 px-4">
                  <div class="font-medium text-slate-900">{{ r.beneficiaryName }}</div>
                  <div class="text-[10px] text-slate-400 font-mono">Rel: {{ r.relationship }}</div>
                </td>
                <td class="py-2.5 px-4 text-slate-600 max-w-xs truncate">{{ r.occasionDescription }}</td>
                <td class="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{{ r.amountProvided | number:'1.2-2' }}</td>
                <td class="py-2.5 px-4 font-mono text-[11px] text-slate-500">{{ r.voucherReference || '—' }}</td>
                <td class="py-2.5 px-4 text-right">
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {{ r.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Record Benevolence Modal -->
      <div *ngIf="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 class="text-base font-bold text-slate-900">Record Benevolence or Gift</h3>
            <button (click)="closeAddModal()" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <form (ngSubmit)="saveBenevolence()" class="mt-4 space-y-3">
            <div>
              <label class="block font-semibold text-slate-600 mb-1">Member Payroll No *</label>
              <input [(ngModel)]="newRecord.payrollNo" name="payrollNo" required placeholder="e.g. NARL-1001" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
            </div>

            <div>
              <label class="block font-semibold text-slate-600 mb-1">Assistance Category *</label>
              <select [(ngModel)]="newRecord.benevolenceType" name="benevolenceType" required class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
                <option value="MEMBER_ILLNESS">Member Illness / Hospitalization</option>
                <option value="DEATH_OF_MEMBER">Bereavement - Death of Member</option>
                <option value="DEATH_OF_DEPENDANT">Bereavement - Death of Dependant</option>
                <option value="RETIREMENT_GIFT">Retirement Send-off Gift</option>
                <option value="WEDDING_GIFT">Wedding Congratulatory Gift</option>
                <option value="SPECIAL_OCCASION_GIFT">Special Occasion Support</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Beneficiary Name *</label>
                <input [(ngModel)]="newRecord.beneficiaryName" name="beneficiaryName" required placeholder="Name of person" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
              </div>
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Relationship</label>
                <input [(ngModel)]="newRecord.relationship" name="relationship" placeholder="Self, Spouse, Parent" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
              </div>
            </div>

            <div>
              <label class="block font-semibold text-slate-600 mb-1">Amount Provided (KES) *</label>
              <input [(ngModel)]="newRecord.amountProvided" name="amountProvided" type="number" step="100" required class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
            </div>

            <div>
              <label class="block font-semibold text-slate-600 mb-1">Purpose / Occasion Details</label>
              <textarea [(ngModel)]="newRecord.occasionDescription" name="occasionDescription" rows="2" placeholder="Describe the welfare event or occasion..." class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Payment Mode</label>
                <select [(ngModel)]="newRecord.paymentMode" name="paymentMode" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
                  <option value="DIRECT_BANK">Bank Transfer</option>
                  <option value="MPESA">M-Pesa</option>
                  <option value="CASH">Cash Office</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-600 mb-1">Payment Voucher Ref</label>
                <input [(ngModel)]="newRecord.voucherReference" name="voucherReference" placeholder="e.g. VCH-2026-101" class="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500">
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" (click)="closeAddModal()" class="px-4 py-2 rounded-xl bg-slate-100 font-semibold text-slate-700">Cancel</button>
              <button type="submit" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white">Save Record</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class WelfareComponent implements OnInit {
  records: BenevolenceRecord[] = [];
  summary: WelfareExpenditureSummary | null = null;
  showAddModal = false;

  newRecord: Partial<BenevolenceRecord> = {
    payrollNo: '',
    benevolenceType: 'MEMBER_ILLNESS',
    beneficiaryName: '',
    relationship: 'Self',
    amountProvided: 20000,
    paymentMode: 'DIRECT_BANK',
    status: 'DISBURSED'
  };

  constructor(private welfareService: WelfareService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.welfareService.searchRecords().subscribe(res => {
      this.records = res.data.content;
    });
    this.welfareService.getExpenditureSummary().subscribe(res => {
      this.summary = res.data;
    });
  }

  formatTypeName(type: string): string {
    return type ? type.replace(/_/g, ' ') : '';
  }

  openAddModal() {
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  saveBenevolence() {
    this.welfareService.recordBenevolence(this.newRecord).subscribe(() => {
      this.closeAddModal();
      this.loadData();
    });
  }
}
