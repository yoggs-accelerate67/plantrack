package com.plantrack.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.plantrack.backend.model.Initiative;
import com.plantrack.backend.service.InitiativeService;

@RestController
@RequestMapping("/api")
public class InitiativeController {

    @Autowired
    private InitiativeService initiativeService;

    @PostMapping("/milestones/{milestoneId}/initiatives")
    public Initiative createInitiative(@PathVariable Long milestoneId, 
                                       @RequestParam Long userId,
                                       @RequestBody Initiative initiative) {
        return initiativeService.createInitiative(milestoneId, userId, initiative);
    }

    @GetMapping("/milestones/{milestoneId}/initiatives")
    public List<Initiative> getInitiatives(@PathVariable Long milestoneId) {
        return initiativeService.getInitiativesByMilestone(milestoneId);
    }

    // NEW: Update Endpoint
    @PutMapping("/initiatives/{initiativeId}")
    public Initiative updateInitiative(@PathVariable Long initiativeId, @RequestBody Initiative initiative) {
        return initiativeService.updateInitiative(initiativeId, initiative);
    }
}