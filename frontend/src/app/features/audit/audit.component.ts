import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 animate-page">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Security &amp; Compliance</span>
            <span class="text-slate-300">•</span>
            <span class="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
              Immutable Audit Ledger
            </span>
          </div>
          <h1 class="text-xl font-bold text-slate-900 tracking-tight">Compliance Audit Trail &amp; Ledger Mutations</h1>
          <p class="text-xs text-slate-600 mt-0.5">Chronological record of administrative operations, financial postings, user logins, and database integrity events.</p>
        </div>
        <button (click)="loadLogs()" class="px-3 py-1.5 rounded bg-white hover:bg-slate-50 text-slate-700 font-mono text-xs border border-slate-300 shadow-2xs flex items-center gap-1.5 transition btn-press hover-lift">
          <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          <span>Refresh Ledger</span>
        </button>
      </div>

      <div class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div class="px-5 py-3.5 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 class="font-bold text-sm text-slate-900">Cryptographically Audited System Events</h3>
            <p class="text-[11px] text-slate-500 font-mono">Retained for statutory RFQ compliance review</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 font-mono">
              <tr>
                <th class="py-2.5 px-4">Audit Timestamp</th>
                <th class="py-2.5 px-4">Action Token</th>
                <th class="py-2.5 px-4">Operator</th>
                <th class="py-2.5 px-4">Target Entity</th>
                <th class="py-2.5 px-4">Audit Particulars</th>
                <th class="py-2.5 px-4 font-mono">Source IP</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-normal">
              <tr *ngFor="let log of logs" class="hover:bg-slate-50/60 transition">
                <td class="py-2.5 px-4 text-slate-600 font-mono text-[11px]">{{ log.timestamp }}</td>
                <td class="py-2.5 px-4">
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium uppercase bg-slate-100 text-slate-700 border border-slate-200">
                    {{ log.action }}
                  </span>
                </td>
                <td class="py-2.5 px-4 font-semibold text-slate-900 font-mono">{{ log.performedBy }}</td>
                <td class="py-2.5 px-4 text-slate-700 font-mono text-[11px]">{{ log.entityName }} #{{ log.entityId }}</td>
                <td class="py-2.5 px-4 text-slate-600 max-w-sm truncate">{{ log.details }}</td>
                <td class="py-2.5 px-4 font-mono text-[11px] text-slate-400">{{ log.ipAddress || 'Internal' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AuditComponent implements OnInit {
  logs: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.authService.getAuditLogs().subscribe(res => {
      this.logs = res.data.content;
    });
  }
}
