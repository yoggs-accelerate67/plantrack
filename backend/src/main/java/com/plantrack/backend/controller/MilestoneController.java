package com.plantrack.backend.controller;

import com.plantrack.backend.dto.MilestoneDTO;
import com.plantrack.backend.service.MilestoneService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@Tag(name = "Milestones", description = "Milestone management APIs")
public class MilestoneController {

    @Autowired
    private MilestoneService milestoneService;

    @PostMapping("/plans/{planId}/milestones")
    @Operation(summary = "Create a new milestone for a plan")
    public ResponseEntity<MilestoneDTO> createMilestone(
            @PathVariable Long planId, 
            @Valid @RequestBody MilestoneDTO milestoneDTO) {
        return ResponseEntity.ok(milestoneService.createMilestone(planId, milestoneDTO));
    }

    @GetMapping("/plans/{planId}/milestones")
    @Operation(summary = "Get all milestones for a plan with pagination")
    public ResponseEntity<Page<MilestoneDTO>> getMilestonesByPlan(
            @PathVariable Long planId,
            @PageableDefault(size = 10, sort = "milestoneId") Pageable pageable) {
        return ResponseEntity.ok(milestoneService.getMilestonesByPlan(planId, pageable));
    }

    @PutMapping("/milestones/{milestoneId}")
    @Operation(summary = "Update a milestone")
    public ResponseEntity<MilestoneDTO> updateMilestone(
            @PathVariable Long milestoneId, 
            @Valid @RequestBody MilestoneDTO milestoneDTO) {
        return ResponseEntity.ok(milestoneService.updateMilestone(milestoneId, milestoneDTO));
    }
    
    @DeleteMapping("/milestones/{milestoneId}")
    @Operation(summary = "Delete a milestone")
    public ResponseEntity<Void> deleteMilestone(@PathVariable Long milestoneId) {
        milestoneService.deleteMilestone(milestoneId);
        return ResponseEntity.noContent().build();
    }
}