import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlanService } from '../../services/plan.service';
import { MilestoneService } from '../../services/milestone.service';
import { InitiativeService } from '../../services/initiative.service';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { ToastService } from '../../services/toast.service';
import { PlanDetail, MilestoneDetail, Initiative } from '../../models/plan.model';

@Component({
  selector: 'app-plan-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-zinc-50">
      <!-- Header -->
      <header class="bg-white shadow-sm border-b border-zinc-200">
        <div class="max-w-7xl mx-auto px-6 py-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
              <button
                (click)="goBack()"
                class="text-zinc-600 hover:text-zinc-900 p-2 hover:bg-zinc-100 rounded-lg transition"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 class="text-2xl font-bold text-zinc-900">{{ plan()?.title || 'Plan Details' }}</h1>
                <p class="text-sm text-zinc-500 mt-1">Plan ID: {{ plan()?.planId }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-sm text-zinc-600">{{ authService.currentUser() }}</span>
              <button
                (click)="logout()"
                class="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-6 py-8">
        @if (plan()) {
          <!-- Plan Header Card -->
          <div class="bg-white rounded-xl shadow-md border border-zinc-200 p-8 mb-6">
            <div class="flex justify-between items-start mb-6">
              <div class="flex-1">
                <div class="flex items-center gap-4 mb-4">
                  <h2 class="text-3xl font-bold text-zinc-900">{{ plan()!.title }}</h2>
                  <span 
                    class="px-3 py-1.5 text-sm font-medium rounded-full"
                    [ngClass]="{
                      'bg-blue-100 text-blue-800': plan()!.status === 'PLANNED',
                      'bg-amber-100 text-amber-800': plan()!.status === 'IN_PROGRESS',
                      'bg-green-100 text-green-800': plan()!.status === 'COMPLETED',
                      'bg-zinc-100 text-zinc-800': plan()!.status === 'ON_HOLD',
                      'bg-red-100 text-red-800': plan()!.status === 'CANCELLED'
                    }"
                  >
                    {{ plan()!.status }}
                  </span>
                </div>
                <p class="text-zinc-600 mb-6 leading-relaxed">{{ plan()!.description || 'No description provided' }}</p>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-zinc-200">
                  <div>
                    <p class="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Priority</p>
                    <span 
                      class="inline-block px-3 py-1.5 text-sm font-medium rounded"
                      [ngClass]="{
                        'bg-red-100 text-red-800': plan()!.priority === 'CRITICAL',
                        'bg-orange-100 text-orange-800': plan()!.priority === 'HIGH',
                        'bg-yellow-100 text-yellow-800': plan()!.priority === 'MEDIUM',
                        'bg-green-100 text-green-800': plan()!.priority === 'LOW'
                      }"
                    >
                      {{ plan()!.priority || 'N/A' }}
                    </span>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Assigned To</p>
                    <p class="text-sm font-medium text-zinc-900">{{ plan()!.userName || 'Unassigned' }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Overall Progress</p>
                    <div class="flex items-center gap-2">
                      <div class="flex-1 bg-zinc-200 rounded-full h-2">
                        <div 
                          class="bg-teal-600 h-2 rounded-full transition-all"
                          [style.width.%]="getOverallProgress()"
                        ></div>
                      </div>
                      <span class="text-sm font-medium text-zinc-900">{{ getOverallProgress() }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            @if (isManager()) {
              <div class="pt-6 border-t border-zinc-200">
                <button
                  (click)="openAddMilestoneModal()"
                  class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition flex items-center gap-2"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Milestone
                </button>
              </div>
            }
          </div>

          <!-- Milestones Accordion -->
          <div class="bg-white rounded-xl shadow-md border border-zinc-200 overflow-hidden">
            <div class="p-6 border-b border-zinc-200 bg-zinc-50">
              <h3 class="text-lg font-semibold text-zinc-900">Milestones</h3>
              <p class="text-sm text-zinc-500 mt-1">Expand milestones to view initiatives</p>
            </div>

            @if (getMilestones().length > 0) {
              <div class="divide-y divide-zinc-200">
                @for (milestone of getMilestones(); track milestone.milestoneId) {
                  <div class="p-6 hover:bg-zinc-50 transition">
                    <div class="flex items-center justify-between">
                      <div class="flex-1 cursor-pointer" (click)="toggleMilestone(milestone.milestoneId!)">
                        <div class="flex items-center gap-4 mb-3">
                          <h4 class="text-lg font-semibold text-zinc-900">{{ milestone.title }}</h4>
                          <span 
                            class="px-2.5 py-1 text-xs font-medium rounded-full"
                            [ngClass]="{
                              'bg-blue-100 text-blue-800': milestone.status === 'PLANNED',
                              'bg-amber-100 text-amber-800': milestone.status === 'IN_PROGRESS',
                              'bg-green-100 text-green-800': milestone.status === 'COMPLETED'
                            }"
                          >
                            {{ milestone.status }}
                          </span>
                        </div>
                        <div class="flex items-center gap-6 text-sm text-zinc-600 mb-3">
                          <span>Due: {{ formatDate(milestone.dueDate) || 'Not set' }}</span>
                          <span>Progress: {{ milestone.completionPercent || 0 }}%</span>
                        </div>
                        <div class="w-full bg-zinc-200 rounded-full h-2 mb-3">
                          <div 
                            class="bg-teal-600 h-2 rounded-full transition-all"
                            [style.width.%]="milestone.completionPercent || 0"
                          ></div>
                        </div>
                      </div>
                      <div class="flex items-center gap-2 ml-4">
                        <button
                          (click)="toggleMilestone(milestone.milestoneId!)"
                          class="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition"
                        >
                          <svg class="h-5 w-5 transform transition" [class.rotate-180]="isExpanded(milestone.milestoneId!)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        @if (isManager()) {
                          <button
                            (click)="editMilestone(milestone)"
                            class="p-2 text-zinc-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                          >
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            (click)="deleteMilestone(milestone.milestoneId!)"
                            class="p-2 text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        }
                      </div>
                    </div>

                    @if (isExpanded(milestone.milestoneId!)) {
                      <div class="mt-6 pt-6 border-t border-zinc-200">
                        <div class="flex justify-between items-center mb-4">
                          <h5 class="text-sm font-semibold text-zinc-700 uppercase tracking-wide">Initiatives</h5>
                          @if (isManager()) {
                            <button
                              (click)="openAddInitiativeModal(milestone.milestoneId!)"
                              class="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                            >
                              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                              </svg>
                              Add Initiative
                            </button>
                          }
                        </div>

                        @if (milestone.initiatives && milestone.initiatives.length > 0) {
                          <div class="space-y-3">
                            @for (initiative of milestone.initiatives; track initiative.initiativeId) {
                              <div class="bg-zinc-50 rounded-lg p-4 border border-zinc-200 hover:border-teal-300 hover:shadow-sm transition group">
                                <div class="flex items-start justify-between">
                                  <div class="flex-1">
                                    <div class="flex items-center gap-3 mb-2">
                                      <h6 class="font-medium text-zinc-900">{{ initiative.title }}</h6>
                                      @if (canEditInitiative(initiative)) {
                                        <select
                                          [value]="initiative.status"
                                          (change)="updateInitiativeStatus(initiative, $event)"
                                          class="text-xs px-2 py-1 border border-zinc-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                        >
                                          <option value="PLANNED">Planned</option>
                                          <option value="IN_PROGRESS">In Progress</option>
                                          <option value="COMPLETED">Completed</option>
                                        </select>
                                      } @else {
                                        <span 
                                          class="px-2.5 py-1 text-xs font-medium rounded-full"
                                          [ngClass]="{
                                            'bg-blue-100 text-blue-800': initiative.status === 'PLANNED',
                                            'bg-amber-100 text-amber-800': initiative.status === 'IN_PROGRESS',
                                            'bg-green-100 text-green-800': initiative.status === 'COMPLETED'
                                          }"
                                        >
                                          {{ initiative.status }}
                                        </span>
                                      }
                                    </div>
                                    <p class="text-sm text-zinc-600 mb-2">{{ initiative.description || 'No description' }}</p>
                                    <div class="flex items-center gap-4 text-xs text-zinc-500">
                                      <span>Assigned: {{ initiative.assignedUserName || 'Unassigned' }}</span>
                                      <span>Milestone: {{ initiative.milestoneTitle }}</span>
                                    </div>
                                  </div>
                                  @if (isManager()) {
                                    <div class="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 transition">
                                      <button
                                        (click)="editInitiative(initiative)"
                                        class="p-1.5 text-zinc-600 hover:text-teal-600 hover:bg-teal-50 rounded transition"
                                      >
                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>
                                      <button
                                        (click)="deleteInitiative(initiative.initiativeId!)"
                                        class="p-1.5 text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded transition"
                                      >
                                        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  }
                                </div>
                              </div>
                            }
                          </div>
                        } @else {
                          <div class="text-center py-8 bg-zinc-50 rounded-lg border-2 border-dashed border-zinc-300">
                            <svg class="mx-auto h-12 w-12 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p class="mt-2 text-sm text-zinc-500">No initiatives yet</p>
                            @if (isManager()) {
                              <button
                                (click)="openAddInitiativeModal(milestone.milestoneId!)"
                                class="mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium"
                              >
                                Click to add one
                              </button>
                            }
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            } @else {
              <div class="p-12 text-center">
                <svg class="mx-auto h-16 w-16 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p class="mt-4 text-zinc-500 font-medium">No milestones yet</p>
                @if (isManager()) {
                  <p class="mt-2 text-sm text-zinc-400">Click "Add Milestone" to get started</p>
                }
              </div>
            }
          </div>
        }
      </main>

      <!-- Add Milestone Modal -->
      @if (showAddMilestoneModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-bold text-zinc-900">Add Milestone</h3>
              <button (click)="closeAddMilestoneModal()" class="text-zinc-400 hover:text-zinc-600">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form (ngSubmit)="addMilestone()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-zinc-700 mb-2">Title *</label>
                <input type="text" [(ngModel)]="newMilestone.title" name="title" required
                  class="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-700 mb-2">Due Date</label>
                <input type="date" [(ngModel)]="newMilestone.dueDate" name="dueDate"
                  class="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
              </div>
              <div class="flex justify-end gap-3 pt-4">
                <button type="button" (click)="closeAddMilestoneModal()"
                  class="px-6 py-2 text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg font-medium transition">
                  Cancel
                </button>
                <button type="submit"
                  class="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition">
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Add Initiative Modal -->
      @if (showAddInitiativeModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-xl font-bold text-zinc-900">Add Initiative</h3>
              <button (click)="closeAddInitiativeModal()" class="text-zinc-400 hover:text-zinc-600">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form (ngSubmit)="addInitiative()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-zinc-700 mb-2">Title *</label>
                <input type="text" [(ngModel)]="newInitiative.title" name="title" required
                  class="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-700 mb-2">Description</label>
                <textarea [(ngModel)]="newInitiative.description" name="description" rows="3"
                  class="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-700 mb-2">Assigned User ID *</label>
                <input type="number" [(ngModel)]="newInitiative.assignedUserId" name="assignedUserId" required
                  class="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none">
              </div>
              <div class="flex justify-end gap-3 pt-4">
                <button type="button" (click)="closeAddInitiativeModal()"
                  class="px-6 py-2 text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg font-medium transition">
                  Cancel
                </button>
                <button type="submit"
                  class="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition">
                  Add Initiative
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class PlanDetailComponent implements OnInit {
  plan = signal<PlanDetail | null>(null);
  expandedMilestones = signal<Set<number>>(new Set());
  showAddMilestoneModal = signal(false);
  showAddInitiativeModal = signal(false);
  selectedMilestoneId: number | null = null;
  
  newMilestone: Partial<MilestoneDetail> = {
    title: '',
    dueDate: '',
    status: 'PLANNED',
    completionPercent: 0
  };

  newInitiative: Partial<Initiative> = {
    title: '',
    description: '',
    status: 'PLANNED',
    assignedUserId: undefined
  };

  constructor(
    private route: ActivatedRoute,
    private planService: PlanService,
    private milestoneService: MilestoneService,
    private initiativeService: InitiativeService,
    public authService: AuthService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const planId = this.route.snapshot.paramMap.get('id');
    if (planId) {
      this.loadPlan(+planId);
    }
  }

  loadPlan(planId: number): void {
    this.loadingService.show();
    this.planService.getPlanDetail(planId).subscribe({
      next: (data) => {
        this.plan.set(data);
        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
        this.toastService.showError('Failed to load plan details');
      }
    });
  }

  toggleMilestone(milestoneId: number): void {
    const expanded = this.expandedMilestones();
    if (expanded.has(milestoneId)) {
      expanded.delete(milestoneId);
    } else {
      expanded.add(milestoneId);
    }
    this.expandedMilestones.set(new Set(expanded));
  }

  isExpanded(milestoneId: number): boolean {
    return this.expandedMilestones().has(milestoneId);
  }

  getMilestones(): MilestoneDetail[] {
    const currentPlan = this.plan();
    return currentPlan?.milestones || [];
  }

  getOverallProgress(): number {
    const currentPlan = this.plan();
    if (!currentPlan || !currentPlan.milestones || currentPlan.milestones.length === 0) {
      return 0;
    }
    const total = currentPlan.milestones.reduce((sum, m) => sum + (m.completionPercent || 0), 0);
    return Math.round(total / currentPlan.milestones.length);
  }

  formatDate(date: string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  isManager(): boolean {
    const role = this.authService.userRole();
    return role === 'MANAGER' || role === 'ADMIN';
  }

  canEditInitiative(initiative: Initiative): boolean {
    const role = this.authService.userRole();
    const currentUser = this.authService.currentUser();
    // Employee can only edit if assigned to them
    if (role === 'EMPLOYEE') {
      return initiative.assignedUserName === currentUser;
    }
    // Manager and Admin can always edit
    return role === 'MANAGER' || role === 'ADMIN';
  }

  openAddMilestoneModal(): void {
    this.showAddMilestoneModal.set(true);
  }

  closeAddMilestoneModal(): void {
    this.showAddMilestoneModal.set(false);
    this.newMilestone = { title: '', dueDate: '', status: 'PLANNED', completionPercent: 0 };
  }

  addMilestone(): void {
    const planId = this.plan()?.planId;
    if (!planId) return;

    this.loadingService.show();
    this.milestoneService.createMilestone(planId, this.newMilestone as any).subscribe({
      next: () => {
        this.toastService.showSuccess('Milestone created successfully!');
        this.closeAddMilestoneModal();
        this.loadPlan(planId);
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.showError(error.error?.message || 'Failed to create milestone');
        this.loadingService.hide();
      }
    });
  }

  openAddInitiativeModal(milestoneId: number): void {
    this.selectedMilestoneId = milestoneId;
    this.showAddInitiativeModal.set(true);
  }

  closeAddInitiativeModal(): void {
    this.showAddInitiativeModal.set(false);
    this.selectedMilestoneId = null;
    this.newInitiative = { title: '', description: '', status: 'PLANNED', assignedUserId: undefined };
  }

  addInitiative(): void {
    if (!this.selectedMilestoneId || !this.newInitiative.assignedUserId) return;

    this.loadingService.show();
    this.initiativeService.createInitiative(this.selectedMilestoneId, this.newInitiative.assignedUserId, this.newInitiative as any).subscribe({
      next: () => {
        this.toastService.showSuccess('Initiative created successfully!');
        this.closeAddInitiativeModal();
        const planId = this.plan()?.planId;
        if (planId) this.loadPlan(planId);
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.showError(error.error?.message || 'Failed to create initiative');
        this.loadingService.hide();
      }
    });
  }

  updateInitiativeStatus(initiative: Initiative, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;
    
    this.loadingService.show();
    const updated = { ...initiative, status: newStatus };
    this.initiativeService.updateInitiative(initiative.initiativeId!, updated as any).subscribe({
      next: () => {
        this.toastService.showSuccess('Initiative status updated!');
        const planId = this.plan()?.planId;
        if (planId) this.loadPlan(planId);
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.showError(error.error?.message || 'Failed to update status');
        this.loadingService.hide();
      }
    });
  }

  editMilestone(milestone: MilestoneDetail): void {
    // TODO: Implement edit milestone
    this.toastService.showInfo('Edit milestone functionality coming soon');
  }

  deleteMilestone(milestoneId: number): void {
    if (!confirm('Are you sure you want to delete this milestone?')) return;
    
    this.loadingService.show();
    this.milestoneService.deleteMilestone(milestoneId).subscribe({
      next: () => {
        this.toastService.showSuccess('Milestone deleted successfully!');
        const planId = this.plan()?.planId;
        if (planId) this.loadPlan(planId);
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.showError(error.error?.message || 'Failed to delete milestone');
        this.loadingService.hide();
      }
    });
  }

  editInitiative(initiative: Initiative): void {
    // TODO: Implement edit initiative
    this.toastService.showInfo('Edit initiative functionality coming soon');
  }

  deleteInitiative(initiativeId: number): void {
    if (!confirm('Are you sure you want to delete this initiative?')) return;
    
    this.loadingService.show();
    this.initiativeService.deleteInitiative(initiativeId).subscribe({
      next: () => {
        this.toastService.showSuccess('Initiative deleted successfully!');
        const planId = this.plan()?.planId;
        if (planId) this.loadPlan(planId);
        this.loadingService.hide();
      },
      error: (error) => {
        this.toastService.showError(error.error?.message || 'Failed to delete initiative');
        this.loadingService.hide();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/plans']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
