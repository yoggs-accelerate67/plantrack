import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Initiative, PlanStatus } from '../../models/plan.model';
import { InitiativeService } from '../../services/initiative.service';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';
import { NotificationCenterComponent } from '../notification-center/notification-center.component';

@Component({
  selector: 'app-my-initiatives',
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
                <a routerLink="/my-initiatives" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">My Initiatives</a>
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
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">My Initiatives</h1>
              <p class="text-slate-600 dark:text-slate-400">View and manage all initiatives assigned to you</p>
            </div>
            <div class="flex items-center space-x-4">
              <!-- Status Filter -->
              <select
                [(ngModel)]="selectedStatus"
                (ngModelChange)="filterInitiatives()"
                class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Status</option>
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              
              <!-- Priority Filter -->
              <select
                [(ngModel)]="selectedPriority"
                (ngModelChange)="filterInitiatives()"
                class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Priorities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
          
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div class="card">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Total Assigned</p>
                  <p class="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{{ allInitiatives().length }}</p>
                </div>
                <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div class="card">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600 dark:text-slate-400">In Progress</p>
                  <p class="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{{ inProgressCount() }}</p>
                </div>
                <div class="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div class="card">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Completed</p>
                  <p class="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{{ completedCount() }}</p>
                </div>
                <div class="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div class="card">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Completion Rate</p>
                  <p class="text-2xl font-bold text-teal-600 dark:text-teal-400 mt-1">{{ completionRate() }}%</p>
                </div>
                <div class="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <svg class="w-6 h-6 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Initiatives List -->
        <div class="space-y-4">
          @if (filteredInitiatives().length === 0) {
            <div class="card text-center py-12">
              <svg class="w-16 h-16 mx-auto text-slate-300 dark:text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">No initiatives found</h3>
              <p class="text-slate-600 dark:text-slate-300">Try adjusting your filters or check back later.</p>
            </div>
          } @else {
            @for (initiative of filteredInitiatives(); track initiative.initiativeId) {
              <div class="card hover:shadow-soft-xl transition-all">
                <div class="flex items-start justify-between">
                  <!-- Left Section: Main Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start space-x-4">
                      <!-- Status Indicator -->
                      <div class="flex-shrink-0 mt-1">
                        <div class="w-3 h-3 rounded-full"
                          [ngClass]="{
                            'bg-green-500 dark:bg-green-400': initiative.status === 'COMPLETED',
                            'bg-amber-500 dark:bg-amber-400': initiative.status === 'IN_PROGRESS',
                            'bg-slate-400 dark:bg-slate-500': initiative.status === 'PLANNED',
                            'bg-red-500 dark:bg-red-400': initiative.status === 'CANCELLED'
                          }"
                        ></div>
                      </div>

                      <!-- Content -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center space-x-3 mb-2">
                          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer"
                            [class.line-through]="initiative.status === 'CANCELLED'"
                            [class.text-slate-400]="initiative.status === 'CANCELLED'"
                            (click)="viewPlan(initiative)">
                            {{ initiative.title }}
                          </h3>
                          
                          <!-- Priority Badge -->
                          @if (initiative.planPriority) {
                            <span class="px-2 py-1 rounded-full text-xs font-medium"
                              [ngClass]="{
                                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800': initiative.planPriority === 'HIGH',
                                'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800': initiative.planPriority === 'MEDIUM',
                                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800': initiative.planPriority === 'LOW'
                              }">
                              {{ initiative.planPriority }}
                            </span>
                          }
                        </div>

                        @if (initiative.description) {
                          <p class="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2"
                            [class.line-through]="initiative.status === 'CANCELLED'"
                            [class.text-slate-400]="initiative.status === 'CANCELLED'"
                            [class.dark:text-slate-500]="initiative.status === 'CANCELLED'">
                            {{ initiative.description }}
                          </p>
                        }

                        <!-- Metadata -->
                        <div class="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-300">
                          <!-- Plan Info -->
                          @if (initiative.planTitle) {
                            <div class="flex items-center space-x-1">
                              <svg class="w-4 h-4 text-slate-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span class="text-slate-600 dark:text-slate-300">{{ initiative.planTitle }}</span>
                            </div>
                          }

                          <!-- Milestone Info -->
                          @if (initiative.milestoneTitle) {
                            <div class="flex items-center space-x-1">
                              <svg class="w-4 h-4 text-slate-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              <span class="text-slate-600 dark:text-slate-300">{{ initiative.milestoneTitle }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Right Section: Status Update -->
                  <div class="flex-shrink-0 ml-6">
                    <div class="flex flex-col items-end space-y-3">
                      <!-- Status Dropdown -->
                      @if (initiative.status !== 'CANCELLED') {
                        <select
                          [value]="initiative.status"
                          (change)="updateStatus(initiative, $event)"
                          class="status-select px-4 py-2 rounded-lg border-2 text-base font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          [ngClass]="{
                            'border-green-500 dark:border-green-500': initiative.status === 'COMPLETED',
                            'border-amber-500 dark:border-amber-500': initiative.status === 'IN_PROGRESS',
                            'border-slate-300 dark:border-slate-600': initiative.status === 'PLANNED'
                          }"
                        >
                          <option value="PLANNED" class="text-base">Planned</option>
                          <option value="IN_PROGRESS" class="text-base">In Progress</option>
                          <option value="COMPLETED" class="text-base">Completed</option>
                        </select>
                      }

                      <!-- Status Badge (Visual) -->
                      <div class="px-3 py-1 rounded-full text-xs font-semibold"
                        [ngClass]="{
                          'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800': initiative.status === 'COMPLETED',
                          'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800': initiative.status === 'IN_PROGRESS',
                          'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600': initiative.status === 'PLANNED',
                          'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800': initiative.status === 'CANCELLED'
                        }">
                        {{ initiative.status }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card {
      background: white;
      border: 1px solid rgb(226 232 240);
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    }
    @media (prefers-color-scheme: dark) {
      .card {
        background: rgb(30 41 59);
        border-color: rgb(51 65 85);
      }
    }
    .dark .card {
      background: rgb(30 41 59);
      border-color: rgb(51 65 85);
    }
    
    /* Custom select dropdown styling */
    .status-select {
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 0.5rem center;
      background-repeat: no-repeat;
      background-size: 0.875em 0.875em;
      padding-right: 2.5rem;
      font-size: 1rem;
    }
    
    .status-select option {
      font-size: 1rem !important;
      padding: 0.75rem 0.5rem !important;
      line-height: 1.5 !important;
      min-height: 2.5rem !important;
    }
    
    .dark .status-select {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%9ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    }
    
    /* Ensure dropdown options are readable */
    select.status-select {
      font-size: 1rem;
    }
    
    select.status-select option {
      font-size: 1rem !important;
      padding: 0.75rem !important;
      min-height: 2.5rem !important;
    }
    
    /* Modern scrollbar styling */
    .overflow-y-auto::-webkit-scrollbar,
    .overflow-x-auto::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-track,
    .overflow-x-auto::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .overflow-y-auto::-webkit-scrollbar-thumb,
    .overflow-x-auto::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.3);
      border-radius: 3px;
    }
    
    .overflow-y-auto::-webkit-scrollbar-thumb:hover,
    .overflow-x-auto::-webkit-scrollbar-thumb:hover {
      background: rgba(148, 163, 184, 0.5);
    }
    
    .dark .overflow-y-auto::-webkit-scrollbar-thumb,
    .dark .overflow-x-auto::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.4);
    }
    
    .dark .overflow-y-auto::-webkit-scrollbar-thumb:hover,
    .dark .overflow-x-auto::-webkit-scrollbar-thumb:hover {
      background: rgba(148, 163, 184, 0.6);
    }
  `]
})
export class MyInitiativesComponent implements OnInit {
  private initiativeService = inject(InitiativeService);
  authService = inject(AuthService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  allInitiatives = signal<Initiative[]>([]);
  selectedStatus = signal<string>('');
  selectedPriority = signal<string>('');

  filteredInitiatives = computed(() => {
    let filtered = this.allInitiatives();
    
    if (this.selectedStatus()) {
      filtered = filtered.filter(i => i.status === this.selectedStatus());
    }
    
    if (this.selectedPriority()) {
      filtered = filtered.filter(i => i.planPriority === this.selectedPriority());
    }
    
    // Sort by priority (HIGH first) then by status
    return filtered.sort((a, b) => {
      const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      const statusOrder = { 'IN_PROGRESS': 3, 'PLANNED': 2, 'COMPLETED': 1, 'CANCELLED': 0 };
      
      const priorityDiff = (priorityOrder[b.planPriority as keyof typeof priorityOrder] || 0) - 
                          (priorityOrder[a.planPriority as keyof typeof priorityOrder] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      
      return (statusOrder[b.status as keyof typeof statusOrder] || 0) - 
             (statusOrder[a.status as keyof typeof statusOrder] || 0);
    });
  });

  inProgressCount = computed(() => 
    this.allInitiatives().filter(i => i.status === 'IN_PROGRESS').length
  );

  completedCount = computed(() => 
    this.allInitiatives().filter(i => i.status === 'COMPLETED').length
  );

  completionRate = computed(() => {
    const total = this.allInitiatives().length;
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  });

  ngOnInit(): void {
    this.loadMyInitiatives();
  }

  loadMyInitiatives(): void {
    this.loadingService.show();
    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.loadingService.hide();
      this.toastService.showError('User not found. Please login again.');
      return;
    }

    this.initiativeService.getMyInitiatives(userId).subscribe({
      next: (initiatives) => {
        // Map backend response to include plan and milestone info
        const mappedInitiatives = initiatives.map((initiative: any) => ({
          ...initiative,
          planId: initiative.milestone?.plan?.planId,
          planTitle: initiative.milestone?.plan?.title,
          planPriority: initiative.milestone?.plan?.priority,
          milestoneTitle: initiative.milestone?.title,
          milestoneId: initiative.milestone?.milestoneId
        }));
        this.allInitiatives.set(mappedInitiatives);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Failed to load initiatives:', error);
        this.loadingService.hide();
        this.toastService.showError('Failed to load your initiatives');
      }
    });
  }

  filterInitiatives(): void {
    // Filtering is handled by computed signal
  }

  updateStatus(initiative: Initiative, event: Event): void {
    const newStatus = (event.target as HTMLSelectElement).value;
    
    if (newStatus === initiative.status) return;

    const updatedInitiative = { ...initiative, status: newStatus };
    
    this.initiativeService.updateInitiative(initiative.initiativeId!, updatedInitiative).subscribe({
      next: () => {
        this.toastService.showSuccess(`Status updated to ${newStatus}`);
        this.loadMyInitiatives(); // Refresh list
      },
      error: (error) => {
        console.error('Failed to update status:', error);
        this.toastService.showError('Failed to update status');
        // Revert the change
        (event.target as HTMLSelectElement).value = initiative.status || 'PLANNED';
      }
    });
  }

  viewPlan(initiative: Initiative): void {
    if (initiative.planId) {
      this.router.navigate(['/plans', initiative.planId]);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

