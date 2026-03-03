import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Initiative, PlanStatus } from '../../models/plan.model';
import { InitiativeService } from '../../services/initiative.service';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';
import { NotificationCenterComponent } from '../notification-center/notification-center.component';

@Component({
  selector: 'app-my-initiatives',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NotificationCenterComponent],
  templateUrl: './my-initiatives.component.html',
  styleUrl: './my-initiatives.component.css'
})
export class MyInitiativesComponent implements OnInit {
  private initiativeService = inject(InitiativeService);
  authService = inject(AuthService);
  private loadingService = inject(LoadingService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  allInitiatives = signal<Initiative[]>([]);
  selectedStatus = signal<string>('');
  selectedPriority = signal<string>('');

  filteredInitiatives = computed(() => {
    let filtered = this.allInitiatives();
    
    if (this.selectedStatus()) {
      filtered = filtered.filter(i => i.status === this.selectedStatus());
    }
    
    if (this.selectedPriority()) {
      filtered = filtered.filter(i => i.planPriority === this.selectedPriority());
    }
    
    // Sort by priority (HIGH first) then by status
    return filtered.sort((a, b) => {
      const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      const statusOrder = { 'IN_PROGRESS': 3, 'PLANNED': 2, 'COMPLETED': 1, 'CANCELLED': 0 };
      
      const priorityDiff = (priorityOrder[b.planPriority as keyof typeof priorityOrder] || 0) - 
                          (priorityOrder[a.planPriority as keyof typeof priorityOrder] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      
      return (statusOrder[b.status as keyof typeof statusOrder] || 0) - 
             (statusOrder[a.status as keyof typeof statusOrder] || 0);
    });
  });

  inProgressCount = computed(() => 
    this.allInitiatives().filter(i => i.status === 'IN_PROGRESS').length
  );

  completedCount = computed(() => 
    this.allInitiatives().filter(i => i.status === 'COMPLETED').length
  );

  completionRate = computed(() => {
    const total = this.allInitiatives().length;
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  });

  ngOnInit(): void {
    this.loadMyInitiatives();
  }

  loadMyInitiatives(): void {
    this.loadingService.show();
    const userId = this.authService.getUserId();
    
    if (!userId) {
      this.loadingService.hide();
      this.toastService.showError('User not found. Please login again.');
      return;
    }

    this.initiativeService.getMyInitiatives(userId).subscribe({
      next: (initiatives) => {
        // Map backend response to include plan and milestone info
        const mappedInitiatives = initiatives.map((initiative: any) => ({
          ...initiative,
          planId: initiative.milestone?.plan?.planId,
          planTitle: initiative.milestone?.plan?.title,
          planPriority: initiative.milestone?.plan?.priority,
          milestoneTitle: initiative.milestone?.title,
          milestoneId: initiative.milestone?.milestoneId
        }));
        this.allInitiatives.set(mappedInitiatives);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Failed to load initiatives:', error);
        this.loadingService.hide();
        this.toastService.showError('Failed to load your initiatives');
      }
    });
  }

  filterInitiatives(): void {
    // Filtering is handled by computed signal
  }

  updateStatus(initiative: Initiative, event: Event): void {
    const newStatus = (event.target as HTMLSelectElement).value;
    
    if (newStatus === initiative.status) return;

    const updatedInitiative = { ...initiative, status: newStatus };
    
    this.initiativeService.updateInitiative(initiative.initiativeId!, updatedInitiative).subscribe({
      next: () => {
        this.toastService.showSuccess(`Status updated to ${newStatus}`);
        this.loadMyInitiatives(); // Refresh list
      },
      error: (error) => {
        console.error('Failed to update status:', error);
        this.toastService.showError('Failed to update status');
        // Revert the change
        (event.target as HTMLSelectElement).value = initiative.status || 'PLANNED';
      }
    });
  }

  viewPlan(initiative: Initiative): void {
    if (initiative.planId) {
      this.router.navigate(['/plans', initiative.planId]);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

