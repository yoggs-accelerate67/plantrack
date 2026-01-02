import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PlanService } from '../../services/plan.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { Plan, PlanStatus } from '../../models/plan.model';
import { NotificationCenterComponent } from '../notification-center/notification-center.component';

@Component({
  selector: 'app-plan-board',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NotificationCenterComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <!-- Navigation Header -->
      <nav class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-8">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">PlanTrack Enterprise</h1>
              </div>
              <div class="hidden md:flex space-x-1">
                <a routerLink="/dashboard" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">Dashboard</a>
                <a routerLink="/plans" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-teal-600 dark:text-teal-400 rounded-lg">Plans</a>
                @if (authService.isEmployee()) {
                  <a routerLink="/my-initiatives" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">My Initiatives</a>
                }
                @if (authService.isManager() || authService.isAdmin()) {
                  <a routerLink="/analytics" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">Analytics</a>
                }
                @if (authService.isAdmin()) {
                  <a routerLink="/audit-logs" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">Audit Logs</a>
                  <a routerLink="/users" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">User Management</a>
                }
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <!-- Notification Center -->
              <app-notification-center></app-notification-center>
              
              <div class="hidden sm:flex items-center space-x-3">
                <div class="text-right">
                  <p class="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
                  <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ authService.currentUser() }}</p>
                </div>
                <span class="px-3 py-1.5 bg-gradient-to-r from-teal-100 to-teal-50 dark:from-teal-900/30 dark:to-teal-800/30 text-teal-700 dark:text-teal-400 rounded-full text-xs font-semibold border border-teal-200 dark:border-teal-700">{{ authService.userRole() }}</span>
              </div>
              <button 
                (click)="logout()" 
                class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span class="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Plan Board</h2>
          <p class="text-slate-600 dark:text-slate-400">Kanban view of all plans organized by status</p>
        </div>

        @if (loadingService.isLoading()) {
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
            @for (status of statusColumns; track status) {
              <div class="card">
                <div class="mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wide">{{ status.replace('_', ' ') }}</h3>
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ getPlansByStatus(status).length }} plans</p>
                    </div>
                    @if (status === 'ON_HOLD') {
                      <div class="w-2 h-2 bg-orange-500 rounded-full animate-pulse" title="Plans on hold are temporarily paused"></div>
                    }
                    @if (status === 'CANCELLED') {
                      <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20" title="Cancelled plans are no longer active">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                      </svg>
                    }
                  </div>
                </div>
                <div class="space-y-3 min-h-[200px]">
                  @for (plan of getPlansByStatus(status); track plan.planId) {
                    <div
                      (click)="navigateToPlan(plan.planId!)"
                      class="rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer border-2 group"
                      [ngClass]="{
                        'bg-gradient-to-br from-slate-50 to-white dark:from-slate-700 dark:to-slate-800 border-slate-200 dark:border-slate-600 hover:border-teal-300 dark:hover:border-teal-600': plan.status === 'PLANNED' || plan.status === 'IN_PROGRESS' || plan.status === 'COMPLETED',
                        'bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/30 dark:to-orange-800/20 border-orange-300 dark:border-orange-700 hover:border-orange-400 dark:hover:border-orange-600 opacity-90': plan.status === 'ON_HOLD',
                        'bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/30 dark:to-red-800/20 border-red-300 dark:border-red-700 hover:border-red-400 dark:hover:border-red-600 opacity-75': plan.status === 'CANCELLED'
                      }"
                    >
                      <div class="flex items-start justify-between mb-2">
                        <h4 class="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors flex-1 pr-2">{{ plan.title }}</h4>
                        @if (plan.status === 'ON_HOLD') {
                          <svg class="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          </svg>
                        }
                        @if (plan.status === 'CANCELLED') {
                          <svg class="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                          </svg>
                        }
                      </div>
                      <p class="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2 min-h-[2rem]">{{ plan.description || 'No description' }}</p>
                      <div class="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
                        <span class="text-xs px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium">{{ plan.priority }}</span>
                        <span class="text-xs text-slate-500 dark:text-slate-400">{{ plan.userName }}</span>
                      </div>
                    </div>
                  }
                  @if (getPlansByStatus(status).length === 0) {
                    <div class="text-center py-8 text-slate-400 dark:text-slate-500">
                      <p class="text-xs">No plans</p>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class PlanBoardComponent implements OnInit {
  plans = signal<Plan[]>([]);
  statusColumns = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'];

  constructor(
    public authService: AuthService,
    private planService: PlanService,
    private toastService: ToastService,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loadingService.show();
    const userId = this.authService.getUserId();
    
    // Employees see only plans with their assigned initiatives
    if (this.authService.isEmployee() && userId) {
      this.planService.getPlansWithAssignedInitiatives(userId).subscribe({
        next: (plans) => {
          this.plans.set(plans);
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Failed to load assigned plans:', error);
          this.loadingService.hide();
        }
      });
    } else {
      // Managers and Admins see all plans
      this.planService.getAllPlans(0, 100).subscribe({
        next: (response) => {
          this.plans.set(response.content);
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Failed to load plans:', error);
          this.loadingService.hide();
          // Error interceptor will handle the toast
        }
      });
    }
  }

  getPlansByStatus(status: string): Plan[] {
    return this.plans().filter(p => p.status === status);
  }

  navigateToPlan(planId: number): void {
    this.router.navigate(['/plans', planId]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

