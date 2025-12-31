package com.plantrack.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.plantrack.backend.model.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    // OLD: findByPlanPlanId(Long planId);
    // NEW: Find all comments for a specific Initiative
    List<Comment> findByInitiativeInitiativeId(Long initiativeId);
}