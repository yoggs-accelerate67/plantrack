import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent, LoadingSpinnerComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'PlanTrack Enterprise';
  private themeService = inject(ThemeService);

  ngOnInit(): void {
    // Theme service initializes automatically via constructor
    // This ensures theme is applied on app load
  }
}
