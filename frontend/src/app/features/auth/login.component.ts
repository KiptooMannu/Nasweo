import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[#F4F6F8] flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <!-- Institutional Top Bar -->
      <div class="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded border border-slate-300/80 bg-white shadow-xs text-xs font-mono text-slate-600 mb-4">
          <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>NARL KABETE • WELFARE DATA MANAGEMENT SYSTEM</span>
        </div>
        
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          NASWEO Portal Authentication
        </h1>
        <p class="mt-1 text-xs text-slate-600 max-w-md mx-auto">
          National Agricultural Research Laboratories Staff Welfare Organization — Member Contributions, Amortized Credit &amp; Benevolence Registry.
        </p>
      </div>

      <!-- Authentication Terminal -->
      <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-6 sm:px-8 border border-slate-200 rounded-lg shadow-sm">
          
          <!-- Security Alert / Error Notice -->
          <div *ngIf="errorMessage" class="mb-5 p-3 rounded border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-start gap-2.5">
            <svg class="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <span class="font-medium">{{ errorMessage }}</span>
          </div>

          <form class="space-y-4" (ngSubmit)="onLogin()">
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Staff Payroll Number or Username
              </label>
              <div class="relative">
                <input [(ngModel)]="username" name="username" type="text" required
                       placeholder="e.g. admin or NARL-1001"
                       class="w-full px-3 py-2 rounded bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E] focus:border-[#113F2E] transition font-mono">
              </div>
              <p class="mt-1 text-[10px] text-slate-400">Use your NARL designated payroll identifier or system handle.</p>
            </div>

            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span class="text-[10px] text-slate-400 font-mono">Confidential</span>
              </div>
              <input [(ngModel)]="password" name="password" type="password" required
                     placeholder="••••••••"
                     class="w-full px-3 py-2 rounded bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E] focus:border-[#113F2E] transition font-mono">
            </div>

            <button type="submit" [disabled]="loading"
                    class="w-full mt-2 py-2.5 px-4 rounded bg-[#0F291E] hover:bg-[#1B4332] text-white font-medium text-xs shadow-xs focus:outline-none transition flex items-center justify-center gap-2 disabled:opacity-50">
              <span *ngIf="loading" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></span>
              {{ loading ? 'Verifying Credentials...' : 'Authenticate & Enter Portal' }}
            </button>
          </form>

          <!-- RFQ Demonstration Role Selector -->
          <div class="mt-6 pt-5 border-t border-slate-200">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                RFQ Evaluation Preset Accounts
              </span>
              <span class="text-[9px] font-mono text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
                Live Test Seed
              </span>
            </div>
            
            <div class="grid grid-cols-2 gap-1.5 text-xs">
              <button type="button" (click)="fillCredentials('admin', 'admin123')"
                      class="p-2 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition">
                <div class="text-[11px] font-bold text-slate-800">System Admin</div>
                <div class="text-[10px] text-slate-500 font-mono">admin / admin123</div>
              </button>

              <button type="button" (click)="fillCredentials('treasurer', 'treasurer123')"
                      class="p-2 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition">
                <div class="text-[11px] font-bold text-slate-800">Treasurer</div>
                <div class="text-[10px] text-slate-500 font-mono">treasurer / treasurer123</div>
              </button>

              <button type="button" (click)="fillCredentials('welfare_officer', 'welfare123')"
                      class="p-2 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition">
                <div class="text-[11px] font-bold text-slate-800">Welfare Officer</div>
                <div class="text-[10px] text-slate-500 font-mono">welfare / welfare123</div>
              </button>

              <button type="button" (click)="fillCredentials('auditor', 'auditor123')"
                      class="p-2 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition">
                <div class="text-[11px] font-bold text-slate-800">Internal Auditor</div>
                <div class="text-[10px] text-slate-500 font-mono">auditor / auditor123</div>
              </button>

              <button type="button" (click)="fillCredentials('member001', 'member123')"
                      class="col-span-2 p-2 rounded border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 text-left transition">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-bold text-emerald-900">Dr. Patrick Mwangi (Scientist, 65y)</span>
                  <span class="text-[9px] font-mono text-emerald-700 bg-white px-1 py-0.2 rounded border border-emerald-200">Self-Service</span>
                </div>
                <div class="text-[10px] text-emerald-800/80 font-mono">member001 / member123</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Institutional Footer -->
      <div class="text-center text-[11px] text-slate-400 mt-6 font-mono">
        <p>NARL Welfare Data System • ISO/IEC 27001 Compliance Architecture</p>
        <p class="mt-0.5 text-slate-400">All logins and financial ledger mutations are cryptographically audited.</p>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = 'admin';
  password = 'admin123';
  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  fillCredentials(u: string, p: string) {
    this.username = u;
    this.password = p;
  }

  onLogin() {
    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (this.authService.mustChangePassword()) {
          this.router.navigate(['/change-password']);
        } else if (this.authService.isOrdinaryMember()) {
          this.router.navigate(['/my-account']);
        } else if (this.authService.isAuditor()) {
          this.router.navigate(['/audit']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid username or password. Please try again.';
      }
    });
  }
}
