package com.plantrack.backend.controller;

import com.plantrack.backend.model.AuditLog;
import com.plantrack.backend.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<List<AuditLog>> getAllAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAll());
    }

    @GetMapping("/entity/{entityType}")
    public ResponseEntity<List<AuditLog>> getByEntityType(@PathVariable String entityType) {
        return ResponseEntity.ok(auditLogRepository.findByEntityTypeOrderByTimestampDesc(entityType));
    }

    @GetMapping("/user/{performedBy}")
    public ResponseEntity<List<AuditLog>> getByUser(@PathVariable String performedBy) {
        return ResponseEntity.ok(auditLogRepository.findByPerformedByOrderByTimestampDesc(performedBy));
    }

    @GetMapping("/action/{action}")
    public ResponseEntity<List<AuditLog>> getByAction(@PathVariable String action) {
        return ResponseEntity.ok(auditLogRepository.findByActionOrderByTimestampDesc(action));
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<AuditLog>> getByEntity(@PathVariable String entityType, @PathVariable Long entityId) {
        return ResponseEntity.ok(auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<AuditLog>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(auditLogRepository.findByTimestampBetween(startDate, endDate));
    }

    @GetMapping("/user/{performedBy}/date-range")
    public ResponseEntity<List<AuditLog>> getByUserAndDateRange(
            @PathVariable String performedBy,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(auditLogRepository.findByPerformedByAndTimestampBetween(performedBy, startDate, endDate));
    }
}

