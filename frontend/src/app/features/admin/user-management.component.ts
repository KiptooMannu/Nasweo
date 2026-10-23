import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User, UserUpdateRequest } from '../../core/models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 font-sans">
      
      <!-- Administrative Header -->
      <div class="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[10px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              Tier-1 Security Custodian
            </span>
            <span class="text-slate-300">•</span>
            <span class="text-xs text-slate-500 font-mono">NASWEO Administrative Governance</span>
          </div>
          <h1 class="text-xl font-bold tracking-tight text-slate-900">User Account &amp; Credential Management</h1>
          <p class="text-xs text-slate-600 mt-0.5">
            Provision staff profiles, assign RFQ security roles, manage mandatory first-login credentials, and monitor account lifecycles.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button (click)="openCreateModal()" 
                  class="px-3.5 py-2 rounded bg-[#0F291E] hover:bg-[#1B4332] text-white text-xs font-medium shadow-xs transition flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
            <span>Register New User</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary Ledger Strip -->
      <div class="bg-white border border-slate-200 rounded-lg shadow-2xs divide-y sm:divide-y-0 sm:divide-x divide-slate-200 grid grid-cols-2 sm:grid-cols-4">
        <div class="p-4">
          <p class="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Total Accounts</p>
          <p class="text-2xl font-bold text-slate-900 font-mono mt-1">{{ users.length }}</p>
          <p class="text-[10px] text-slate-400 mt-0.5">System registered identities</p>
        </div>

        <div class="p-4">
          <p class="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-semibold">Active Accounts</p>
          <p class="text-2xl font-bold text-emerald-900 font-mono mt-1">{{ getActiveCount() }}</p>
          <p class="text-[10px] text-slate-400 mt-0.5">Authorized for portal login</p>
        </div>

        <div class="p-4">
          <p class="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-semibold">Password Change Required</p>
          <p class="text-2xl font-bold text-amber-900 font-mono mt-1">{{ getPendingPasswordChangeCount() }}</p>
          <p class="text-[10px] text-slate-400 mt-0.5">Pending first-login update</p>
        </div>

        <div class="p-4">
          <p class="text-[10px] font-mono uppercase tracking-wider text-rose-800 font-semibold">Deactivated</p>
          <p class="text-2xl font-bold text-rose-900 font-mono mt-1">{{ getDeactivatedCount() }}</p>
          <p class="text-[10px] text-slate-400 mt-0.5">Access suspended</p>
        </div>
      </div>

      <!-- Temporary Credential Banner (Visible right after user creation or reset) -->
      <div *ngIf="temporaryCredentialAlert" class="p-4 rounded-lg border border-amber-200 bg-amber-50/90 shadow-xs animate-dropdown">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <div class="p-2 bg-amber-100 rounded text-amber-800">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-xs font-bold text-amber-950 uppercase tracking-wider">
                Temporary Login Credential Issued
              </h3>
              <p class="text-xs text-amber-900 mt-0.5">
                Account <strong>&#64;{{ temporaryCredentialAlert.username }}</strong> has been configured with mandatory password change on first login.
              </p>
              
              <div class="mt-2.5 flex items-center gap-3">
                <div class="px-3 py-1.5 bg-white border border-amber-300 rounded font-mono text-sm font-bold text-slate-900 select-all">
                  {{ temporaryCredentialAlert.password }}
                </div>
                <button (click)="copyCredential(temporaryCredentialAlert.password)" 
                        class="px-2.5 py-1.5 bg-amber-200/80 hover:bg-amber-300 text-amber-950 rounded font-mono text-xs font-medium transition flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                  <span>{{ copied ? 'Copied!' : 'Copy Temporary Password' }}</span>
                </button>
              </div>
              <p class="text-[10px] text-amber-700 mt-1 font-mono">
                Securely communicate this credential to the user. It will not be shown again.
              </p>
            </div>
          </div>

          <button (click)="temporaryCredentialAlert = null" class="text-amber-700 hover:text-amber-900 text-sm p-1 font-mono">✕</button>
        </div>
      </div>

      <!-- User Ledger Search & Filter Strip -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        
        <!-- Filter Controls -->
        <div class="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
          <div class="relative w-full md:w-80">
            <input [(ngModel)]="searchQuery" (input)="filterUsers()" type="text"
                   placeholder="Search by name, username, payroll..."
                   class="w-full pl-8 pr-3 py-1.5 rounded bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#113F2E] font-mono text-xs">
            <svg class="w-4 h-4 text-slate-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>

          <div class="flex items-center gap-2 w-full md:w-auto">
            <!-- Role Filter -->
            <select [(ngModel)]="roleFilter" (change)="filterUsers()"
                    class="px-2.5 py-1.5 rounded bg-white border border-slate-300 text-slate-800 text-xs font-mono">
              <option value="">All Roles</option>
              <option value="ROLE_ADMIN">System Admin</option>
              <option value="ROLE_TREASURER">Treasurer</option>
              <option value="ROLE_WELFARE_OFFICER">Welfare Officer</option>
              <option value="ROLE_AUDITOR">Internal Auditor</option>
              <option value="ROLE_MEMBER">Ordinary Member</option>
            </select>

            <!-- Status Filter -->
            <select [(ngModel)]="statusFilter" (change)="filterUsers()"
                    class="px-2.5 py-1.5 rounded bg-white border border-slate-300 text-slate-800 text-xs font-mono">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="deactivated">Deactivated</option>
              <option value="must_change">Password Pending</option>
            </select>

            <button (click)="loadUsers()" class="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono transition" title="Refresh">
              ↻
            </button>
          </div>
        </div>

        <!-- Users Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200 font-mono text-[10px]">
              <tr>
                <th class="py-3 px-4">User Details</th>
                <th class="py-3 px-4">Staff Payroll</th>
                <th class="py-3 px-4">Assigned Role</th>
                <th class="py-3 px-4">Status &amp; Security</th>
                <th class="py-3 px-4">Last Activity</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let u of filteredUsers" class="hover:bg-slate-50/70 transition">
                
                <!-- User Details -->
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-full bg-[#0C2419] text-emerald-400 font-bold flex items-center justify-center text-xs shadow-xs border border-[#1B4332] flex-shrink-0">
                      {{ (u.fullName || u.username).charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-bold text-slate-900">{{ u.fullName || u.username }}</p>
                      <p class="text-[10px] text-slate-500 font-mono leading-tight">&#64;{{ u.username }} <span *ngIf="u.email">• {{ u.email }}</span></p>
                    </div>
                  </div>
                </td>

                <!-- Payroll -->
                <td class="py-3 px-4 font-mono text-slate-700">
                  {{ u.payrollNo || '—' }}
                </td>

                <!-- Assigned Role -->
                <td class="py-3 px-4">
                  <div class="flex flex-wrap gap-1">
                    <span *ngFor="let role of u.roles" 
                          [ngClass]="getRoleBadgeClass(role)"
                          class="px-2 py-0.5 rounded text-[10px] font-mono font-bold border">
                      {{ formatRoleName(role) }}
                    </span>
                  </div>
                </td>

                <!-- Status & Security -->
                <td class="py-3 px-4">
                  <div class="space-y-1">
                    <span [ngClass]="u.enabled ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'"
                          class="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border">
                      {{ u.enabled ? 'ACTIVE' : 'DEACTIVATED' }}
                    </span>
                    <div *ngIf="u.mustChangePassword" class="flex items-center gap-1 text-[10px] font-mono text-amber-700">
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>1st-Login Pending</span>
                    </div>
                  </div>
                </td>

                <!-- Last Activity -->
                <td class="py-3 px-4 font-mono text-[10px] text-slate-500">
                  {{ u.lastLoginAt ? (u.lastLoginAt | date:'yyyy-MM-dd HH:mm') : 'Never logged in' }}
                </td>

                <!-- Administrative Actions -->
                <td class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    
                    <!-- Edit Button -->
                    <button (click)="openEditModal(u)" 
                            class="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                            title="Edit User Details &amp; Roles">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    </button>

                    <!-- Reset Password Trigger -->
                    <button (click)="initiatePasswordReset(u)"
                            class="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition"
                            title="Issue New Temporary Password">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                    </button>

                    <!-- Activate / Deactivate Toggle -->
                    <button (click)="toggleStatus(u)"
                            [ngClass]="u.enabled ? 'text-rose-600 hover:text-rose-800 hover:bg-rose-50' : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'"
                            class="p-1.5 rounded transition"
                            [title]="u.enabled ? 'Deactivate Account' : 'Activate Account'">
                      <svg *ngIf="u.enabled" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                      <svg *ngIf="!u.enabled" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </button>

                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ========================================================
           REGISTER NEW USER MODAL
           ======================================================== -->
      <div *ngIf="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
        <div class="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full p-6 text-xs animate-dropdown">
          
          <div class="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Register Staff / Member Account</h3>
              <p class="text-[11px] text-slate-500">Generates temporary credential with mandatory first-login password change</p>
            </div>
            <button (click)="showCreateModal = false" class="text-slate-400 hover:text-slate-700 font-mono text-sm">✕</button>
          </div>

          <!-- Error Alert in Modal -->
          <div *ngIf="modalError" class="mt-4 p-2.5 rounded border border-rose-200 bg-rose-50 text-rose-800 text-[11px]">
            {{ modalError }}
          </div>

          <form class="space-y-3.5 mt-4" (ngSubmit)="submitCreateUser()">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input [(ngModel)]="newUser.fullName" name="fullName" type="text" required
                       placeholder="e.g. Dr. Jane Kamau"
                       class="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E]">
              </div>

              <div>
                <label class="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Username *
                </label>
                <input [(ngModel)]="newUser.username" name="username" type="text" required
                       placeholder="e.g. jkamau or NARL-1010"
                       class="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E] font-mono">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Staff Payroll Number
                </label>
                <input [(ngModel)]="newUser.payrollNo" name="payrollNo" type="text"
                       placeholder="e.g. NARL-1010"
                       class="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E] font-mono">
              </div>

              <div>
                <label class="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input [(ngModel)]="newUser.phoneNumber" name="phoneNumber" type="text"
                       placeholder="+254 7..."
                       class="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E] font-mono">
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Institutional Email Address
              </label>
              <input [(ngModel)]="newUser.email" name="email" type="email"
                     placeholder="e.g. jkamau@kalro.org"
                     class="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E] font-mono">
            </div>

            <!-- Role Selector -->
            <div>
              <label class="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Assigned RFQ Security Role *
              </label>
              <select [(ngModel)]="newUserRole" name="role" required
                      class="w-full px-2.5 py-2 rounded bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E] font-mono">
                <option value="ROLE_MEMBER">Ordinary Member (Self-Service: Shares, Amortization, Statements)</option>
                <option value="ROLE_TREASURER">Treasurer / Finance Officer (Checkoff, Loans, Reconciliation)</option>
                <option value="ROLE_WELFARE_OFFICER">Welfare / Management Officer (Benevolence, Gifts, Biodata)</option>
                <option value="ROLE_AUDITOR">Internal Auditor (Compliance, Audit Trail Inspection)</option>
                <option value="ROLE_ADMIN">System Administrator (Full Custodian Access)</option>
              </select>
            </div>

            <div class="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600">
              <p class="font-bold text-slate-800">Security Workflow Note:</p>
              <p class="mt-0.5">The system will generate a cryptographically strong temporary password and mark the account for <strong>mandatory password change</strong>. The temporary credential will be displayed upon creation.</p>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" (click)="showCreateModal = false" class="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button type="submit" [disabled]="submitting"
                      class="px-4 py-1.5 rounded bg-[#0F291E] hover:bg-[#1B4332] text-white font-medium shadow-xs transition flex items-center gap-1.5">
                <span *ngIf="submitting" class="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></span>
                <span>{{ submitting ? 'Registering...' : 'Provision Account' }}</span>
              </button>
            </div>
          </form>

        </div>
      </div>

      <!-- ========================================================
           EDIT USER MODAL
           ======================================================== -->
      <div *ngIf="showEditModal && editingUser" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
        <div class="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full p-6 text-xs animate-dropdown">
          
          <div class="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 class="text-sm font-bold text-slate-900">Edit User Details &amp; Roles</h3>
              <p class="text-[11px] text-slate-500 font-mono">&#64;{{ editingUser.username }}</p>
            </div>
            <button (click)="showEditModal = false" class="text-slate-400 hover:text-slate-700 font-mono text-sm">✕</button>
          </div>

          <form class="space-y-3.5 mt-4" (ngSubmit)="submitUpdateUser()">
            <div>
              <label class="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input [(ngModel)]="editForm.fullName" name="editFullName" type="text" required
                     class="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E]">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input [(ngModel)]="editForm.email" name="editEmail" type="email"
                       class="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E] font-mono">
              </div>

              <div>
                <label class="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input [(ngModel)]="editForm.phoneNumber" name="editPhone" type="text"
                       class="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E] font-mono">
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Staff Payroll Number
              </label>
              <input [(ngModel)]="editForm.payrollNo" name="editPayroll" type="text"
                     class="w-full px-2.5 py-1.5 rounded bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E] font-mono">
            </div>

            <div>
              <label class="block text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Primary Security Role *
              </label>
              <select [(ngModel)]="editRole" name="editRole" required
                      class="w-full px-2.5 py-2 rounded bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E] font-mono">
                <option value="ROLE_MEMBER">Ordinary Member</option>
                <option value="ROLE_TREASURER">Treasurer / Finance Officer</option>
                <option value="ROLE_WELFARE_OFFICER">Welfare / Management Officer</option>
                <option value="ROLE_AUDITOR">Internal Auditor</option>
                <option value="ROLE_ADMIN">System Administrator</option>
              </select>
            </div>

            <div class="flex items-center gap-2 pt-2">
              <input [(ngModel)]="editForm.enabled" name="editEnabled" type="checkbox" id="editEnabled" class="rounded text-[#0F291E]">
              <label for="editEnabled" class="text-xs text-slate-700 font-medium">Account is active and authorized for login</label>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" (click)="showEditModal = false" class="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button type="submit" [disabled]="submitting"
                      class="px-4 py-1.5 rounded bg-[#0F291E] hover:bg-[#1B4332] text-white font-medium shadow-xs transition flex items-center gap-1.5">
                <span *ngIf="submitting" class="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></span>
                <span>{{ submitting ? 'Updating...' : 'Save Profile Changes' }}</span>
              </button>
            </div>
          </form>

        </div>
      </div>

    </div>
  `
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery = '';
  roleFilter = '';
  statusFilter = '';

  // Registration Modal state
  showCreateModal = false;
  newUser: any = { fullName: '', username: '', email: '', phoneNumber: '', payrollNo: '' };
  newUserRole = 'ROLE_MEMBER';
  modalError = '';
  submitting = false;

  // Edit Modal state
  showEditModal = false;
  editingUser: User | null = null;
  editForm: UserUpdateRequest = { fullName: '', email: '', phoneNumber: '', payrollNo: '', roles: [], enabled: true };
  editRole = 'ROLE_MEMBER';

  // Temporary password alert
  temporaryCredentialAlert: { username: string; password: string } | null = null;
  copied = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.authService.getAllUsers().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.users = res.data;
          this.filterUsers();
        }
      }
    });
  }

  filterUsers(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(u => {
      const matchesQuery = !q ||
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.payrollNo && u.payrollNo.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q));

      const matchesRole = !this.roleFilter || u.roles.includes(this.roleFilter);

      let matchesStatus = true;
      if (this.statusFilter === 'active') matchesStatus = !!u.enabled;
      else if (this.statusFilter === 'deactivated') matchesStatus = !u.enabled;
      else if (this.statusFilter === 'must_change') matchesStatus = !!u.mustChangePassword;

      return matchesQuery && matchesRole && matchesStatus;
    });
  }

  getActiveCount(): number {
    return this.users.filter(u => u.enabled).length;
  }

  getPendingPasswordChangeCount(): number {
    return this.users.filter(u => u.mustChangePassword).length;
  }

  getDeactivatedCount(): number {
    return this.users.filter(u => !u.enabled).length;
  }

  openCreateModal(): void {
    this.newUser = { fullName: '', username: '', email: '', phoneNumber: '', payrollNo: '' };
    this.newUserRole = 'ROLE_MEMBER';
    this.modalError = '';
    this.showCreateModal = true;
  }

  submitCreateUser(): void {
    this.modalError = '';
    this.submitting = true;

    const payload = {
      ...this.newUser,
      roles: [this.newUserRole]
    };

    this.authService.createUser(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        this.showCreateModal = false;
        this.loadUsers();

        if (res && res.data && res.data.temporaryPassword) {
          this.temporaryCredentialAlert = {
            username: res.data.user.username,
            password: res.data.temporaryPassword
          };
          this.copied = false;
        }
      },
      error: (err) => {
        this.submitting = false;
        this.modalError = err.error?.message || 'Failed to create user. Verify uniqueness of username and email.';
      }
    });
  }

  openEditModal(u: User): void {
    this.editingUser = u;
    this.editForm = {
      fullName: u.fullName,
      email: u.email,
      phoneNumber: u.phoneNumber,
      payrollNo: u.payrollNo,
      roles: [...u.roles],
      enabled: u.enabled
    };
    this.editRole = u.roles[0] || 'ROLE_MEMBER';
    this.showEditModal = true;
  }

  submitUpdateUser(): void {
    if (!this.editingUser || !this.editingUser.id) return;
    this.submitting = true;

    this.editForm.roles = [this.editRole];

    this.authService.updateUser(this.editingUser.id, this.editForm).subscribe({
      next: () => {
        this.submitting = false;
        this.showEditModal = false;
        this.loadUsers();
      },
      error: (err) => {
        this.submitting = false;
        alert(err.error?.message || 'Failed to update user profile.');
      }
    });
  }

  initiatePasswordReset(u: User): void {
    if (!u.id) return;
    if (!confirm(`Generate a replacement temporary password for @${u.username}? This will require them to establish a new password upon their next login.`)) {
      return;
    }

    this.authService.resetUserPassword(u.id).subscribe({
      next: (res) => {
        if (res && res.data && res.data.temporaryPassword) {
          this.temporaryCredentialAlert = {
            username: u.username,
            password: res.data.temporaryPassword
          };
          this.copied = false;
          this.loadUsers();
        }
      },
      error: (err) => {
        alert(err.error?.message || 'Password reset failed.');
      }
    });
  }

  toggleStatus(u: User): void {
    if (!u.id) return;
    const action = u.enabled ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} user account @${u.username}?`)) {
      return;
    }

    this.authService.toggleUserStatus(u.id, !u.enabled).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to update status.');
      }
    });
  }

  copyCredential(text: string): void {
    navigator.clipboard.writeText(text);
    this.copied = true;
    setTimeout(() => this.copied = false, 2500);
  }

  formatRoleName(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN': return 'System Admin';
      case 'ROLE_TREASURER': return 'Treasurer';
      case 'ROLE_WELFARE_OFFICER': return 'Welfare Officer';
      case 'ROLE_AUDITOR': return 'Auditor';
      case 'ROLE_MEMBER': return 'Member';
      default: return role;
    }
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
