
package com.plantrack.backend.repository;

import com.plantrack.backend.model.AnalyticsReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AnalyticsReportRepository extends JpaRepository<AnalyticsReport, Long> {

    // Get latest report by department and type
    Optional<AnalyticsReport> findFirstByDepartmentOrderByGeneratedDateDesc(
        String department);

    // Get all reports by department (all types)
    List<AnalyticsReport> findByDepartmentOrderByGeneratedDateDesc(String department);

 
    // Get reports for date range
    @Query("SELECT r FROM AnalyticsReport r WHERE r.department = :department " +
           "AND r.generatedDate BETWEEN :startDate AND :endDate " +
           "ORDER BY r.generatedDate DESC")
    List<AnalyticsReport> findByDepartmentAndDateRange(
        @Param("department") String department,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate);

    // Get all unique departments
    @Query("SELECT DISTINCT r.department FROM AnalyticsReport r")
    List<String> findAllDepartments();
}
