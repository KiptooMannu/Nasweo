import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BenevolenceRecord } from '../models/welfare.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WelfareService {
  private apiUrl = `${environment.apiUrl}/welfare`;

  constructor(private http: HttpClient) {}

  getMyRecords(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-records`);
  }

  recordBenevolence(record: Partial<BenevolenceRecord>): Observable<any> {
    return this.http.post<any>(this.apiUrl, record);
  }

  searchRecords(query?: string, type?: string, status?: string, page = 0, size = 15): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (query) params = params.set('query', query);
    if (type) params = params.set('type', type);
    if (status) params = params.set('status', status);

    return this.http.get<any>(this.apiUrl, { params });
  }

  getMemberRecords(payrollNo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/member/${payrollNo}`);
  }

  getExpenditureSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/summary`);
  }
}
