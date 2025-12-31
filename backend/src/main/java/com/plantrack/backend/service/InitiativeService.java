package com.plantrack.backend.service;

import com.plantrack.backend.model.AuditLog;
import com.plantrack.backend.model.Initiative;
import com.plantrack.backend.model.Milestone;
import com.plantrack.backend.model.User;
import com.plantrack.backend.repository.AuditLogRepository;
import com.plantrack.backend.repository.InitiativeRepository;
import com.plantrack.backend.repository.MilestoneRepository;
import com.plantrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
    private AuditLogRepository auditLogRepository;

    // 1. Create Initiative
    public Initiative createInitiative(Long milestoneId, Long assignedUserId, Initiative initiative) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        User user = userRepository.findById(assignedUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        initiative.setMilestone(milestone);
        initiative.setAssignedUser(user);
        
        Initiative savedInitiative = initiativeRepository.save(initiative);

        // TRIGGER: Recalculate Progress immediately after adding a new task
        updateMilestoneProgress(milestone);

        return savedInitiative;
    }

public Initiative updateInitiative(Long id, Initiative updatedData) {
        Initiative initiative = initiativeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Initiative not found"));

        String oldStatus = initiative.getStatus();
        
        initiative.setTitle(updatedData.getTitle());
        initiative.setStatus(updatedData.getStatus());
        
        Initiative savedInitiative = initiativeRepository.save(initiative);

        if (!oldStatus.equals(updatedData.getStatus())) {
            String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
            String logMessage = "Initiative ID " + id + ": Status changed from " + oldStatus + " to " + updatedData.getStatus();
            
            AuditLog log = new AuditLog("UPDATE_STATUS", currentUser, logMessage);
            auditLogRepository.save(log);
        }

        updateMilestoneProgress(initiative.getMilestone());
        return savedInitiative;
    }

    // 3. Get Initiatives
    public List<Initiative> getInitiativesByMilestone(Long milestoneId) {
        return initiativeRepository.findByMilestoneMilestoneId(milestoneId);
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