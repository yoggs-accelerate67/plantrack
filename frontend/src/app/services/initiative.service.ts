import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Initiative, PageResponse } from '../models/plan.model';

@Injectable({
  providedIn: 'root'
})
export class InitiativeService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  createInitiative(milestoneId: number, assignedUserId: number, initiative: Initiative): Observable<Initiative> {
    const params = new HttpParams().set('userId', assignedUserId.toString());
    return this.http.post<Initiative>(`${this.apiUrl}/milestones/${milestoneId}/initiatives`, initiative, { params });
  }

  getInitiativesByMilestone(milestoneId: number, page: number = 0, size: number = 10): Observable<PageResponse<Initiative>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Initiative>>(`${this.apiUrl}/milestones/${milestoneId}/initiatives`, { params });
  }

  updateInitiative(initiativeId: number, initiative: Initiative): Observable<Initiative> {
    return this.http.put<Initiative>(`${this.apiUrl}/initiatives/${initiativeId}`, initiative);
  }

  deleteInitiative(initiativeId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/initiatives/${initiativeId}`);
  }

  getMyInitiatives(userId: number): Observable<Initiative[]> {
    return this.http.get<Initiative[]>(`${this.apiUrl}/users/${userId}/initiatives`);
  }
}

