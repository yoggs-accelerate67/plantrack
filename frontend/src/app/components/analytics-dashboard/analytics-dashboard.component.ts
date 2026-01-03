import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';
import { NotificationCenterComponent } from '../notification-center/notification-center.component';
import { HttpClient, HttpParams } from '@angular/common/http';

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

interface GamifiedVelocity {
  userId: number;
  userName: string;
  department: string;
  tasksAssigned: number;
  tasksCompleted: number;
  completionRate: number;
  averageTasksPerWeek: number;
  averageTasksPerMonth: number;
  overallScore: number;
  rank: number;
  departmentRank: number;
  performanceTier: string;
  badges: Badge[];
  improvementPercentage: number;
  streakDays: number;
  streakWeeks: number;
}

interface Badge {
  badgeId: string;
  badgeName: string;
  description: string;
  category: string;
  icon: string;
  earnedDate: string;
  earned: boolean;
  criteria: string;
}

interface LeaderboardEntry {
  userId: number;
  userName: string;
  department: string;
  rank: number;
  score: number;
  metricType: string;
  metricValue: number;
  rankChange: number;
  badgeIcon?: string;
}

interface FilterState {
  searchQuery: string;
  selectedDepartment: string;
  minCompletionRate: number | null;
  maxCompletionRate: number | null;
  minTasks: number | null;
  maxTasks: number | null;
  performanceTier: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

@Component({
  selector: 'app-analytics-dashboard',
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
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">🎮 Gamified Performance Dashboard</h1>
          <p class="text-slate-600 dark:text-slate-400">Engage, compete, and excel with your team</p>
        </div>

        <!-- View Toggle -->
        <div class="mb-6 flex space-x-2">
          <button 
            (click)="switchView('leaderboard')"
            [class]="currentView() === 'leaderboard' ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'"
            class="px-4 py-2 rounded-lg font-medium transition-colors">
            🏆 Leaderboard
          </button>
          <button 
            (click)="switchView('performance')"
            [class]="currentView() === 'performance' ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'"
            class="px-4 py-2 rounded-lg font-medium transition-colors">
            📊 Performance Metrics
          </button>
          <button 
            (click)="switchView('departments')"
            [class]="currentView() === 'departments' ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'"
            class="px-4 py-2 rounded-lg font-medium transition-colors">
            🏢 Departments
          </button>
        </div>

        <!-- Leaderboard View -->
        @if (currentView() === 'leaderboard') {
          <div class="space-y-6">
            <!-- Leaderboard Controls -->
            <div class="card p-4">
              <div class="flex flex-wrap gap-4 items-center">
                <select [(ngModel)]="leaderboardMetric" (change)="loadLeaderboard()" 
                  class="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                  <option value="OVERALL">Overall Performance</option>
                  <option value="SPEED">Speed Leaderboard</option>
                  <option value="QUALITY">Quality Leaderboard</option>
                  <option value="IMPROVEMENT">Improvement Leaderboard</option>
                </select>
                <select [(ngModel)]="filters.selectedDepartment" (change)="loadLeaderboard()"
                  class="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                  <option value="">All Departments</option>
                  @for (dept of departments(); track dept) {
                    <option [value]="dept">{{ dept }}</option>
                  }
                </select>
              </div>
            </div>

            <!-- Leaderboard Display -->
            <div class="card overflow-hidden">
              <div class="p-6">
                <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{{ getLeaderboardTitle() }}</h2>
                <div class="space-y-3">
                  @for (entry of leaderboard(); track entry.userId) {
                    <div class="flex items-center p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      [ngClass]="{
                        'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30': entry.rank === 1,
                        'bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-600/50': entry.rank === 2,
                        'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30': entry.rank === 3,
                        'bg-white dark:bg-slate-800': entry.rank > 3
                      }">
                      <div class="flex-shrink-0 w-12 text-center">
                        @if (entry.rank === 1) {
                          <span class="text-2xl">🥇</span>
                        } @else if (entry.rank === 2) {
                          <span class="text-2xl">🥈</span>
                        } @else if (entry.rank === 3) {
                          <span class="text-2xl">🥉</span>
                        } @else {
                          <span class="text-lg font-bold text-slate-700 dark:text-slate-300">#{{ entry.rank }}</span>
                        }
                      </div>
                      <div class="flex-1 ml-4">
                        <div class="flex items-center space-x-2">
                          <h3 class="font-semibold text-slate-900 dark:text-slate-100">{{ entry.userName }}</h3>
                          <span class="px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">{{ entry.department }}</span>
                        </div>
                        <p class="text-sm text-slate-700 dark:text-slate-300 mt-1">
                          Score: <span class="font-semibold text-teal-600 dark:text-teal-400">{{ entry.score.toFixed(1) }}</span>
                        </p>
                      </div>
                      <div class="flex-shrink-0">
                        @if (entry.rankChange > 0) {
                          <span class="text-green-600 dark:text-green-400 text-sm font-medium">↑ {{ entry.rankChange }}</span>
                        } @else if (entry.rankChange < 0) {
                          <span class="text-red-600 dark:text-red-400 text-sm font-medium">↓ {{ Math.abs(entry.rankChange) }}</span>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        }

        <!-- Performance Metrics View -->
        @if (currentView() === 'performance') {
          <div class="space-y-6">
            <!-- Advanced Search and Filters -->
            <div class="card p-6">
              <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">🔍 Search & Filter</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Search -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Search</label>
                  <input 
                    type="text" 
                    [(ngModel)]="filters.searchQuery"
                    (input)="applyFilters()"
                    placeholder="Name or department..."
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500">
                </div>
                <!-- Department -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Department</label>
                  <select [(ngModel)]="filters.selectedDepartment" (change)="applyFilters()"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                    <option value="">All Departments</option>
                    @for (dept of departments(); track dept) {
                      <option [value]="dept">{{ dept }}</option>
                    }
                  </select>
                </div>
                <!-- Performance Tier -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Performance Tier</label>
                  <select [(ngModel)]="filters.performanceTier" (change)="applyFilters()"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                    <option value="">All Tiers</option>
                    <option value="TOP_PERFORMER">Top Performer</option>
                    <option value="CONSISTENT">Consistent</option>
                    <option value="NEEDS_IMPROVEMENT">Needs Improvement</option>
                  </select>
                </div>
                <!-- Sort By -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sort By</label>
                  <select [(ngModel)]="filters.sortBy" (change)="applyFilters()"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                    <option value="score">Overall Score</option>
                    <option value="completionRate">Completion Rate</option>
                    <option value="name">Name</option>
                    <option value="tasksCompleted">Tasks Completed</option>
                    <option value="rank">Rank</option>
                  </select>
                </div>
              </div>
              <div class="mt-4 flex items-center space-x-4">
                <button (click)="toggleSortOrder()" class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                  {{ filters.sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending' }}
                </button>
                <button (click)="resetFilters()" class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                  Reset Filters
                </button>
              </div>
            </div>

            <!-- Performance Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (metric of filteredMetrics(); track metric.userId) {
                <div class="card p-6 hover:shadow-xl transition-shadow">
                  <!-- Header with Rank and Badges -->
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                      <div class="flex items-center space-x-2 mb-2">
                        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ metric.userName }}</h3>
                        <span class="px-2 py-1 text-xs rounded-full"
                          [ngClass]="{
                            'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400': metric.performanceTier === 'TOP_PERFORMER',
                            'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400': metric.performanceTier === 'CONSISTENT',
                            'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400': metric.performanceTier === 'NEEDS_IMPROVEMENT'
                          }">
                          {{ metric.performanceTier.replace('_', ' ') }}
                        </span>
                      </div>
                      <p class="text-sm text-slate-600 dark:text-slate-400">{{ metric.department }}</p>
                    </div>
                    <div class="text-right">
                      <div class="text-2xl font-bold text-teal-600 dark:text-teal-400">#{{ metric.departmentRank }}</div>
                      <div class="text-xs text-slate-500 dark:text-slate-500">in dept</div>
                    </div>
                  </div>

                  <!-- Progress Ring for Completion Rate -->
                  <div class="flex justify-center my-4">
                    <div class="relative w-24 h-24">
                      <svg class="transform -rotate-90 w-24 h-24">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" stroke-width="8" fill="none"
                          class="text-slate-200 dark:text-slate-700"></circle>
                        <circle cx="48" cy="48" r="40" stroke="currentColor" stroke-width="8" fill="none"
                          [style.stroke-dasharray]="251.2"
                          [style.stroke-dashoffset]="251.2 - (251.2 * metric.completionRate / 100)"
                          [ngClass]="{
                            'text-green-500': metric.completionRate >= 80,
                            'text-amber-500': metric.completionRate >= 50 && metric.completionRate < 80,
                            'text-red-500': metric.completionRate < 50
                          }"></circle>
                      </svg>
                      <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ metric.completionRate.toFixed(0) }}%</span>
                      </div>
                    </div>
                  </div>

                  <!-- Metrics -->
                  <div class="space-y-2 mb-4">
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-600 dark:text-slate-400">Tasks Completed</span>
                      <span class="font-semibold text-slate-900 dark:text-slate-100">{{ metric.tasksCompleted }} / {{ metric.tasksAssigned }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-600 dark:text-slate-400">Avg/Week</span>
                      <span class="font-semibold text-slate-900 dark:text-slate-100">{{ metric.averageTasksPerWeek.toFixed(1) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-600 dark:text-slate-400">Overall Score</span>
                      <span class="font-semibold text-teal-600 dark:text-teal-400">{{ metric.overallScore.toFixed(1) }}</span>
                    </div>
                  </div>

                  <!-- Badges -->
                  @if (metric.badges && metric.badges.length > 0) {
                    <div class="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p class="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Achievements</p>
                      <div class="flex flex-wrap gap-2">
                        @for (badge of metric.badges; track badge.badgeId) {
                          <div class="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-full border border-teal-200 dark:border-teal-700"
                            [title]="badge.description">
                            <span class="text-sm">{{ badge.icon }}</span>
                            <span class="text-xs font-medium text-slate-700 dark:text-slate-300">{{ badge.badgeName }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  }

                  <!-- Streaks -->
                  @if (metric.streakDays > 0 || metric.streakWeeks > 0) {
                    <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div class="flex items-center space-x-4 text-sm">
                        @if (metric.streakDays > 0) {
                          <div class="flex items-center space-x-1">
                            <span>🔥</span>
                            <span class="text-slate-600 dark:text-slate-400">{{ metric.streakDays }} day streak</span>
                          </div>
                        }
                        @if (metric.streakWeeks > 0) {
                          <div class="flex items-center space-x-1">
                            <span>⭐</span>
                            <span class="text-slate-600 dark:text-slate-400">{{ metric.streakWeeks }} week streak</span>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- Departments View -->
        @if (currentView() === 'departments') {
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
        }
      </div>
    </div>
  `,
  styles: [`
    .card {
      @apply bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6;
    }
    .badge-info {
      @apply bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400;
    }
  `]
})
export class AnalyticsDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private http = inject(HttpClient);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  Math = Math;

  currentView = signal<'leaderboard' | 'performance' | 'departments'>('performance');
  departmentalInsights = signal<DepartmentalInsight[]>([]);
  gamifiedMetrics = signal<GamifiedVelocity[]>([]);
  leaderboard = signal<LeaderboardEntry[]>([]);
  departments = signal<string[]>([]);
  leaderboardMetric = signal<string>('OVERALL');

  filters: FilterState = {
    searchQuery: '',
    selectedDepartment: '',
    minCompletionRate: null,
    maxCompletionRate: null,
    minTasks: null,
    maxTasks: null,
    performanceTier: '',
    sortBy: 'score',
    sortOrder: 'desc'
  };

  filteredMetrics = computed(() => {
    let metrics = [...this.gamifiedMetrics()];
    
    // Apply filters
    if (this.filters.searchQuery) {
      const query = this.filters.searchQuery.toLowerCase();
      metrics = metrics.filter(m => 
        m.userName.toLowerCase().includes(query) ||
        (m.department && m.department.toLowerCase().includes(query))
      );
    }
    
    if (this.filters.selectedDepartment) {
      metrics = metrics.filter(m => m.department === this.filters.selectedDepartment);
    }
    
    if (this.filters.performanceTier) {
      metrics = metrics.filter(m => m.performanceTier === this.filters.performanceTier);
    }
    
    // Apply sorting
    const sortBy = this.filters.sortBy;
    const sortOrder = this.filters.sortOrder;
    
    metrics.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.userName.localeCompare(b.userName);
          break;
        case 'completionRate':
          comparison = a.completionRate - b.completionRate;
          break;
        case 'tasksCompleted':
          comparison = a.tasksCompleted - b.tasksCompleted;
          break;
        case 'rank':
          comparison = a.rank - b.rank;
          break;
        case 'score':
        default:
          comparison = a.overallScore - b.overallScore;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return metrics;
  });

  ngOnInit(): void {
    // Allow all authenticated users (Employees, Managers, and Admins) to access analytics
    // This enables the gamified experience for everyone
    this.loadAnalytics();
    this.loadDepartments();
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

    // Load gamified velocity metrics
    this.loadGamifiedMetrics();
  }

  loadGamifiedMetrics(): void {
    let params = new HttpParams();
    if (this.filters.selectedDepartment) {
      params = params.set('department', this.filters.selectedDepartment);
    }
    if (this.filters.searchQuery) {
      params = params.set('search', this.filters.searchQuery);
    }
    if (this.filters.performanceTier) {
      params = params.set('performanceTier', this.filters.performanceTier);
    }
    params = params.set('sortBy', this.filters.sortBy);
    params = params.set('sortOrder', this.filters.sortOrder);

    this.http.get<GamifiedVelocity[]>('http://localhost:8080/api/analytics/gamified-velocity', { params }).subscribe({
      next: (metrics) => {
        this.gamifiedMetrics.set(metrics);
      },
      error: (error) => {
        console.error('Failed to load gamified metrics:', error);
      }
    });
  }

  loadLeaderboard(): void {
    let params = new HttpParams()
      .set('metricType', this.leaderboardMetric())
      .set('limit', '50');
    
    if (this.filters.selectedDepartment) {
      params = params.set('department', this.filters.selectedDepartment);
    }

    this.http.get<LeaderboardEntry[]>('http://localhost:8080/api/analytics/leaderboard', { params }).subscribe({
      next: (entries) => {
        this.leaderboard.set(entries);
      },
      error: (error) => {
        console.error('Failed to load leaderboard:', error);
        this.toastService.showError('Failed to load leaderboard');
      }
    });
  }

  loadDepartments(): void {
    this.http.get<string[]>('http://localhost:8080/api/analytics/departments').subscribe({
      next: (departments) => {
        this.departments.set(departments);
      },
      error: (error) => {
        console.error('Failed to load departments:', error);
      }
    });
  }

  applyFilters(): void {
    this.loadGamifiedMetrics();
  }

  toggleSortOrder(): void {
    this.filters.sortOrder = this.filters.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  resetFilters(): void {
    this.filters = {
      searchQuery: '',
      selectedDepartment: '',
      minCompletionRate: null,
      maxCompletionRate: null,
      minTasks: null,
      maxTasks: null,
      performanceTier: '',
      sortBy: 'score',
      sortOrder: 'desc'
    };
    this.loadGamifiedMetrics();
  }

  switchView(view: 'leaderboard' | 'performance' | 'departments'): void {
    this.currentView.set(view);
    if (view === 'leaderboard') {
      this.loadLeaderboard();
    }
  }

  getLeaderboardTitle(): string {
    const metric = this.leaderboardMetric();
    const dept = this.filters.selectedDepartment ? ` - ${this.filters.selectedDepartment}` : '';
    switch (metric) {
      case 'SPEED':
        return `Speed Leaderboard${dept}`;
      case 'QUALITY':
        return `Quality Leaderboard${dept}`;
      case 'IMPROVEMENT':
        return `Improvement Leaderboard${dept}`;
      default:
        return `Overall Performance Leaderboard${dept}`;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
