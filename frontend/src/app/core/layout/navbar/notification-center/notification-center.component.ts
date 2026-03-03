import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from './notification.service';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-center.component.html',
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  // Track subscriptions to clean them up on destroy
  private subscriptions: Subscription = new Subscription();

  showDropdown = signal(false);
  notifications = signal<Notification[]>([]);
  unreadCount = signal(0);

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      // 1. Initial Load of Counts
      this.notificationService.getUnreadCount(userId).subscribe();

      // 2. Subscribe to Count updates
      this.subscriptions.add(
        this.notificationService.unreadCount$.subscribe((count) => {
          this.unreadCount.set(count);
        }),
      );

      // 3. Start SSE connection
      this.notificationService.subscribeToNotifications(userId);

      // 4. Subscribe to Real-Time Notification Stream (WITH DEDUPLICATION)
      this.subscriptions.add(
        this.notificationService.latestNotification$.subscribe(
          (newNotification) => {
            if (newNotification) {
              // Deduplication Logic: Check if ID already exists
              this.notifications.update((current) => {
                const exists = current.some(
                  (n) => n.notificationId === newNotification.notificationId,
                );
                if (exists) {
                  return current; // Do nothing if it already exists
                }
                return [newNotification, ...current]; // Add to top if new
              });
              this.toastService.showInfo(
                'New Notification: ' + newNotification.message,
              );
            }
          },
        ),
      );
    }
  }

  ngOnDestroy(): void {
    // CRITICAL: Close SSE connection and unsubscribe
    this.notificationService.disconnect();
    this.subscriptions.unsubscribe();
  }

  toggleDropdown(): void {
    this.showDropdown.set(!this.showDropdown());
    if (this.showDropdown()) {
      const userId = this.authService.getUserId();
      if (userId) {
        // Refresh full list when opening to ensure sync
        this.notificationService
          .getAllNotifications(userId)
          .subscribe((data) => {
            this.notifications.set(data);
          });
      }
    }
  }

  markAsRead(notification: Notification): void {
    if (notification.status === 'READ' || !notification.notificationId) return;
    this.notificationService
      .markAsRead(notification.notificationId)
      .subscribe(() => {
        // Update local state to reflect read status
        this.notifications.update((list) =>
          list.map((n) =>
            n.notificationId === notification.notificationId
              ? { ...n, status: 'READ' }
              : n,
          ),
        );
      });
  }

  markAllAsRead(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.notificationService.markAllAsRead(userId).subscribe(() => {
        this.notifications.update((list) =>
          list.map((n) => ({ ...n, status: 'READ' })),
        );
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
