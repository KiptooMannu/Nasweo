import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Member, MemberImportResult } from '../models/member.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private apiUrl = `${environment.apiUrl}/members`;

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }

  searchMembers(query?: string, status?: string, category?: string, page = 0, size = 15): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (query) params = params.set('query', query);
    if (status) params = params.set('status', status);
    if (category) params = params.set('category', category);

    return this.http.get<any>(this.apiUrl, { params });
  }

  getMemberById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getMemberByPayroll(payrollNo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/payroll/${payrollNo}`);
  }

  createMember(member: Member): Observable<any> {
    return this.http.post<any>(this.apiUrl, member);
  }

  updateMember(id: number, member: Member): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, member);
  }

  getUpcomingRetirements(months = 12): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/retirements/upcoming?months=${months}`);
  }

  getMembershipStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }

  importExcel(file: File, dryRun = false): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/import-excel?dryRun=${dryRun}`, formData);
  }
}
