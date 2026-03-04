import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats } from '@shared/plan.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`);
  }

  getUserAnalytics(userId: number): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(
      `${this.apiUrl}/users/${userId}/analytics`,
    );
  }
}
