package com.plantrack.backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.plantrack.backend.model.Initiative;

public interface InitiativeRepository extends JpaRepository<Initiative, Long> {
    List<Initiative> findByMilestoneMilestoneId(Long milestoneId);
    Page<Initiative> findByMilestoneMilestoneId(Long milestoneId, Pageable pageable);
    List<Initiative> findByAssignedUserUserId(Long userId);
}