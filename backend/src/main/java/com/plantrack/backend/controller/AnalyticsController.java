package com.plantrack.backend.controller;

import com.plantrack.backend.dto.DashboardStatsDTO;
import com.plantrack.backend.model.AnalyticsDTO;
import com.plantrack.backend.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    // Get Dashboard Statistics
    // URL: GET http://localhost:8080/api/dashboard/stats
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    // Get Analytics for a specific User
    // URL: GET http://localhost:8080/api/users/1/analytics
    @GetMapping("/users/{userId}/analytics")
    public ResponseEntity<AnalyticsDTO> getUserAnalytics(@PathVariable Long userId) {
        return ResponseEntity.ok(analyticsService.getUserAnalytics(userId));
    }
}