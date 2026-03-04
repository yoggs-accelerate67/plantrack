package com.plantrack.backend.repository;

import com.plantrack.backend.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    // Find by entity type
    List<AuditLog> findByEntityTypeOrderByTimestampDesc(String entityType);
    
    // Find by user (performedBy)
    List<AuditLog> findByPerformedByOrderByTimestampDesc(String performedBy);
    
    // Find by action type
    List<AuditLog> findByActionOrderByTimestampDesc(String action);
    
    // Find by entity
    List<AuditLog> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, Long entityId);
    
    // Find by date range
    List<AuditLog> findByTimestampBetween(LocalDateTime startDate, LocalDateTime endDate);

    // Find by user and date range
    List<AuditLog> findByPerformedByAndTimestampBetween(String performedBy,
                                                        LocalDateTime startDate,
                                                        LocalDateTime endDate);

}