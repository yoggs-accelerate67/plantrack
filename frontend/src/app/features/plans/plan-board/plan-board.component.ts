import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  CdkDragDrop, 
  moveItemInArray, 
  transferArrayItem, 
  DragDropModule 
} from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/scrolling'; // ADD THIS LINE

import { AuthService } from '@core/services/auth.service';
import { PlanService } from '../services/plan.service';
import { ToastService } from '@core/services/toast.service';
import { LoadingService } from '@core/services/loading.service';
import { Plan, PlanStatus } from '@shared/plan.model';
import { NavbarComponent } from '@core/layout/navbar/navbar.component';

@Component({
  selector: 'app-plan-board',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, DragDropModule, CdkScrollable],
  templateUrl: './plan-board.component.html',
})
export class PlanBoardComponent implements OnInit {
  plans = signal<Plan[]>([]);
  
  statusColumns = [
    'PLANNED',
    'IN_PROGRESS',
    'COMPLETED',
    'ON_HOLD',
    'CANCELLED',
  ];

  // Group plans into distinct arrays so CDK Drag & Drop can transfer items
  groupedPlans: Record<string, Plan[]> = {
    'PLANNED': [],
    'IN_PROGRESS': [],
    'COMPLETED': [],
    'ON_HOLD': [],
    'CANCELLED': []
  };

  constructor(
    public authService: AuthService,
    private planService: PlanService,
    private toastService: ToastService,
    public loadingService: LoadingService,
    private router: Router,
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
          this.organizePlansByStatus(plans);
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Failed to load assigned plans:', error);
          this.loadingService.hide();
        },
      });
    } else {
      // Managers and Admins see all plans
      this.planService.getAllPlans(0, 100).subscribe({
        next: (response) => {
          this.plans.set(response.content);
          this.organizePlansByStatus(response.content);
          this.loadingService.hide();
        },
        error: (error) => {
          console.error('Failed to load plans:', error);
          this.loadingService.hide();
        },
      });
    }
  }

  organizePlansByStatus(plans: Plan[]): void {
    this.statusColumns.forEach(status => {
      this.groupedPlans[status] = plans.filter(p => p.status === status);
    });
  }

  drop(event: CdkDragDrop<Plan[]>, newStatus: string): void {
    // If dropping in the same container, just reorder
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Moving to a new status container
      const planToMove = event.previousContainer.data[event.previousIndex];
      const oldStatus = planToMove.status;
      
      // 1. Optimistic UI Update
      planToMove.status = newStatus as PlanStatus;
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      // 2. Call backend to save
      this.planService.updatePlan(planToMove.planId!, planToMove).subscribe({
        next: () => {
          const friendlyStatus = newStatus.replace('_', ' ').toLowerCase();
          this.toastService.showSuccess(`Plan moved to ${friendlyStatus}`);
        },
        error: (err) => {
          // Rollback if the API call fails
          planToMove.status = oldStatus;
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex,
          );
          this.toastService.showError('Failed to update plan status. Card returned to original position.');
          console.error(err);
        }
      });
    }
  }

  navigateToPlan(planId: number): void {
    this.router.navigate(['/plans', planId]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}