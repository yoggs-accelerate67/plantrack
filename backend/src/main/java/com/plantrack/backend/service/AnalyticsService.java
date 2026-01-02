package com.plantrack.backend.service;

import com.plantrack.backend.dto.DashboardStatsDTO;
import com.plantrack.backend.dto.DepartmentalInsightsDTO;
import com.plantrack.backend.dto.VelocityMetricsDTO;
import com.plantrack.backend.model.AnalyticsDTO;
import com.plantrack.backend.model.Initiative;
import com.plantrack.backend.model.Milestone;
import com.plantrack.backend.model.Plan;
import com.plantrack.backend.model.PlanStatus;
import com.plantrack.backend.model.User;
import com.plantrack.backend.repository.InitiativeRepository;
import com.plantrack.backend.repository.MilestoneRepository;
import com.plantrack.backend.repository.PlanRepository;
import com.plantrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private PlanRepository planRepository;

    @Autowired
    private MilestoneRepository milestoneRepository;

    @Autowired
    private InitiativeRepository initiativeRepository;

    @Autowired
    private UserRepository userRepository;

    public AnalyticsDTO getUserAnalytics(Long userId) {
        // 1. Fetch all plans for the user
        List<Plan> userPlans = planRepository.findByUserUserId(userId);

        int totalPlans = userPlans.size();
        int completedPlans = 0;
        int pendingPlans = 0;

        // 2. Loop and Count
        for (Plan plan : userPlans) {
            if (plan.getStatus() == PlanStatus.COMPLETED) {
                completedPlans++;
            } else {
                pendingPlans++;
            }
        }

        // 3. Calculate Percentage (Avoid division by zero)
        double percentage = (totalPlans == 0) ? 0.0 : ((double) completedPlans / totalPlans) * 100;

        // 4. Return the Report
        return new AnalyticsDTO(totalPlans, completedPlans, pendingPlans, percentage);
    }

    public DashboardStatsDTO getDashboardStats() {
        // Get total plans
        int totalPlans = (int) planRepository.count();

        // Get active initiatives (status is IN_PROGRESS or PLANNED)
        List<Initiative> allInitiatives = initiativeRepository.findAll();
        int activeInitiatives = 0;
        for (Initiative initiative : allInitiatives) {
            String status = initiative.getStatus();
            if (status != null && (status.equals("IN_PROGRESS") || status.equals("PLANNED"))) {
                activeInitiatives++;
            }
        }

        // Get completed milestones
        List<Milestone> allMilestones = milestoneRepository.findAll();
        int completedMilestones = 0;
        for (Milestone milestone : allMilestones) {
            if (milestone.getStatus() != null && milestone.getStatus().equals("COMPLETED")) {
                completedMilestones++;
            }
        }

        // Get total users
        int totalUsers = (int) userRepository.count();

        return new DashboardStatsDTO(totalPlans, activeInitiatives, completedMilestones, totalUsers);
    }

    /**
     * Get departmental insights - analyze performance by department
     */
    public List<DepartmentalInsightsDTO> getDepartmentalInsights() {
        List<User> allUsers = userRepository.findAll();
        Map<String, List<User>> usersByDepartment = allUsers.stream()
                .filter(u -> u.getDepartment() != null && !u.getDepartment().isEmpty())
                .collect(Collectors.groupingBy(User::getDepartment));

        List<DepartmentalInsightsDTO> insights = new ArrayList<>();

        for (Map.Entry<String, List<User>> entry : usersByDepartment.entrySet()) {
            String department = entry.getKey();
            List<User> departmentUsers = entry.getValue();
            List<Long> userIds = departmentUsers.stream()
                    .map(User::getUserId)
                    .collect(Collectors.toList());

            // Get all initiatives assigned to users in this department
            List<Initiative> departmentInitiatives = initiativeRepository.findAll().stream()
                    .filter(i -> i.getAssignedUser() != null && userIds.contains(i.getAssignedUser().getUserId()))
                    .collect(Collectors.toList());

            int total = departmentInitiatives.size();
            int completed = (int) departmentInitiatives.stream()
                    .filter(i -> "COMPLETED".equalsIgnoreCase(i.getStatus()))
                    .count();
            int inProgress = (int) departmentInitiatives.stream()
                    .filter(i -> "IN_PROGRESS".equalsIgnoreCase(i.getStatus()))
                    .count();
            int planned = (int) departmentInitiatives.stream()
                    .filter(i -> "PLANNED".equalsIgnoreCase(i.getStatus()))
                    .count();

            double completionRate = total > 0 ? ((double) completed / total) * 100 : 0.0;

            // Calculate on-time delivery rate (simplified - assumes completed initiatives are on time)
            // In a real system, you'd compare due dates with completion dates
            double onTimeDeliveryRate = completed > 0 ? 85.0 : 0.0; // Placeholder

            // Count "blocked" initiatives (could be based on status or other criteria)
            int blockedCount = 0; // Placeholder - would need additional field

            // Status breakdown
            Map<String, Integer> statusBreakdown = new HashMap<>();
            statusBreakdown.put("COMPLETED", completed);
            statusBreakdown.put("IN_PROGRESS", inProgress);
            statusBreakdown.put("PLANNED", planned);

            insights.add(new DepartmentalInsightsDTO(
                    department, total, completed, inProgress, planned,
                    completionRate, onTimeDeliveryRate, blockedCount, statusBreakdown
            ));
        }

        return insights;
    }

    /**
     * Get velocity metrics for a specific user
     */
    public VelocityMetricsDTO getUserVelocity(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get all initiatives assigned to this user
        List<Initiative> userInitiatives = initiativeRepository.findAll().stream()
                .filter(i -> i.getAssignedUser() != null && i.getAssignedUser().getUserId().equals(userId))
                .collect(Collectors.toList());

        int tasksAssigned = userInitiatives.size();
        int tasksCompleted = (int) userInitiatives.stream()
                .filter(i -> "COMPLETED".equalsIgnoreCase(i.getStatus()))
                .count();

        double completionRate = tasksAssigned > 0 ? ((double) tasksCompleted / tasksAssigned) * 100 : 0.0;

        // Weekly velocity (simplified - would need createdDate/completedDate in real system)
        Map<LocalDate, Integer> weeklyVelocity = new HashMap<>();
        LocalDate now = LocalDate.now();
        for (int i = 0; i < 8; i++) {
            LocalDate weekStart = now.minusWeeks(i).with(java.time.DayOfWeek.MONDAY);
            weeklyVelocity.put(weekStart, 0); // Placeholder
        }

        // Monthly velocity
        Map<String, Integer> monthlyVelocity = new HashMap<>();
        for (int i = 0; i < 6; i++) {
            LocalDate monthStart = now.minusMonths(i).withDayOfMonth(1);
            String monthKey = monthStart.getYear() + "-" + String.format("%02d", monthStart.getMonthValue());
            monthlyVelocity.put(monthKey, 0); // Placeholder
        }

        // Calculate averages (simplified)
        double averageTasksPerWeek = tasksCompleted / 8.0; // Over last 8 weeks
        double averageTasksPerMonth = tasksCompleted / 6.0; // Over last 6 months

        return new VelocityMetricsDTO(
                userId, user.getName(), user.getDepartment(),
                tasksAssigned, tasksCompleted, completionRate,
                weeklyVelocity, monthlyVelocity,
                averageTasksPerWeek, averageTasksPerMonth
        );
    }

    /**
     * Get velocity metrics for all users (team performance)
     */
    public List<VelocityMetricsDTO> getAllUsersVelocity() {
        List<User> allUsers = userRepository.findAll();
        return allUsers.stream()
                .map(u -> getUserVelocity(u.getUserId()))
                .collect(Collectors.toList());
    }
}