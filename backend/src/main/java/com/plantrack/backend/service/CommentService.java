package com.plantrack.backend.service;

import com.plantrack.backend.model.Comment;
import com.plantrack.backend.model.Initiative;
import com.plantrack.backend.model.User;
import com.plantrack.backend.repository.CommentRepository;
import com.plantrack.backend.repository.InitiativeRepository;
import com.plantrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private InitiativeRepository initiativeRepository; // Changed from PlanRepository

    @Autowired
    private UserRepository userRepository;

    public Comment addComment(Long initiativeId, Long userId, Comment comment) {
        // 1. Find the Initiative
        Initiative initiative = initiativeRepository.findById(initiativeId)
                .orElseThrow(() -> new RuntimeException("Initiative not found"));
        
        // 2. Find the User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Link them
        comment.setInitiative(initiative);
        comment.setUser(user);
        
        // Note: Date is handled automatically by @CreatedDate now

        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByInitiative(Long initiativeId) {
        return commentRepository.findByInitiativeInitiativeId(initiativeId);
    }
}