import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Loan, LoanProduct, TopUpCalculationResult } from '../models/loan.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = `${environment.apiUrl}/loans`;

  constructor(private http: HttpClient) {}

  getMyLoans(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-loans`);
  }

  getActiveProducts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products`);
  }

  calculateAmortization(productCode: string, principal: number, months?: number): Observable<any> {
    let params = new HttpParams()
      .set('productCode', productCode)
      .set('principal', principal.toString());
    if (months) params = params.set('months', months.toString());

    return this.http.get<any>(`${this.apiUrl}/calculator`, { params });
  }

  applyLoan(application: { payrollNo: string; memberName?: string; productCode: string; principalAmount: number; repaymentMonths: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/apply`, application);
  }

  previewTopUp(existingLoanNumber: string, newPrincipal: number): Observable<any> {
    const params = new HttpParams()
      .set('existingLoanNumber', existingLoanNumber)
      .set('newPrincipal', newPrincipal.toString());
    return this.http.get<any>(`${this.apiUrl}/topup/preview`, { params });
  }

  processTopUp(topUpRequest: { existingLoanNumber: string; newPrincipalAmount: number; newRepaymentMonths: number; productCode?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/topup`, topUpRequest);
  }

  processRepayment(repayment: { loanNumber: string; amount: number; paymentMode: string; referenceNo?: string; paymentDate: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/repay`, repayment);
  }

  getLoanSchedule(loanNumber: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${loanNumber}/schedule`);
  }

  getLoanRepayments(loanNumber: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${loanNumber}/repayments`);
  }

  getMemberLoans(payrollNo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/member/${payrollNo}`);
  }

  searchLoans(query?: string, status?: string, productCode?: string, page = 0, size = 15): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (query) params = params.set('query', query);
    if (status) params = params.set('status', status);
    if (productCode) params = params.set('productCode', productCode);

    return this.http.get<any>(this.apiUrl, { params });
  }

  getOverdueLoans(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/overdue`);
  }

  getLoanAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics`);
  }
}
