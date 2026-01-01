import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="min-w-[300px] max-w-md px-6 py-4 rounded-lg shadow-xl backdrop-blur-sm border transition-all duration-300 transform animate-in slide-in-from-right"
          [ngClass]="{
            'bg-green-50 border-green-200 text-green-800': toast.type === 'success',
            'bg-red-50 border-red-200 text-red-800': toast.type === 'error',
            'bg-blue-50 border-blue-200 text-blue-800': toast.type === 'info'
          }"
        >
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">{{ toast.message }}</p>
            <button 
              (click)="toastService.removeToast(toast.id)"
              class="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}
}

