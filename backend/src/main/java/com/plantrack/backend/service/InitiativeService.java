package com.plantrack.backend.service;

import com.plantrack.backend.model.Initiative;
import com.plantrack.backend.model.Milestone;
import com.plantrack.backend.model.User;
import com.plantrack.backend.repository.AuditLogRepository;
import com.plantrack.backend.repository.InitiativeRepository;
import com.plantrack.backend.repository.MilestoneRepository;
import com.plantrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InitiativeService {

    @Autowired
    private InitiativeRepository initiativeRepository;

    @Autowired
    private MilestoneRepository milestoneRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditService auditService;

    @Autowired
    private NotificationService notificationService;

    // 1. Create Initiative
    public Initiative createInitiative(Long milestoneId, Long assignedUserId, Initiative initiative) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        User user = userRepository.findById(assignedUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        initiative.setMilestone(milestone);
        initiative.setAssignedUser(user);
        
        Initiative savedInitiative = initiativeRepository.save(initiative);

        // Audit Log
        auditService.logCreate("INITIATIVE", savedInitiative.getInitiativeId(), 
            "Created initiative: " + savedInitiative.getTitle() + " in milestone: " + milestone.getTitle());

        // Notify Employee
        try {
            notificationService.notifyInitiativeAssigned(
                assignedUserId,
                savedInitiative.getTitle(),
                savedInitiative.getInitiativeId()
            );
            System.out.println("Notification sent to employee " + assignedUserId + " for initiative: " + savedInitiative.getTitle());
        } catch (Exception e) {
            System.err.println("Failed to send notification to employee " + assignedUserId + ": " + e.getMessage());
            e.printStackTrace();
        }

        // TRIGGER: Recalculate Progress immediately after adding a new task
        updateMilestoneProgress(milestone);

        return savedInitiative;
    }

public Initiative updateInitiative(Long id, Initiative updatedData) {
        Initiative initiative = initiativeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Initiative not found"));

        String oldStatus = initiative.getStatus();

        // Security check: Employees can only update their own assigned initiatives
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isEmployee = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_EMPLOYEE"));
        
        if (isEmployee && initiative.getAssignedUser() != null) {
            // Get current user ID from authentication (assuming email is stored)
            String currentUserEmail = auth.getName();
            User currentUser = userRepository.findByEmail(currentUserEmail)
                    .orElseThrow(() -> new RuntimeException("Current user not found: " + currentUserEmail));
            
            // Check if the initiative is assigned to the current user
            if (!initiative.getAssignedUser().getUserId().equals(currentUser.getUserId())) {
                throw new RuntimeException("You can only update initiatives assigned to you");
            }
            
            // Employees can only update status, not title, description, or assigned user
            if (updatedData.getStatus() != null) {
                initiative.setStatus(updatedData.getStatus());
            }
        } else {
            // Managers and Admins can update all fields
            if (updatedData.getTitle() != null && !updatedData.getTitle().isEmpty()) {
                initiative.setTitle(updatedData.getTitle());
            }
            // Description can be null or empty, so always update it
            initiative.setDescription(updatedData.getDescription());
            if (updatedData.getStatus() != null) {
                initiative.setStatus(updatedData.getStatus());
            }
            
            // Update assigned user if provided (only Managers/Admins)
            if (updatedData.getAssignedUser() != null && updatedData.getAssignedUser().getUserId() != null) {
                User newUser = userRepository.findById(updatedData.getAssignedUser().getUserId())
                        .orElseThrow(() -> new RuntimeException("User not found"));
                initiative.setAssignedUser(newUser);
            }
        }
        
        Initiative savedInitiative = initiativeRepository.save(initiative);

        // Audit Log - Status change
        if (updatedData.getStatus() != null && !oldStatus.equals(updatedData.getStatus())) {
            auditService.logStatusChange("INITIATIVE", id, oldStatus, updatedData.getStatus(),
                "Initiative '" + savedInitiative.getTitle() + "' status changed from " + oldStatus + " to " + updatedData.getStatus());

            // Notify Manager if employee updated status
            if (isEmployee) {
                try {
                    // Reload initiative with relationships to ensure milestone and plan are loaded
                    Initiative initiativeWithRelations = initiativeRepository.findById(id)
                            .orElseThrow(() -> new RuntimeException("Initiative not found after save"));
                    
                    Milestone milestone = initiativeWithRelations.getMilestone();
                    if (milestone != null) {
                        // Reload milestone with plan relationship
                        Milestone milestoneWithPlan = milestoneRepository.findById(milestone.getMilestoneId())
                                .orElseThrow(() -> new RuntimeException("Milestone not found"));
                        
                        if (milestoneWithPlan.getPlan() != null) {
                            User planOwner = milestoneWithPlan.getPlan().getUser();
                            if (planOwner != null) {
                                String currentUserEmail = auth.getName();
                                User currentUserObj = userRepository.findByEmail(currentUserEmail)
                                        .orElseThrow(() -> new RuntimeException("Current user not found: " + currentUserEmail));
                                String employeeName = currentUserObj.getName();
                                notificationService.notifyStatusUpdate(
                                    planOwner.getUserId(),
                                    employeeName,
                                    savedInitiative.getTitle(),
                                    updatedData.getStatus(),
                                    id
                                );
                                System.out.println("Notification sent to manager " + planOwner.getUserId() + " (" + planOwner.getEmail() + ") for status update by " + employeeName + " (" + currentUserEmail + ")");
                            } else {
                                System.err.println("Plan owner is null for initiative " + id);
                            }
                        } else {
                            System.err.println("Plan is null for milestone " + milestoneWithPlan.getMilestoneId());
                        }
                    } else {
                        System.err.println("Milestone is null for initiative " + id);
                    }
                } catch (Exception e) {
                    System.err.println("Failed to notify manager: " + e.getMessage());
                    e.printStackTrace();
                }
            }
        }

        // Audit Log - General update
        if (updatedData.getTitle() != null || updatedData.getDescription() != null) {
            auditService.logUpdate("INITIATIVE", id, "Updated initiative: " + savedInitiative.getTitle());
        }

        // Audit Log - Assignment change
        if (updatedData.getAssignedUser() != null && updatedData.getAssignedUser().getUserId() != null) {
            User oldAssignee = initiative.getAssignedUser();
            if (oldAssignee == null || !oldAssignee.getUserId().equals(updatedData.getAssignedUser().getUserId())) {
                User newAssignee = userRepository.findById(updatedData.getAssignedUser().getUserId())
                        .orElseThrow(() -> new RuntimeException("User not found"));
                auditService.logUpdate("INITIATIVE", id, 
                    "Reassigned initiative from " + (oldAssignee != null ? oldAssignee.getName() : "Unassigned") + 
                    " to " + newAssignee.getName());

                // Notify new assignee
                try {
                    notificationService.notifyInitiativeAssigned(
                        newAssignee.getUserId(),
                        savedInitiative.getTitle(),
                        id
                    );
                } catch (Exception e) {
                    System.err.println("Failed to notify new assignee: " + e.getMessage());
                }
            }
        }

        updateMilestoneProgress(initiative.getMilestone());
        return savedInitiative;
    }

    // 3. Get Initiatives
    public List<Initiative> getInitiativesByMilestone(Long milestoneId) {
        return initiativeRepository.findByMilestoneMilestoneId(milestoneId);
    }

    // 4. Get Initiatives assigned to a user
    public List<Initiative> getInitiativesByUser(Long userId) {
        System.out.println("InitiativeService: Fetching initiatives for userId: " + userId);
        List<Initiative> initiatives = initiativeRepository.findByAssignedUserUserId(userId);
        System.out.println("InitiativeService: Found " + initiatives.size() + " initiatives");
        if (!initiatives.isEmpty()) {
            System.out.println("First initiative milestone: " + (initiatives.get(0).getMilestone() != null ? initiatives.get(0).getMilestone().getTitle() : "null"));
        }
        return initiatives;
    }

    // --- AUTOMATION LOGIC ---
    private void updateMilestoneProgress(Milestone milestone) {
        // Fetch all sibling initiatives
        List<Initiative> initiatives = initiativeRepository.findByMilestoneMilestoneId(milestone.getMilestoneId());

        if (initiatives.isEmpty()) {
            milestone.setCompletionPercent(0.0);
            milestone.setStatus("PLANNED");
        } else {
            long completedCount = initiatives.stream()
                    .filter(i -> "COMPLETED".equalsIgnoreCase(i.getStatus()))
                    .count();

            double percent = ((double) completedCount / initiatives.size()) * 100;
            milestone.setCompletionPercent(percent);

            // Auto-update Milestone Status based on %
            if (percent == 100.0) {
                milestone.setStatus("COMPLETED");
            } else if (percent > 0) {
                milestone.setStatus("IN_PROGRESS");
            } else {
                milestone.setStatus("PLANNED");
            }
        }
        
        // Save the updated Milestone stats
        milestoneRepository.save(milestone);
    }
}