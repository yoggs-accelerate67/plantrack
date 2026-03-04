package com.plantrack.backend.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.plantrack.backend.model.AnalyticsReport;
import com.plantrack.backend.model.Initiative;
import com.plantrack.backend.model.Milestone;
import com.plantrack.backend.model.Plan;
import com.plantrack.backend.model.PlanStatus;
import com.plantrack.backend.model.User;
import com.plantrack.backend.repository.AnalyticsReportRepository;

import com.plantrack.backend.repository.PlanRepository;
import com.plantrack.backend.repository.UserRepository;
import com.plantrack.backend.service.AnalyticsService;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsService.class);

    @Autowired
    private AnalyticsReportRepository analyticsReportRepository;

    @Autowired
    private PlanRepository planRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Generate a single, unified AnalyticsReport for a department and persist it once.
     * NOTE: Update AnalyticsService interface to match this signature if needed.
     */
    @Override
    public AnalyticsReport generateAllAnalyticsForDepartment(String department) {
        logger.info("Generating unified analytics for department: {}", department);

        // 1) Get all users in department
        List<User> deptUsers = userRepository.findAll().stream()
            .filter(u -> department.equalsIgnoreCase(u.getDepartment()))
            .collect(Collectors.toList());

        if (deptUsers.isEmpty()) {
            logger.warn("No users found in department: {}", department);
            return null;
        }

        // 2) Build datasets ONCE
        List<Plan> deptPlans = planRepository.findAll().stream()
            .filter(p -> deptUsers.stream().anyMatch(u -> u.getUserId().equals(p.getUser().getUserId())))
            .collect(Collectors.toList());

        List<Milestone> deptMilestones = deptPlans.stream()
            .flatMap(p -> p.getMilestones().stream())
            .collect(Collectors.toList());

        List<Initiative> deptInitiatives = deptMilestones.stream()
            .flatMap(m -> m.getInitiatives().stream())
            .collect(Collectors.toList());

        // 3) Create final report (not yet persisted)
        // Ensure AnalyticsReport has constructor AnalyticsReport(String department)
        AnalyticsReport report = new AnalyticsReport(department);

        // 4) Populate sections in-place
        populatePlanMetrics(report, deptPlans);
        populateMilestoneMetrics(report, deptMilestones);
        populateInitiativeMetrics(report, deptInitiatives);

        // 5) Overall (weighted 40/30/30)
        report.setOverallCompletionRate(
            calculateWeightedCompletionRate(
                report.getPlanCompletionRate(),
                report.getMilestoneCompletionRate(),
                report.getInitiativeCompletionRate()
            )
        );

        // 6) Persist only once
        return analyticsReportRepository.save(report);
    }

    // ------------------------------------------------------------------------
    // PRIVATE POPULATORS (Pattern A): fill fields on the passed-in report
    // ------------------------------------------------------------------------

    private void populatePlanMetrics(AnalyticsReport report, List<Plan> plans) {
        report.setTotalPlans(plans.size());

        report.setCompletedPlans((int) plans.stream()
            .filter(p -> p.getStatus() == PlanStatus.COMPLETED)
            .count());

        report.setInProgressPlans((int) plans.stream()
            .filter(p -> p.getStatus() == PlanStatus.IN_PROGRESS)
            .count());

        report.setOnHoldPlans((int) plans.stream()
            .filter(p -> p.getStatus() == PlanStatus.ON_HOLD)
            .count());

        report.setCancelledPlans((int) plans.stream()
            .filter(p -> p.getStatus() == PlanStatus.CANCELLED)
            .count());

        BigDecimal planCompletionRate = plans.isEmpty() ? BigDecimal.ZERO :
            BigDecimal.valueOf((double) report.getCompletedPlans() / plans.size() * 100.0)
                .setScale(2, RoundingMode.HALF_UP);
        report.setPlanCompletionRate(planCompletionRate);

        String avgPriority = plans.isEmpty() ? "N/A" :
            plans.stream()
                .map(Plan::getPriority)
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(p -> p, Collectors.counting()))
                .entrySet().stream()
                .max(java.util.Map.Entry.comparingByValue())
                .map(e -> e.getKey().toString())
                .orElse("N/A");

        report.setAvgPlanPriority(avgPriority);
    }

    private void populateMilestoneMetrics(AnalyticsReport report, List<Milestone> milestones) {
        report.setTotalMilestones(milestones.size());

        report.setCompletedMilestones((int) milestones.stream()
            .filter(m -> "COMPLETED".equalsIgnoreCase(m.getStatus()))
            .count());

        report.setPendingMilestones((int) milestones.stream()
            .filter(m -> "PENDING".equalsIgnoreCase(m.getStatus()))
            .count());

        BigDecimal milestoneCompletionRate = milestones.isEmpty() ? BigDecimal.ZERO :
            BigDecimal.valueOf((double) report.getCompletedMilestones() / milestones.size() * 100.0)
                .setScale(2, RoundingMode.HALF_UP);
        report.setMilestoneCompletionRate(milestoneCompletionRate);

        BigDecimal avgMilestoneCompletion = milestones.isEmpty() ? BigDecimal.ZERO :
            BigDecimal.valueOf(
                milestones.stream()
                    .mapToDouble(m -> m.getCompletionPercent() != null ? m.getCompletionPercent() : 0.0)
                    .average()
                    .orElse(0.0)
            ).setScale(2, RoundingMode.HALF_UP);
        report.setAvgMilestoneCompletionPercent(avgMilestoneCompletion);

        report.setOverdueMilestones((int) milestones.stream()
            .filter(m -> m.getDueDate() != null && m.getDueDate().isBefore(LocalDate.now().atStartOfDay()))
            .count());
    }

    private void populateInitiativeMetrics(AnalyticsReport report, List<Initiative> initiatives) {
        report.setTotalInitiatives(initiatives.size());

        report.setCompletedInitiatives((int) initiatives.stream()
            .filter(i -> "COMPLETED".equalsIgnoreCase(i.getStatus()))
            .count());

        report.setInProgressInitiatives((int) initiatives.stream()
            .filter(i -> "IN_PROGRESS".equalsIgnoreCase(i.getStatus()))
            .count());

        BigDecimal initiativeCompletionRate = initiatives.isEmpty() ? BigDecimal.ZERO :
            BigDecimal.valueOf((double) report.getCompletedInitiatives() / initiatives.size() * 100.0)
                .setScale(2, RoundingMode.HALF_UP);
        report.setInitiativeCompletionRate(initiativeCompletionRate);

        // Derived avg initiative completion percent from status
        BigDecimal avgInitiativeCompletion = initiatives.isEmpty() ? BigDecimal.ZERO :
            BigDecimal.valueOf(
                initiatives.stream()
                    .mapToDouble(i -> {
                        String status = i.getStatus();
                        if (status == null) return 0.0;
                        String s = status.trim().toUpperCase();
                        if ("COMPLETED".equals(s)) return 100.0;
                        if ("IN_PROGRESS".equals(s)) return 50.0; // default
                        return 0.0; // PLANNED/others
                    })
                    .average()
                    .orElse(0.0)
            ).setScale(2, RoundingMode.HALF_UP);
        report.setAvgInitiativeCompletionPercent(avgInitiativeCompletion);
    }

    // ------------------------------------------------------------------------
    // Other service methods (updated to remove ReportType)
    // ------------------------------------------------------------------------

    @Override
    public AnalyticsReport getLatestReport(String department) {
        return analyticsReportRepository
            .findFirstByDepartmentOrderByGeneratedDateDesc(department)
            .orElse(null);
    }

    @Override
    public List<AnalyticsReport> getReportsByDepartment(String department) {
        return analyticsReportRepository.findByDepartmentOrderByGeneratedDateDesc(department);
    }

    @Override
    public List<String> getAllDepartments() {
        return analyticsReportRepository.findAllDepartments();
    }

    @Override
    public List<AnalyticsReport> getReportsByDateRange(String department, LocalDateTime startDate, LocalDateTime endDate) {
        return analyticsReportRepository.findByDepartmentAndDateRange(department, startDate, endDate);
    }

    /**
     * Calculate weighted completion rate (40% plans, 30% milestones, 30% initiatives)
     */
    private BigDecimal calculateWeightedCompletionRate(BigDecimal planRate, BigDecimal milestoneRate, BigDecimal initiativeRate) {
        BigDecimal plan = planRate != null ? planRate.multiply(BigDecimal.valueOf(0.4)) : BigDecimal.ZERO;
        BigDecimal milestone = milestoneRate != null ? milestoneRate.multiply(BigDecimal.valueOf(0.3)) : BigDecimal.ZERO;
        BigDecimal initiative = initiativeRate != null ? initiativeRate.multiply(BigDecimal.valueOf(0.3)) : BigDecimal.ZERO;
        return plan.add(milestone).add(initiative).setScale(2, RoundingMode.HALF_UP);
    }
}