package com.plantrack.backend.repository;

import com.plantrack.backend.model.Milestone;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    List<Milestone> findByPlanPlanId(Long planId);
    Page<Milestone> findByPlanPlanId(Long planId, Pageable pageable);
}