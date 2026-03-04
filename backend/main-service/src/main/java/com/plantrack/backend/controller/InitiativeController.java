package com.plantrack.backend.controller;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.plantrack.backend.model.Initiative;
import com.plantrack.backend.service.InitiativeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class InitiativeController {

    private static final Logger logger = LoggerFactory.getLogger(InitiativeController.class);

    @Autowired
    private InitiativeService initiativeService;

    @PostMapping("/milestones/{milestoneId}/initiatives")
    public ResponseEntity<Initiative> createInitiative(@PathVariable Long milestoneId, 
                                                       @RequestParam(required = false) String assignedUserIds,
                                                       @Valid @RequestBody Initiative initiative) {
        // Support both new format (comma-separated IDs) and legacy format (single userId)
        List<Long> userIds;
        if (assignedUserIds != null && !assignedUserIds.trim().isEmpty()) {
            // Parse comma-separated user IDs
            userIds = Arrays.stream(assignedUserIds.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Long::parseLong)
                    .collect(Collectors.toList());
        } else {
            // Fallback: try to get from request body if provided
            // This maintains backward compatibility
            throw new RuntimeException("assignedUserIds parameter is required. Provide comma-separated user IDs (e.g., ?assignedUserIds=1,2,3)");
        }
     
        Initiative createdInitiative = initiativeService.createInitiative(milestoneId, userIds, initiative);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdInitiative);
    }

    @GetMapping("/milestones/{milestoneId}/initiatives")
    public ResponseEntity<List<Initiative>> getInitiatives(@PathVariable Long milestoneId) {
        List<Initiative> initiatives = initiativeService.getInitiativesByMilestone(milestoneId);
        return ResponseEntity.ok(initiatives);
    }

    @PutMapping("/initiatives/{initiativeId}")
    public ResponseEntity<Initiative> updateInitiative(@PathVariable Long initiativeId, 
                                                       @Valid @RequestBody Initiative initiative) {
        Initiative updatedInitiative = initiativeService.updateInitiative(initiativeId, initiative);
        return ResponseEntity.ok(updatedInitiative);
    }

    @GetMapping("/users/{userId}/initiatives")
    public ResponseEntity<List<Initiative>> getMyInitiatives(@PathVariable Long userId) {
        logger.debug("GET /users/{}/initiatives - Request received", userId);
        List<Initiative> initiatives = initiativeService.getInitiativesByUser(userId);
        logger.info("GET /users/{}/initiatives - Found {} initiatives", userId, initiatives.size());
        return ResponseEntity.ok(initiatives);
    }

    @DeleteMapping("/initiatives/{initiativeId}")
    public ResponseEntity<Void> deleteInitiative(@PathVariable Long initiativeId) {
        logger.debug("DELETE /initiatives/{} - Request received", initiativeId);
        initiativeService.deleteInitiative(initiativeId);
        return ResponseEntity.noContent().build();
    }
}