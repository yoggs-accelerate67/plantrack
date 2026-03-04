import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { NotificationCenterComponent } from '@core/layout/navbar/notification-center/notification-center.component';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationCenterComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    private toastService: ToastService,
    private router: Router,
  ) {}

  logout(): void {
    this.authService.logout();
    this.toastService.showSuccess('Logged out successfully!');
    this.router.navigate(['/login']);
  }
}
