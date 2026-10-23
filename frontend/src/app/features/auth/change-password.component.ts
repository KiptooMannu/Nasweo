import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-[#F4F6F8] flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <!-- Institutional Top Bar -->
      <div class="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded border border-slate-300/80 bg-white shadow-xs text-xs font-mono text-slate-600 mb-4">
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>SECURITY CLEARANCE • MANDATORY CREDENTIAL INITIALIZATION</span>
        </div>
        
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Set Permanent Secure Password
        </h1>
        <p class="mt-1 text-xs text-slate-600 max-w-md mx-auto">
          NARL Welfare Data Management System policy requires all accounts to establish a personal permanent password before gaining access to welfare ledgers and member records.
        </p>
      </div>

      <!-- Security Card Container -->
      <div class="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div class="bg-white py-8 px-6 sm:px-8 border border-slate-200 rounded-lg shadow-sm">
          
          <!-- First-Login Notice Banner -->
          <div *ngIf="isMandatoryChange" class="mb-5 p-3.5 rounded border border-amber-200 bg-amber-50 text-amber-900 text-xs flex items-start gap-2.5">
            <svg class="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <div>
              <p class="font-bold">First-Login Temporary Credential Detected</p>
              <p class="mt-0.5 text-amber-800">You are currently authenticated using an administrator-issued temporary password. Please establish your private password to unlock your assigned portal privileges.</p>
            </div>
          </div>

          <!-- Error Alert -->
          <div *ngIf="errorMessage" class="mb-5 p-3 rounded border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-start gap-2.5">
            <svg class="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="font-medium">{{ errorMessage }}</span>
          </div>

          <!-- Success Alert -->
          <div *ngIf="successMessage" class="mb-5 p-4 rounded border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs flex items-start gap-2.5">
            <svg class="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <p class="font-bold text-sm">{{ successMessage }}</p>
              <p class="mt-1 text-emerald-800">Your security status has been updated. Redirecting to your authorized dashboard...</p>
            </div>
          </div>

          <form *ngIf="!successMessage" class="space-y-4" (ngSubmit)="onSubmit()">
            
            <!-- Current / Temporary Password -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Current / Temporary Password
                </label>
                <span class="text-[10px] text-slate-400 font-mono">Issued by Administrator</span>
              </div>
              <input [(ngModel)]="currentPassword" name="currentPassword" type="password" required
                     placeholder="Enter your temporary or current password"
                     class="w-full px-3 py-2 rounded bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E] focus:border-[#113F2E] transition font-mono">
            </div>

            <!-- New Password -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  New Permanent Password
                </label>
                <span class="text-[10px] text-slate-400 font-mono">Min 8 Characters</span>
              </div>
              <input [(ngModel)]="newPassword" (input)="evaluatePassword()" name="newPassword" type="password" required
                     placeholder="Create your new strong password"
                     class="w-full px-3 py-2 rounded bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E] focus:border-[#113F2E] transition font-mono">
            </div>

            <!-- Real-time Password Complexity Radar -->
            <div class="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5 text-[11px]">
              <p class="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Institutional Password Policy</p>
              
              <div class="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <div class="flex items-center gap-1.5" [ngClass]="hasMinLength ? 'text-emerald-700' : 'text-slate-400'">
                  <span>{{ hasMinLength ? '✓' : '○' }}</span>
                  <span>8+ Characters</span>
                </div>
                <div class="flex items-center gap-1.5" [ngClass]="hasUpper ? 'text-emerald-700' : 'text-slate-400'">
                  <span>{{ hasUpper ? '✓' : '○' }}</span>
                  <span>Uppercase Letter (A-Z)</span>
                </div>
                <div class="flex items-center gap-1.5" [ngClass]="hasLower ? 'text-emerald-700' : 'text-slate-400'">
                  <span>{{ hasLower ? '✓' : '○' }}</span>
                  <span>Lowercase Letter (a-z)</span>
                </div>
                <div class="flex items-center gap-1.5" [ngClass]="hasDigit ? 'text-emerald-700' : 'text-slate-400'">
                  <span>{{ hasDigit ? '✓' : '○' }}</span>
                  <span>Numeric Digit (0-9)</span>
                </div>
                <div class="flex items-center gap-1.5 col-span-2" [ngClass]="hasSpecial ? 'text-emerald-700' : 'text-slate-400'">
                  <span>{{ hasSpecial ? '✓' : '○' }}</span>
                  <span>Special Symbol (&#64; # $ % ^ &amp; + = !)</span>
                </div>
              </div>
            </div>

            <!-- Confirm New Password -->
            <div>
              <label class="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input [(ngModel)]="confirmPassword" name="confirmPassword" type="password" required
                     placeholder="Re-type new password"
                     class="w-full px-3 py-2 rounded bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#113F2E] focus:border-[#113F2E] transition font-mono">
              <p *ngIf="confirmPassword && newPassword !== confirmPassword" class="mt-1 text-[10px] text-rose-600 font-mono">
                Passwords do not match.
              </p>
            </div>

            <button type="submit" [disabled]="loading || !isFormValid()"
                    class="w-full mt-3 py-2.5 px-4 rounded bg-[#0F291E] hover:bg-[#1B4332] text-white font-medium text-xs shadow-xs focus:outline-none transition flex items-center justify-center gap-2 disabled:opacity-50">
              <span *ngIf="loading" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></span>
              {{ loading ? 'Securing Account...' : 'Update Password & Access System' }}
            </button>
          </form>

          <!-- Cancel / Sign Out Option -->
          <div *ngIf="!successMessage" class="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span class="text-slate-500">Need help? Contact Welfare Administrator</span>
            <button type="button" (click)="onLogout()" class="text-rose-700 hover:text-rose-900 font-medium">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <!-- Institutional Footer -->
      <div class="text-center text-[11px] text-slate-400 mt-6 font-mono">
        <p>NARL Welfare Data System • Cryptographic Password Hashing (BCrypt 10-Round Salt)</p>
        <p class="mt-0.5 text-slate-400">All credential alterations are committed to the tamper-evident audit ledger.</p>
      </div>
    </div>
  `
})
export class ChangePasswordComponent implements OnInit {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  hasMinLength = false;
  hasUpper = false;
  hasLower = false;
  hasDigit = false;
  hasSpecial = false;

  constructor(private authService: AuthService, private router: Router) {}

  get isMandatoryChange(): boolean {
    return this.authService.mustChangePassword();
  }

  ngOnInit(): void {
    // If not authenticated, redirect to login
    if (!this.authService.getToken()) {
      this.router.navigate(['/login']);
    }
  }

  evaluatePassword(): void {
    const p = this.newPassword;
    this.hasMinLength = p.length >= 8;
    this.hasUpper = /[A-Z]/.test(p);
    this.hasLower = /[a-z]/.test(p);
    this.hasDigit = /[0-9]/.test(p);
    this.hasSpecial = /[@#$%^&+=!]/.test(p);
  }

  isFormValid(): boolean {
    return (
      this.currentPassword.length > 0 &&
      this.hasMinLength &&
      this.hasUpper &&
      this.hasLower &&
      this.hasDigit &&
      this.hasSpecial &&
      this.newPassword === this.confirmPassword &&
      this.newPassword !== this.currentPassword
    );
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.successMessage = 'Your permanent password has been verified and committed!';

        setTimeout(() => {
          if (this.authService.isOrdinaryMember()) {
            this.router.navigate(['/my-account']);
          } else if (this.authService.isAuditor()) {
            this.router.navigate(['/audit']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Password update failed. Please verify your current password.';
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
  }
}
