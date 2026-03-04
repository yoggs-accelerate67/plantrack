package com.plantrack.backend.service;

import com.plantrack.backend.model.Milestone;

import java.util.List;
import java.util.Map;

public interface MilestoneService {

    public Milestone createMilestone(Long planId, Milestone milestone);
    public List<Milestone> getMilestonesByPlan(Long planId);
    public Milestone updateMilestone(Long milestoneId, Milestone details);
    public void deleteMilestone(Long milestoneId); 
    public Map<String, Object> cancelMilestoneWithCascade(Long milestoneId);
    public Map<String, Object> getCancelCascadePreview(Long milestoneId);

}