package com.plantrack.backend.service;

public interface AuditService {

    public void logCreate(String entityType, Long entityId, String details);
    public void logUpdate(String entityType, Long entityId, String details);
    public void logDelete(String entityType, Long entityId, String details);
    public void logStatusChange(String entityType, Long entityId, String oldStatus, String newStatus, String details);

}

