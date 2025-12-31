package com.plantrack.backend.controller;

import com.plantrack.backend.model.AnalyticsDTO;
import com.plantrack.backend.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    // Get Analytics for a specific User
    // URL: GET http://localhost:8080/api/users/1/analytics
    @GetMapping("/users/{userId}/analytics")
    public AnalyticsDTO getUserAnalytics(@PathVariable Long userId) {
        return analyticsService.getUserAnalytics(userId);
    }
}