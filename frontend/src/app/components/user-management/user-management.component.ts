import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService, User } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <!-- Navigation Header -->
      <nav class="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm sticky top-0 z-40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center space-x-8">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h1 class="text-xl font-bold text-slate-900">PlanTrack Enterprise</h1>
              </div>
              <div class="hidden md:flex space-x-1">
                <a routerLink="/dashboard" routerLinkActive="bg-teal-50 text-teal-700" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-teal-600 rounded-lg transition-colors">Dashboard</a>
                <a routerLink="/plans" routerLinkActive="bg-teal-50 text-teal-700" class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-teal-600 rounded-lg transition-colors">Plans</a>
                @if (authService.isAdmin()) {
                  <a routerLink="/users" routerLinkActive="bg-teal-50 text-teal-700" class="px-4 py-2 text-sm font-medium text-teal-600 rounded-lg">User Management</a>
                }
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <div class="hidden sm:flex items-center space-x-3">
                <div class="text-right">
                  <p class="text-xs text-slate-500">Signed in as</p>
                  <p class="text-sm font-medium text-slate-900">{{ authService.currentUser() }}</p>
                </div>
                <span class="px-3 py-1.5 bg-gradient-to-r from-teal-100 to-teal-50 text-teal-700 rounded-full text-xs font-semibold border border-teal-200">{{ authService.userRole() }}</span>
              </div>
              <button 
                (click)="logout()" 
                class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center space-x-2"
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
        <!-- Page Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h2 class="text-3xl font-bold text-slate-900 mb-2">User Management</h2>
            <p class="text-slate-600">Manage platform users, roles, and permissions</p>
          </div>
          <button
            (click)="openAddUserModal()"
            class="btn-primary flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New User</span>
          </button>
        </div>

        <!-- Users Table -->
        @if (loadingService.isLoading()) {
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        } @else if (users().length === 0) {
          <div class="card p-16 text-center">
            <div class="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">No users found</h3>
            <p class="text-slate-600 mb-6 max-w-sm mx-auto">Get started by adding your first user to the platform.</p>
            <button
              (click)="openAddUserModal()"
              class="btn-primary inline-flex items-center space-x-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add First User</span>
            </button>
          </div>
        } @else {
          <div class="card overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-200">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Email</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Department</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Role</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-slate-200">
                  @for (user of users(); track user.userId) {
                    <tr class="hover:bg-slate-50 transition-colors">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {{ (user.name && user.name.length > 0) ? user.name.charAt(0).toUpperCase() : 'U' }}
                          </div>
                          <div class="ml-4">
                            <div class="text-sm font-medium text-slate-900">{{ user.name }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-slate-600">{{ user.email }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-slate-600">{{ user.department || 'N/A' }}</div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span
                          class="px-3 py-1 rounded-full text-xs font-semibold"
                          [ngClass]="{
                            'bg-purple-100 text-purple-700 border border-purple-200': user.role === 'ADMIN',
                            'bg-blue-100 text-blue-700 border border-blue-200': user.role === 'MANAGER',
                            'bg-green-100 text-green-700 border border-green-200': user.role === 'EMPLOYEE'
                          }"
                        >
                          {{ user.role || 'N/A' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span
                          class="px-3 py-1 rounded-full text-xs font-semibold"
                          [ngClass]="{
                            'bg-green-100 text-green-700 border border-green-200': user.status === 'ACTIVE',
                            'bg-red-100 text-red-700 border border-red-200': user.status === 'INACTIVE',
                            'bg-slate-100 text-slate-700 border border-slate-200': !user.status
                          }"
                        >
                          {{ user.status || 'N/A' }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex items-center justify-end space-x-2">
                          <button
                            (click)="editUser(user)"
                            class="p-2 text-slate-400 hover:text-teal-600 transition-colors rounded-lg hover:bg-teal-50"
                            title="Edit User"
                          >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            (click)="deleteUser(user.userId!)"
                            class="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                            title="Delete User"
                          >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Add/Edit User Modal -->
        @if (showUserModal()) {
          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-200">
              <div class="flex items-center space-x-3 mb-6">
                <div class="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-slate-900">{{ editingUser() ? 'Edit User' : 'Add New User' }}</h3>
              </div>
              <form (ngSubmit)="saveUser()" class="space-y-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Name *</label>
                  <input
                    [(ngModel)]="currentUser.name"
                    name="name"
                    required
                    class="input-field"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    [(ngModel)]="currentUser.email"
                    name="email"
                    required
                    class="input-field"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Password {{ editingUser() ? '(leave blank to keep current)' : '*' }}</label>
                  <input
                    type="password"
                    [(ngModel)]="currentUser.password"
                    name="password"
                    [required]="!editingUser()"
                    class="input-field"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                  <input
                    [(ngModel)]="currentUser.department"
                    name="department"
                    class="input-field"
                    placeholder="Enter department"
                  />
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Role *</label>
                  <select
                    [(ngModel)]="currentUser.role"
                    name="role"
                    required
                    class="input-field"
                  >
                    <option value="">Select role</option>
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                    <option value="EMPLOYEE">Employee</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select
                    [(ngModel)]="currentUser.status"
                    name="status"
                    class="input-field"
                  >
                    <option value="">Select status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div class="flex space-x-3 pt-6 mt-6 border-t border-slate-200">
                  <button
                    type="button"
                    (click)="closeUserModal()"
                    class="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="flex-1 btn-primary"
                  >
                    {{ editingUser() ? 'Update User' : 'Create User' }}
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
export class UserManagementComponent implements OnInit {
  users = signal<User[]>([]);
  showUserModal = signal(false);
  editingUser = signal<User | null>(null);
  currentUser: Partial<User> = {
    name: '',
    email: '',
    password: '',
    department: '',
    role: '',
    status: ''
  };

  constructor(
    public authService: AuthService,
    private userService: UserService,
    private toastService: ToastService,
    public loadingService: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.toastService.showError('Access denied. Admin privileges required.');
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadUsers();
  }

  loadUsers(): void {
    this.loadingService.show();
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.loadingService.hide();
        this.toastService.showError('Failed to load users');
      }
    });
  }

  openAddUserModal(): void {
    this.editingUser.set(null);
    this.currentUser = {
      name: '',
      email: '',
      password: '',
      department: '',
      role: '',
      status: ''
    };
    this.showUserModal.set(true);
  }

  editUser(user: User): void {
    this.editingUser.set(user);
    this.currentUser = {
      name: user.name,
      email: user.email,
      password: '', // Don't pre-fill password
      department: user.department || '',
      role: user.role || '',
      status: user.status || ''
    };
    this.showUserModal.set(true);
  }

  saveUser(): void {
    if (!this.currentUser.name || !this.currentUser.email || !this.currentUser.role) {
      this.toastService.showError('Please fill in all required fields');
      return;
    }

    if (!this.editingUser() && !this.currentUser.password) {
      this.toastService.showError('Password is required for new users');
      return;
    }

    this.loadingService.show();
    const userToSave: User = {
      name: this.currentUser.name!,
      email: this.currentUser.email!,
      department: this.currentUser.department,
      role: this.currentUser.role!,
      status: this.currentUser.status
    };

    // Only include password if provided (for new users or when updating)
    if (this.currentUser.password) {
      userToSave.password = this.currentUser.password;
    }

    const operation = this.editingUser()
      ? this.userService.updateUser(this.editingUser()!.userId!, userToSave)
      : this.userService.createUser(userToSave);

    operation.subscribe({
      next: () => {
        this.loadingService.hide();
        this.toastService.showSuccess(
          this.editingUser() ? 'User updated successfully!' : 'User created successfully!'
        );
        this.closeUserModal();
        this.loadUsers();
      },
      error: (error) => {
        console.error('Failed to save user:', error);
        this.loadingService.hide();
        const errorMsg = error.error?.message || (this.editingUser() ? 'Failed to update user' : 'Failed to create user');
        this.toastService.showError(errorMsg);
      }
    });
  }

  deleteUser(userId: number): void {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    this.loadingService.show();
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.loadingService.hide();
        this.toastService.showSuccess('User deleted successfully!');
        this.loadUsers();
      },
      error: (error) => {
        console.error('Failed to delete user:', error);
        this.loadingService.hide();
        const errorMsg = error.error?.message || 'Failed to delete user';
        this.toastService.showError(errorMsg);
      }
    });
  }

  closeUserModal(): void {
    this.showUserModal.set(false);
    this.editingUser.set(null);
    this.currentUser = {
      name: '',
      email: '',
      password: '',
      department: '',
      role: '',
      status: ''
    };
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

