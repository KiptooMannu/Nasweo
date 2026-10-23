import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex flex-col h-screen w-full bg-[#F8FAFC] overflow-hidden font-sans">
      
      <!-- ========================================================
           1. FULL-WIDTH TOP NAVBAR (Edge-to-Edge: 0 to 100vw)
           Uniform Background Color, Justified Layout, No Shortcuts
           ======================================================== -->
      <header class="w-full h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 flex-shrink-0 shadow-xs no-print">
        
        <!-- Left: Brand Identity & Sidenav Toggle Controls -->
        <div class="flex items-center gap-3 sm:gap-4 min-w-0">
          
          <!-- Mobile Hamburger Toggle Button -->
          <button (click)="mobileSidebarOpen = !mobileSidebarOpen" 
                  class="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition lg:hidden"
                  title="Toggle Navigation Menu">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <!-- Desktop Sidebar Collapse Toggle Button -->
          <button (click)="isDesktopCollapsed = !isDesktopCollapsed"
                  class="hidden lg:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                  [title]="isDesktopCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'">
            <svg class="w-4 h-4 transition-transform duration-200" [ngClass]="{'rotate-180': isDesktopCollapsed}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            </svg>
          </button>

          <!-- Official Brand Lockup -->
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-[#0C2419] border border-[#1B4332] flex items-center justify-center text-white shadow-xs flex-shrink-0">
              <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 leading-none">
                <span class="text-slate-900 font-extrabold text-sm sm:text-base tracking-wide">NASWEO</span>
                <span class="text-[9px] font-mono tracking-wider px-1 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">NARL</span>
              </div>
              <p class="text-[11px] text-slate-500 font-medium truncate mt-0.5 hidden xs:block sm:block">
                Staff Welfare Organization
              </p>
            </div>
          </div>
        </div>


        <!-- Right: Institutional Affiliation & Interactive User Profile Trigger -->
        <div class="flex items-center gap-3 relative" id="profile-container">
          
          <!-- Institutional Division Tag -->
          <div class="text-right text-xs hidden xl:block">
            <span class="text-slate-700 font-medium block">National Agricultural Research Laboratories</span>
            <span class="text-[10px] text-slate-400 font-mono">Kabete Campus • Welfare Scheme</span>
          </div>

          <div class="h-6 w-px bg-slate-200 hidden xl:block"></div>

          <!-- Interactive Profile Trigger Button (CLICK TO VIEW USER DETAILS) -->
          <button (click)="toggleProfileDropdown($event)"
                  class="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-[#1B4332]/20"
                  title="Click to view User Profile &amp; Role Details">
            <div class="relative">
              <div class="w-8 h-8 rounded-full bg-[#0C2419] text-emerald-300 font-bold flex items-center justify-center text-xs shadow-xs border border-[#1B4332]">
                {{ (currentUser?.fullName || currentUser?.username || 'U').charAt(0).toUpperCase() }}
              </div>
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            
            <div class="text-left hidden sm:block max-w-[120px] md:max-w-[150px]">
              <p class="text-xs font-bold text-slate-800 truncate leading-tight">{{ currentUser?.fullName || currentUser?.username }}</p>
              <p class="text-[10px] text-emerald-800 font-mono leading-tight">{{ formatPrimaryRole() }}</p>
            </div>

            <!-- Animated Chevron Indicator -->
            <svg class="w-4 h-4 text-slate-400 transition-transform duration-200" [ngClass]="{'rotate-180': showProfileDropdown}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <!-- ========================================================
               INTERACTIVE USER PROFILE DETAILS FLYOUT CARD
               ======================================================== -->
          <div *ngIf="showProfileDropdown" 
               (click)="$event.stopPropagation()"
               class="absolute right-0 top-14 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-5 text-xs animate-dropdown font-sans">
            
            <!-- Profile Header -->
            <div class="flex items-start justify-between pb-4 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-[#0C2419] text-emerald-400 font-bold flex items-center justify-center text-lg shadow-sm border border-[#1B4332]">
                  {{ (currentUser?.fullName || currentUser?.username || 'U').charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h4 class="font-bold text-slate-900 text-sm">{{ currentUser?.fullName || currentUser?.username }}</h4>
                  <p class="text-slate-500 text-[11px] font-mono">&#64;{{ currentUser?.username }}</p>
                  <span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {{ formatPrimaryRole() | uppercase }}
                  </span>
                </div>
              </div>

              <button (click)="showProfileDropdown = false" class="text-slate-400 hover:text-slate-700 p-1" title="Close Profile">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <!-- Comprehensive User Biodata & Credentials -->
            <div class="py-3.5 space-y-2.5 border-b border-slate-100">
              <div class="flex justify-between items-center text-xs">
                <span class="text-slate-500">Staff Payroll Identifier</span>
                <span *ngIf="currentUser?.payrollNo" class="font-mono font-bold text-slate-900">{{ currentUser?.payrollNo }}</span>
                <span *ngIf="!currentUser?.payrollNo" class="font-mono text-slate-400 italic">Not Assigned (Staff Officer)</span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span class="text-slate-500">Institutional Station</span>
                <span class="font-medium text-slate-800">NARL Kabete HQ, Nairobi</span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span class="text-slate-500">Security Clearance</span>
                <span class="text-emerald-800 font-mono font-semibold">Tier-1 Authorized</span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <span class="text-slate-500">Session Encryption</span>
                <span class="text-[11px] font-mono text-slate-600">256-bit AES JWT</span>
              </div>
            </div>

            <!-- Assigned Roles List -->
            <div class="py-3 border-b border-slate-100">
              <p class="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1.5">Assigned RFQ Permissions</p>
              <div class="flex flex-wrap gap-1.5">
                <span *ngFor="let role of currentUser?.roles" class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                  {{ role }}
                </span>
              </div>
            </div>


            <!-- Quick Account Actions -->
            <div class="py-2.5 border-b border-slate-100 flex items-center justify-between">
              <a routerLink="/change-password" (click)="showProfileDropdown = false" class="text-xs font-mono font-medium text-emerald-800 hover:text-emerald-950 flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                <span>Update Password</span>
              </a>
              <a *ngIf="hasRole('ROLE_ADMIN')" routerLink="/admin/users" (click)="showProfileDropdown = false" class="text-xs font-mono font-medium text-amber-800 hover:text-amber-950 flex items-center gap-1">
                <span>Admin Users</span> &rarr;
              </a>
            </div>

            <!-- Sign Out Trigger -->
            <div class="pt-3 flex justify-between items-center">
              <span class="text-[10px] text-slate-400 font-mono">Session ID: #{{ currentUser?.id || '9012' }}</span>
              <button (click)="logout()" class="px-3 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs border border-rose-200 transition flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                <span>Sign Out</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      <!-- ========================================================
           2. BODY CONTAINER: Sidenav + Main Application Canvas
           ======================================================== -->
      <div class="flex flex-1 min-h-0 overflow-hidden relative">
        
        <!-- Mobile Drawer Backdrop Overlay -->
        <div *ngIf="mobileSidebarOpen" 
             (click)="mobileSidebarOpen = false"
             class="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity lg:hidden animate-fade-in no-print">
        </div>

        <!-- Institutional Sidenav (Positioned Underneath Full-Width Navbar) -->
        <aside [ngClass]="{
                 'translate-x-0': mobileSidebarOpen,
                 '-translate-x-full lg:translate-x-0': !mobileSidebarOpen,
                 'w-64': !isDesktopCollapsed,
                 'w-20': isDesktopCollapsed
               }"
               class="fixed lg:static inset-y-0 lg:inset-y-auto lg:top-0 left-0 z-40 lg:z-10 bg-[#0C2419] text-slate-300 flex flex-col flex-shrink-0 shadow-lg border-r border-[#1B4332] transition-all duration-300 ease-in-out no-print h-full">
          
          <!-- Mobile Drawer Header with Close Button -->
          <div class="h-14 flex items-center justify-between px-4 bg-[#071710] border-b border-[#1B4332] lg:hidden">
            <span class="text-xs font-bold text-white uppercase tracking-wider font-mono">Menu Navigation</span>
            <button (click)="mobileSidebarOpen = false" class="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#1B4332] transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Navigation Section -->
          <nav class="flex-1 px-3 py-4 space-y-4 overflow-y-auto custom-scrollbar text-xs">
            
            <!-- Core Operations Group -->
            <ng-container *ngIf="!isOrdinaryMember">
              <div>
                <p *ngIf="!isDesktopCollapsed" class="px-3 text-[10px] font-bold text-emerald-400/80 tracking-wider uppercase mb-1.5">
                  Executive &amp; Operations
                </p>
                <div class="space-y-1">
                  <a routerLink="/dashboard" (click)="mobileSidebarOpen = false" routerLinkActive="bg-[#173F2E] text-white border-l-4 border-emerald-400 font-medium shadow-xs" 
                     class="flex items-center gap-3 px-3 py-2 rounded-r text-slate-300 hover:bg-[#153829] hover:text-white transition group"
                     [title]="isDesktopCollapsed ? 'Executive Overview' : ''">
                    <svg class="w-4 h-4 text-emerald-400/90 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    <span *ngIf="!isDesktopCollapsed" class="truncate">Executive Overview</span>
                  </a>

                  <a routerLink="/members" (click)="mobileSidebarOpen = false" routerLinkActive="bg-[#173F2E] text-white border-l-4 border-emerald-400 font-medium shadow-xs" 
                     class="flex items-center gap-3 px-3 py-2 rounded-r text-slate-300 hover:bg-[#153829] hover:text-white transition group"
                     [title]="isDesktopCollapsed ? 'Members & Radar' : ''">
                    <svg class="w-4 h-4 text-emerald-400/90 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    <span *ngIf="!isDesktopCollapsed" class="truncate">Membership &amp; Radar</span>
                  </a>

                  <a routerLink="/contributions" (click)="mobileSidebarOpen = false" routerLinkActive="bg-[#173F2E] text-white border-l-4 border-emerald-400 font-medium shadow-xs" 
                     class="flex items-center gap-3 px-3 py-2 rounded-r text-slate-300 hover:bg-[#153829] hover:text-white transition group"
                     [title]="isDesktopCollapsed ? 'Contributions & Checkoff' : ''">
                    <svg class="w-4 h-4 text-emerald-400/90 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span *ngIf="!isDesktopCollapsed" class="truncate">Contributions &amp; Checkoff</span>
                  </a>

                  <a routerLink="/loans" (click)="mobileSidebarOpen = false" routerLinkActive="bg-[#173F2E] text-white border-l-4 border-emerald-400 font-medium shadow-xs" 
                     class="flex items-center gap-3 px-3 py-2 rounded-r text-slate-300 hover:bg-[#153829] hover:text-white transition group"
                     [title]="isDesktopCollapsed ? 'Loan Amortization' : ''">
                    <svg class="w-4 h-4 text-emerald-400/90 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                    <span *ngIf="!isDesktopCollapsed" class="truncate">Loan Amortization</span>
                  </a>

                  <a routerLink="/welfare" (click)="mobileSidebarOpen = false" routerLinkActive="bg-[#173F2E] text-white border-l-4 border-emerald-400 font-medium shadow-xs" 
                     class="flex items-center gap-3 px-3 py-2 rounded-r text-slate-300 hover:bg-[#153829] hover:text-white transition group"
                     [title]="isDesktopCollapsed ? 'Benevolence & Grants' : ''">
                    <svg class="w-4 h-4 text-emerald-400/90 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                    <span *ngIf="!isDesktopCollapsed" class="truncate">Benevolence &amp; Grants</span>
                  </a>
                </div>
              </div>

              <!-- Reports & Statements Group (RFQ Scope 2.F) -->
              <div>
                <p *ngIf="!isDesktopCollapsed" class="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                  Reports &amp; Statements
                </p>
                <div class="space-y-1">
                  <a routerLink="/reports" (click)="mobileSidebarOpen = false" routerLinkActive="bg-[#173F2E] text-white border-l-4 border-emerald-400 font-medium shadow-xs" 
                     class="flex items-center gap-3 px-3 py-2 rounded-r text-slate-300 hover:bg-[#153829] hover:text-white transition group"
                     [title]="isDesktopCollapsed ? 'Reports & Statements' : ''">
                    <svg class="w-4 h-4 text-emerald-400/90 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    <span *ngIf="!isDesktopCollapsed" class="truncate">Statutory Reports</span>
                    <span *ngIf="!isDesktopCollapsed" class="ml-auto text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">RFQ</span>
                  </a>
                </div>
              </div>

              <!-- Governance & Audit Group -->
              <div *ngIf="hasRole('ROLE_ADMIN') || hasRole('ROLE_AUDITOR')">
                <p *ngIf="!isDesktopCollapsed" class="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                  Governance &amp; Audit
                </p>
                <div class="space-y-1">
                  <a routerLink="/audit" (click)="mobileSidebarOpen = false" routerLinkActive="bg-[#173F2E] text-white border-l-4 border-emerald-400 font-medium shadow-xs" 
                     class="flex items-center gap-3 px-3 py-2 rounded-r text-slate-300 hover:bg-[#153829] hover:text-white transition group"
                     [title]="isDesktopCollapsed ? 'Compliance Audit Trail' : ''">
                    <svg class="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    <span *ngIf="!isDesktopCollapsed" class="truncate">Compliance Audit Trail</span>
                  </a>
                </div>
              </div>

              <!-- Dedicated Administration Group (Visible strictly to ROLE_ADMIN) -->
              <div *ngIf="hasRole('ROLE_ADMIN')">
                <p *ngIf="!isDesktopCollapsed" class="px-3 text-[10px] font-bold text-amber-400/90 tracking-wider uppercase mb-1.5 flex items-center justify-between">
                  <span>Administration</span>
                  <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800/80">RBAC</span>
                </p>
                <div class="space-y-1">
                  <a routerLink="/admin/users" (click)="mobileSidebarOpen = false" routerLinkActive="bg-[#173F2E] text-white border-l-4 border-amber-400 font-medium shadow-xs" 
                     class="flex items-center gap-3 px-3 py-2 rounded-r text-slate-300 hover:bg-[#153829] hover:text-white transition group"
                     [title]="isDesktopCollapsed ? 'User Management' : ''">
                    <svg class="w-4 h-4 text-amber-400/90 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    <span *ngIf="!isDesktopCollapsed" class="truncate">User Management</span>
                  </a>

                  <a routerLink="/admin/roles" (click)="mobileSidebarOpen = false" routerLinkActive="bg-[#173F2E] text-white border-l-4 border-amber-400 font-medium shadow-xs" 
                     class="flex items-center gap-3 px-3 py-2 rounded-r text-slate-300 hover:bg-[#153829] hover:text-white transition group"
                     [title]="isDesktopCollapsed ? 'Role Management' : ''">
                    <svg class="w-4 h-4 text-amber-400/90 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                    <span *ngIf="!isDesktopCollapsed" class="truncate">Role Management</span>
                  </a>
                </div>
              </div>
            </ng-container>

            <!-- Member Self-Service Group -->
            <div>
              <p *ngIf="!isDesktopCollapsed" class="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                Member Self-Service
              </p>
              <div class="space-y-1">
                <a routerLink="/my-account" (click)="mobileSidebarOpen = false" routerLinkActive="bg-[#173F2E] text-white border-l-4 border-emerald-400 font-medium shadow-xs" 
                   class="flex items-center gap-3 px-3 py-2 rounded-r text-slate-300 hover:bg-[#153829] hover:text-white transition group"
                   [title]="isDesktopCollapsed ? 'My Welfare Statement' : ''">
                  <svg class="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  <span *ngIf="!isDesktopCollapsed" class="truncate">My Welfare Statement</span>
                </a>
              </div>
            </div>
          </nav>

          <!-- Sidenav User Terminal Footer -->
          <div class="p-3 border-t border-[#1B4332] bg-[#071710]">
            <div class="flex items-center justify-between">
              <div *ngIf="!isDesktopCollapsed" class="min-w-0 pr-2">
                <p class="text-xs font-semibold text-white truncate">{{ currentUser?.fullName || currentUser?.username }}</p>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span class="text-[10px] font-mono text-emerald-300/90 tracking-tight">
                    {{ formatPrimaryRole() }}
                  </span>
                </div>
              </div>
              <button (click)="logout()" title="Secure Logout" class="p-2 text-slate-400 hover:text-white hover:bg-[#1B4332] rounded transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              </button>
            </div>
          </div>
        </aside>

        <!-- Routed Content Main Canvas -->
        <main class="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 bg-[#F8FAFC]">
          <router-outlet></router-outlet>
        </main>
      </div>

    </div>
  `
})
export class LayoutComponent {
  mobileSidebarOpen = false;
  isDesktopCollapsed = false;
  showProfileDropdown = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.querySelector('#profile-container')?.contains(target)) {
      this.showProfileDropdown = false;
    }
  }

  toggleProfileDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  get isOrdinaryMember(): boolean {
    return this.authService.isOrdinaryMember();
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  formatPrimaryRole(): string {
    const roles = this.currentUser?.roles || [];
    if (roles.includes('ROLE_ADMIN')) return 'System Administrator';
    if (roles.includes('ROLE_TREASURER')) return 'Treasurer';
    if (roles.includes('ROLE_WELFARE_OFFICER')) return 'Welfare Officer';
    if (roles.includes('ROLE_AUDITOR')) return 'Internal Auditor';
    if (roles.includes('ROLE_MEMBER')) return 'Ordinary Member';
    return 'Staff User';
  }

  getActiveRouteTitle(): string {
    const url = this.router.url;
    if (url.includes('admin/users')) return 'User Account Administration';
    if (url.includes('admin/roles')) return 'Role & Permissions Catalog';
    if (url.includes('dashboard')) return 'Executive Management Overview';
    if (url.includes('members')) return 'Member Registry & Retirement Radar';
    if (url.includes('contributions')) return 'Contributions & Employer Checkoff';
    if (url.includes('loans')) return 'Loan Portfolio & Amortization';
    if (url.includes('welfare')) return 'Benevolence & Special Occasions';
    if (url.includes('reports')) return 'Statutory Compliance Reports';
    if (url.includes('my-account')) return 'Member Self-Service Statement';
    if (url.includes('audit')) return 'Compliance Audit Trail';
    return 'Data Management';
  }

  logout() {
    this.showProfileDropdown = false;
    this.authService.logout();
  }
}

