
package com.plantrack.backend.service;

import java.time.LocalDate;
import java.util.List;

import com.plantrack.backend.model.AnalyticsReport;

public interface AnalyticsService {

    /**
     * Generate all analytics (Plan + Milestone + Initiative) for a department
     */
    AnalyticsReport generateAllAnalyticsForDepartment(String department);

    /**
     * Get latest report by type and department
     */
    AnalyticsReport getLatestReport(String department);

    /**
     * Get all reports for a department
     */
    List<AnalyticsReport> getReportsByDepartment(String department);

 
    /**
     * Get all available departments
     */
    List<String> getAllDepartments();

    /**
     * Get reports for date range
     */
    List<AnalyticsReport> getReportsByDateRange(String department, LocalDate startDate, LocalDate endDate);
}
