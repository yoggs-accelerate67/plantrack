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
import lombok.Data;

@Entity
@Table(name = "analytics_reports")
@Data
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
}