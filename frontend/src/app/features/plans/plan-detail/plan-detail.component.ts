import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { UserService, User } from '@core/services/user.service';
import { ToastService } from '@core/services/toast.service';
import { LoadingService } from '@core/services/loading.service';

import { PlanService } from '../services/plan.service';
import { MilestoneService } from './milestone.service';
import { InitiativeService } from '../services/initiative.service';
import {
  PlanDetail,
  MilestoneDetail,
  Initiative,
  PlanStatus,
  Plan,
  PlanPriority,
} from '@shared/plan.model';
import { CommentsComponent } from './comments/comments.component';
import { NavbarComponent } from '@core/layout/navbar/navbar.component';

@Component({
  selector: 'app-plan-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NavbarComponent,
    CommentsComponent,
  ],
  templateUrl: './plan-detail.component.html',
  styleUrl: './plan-detail.component.css',
})
export class PlanDetailComponent implements OnInit {
  plan = signal<PlanDetail | null>(null);
  expandedMilestones = signal<boolean[]>([]);
  showAddMilestoneModal = signal(false);
  showEditMilestoneModal = signal(false);
  showAddInitiativeModal = signal(false);
  showEditInitiativeModal = signal(false);
  showEditPlanModal = signal(false);
  selectedMilestoneId = signal<number | null>(null);
  assignedUserIds = signal<number[]>([]);
  editedAssignedUserIds = signal<number[]>([]);
  editingInitiative = signal<Initiative | null>(null);
  editingMilestone = signal<MilestoneDetail | null>(null);
  users = signal<User[]>([]);
  loadingUsers = signal(false);

  // Searchable dropdown states
  showUserDropdown = signal(false);
  showEditUserDropdown = signal(false);
  userSearchQuery = signal('');
  editUserSearchQuery = signal('');

