package com.plantrack.backend.controller;

import com.plantrack.backend.dto.PlanDTO;
import com.plantrack.backend.dto.PlanDetailDTO;
import com.plantrack.backend.service.PlanService;
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
@Tag(name = "Plans", description = "Plan management APIs")
public class PlanController {

    @Autowired
    private PlanService planService;

    @PostMapping("/users/{userId}/plans")
    @Operation(summary = "Create a new plan")
    public ResponseEntity<PlanDTO> createPlan(@PathVariable Long userId, @Valid @RequestBody PlanDTO planDTO) {
        return ResponseEntity.ok(planService.createPlan(userId, planDTO));
    }

    @GetMapping("/users/{userId}/plans")
    @Operation(summary = "Get all plans for a user with pagination")
    public ResponseEntity<Page<PlanDTO>> getPlansByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 10, sort = "planId") Pageable pageable) {
        return ResponseEntity.ok(planService.getPlansByUserId(userId, pageable));
    }

    @GetMapping("/plans")
    @Operation(summary = "Get all plans with pagination")
    public ResponseEntity<Page<PlanDTO>> getAllPlans(
            @PageableDefault(size = 10, sort = "planId") Pageable pageable) {
        return ResponseEntity.ok(planService.getAllPlans(pageable));
    }

    @GetMapping("/plans/{planId}")
    @Operation(summary = "Get plan details with milestones and initiatives")
    public ResponseEntity<PlanDetailDTO> getPlanDetail(@PathVariable Long planId) {
        return ResponseEntity.ok(planService.getPlanDetail(planId));
    }

    @PutMapping("/plans/{planId}")
    @Operation(summary = "Update a plan")
    public ResponseEntity<PlanDTO> updatePlan(@PathVariable Long planId, @Valid @RequestBody PlanDTO planDTO) {
        return ResponseEntity.ok(planService.updatePlan(planId, planDTO));
    }

    @DeleteMapping("/plans/{planId}")
    @Operation(summary = "Delete a plan")
    public ResponseEntity<Void> deletePlan(@PathVariable Long planId) {
        planService.deletePlan(planId);
        return ResponseEntity.noContent().build();
    }
}