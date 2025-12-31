package com.plantrack.backend.service;

import com.plantrack.backend.model.AuditLog;
import com.plantrack.backend.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void logAction(String action, String entityType, Long entityId, String details) {
        String performedBy = SecurityContextHolder.getContext().getAuthentication() != null
            ? SecurityContextHolder.getContext().getAuthentication().getName()
            : "SYSTEM";
        
        String fullDetails = String.format("Entity: %s (ID: %d) - %s", entityType, entityId, details);
        
        AuditLog log = new AuditLog(action, performedBy, fullDetails);
        log.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(log);
    }

    public void logCreate(String entityType, Long entityId) {
        logAction("CREATE", entityType, entityId, "Entity created");
    }

    public void logUpdate(String entityType, Long entityId, String changeDetails) {
        logAction("UPDATE", entityType, entityId, changeDetails);
    }

    public void logDelete(String entityType, Long entityId) {
        logAction("DELETE", entityType, entityId, "Entity deleted");
    }
}


