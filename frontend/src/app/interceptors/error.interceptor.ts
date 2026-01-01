import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Don't show toast for login errors - let the login component handle it
      const isLoginRequest = req.url.includes('/auth/login');
      
      // Don't show duplicate errors for dashboard/plans if they're already being handled
      const isDashboardRequest = req.url.includes('/dashboard/stats') || req.url.includes('/plans');
      
      // Don't show error for users endpoint if it's a read-only request (employees can't access it, but it's not critical)
      const isUsersRequest = req.url.includes('/users') && req.method === 'GET';
      
      if (error.status === 401) {
        if (!isLoginRequest) {
          toastService.showError('Unauthorized. Please login again.');
          router.navigate(['/login']);
        }
      } else if (error.status === 403) {
        // Don't show error for users list - employees don't need it
        if (!isLoginRequest && !isUsersRequest) {
          toastService.showError('You do not have permission to perform this action.');
        }
      } else if (error.status >= 500) {
        // Only show server error once, not for every failed request
        if (!isLoginRequest && !isDashboardRequest) {
          toastService.showError('Server error. Please try again later.');
        }
      } else if (error.status === 0) {
        // Network error or CORS issue
        console.error('Network error:', error);
        if (!isLoginRequest) {
          toastService.showError('Cannot connect to server. Please check if the backend is running.');
        }
      } else if (error.error?.message && !isLoginRequest) {
        // Show specific error message
        toastService.showError(error.error.message);
      } else if (!isLoginRequest && !isDashboardRequest) {
        // Only show generic error for non-dashboard requests
        toastService.showError('An unexpected error occurred.');
      }
      return throwError(() => error);
    })
  );
};

