import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';
import { NotificationCenterComponent } from '../notification-center/notification-center.component';
import { HttpClient } from '@angular/common/http';

interface DepartmentalInsight {
  department: string;
  totalInitiatives: number;
  completedInitiatives: number;
  inProgressInitiatives: number;
  plannedInitiatives: number;
  completionRate: number;
  onTimeDeliveryRate: number;
  blockedCount: number;
  statusBreakdown: Record<string, number>;
}

interface VelocityMetric {
  userId: number;
  userName: string;
  department: string;
  tasksAssigned: number;
  tasksCompleted: number;
  completionRate: number;
  averageTasksPerWeek: number;
  averageTasksPerMonth: number;
}

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationCenterComponent],
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
                <a routerLink="/analytics" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">Analytics</a>
                @if (authService.isAdmin()) {
                  <a routerLink="/audit-logs" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">Audit Logs</a>
                  <a routerLink="/users" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">User Management</a>
                }
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <app-notification-center></app-notification-center>
              <div class="hidden sm:flex items-center space-x-3">
                <div class="text-right">
                  <p class="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
                  <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ authService.currentUser() }}</p>
                </div>
                <span class="px-3 py-1.5 bg-gradient-to-r from-teal-100 to-teal-50 dark:from-teal-900/30 dark:to-teal-800/30 text-teal-700 dark:text-teal-400 rounded-full text-xs font-semibold border border-teal-200 dark:border-teal-700">{{ authService.userRole() }}</span>
              </div>
              <button (click)="logout()" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center space-x-2">
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
          <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Analytics Dashboard</h1>
          <p class="text-slate-600 dark:text-slate-400">Command Center - Departmental Insights & Performance Metrics</p>
        </div>

        <!-- Departmental Insights -->
        <div class="mb-8">
          <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Departmental Performance</h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            @for (insight of departmentalInsights(); track insight.department) {
              <div class="card">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ insight.department }}</h3>
                  <span class="px-3 py-1 rounded-full text-sm font-medium badge-info">
                    {{ insight.completionRate.toFixed(1) }}% Complete
                  </span>
                </div>
                
                <div class="space-y-3">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-600 dark:text-slate-400">Total Initiatives</span>
                    <span class="font-semibold text-slate-900 dark:text-slate-100">{{ insight.totalInitiatives }}</span>
                  </div>
                  
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-600 dark:text-slate-400">Completed</span>
                    <span class="font-semibold text-green-600 dark:text-green-400">{{ insight.completedInitiatives }}</span>
                  </div>
                  
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-600 dark:text-slate-400">In Progress</span>
                    <span class="font-semibold text-amber-600 dark:text-amber-400">{{ insight.inProgressInitiatives }}</span>
                  </div>
                  
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-600 dark:text-slate-400">Planned</span>
                    <span class="font-semibold text-slate-600 dark:text-slate-400">{{ insight.plannedInitiatives }}</span>
                  </div>
                  
                  <div class="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div class="flex items-center justify-between text-sm mb-2">
                      <span class="text-slate-600 dark:text-slate-400">On-Time Delivery</span>
                      <span class="font-semibold text-teal-600 dark:text-teal-400">{{ insight.onTimeDeliveryRate.toFixed(1) }}%</span>
                    </div>
                    <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div class="bg-teal-600 h-2 rounded-full transition-all" [style.width.%]="insight.onTimeDeliveryRate"></div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Velocity Metrics -->
        <div>
          <h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Team Velocity</h2>
          <div class="card overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700">
                  <th class="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Team Member</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Department</th>
                  <th class="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">Assigned</th>
                  <th class="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">Completed</th>
                  <th class="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">Completion Rate</th>
                  <th class="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">Avg/Week</th>
                  <th class="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">Avg/Month</th>
                </tr>
              </thead>
              <tbody>
                @for (metric of velocityMetrics(); track metric.userId) {
                  <tr class="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td class="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{{ metric.userName }}</td>
                    <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{{ metric.department || 'N/A' }}</td>
                    <td class="px-4 py-3 text-sm text-right text-slate-900 dark:text-slate-100">{{ metric.tasksAssigned }}</td>
                    <td class="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400 font-medium">{{ metric.tasksCompleted }}</td>
                    <td class="px-4 py-3 text-sm text-right">
                      <span class="px-2 py-1 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'badge-success': metric.completionRate >= 80,
                          'badge-warning': metric.completionRate >= 50 && metric.completionRate < 80,
                          'badge-danger': metric.completionRate < 50
                        }">
                        {{ metric.completionRate.toFixed(1) }}%
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-right text-slate-600 dark:text-slate-400">{{ metric.averageTasksPerWeek.toFixed(1) }}</td>
                    <td class="px-4 py-3 text-sm text-right text-slate-600 dark:text-slate-400">{{ metric.averageTasksPerMonth.toFixed(1) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AnalyticsDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private http = inject(HttpClient);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  departmentalInsights = signal<DepartmentalInsight[]>([]);
  velocityMetrics = signal<VelocityMetric[]>([]);

  ngOnInit(): void {
    if (!this.authService.isManager() && !this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loadingService.show();
    
    // Load departmental insights
    this.http.get<DepartmentalInsight[]>('http://localhost:8080/api/analytics/departmental-insights').subscribe({
      next: (insights) => {
        this.departmentalInsights.set(insights);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Failed to load departmental insights:', error);
        this.loadingService.hide();
        this.toastService.showError('Failed to load analytics');
      }
    });

    // Load velocity metrics
    if (this.authService.isAdmin()) {
      this.http.get<VelocityMetric[]>('http://localhost:8080/api/analytics/velocity').subscribe({
        next: (metrics) => {
          this.velocityMetrics.set(metrics);
        },
        error: (error) => {
          console.error('Failed to load velocity metrics:', error);
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

