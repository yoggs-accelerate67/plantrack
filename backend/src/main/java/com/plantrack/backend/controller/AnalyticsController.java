package com.plantrack.backend.controller;

import com.plantrack.backend.dto.DashboardStatsDTO;
import com.plantrack.backend.dto.DepartmentalInsightsDTO;
import com.plantrack.backend.dto.VelocityMetricsDTO;
import com.plantrack.backend.model.AnalyticsDTO;
import com.plantrack.backend.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    // Get Dashboard Statistics
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    // Get Analytics for a specific User
    @GetMapping("/users/{userId}/analytics")
    public ResponseEntity<AnalyticsDTO> getUserAnalytics(@PathVariable Long userId) {
        return ResponseEntity.ok(analyticsService.getUserAnalytics(userId));
    }

    // Get Departmental Insights (Admin/Manager only)
    @GetMapping("/analytics/departmental-insights")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<DepartmentalInsightsDTO>> getDepartmentalInsights() {
        return ResponseEntity.ok(analyticsService.getDepartmentalInsights());
    }

    // Get Velocity Metrics for a specific user
    @GetMapping("/analytics/velocity/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<VelocityMetricsDTO> getUserVelocity(@PathVariable Long userId) {
        return ResponseEntity.ok(analyticsService.getUserVelocity(userId));
    }

    // Get Velocity Metrics for all users (Admin only)
    @GetMapping("/analytics/velocity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VelocityMetricsDTO>> getAllUsersVelocity() {
        return ResponseEntity.ok(analyticsService.getAllUsersVelocity());
    }
}