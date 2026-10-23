import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { RoleMetadata } from '../../core/models/user.model';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 font-sans">
      
      <!-- Administrative Header -->
      <div class="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[10px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              Access Governance &amp; RBAC
            </span>
            <span class="text-slate-300">•</span>
            <span class="text-xs text-slate-500 font-mono">RFQ Security Matrix</span>
          </div>
          <h1 class="text-xl font-bold tracking-tight text-slate-900">Role &amp; Permissions Authorization Catalog</h1>
          <p class="text-xs text-slate-600 mt-0.5">
            Role-Based Access Control configuration defining functional segregation of duties across NARL Welfare operations.
          </p>
        </div>

        <div class="bg-slate-50 p-3 rounded border border-slate-200 text-right">
          <p class="text-[10px] font-mono uppercase text-slate-500 font-semibold">Active RFQ Roles</p>
          <p class="text-base font-bold text-slate-900 font-mono">5 Defined Profiles</p>
        </div>
      </div>

      <!-- Roles Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div *ngFor="let r of roles" class="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span [ngClass]="getRoleBadgeClass(r.code)" class="px-2 py-0.5 rounded text-[10px] font-mono font-bold border">
                {{ r.code }}
              </span>
              <span class="text-[10px] font-mono text-slate-500 font-semibold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                {{ r.userCount }} Assignee(s)
              </span>
            </div>

            <h3 class="text-sm font-bold text-slate-900">{{ r.name }}</h3>
            <p class="text-[11px] text-emerald-800 font-mono font-medium mt-0.5">{{ r.tier }}</p>
            <p class="text-xs text-slate-600 mt-2 leading-relaxed">{{ r.description }}</p>

            <div class="mt-4 pt-3 border-t border-slate-100">
              <p class="text-[10px] font-mono uppercase text-slate-400 font-bold mb-2">Assigned Responsibilities</p>
              <ul class="space-y-1">
                <li *ngFor="let perm of r.permissions" class="flex items-center gap-1.5 text-xs text-slate-700">
                  <svg class="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                  <span>{{ perm }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Functional Segregation of Duties Matrix Table -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 class="text-sm font-bold text-slate-900">RFQ Functional Segregation of Duties (SOD) Matrix</h2>
            <p class="text-[11px] text-slate-500">Cross-cutting operational privilege mapping across institutional workflows</p>
          </div>
          <span class="text-[10px] font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 font-semibold">
            ISO 27001 Principle of Least Privilege
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 font-mono text-[10px]">
              <tr>
                <th class="py-3 px-4">Functional Capability / Scope</th>
                <th class="py-3 px-3 text-center">Admin</th>
                <th class="py-3 px-3 text-center">Treasurer</th>
                <th class="py-3 px-3 text-center">Welfare</th>
                <th class="py-3 px-3 text-center">Auditor</th>
                <th class="py-3 px-3 text-center">Member</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-mono text-[11px]">
              <tr *ngFor="let perm of permissionMatrix" class="hover:bg-slate-50/70 transition">
                <td class="py-2.5 px-4 font-sans text-slate-900 font-medium">
                  {{ perm.capability }}
                  <span class="block text-[10px] font-mono text-slate-400">{{ perm.module }}</span>
                </td>
                <td class="py-2.5 px-3 text-center">
                  <span [ngClass]="perm.admin ? 'text-emerald-700 font-bold' : 'text-slate-300'">{{ perm.admin ? '✓ ALLOW' : '—' }}</span>
                </td>
                <td class="py-2.5 px-3 text-center">
                  <span [ngClass]="perm.treasurer ? 'text-emerald-700 font-bold' : 'text-slate-300'">{{ perm.treasurer ? '✓ ALLOW' : '—' }}</span>
                </td>
                <td class="py-2.5 px-3 text-center">
                  <span [ngClass]="perm.welfare ? 'text-emerald-700 font-bold' : 'text-slate-300'">{{ perm.welfare ? '✓ ALLOW' : '—' }}</span>
                </td>
                <td class="py-2.5 px-3 text-center">
                  <span [ngClass]="perm.auditor ? 'text-blue-700 font-bold' : 'text-slate-300'">{{ perm.auditor ? '✓ READ' : '—' }}</span>
                </td>
                <td class="py-2.5 px-3 text-center">
                  <span [ngClass]="perm.member ? 'text-emerald-700 font-bold' : 'text-slate-300'">{{ perm.member ? (perm.memberScope || '✓ OWN') : '—' }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class RoleManagementComponent implements OnInit {
  roles: RoleMetadata[] = [];

  permissionMatrix = [
    { capability: 'User Provisioning & Role Assignments', module: 'Administration', admin: true, treasurer: false, welfare: false, auditor: false, member: false },
    { capability: 'Temporary Credential Issuance & Resets', module: 'Administration', admin: true, treasurer: false, welfare: false, auditor: false, member: false },
    { capability: 'Excel Checkoff Upload & Extraction', module: 'Contributions', admin: false, treasurer: true, welfare: false, auditor: false, member: false },
    { capability: 'M-Pesa & Bank Slip Reconciliation', module: 'Contributions', admin: false, treasurer: true, welfare: false, auditor: false, member: false },
    { capability: 'Loan Application Review & Approval', module: 'Loan Portfolio', admin: false, treasurer: true, welfare: false, auditor: false, member: false },
    { capability: 'Amortization Engine Schedule Computation', module: 'Loan Portfolio', admin: true, treasurer: true, welfare: false, auditor: true, member: true, memberScope: '✓ PREVIEW' },
    { capability: 'Loan Top-Up Settlement Deduction', module: 'Loan Portfolio', admin: false, treasurer: true, welfare: false, auditor: false, member: false },
    { capability: 'Benevolence Assistance Claims Posting', module: 'Welfare Operations', admin: false, treasurer: false, welfare: true, auditor: false, member: false },
    { capability: 'Special Occasions & Retirement Gifts', module: 'Welfare Operations', admin: false, treasurer: false, welfare: true, auditor: false, member: false },
    { capability: 'Member Biodata & Next-of-Kin Management', module: 'Membership', admin: true, treasurer: false, welfare: true, auditor: false, member: false },
    { capability: 'Retirement Horizon Radar (Scientist 65 / Staff 60)', module: 'Membership', admin: true, treasurer: true, welfare: true, auditor: true, member: true, memberScope: '✓ OWN' },
    { capability: 'Statutory Reports Workbench & Print Letterhead', module: 'Statutory Compliance', admin: true, treasurer: true, welfare: true, auditor: true, member: false },
    { capability: 'Member Self-Service Statement Download', module: 'Self-Service', admin: true, treasurer: true, welfare: false, auditor: false, member: true, memberScope: '✓ OWN' },
    { capability: 'Security Audit Trail Log Inspection', module: 'Audit & Governance', admin: true, treasurer: false, welfare: false, auditor: true, member: false }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getRoles().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.roles = res.data;
        }
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN': return 'bg-purple-50 text-purple-900 border-purple-200';
      case 'ROLE_TREASURER': return 'bg-blue-50 text-blue-900 border-blue-200';
      case 'ROLE_WELFARE_OFFICER': return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'ROLE_AUDITOR': return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'ROLE_MEMBER': return 'bg-emerald-50 text-emerald-900 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }
}
