import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contribution } from '../models/contribution.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContributionService {
  private apiUrl = `${environment.apiUrl}/contributions`;

  constructor(private http: HttpClient) {}

  getMyBalance(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-balance`);
  }

  getMyStatement(fromDate?: string, toDate?: string): Observable<any> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get<any>(`${this.apiUrl}/my-statement`, { params });
  }

  searchContributions(payrollNo?: string, year?: number, month?: number, reconciled?: boolean, page = 0, size = 20): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (payrollNo) params = params.set('payrollNo', payrollNo);
    if (year) params = params.set('year', year.toString());
    if (month) params = params.set('month', month.toString());
    if (reconciled !== undefined && reconciled !== null) params = params.set('reconciled', reconciled.toString());

    return this.http.get<any>(this.apiUrl, { params });
  }

  recordContribution(contribution: Partial<Contribution>): Observable<any> {
    return this.http.post<any>(this.apiUrl, contribution);
  }

  reconcileContribution(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/reconcile`, {});
  }

  getMemberBalance(payrollNo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/balance/${payrollNo}`);
  }

  getMemberStatement(payrollNo: string, fromDate?: string, toDate?: string): Observable<any> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);

    return this.http.get<any>(`${this.apiUrl}/statement/${payrollNo}`, { params });
  }

  getFinancialSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/summary`);
  }

  importCheckoff(file: File, month?: number, year?: number, dryRun = false): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    let url = `${this.apiUrl}/import-checkoff?dryRun=${dryRun}`;
    if (month) url += `&month=${month}`;
    if (year) url += `&year=${year}`;

    return this.http.post<any>(url, formData);
  }
}
