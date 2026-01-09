import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Notification {
  notificationId?: number;
  type: string;
  message: string;
  status: string;
  createdDate: string;
  entityType?: string;
  entityId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8080/api';
  
  // Observables for components to subscribe to
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  private latestNotificationSubject = new BehaviorSubject<Notification | null>(null);
  public latestNotification$ = this.latestNotificationSubject.asObservable();

  private eventSource: EventSource | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private zone: NgZone
  ) {}

  // --- SSE Subscription ---
  subscribeToNotifications(userId: number): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const token = this.authService.getToken();
    // Pass userId and token in query params
    const url = `${this.apiUrl}/notifications/stream?userId=${userId}&token=${token}`;
    
    this.eventSource = new EventSource(url);

    this.eventSource.addEventListener('notification', (event: MessageEvent) => {
      // Must run inside Angular Zone to update UI
      this.zone.run(() => {
        const notification: Notification = JSON.parse(event.data);
        console.log('SSE Received:', notification);
        
        // 1. Update latest notification stream
        this.latestNotificationSubject.next(notification);
        
        // 2. Increment unread count locally
        const currentCount = this.unreadCountSubject.value;
        this.unreadCountSubject.next(currentCount + 1);
      });
    });

    this.eventSource.onerror = (error) => {
      console.error('SSE Error:', error);
      // Optional: Implement reconnection backoff here if needed
      // EventSource tries to reconnect automatically by default
    };
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // --- Standard CRUD ---

  getAllNotifications(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/users/${userId}/notifications`);
  }

  getUnreadCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/users/${userId}/notifications/unread-count`).pipe(
      tap(count => this.unreadCountSubject.next(count))
    );
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/notifications/${notificationId}/read`, {}).pipe(
      tap(() => {
        // Decrement local count immediately for UI responsiveness
        const current = this.unreadCountSubject.value;
        this.unreadCountSubject.next(Math.max(0, current - 1));
      })
    );
  }

  markAllAsRead(userId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${userId}/notifications/read-all`, {}).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }
}