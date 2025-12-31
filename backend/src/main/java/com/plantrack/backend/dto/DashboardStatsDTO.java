package com.plantrack.backend.dto;

public class DashboardStatsDTO {
    private Long totalPlans;
    private Long activeInitiatives;
    private Long completedMilestones;
    private Long totalUsers;

    public DashboardStatsDTO() {}

    public DashboardStatsDTO(Long totalPlans, Long activeInitiatives, Long completedMilestones, Long totalUsers) {
        this.totalPlans = totalPlans;
        this.activeInitiatives = activeInitiatives;
        this.completedMilestones = completedMilestones;
        this.totalUsers = totalUsers;
    }

    // Getters and Setters
    public Long getTotalPlans() { return totalPlans; }
    public void setTotalPlans(Long totalPlans) { this.totalPlans = totalPlans; }

    public Long getActiveInitiatives() { return activeInitiatives; }
    public void setActiveInitiatives(Long activeInitiatives) { this.activeInitiatives = activeInitiatives; }

    public Long getCompletedMilestones() { return completedMilestones; }
    public void setCompletedMilestones(Long completedMilestones) { this.completedMilestones = completedMilestones; }

    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
}


