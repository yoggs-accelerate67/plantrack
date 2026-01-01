package com.plantrack.backend.service;

import com.plantrack.backend.dto.DashboardStatsDTO;
import com.plantrack.backend.model.AnalyticsDTO;
import com.plantrack.backend.model.Initiative;
import com.plantrack.backend.model.Milestone;
import com.plantrack.backend.model.Plan;
import com.plantrack.backend.model.PlanStatus;
import com.plantrack.backend.repository.InitiativeRepository;
import com.plantrack.backend.repository.MilestoneRepository;
import com.plantrack.backend.repository.PlanRepository;
import com.plantrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
}