import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { PlanService } from '../../services/plan.service';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';
import { DashboardStats, Plan, PlanStatus, PlanPriority } from '../../models/plan.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-zinc-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-zinc-200">
        <div class="max-w-7xl mx-auto px-6 py-4">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-zinc-900">PlanTrack Enterprise</h1>
              <p class="text-sm text-zinc-500 mt-1">Command Center</p>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <p class="text-sm font-medium text-zinc-900">{{ authService.currentUser() }}</p>
                <p class="text-xs text-zinc-500">{{ getUserRoleDisplay() }}</p>
              </div>
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
            @if (isAdmin()) {
              <a routerLink="/users" routerLinkActive="border-teal-500 text-teal-600"
                 class="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition">
                User Management
              </a>
            }
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-6 py-8">
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow-md p-6 border border-zinc-200 hover:shadow-lg transition">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-zinc-500 uppercase tracking-wide">Total Active Plans</p>
                <p class="text-3xl font-bold text-zinc-900 mt-2">{{ stats()?.totalPlans || 0 }}</p>
              </div>
              <div class="bg-teal-100 rounded-lg p-3">
                <svg class="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6 border border-zinc-200 hover:shadow-lg transition">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-zinc-500 uppercase tracking-wide">Pending Initiatives</p>
                <p class="text-3xl font-bold text-zinc-900 mt-2">{{ stats()?.activeInitiatives || 0 }}</p>
              </div>
              <div class="bg-amber-100 rounded-lg p-3">
                <svg class="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6 border border-zinc-200 hover:shadow-lg transition">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-zinc-500 uppercase tracking-wide">Team Velocity</p>
                <p class="text-3xl font-bold text-zinc-900 mt-2">{{ stats()?.completedMilestones || 0 }}</p>
              </div>
              <div class="bg-green-100 rounded-lg p-3">
                <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6 border border-zinc-200 hover:shadow-lg transition">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-zinc-500 uppercase tracking-wide">Total Users</p>
                <p class="text-3xl font-bold text-zinc-900 mt-2">{{ stats()?.totalUsers || 0 }}</p>
              </div>
              <div class="bg-blue-100 rounded-lg p-3">
                <svg class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Plan Grid Section -->
        <div class="bg-white rounded-xl shadow-md border border-zinc-200 p-6">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-xl font-bold text-zinc-900">Active Plans</h2>
              <p class="text-sm text-zinc-500 mt-1">Overview of all project plans</p>
            </div>
            @if (isManager()) {
              <button
                (click)="openCreatePlanModal()"
                class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition flex items-center gap-2"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Create New Plan
              </button>
            }
          </div>

          @if (plans().length === 0) {
            <div class="text-center py-12">
              <svg class="mx-auto h-16 w-16 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="mt-4 text-zinc-500 font-medium">No plans yet</p>
              @if (isManager()) {
                <p class="mt-2 text-sm text-zinc-400">Click "Create New Plan" to get started</p>
              }
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (plan of plans(); track plan.planId) {
                <div 
                  (click)="viewPlan(plan.planId!)"
                  class="bg-zinc-50 rounded-lg p-6 border border-zinc-200 hover:shadow-lg hover:border-teal-300 cursor-pointer transition group"
                >
                  <div class="flex justify-between items-start mb-4">
                    <h3 class="text-lg font-semibold text-zinc-900 group-hover:text-teal-600 transition">{{ plan.title }}</h3>
                    <span 
                      class="px-2.5 py-1 text-xs font-medium rounded-full"
                      [ngClass]="{
                        'bg-blue-100 text-blue-800': plan.status === 'PLANNED',
                        'bg-amber-100 text-amber-800': plan.status === 'IN_PROGRESS',
                        'bg-green-100 text-green-800': plan.status === 'COMPLETED',
                        'bg-zinc-100 text-zinc-800': plan.status === 'ON_HOLD',
                        'bg-red-100 text-red-800': plan.status === 'CANCELLED'
                      }"
                    >
                      {{ plan.status }}
                    </span>
                  </div>
                  <p class="text-sm text-zinc-600 mb-4 line-clamp-2">{{ plan.description || 'No description' }}</p>
                  
                  <!-- Progress Bar -->
                  <div class="mb-4">
                    <div class="flex justify-between text-xs text-zinc-500 mb-1">
                      <span>Progress</span>
                      <span>{{ getPlanProgress(plan) }}%</span>
                    </div>
                    <div class="w-full bg-zinc-200 rounded-full h-2">
                      <div 
                        class="bg-teal-600 h-2 rounded-full transition-all"
                        [style.width.%]="getPlanProgress(plan)"
                      ></div>
                    </div>
                  </div>

                  <div class="flex items-center justify-between text-xs text-zinc-500">
                    <span>{{ plan.userName || 'Unassigned' }}</span>
                    <span 
                      class="px-2 py-1 rounded"
                      [ngClass]="{
                        'bg-red-100 text-red-800': plan.priority === 'CRITICAL',
                        'bg-orange-100 text-orange-800': plan.priority === 'HIGH',
                        'bg-yellow-100 text-yellow-800': plan.priority === 'MEDIUM',
                        'bg-green-100 text-green-800': plan.priority === 'LOW'
                      }"
                    >
                      {{ plan.priority || 'N/A' }}
                    </span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </main>

      <!-- Create Plan Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-bold text-zinc-900">Create New Plan</h3>
              <button (click)="closeCreatePlanModal()" class="text-zinc-400 hover:text-zinc-600">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form (ngSubmit)="createPlan()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-zinc-700 mb-2">Title *</label>
                <input type="text" [(ngModel)]="newPlan.title" name="title" required
                  class="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-700 mb-2">Description</label>
                <textarea [(ngModel)]="newPlan.description" name="description" rows="3"
                  class="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-zinc-700 mb-2">Priority</label>
                  <select [(ngModel)]="newPlan.priority" name="priority"
                    class="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-zinc-700 mb-2">Status</label>
                  <select [(ngModel)]="newPlan.status" name="status"
                    class="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
                    <option value="PLANNED">Planned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                </div>
              </div>
              <div class="flex justify-end gap-3 pt-4">
                <button type="button" (click)="closeCreatePlanModal()"
                  class="px-6 py-2 text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg font-medium transition">
                  Cancel
                </button>
                <button type="submit"
                  class="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition">
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
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

  constructor(
    private dashboardService: DashboardService,
    private planService: PlanService,
    public authService: AuthService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loadingService.show();
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loadPlans();
      },
      error: () => {
        this.loadingService.hide();
      }
    });
  }

  loadPlans(): void {
    this.planService.getAllPlans(0, 20).subscribe({
      next: (response) => {
        this.plans.set(response.content);
        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
      }
    });
  }

  getPlanProgress(plan: Plan): number {
    // Placeholder - would calculate from milestones
    return Math.floor(Math.random() * 100);
  }

  isManager(): boolean {
    const role = this.authService.userRole();
    return role === 'MANAGER' || role === 'ADMIN';
  }

  isAdmin(): boolean {
    return this.authService.userRole() === 'ADMIN';
  }

  getUserRoleDisplay(): string {
    const role = this.authService.userRole();
    if (role === 'ADMIN') return 'Administrator';
    if (role === 'MANAGER') return 'Project Manager';
    if (role === 'EMPLOYEE') return 'Team Member';
    return 'User';
  }

  openCreatePlanModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreatePlanModal(): void {
    this.showCreateModal.set(false);
    this.newPlan = { title: '', description: '', priority: PlanPriority.MEDIUM, status: PlanStatus.PLANNED };
  }

  createPlan(): void {
    // Get current user ID - in real app, this would come from auth service
    const userId = 1; // Placeholder
    this.loadingService.show();
    this.planService.createPlan(userId, this.newPlan as Plan).subscribe({
      next: () => {
        this.toastService.showSuccess('Plan created successfully!');
        this.closeCreatePlanModal();
        this.loadPlans();
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.showError(error.error?.message || 'Failed to create plan');
        this.loadingService.hide();
      }
    });
  }

  viewPlan(planId: number): void {
    this.router.navigate(['/plans', planId]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
