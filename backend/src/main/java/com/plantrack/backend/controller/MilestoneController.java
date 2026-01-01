package com.plantrack.backend.controller;

import com.plantrack.backend.model.Milestone;
import com.plantrack.backend.service.MilestoneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MilestoneController {

    @Autowired
    private MilestoneService milestoneService;

    // Create a Milestone for a specific Plan (Goal)
    @PostMapping("/plans/{planId}/milestones")
    public Milestone createMilestone(@PathVariable Long planId, @RequestBody Milestone milestone) {
        return milestoneService.createMilestone(planId, milestone);
    }

    // Get all Milestones for a Plan
    @GetMapping("/plans/{planId}/milestones")
    public List<Milestone> getMilestonesByPlan(@PathVariable Long planId) {
        return milestoneService.getMilestonesByPlan(planId);
    }

    // Update Milestone Progress
    @PutMapping("/milestones/{milestoneId}")
    public Milestone updateMilestone(@PathVariable Long milestoneId, @RequestBody Milestone details) {
        return milestoneService.updateMilestone(milestoneId, details);
    }
    
    // Delete Milestone
    @DeleteMapping("/milestones/{milestoneId}")
    public void deleteMilestone(@PathVariable Long milestoneId) {
        milestoneService.deleteMilestone(milestoneId);
    }
}