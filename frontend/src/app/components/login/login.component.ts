import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, rgb(15 23 42) 1px, transparent 0); background-size: 40px 40px;"></div>
      </div>
      
      <div class="w-full max-w-md relative z-10">
        <!-- Logo & Title Section -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl shadow-lg mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 class="text-4xl font-bold text-slate-900 mb-2 tracking-tight">PlanTrack Enterprise</h1>
          <p class="text-slate-600 text-lg">Sign in to your account</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 p-8 md:p-10">
          <form (ngSubmit)="onLogin()" class="space-y-6">
            <!-- Email Field -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  autocomplete="email"
                  class="input-field pl-12"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <label for="password" class="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  [(ngModel)]="password"
                  name="password"
                  required
                  autocomplete="current-password"
                  class="input-field pl-12"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <!-- Error Message -->
            @if (errorMessage()) {
              <div class="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start space-x-2 animate-in slide-in-from-top">
                <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="loadingService.isLoading()"
              class="btn-primary w-full text-base"
            >
              @if (loadingService.isLoading()) {
                <span class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              } @else {
                <span class="flex items-center justify-center">
                  <span>Sign In</span>
                  <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              }
            </button>
          </form>

          <!-- Demo Credentials -->
          <div class="mt-8 pt-6 border-t border-slate-200">
            <p class="text-xs font-semibold text-slate-500 text-center mb-4 uppercase tracking-wide">Demo Credentials</p>
            <div class="space-y-3">
              <div class="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p class="text-xs font-semibold text-slate-700 mb-1">Manager</p>
                <p class="text-xs text-slate-600 font-mono">alice&#64;company.com</p>
                <p class="text-xs text-slate-500 mt-1">SecurePass123!</p>
              </div>
              <div class="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p class="text-xs font-semibold text-slate-700 mb-1">Employee</p>
                <p class="text-xs text-slate-600 font-mono">charlie&#64;company.com</p>
                <p class="text-xs text-slate-500 mt-1">SecurePass123!</p>
              </div>
              <div class="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <p class="text-xs font-semibold text-slate-700 mb-1">Admin</p>
                <p class="text-xs text-slate-600 font-mono">bob&#64;company.com</p>
                <p class="text-xs text-slate-500 mt-1">SecurePass123!</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-sm text-slate-500 mt-8">
          Enterprise Project Management System
        </p>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = signal<string>('');

  constructor(
    private authService: AuthService,
    private router: Router,
    public toastService: ToastService,
    public loadingService: LoadingService
  ) {
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onLogin(): void {
    this.errorMessage.set('');
    
    if (!this.email || !this.password) {
      this.errorMessage.set('Please enter both email and password');
      return;
    }

    this.loadingService.show();
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.loadingService.hide();
        console.log('Login successful:', response);
        this.toastService.showSuccess('Login successful!');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loadingService.hide();
        console.error('Login error:', error);
        
        // Handle different error types
        let errorMsg = 'Invalid email or password';
        
        if (error.status === 0) {
          errorMsg = 'Cannot connect to server. Please ensure the backend is running on http://localhost:8080';
        } else if (error.status === 401 || error.status === 400) {
          errorMsg = error.error?.message || 'Invalid email or password';
        } else if (error.error?.message) {
          errorMsg = error.error.message;
        }
        
        this.errorMessage.set(errorMsg);
        // Don't show toast here - error message is already displayed in the form
      }
    });
  }
}
