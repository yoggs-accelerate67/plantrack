package com.plantrack.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.plantrack.backend.model.Initiative;

public interface InitiativeRepository extends JpaRepository<Initiative, Long> {
    List<Initiative> findByMilestoneMilestoneId(Long milestoneId);
    List<Initiative> findByAssignedUserUserId(Long userId);
}