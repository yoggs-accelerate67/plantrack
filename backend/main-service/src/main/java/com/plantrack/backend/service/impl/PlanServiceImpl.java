package com.plantrack.backend.service.impl;

import com.plantrack.backend.dto.CreateNotificationRequest;
import com.plantrack.backend.feign.NotificationService;
import com.plantrack.backend.model.Initiative;
import com.plantrack.backend.model.Milestone;
import com.plantrack.backend.model.Plan;
import com.plantrack.backend.model.Role;
import com.plantrack.backend.model.User;
import com.plantrack.backend.repository.InitiativeRepository;
import com.plantrack.backend.repository.MilestoneRepository;
import com.plantrack.backend.repository.PlanRepository;
import com.plantrack.backend.repository.UserRepository;
import com.plantrack.backend.service.PlanService;
import com.plantrack.backend.service.AuditService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PlanServiceImpl implements PlanService {

    private static final Logger logger = LoggerFactory.getLogger(PlanService.class);
    private static final String STATUS_CANCELLED = "CANCELLED";
    
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

    // --- SECURITY HELPER METHOD ---
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        String email = authentication.getName(); // The JWT filter sets the email as the principal name
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database: " + email));
    }

    // 1. Logic to Create a Plan linked to a User + Trigger Notification
    public Plan createPlan(Long userId, Plan plan) {
        User currentUser = getCurrentUser();
        
        // Security Check: Manager can only create plans for themselves
        if (Role.MANAGER.name().equals(currentUser.getRole()) && !userId.equals(currentUser.getUserId())) {
            logger.error("Security Violation: Manager {} tried to create a plan for user {}", currentUser.getUserId(), userId);
            throw new RuntimeException("Access Denied: Managers can only create plans for themselves.");
        }

        logger.debug("Creating plan: userId={}, title={}, priority={}", userId, plan.getTitle(), plan.getPriority());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        plan.setUser(user);

        if (plan.getStartDate() == null) {
            plan.setStartDate(LocalDateTime.now());
        }

        Plan savedPlan = planRepository.save(plan);
        auditService.logCreate("PLAN", savedPlan.getPlanId(), "Created plan: " + savedPlan.getTitle() + " (Priority: " + savedPlan.getPriority() + ")");

        try {
            notificationService.createNotification(
                    new CreateNotificationRequest(userId, "INFO", "New Plan Created: '" + savedPlan.getTitle() + "'.", "PLAN", savedPlan.getPlanId())
            );
        } catch (Exception e) {
            logger.error("Failed to create notification for plan creation: userId={}, planId={}", userId, savedPlan.getPlanId(), e);
        }

        return savedPlan;
    }

    // 2. Logic to Get All Plans with Pagination (Secured View)
    public Page<Plan> getAllPlans(Pageable pageable) {
        User currentUser = getCurrentUser();
        logger.debug("Fetching all plans with pagination for user: {} (Role: {})", currentUser.getEmail(), currentUser.getRole());
        
        // Security Routing: Admins see everything, Managers see ONLY their own
        if (Role.ADMIN.name().equals(currentUser.getRole())) {
            return planRepository.findAll(pageable);
        } else {
            return planRepository.findByUserUserId(currentUser.getUserId(), pageable);
        }
    }

    // 3. Logic to Get Plans by User ID
    public List<Plan> getPlansByUserId(Long userId) {
        User currentUser = getCurrentUser();
        
        // Security Check: Manager cannot fetch the list of plans belonging to another user
        if (Role.MANAGER.name().equals(currentUser.getRole()) && !userId.equals(currentUser.getUserId())) {
            throw new RuntimeException("Access Denied: You cannot view plans owned by another user.");
        }
        
        return planRepository.findByUserUserId(userId);
    }

    // 4. Logic to Get Plan by ID
    public Plan getPlanById(Long planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + planId));
                
        User currentUser = getCurrentUser();
        
        // Security Check: Manager cannot read someone else's plan
        if (Role.MANAGER.name().equals(currentUser.getRole()) && !plan.getUser().getUserId().equals(currentUser.getUserId())) {
            logger.error("Security Violation: Manager {} tried to read plan {} owned by {}", currentUser.getUserId(), planId, plan.getUser().getUserId());
            throw new RuntimeException("Access Denied: You do not have permission to view this plan.");
        }
        
        return plan;
    }

    // 5. Logic to Update Plan
    public Plan updatePlan(Long planId, Plan planDetails) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + planId));

        User currentUser = getCurrentUser();
        
        // Security Check: Manager cannot update someone else's plan
        if (Role.MANAGER.name().equals(currentUser.getRole()) && !plan.getUser().getUserId().equals(currentUser.getUserId())) {
            logger.error("Security Violation: Manager {} tried to update plan {} owned by {}", currentUser.getUserId(), planId, plan.getUser().getUserId());
            throw new RuntimeException("Access Denied: You can only update your own plans.");
        }

        String oldStatus = plan.getStatus() != null ? plan.getStatus().toString() : null;

        plan.setTitle(planDetails.getTitle());
        plan.setDescription(planDetails.getDescription());
        plan.setPriority(planDetails.getPriority());
        plan.setStatus(planDetails.getStatus());
        plan.setStartDate(planDetails.getStartDate());
        plan.setEndDate(planDetails.getEndDate());

        Plan savedPlan = planRepository.save(plan);

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
     */
    @Transactional
    public Map<String, Object> cancelPlanWithCascade(Long planId, Long userId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + planId));

        User currentUser = getCurrentUser();
        
        // Security Check: Manager cannot cancel someone else's plan
        if (Role.MANAGER.name().equals(currentUser.getRole()) && !plan.getUser().getUserId().equals(currentUser.getUserId())) {
            logger.error("Security Violation: Manager {} tried to cancel plan {} owned by {}", currentUser.getUserId(), planId, plan.getUser().getUserId());
            throw new RuntimeException("Access Denied: You can only cancel your own plans.");
        }

        if (STATUS_CANCELLED.equals(plan.getStatus() != null ? plan.getStatus().toString() : null)) {
            throw new RuntimeException("Plan is already cancelled");
        }

        String oldStatus = plan.getStatus() != null ? plan.getStatus().toString() : "PLANNED";

        List<Milestone> milestones = plan.getMilestones();
        int milestoneCancelledCount = 0;
        int initiativeCancelledCount = 0;
        List<Long> notifiedUserIds = new ArrayList<>();

        for (Milestone milestone : milestones) {
            if (!STATUS_CANCELLED.equals(milestone.getStatus())) {
                String oldMilestoneStatus = milestone.getStatus();
                milestone.setStatus(STATUS_CANCELLED);
                milestoneRepository.save(milestone);
                milestoneCancelledCount++;

                auditService.logStatusChange("MILESTONE", milestone.getMilestoneId(), oldMilestoneStatus, STATUS_CANCELLED,
                        "Milestone '" + milestone.getTitle() + "' cancelled (cascade from plan cancellation)");
            }

            for (Initiative initiative : milestone.getInitiatives()) {
                if (!STATUS_CANCELLED.equals(initiative.getStatus())) {
                    String oldInitiativeStatus = initiative.getStatus();
                    initiative.setStatus(STATUS_CANCELLED);
                    initiativeRepository.save(initiative);
                    initiativeCancelledCount++;

                    auditService.logStatusChange("INITIATIVE", initiative.getInitiativeId(), oldInitiativeStatus, STATUS_CANCELLED,
                            "Initiative '" + initiative.getTitle() + "' cancelled (cascade from plan cancellation)");

                    if (initiative.getAssignedUsers() != null) {
                        for (User u : initiative.getAssignedUsers()) {
                            if (!notifiedUserIds.contains(u.getUserId())) {
                                notifiedUserIds.add(u.getUserId());
                            }
                        }
                    }
                }
            }
        }

        plan.setStatus(com.plantrack.backend.model.PlanStatus.CANCELLED);
        planRepository.save(plan);

        auditService.logStatusChange("PLAN", planId, oldStatus, STATUS_CANCELLED,
                "Plan '" + plan.getTitle() + "' cancelled with cascade (" + milestoneCancelledCount + " milestones, " + initiativeCancelledCount + " initiatives affected)");

        for (Long notifyUserId : notifiedUserIds) {
            try {
                notificationService.createNotification(
                        new CreateNotificationRequest(notifyUserId, "WARNING", "Plan '" + plan.getTitle() + "' has been cancelled. All your assigned initiatives under this plan are now cancelled.", "PLAN", planId)
                );
            } catch (Exception e) {
                logger.error("Failed to send cancellation notification", e);
            }
        }

        if (plan.getUser() != null && !notifiedUserIds.contains(plan.getUser().getUserId())) {
            try {
                notificationService.createNotification(
                        new CreateNotificationRequest(plan.getUser().getUserId(), "WARNING", "Your plan '" + plan.getTitle() + "' has been cancelled.", "PLAN", planId)
                );
            } catch (Exception e) {
                logger.error("Failed to send owner cancellation notification", e);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("planId", planId);
        result.put("planTitle", plan.getTitle());
        result.put("milestonesAffected", milestoneCancelledCount);
        result.put("initiativesAffected", initiativeCancelledCount);
        result.put("usersNotified", notifiedUserIds.size());

        return result;
    }

    /**
     * Get cascade cancellation preview
     */
    public Map<String, Object> getCancelCascadePreview(Long planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + planId));
                
        User currentUser = getCurrentUser();
        
        // Security Check: Manager cannot preview someone else's cancellation
        if (Role.MANAGER.name().equals(currentUser.getRole()) && !plan.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Access Denied: You can only view cancellation previews for your own plans.");
        }

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

        User currentUser = getCurrentUser();
        
        // Security Check: Manager cannot delete someone else's plan
        if (Role.MANAGER.name().equals(currentUser.getRole()) && !plan.getUser().getUserId().equals(currentUser.getUserId())) {
            logger.error("Security Violation: Manager {} tried to delete plan {} owned by {}", currentUser.getUserId(), planId, plan.getUser().getUserId());
            throw new RuntimeException("Access Denied: You can only delete your own plans.");
        }

        String planTitle = plan.getTitle();
        planRepository.deleteById(planId);

        auditService.logDelete("PLAN", planId, "Deleted plan: " + planTitle);
    }

    // 7. Get Plans that contain initiatives assigned to a specific user (for Employees)
    public List<Plan> getPlansWithAssignedInitiatives(Long userId) {
        return planRepository.findPlansWithAssignedInitiatives(userId);
    }
}