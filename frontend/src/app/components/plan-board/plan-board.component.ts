import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PlanService } from '../../services/plan.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { Plan, PlanStatus } from '../../models/plan.model';
import { NotificationCenterComponent } from '../notification-center/notification-center.component';

@Component({
  selector: 'app-plan-board',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NotificationCenterComponent],
  templateUrl: './plan-board.component.html',
})
export class PlanBoardComponent implements OnInit {
  plans = signal<Plan[]>([]);
  statusColumns = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'];

  constructor(
    public authService: AuthService,
    private planService: PlanService,
    private toastService: ToastService,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.loadingService.show();
    const userId = this.authService.getUserId();
    
    // Employees see only plans with their assigned initiatives
    if (this.authService.isEmployee() && userId) {
      this.planService.getPlansWithAssignedInitiatives(userId).subscribe({
        next: (plans) => {
          this.plans.set(plans);
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Failed to load assigned plans:', error);
          this.loadingService.hide();
        }
      });
    } else {
      // Managers and Admins see all plans
      this.planService.getAllPlans(0, 100).subscribe({
        next: (response) => {
          this.plans.set(response.content);
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Failed to load plans:', error);
          this.loadingService.hide();
          // Error interceptor will handle the toast
        }
      });
    }
  }

  getPlansByStatus(status: string): Plan[] {
    return this.plans().filter(p => p.status === status);
  }

  navigateToPlan(planId: number): void {
    this.router.navigate(['/plans', planId]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

