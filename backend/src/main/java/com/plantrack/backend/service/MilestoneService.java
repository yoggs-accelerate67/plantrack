package com.plantrack.backend.service;

import com.plantrack.backend.model.Milestone;
import com.plantrack.backend.model.Plan;
import com.plantrack.backend.repository.MilestoneRepository;
import com.plantrack.backend.repository.PlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MilestoneService {

    @Autowired
    private MilestoneRepository milestoneRepository;

    @Autowired
    private PlanRepository planRepository;

    @Autowired
    private AuditService auditService;

    public Milestone createMilestone(Long planId, Milestone milestone) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan (Goal) not found with id: " + planId));
        
        milestone.setPlan(plan);
        Milestone savedMilestone = milestoneRepository.save(milestone);
        
        // Audit Log
        auditService.logCreate("MILESTONE", savedMilestone.getMilestoneId(),
            "Created milestone: " + savedMilestone.getTitle() + " in plan: " + plan.getTitle());
        
        return savedMilestone;
    }

    public List<Milestone> getMilestonesByPlan(Long planId) {
        return milestoneRepository.findByPlanPlanId(planId);
    }

    public Milestone updateMilestone(Long milestoneId, Milestone details) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));
        
        String oldStatus = milestone.getStatus();
        
        milestone.setTitle(details.getTitle());
        milestone.setDueDate(details.getDueDate());
        milestone.setCompletionPercent(details.getCompletionPercent());
        milestone.setStatus(details.getStatus());
        
        Milestone savedMilestone = milestoneRepository.save(milestone);
        
        // Audit Log
        if (details.getStatus() != null && oldStatus != null && !oldStatus.equals(details.getStatus())) {
            auditService.logStatusChange("MILESTONE", milestoneId, oldStatus, details.getStatus(),
                "Milestone '" + savedMilestone.getTitle() + "' status changed from " + oldStatus + " to " + details.getStatus());
        } else {
            auditService.logUpdate("MILESTONE", milestoneId, "Updated milestone: " + savedMilestone.getTitle());
        }
        
        return savedMilestone;
    }

    public void deleteMilestone(Long milestoneId) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));
        
        String milestoneTitle = milestone.getTitle();
        milestoneRepository.deleteById(milestoneId);
        
        // Audit Log
        auditService.logDelete("MILESTONE", milestoneId, "Deleted milestone: " + milestoneTitle);
    }
}