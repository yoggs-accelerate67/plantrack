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

    public Milestone createMilestone(Long planId, Milestone milestone) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan (Goal) not found with id: " + planId));
        
        milestone.setPlan(plan);
        return milestoneRepository.save(milestone);
    }

    public List<Milestone> getMilestonesByPlan(Long planId) {
        return milestoneRepository.findByPlanPlanId(planId);
    }

    public Milestone updateMilestone(Long milestoneId, Milestone details) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));
        
        milestone.setTitle(details.getTitle());
        milestone.setDueDate(details.getDueDate());
        milestone.setCompletionPercent(details.getCompletionPercent());
        milestone.setStatus(details.getStatus());
        
        return milestoneRepository.save(milestone);
    }

    public void deleteMilestone(Long milestoneId) {
        milestoneRepository.deleteById(milestoneId);
    }
}