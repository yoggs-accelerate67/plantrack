import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
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
  
  // Stores the count, initial value 0
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  // Stores the REAL-TIME event stream.
  // CRITICAL FIX: Use Subject, not BehaviorSubject. 
  // BehaviorSubject replays the last value to new subscribers, causing duplicates on reload.
  private latestNotificationSubject = new Subject<Notification>(); 
  public latestNotification$ = this.latestNotificationSubject.asObservable();

  private eventSource: EventSource | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private zone: NgZone
  ) {}

  subscribeToNotifications(userId: number): void {
    // 1. Cleanup: Ensure any previous connection is closed
    this.disconnect();

    const token = this.authService.getToken();
    // Pass token as query param for SSE
    const url = `${this.apiUrl}/notifications/stream?userId=${userId}&token=${token}`;
    
    console.log('Connecting to SSE:', url);
    this.eventSource = new EventSource(url);

    this.eventSource.addEventListener('notification', (event: MessageEvent) => {
      // Zone.run ensures Angular detects the change and updates the UI
      this.zone.run(() => {
        try {
          const notification: Notification = JSON.parse(event.data);
          console.log('SSE Received:', notification);
          
          // Emit to subscribers
          this.latestNotificationSubject.next(notification);
          
          // Increment count immediately
          const currentCount = this.unreadCountSubject.value;
          this.unreadCountSubject.next(currentCount + 1);
        } catch (e) {
          console.error('Error parsing SSE data', e);
        }
      });
    });

    this.eventSource.onerror = (error) => {
      // readyState 0=CONNECTING, 1=OPEN, 2=CLOSED
      if (this.eventSource?.readyState !== 2) {
        console.error('SSE Connection Error:', error);
      }
    };
  }

  disconnect(): void {
    if (this.eventSource) {
      console.log('Disconnecting SSE');
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // --- CRUD Methods ---

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
        // Optimistic UI update
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