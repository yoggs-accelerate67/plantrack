package com.plantrack.backend.service;

import com.plantrack.backend.model.Plan;
import com.plantrack.backend.model.User;
import com.plantrack.backend.repository.PlanRepository;
import com.plantrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PlanService {

    @Autowired
    private PlanRepository planRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    // 1. Logic to Create a Plan linked to a User + Trigger Notification
    public Plan createPlan(Long userId, Plan plan) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        plan.setUser(user);

        // Set default start date if missing
        if (plan.getStartDate() == null) {
            plan.setStartDate(LocalDateTime.now());
        }
        
        Plan savedPlan = planRepository.save(plan);

        // --- TRIGGER NOTIFICATION ---
        // Automatically alert the user that a plan was assigned
        try {
            notificationService.createNotification(
                userId, 
                "INFO", 
                "New Plan Created: '" + savedPlan.getTitle() + "'."
            );
        } catch (Exception e) {
            // Don't fail plan creation if notification fails
            System.err.println("Failed to create notification: " + e.getMessage());
        }
        
        return savedPlan;
    }

    // 2. Logic to Get All Plans with Pagination
    public Page<Plan> getAllPlans(Pageable pageable) {
        return planRepository.findAll(pageable);
    }

    // 3. Logic to Get Plans by User ID
    public List<Plan> getPlansByUserId(Long userId) {
        return planRepository.findByUserUserId(userId);
    }

    // 4. Logic to Get Plan by ID
    public Plan getPlanById(Long planId) {
        return planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + planId));
    }

    // 5. Logic to Update Plan
    public Plan updatePlan(Long planId, Plan planDetails) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + planId));
        
        plan.setTitle(planDetails.getTitle());
        plan.setDescription(planDetails.getDescription());
        plan.setPriority(planDetails.getPriority());
        plan.setStatus(planDetails.getStatus());
        plan.setStartDate(planDetails.getStartDate());
        plan.setEndDate(planDetails.getEndDate());
        
        return planRepository.save(plan);
    }

    // 6. Logic to Delete Plan
    public void deletePlan(Long planId) {
        planRepository.deleteById(planId);
    }

    // 7. Get Plans that contain initiatives assigned to a specific user (for Employees)
    public List<Plan> getPlansWithAssignedInitiatives(Long userId) {
        // Use custom query with JOINs to efficiently find plans with assigned initiatives
        return planRepository.findPlansWithAssignedInitiatives(userId);
    }
}