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
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem('user_email', response.email);
        localStorage.setItem('user_role', response.role);
        this.isAuthenticated.set(true);
        this.currentUser.set(response.email);
        this.userRole.set(response.role);
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

  private checkAuthStatus(): void {
    const token = this.getToken();
    if (token) {
      this.isAuthenticated.set(true);
      this.currentUser.set(localStorage.getItem('user_email'));
      this.userRole.set(localStorage.getItem('user_role'));
    }
  }
}


