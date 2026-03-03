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
  templateUrl: './audit-logs.component.html',
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
    this.http.get<AuditLog[]>('http://localhost:8765/api/audit-logs').subscribe({
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

