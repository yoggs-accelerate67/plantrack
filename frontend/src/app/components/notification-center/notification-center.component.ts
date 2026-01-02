import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <!-- Bell Icon Button -->
      <button
        (click)="toggleDropdown()"
        class="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
        [attr.aria-label]="'Notifications' + (unreadCount() > 0 ? ' (' + unreadCount() + ' unread)' : '')"
      >
        <svg class="w-6 h-6 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        @if (unreadCount() > 0) {
          <span class="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {{ unreadCount() > 9 ? '9+' : unreadCount() }}
          </span>
        }
      </button>

      <!-- Dropdown Panel -->
      @if (showDropdown()) {
        <div class="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 dark:border-slate-600 rounded-xl shadow-xl border border-slate-200 dark:border-slate-600 z-50 max-h-96 flex flex-col backdrop-blur-sm">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
            <div class="flex items-center space-x-2">
              @if (unreadCount() > 0) {
                <button
                  (click)="markAllAsRead()"
                  class="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
                >
                  Mark all read
                </button>
              }
              <button
                (click)="showDropdown.set(false)"
                class="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <svg class="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Notifications List -->
          <div class="overflow-y-auto flex-1">
            @if (notifications().length === 0) {
              <div class="p-8 text-center text-slate-500 dark:text-slate-400">
                <svg class="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p class="text-sm">No notifications</p>
              </div>
            } @else {
              @for (notification of notifications(); track notification.notificationId) {
                <div
                  class="p-4 border-b border-slate-100 dark:border-slate-700 transition-colors cursor-pointer"
                  [ngClass]="{
                    'bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30': notification.status === 'UNREAD',
                    'hover:bg-slate-50 dark:hover:bg-slate-700/50': notification.status === 'READ'
                  }"
                  (click)="markAsRead(notification)"
                >
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0 mt-1">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center"
                        [ngClass]="{
                          'bg-blue-100 dark:bg-blue-900/30': notification.type === 'ASSIGNMENT',
                          'bg-green-100 dark:bg-green-900/30': notification.type === 'STATUS_UPDATE',
                          'bg-purple-100 dark:bg-purple-900/30': notification.type === 'WEEKLY_REPORT',
                          'bg-slate-100 dark:bg-slate-700': notification.type !== 'ASSIGNMENT' && notification.type !== 'STATUS_UPDATE' && notification.type !== 'WEEKLY_REPORT'
                        }">
                        <svg class="w-4 h-4" 
                          [ngClass]="{
                            'text-blue-600 dark:text-blue-400': notification.type === 'ASSIGNMENT',
                            'text-green-600 dark:text-green-400': notification.type === 'STATUS_UPDATE',
                            'text-purple-600 dark:text-purple-400': notification.type === 'WEEKLY_REPORT',
                            'text-slate-600 dark:text-slate-400': notification.type !== 'ASSIGNMENT' && notification.type !== 'STATUS_UPDATE' && notification.type !== 'WEEKLY_REPORT'
                          }"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">{{ notification.message }}</p>
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ formatDate(notification.createdDate) }}</p>
                    </div>
                    @if (notification.status === 'UNREAD') {
                      <div class="flex-shrink-0 w-2 h-2 rounded-full bg-teal-500 dark:bg-teal-400 mt-2"></div>
                    }
                  </div>
                </div>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class NotificationCenterComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  showDropdown = signal(false);
  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);

  ngOnInit(): void {
    this.loadNotifications();
    this.loadUnreadCount();
    
    // Refresh every 3 seconds to catch new notifications quickly
    setInterval(() => {
      this.loadUnreadCount(); // Always refresh unread count
      // Always refresh notifications list too, so badge count matches
      this.loadNotifications();
    }, 3000);
  }
  
  // Public method to refresh notifications (can be called from other components)
  refreshNotifications(): void {
    this.loadNotifications();
    this.loadUnreadCount();
  }

  toggleDropdown(): void {
    const newValue = !this.showDropdown();
    this.showDropdown.set(newValue);
    if (newValue) {
      this.loadNotifications();
    }
  }

  loadNotifications(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.warn('[NotificationCenter] No user ID available');
      return;
    }

    console.log(`[NotificationCenter] Loading notifications for user ${userId}`);
    this.notificationService.getAllNotifications(userId).subscribe({
      next: (notifications) => {
        console.log(`[NotificationCenter] Loaded ${notifications.length} notifications:`, notifications);
        this.notifications.set(notifications);
      },
      error: (error) => {
        console.error('[NotificationCenter] Failed to load notifications:', error);
      }
    });
  }

  loadUnreadCount(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.warn('[NotificationCenter] No user ID available for unread count');
      return;
    }

    this.notificationService.getUnreadCount(userId).subscribe({
      next: (count) => {
        console.log(`[NotificationCenter] Unread count: ${count} for user ${userId}`);
        this.unreadCount.set(count);
      },
      error: (error) => {
        console.error('[NotificationCenter] Failed to load unread count:', error);
      }
    });
  }

  markAsRead(notification: Notification): void {
    if (notification.status === 'READ' || !notification.notificationId) return;

    this.notificationService.markAsRead(notification.notificationId).subscribe({
      next: () => {
        notification.status = 'READ';
        this.unreadCount.update(count => Math.max(0, count - 1));
      },
      error: (error) => {
        console.error('Failed to mark as read:', error);
      }
    });
  }

  markAllAsRead(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.notificationService.markAllAsRead(userId).subscribe({
      next: () => {
        this.notifications.update(notifications => 
          notifications.map(n => ({ ...n, status: 'READ' }))
        );
        this.unreadCount.set(0);
        this.toastService.showSuccess('All notifications marked as read');
      },
      error: (error) => {
        console.error('Failed to mark all as read:', error);
        this.toastService.showError('Failed to mark all as read');
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }
}
