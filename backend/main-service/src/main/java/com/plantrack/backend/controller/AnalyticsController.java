
package com.plantrack.backend.controller;

import com.plantrack.backend.model.AnalyticsReport;

import com.plantrack.backend.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsController.class);

    @Autowired
    private AnalyticsService analyticsService;

    /**
     * Generate all analytics (Plan + Milestone + Initiative) for a department
     * POST /api/analytics/generate/all?department=IT
     */
    @PostMapping("/generate/all")
    public ResponseEntity<AnalyticsReport> generateAllAnalytics(@RequestParam String department) {
        logger.info("Generating all analytics for department: {}", department);
        AnalyticsReport report = analyticsService.generateAllAnalyticsForDepartment(department);
        return ResponseEntity.status(HttpStatus.CREATED).body(report);
    }

    /**
     * Get latest report by type and department
     * GET /api/analytics/latest?department=IT
     */
    @GetMapping("/latest")
    public ResponseEntity<AnalyticsReport> getLatestReport(@RequestParam String department) {
        AnalyticsReport report = analyticsService.getLatestReport(department);
        return ResponseEntity.ok(report);
    }

    /**
     * Get all reports for a department
     * GET /api/analytics/department?department=IT
     */
    @GetMapping("/department")
    public ResponseEntity<List<AnalyticsReport>> getReportsByDepartment(@RequestParam String department) {
        List<AnalyticsReport> reports = analyticsService.getReportsByDepartment(department);
        return ResponseEntity.ok(reports);
    }



    /**
     * Get all available departments
     * GET /api/analytics/departments
     */
    @GetMapping("/departments")
    public ResponseEntity<List<String>> getAllDepartments() {
        List<String> departments = analyticsService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }

    /**
     * Get reports for date range
     * GET /api/analytics/reports?department=IT&startDate=2024-01-01&endDate=2024-12-31
     */
    @GetMapping("/reports")
    public ResponseEntity<List<AnalyticsReport>> getReportsByDateRange(
            @RequestParam String department,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        List<AnalyticsReport> reports = analyticsService.getReportsByDateRange(department, startDate, endDate);
        return ResponseEntity.ok(reports);
    }
}
