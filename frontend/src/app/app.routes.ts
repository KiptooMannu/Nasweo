import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { LoginComponent } from './features/auth/login.component';
import { ChangePasswordComponent } from './features/auth/change-password.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MembersComponent } from './features/members/members.component';
import { ContributionsComponent } from './features/contributions/contributions.component';
import { LoansComponent } from './features/loans/loans.component';
import { WelfareComponent } from './features/welfare/welfare.component';
import { MemberPortalComponent } from './features/member-portal/member-portal.component';
import { AuditComponent } from './features/audit/audit.component';
import { ReportsComponent } from './features/reports/reports.component';
import { UserManagementComponent } from './features/admin/user-management.component';
import { RoleManagementComponent } from './features/admin/role-management.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'members', component: MembersComponent },
      { path: 'contributions', component: ContributionsComponent },
      { path: 'loans', component: LoansComponent },
      { path: 'welfare', component: WelfareComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'my-account', component: MemberPortalComponent },
      { path: 'member-dashboard', redirectTo: 'my-account', pathMatch: 'full' },
      { path: 'audit', component: AuditComponent },
      // Administrative Routes (Protected by authGuard & Admin Role)
      { path: 'admin/users', component: UserManagementComponent },
      { path: 'admin/roles', component: RoleManagementComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
