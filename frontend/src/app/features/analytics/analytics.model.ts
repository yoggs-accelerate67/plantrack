export interface AnalyticsReport {
  reportId: number;
  department: string;
  totalPlans: number;
  completedPlans: number;
  inProgressPlans: number;
  onHoldPlans: number;
  cancelledPlans: number;
  planCompletionRate: number;
  avgPlanPriority: 'LOW' | 'MEDIUM' | 'HIGH' | string;

  totalMilestones: number;
  completedMilestones: number;
  pendingMilestones: number;
  milestoneCompletionRate: number;
  avgMilestoneCompletionPercent: number;
  overdueMilestones: number;

  totalInitiatives: number;
  completedInitiatives: number;
  inProgressInitiatives: number;
  initiativeCompletionRate: number;
  avgInitiativeCompletionPercent: number;

  overallCompletionRate: number;
  generatedDate: string; // ISO
}