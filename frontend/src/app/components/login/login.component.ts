import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';

interface DemoCredential {
  role: string;
  email: string;
  password: string;
  color: string;
  icon: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      <!-- Animated Background Pattern -->
      <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div class="absolute inset-0 animate-pulse" style="background-image: radial-gradient(circle at 2px 2px, rgb(15 23 42) 1px, transparent 0); background-size: 40px 40px;"></div>
      </div>
      
      <!-- Floating Shapes -->
      <div class="absolute top-20 left-10 w-72 h-72 bg-teal-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div class="absolute top-40 right-10 w-72 h-72 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      
      <div class="w-full max-w-md relative z-10 animate-fade-in">
        <!-- Logo & Title Section -->
        <div class="text-center mb-10 transform transition-all duration-500 hover:scale-105">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-600 to-teal-700 dark:from-teal-500 dark:to-teal-600 rounded-3xl shadow-2xl mb-6 ring-4 ring-teal-100 dark:ring-teal-900/30 animate-bounce-subtle">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1 class="text-5xl font-extrabold bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 dark:from-teal-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-3 tracking-tight">
            PlanTrack Enterprise
          </h1>
          <p class="text-slate-600 dark:text-slate-400 text-lg font-medium">Sign in to your account</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-8 md:p-10 transform transition-all duration-300 hover:shadow-3xl">
          <form (ngSubmit)="onLogin()" class="space-y-6">
            <!-- Email Field -->
            <div class="space-y-2">
              <label for="email" class="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400">
                  <svg class="h-5 w-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  class="input-field pl-12 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <!-- Password Field -->
            <div class="space-y-2">
              <label for="password" class="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400">
                  <svg class="h-5 w-5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  [id]="'password'"
                  [type]="showPassword() ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  required
                  autocomplete="current-password"
                  class="input-field pl-12 pr-12 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 dark:text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  tabindex="-1"
                >
                  @if (showPassword()) {
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.736m0 0L21 21" />
                    </svg>
                  } @else {
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  }
                </button>
              </div>
            </div>

            <!-- Error Message -->
            @if (errorMessage()) {
              <div class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm flex items-start space-x-2 animate-in slide-in-from-top">
                <svg class="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="loadingService.isLoading()"
              class="btn-primary w-full text-base py-3.5 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
                  <svg class="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              }
            </button>
          </form>

          <!-- Demo Credentials -->
          <div class="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center mb-4 uppercase tracking-wide">Quick Login - Demo Credentials</p>
            <div class="grid grid-cols-1 gap-3">
              @for (cred of demoCredentials; track cred.role) {
                <button
                  type="button"
                  (click)="fillCredentials(cred)"
                  class="group relative bg-gradient-to-r p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  [ngClass]="{
                    'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600': cred.color === 'blue',
                    'from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-teal-200 dark:border-teal-700 hover:border-teal-300 dark:hover:border-teal-600': cred.color === 'teal',
                    'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700 hover:border-purple-300 dark:hover:border-purple-600': cred.color === 'purple'
                  }"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md"
                        [ngClass]="{
                          'bg-blue-500': cred.color === 'blue',
                          'bg-teal-500': cred.color === 'teal',
                          'bg-purple-500': cred.color === 'purple'
                        }">
                        <span class="text-lg">{{ cred.icon }}</span>
                      </div>
                      <div class="text-left">
                        <p class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ cred.role }}</p>
                        <p class="text-xs text-slate-600 dark:text-slate-400 font-mono">{{ cred.email }}</p>
                      </div>
                    </div>
                    <svg class="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-sm text-slate-500 dark:text-slate-400 mt-8 font-medium">
          Enterprise Project Management System
        </p>
      </div>
    </div>
  `,
  styles: [`
    @keyframes blob {
      0%, 100% {
        transform: translate(0, 0) scale(1);
      }
      33% {
        transform: translate(30px, -50px) scale(1.1);
      }
      66% {
        transform: translate(-20px, 20px) scale(0.9);
      }
    }

    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes bounce-subtle {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    .animate-blob {
      animation: blob 7s infinite;
    }

    .animation-delay-2000 {
      animation-delay: 2s;
    }

    .animation-delay-4000 {
      animation-delay: 4s;
    }

    .animate-fade-in {
      animation: fade-in 0.6s ease-out;
    }

    .animate-bounce-subtle {
      animation: bounce-subtle 3s ease-in-out infinite;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = signal<string>('');
  showPassword = signal<boolean>(false);

  demoCredentials: DemoCredential[] = [
    {
      role: 'Manager',
      email: 'alice@company.com',
      password: 'SecurePass123!',
      color: 'blue',
      icon: '👔'
    },
    {
      role: 'Employee',
      email: 'charlie@company.com',
      password: 'SecurePass123!',
      color: 'teal',
      icon: '👤'
    },
    {
      role: 'Admin',
      email: 'bob@company.com',
      password: 'SecurePass123!',
      color: 'purple',
      icon: '👑'
    }
  ];

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

  fillCredentials(cred: DemoCredential): void {
    this.email = cred.email;
    this.password = cred.password;
    this.errorMessage.set('');
    this.toastService.showSuccess(`Filled ${cred.role} credentials`);
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
