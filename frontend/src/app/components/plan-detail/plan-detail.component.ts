import { Component, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PlanService } from '../../services/plan.service';
import { MilestoneService } from '../../services/milestone.service';
import { InitiativeService } from '../../services/initiative.service';
import { UserService, User } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { PlanDetail, MilestoneDetail, Initiative, PlanStatus, Plan, PlanPriority } from '../../models/plan.model';
import { NotificationCenterComponent } from '../notification-center/notification-center.component';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-plan-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NotificationCenterComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <!-- Navigation Header -->
      <nav class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-8">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h1 class="text-xl font-bold text-slate-900 dark:text-slate-100">PlanTrack Enterprise</h1>
              </div>
              <div class="hidden md:flex space-x-1">
                <a routerLink="/dashboard" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">Dashboard</a>
                <a routerLink="/plans" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">Plans</a>
                @if (authService.isEmployee()) {
                  <a routerLink="/my-initiatives" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">My Initiatives</a>
                }
                @if (authService.isManager() || authService.isAdmin()) {
                  <a routerLink="/analytics" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">Analytics</a>
                }
                @if (authService.isAdmin()) {
                  <a routerLink="/audit-logs" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">Audit Logs</a>
                  <a routerLink="/users" routerLinkActive="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg transition-colors">User Management</a>
                }
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <!-- Notification Center -->
              <app-notification-center></app-notification-center>
              
              <div class="hidden sm:flex items-center space-x-3">
                <div class="text-right">
                  <p class="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
                  <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ authService.currentUser() }}</p>
                </div>
                <span class="px-3 py-1.5 bg-gradient-to-r from-teal-100 to-teal-50 dark:from-teal-900/30 dark:to-teal-800/30 text-teal-700 dark:text-teal-400 rounded-full text-xs font-semibold border border-teal-200 dark:border-teal-700">{{ authService.userRole() }}</span>
              </div>
              <button 
                (click)="logout()" 
                class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span class="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @if (loadingService.isLoading() && !plan()) {
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        } @else if (plan()) {
          <!-- Plan Header -->
          <div class="card p-8 mb-6">
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <h2 class="text-3xl font-bold text-slate-900 dark:text-slate-100">{{ plan()!.title }}</h2>
                  @if (authService.isManager() || authService.isAdmin()) {
                    <button
                      (click)="editPlan()"
                      class="p-2 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30"
                      title="Edit Plan"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  }
                </div>
                <p class="text-slate-600 dark:text-slate-400 mb-4">{{ plan()!.description || 'No description provided' }}</p>
                <div class="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                  <span>Priority: <strong class="text-slate-900 dark:text-slate-100">{{ plan()!.priority }}</strong></span>
                  <span>Status: <strong class="text-slate-900 dark:text-slate-100">{{ plan()!.status }}</strong></span>
                  <span>Assigned to: <strong class="text-slate-900 dark:text-slate-100">{{ plan()!.userName }}</strong></span>
                </div>
              </div>
              <div class="ml-6">
                <div class="text-right mb-2">
                  <p class="text-sm text-slate-600 dark:text-slate-400">Overall Progress</p>
                  <p class="text-2xl font-bold text-teal-600 dark:text-teal-400">{{ getOverallProgress() }}%</p>
                </div>
                <div class="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div class="bg-teal-600 h-3 rounded-full transition-all" [style.width.%]="getOverallProgress()"></div>
                </div>
              </div>
            </div>

            <!-- Add Milestone Button (Manager/Admin Only) -->
            @if (authService.isManager()) {
              <button
                (click)="showAddMilestoneModal.set(true)"
                class="mt-4 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Milestone</span>
              </button>
            }
          </div>

          <!-- Milestones Accordion -->
          @if (getMilestones().length === 0) {
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-12 text-center">
              <svg class="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p class="text-slate-600 dark:text-slate-400 text-lg mb-2">No milestones yet</p>
              @if (authService.isManager()) {
                <button
                  (click)="showAddMilestoneModal.set(true)"
                  class="text-teal-600 hover:text-teal-700 font-medium"
                >
                  Add your first milestone →
                </button>
              }
            </div>
          } @else {
            <div class="space-y-4">
              @for (milestone of getMilestones(); track milestone.milestoneId; let i = $index) {
                <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <!-- Milestone Header -->
                  <div
                    (click)="toggleMilestone(i)"
                    class="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between"
                  >
                    <div class="flex items-center space-x-4 flex-1">
                      <svg
                        class="w-5 h-5 text-slate-400 transition-transform"
                        [class.rotate-90]="expandedMilestones()[i]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                      <div class="flex-1">
                        <div class="flex items-center space-x-3">
                          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ milestone.title }}</h3>
                          @if (authService.isManager()) {
                            <button
                              (click)="editMilestone(milestone, $event)"
                              class="p-1.5 text-slate-400 hover:text-teal-600 transition-colors rounded-lg hover:bg-teal-50 opacity-0 group-hover:opacity-100"
                              title="Edit Milestone"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          }
                        </div>
                        <div class="flex items-center space-x-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                          <span class="flex items-center space-x-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Due: {{ milestone.dueDate ? (milestone.dueDate | date:'short') : 'Not set' }}</span>
                          </span>
                          <span class="flex items-center space-x-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span>Progress: {{ milestone.completionPercent || 0 }}%</span>
                          </span>
                          <span
                            class="px-3 py-1 rounded-lg text-xs font-semibold"
                            [ngClass]="{
                              'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800': milestone.status === 'COMPLETED',
                              'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800': milestone.status === 'IN_PROGRESS',
                              'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600': milestone.status === 'PLANNED'
                            }"
                          >
                            {{ milestone.status?.replace('_', ' ') }}
                          </span>
                        </div>
                      </div>
                    </div>
                    @if (authService.isManager()) {
                      <div class="flex items-center space-x-2 ml-4">
                        <button
                          (click)="editMilestone(milestone, $event)"
                          class="p-2 text-slate-400 hover:text-teal-600 transition-colors"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          (click)="deleteMilestone(milestone.milestoneId!, $event)"
                          class="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    }
                  </div>

                  <!-- Milestone Content (Initiatives) -->
                  @if (expandedMilestones()[i]) {
                    <div class="border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-700/30">
                      <!-- Add Initiative Button (Manager/Admin Only) -->
                      @if (authService.isManager()) {
                        <button
                          (click)="showAddInitiativeModal.set(true); selectedMilestoneId.set(milestone.milestoneId!)"
                          class="mb-4 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                          </svg>
                          <span>Add Initiative</span>
                        </button>
                      }

                      <!-- Initiatives List -->
                      @if (!milestone.initiatives || milestone.initiatives.length === 0) {
                        <div class="text-center py-8 text-slate-500 dark:text-slate-400">
                          <p>No initiatives yet</p>
                          @if (authService.isManager()) {
                            <button
                              (click)="showAddInitiativeModal.set(true); selectedMilestoneId.set(milestone.milestoneId!)"
                              class="mt-2 text-teal-600 hover:text-teal-700 text-sm font-medium"
                            >
                              Add initiative →
                            </button>
                          }
                        </div>
                      } @else {
                        <div class="space-y-3">
                          @for (initiative of milestone.initiatives; track initiative.initiativeId) {
                            <div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all group">
                              <div class="flex items-center justify-between">
                                <div class="flex-1">
                                  <h4 class="font-medium text-slate-900 dark:text-slate-100 mb-1">{{ initiative.title }}</h4>
                                  <p class="text-sm text-slate-600 dark:text-slate-400 mb-2">{{ initiative.description || 'No description' }}</p>
                                  <div class="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                                    <span class="flex items-center space-x-1">
                                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      <span>Assigned: <strong class="text-slate-700 dark:text-slate-300">{{ initiative.assignedUserName || (initiative.assignedUser?.name) || 'Unassigned' }}</strong></span>
                                    </span>
                                    <!-- Completion Status Badge -->
                                    <span
                                      class="px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
                                      [ngClass]="{
                                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400': initiative.status === 'COMPLETED',
                                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400': initiative.status === 'IN_PROGRESS',
                                        'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300': initiative.status === 'PLANNED'
                                      }"
                                    >
                                      @if (initiative.status === 'COMPLETED') {
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                      }
                                      <span>{{ initiative.status === 'COMPLETED' ? 'Completed' : initiative.status === 'IN_PROGRESS' ? 'In Progress' : 'Planned' }}</span>
                                    </span>
                                  </div>
                                </div>
                                <div class="flex items-center space-x-3 ml-4">
                                  <!-- Status Dropdown (Employee can edit assigned, Manager/Admin can edit all) -->
                                  @if (canEditInitiative(initiative)) {
                                    <select
                                      [value]="initiative.status"
                                      (change)="updateInitiativeStatus(initiative, $event)"
                                      class="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                    >
                                      <option value="PLANNED">Planned</option>
                                      <option value="IN_PROGRESS">In Progress</option>
                                      <option value="COMPLETED">Completed</option>
                                    </select>
                                  } @else {
                                    <span
                                      class="px-3 py-1 rounded-full text-xs font-medium"
                                      [ngClass]="{
                                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400': initiative.status === 'COMPLETED',
                                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400': initiative.status === 'IN_PROGRESS',
                                        'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300': initiative.status === 'PLANNED'
                                      }"
                                    >
                                      {{ initiative.status }}
                                    </span>
                                  }
                                  <!-- Edit/Delete Buttons (Manager/Admin Only) -->
                                  @if (authService.isManager()) {
                                    <button
                                      (click)="editInitiative(initiative, $event)"
                                      class="p-2 text-slate-400 hover:text-teal-600 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                      (click)="deleteInitiative(initiative.initiativeId!, $event)"
                                      class="p-2 text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  }
                                </div>
                              </div>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          }
        }

        <!-- Add Milestone Modal -->
        @if (showAddMilestoneModal()) {
          <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Add Milestone</h3>
              <form (ngSubmit)="addMilestone()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title *</label>
                  <input
                    [(ngModel)]="newMilestone.title"
                    name="milestoneTitle"
                    required
                    class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400"
                    placeholder="Enter milestone title"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    [(ngModel)]="newMilestone.dueDate"
                    name="milestoneDueDate"
                    class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div class="flex space-x-3 pt-4">
                  <button
                    type="button"
                    (click)="closeAddMilestoneModal()"
                    class="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Add Milestone
                  </button>
                </div>
              </form>
            </div>
          </div>
        }

        <!-- Add Initiative Modal -->
        @if (showAddInitiativeModal()) {
          <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 class="text-2xl font-bold text-slate-900 mb-6">Add Initiative</h3>
              <form (ngSubmit)="addInitiative()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title *</label>
                  <input
                    [(ngModel)]="newInitiative.title"
                    name="initiativeTitle"
                    required
                    class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400"
                    placeholder="Enter initiative title"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                  <textarea
                    [(ngModel)]="newInitiative.description"
                    name="initiativeDescription"
                    rows="3"
                    class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 resize-none"
                    placeholder="Enter initiative description"
                  ></textarea>
                </div>
                <div class="relative">
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Assigned User *</label>
                  <div class="relative">
                    <button
                      type="button"
                      (click)="openUserDropdown(); $event.stopPropagation()"
                      class="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-left flex items-center justify-between hover:border-teal-400 dark:hover:border-teal-500"
                    >
                      <span class="truncate">
                        @if (assignedUserId() && assignedUserId() !== 0) {
                          {{ getSelectedUserName(assignedUserId()!) }}
                        } @else {
                          <span class="text-slate-400">Select a user</span>
                        }
                      </span>
                      <svg class="w-5 h-5 text-slate-400 transition-transform duration-200" [class.rotate-180]="showUserDropdown()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    @if (showUserDropdown()) {
                      <div class="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-slate-200 overflow-hidden animate-in slide-in-from-top-2" (click)="$event.stopPropagation()">
                        <div class="p-3 border-b border-slate-200 sticky top-0 bg-white">
                          <div class="relative">
                            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                              type="text"
                              [value]="userSearchQuery()"
                              (input)="onUserSearchInput($event)"
                              (click)="$event.stopPropagation()"
                              (keydown.escape)="showUserDropdown.set(false)"
                              placeholder="Type to search (e.g., alok, yog)..."
                              class="w-full pl-10 pr-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400"
                              autofocus
                              #userSearchInput
                            />
                          </div>
                        </div>
                        <div id="userDropdownList" class="max-h-64 overflow-y-auto">
                          @if (filteredUsers().length === 0) {
                            <div class="p-4 text-center text-slate-500 text-sm">
                              @if (userSearchQuery().trim()) {
                                No users found matching "{{ userSearchQuery() }}"
                              } @else {
                                @if (loadingUsers()) {
                                  <div class="flex items-center justify-center space-x-2">
                                    <svg class="animate-spin h-5 w-5 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Loading users...</span>
                                  </div>
                                } @else if (users().length === 0) {
                                  <div class="text-red-500">Failed to load users. Please refresh the page.</div>
                                } @else {
                                  Start typing to search users...
                                }
                              }
                            </div>
                          } @else {
                            @for (user of filteredUsers(); track user.userId) {
                              <button
                                type="button"
                                (click)="selectUser(user.userId!); showUserDropdown.set(false); $event.stopPropagation()"
                                class="w-full px-4 py-3 text-left hover:bg-teal-50 active:bg-teal-100 transition-colors border-b border-slate-100 last:border-b-0 flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset"
                              >
                                <div class="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                  {{ (user.name && user.name.length > 0) ? user.name.charAt(0).toUpperCase() : 'U' }}
                                </div>
                                <div class="flex-1 min-w-0">
                                  <div class="font-medium text-slate-900 truncate">{{ user.name }}</div>
                                  <div class="text-xs text-slate-500 truncate">{{ user.email }}</div>
                                </div>
                                @if (assignedUserId() === user.userId) {
                                  <svg class="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                }
                              </button>
                            }
                          }
                        </div>
                      </div>
                    }
                  </div>
                  @if (showUserDropdown()) {
                    <div class="fixed inset-0 z-40" (click)="showUserDropdown.set(false)"></div>
                  }
                </div>
                <div class="flex space-x-3 pt-4">
                  <button
                    type="button"
                    (click)="closeAddInitiativeModal()"
                    class="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="flex-1 btn-primary"
                  >
                    Add Initiative
                  </button>
                </div>
              </form>
            </div>
          </div>
        }

        <!-- Edit Initiative Modal -->
        @if (showEditInitiativeModal()) {
          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-200 dark:border-slate-700">
              <h3 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Edit Initiative</h3>
              <form (ngSubmit)="saveEditedInitiative()" class="space-y-5">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Title *</label>
                  <input
                    [(ngModel)]="editedInitiative.title"
                    name="editedInitiativeTitle"
                    required
                    class="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400"
                    placeholder="Enter initiative title"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                  <textarea
                    [(ngModel)]="editedInitiative.description"
                    name="editedInitiativeDescription"
                    rows="3"
                    class="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 resize-none"
                    placeholder="Enter initiative description"
                  ></textarea>
                </div>
                <div class="relative">
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Assigned User *</label>
                  <div class="relative">
                    <button
                      type="button"
                      (click)="openEditUserDropdown(); $event.stopPropagation()"
                      class="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-left flex items-center justify-between hover:border-teal-400 dark:hover:border-teal-500"
                    >
                      <span class="truncate">
                        @if (editedInitiative.assignedUserId) {
                          {{ getSelectedUserName(editedInitiative.assignedUserId) }}
                        } @else {
                          <span class="text-slate-400">Select a user</span>
                        }
                      </span>
                      <svg class="w-5 h-5 text-slate-400 transition-transform duration-200" [class.rotate-180]="showEditUserDropdown()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    @if (showEditUserDropdown()) {
                      <div class="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-slate-200 overflow-hidden animate-in slide-in-from-top-2" (click)="$event.stopPropagation()">
                        <div class="p-3 border-b border-slate-200 sticky top-0 bg-white">
                          <div class="relative">
                            <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                              type="text"
                              [value]="editUserSearchQuery()"
                              (input)="onEditUserSearchInput($event)"
                              (click)="$event.stopPropagation()"
                              (keydown.escape)="showEditUserDropdown.set(false)"
                              (keydown.arrowdown)="$event.preventDefault(); focusFirstEditUser()"
                              placeholder="Type to search (e.g., alok, yog)..."
                              class="w-full pl-10 pr-4 py-2.5 border-2 border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400"
                              autofocus
                              #editUserSearchInput
                            />
                          </div>
                        </div>
                        <div id="editUserDropdownList" class="max-h-64 overflow-y-auto">
                          @if (filteredUsersForEdit().length === 0) {
                            <div class="p-4 text-center text-slate-500 text-sm">
                              @if (editUserSearchQuery().trim()) {
                                No users found matching "{{ editUserSearchQuery() }}"
                              } @else {
                                @if (loadingUsers()) {
                                  <div class="flex items-center justify-center space-x-2">
                                    <svg class="animate-spin h-5 w-5 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Loading users...</span>
                                  </div>
                                } @else if (users().length === 0) {
                                  <div class="text-red-500">Failed to load users. Please refresh the page.</div>
                                } @else {
                                  Start typing to search users...
                                }
                              }
                            </div>
                          } @else {
                            @for (user of filteredUsersForEdit(); track user.userId) {
                              <button
                                type="button"
                                (click)="selectEditUser(user.userId!); showEditUserDropdown.set(false); $event.stopPropagation()"
                                (keydown.enter)="selectEditUser(user.userId!); showEditUserDropdown.set(false); $event.stopPropagation()"
                                class="w-full px-4 py-3 text-left hover:bg-teal-50 active:bg-teal-100 transition-colors border-b border-slate-100 last:border-b-0 flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset"
                              >
                                <div class="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                  {{ (user.name && user.name.length > 0) ? user.name.charAt(0).toUpperCase() : 'U' }}
                                </div>
                                <div class="flex-1 min-w-0">
                                  <div class="font-medium text-slate-900 truncate">{{ user.name }}</div>
                                  <div class="text-xs text-slate-500 truncate">{{ user.email }}</div>
                                </div>
                                @if (editedInitiative.assignedUserId === user.userId) {
                                  <svg class="w-5 h-5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                }
                              </button>
                            }
                          }
                        </div>
                      </div>
                    }
                  </div>
                  @if (showEditUserDropdown()) {
                    <div class="fixed inset-0 z-40" (click)="showEditUserDropdown.set(false)"></div>
                  }
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Status *</label>
                  <select
                    [(ngModel)]="editedInitiative.status"
                    name="editedInitiativeStatus"
                    required
                    class="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div class="flex space-x-3 pt-4">
                  <button
                    type="button"
                    (click)="closeEditInitiativeModal()"
                    class="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="flex-1 btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        }

        <!-- Edit Plan Modal -->
        @if (showEditPlanModal()) {
          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-200 dark:border-slate-700">
              <h3 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Edit Plan</h3>
              <form (ngSubmit)="saveEditedPlan()" class="space-y-5">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Title *</label>
                  <input
                    [(ngModel)]="editedPlan.title"
                    name="editedPlanTitle"
                    required
                    class="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400"
                    placeholder="Enter plan title"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                  <textarea
                    [(ngModel)]="editedPlan.description"
                    name="editedPlanDescription"
                    rows="3"
                    class="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 resize-none"
                    placeholder="Enter plan description"
                  ></textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Priority *</label>
                    <select
                      [(ngModel)]="editedPlan.priority"
                      name="editedPlanPriority"
                      required
                      class="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option [value]="PlanPriority.LOW">Low</option>
                      <option [value]="PlanPriority.MEDIUM">Medium</option>
                      <option [value]="PlanPriority.HIGH">High</option>
                      <option [value]="PlanPriority.CRITICAL">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Status *</label>
                    <select
                      [(ngModel)]="editedPlan.status"
                      name="editedPlanStatus"
                      required
                      class="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                    >
                      <option [value]="PlanStatus.PLANNED">Planned</option>
                      <option [value]="PlanStatus.IN_PROGRESS">In Progress</option>
                      <option [value]="PlanStatus.COMPLETED">Completed</option>
                      <option [value]="PlanStatus.ON_HOLD">On Hold</option>
                      <option [value]="PlanStatus.CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div class="flex space-x-3 pt-4">
                  <button
                    type="button"
                    (click)="closeEditPlanModal()"
                    class="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="flex-1 btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        }

        <!-- Edit Milestone Modal -->
        @if (showEditMilestoneModal()) {
          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-200 dark:border-slate-700">
              <h3 class="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Edit Milestone</h3>
              <form (ngSubmit)="saveEditedMilestone()" class="space-y-5">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Title *</label>
                  <input
                    [(ngModel)]="editedMilestone.title"
                    name="editedMilestoneTitle"
                    required
                    class="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400"
                    placeholder="Enter milestone title"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    [(ngModel)]="editedMilestone.dueDate"
                    name="editedMilestoneDueDate"
                    class="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Status *</label>
                  <select
                    [(ngModel)]="editedMilestone.status"
                    name="editedMilestoneStatus"
                    required
                    class="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div class="flex space-x-3 pt-4">
                  <button
                    type="button"
                    (click)="closeEditMilestoneModal()"
                    class="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="flex-1 btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
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
  assignedUserId = signal<number | undefined>(undefined);
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
    return this.users().filter(user => 
      user.name?.toLowerCase().includes(query) || 
      user.email?.toLowerCase().includes(query)
    );
  });
  
  filteredUsersForEdit = computed(() => {
    const query = this.editUserSearchQuery().toLowerCase().trim();
    if (!query) {
      return this.users();
    }
    return this.users().filter(user => 
      user.name?.toLowerCase().includes(query) || 
      user.email?.toLowerCase().includes(query)
    );
  });
  
  newMilestone: Partial<MilestoneDetail> = {
    title: '',
    dueDate: '',
    status: 'PLANNED',
    completionPercent: 0
  };

  editedMilestone: Partial<MilestoneDetail> = {
    title: '',
    dueDate: '',
    status: 'PLANNED',
    completionPercent: 0
  };
  
  newInitiative: Partial<Initiative> = {
    title: '',
    description: '',
    status: 'PLANNED'
  };

  editedInitiative: Partial<Initiative> = {
    title: '',
    description: '',
    status: 'PLANNED',
    assignedUserId: undefined
  };

  editedPlan: Partial<Plan> = {
    title: '',
    description: '',
    priority: PlanPriority.MEDIUM,
    status: PlanStatus.PLANNED
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
    public loadingService: LoadingService
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
      }
    });
  }

  loadPlan(planId: number): void {
    this.loadingService.show();
    this.planService.getPlanDetail(planId).subscribe({
      next: (data) => {
        // Map assigned user names for initiatives
        if (data.milestones) {
          data.milestones = data.milestones.map((milestone: any) => {
            if (milestone.initiatives) {
              milestone.initiatives = milestone.initiatives.map((initiative: any) => {
                // Map assignedUser object to assignedUserName and assignedUserId
                if (initiative.assignedUser) {
                  initiative.assignedUserName = initiative.assignedUser.name || 'Unknown';
                  initiative.assignedUserId = initiative.assignedUser.userId;
                }
                return initiative;
              });
            }
            return milestone;
          });
        }
        this.plan.set(data);
        this.expandedMilestones.set(new Array(data.milestones?.length || 0).fill(false));
        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
        this.toastService.showError('Failed to load plan details');
        this.router.navigate(['/plans']);
      }
    });
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

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
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
      // Handle both assignedUserId (number) and assignedUser.userId cases
      const assignedUserId = initiative.assignedUserId || initiative.assignedUser?.userId;
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
        : null
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
      }
    });
  }

  addInitiative(): void {
    if (!this.newInitiative.title || !this.selectedMilestoneId()) {
      this.toastService.showError('Please fill in all required fields');
      return;
    }

    const userId = this.assignedUserId();
    if (!userId || userId === 0) {
      this.toastService.showError('Please select an assigned user');
      return;
    }

    const milestoneId = this.selectedMilestoneId()!;
    this.loadingService.show();
    this.initiativeService.createInitiative(milestoneId, userId, this.newInitiative as Initiative).subscribe({
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
      }
    });
  }

  updateInitiativeStatus(initiative: Initiative, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;
    
    // Create update payload with only status (employees can only update status)
    const updated: any = {
      status: newStatus
    };
    
    // If manager/admin, include other fields; if employee, only status
    if (this.authService.isManager() || this.authService.isAdmin()) {
      updated.title = initiative.title;
      updated.description = initiative.description;
      if (initiative.assignedUserId || initiative.assignedUser?.userId) {
        updated.assignedUser = {
          userId: initiative.assignedUserId || initiative.assignedUser?.userId
        };
      }
    }
    
    this.loadingService.show();
    this.initiativeService.updateInitiative(initiative.initiativeId!, updated).subscribe({
      next: () => {
        this.loadingService.hide();
        this.toastService.showSuccess('Initiative status updated!');
        const planId = this.plan()!.planId!;
        this.loadPlan(planId);
      },
      error: (error) => {
        console.error('Failed to update initiative status:', error);
        this.loadingService.hide();
        const errorMsg = error.error?.message || 'Failed to update initiative status';
        this.toastService.showError(errorMsg);
        // Revert the select value
        select.value = initiative.status || 'PLANNED';
      }
    });
  }

  editMilestone(milestone: MilestoneDetail, event: Event): void {
    event.stopPropagation();
    this.editingMilestone.set(milestone);
    this.editedMilestone = {
      title: milestone.title || '',
      dueDate: milestone.dueDate ? milestone.dueDate.split('T')[0] : '',
      status: milestone.status || 'PLANNED',
      completionPercent: milestone.completionPercent || 0
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
        : null
    };

    this.milestoneService.updateMilestone(milestone.milestoneId, milestoneToSend).subscribe({
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
      }
    });
  }

  closeEditMilestoneModal(): void {
    this.showEditMilestoneModal.set(false);
    this.editingMilestone.set(null);
    this.editedMilestone = {
      title: '',
      dueDate: '',
      status: 'PLANNED',
      completionPercent: 0
    };
  }

  editPlan(): void {
    const currentPlan = this.plan();
    if (!currentPlan) return;
    
    this.editedPlan = {
      title: currentPlan.title || '',
      description: currentPlan.description || '',
      priority: currentPlan.priority || PlanPriority.MEDIUM,
      status: currentPlan.status || PlanStatus.PLANNED
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
    this.planService.updatePlan(currentPlan.planId, this.editedPlan as Plan).subscribe({
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
      }
    });
  }

  closeEditPlanModal(): void {
    this.showEditPlanModal.set(false);
    this.editedPlan = {
      title: '',
      description: '',
      priority: PlanPriority.MEDIUM,
      status: PlanStatus.PLANNED
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
        }
      });
    }
  }

  editInitiative(initiative: Initiative, event: Event): void {
    event.stopPropagation();
    this.editingInitiative.set(initiative);
    this.editedInitiative = {
      title: initiative.title || '',
      description: initiative.description || '',
      status: initiative.status || 'PLANNED',
      assignedUserId: initiative.assignedUserId || undefined
    };
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

    if (!this.editedInitiative.assignedUserId) {
      this.toastService.showError('Please select an assigned user');
      return;
    }

    this.loadingService.show();
    const updatedInitiative: any = {
      title: this.editedInitiative.title!,
      description: this.editedInitiative.description || '',
      status: this.editedInitiative.status || 'PLANNED',
      assignedUser: {
        userId: this.editedInitiative.assignedUserId
      }
    };

    this.initiativeService.updateInitiative(initiative.initiativeId, updatedInitiative).subscribe({
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
        const errorMsg = error.error?.message || 'Failed to update initiative';
        this.toastService.showError(errorMsg);
      }
    });
  }

  closeEditInitiativeModal(): void {
    this.showEditInitiativeModal.set(false);
    this.showEditUserDropdown.set(false);
    this.editingInitiative.set(null);
    this.editUserSearchQuery.set('');
    this.editedInitiative = {
      title: '',
      description: '',
      status: 'PLANNED',
      assignedUserId: undefined
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
        }
      });
    }
  }

  closeAddMilestoneModal(): void {
    this.showAddMilestoneModal.set(false);
    this.newMilestone = {
      title: '',
      dueDate: '',
      status: 'PLANNED',
      completionPercent: 0
    };
  }

  closeAddInitiativeModal(): void {
    this.showAddInitiativeModal.set(false);
    this.selectedMilestoneId.set(null);
    this.assignedUserId.set(undefined);
    this.newInitiative = {
      title: '',
      description: '',
      status: 'PLANNED'
    };
  }

  getFilteredUsers(): User[] {
    const query = this.userSearchQuery().toLowerCase().trim();
    if (!query) {
      return this.users();
    }
    return this.users().filter(user => 
      user.name?.toLowerCase().includes(query) || 
      user.email?.toLowerCase().includes(query)
    );
  }

  getFilteredUsersForEdit(): User[] {
    const query = this.editUserSearchQuery().toLowerCase().trim();
    if (!query) {
      return this.users();
    }
    return this.users().filter(user => 
      user.name?.toLowerCase().includes(query) || 
      user.email?.toLowerCase().includes(query)
    );
  }

  openUserDropdown(): void {
    // Open dropdown immediately
    this.showUserDropdown.set(true);
    this.userSearchQuery.set('');
    
    // Ensure users are loaded
    if (this.users().length === 0 && (this.authService.isManager() || this.authService.isAdmin()) && !this.loadingUsers()) {
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
        'input[autofocus]'
      ];
      
      for (const selector of selectors) {
        const input = document.querySelector(selector) as HTMLInputElement;
        if (input && input.offsetParent !== null) { // Check if visible
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
    if (this.users().length === 0 && (this.authService.isManager() || this.authService.isAdmin()) && !this.loadingUsers()) {
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
        'input[autofocus]'
      ];
      
      for (const selector of selectors) {
        const input = document.querySelector(selector) as HTMLInputElement;
        if (input && input.offsetParent !== null) { // Check if visible
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
    const user = this.users().find(u => u.userId === userId);
    return user ? `${user.name} (${user.email})` : 'Unknown';
  }

  selectUser(userId: number): void {
    this.assignedUserId.set(userId);
    this.userSearchQuery.set('');
    this.showUserDropdown.set(false);
  }

  selectEditUser(userId: number): void {
    this.editedInitiative.assignedUserId = userId;
    this.editUserSearchQuery.set('');
    this.showEditUserDropdown.set(false);
  }

  focusFirstUser(): void {
    // Focus first user button for keyboard navigation
    setTimeout(() => {
      const firstButton = document.querySelector('#userDropdownList button') as HTMLButtonElement;
      if (firstButton) {
        firstButton.focus();
      }
    }, 0);
  }

  focusFirstEditUser(): void {
    // Focus first user button for keyboard navigation
    setTimeout(() => {
      const firstButton = document.querySelector('#editUserDropdownList button') as HTMLButtonElement;
      if (firstButton) {
        firstButton.focus();
      }
    }, 0);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

