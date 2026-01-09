import { Component, OnInit, OnDestroy, signal, inject, effect } from '@angular/core';
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
      <button (click)="toggleDropdown()" class="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none" [attr.aria-label]="'Notifications'">
        <svg class="w-6 h-6 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        @if (unreadCount() > 0) {
          <span class="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {{ unreadCount() > 9 ? '9+' : unreadCount() }}
          </span>
        }
      </button>

      @if (showDropdown()) {
        <div class="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-600 z-50 max-h-96 flex flex-col">
          <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
            @if (unreadCount() > 0) {
              <button (click)="markAllAsRead()" class="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 font-medium">Mark all read</button>
            }
          </div>
          <div class="overflow-y-auto flex-1">
            @if (notifications().length === 0) {
              <div class="p-8 text-center text-slate-500 dark:text-slate-400">
                <p>No notifications</p>
              </div>
            } @else {
              @for (notification of notifications(); track notification.notificationId) {
                <div class="p-4 border-b border-slate-100 dark:border-slate-700 cursor-pointer"
                  [ngClass]="{'bg-teal-50 dark:bg-teal-900/20': notification.status === 'UNREAD', 'hover:bg-slate-50 dark:hover:bg-slate-700': notification.status === 'READ'}"
                  (click)="markAsRead(notification)">
                  <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ notification.message }}</p>
                  <p class="text-xs text-slate-500 mt-1">{{ formatDate(notification.createdDate) }}</p>
                </div>
              }
            }
          </div>
        </div>
      }
    </div>
  `
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  showDropdown = signal(false);
  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      // 1. Initial Load of Unread Count
      this.notificationService.getUnreadCount(userId).subscribe(); // Service updates the observable
      
      // 2. Subscribe to Unread Count changes (from initial load OR SSE updates)
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount.set(count);
      });

      // 3. Connect to SSE Stream
      this.notificationService.subscribeToNotifications(userId);

      // 4. Listen for new incoming notifications to update the list immediately if dropdown is open
      this.notificationService.latestNotification$.subscribe(newNotification => {
        console.log("IRAN")
        if (newNotification) {
          // Add to top of list
          this.notifications.update(current => [newNotification, ...current]);
          this.toastService.showInfo('New Notification: ' + newNotification.message);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.notificationService.disconnect();
  }

  toggleDropdown(): void {
    this.showDropdown.set(!this.showDropdown());
    if (this.showDropdown()) {
      // Reload full list when opening to ensure sync
      const userId = this.authService.getUserId();
      if (userId) {
        this.notificationService.getAllNotifications(userId).subscribe(data => {
          this.notifications.set(data);
        });
      }
    }
  }

  markAsRead(notification: Notification): void {
    if (notification.status === 'READ' || !notification.notificationId) return;
    this.notificationService.markAsRead(notification.notificationId).subscribe(() => {
      notification.status = 'READ';
      // Unread count is auto-updated by the service's tap operator
    });
  }

  markAllAsRead(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.notificationService.markAllAsRead(userId).subscribe(() => {
        this.notifications.update(list => list.map(n => ({ ...n, status: 'READ' })));
      });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  }
}