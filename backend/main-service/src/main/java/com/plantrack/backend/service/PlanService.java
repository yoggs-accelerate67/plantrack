package com.plantrack.backend.service;

import com.plantrack.backend.model.Plan;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface PlanService {

    public Plan createPlan(Long userId, Plan plan);
    public Page<Plan> getAllPlans(Pageable pageable);
    public List<Plan> getPlansByUserId(Long userId);
    public Plan getPlanById(Long planId);
    public Plan updatePlan(Long planId, Plan planDetails);
    public Map<String, Object> cancelPlanWithCascade(Long planId, Long userId);
    public Map<String, Object> getCancelCascadePreview(Long planId);
    public void deletePlan(Long planId); 
    public List<Plan> getPlansWithAssignedInitiatives(Long userId);
}