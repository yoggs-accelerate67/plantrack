import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);
  private toastId = 0;

  showSuccess(message: string, duration: number = 3000): void {
    this.addToast(message, 'success', duration);
  }

  showError(message: string, duration: number = 5000): void {
    this.addToast(message, 'error', duration);
  }

  showInfo(message: string, duration: number = 3000): void {
    this.addToast(message, 'info', duration);
  }

  private addToast(message: string, type: 'success' | 'error' | 'info', duration: number): void {
    const toast: Toast = {
      id: this.toastId++,
      message,
      type,
      duration
    };

    this.toasts.update(toasts => [...toasts, toast]);

    setTimeout(() => {
      this.removeToast(toast.id);
    }, duration);
  }

  removeToast(id: number): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
}


