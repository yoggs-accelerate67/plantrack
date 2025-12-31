package com.plantrack.backend.controller;

import com.plantrack.backend.dto.DashboardStatsDTO;
import com.plantrack.backend.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@Tag(name = "Analytics", description = "Analytics and dashboard statistics APIs")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get overall dashboard statistics")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    @GetMapping("/users/{userId}/analytics")
    @Operation(summary = "Get analytics for a specific user")
    public ResponseEntity<DashboardStatsDTO> getUserAnalytics(@PathVariable Long userId) {
        return ResponseEntity.ok(analyticsService.getUserAnalytics(userId));
    }
}