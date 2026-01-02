import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';
import { NotificationCenterComponent } from '../notification-center/notification-center.component';
import { HttpClient } from '@angular/common/http';

interface AuditLog {
  id: number;
  action: string;
  performedBy: string;
  entityType: string;
  entityId: number;
  details: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
}

@Component({
  selector: 'app-audit-logs',
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
                <a routerLink="/analytics" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">Analytics</a>
                <a routerLink="/audit-logs" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">Audit Logs</a>
                <a routerLink="/users" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">User Management</a>
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
          <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Audit Logs</h1>
          <p class="text-slate-600 dark:text-slate-400">Comprehensive activity tracking and compliance records</p>
        </div>

        <!-- Filters -->
        <div class="card mb-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Entity Type</label>
              <select
                [(ngModel)]="filterEntityType"
                (ngModelChange)="applyFilters()"
                class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Types</option>
                <option value="PLAN">Plan</option>
                <option value="MILESTONE">Milestone</option>
                <option value="INITIATIVE">Initiative</option>
                <option value="USER">User</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Action</label>
              <select
                [(ngModel)]="filterAction"
                (ngModelChange)="applyFilters()"
                class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="UPDATE_STATUS">Status Change</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">User</label>
              <input
                type="text"
                [(ngModel)]="filterUser"
                (ngModelChange)="applyFilters()"
                placeholder="Email or name..."
                class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div class="flex items-end">
              <button
                (click)="clearFilters()"
                class="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Audit Logs Table -->
        <div class="card overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-700">
                <th class="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Timestamp</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Action</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Entity</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Performed By</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Details</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Changes</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredLogs().length === 0) {
                <tr>
                  <td colspan="6" class="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    No audit logs found
                  </td>
                </tr>
              } @else {
                @for (log of filteredLogs(); track log.id) {
                  <tr class="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{{ formatTimestamp(log.timestamp) }}</td>
                    <td class="px-4 py-3">
                      <span class="px-2 py-1 rounded-full text-xs font-medium"
                        [ngClass]="{
                          'badge-success': log.action === 'CREATE',
                          'badge-info': log.action === 'UPDATE' || log.action === 'UPDATE_STATUS',
                          'badge-danger': log.action === 'DELETE'
                        }">
                        {{ log.action }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
                      {{ log.entityType }} #{{ log.entityId }}
                    </td>
                    <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{{ log.performedBy }}</td>
                    <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 max-w-md truncate">{{ log.details }}</td>
                    <td class="px-4 py-3 text-sm">
                      @if (log.oldValue && log.newValue) {
                        <div class="flex items-center space-x-2">
                          <span class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs line-through">{{ log.oldValue }}</span>
                          <span class="text-slate-400">→</span>
                          <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">{{ log.newValue }}</span>
                        </div>
                      }
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AuditLogsComponent implements OnInit {
  authService = inject(AuthService);
  private http = inject(HttpClient);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  allLogs = signal<AuditLog[]>([]);
  filterEntityType = signal<string>('');
  filterAction = signal<string>('');
  filterUser = signal<string>('');

  filteredLogs = signal<AuditLog[]>([]);

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.loadingService.show();
    this.http.get<AuditLog[]>('http://localhost:8080/api/audit-logs').subscribe({
      next: (logs) => {
        this.allLogs.set(logs);
        this.applyFilters();
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Failed to load audit logs:', error);
        this.loadingService.hide();
        this.toastService.showError('Failed to load audit logs');
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allLogs()];

    if (this.filterEntityType()) {
      filtered = filtered.filter(log => log.entityType === this.filterEntityType());
    }

    if (this.filterAction()) {
      filtered = filtered.filter(log => log.action === this.filterAction());
    }

    if (this.filterUser()) {
      const query = this.filterUser().toLowerCase();
      filtered = filtered.filter(log => 
        log.performedBy.toLowerCase().includes(query)
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    this.filteredLogs.set(filtered);
  }

  clearFilters(): void {
    this.filterEntityType.set('');
    this.filterAction.set('');
    this.filterUser.set('');
    this.applyFilters();
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

