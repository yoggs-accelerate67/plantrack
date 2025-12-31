package com.plantrack.backend.service;

import com.plantrack.backend.dto.DashboardStatsDTO;
import com.plantrack.backend.model.Plan;
import com.plantrack.backend.model.PlanStatus;
import com.plantrack.backend.repository.PlanRepository;
import com.plantrack.backend.repository.InitiativeRepository;
import com.plantrack.backend.repository.MilestoneRepository;
import com.plantrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsService {

    @Autowired
    private PlanRepository planRepository;

    @Autowired
    private InitiativeRepository initiativeRepository;

    @Autowired
    private MilestoneRepository milestoneRepository;

    @Autowired
    private UserRepository userRepository;

    public DashboardStatsDTO getDashboardStats() {
        Long totalPlans = planRepository.count();
        Long activeInitiatives = initiativeRepository.findAll().stream()
                .filter(i -> "IN_PROGRESS".equalsIgnoreCase(i.getStatus()))
                .count();
        Long completedMilestones = milestoneRepository.findAll().stream()
                .filter(m -> "COMPLETED".equalsIgnoreCase(m.getStatus()))
                .count();
        Long totalUsers = userRepository.count();

        return new DashboardStatsDTO(totalPlans, activeInitiatives, completedMilestones, totalUsers);
    }

    public DashboardStatsDTO getUserAnalytics(Long userId) {
        List<Plan> userPlans = planRepository.findByUserUserId(userId);
        Long totalPlans = (long) userPlans.size();
        
        Long activeInitiatives = initiativeRepository.findByAssignedUserUserId(userId).stream()
                .filter(i -> "IN_PROGRESS".equalsIgnoreCase(i.getStatus()))
                .count();
        
        // Get milestones for user's plans
        Long completedMilestones = userPlans.stream()
                .flatMap(plan -> milestoneRepository.findByPlanPlanId(plan.getPlanId()).stream())
                .filter(m -> "COMPLETED".equalsIgnoreCase(m.getStatus()))
                .count();

        return new DashboardStatsDTO(totalPlans, activeInitiatives, completedMilestones, 1L);
    }
}