import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PlanService } from '../../services/plan.service';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';
import { Plan, PlanStatus } from '../../models/plan.model';

@Component({
  selector: 'app-plan-board',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-zinc-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-zinc-200">
        <div class="max-w-7xl mx-auto px-6 py-4">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-zinc-900">Plan Board</h1>
              <p class="text-sm text-zinc-500 mt-1">Kanban view of all plans</p>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-zinc-600">{{ authService.currentUser() }}</span>
              <button
                (click)="logout()"
                class="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Navigation -->
      <nav class="bg-white border-b border-zinc-200">
        <div class="max-w-7xl mx-auto px-6">
          <div class="flex space-x-8">
            <a routerLink="/dashboard" routerLinkActive="border-teal-500 text-teal-600" 
               class="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition">
              Dashboard
            </a>
            <a routerLink="/plans" routerLinkActive="border-teal-500 text-teal-600"
               class="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition">
              Plans
            </a>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-6 py-8">
        <!-- Kanban Board -->
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          @for (status of statuses; track status) {
            <div class="bg-white rounded-xl shadow-md border border-zinc-200 p-4">
              <div class="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200">
                <h3 class="text-sm font-semibold text-zinc-700 uppercase tracking-wide">
                  {{ status }}
                </h3>
                <span class="bg-zinc-100 text-zinc-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {{ getPlansByStatus(status).length }}
                </span>
              </div>
              <div class="space-y-3 min-h-[200px]">
                @for (plan of getPlansByStatus(status); track plan.planId) {
                  <div 
                    (click)="viewPlan(plan.planId!)"
                    class="bg-zinc-50 rounded-lg p-4 cursor-pointer hover:shadow-lg hover:border-teal-300 transition border border-zinc-200 group"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <h4 class="font-semibold text-zinc-900 text-sm group-hover:text-teal-600 transition">{{ plan.title }}</h4>
                      @if (isManager()) {
                        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            (click)="editPlan($event, plan)"
                            class="p-1 text-zinc-600 hover:text-teal-600 hover:bg-teal-50 rounded transition"
                          >
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            (click)="deletePlan($event, plan.planId!)"
                            class="p-1 text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      }
                    </div>
                    <p class="text-xs text-zinc-600 line-clamp-2 mb-3">{{ plan.description || 'No description' }}</p>
                    <div class="flex items-center justify-between">
                      <span 
                        class="px-2 py-1 text-xs font-medium rounded"
                        [ngClass]="{
                          'bg-red-100 text-red-800': plan.priority === 'CRITICAL',
                          'bg-orange-100 text-orange-800': plan.priority === 'HIGH',
                          'bg-yellow-100 text-yellow-800': plan.priority === 'MEDIUM',
                          'bg-green-100 text-green-800': plan.priority === 'LOW'
                        }"
                      >
                        {{ plan.priority || 'N/A' }}
                      </span>
                      <span class="text-xs text-zinc-500">{{ plan.userName }}</span>
                    </div>
                  </div>
                } @empty {
                  <div class="text-center py-8 text-zinc-400 text-sm">
                    <p>No plans</p>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </main>
    </div>
  `
})
export class PlanBoardComponent implements OnInit {
  plans = signal<Plan[]>([]);
  statuses: PlanStatus[] = [
    PlanStatus.PLANNED,
    PlanStatus.IN_PROGRESS,
    PlanStatus.COMPLETED,
    PlanStatus.ON_HOLD,
    PlanStatus.CANCELLED
  ];

  constructor(
    private planService: PlanService,
    public authService: AuthService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loadingService.show();
    this.planService.getAllPlans(0, 100).subscribe({
      next: (response) => {
        this.plans.set(response.content);
        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
        this.toastService.showError('Failed to load plans');
      }
    });
  }

  getPlansByStatus(status: PlanStatus): Plan[] {
    return this.plans().filter(p => p.status === status);
  }

  isManager(): boolean {
    const role = this.authService.userRole();
    return role === 'MANAGER' || role === 'ADMIN';
  }

  viewPlan(planId: number): void {
    this.router.navigate(['/plans', planId]);
  }

  editPlan(event: Event, plan: Plan): void {
    event.stopPropagation();
    // TODO: Implement edit plan
    this.toastService.showInfo('Edit plan functionality coming soon');
  }

  deletePlan(event: Event, planId: number): void {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    this.loadingService.show();
    this.planService.deletePlan(planId).subscribe({
      next: () => {
        this.toastService.showSuccess('Plan deleted successfully!');
        this.loadPlans();
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.showError(error.error?.message || 'Failed to delete plan');
        this.loadingService.hide();
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
