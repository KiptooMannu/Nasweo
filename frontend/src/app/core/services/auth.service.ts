import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, ChangePasswordRequest, RoleMetadata, User, UserRegistrationResult, UserUpdateRequest } from '../models/user.model';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const stored = localStorage.getItem('nasweo_user');
    if (stored) {
      try {
        this.currentUserSubject.next(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('nasweo_user');
      }
    }
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res && res.success && res.data) {
          const authData: AuthResponse = res.data;
          localStorage.setItem('nasweo_token', authData.token);
          const user: User = {
            id: authData.userId,
            username: authData.username,
            fullName: authData.fullName,
            payrollNo: authData.payrollNo,
            roles: authData.roles,
            mustChangePassword: authData.mustChangePassword ?? false
          };
          localStorage.setItem('nasweo_user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, request).pipe(
      tap(res => {
        if (res && res.success) {
          const current = this.currentUser;
          if (current) {
            current.mustChangePassword = false;
            localStorage.setItem('nasweo_user', JSON.stringify(current));
            this.currentUserSubject.next({ ...current, mustChangePassword: false });
          }
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('nasweo_token');
    localStorage.removeItem('nasweo_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('nasweo_token');
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  updateCurrentUserLocal(updates: Partial<User>): void {
    const current = this.currentUser;
    if (current) {
      const updated = { ...current, ...updates };
      localStorage.setItem('nasweo_user', JSON.stringify(updated));
      this.currentUserSubject.next(updated);
    }
  }

  hasRole(role: string): boolean {
    const user = this.currentUser;
    return !!user && user.roles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser;
    return !!user && roles.some(r => user.roles.includes(r));
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  isTreasurer(): boolean {
    return this.hasRole('ROLE_TREASURER');
  }

  isWelfareOfficer(): boolean {
    return this.hasRole('ROLE_WELFARE_OFFICER');
  }

  isAuditor(): boolean {
    return this.hasRole('ROLE_AUDITOR');
  }

  isOrdinaryMember(): boolean {
    const user = this.currentUser;
    return !!user && user.roles.includes('ROLE_MEMBER') && !user.roles.includes('ROLE_ADMIN') && !user.roles.includes('ROLE_TREASURER');
  }

  mustChangePassword(): boolean {
    return !!this.currentUser?.mustChangePassword;
  }

  // Administrative User Management Endpoints
  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users`);
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${id}`);
  }

  createUser(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users`, request);
  }

  updateUser(id: number, request: UserUpdateRequest): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${id}`, request);
  }

  toggleUserStatus(id: number, enabled: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/users/${id}/status`, { enabled });
  }

  resetUserPassword(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/${id}/reset-password`, {});
  }

  getRoles(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/roles`);
  }

  getAuditLogs(page = 0, size = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/audit-logs?page=${page}&size=${size}`);
  }
}
