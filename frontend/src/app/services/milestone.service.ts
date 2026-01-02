import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Milestone, PageResponse } from '../models/plan.model';

@Injectable({
  providedIn: 'root'
})
export class MilestoneService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  createMilestone(planId: number, milestone: Milestone): Observable<Milestone> {
    return this.http.post<Milestone>(`${this.apiUrl}/plans/${planId}/milestones`, milestone);
  }

  getMilestonesByPlan(planId: number, page: number = 0, size: number = 10): Observable<PageResponse<Milestone>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Milestone>>(`${this.apiUrl}/plans/${planId}/milestones`, { params });
  }

  updateMilestone(milestoneId: number, milestone: Milestone): Observable<Milestone> {
    return this.http.put<Milestone>(`${this.apiUrl}/milestones/${milestoneId}`, milestone);
  }

  deleteMilestone(milestoneId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/milestones/${milestoneId}`);
  }

  /**
   * Get preview of cascade cancellation for a milestone
   */
  getCancelPreview(milestoneId: number): Observable<MilestoneCancelPreviewResponse> {
    return this.http.get<MilestoneCancelPreviewResponse>(`${this.apiUrl}/milestones/${milestoneId}/cancel-preview`);
  }

  /**
   * Cancel a milestone with cascade to all initiatives
   */
  cancelMilestoneWithCascade(milestoneId: number): Observable<MilestoneCancelResultResponse> {
    return this.http.post<MilestoneCancelResultResponse>(`${this.apiUrl}/milestones/${milestoneId}/cancel`, {});
  }
}

export interface MilestoneCancelPreviewResponse {
  milestoneId?: number;
  milestoneTitle?: string;
  milestoneStatus?: string;
  initiativesCount: number;
  initiativeNames: string[];
  isAlreadyCancelled: boolean;
}

export interface MilestoneCancelResultResponse {
  milestoneId?: number;
  milestoneTitle?: string;
  initiativesAffected: number;
  usersNotified: number;
}

