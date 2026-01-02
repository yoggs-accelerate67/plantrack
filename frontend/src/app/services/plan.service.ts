import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plan, PlanDetail, PageResponse } from '../models/plan.model';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getAllPlans(page: number = 0, size: number = 10, sort: string = 'planId'): Observable<PageResponse<Plan>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    return this.http.get<PageResponse<Plan>>(`${this.apiUrl}/plans`, { params });
  }

  getPlansByUser(userId: number, page: number = 0, size: number = 10): Observable<PageResponse<Plan>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Plan>>(`${this.apiUrl}/users/${userId}/plans`, { params });
  }

  getPlanDetail(planId: number): Observable<PlanDetail> {
    return this.http.get<PlanDetail>(`${this.apiUrl}/plans/${planId}`);
  }

  createPlan(userId: number, plan: Plan): Observable<Plan> {
    return this.http.post<Plan>(`${this.apiUrl}/users/${userId}/plans`, plan);
  }

  updatePlan(planId: number, plan: Plan): Observable<Plan> {
    return this.http.put<Plan>(`${this.apiUrl}/plans/${planId}`, plan);
  }

  deletePlan(planId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/plans/${planId}`);
  }

  // Get plans with assigned initiatives for employees
  getPlansWithAssignedInitiatives(userId: number): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.apiUrl}/users/${userId}/assigned-plans`);
  }

  /**
   * Get preview of cascade cancellation for a plan
   */
  getCancelPreview(planId: number): Observable<CancelPreviewResponse> {
    return this.http.get<CancelPreviewResponse>(`${this.apiUrl}/plans/${planId}/cancel-preview`);
  }

  /**
   * Cancel a plan with cascade to all milestones and initiatives
   */
  cancelPlanWithCascade(planId: number): Observable<CancelResultResponse> {
    return this.http.post<CancelResultResponse>(`${this.apiUrl}/plans/${planId}/cancel`, {});
  }
}

export interface CancelPreviewResponse {
  planId?: number;
  planTitle?: string;
  planStatus?: string;
  milestonesCount: number;
  initiativesCount: number;
  milestoneNames: string[];
  initiativeNames: string[];
  isAlreadyCancelled: boolean;
}

export interface CancelResultResponse {
  planId?: number;
  planTitle?: string;
  milestonesAffected: number;
  initiativesAffected: number;
  usersNotified: number;
}

