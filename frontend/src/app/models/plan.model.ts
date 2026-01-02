export enum PlanStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED'
}

export enum MilestoneStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum InitiativeStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
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
  planId?: number;
  planTitle?: string;
  planPriority?: PlanPriority;
  // Legacy single assignee fields (for backward compatibility)
  assignedUserId?: number;
  assignedUserName?: string;
  assignedUser?: {
    userId?: number;
    name?: string;
    email?: string;
  };
  // New multiple assignees fields
  assignedUserIds?: number[];
  assignedUsers?: Array<{
    userId?: number;
    name?: string;
    email?: string;
  }>;
  milestone?: {
    milestoneId?: number;
    title?: string;
    plan?: {
      planId?: number;
      title?: string;
      priority?: PlanPriority;
    };
  };
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
  email?: string;
  role: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface Comment {
  commentId?: number;
  content: string;
  initiativeId?: number;
  author?: {
    userId?: number;
    name?: string;
    email?: string;
  };
  authorId?: number;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
  mentionedUsers?: Array<{
    userId?: number;
    name?: string;
    email?: string;
  }>;
}

