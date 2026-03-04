import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalyticsReport } from './analytics.model';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/analytics`;

  /** POST /generate/all?department=IT  -> creates a new report and returns it */
  generateAll(department: string): Observable<AnalyticsReport> {
    const params = new HttpParams().set('department', department);
    return this.http.post<AnalyticsReport>(`${this.base}/generate/all`, null, {
      params,
    });
  }

  /** GET /latest?department=IT */
  getLatest(department: string): Observable<AnalyticsReport> {
    const params = new HttpParams().set('department', department);
    return this.http.get<AnalyticsReport>(`${this.base}/latest`, { params });
  }

  /** GET /department?department=IT */
  getByDepartment(department: string): Observable<AnalyticsReport[]> {
    const params = new HttpParams().set('department', department);
    return this.http.get<AnalyticsReport[]>(`${this.base}/department`, {
      params,
    });
  }

  getByDateRange(department: string, startDate: string, endDate: string) {
    if (!startDate || !endDate) {
      throw new Error(
        'startDate and endDate are required in YYYY-MM-DD format',
      );
    }

    const startIsoLocal = `${startDate}T00:00:00`;
    const endIsoLocal = `${endDate}T23:59:59`;

    const params = new HttpParams()
      .set('department', department)
      .set('startDate', startIsoLocal)
      .set('endDate', endIsoLocal);

    return this.http.get<AnalyticsReport[]>(`${this.base}/reports`, { params });
  }
}
