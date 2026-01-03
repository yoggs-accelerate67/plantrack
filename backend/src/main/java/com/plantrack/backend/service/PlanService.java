package com.plantrack.backend.service;

import com.plantrack.backend.model.Initiative;
import com.plantrack.backend.model.Milestone;
import com.plantrack.backend.model.Plan;
import com.plantrack.backend.model.User;
import com.plantrack.backend.repository.InitiativeRepository;
import com.plantrack.backend.repository.MilestoneRepository;
import com.plantrack.backend.repository.PlanRepository;
import com.plantrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PlanService {

    @Autowired
    private PlanRepository planRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MilestoneRepository milestoneRepository;

    @Autowired
    private InitiativeRepository initiativeRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditService auditService;

    private static final String STATUS_CANCELLED = "CANCELLED";

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

        // Audit Log
        auditService.logCreate("PLAN", savedPlan.getPlanId(), 
            "Created plan: " + savedPlan.getTitle() + " (Priority: " + savedPlan.getPriority() + ")");

        // --- TRIGGER NOTIFICATION ---
        // Automatically alert the user that a plan was assigned
        try {
            notificationService.createNotification(
                userId, 
                "INFO", 
                "New Plan Created: '" + savedPlan.getTitle() + "'.",
                "PLAN",
                savedPlan.getPlanId()
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
        
        String oldStatus = plan.getStatus() != null ? plan.getStatus().toString() : null;
        String oldPriority = plan.getPriority() != null ? plan.getPriority().toString() : null;
        
        plan.setTitle(planDetails.getTitle());
        plan.setDescription(planDetails.getDescription());
        plan.setPriority(planDetails.getPriority());
        plan.setStatus(planDetails.getStatus());
        plan.setStartDate(planDetails.getStartDate());
        plan.setEndDate(planDetails.getEndDate());
        
        Plan savedPlan = planRepository.save(plan);

        // Audit Log
        if (planDetails.getStatus() != null && oldStatus != null && !oldStatus.equals(planDetails.getStatus().toString())) {
            auditService.logStatusChange("PLAN", planId, oldStatus, planDetails.getStatus().toString(),
                "Plan '" + savedPlan.getTitle() + "' status changed from " + oldStatus + " to " + planDetails.getStatus());
        } else {
            auditService.logUpdate("PLAN", planId, "Updated plan: " + savedPlan.getTitle());
        }
        
        return savedPlan;
    }

    /**
     * Cancel a plan and cascade cancellation to all child milestones and initiatives
     * @return Map containing affected counts for confirmation
     */
    @Transactional
    public Map<String, Object> cancelPlanWithCascade(Long planId, Long userId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + planId));
        
        if (STATUS_CANCELLED.equals(plan.getStatus() != null ? plan.getStatus().toString() : null)) {
            throw new RuntimeException("Plan is already cancelled");
        }

        String oldStatus = plan.getStatus() != null ? plan.getStatus().toString() : "PLANNED";
        
        // Get all milestones and initiatives for cascade
        List<Milestone> milestones = plan.getMilestones();
        int milestoneCancelledCount = 0;
        int initiativeCancelledCount = 0;
        List<Long> notifiedUserIds = new ArrayList<>();

        // Cascade to milestones and their initiatives
        for (Milestone milestone : milestones) {
            if (!STATUS_CANCELLED.equals(milestone.getStatus())) {
                String oldMilestoneStatus = milestone.getStatus();
                milestone.setStatus(STATUS_CANCELLED);
                milestoneRepository.save(milestone);
                milestoneCancelledCount++;
                
                // Audit log for milestone
                auditService.logStatusChange("MILESTONE", milestone.getMilestoneId(), 
                    oldMilestoneStatus, STATUS_CANCELLED,
                    "Milestone '" + milestone.getTitle() + "' cancelled (cascade from plan cancellation)");
            }
            
            // Cascade to initiatives
            for (Initiative initiative : milestone.getInitiatives()) {
                if (!STATUS_CANCELLED.equals(initiative.getStatus())) {
                    String oldInitiativeStatus = initiative.getStatus();
                    initiative.setStatus(STATUS_CANCELLED);
                    initiativeRepository.save(initiative);
                    initiativeCancelledCount++;
                    
                    // Audit log for initiative
                    auditService.logStatusChange("INITIATIVE", initiative.getInitiativeId(),
                        oldInitiativeStatus, STATUS_CANCELLED,
                        "Initiative '" + initiative.getTitle() + "' cancelled (cascade from plan cancellation)");
                    
                    // Collect user IDs for notification
                    if (initiative.getAssignedUsers() != null) {
                        for (User user : initiative.getAssignedUsers()) {
                            if (!notifiedUserIds.contains(user.getUserId())) {
                                notifiedUserIds.add(user.getUserId());
                            }
                        }
                    }
                }
            }
        }

        // Cancel the plan itself
        plan.setStatus(com.plantrack.backend.model.PlanStatus.CANCELLED);
        planRepository.save(plan);
        
        // Audit log for plan
        auditService.logStatusChange("PLAN", planId, oldStatus, STATUS_CANCELLED,
            "Plan '" + plan.getTitle() + "' cancelled with cascade (" + 
            milestoneCancelledCount + " milestones, " + initiativeCancelledCount + " initiatives affected)");

        // Send notifications to all affected users
        for (Long notifyUserId : notifiedUserIds) {
            try {
                notificationService.createNotification(
                    notifyUserId,
                    "WARNING",
                    "Plan '" + plan.getTitle() + "' has been cancelled. All your assigned initiatives under this plan are now cancelled.",
                    "PLAN",
                    planId
                );
            } catch (Exception e) {
                System.err.println("Failed to send cancellation notification to user " + notifyUserId + ": " + e.getMessage());
            }
        }

        // Notify plan owner
        if (plan.getUser() != null && !notifiedUserIds.contains(plan.getUser().getUserId())) {
            try {
                notificationService.createNotification(
                    plan.getUser().getUserId(),
                    "WARNING",
                    "Your plan '" + plan.getTitle() + "' has been cancelled.",
                    "PLAN",
                    planId
                );
            } catch (Exception e) {
                System.err.println("Failed to send cancellation notification to plan owner: " + e.getMessage());
            }
        }

        // Return summary
        Map<String, Object> result = new HashMap<>();
        result.put("planId", planId);
        result.put("planTitle", plan.getTitle());
        result.put("milestonesAffected", milestoneCancelledCount);
        result.put("initiativesAffected", initiativeCancelledCount);
        result.put("usersNotified", notifiedUserIds.size());
        return result;
    }

    /**
     * Get cascade cancellation preview (counts of affected entities)
     */
    public Map<String, Object> getCancelCascadePreview(Long planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + planId));

        List<Milestone> milestones = plan.getMilestones();
        int activeMilestones = 0;
        int activeInitiatives = 0;
        List<String> milestoneNames = new ArrayList<>();
        List<String> initiativeNames = new ArrayList<>();

        for (Milestone milestone : milestones) {
            if (!STATUS_CANCELLED.equals(milestone.getStatus())) {
                activeMilestones++;
                milestoneNames.add(milestone.getTitle());
            }
            for (Initiative initiative : milestone.getInitiatives()) {
                if (!STATUS_CANCELLED.equals(initiative.getStatus())) {
                    activeInitiatives++;
                    initiativeNames.add(initiative.getTitle());
                }
            }
        }

        Map<String, Object> preview = new HashMap<>();
        preview.put("planId", planId);
        preview.put("planTitle", plan.getTitle());
        preview.put("planStatus", plan.getStatus() != null ? plan.getStatus().toString() : null);
        preview.put("milestonesCount", activeMilestones);
        preview.put("initiativesCount", activeInitiatives);
        preview.put("milestoneNames", milestoneNames);
        preview.put("initiativeNames", initiativeNames);
        preview.put("isAlreadyCancelled", STATUS_CANCELLED.equals(plan.getStatus() != null ? plan.getStatus().toString() : null));
        return preview;
    }

    // 6. Logic to Delete Plan
    public void deletePlan(Long planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + planId));
        
        String planTitle = plan.getTitle();
        planRepository.deleteById(planId);
        
        // Audit Log
        auditService.logDelete("PLAN", planId, "Deleted plan: " + planTitle);
    }

    // 7. Get Plans that contain initiatives assigned to a specific user (for Employees)
    public List<Plan> getPlansWithAssignedInitiatives(Long userId) {
        // Use custom query with JOINs to efficiently find plans with assigned initiatives
        return planRepository.findPlansWithAssignedInitiatives(userId);
    }
}