  // Computed filtered users for instant reactivity
  filteredUsers = computed(() => {
    const query = this.userSearchQuery().toLowerCase().trim();
    if (!query) {
      return this.users();
    }
    return this.users().filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query),
    );
  });

  filteredUsersForEdit = computed(() => {
    const query = this.editUserSearchQuery().toLowerCase().trim();
    if (!query) {
      return this.users();
    }
    return this.users().filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query),
    );
  });

  newMilestone: Partial<MilestoneDetail> = {
    title: '',
    dueDate: '',
    status: 'PLANNED',
    completionPercent: 0,
  };

  editedMilestone: Partial<MilestoneDetail> = {
    title: '',
    dueDate: '',
    status: 'PLANNED',
    completionPercent: 0,
  };

  newInitiative: Partial<Initiative> = {
    title: '',
    description: '',
    status: 'PLANNED',
  };

  editedInitiative: Partial<Initiative> = {
    title: '',
    description: '',
    status: 'PLANNED',
    assignedUserIds: [],
  };

  editedPlan: Partial<Plan> = {
    title: '',
    description: '',
    priority: PlanPriority.MEDIUM,
    status: PlanStatus.PLANNED,
  };

  PlanStatus = PlanStatus;
  PlanPriority = PlanPriority;

  constructor(
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private planService: PlanService,
    private milestoneService: MilestoneService,
    private initiativeService: InitiativeService,
    private userService: UserService,
    private toastService: ToastService,
    public loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    const planId = this.route.snapshot.paramMap.get('id');
    if (planId) {
      this.loadPlan(Number(planId));
    }
    // Only load users if user is Manager or Admin (employees don't need user list)
    if (this.authService.isManager() || this.authService.isAdmin()) {
      this.loadUsers();
    }
  }

  loadUsers(): void {
    // Only load if not already loaded and user has permission
    if (this.users().length > 0) {
      return; // Already loaded
    }

    if (!this.authService.isManager() && !this.authService.isAdmin()) {
      return; // Employees don't need user list
    }

    // Don't load if already loading
    if (this.loadingUsers()) {
      return;
    }

    this.loadingUsers.set(true);
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loadingUsers.set(false);
        console.log('Users loaded:', users.length);
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.loadingUsers.set(false);
        this.toastService.showError('Failed to load users. Please try again.');
      },
    });
  }

  loadPlan(planId: number): void {
    this.loadingService.show();
    this.planService.getPlanDetail(planId).subscribe({
      next: (data) => {
        // Map assigned users for initiatives (support both single and multiple)
        if (data.milestones) {
          data.milestones = data.milestones.map((milestone: any) => {
            if (milestone.initiatives) {
              milestone.initiatives = milestone.initiatives.map(
                (initiative: any) => {
                  // Handle multiple assignees (new format)
                  if (
                    initiative.assignedUsers &&
                    Array.isArray(initiative.assignedUsers)
                  ) {
                    initiative.assignedUserIds = initiative.assignedUsers.map(
                      (u: any) => u.userId,
                    );
                    initiative.assignedUserNames = initiative.assignedUsers.map(
                      (u: any) => u.name || 'Unknown',
                    );
                  }
                  // Handle single assignee (legacy format for backward compatibility)
                  else if (initiative.assignedUser) {
                    initiative.assignedUserName =
                      initiative.assignedUser.name || 'Unknown';
                    initiative.assignedUserId = initiative.assignedUser.userId;
                    initiative.assignedUserIds = [
                      initiative.assignedUser.userId,
                    ];
                    initiative.assignedUserNames = [
                      initiative.assignedUser.name || 'Unknown',
                    ];
                  }
                  return initiative;
                },
              );
            }
            return milestone;
          });
        }

        // Update userName field from user object
        data.userName = data.user?.name || data.userName || 'Unknown';
        data.userId = data.user?.userId || data.userId;

        this.plan.set(data);
        console.log(this.plan());
        this.expandedMilestones.set(
          new Array(data.milestones?.length || 0).fill(false),
        );
        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
        this.toastService.showError('Failed to load plan details');
        this.router.navigate(['/plans']);
      },
    });
  }

  getMilestones(): MilestoneDetail[] {
    const currentPlan = this.plan();
    return currentPlan?.milestones || [];
  }

  getOverallProgress(): number {
    const currentPlan = this.plan();
    if (
      !currentPlan ||
      !currentPlan.milestones ||
      currentPlan.milestones.length === 0
    ) {
      return 0;
    }
    const total = currentPlan.milestones.reduce(
      (sum, m) => sum + (m.completionPercent || 0),
      0,
    );
    return Math.round(total / currentPlan.milestones.length);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }

  toggleMilestone(index: number): void {
    const expanded = [...this.expandedMilestones()];
    expanded[index] = !expanded[index];
    this.expandedMilestones.set(expanded);
  }

  canEditInitiative(initiative: Initiative): boolean {
    if (this.authService.isManager() || this.authService.isAdmin()) {
      return true;
    }
    if (this.authService.isEmployee()) {
      // Employee can only edit initiatives assigned to them
      const currentUserId = this.authService.getUserId();
      if (!currentUserId) {
        return false;
      }
      // Check if the initiative is assigned to the current user
      // Handle multiple assignees (new format)
      if (
        initiative.assignedUsers &&
        Array.isArray(initiative.assignedUsers) &&
        initiative.assignedUsers.length > 0
      ) {
        return initiative.assignedUsers.some(
          (user) => user.userId === currentUserId,
        );
      }
      // Handle single assignee (legacy format for backward compatibility)
      const assignedUserId =
        initiative.assignedUserId || initiative.assignedUser?.userId;
      return assignedUserId === currentUserId;
    }
    return false;
  }

  addMilestone(): void {
    if (!this.newMilestone.title) {
      this.toastService.showError('Please enter a milestone title');
      return;
    }

    const planId = this.plan()!.planId!;

    // Format the date properly - convert "YYYY-MM-DD" to "YYYY-MM-DDTHH:mm:ss"
    const milestoneToSend: any = {
      ...this.newMilestone,
      dueDate: this.newMilestone.dueDate
        ? `${this.newMilestone.dueDate}T00:00:00`
        : null,
    };

    this.loadingService.show();
    this.milestoneService.createMilestone(planId, milestoneToSend).subscribe({
      next: () => {
        this.loadingService.hide();
        this.toastService.showSuccess('Milestone created successfully!');
        this.closeAddMilestoneModal();
        this.loadPlan(planId);
      },
      error: (error) => {
        console.error('Failed to create milestone:', error);
        this.loadingService.hide();
        const errorMsg = error.error?.message || 'Failed to create milestone';
        this.toastService.showError(errorMsg);
      },
    });
  }

  addInitiative(): void {
    if (!this.newInitiative.title || !this.selectedMilestoneId()) {
      this.toastService.showError('Please fill in all required fields');
      return;
    }

    const userIds = this.assignedUserIds();
    if (!userIds || userIds.length === 0) {
      this.toastService.showError('Please select at least one assigned user');
      return;
    }

    const milestoneId = this.selectedMilestoneId()!;
    this.loadingService.show();
    this.initiativeService
      .createInitiative(milestoneId, userIds, this.newInitiative as Initiative)
      .subscribe({
        next: () => {
          this.loadingService.hide();
          this.toastService.showSuccess('Initiative created successfully!');
          this.closeAddInitiativeModal();
          const planId = this.plan()!.planId!;
          this.loadPlan(planId);
        },
        error: () => {
          this.loadingService.hide();
          this.toastService.showError('Failed to create initiative');
        },
      });
  }

  updateInitiativeStatus(initiative: Initiative, event: Event): void {
      const select = event.target as HTMLSelectElement;
      const newStatus = select.value;

      // Create the update payload with ALL required fields, regardless of user role
      const updated: any = {
        title: initiative.title,
        description: initiative.description || '',
        status: newStatus,
      };

      // Ensure assigned users are kept intact in the payload
      if (
        initiative.assignedUsers &&
        Array.isArray(initiative.assignedUsers) &&
        initiative.assignedUsers.length > 0
      ) {
        updated.assignedUsers = initiative.assignedUsers;
      }
      // Handle single assignee (legacy format for backward compatibility)
      else if (initiative.assignedUserId || initiative.assignedUser?.userId) {
        updated.assignedUsers = [
          {
            userId: initiative.assignedUserId || initiative.assignedUser?.userId,
          },
        ];
      }

      this.loadingService.show();
      this.initiativeService
        .updateInitiative(initiative.initiativeId!, updated)
        .subscribe({
          next: () => {
            this.loadingService.hide();
            this.toastService.showSuccess('Initiative status updated!');
            const planId = this.plan()!.planId!;
            this.loadPlan(planId);
          },
          error: (error) => {
            console.error('Failed to update initiative status:', error);
            this.loadingService.hide();
            const errorMsg =
              error.error?.message || 'Failed to update initiative status';
            this.toastService.showError(errorMsg);
            // Revert the select value visually if it fails
            select.value = initiative.status || 'PLANNED';
          },
        });
    }

  editMilestone(milestone: MilestoneDetail, event: Event): void {
    event.stopPropagation();
    this.editingMilestone.set(milestone);
    this.editedMilestone = {
      title: milestone.title || '',
      dueDate: milestone.dueDate ? milestone.dueDate.split('T')[0] : '',
      status: milestone.status || 'PLANNED',
      completionPercent: milestone.completionPercent || 0,
    };
    this.showEditMilestoneModal.set(true);
  }

  saveEditedMilestone(): void {
    const milestone = this.editingMilestone();
    if (!milestone || !milestone.milestoneId) {
      this.toastService.showError('No milestone selected for editing');
      return;
    }

    if (!this.editedMilestone.title) {
      this.toastService.showError('Please enter a milestone title');
      return;
    }

    this.loadingService.show();
    const milestoneToSend: any = {
      ...this.editedMilestone,
      dueDate: this.editedMilestone.dueDate
        ? `${this.editedMilestone.dueDate}T00:00:00`
        : null,
    };

    this.milestoneService
      .updateMilestone(milestone.milestoneId, milestoneToSend)
      .subscribe({
        next: () => {
          this.loadingService.hide();
          this.toastService.showSuccess('Milestone updated successfully!');
          this.closeEditMilestoneModal();
          const planId = this.plan()!.planId!;
          this.loadPlan(planId);
        },
        error: (error) => {
          console.error('Failed to update milestone:', error);
          this.loadingService.hide();
          const errorMsg = error.error?.message || 'Failed to update milestone';
          this.toastService.showError(errorMsg);
        },
      });
  }

  closeEditMilestoneModal(): void {
    this.showEditMilestoneModal.set(false);
    this.editingMilestone.set(null);
    this.editedMilestone = {
      title: '',
      dueDate: '',
      status: 'PLANNED',
      completionPercent: 0,
    };
  }

  editPlan(): void {
    const currentPlan = this.plan();
    if (!currentPlan) return;

    this.editedPlan = {
      title: currentPlan.title || '',
      description: currentPlan.description || '',
      priority: currentPlan.priority || PlanPriority.MEDIUM,
      status: currentPlan.status || PlanStatus.PLANNED,
    };
    this.showEditPlanModal.set(true);
  }

  saveEditedPlan(): void {
    const currentPlan = this.plan();
    if (!currentPlan || !currentPlan.planId) {
      this.toastService.showError('No plan selected for editing');
      return;
    }

    if (!this.editedPlan.title) {
      this.toastService.showError('Please enter a plan title');
      return;
    }

    this.loadingService.show();
    this.planService
      .updatePlan(currentPlan.planId, this.editedPlan as Plan)
      .subscribe({
        next: () => {
          this.loadingService.hide();
          this.toastService.showSuccess('Plan updated successfully!');
          this.closeEditPlanModal();
          this.loadPlan(currentPlan.planId!);
        },
        error: (error) => {
          console.error('Failed to update plan:', error);
          this.loadingService.hide();
          const errorMsg = error.error?.message || 'Failed to update plan';
          this.toastService.showError(errorMsg);
        },
      });
  }

  closeEditPlanModal(): void {
    this.showEditPlanModal.set(false);
    this.editedPlan = {
      title: '',
      description: '',
      priority: PlanPriority.MEDIUM,
      status: PlanStatus.PLANNED,
    };
  }

  deleteMilestone(milestoneId: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this milestone?')) {
      this.loadingService.show();
      this.milestoneService.deleteMilestone(milestoneId).subscribe({
        next: () => {
          this.loadingService.hide();
          this.toastService.showSuccess('Milestone deleted successfully!');
          const planId = this.plan()!.planId!;
          this.loadPlan(planId);
        },
        error: () => {
          this.loadingService.hide();
          this.toastService.showError('Failed to delete milestone');
        },
      });
    }
  }

  editInitiative(initiative: Initiative, event: Event): void {
    event.stopPropagation();
    this.editingInitiative.set(initiative);

    // Extract assigned user IDs from multiple assignees (new format) or single assignee (legacy)
    let assignedUserIds: number[] = [];
    if (
      initiative.assignedUsers &&
      Array.isArray(initiative.assignedUsers) &&
      initiative.assignedUsers.length > 0
    ) {
      assignedUserIds = initiative.assignedUsers
        .map((u) => u.userId!)
        .filter((id) => id !== undefined);
    } else if (initiative.assignedUserId) {
      assignedUserIds = [initiative.assignedUserId];
    } else if (initiative.assignedUser?.userId) {
      assignedUserIds = [initiative.assignedUser.userId];
    }

    this.editedInitiative = {
      title: initiative.title || '',
      description: initiative.description || '',
      status: initiative.status || 'PLANNED',
      assignedUserIds: assignedUserIds,
    };

    // Set the assigned user IDs signal for the multi-select UI
    this.editedAssignedUserIds.set(assignedUserIds);
    this.showEditInitiativeModal.set(true);
  }

  saveEditedInitiative(): void {
    const initiative = this.editingInitiative();
    if (!initiative || !initiative.initiativeId) {
      this.toastService.showError('No initiative selected for editing');
      return;
    }

    if (!this.editedInitiative.title) {
      this.toastService.showError('Please enter a title');
      return;
    }

    const userIds = this.editedAssignedUserIds();
    if (!userIds || userIds.length === 0) {
      this.toastService.showError('Please select at least one assigned user');
      return;
    }

    this.loadingService.show();

    // Convert user IDs to assignedUsers array format expected by backend
    const assignedUsers = userIds.map((userId) => ({ userId: userId }));

    const updatedInitiative: any = {
      title: this.editedInitiative.title!,
      description: this.editedInitiative.description || '',
      status: this.editedInitiative.status || 'PLANNED',
      assignedUsers: assignedUsers,
    };

    this.initiativeService
      .updateInitiative(initiative.initiativeId, updatedInitiative)
      .subscribe({
        next: () => {
          this.loadingService.hide();
          this.toastService.showSuccess('Initiative updated successfully!');
          this.closeEditInitiativeModal();
          const planId = this.plan()!.planId!;
          this.loadPlan(planId);
        },
        error: (error) => {
          console.error('Failed to update initiative:', error);
          this.loadingService.hide();
          const errorMsg =
            error.error?.message || 'Failed to update initiative';
          this.toastService.showError(errorMsg);
        },
      });
  }

  closeEditInitiativeModal(): void {
    this.showEditInitiativeModal.set(false);
    this.showEditUserDropdown.set(false);
    this.editingInitiative.set(null);
    this.editUserSearchQuery.set('');
    this.editedAssignedUserIds.set([]);
    this.editedInitiative = {
      title: '',
      description: '',
      status: 'PLANNED',
      assignedUserIds: [],
    };
  }

  deleteInitiative(initiativeId: number, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this initiative?')) {
      this.loadingService.show();
      this.initiativeService.deleteInitiative(initiativeId).subscribe({
        next: () => {
          this.loadingService.hide();
          this.toastService.showSuccess('Initiative deleted successfully!');
          const planId = this.plan()!.planId!;
          this.loadPlan(planId);
        },
        error: () => {
          this.loadingService.hide();
          this.toastService.showError('Failed to delete initiative');
        },
      });
    }
  }

  closeAddMilestoneModal(): void {
    this.showAddMilestoneModal.set(false);
    this.newMilestone = {
      title: '',
      dueDate: '',
      status: 'PLANNED',
      completionPercent: 0,
    };
  }

  closeAddInitiativeModal(): void {
    this.showAddInitiativeModal.set(false);
    this.selectedMilestoneId.set(null);
    this.assignedUserIds.set([]);
    this.userSearchQuery.set('');
    this.showUserDropdown.set(false);
    this.newInitiative = {
      title: '',
      description: '',
      status: 'PLANNED',
    };
  }

  getFilteredUsers(): User[] {
    const query = this.userSearchQuery().toLowerCase().trim();
    if (!query) {
      return this.users();
    }
    return this.users().filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query),
    );
  }

  getFilteredUsersForEdit(): User[] {
    const query = this.editUserSearchQuery().toLowerCase().trim();
    if (!query) {
      return this.users();
    }
    return this.users().filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query),
    );
  }

  openUserDropdown(): void {
    // Open dropdown immediately
    this.showUserDropdown.set(true);
    this.userSearchQuery.set('');

    // Ensure users are loaded
    if (
      this.users().length === 0 &&
      (this.authService.isManager() || this.authService.isAdmin()) &&
      !this.loadingUsers()
    ) {
      this.loadUsers();
    }

    // Focus input after dropdown opens
    this.focusUserSearchInput();
  }

  private focusUserSearchInput(): void {
    // Focus input after dropdown opens - use multiple attempts
    setTimeout(() => {
      const selectors = [
        'input[placeholder*="Type to search"]',
        '#userSearchInput',
        '.absolute input[type="text"]',
        'input[autofocus]',
      ];

      for (const selector of selectors) {
        const input = document.querySelector(selector) as HTMLInputElement;
        if (input && input.offsetParent !== null) {
          // Check if visible
          input.focus();
          input.select();
          break;
        }
      }
    }, 150);
  }

  openEditUserDropdown(): void {
    // Open dropdown immediately
    this.showEditUserDropdown.set(true);
    this.editUserSearchQuery.set('');

    // Ensure users are loaded
    if (
      this.users().length === 0 &&
      (this.authService.isManager() || this.authService.isAdmin()) &&
      !this.loadingUsers()
    ) {
      this.loadUsers();
    }

    // Focus input after dropdown opens
    this.focusEditUserSearchInput();
  }

  private focusEditUserSearchInput(): void {
    // Focus input after dropdown opens - use multiple attempts
    setTimeout(() => {
      const selectors = [
        'input[placeholder*="Type to search"]',
        '#editUserSearchInput',
        '.absolute input[type="text"]',
        'input[autofocus]',
      ];

      for (const selector of selectors) {
        const input = document.querySelector(selector) as HTMLInputElement;
        if (input && input.offsetParent !== null) {
          // Check if visible
          input.focus();
          input.select();
          break;
        }
      }
    }, 150);
  }

  onUserSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.userSearchQuery.set(value);
    // Ensure dropdown stays open while typing
    if (!this.showUserDropdown()) {
      this.showUserDropdown.set(true);
    }
  }

  onEditUserSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.editUserSearchQuery.set(value);
    // Ensure dropdown stays open while typing
    if (!this.showEditUserDropdown()) {
      this.showEditUserDropdown.set(true);
    }
  }

  getSelectedUserName(userId: number): string {
    const user = this.users().find((u) => u.userId === userId);
    return user ? user.name : 'Unknown';
  }

  getAssignedUsersNames(initiative: Initiative): string {
    if (!initiative.assignedUsers || initiative.assignedUsers.length === 0) {
      return 'Unassigned';
    }
    return initiative.assignedUsers
      .map((u) => u.name || 'Unknown')
      .filter((name) => name !== 'Unknown')
      .join(', ');
  }

  isUserSelected(userId: number): boolean {
    return this.assignedUserIds().includes(userId);
  }

  toggleUser(userId: number): void {
    const current = [...this.assignedUserIds()];
    const index = current.indexOf(userId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(userId);
    }
    this.assignedUserIds.set(current);
  }

  removeUser(userId: number): void {
    const current = [...this.assignedUserIds()];
    const index = current.indexOf(userId);
    if (index > -1) {
      current.splice(index, 1);
      this.assignedUserIds.set(current);
    }
  }

  toggleEditUser(userId: number): void {
    const current = [...this.editedAssignedUserIds()];
    const index = current.indexOf(userId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(userId);
    }
    this.editedAssignedUserIds.set(current);
  }

  isEditUserSelected(userId: number): boolean {
    return this.editedAssignedUserIds().includes(userId);
  }

  removeEditUser(userId: number): void {
    const current = [...this.editedAssignedUserIds()];
    const index = current.indexOf(userId);
    if (index > -1) {
      current.splice(index, 1);
      this.editedAssignedUserIds.set(current);
    }
  }

  focusFirstUser(): void {
    // Focus first user button for keyboard navigation
    setTimeout(() => {
      const firstButton = document.querySelector(
        '#userDropdownList button',
      ) as HTMLButtonElement;
      if (firstButton) {
        firstButton.focus();
      }
    }, 0);
  }

  focusFirstEditUser(): void {
    // Focus first user button for keyboard navigation
    setTimeout(() => {
      const firstButton = document.querySelector(
        '#editUserDropdownList button',
      ) as HTMLButtonElement;
      if (firstButton) {
        firstButton.focus();
      }
    }, 0);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Helper to get initiative status label
  getInitiativeStatusLabel(status?: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'Completed';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return 'Planned';
    }
  }

  // Cascade cancellation preview signals
  showCancelPlanModal = signal(false);
  cancelPlanPreview = signal<any>(null);
  cancellingPlan = signal(false);

  showCancelMilestoneModal = signal(false);
  cancelMilestonePreview = signal<any>(null);
  cancellingMilestone = signal(false);
  milestoneToCancel = signal<any>(null);

  // Open cascade cancel confirmation for plan
  openCancelPlanModal(): void {
    if (!this.plan()) return;

    this.planService.getCancelPreview(this.plan()!.planId!).subscribe({
      next: (preview) => {
        this.cancelPlanPreview.set(preview);
        this.showCancelPlanModal.set(true);
      },
      error: (error) => {
        this.toastService.showError(
          error.error?.message || 'Failed to get cancel preview',
        );
      },
    });
  }

  // Confirm and execute plan cascade cancellation
  confirmCancelPlan(): void {
    if (!this.plan()) return;

    this.cancellingPlan.set(true);
    this.planService.cancelPlanWithCascade(this.plan()!.planId!).subscribe({
      next: (result) => {
        this.toastService.showSuccess(
          `Plan cancelled! ${result.milestonesAffected} milestones and ${result.initiativesAffected} initiatives affected.`,
        );
        this.showCancelPlanModal.set(false);
        this.cancellingPlan.set(false);
        this.loadPlan(this.plan()!.planId!); // Refresh the view
      },
      error: (error) => {
        this.toastService.showError(
          error.error?.message || 'Failed to cancel plan',
        );
        this.cancellingPlan.set(false);
      },
    });
  }

  closeCancelPlanModal(): void {
    this.showCancelPlanModal.set(false);
    this.cancelPlanPreview.set(null);
  }

  // Open cascade cancel confirmation for milestone
  openCancelMilestoneModal(milestone: any): void {
    this.milestoneToCancel.set(milestone);

    this.milestoneService.getCancelPreview(milestone.milestoneId).subscribe({
      next: (preview) => {
        this.cancelMilestonePreview.set(preview);
        this.showCancelMilestoneModal.set(true);
      },
      error: (error) => {
        this.toastService.showError(
          error.error?.message || 'Failed to get cancel preview',
        );
      },
    });
  }

  // Confirm and execute milestone cascade cancellation
  confirmCancelMilestone(): void {
    const milestone = this.milestoneToCancel();
    if (!milestone) return;

    this.cancellingMilestone.set(true);
    this.milestoneService
      .cancelMilestoneWithCascade(milestone.milestoneId)
      .subscribe({
        next: (result) => {
          this.toastService.showSuccess(
            `Milestone cancelled! ${result.initiativesAffected} initiatives affected.`,
          );
          this.showCancelMilestoneModal.set(false);
          this.cancellingMilestone.set(false);
          this.milestoneToCancel.set(null);
          this.loadPlan(this.plan()!.planId!); // Refresh the view
        },
        error: (error) => {
          this.toastService.showError(
            error.error?.message || 'Failed to cancel milestone',
          );
          this.cancellingMilestone.set(false);
        },
      });
  }

  closeCancelMilestoneModal(): void {
    this.showCancelMilestoneModal.set(false);
    this.cancelMilestonePreview.set(null);
    this.milestoneToCancel.set(null);
  }
}
