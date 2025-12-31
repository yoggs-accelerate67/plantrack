package com.plantrack.backend.controller;

import com.plantrack.backend.model.Plan;
import com.plantrack.backend.service.PlanService;
import jakarta.validation.Valid; // Import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PlanController {

    @Autowired
    private PlanService planService;

    @PostMapping("/users/{userId}/plans")
    public Plan createPlan(@PathVariable Long userId, @Valid @RequestBody Plan plan) { // <--- Added @Valid
        return planService.createPlan(userId, plan);
    }

    @GetMapping("/users/{userId}/plans")
    public List<Plan> getPlansByUser(@PathVariable Long userId) {
        return planService.getPlansByUserId(userId);
    }

    @PutMapping("/plans/{planId}")
    public Plan updatePlan(@PathVariable Long planId, @RequestBody Plan planDetails) {
        return planService.updatePlan(planId, planDetails);
    }

    @DeleteMapping("/plans/{planId}")
    public void deletePlan(@PathVariable Long planId) {
        planService.deletePlan(planId);
    }
}