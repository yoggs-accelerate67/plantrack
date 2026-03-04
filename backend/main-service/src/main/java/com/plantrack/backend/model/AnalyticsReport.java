package com.plantrack.backend.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "analytics_reports")
public class AnalyticsReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    @Column(nullable = false)
    private String department;

    // ===== PLAN METRICS =====
    private Integer totalPlans;
    private Integer completedPlans;
    private Integer inProgressPlans;
    private Integer onHoldPlans;
    private Integer cancelledPlans;
    private BigDecimal planCompletionRate;
    private String avgPlanPriority;

    // ===== MILESTONE METRICS =====
    private Integer totalMilestones;
    private Integer completedMilestones;
    private Integer pendingMilestones;
    private BigDecimal milestoneCompletionRate;
    private BigDecimal avgMilestoneCompletionPercent;
    private Integer overdueMilestones;

    // ===== INITIATIVE METRICS =====
    private Integer totalInitiatives;
    private Integer completedInitiatives;
    private Integer inProgressInitiatives;
    private BigDecimal initiativeCompletionRate;
    private BigDecimal avgInitiativeCompletionPercent;

    // ===== OVERALL METRICS =====
    private BigDecimal overallCompletionRate;

    // ===== TIMESTAMP =====
    @Column(nullable = false, updatable = false)
    private LocalDateTime generatedDate;

    // ==========================
    // Constructors
    // ==========================

    public AnalyticsReport() {}

    // Constructor used by the service
    public AnalyticsReport(String department) {
        this.department = department;
        this.generatedDate = LocalDateTime.now();
    }

    // Auto-set timestamp if missing
    @PrePersist
    public void onCreate() {
        if (this.generatedDate == null) {
            this.generatedDate = LocalDateTime.now();
        }
    }

    // ==========================
    // Getters & Setters
    // ==========================

    public Long getReportId() { return reportId; }
    public void setReportId(Long reportId) { this.reportId = reportId; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    // Plan metrics
    public Integer getTotalPlans() { return totalPlans; }
    public void setTotalPlans(Integer totalPlans) { this.totalPlans = totalPlans; }

    public Integer getCompletedPlans() { return completedPlans; }
    public void setCompletedPlans(Integer completedPlans) { this.completedPlans = completedPlans; }

    public Integer getInProgressPlans() { return inProgressPlans; }
    public void setInProgressPlans(Integer inProgressPlans) { this.inProgressPlans = inProgressPlans; }

    public Integer getOnHoldPlans() { return onHoldPlans; }
    public void setOnHoldPlans(Integer onHoldPlans) { this.onHoldPlans = onHoldPlans; }

    public Integer getCancelledPlans() { return cancelledPlans; }
    public void setCancelledPlans(Integer cancelledPlans) { this.cancelledPlans = cancelledPlans; }

    public BigDecimal getPlanCompletionRate() { return planCompletionRate; }
    public void setPlanCompletionRate(BigDecimal planCompletionRate) { this.planCompletionRate = planCompletionRate; }

    public String getAvgPlanPriority() { return avgPlanPriority; }
    public void setAvgPlanPriority(String avgPlanPriority) { this.avgPlanPriority = avgPlanPriority; }

    // Milestone metrics
    public Integer getTotalMilestones() { return totalMilestones; }
    public void setTotalMilestones(Integer totalMilestones) { this.totalMilestones = totalMilestones; }

    public Integer getCompletedMilestones() { return completedMilestones; }
    public void setCompletedMilestones(Integer completedMilestones) { this.completedMilestones = completedMilestones; }

    public Integer getPendingMilestones() { return pendingMilestones; }
    public void setPendingMilestones(Integer pendingMilestones) { this.pendingMilestones = pendingMilestones; }

    public BigDecimal getMilestoneCompletionRate() { return milestoneCompletionRate; }
    public void setMilestoneCompletionRate(BigDecimal milestoneCompletionRate) { this.milestoneCompletionRate = milestoneCompletionRate; }

    public BigDecimal getAvgMilestoneCompletionPercent() { return avgMilestoneCompletionPercent; }
    public void setAvgMilestoneCompletionPercent(BigDecimal avgMilestoneCompletionPercent) { this.avgMilestoneCompletionPercent = avgMilestoneCompletionPercent; }

    public Integer getOverdueMilestones() { return overdueMilestones; }
    public void setOverdueMilestones(Integer overdueMilestones) { this.overdueMilestones = overdueMilestones; }

    // Initiative metrics
    public Integer getTotalInitiatives() { return totalInitiatives; }
    public void setTotalInitiatives(Integer totalInitiatives) { this.totalInitiatives = totalInitiatives; }

    public Integer getCompletedInitiatives() { return completedInitiatives; }
    public void setCompletedInitiatives(Integer completedInitiatives) { this.completedInitiatives = completedInitiatives; }

    public Integer getInProgressInitiatives() { return inProgressInitiatives; }
    public void setInProgressInitiatives(Integer inProgressInitiatives) { this.inProgressInitiatives = inProgressInitiatives; }

    public BigDecimal getInitiativeCompletionRate() { return initiativeCompletionRate; }
    public void setInitiativeCompletionRate(BigDecimal initiativeCompletionRate) { this.initiativeCompletionRate = initiativeCompletionRate; }

    public BigDecimal getAvgInitiativeCompletionPercent() { return avgInitiativeCompletionPercent; }
    public void setAvgInitiativeCompletionPercent(BigDecimal avgInitiativeCompletionPercent) { this.avgInitiativeCompletionPercent = avgInitiativeCompletionPercent; }

    // Overall
    public BigDecimal getOverallCompletionRate() { return overallCompletionRate; }
    public void setOverallCompletionRate(BigDecimal overallCompletionRate) { this.overallCompletionRate = overallCompletionRate; }

    public LocalDateTime getGeneratedDate() { return generatedDate; }
    public void setGeneratedDate(LocalDateTime generatedDate) { this.generatedDate = generatedDate; }
}