package com.plantrack.backend.service;

import com.plantrack.backend.model.AuditLog;
import com.plantrack.backend.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    /**
     * Log a CREATE operation
     */
    public void logCreate(String entityType, Long entityId, String details) {
        String performedBy = getCurrentUser();
        AuditLog log = new AuditLog("CREATE", performedBy, entityType, entityId, details);
        auditLogRepository.save(log);
    }

    /**
     * Log an UPDATE operation
     */
    public void logUpdate(String entityType, Long entityId, String details) {
        String performedBy = getCurrentUser();
        AuditLog log = new AuditLog("UPDATE", performedBy, entityType, entityId, details);
        auditLogRepository.save(log);
    }

    /**
     * Log a DELETE operation
     */
    public void logDelete(String entityType, Long entityId, String details) {
        String performedBy = getCurrentUser();
        AuditLog log = new AuditLog("DELETE", performedBy, entityType, entityId, details);
        auditLogRepository.save(log);
    }

    /**
     * Log a status change with old and new values
     */
    public void logStatusChange(String entityType, Long entityId, String oldStatus, String newStatus, String details) {
        String performedBy = getCurrentUser();
        AuditLog log = new AuditLog("UPDATE_STATUS", performedBy, entityType, entityId, details);
        log.setOldValue(oldStatus);
        log.setNewValue(newStatus);
        auditLogRepository.save(log);
    }

    /**
     * Get current authenticated user email or ID
     */
    private String getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getName(); // Returns email or username
        }
        return "SYSTEM";
    }
}

