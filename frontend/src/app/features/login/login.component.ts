import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@core/services/toast.service';
import { LoadingService } from '@core/services/loading.service';

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
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
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
      icon: '👔',
    },
    {
      role: 'Employee',
      email: 'charlie@company.com',
      password: 'SecurePass123!',
      color: 'teal',
      icon: '👤',
    },
    {
      role: 'Admin',
      email: 'bob@company.com',
      password: 'SecurePass123!',
      color: 'purple',
      icon: '👑',
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    public toastService: ToastService,
    public loadingService: LoadingService,
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
    this.authService
      .login({ email: this.email, password: this.password })
      .subscribe({
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
            errorMsg =
              'Cannot connect to server. Please ensure the backend is running on http://localhost:8765';
          } else if (error.status === 401 || error.status === 400) {
            errorMsg = error.error?.message || 'Invalid email or password';
          } else if (error.error?.message) {
            errorMsg = error.error.message;
          }

          this.errorMessage.set(errorMsg);
          // Don't show toast here - error message is already displayed in the form
        },
      });
  }
}
