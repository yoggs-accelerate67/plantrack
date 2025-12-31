package com.plantrack.backend.repository;

import com.plantrack.backend.model.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlanRepository extends JpaRepository<Plan, Long> {
    // Custom method to find all plans for a specific user
    List<Plan> findByUserUserId(Long userId);
}