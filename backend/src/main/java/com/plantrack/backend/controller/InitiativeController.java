package com.plantrack.backend.controller;

import com.plantrack.backend.dto.InitiativeDTO;
import com.plantrack.backend.service.InitiativeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@Tag(name = "Initiatives", description = "Initiative management APIs")
public class InitiativeController {

    @Autowired
    private InitiativeService initiativeService;

    @PostMapping("/milestones/{milestoneId}/initiatives")
    @Operation(summary = "Create a new initiative")
    public ResponseEntity<InitiativeDTO> createInitiative(
            @PathVariable Long milestoneId, 
            @RequestParam Long userId,
            @Valid @RequestBody InitiativeDTO initiativeDTO) {
        return ResponseEntity.ok(initiativeService.createInitiative(milestoneId, userId, initiativeDTO));
    }

    @GetMapping("/milestones/{milestoneId}/initiatives")
    @Operation(summary = "Get all initiatives for a milestone with pagination")
    public ResponseEntity<Page<InitiativeDTO>> getInitiatives(
            @PathVariable Long milestoneId,
            @PageableDefault(size = 10, sort = "initiativeId") Pageable pageable) {
        return ResponseEntity.ok(initiativeService.getInitiativesByMilestone(milestoneId, pageable));
    }

    @PutMapping("/initiatives/{initiativeId}")
    @Operation(summary = "Update an initiative")
    public ResponseEntity<InitiativeDTO> updateInitiative(
            @PathVariable Long initiativeId, 
            @Valid @RequestBody InitiativeDTO initiativeDTO) {
        return ResponseEntity.ok(initiativeService.updateInitiative(initiativeId, initiativeDTO));
    }

    @DeleteMapping("/initiatives/{initiativeId}")
    @Operation(summary = "Delete an initiative")
    public ResponseEntity<Void> deleteInitiative(@PathVariable Long initiativeId) {
        initiativeService.deleteInitiative(initiativeId);
        return ResponseEntity.noContent().build();
    }
}