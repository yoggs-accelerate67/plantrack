package com.plantrack.backend.service;

import com.plantrack.backend.model.Initiative;

import java.util.List;

public interface InitiativeService {

    public Initiative createInitiative(Long milestoneId, List<Long> assignedUserIds, Initiative initiative);
    public Initiative updateInitiative(Long id, Initiative updatedData);
    public List<Initiative> getInitiativesByMilestone(Long milestoneId);
    public List<Initiative> getInitiativesByUser(Long userId);
    public void deleteInitiative(Long id);
}