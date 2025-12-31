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
      if (error.status === 401) {
        toastService.showError('Unauthorized. Please login again.');
        router.navigate(['/login']);
      } else if (error.status === 403) {
        toastService.showError('You do not have permission to perform this action.');
      } else if (error.status >= 500) {
        toastService.showError('Server error. Please try again later.');
      } else if (error.error?.message) {
        toastService.showError(error.error.message);
      } else {
        toastService.showError('An unexpected error occurred.');
      }
      return throwError(() => error);
    })
  );
};


