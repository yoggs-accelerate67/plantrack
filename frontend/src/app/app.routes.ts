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
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
];
