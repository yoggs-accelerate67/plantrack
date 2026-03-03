import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'plans',
    loadComponent: () =>
      import('./features/plans/plan-board/plan-board.component').then(
        (m) => m.PlanBoardComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'plans/:id',
    loadComponent: () =>
      import('./features/plans/plan-detail/plan-detail.component').then(
        (m) => m.PlanDetailComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./features/user-management/user-management.component').then(
        (m) => m.UserManagementComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'my-initiatives',
    loadComponent: () =>
      import('./features/plans/my-initiatives/my-initiatives.component').then(
        (m) => m.MyInitiativesComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'audit-logs',
    loadComponent: () =>
      import('./features/audit-logs/audit-logs.component').then(
        (m) => m.AuditLogsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
