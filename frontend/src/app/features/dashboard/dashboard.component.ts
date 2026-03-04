import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { DashboardService } from './dashboard.service';
import { PlanService } from '../plans/services/plan.service';
import { ToastService } from '@core/services/toast.service';
import { LoadingService } from '@core/services/loading.service';
import {
  DashboardStats,
  Plan,
  PlanStatus,
  PlanPriority,
} from '../../shared/plan.model';
import { NavbarComponent } from '@core/layout/navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  stats = signal<DashboardStats | null>(null);
  plans = signal<Plan[]>([]);
  showCreateModal = signal(false);
  newPlan: Partial<Plan> = {
    title: '',
    description: '',
    priority: PlanPriority.MEDIUM,
    status: PlanStatus.PLANNED,
  };

  PlanStatus = PlanStatus;
  PlanPriority = PlanPriority;

  constructor(
    public authService: AuthService,
    private dashboardService: DashboardService,
    private planService: PlanService,
    private toastService: ToastService,
    public loadingService: LoadingService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loadingService.show();

    let statsLoaded = false;
    let plansLoaded = false;

    const hideLoading = () => {
      if (statsLoaded && plansLoaded) {
        this.loadingService.hide();
      }
    };

    // Load stats
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        statsLoaded = true;
        hideLoading();
      },
      error: (error) => {
        console.error('Failed to load dashboard stats:', error);
        statsLoaded = true;
        hideLoading();
        // Don't show toast - error interceptor will handle it
      },
    });

    // Load plans - different endpoint for employees
    const userId = this.authService.getUserId();
    console.log('Loading plans for user:', {
      userId,
      isEmployee: this.authService.isEmployee(),
      role: this.authService.userRole(),
    });

    if (this.authService.isEmployee() && userId) {
      // Employees see only plans with their assigned initiatives
      this.planService.getPlansWithAssignedInitiatives(userId).subscribe({
        next: (plans) => {
          console.log('Received assigned plans:', plans);
          // Map plans to include userName from user object
          const mappedPlans = plans.map((plan: any) => ({
            ...plan,
            userName: plan.user?.name || plan.userName || 'Unknown',
            userId: plan.user?.userId || plan.userId,
          }));
          console.log('Mapped plans:', mappedPlans);
          this.plans.set(mappedPlans);
          plansLoaded = true;
          hideLoading();
        },
        error: (error) => {
          console.error('Failed to load assigned plans:', error);
          console.error(
            'Error details:',
            error.error,
            error.status,
            error.message,
          );
          plansLoaded = true;
          hideLoading();
        },
      });
    } else {
      // Managers and Admins see all plans
      this.planService.getAllPlans(0, 20).subscribe({
        next: (response) => {
          // Map plans to include userName from user object
          const mappedPlans = response.content.map((plan: any) => ({
            ...plan,
            userName: plan.user?.name || plan.userName || 'Unknown',
            userId: plan.user?.userId || plan.userId,
          }));
          this.plans.set(mappedPlans);
          plansLoaded = true;
          hideLoading();
        },
        error: (error) => {
          console.error('Failed to load plans:', error);
          plansLoaded = true;
          hideLoading();
          // Don't show toast - error interceptor will handle it
        },
      });
    }
  }

  getProgress(plan: Plan): number {
    // Simplified progress calculation
    return plan.status === 'COMPLETED'
      ? 100
      : plan.status === 'IN_PROGRESS'
        ? 50
        : 0;
  }

  navigateToPlan(planId: number): void {
    this.router.navigate(['/plans', planId]);
  }

  createPlan(): void {
    if (!this.newPlan.title) {
      this.toastService.showError('Please enter a plan title');
      return;
    }

    // Get current user ID - for now use 1, but ideally get from token
    // In a real app, you'd decode the JWT token to get userId
    const userId = this.authService.getUserId() || 1;

    this.loadingService.show();
    this.planService.createPlan(userId, this.newPlan as Plan).subscribe({
      next: (createdPlan) => {
        this.loadingService.hide();
        this.toastService.showSuccess('Plan created successfully!');
        this.closeCreatePlanModal();
        // Reload dashboard to show the new plan
        this.loadDashboard();
      },
      error: (error) => {
        console.error('Failed to create plan:', error);
        this.loadingService.hide();
        // Error interceptor will show toast, but show specific message here
        const errorMsg = error.error?.message || 'Failed to create plan';
        this.toastService.showError(errorMsg);
      },
    });
  }

  closeCreatePlanModal(): void {
    this.showCreateModal.set(false);
    this.newPlan = {
      title: '',
      description: '',
      priority: PlanPriority.MEDIUM,
      status: PlanStatus.PLANNED,
    };
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
