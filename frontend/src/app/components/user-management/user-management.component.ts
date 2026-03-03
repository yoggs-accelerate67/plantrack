import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService, User } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { LoadingService } from '../../services/loading.service';
import { NotificationCenterComponent } from '../notification-center/notification-center.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NotificationCenterComponent],
  templateUrl: './user-management.component.html',
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

