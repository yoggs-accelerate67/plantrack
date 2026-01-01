import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/plan.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';
  private tokenKey = 'auth_token';
  
  isAuthenticated = signal<boolean>(false);
  currentUser = signal<string | null>(null);
  userRole = signal<string | null>(null);

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        console.log('Login response received:', response);
        
        if (!response || !response.token) {
          throw new Error('Invalid response from server');
        }
        
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem('user_role', response.role);
        
        // Extract email from token or use the one from credentials
        const email = this.extractEmailFromToken(response.token) || credentials.email;
        localStorage.setItem('user_email', email);
        
        this.isAuthenticated.set(true);
        this.currentUser.set(email);
        
        // Remove ROLE_ prefix if present
        const role = response.role.replace('ROLE_', '');
        this.userRole.set(role);
        
        console.log('User authenticated:', { email, role });
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.userRole.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isManager(): boolean {
    const role = this.userRole();
    return role === 'MANAGER' || role === 'ADMIN';
  }

  isAdmin(): boolean {
    return this.userRole() === 'ADMIN';
  }

  isEmployee(): boolean {
    return this.userRole() === 'EMPLOYEE';
  }

  private checkAuthStatus(): void {
    const token = this.getToken();
    if (token) {
      this.isAuthenticated.set(true);
      this.currentUser.set(localStorage.getItem('user_email'));
      const role = localStorage.getItem('user_role');
      this.userRole.set(role ? role.replace('ROLE_', '') : null);
    }
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Extract userId from token claims
      if (payload.userId) {
        return typeof payload.userId === 'number' ? payload.userId : parseInt(payload.userId, 10);
      }
      return null;
    } catch {
      return null;
    }
  }

  private extractEmailFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
    } catch {
      return null;
    }
  }
}

