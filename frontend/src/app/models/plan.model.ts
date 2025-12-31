export enum PlanStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED'
}

export enum PlanPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Plan {
  planId?: number;
  title: string;
  description?: string;
  priority?: PlanPriority;
  status?: PlanStatus;
  startDate?: string;
  endDate?: string;
  userId?: number;
  userName?: string;
}

export interface PlanDetail extends Plan {
  milestones?: MilestoneDetail[];
}

export interface Milestone {
  milestoneId?: number;
  title: string;
  dueDate?: string;
  completionPercent?: number;
  status?: string;
  planId?: number;
  planTitle?: string;
}

export interface MilestoneDetail extends Milestone {
  initiatives?: Initiative[];
}

export interface Initiative {
  initiativeId?: number;
  title: string;
  description?: string;
  status?: string;
  milestoneId?: number;
  milestoneTitle?: string;
  assignedUserId?: number;
  assignedUserName?: string;
}

export interface DashboardStats {
  totalPlans: number;
  activeInitiatives: number;
  completedMilestones: number;
  totalUsers: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  role: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}


