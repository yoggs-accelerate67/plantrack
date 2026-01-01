import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center">
        <div class="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center space-y-4">
          <div class="relative w-16 h-16">
            <div class="absolute inset-0 border-4 border-teal-200 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-teal-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p class="text-slate-700 font-medium">Loading...</p>
        </div>
      </div>
    }
  `,
  styles: []
})
export class LoadingSpinnerComponent {
  constructor(public loadingService: LoadingService) {}
}

