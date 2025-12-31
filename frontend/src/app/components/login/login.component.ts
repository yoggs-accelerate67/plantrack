import { Component } from '@angular/core';
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
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-slate-900 mb-2">PlanTrack Enterprise</h1>
            <p class="text-slate-600">Sign in to your account</p>
          </div>
          
          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                class="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              [disabled]="loading"
              class="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService,
    private loadingService: LoadingService
  ) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.toastService.showError('Please fill in all fields');
      return;
    }

    this.loading = true;
    this.loadingService.show();

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.toastService.showSuccess('Login successful!');
        this.router.navigate(['/dashboard']);
        this.loading = false;
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.showError(error.error?.message || 'Login failed');
        this.loading = false;
        this.loadingService.hide();
      }
    });
  }
}


