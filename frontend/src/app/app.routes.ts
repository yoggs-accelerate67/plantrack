import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'plans',
    loadComponent: () => import('./components/plan-board/plan-board.component').then(m => m.PlanBoardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'plans/:id',
    loadComponent: () => import('./components/plan-detail/plan-detail.component').then(m => m.PlanDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./components/user-management/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-initiatives',
    loadComponent: () => import('./components/my-initiatives/my-initiatives.component').then(m => m.MyInitiativesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'analytics',
    loadComponent: () => import('./components/analytics-dashboard/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'audit-logs',
    loadComponent: () => import('./components/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
