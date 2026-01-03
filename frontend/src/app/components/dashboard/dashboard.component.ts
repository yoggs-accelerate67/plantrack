import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { PlanService } from '../../services/plan.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { DashboardStats, Plan, PlanStatus, PlanPriority } from '../../models/plan.model';
import { NotificationCenterComponent } from '../notification-center/notification-center.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NotificationCenterComponent],
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
                <a routerLink="/plans" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">Plans</a>
                @if (authService.isEmployee()) {
                  <a routerLink="/my-initiatives" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">My Initiatives</a>
                }
                <a routerLink="/analytics" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">Analytics</a>
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
        <!-- Page Header -->
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Dashboard</h2>
          <p class="text-slate-600 dark:text-slate-400">Welcome back! Here's an overview of your projects.</p>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="card group hover:scale-105 transition-transform">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Total Plans</p>
                <p class="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">{{ stats()?.totalPlans || 0 }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Active projects</p>
              </div>
              <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div class="card group hover:scale-105 transition-transform">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Active Initiatives</p>
                <p class="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">{{ stats()?.activeInitiatives || 0 }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">In progress</p>
              </div>
              <div class="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="card group hover:scale-105 transition-transform">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Completed Milestones</p>
                <p class="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">{{ stats()?.completedMilestones || 0 }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Finished</p>
              </div>
              <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="card group hover:scale-105 transition-transform">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Total Users</p>
                <p class="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">{{ stats()?.totalUsers || 0 }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Team members</p>
              </div>
              <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Header with Create Button -->
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Active Plans</h2>
            <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage and track your project plans</p>
          </div>
          @if (authService.isManager()) {
            <button
              (click)="showCreateModal.set(true)"
              class="btn-primary flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create New Plan</span>
            </button>
          }
        </div>

        <!-- Plans Grid -->
        @if (loadingService.isLoading()) {
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        } @else if (plans().length === 0) {
          <div class="card p-16 text-center">
            <div class="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No plans yet</h3>
            <p class="text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">Get started by creating your first project plan. Organize milestones and track progress all in one place.</p>
            @if (authService.isManager()) {
              <button
                (click)="showCreateModal.set(true)"
                class="btn-primary inline-flex items-center space-x-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Create your first plan</span>
              </button>
            }
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (plan of plans(); track plan.planId) {
              <div
                (click)="navigateToPlan(plan.planId!)"
                class="card cursor-pointer group hover:scale-[1.02] transition-all border-2 hover:border-teal-300"
              >
                <div class="flex justify-between items-start mb-4">
                  <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors flex-1 pr-2">{{ plan.title }}</h3>
                  <span
                    class="px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                    [ngClass]="{
                      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800': plan.status === 'COMPLETED',
                      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800': plan.status === 'IN_PROGRESS',
                      'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600': plan.status === 'PLANNED',
                      'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800': plan.status === 'ON_HOLD',
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800': plan.status === 'CANCELLED'
                    }"
                  >
                    {{ plan.status }}
                  </span>
                </div>
                <p class="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 min-h-[2.5rem]">{{ plan.description || 'No description provided' }}</p>
                <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div class="flex justify-between items-center text-xs">
                    <span class="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-medium">Priority: {{ plan.priority }}</span>
                    <span class="text-slate-500 dark:text-slate-400">{{ plan.userName }}</span>
                  </div>
                  <div>
                    <div class="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                      <span>Progress</span>
                      <span class="font-semibold">{{ getProgress(plan) }}%</span>
                    </div>
                    <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                      <div class="bg-gradient-to-r from-teal-500 to-teal-600 h-2.5 rounded-full transition-all duration-500" [style.width.%]="getProgress(plan)"></div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Create Plan Modal -->
        @if (showCreateModal()) {
          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95">
              <div class="flex items-center space-x-3 mb-6">
                <div class="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-slate-900 dark:text-slate-100">Create New Plan</h3>
              </div>
              <form (ngSubmit)="createPlan()" class="space-y-4">
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Title *</label>
                    <input
                      [(ngModel)]="newPlan.title"
                      name="title"
                      required
                      class="input-field"
                      placeholder="Enter plan title"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                    <textarea
                      [(ngModel)]="newPlan.description"
                      name="description"
                      rows="3"
                      class="input-field resize-none"
                      placeholder="Enter plan description"
                    ></textarea>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                      <select
                        [(ngModel)]="newPlan.priority"
                        name="priority"
                        class="input-field"
                      >
                        <option [value]="PlanPriority.LOW">Low</option>
                        <option [value]="PlanPriority.MEDIUM">Medium</option>
                        <option [value]="PlanPriority.HIGH">High</option>
                        <option [value]="PlanPriority.CRITICAL">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Status</label>
                      <select
                        [(ngModel)]="newPlan.status"
                        name="status"
                        class="input-field"
                      >
                        <option [value]="PlanStatus.PLANNED">Planned</option>
                        <option [value]="PlanStatus.IN_PROGRESS">In Progress</option>
                        <option [value]="PlanStatus.COMPLETED">Completed</option>
                        <option [value]="PlanStatus.ON_HOLD">On Hold</option>
                        <option [value]="PlanStatus.CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div class="flex space-x-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    (click)="closeCreatePlanModal()"
                    class="flex-1 px-4 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="flex-1 btn-primary"
                  >
                    Create Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);
  plans = signal<Plan[]>([]);
  showCreateModal = signal(false);
  newPlan: Partial<Plan> = {
    title: '',
    description: '',
    priority: PlanPriority.MEDIUM,
    status: PlanStatus.PLANNED
  };

  PlanStatus = PlanStatus;
  PlanPriority = PlanPriority;

  constructor(
    public authService: AuthService,
    private dashboardService: DashboardService,
    private planService: PlanService,
    private toastService: ToastService,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loadingService.show();
    
    let statsLoaded = false;
    let plansLoaded = false;
    
    const hideLoading = () => {
      if (statsLoaded && plansLoaded) {
        this.loadingService.hide();
      }
    };
    
    // Load stats
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        statsLoaded = true;
        hideLoading();
      },
      error: (error) => {
        console.error('Failed to load dashboard stats:', error);
        statsLoaded = true;
        hideLoading();
        // Don't show toast - error interceptor will handle it
      }
    });

    // Load plans - different endpoint for employees
    const userId = this.authService.getUserId();
    console.log('Loading plans for user:', { userId, isEmployee: this.authService.isEmployee(), role: this.authService.userRole() });
    
    if (this.authService.isEmployee() && userId) {
      // Employees see only plans with their assigned initiatives
      this.planService.getPlansWithAssignedInitiatives(userId).subscribe({
        next: (plans) => {
          console.log('Received assigned plans:', plans);
          // Map plans to include userName from user object
          const mappedPlans = plans.map((plan: any) => ({
            ...plan,
            userName: plan.user?.name || plan.userName || 'Unknown',
            userId: plan.user?.userId || plan.userId
          }));
          console.log('Mapped plans:', mappedPlans);
          this.plans.set(mappedPlans);
          plansLoaded = true;
          hideLoading();
        },
        error: (error) => {
          console.error('Failed to load assigned plans:', error);
          console.error('Error details:', error.error, error.status, error.message);
          plansLoaded = true;
          hideLoading();
        }
      });
    } else {
      // Managers and Admins see all plans
      this.planService.getAllPlans(0, 20).subscribe({
        next: (response) => {
          // Map plans to include userName from user object
          const mappedPlans = response.content.map((plan: any) => ({
            ...plan,
            userName: plan.user?.name || plan.userName || 'Unknown',
            userId: plan.user?.userId || plan.userId
          }));
          this.plans.set(mappedPlans);
          plansLoaded = true;
          hideLoading();
        },
        error: (error) => {
          console.error('Failed to load plans:', error);
          plansLoaded = true;
          hideLoading();
          // Don't show toast - error interceptor will handle it
        }
      });
    }
  }

  getProgress(plan: Plan): number {
    // Simplified progress calculation
    return plan.status === 'COMPLETED' ? 100 : plan.status === 'IN_PROGRESS' ? 50 : 0;
  }

  navigateToPlan(planId: number): void {
    this.router.navigate(['/plans', planId]);
  }

  createPlan(): void {
    if (!this.newPlan.title) {
      this.toastService.showError('Please enter a plan title');
      return;
    }

    // Get current user ID - for now use 1, but ideally get from token
    // In a real app, you'd decode the JWT token to get userId
    const userId = this.authService.getUserId() || 1;
    
    this.loadingService.show();
    this.planService.createPlan(userId, this.newPlan as Plan).subscribe({
      next: (createdPlan) => {
        this.loadingService.hide();
        this.toastService.showSuccess('Plan created successfully!');
        this.closeCreatePlanModal();
        // Reload dashboard to show the new plan
        this.loadDashboard();
      },
      error: (error) => {
        console.error('Failed to create plan:', error);
        this.loadingService.hide();
        // Error interceptor will show toast, but show specific message here
        const errorMsg = error.error?.message || 'Failed to create plan';
        this.toastService.showError(errorMsg);
      }
    });
  }

  closeCreatePlanModal(): void {
    this.showCreateModal.set(false);
    this.newPlan = {
      title: '',
      description: '',
      priority: PlanPriority.MEDIUM,
      status: PlanStatus.PLANNED
    };
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

