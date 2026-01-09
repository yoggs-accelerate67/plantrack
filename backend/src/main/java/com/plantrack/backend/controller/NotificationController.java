package com.plantrack.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.plantrack.backend.model.Notification;
import com.plantrack.backend.service.NotificationService;

@RestController
@RequestMapping("/api")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // --- SSE Endpoint ---
    @GetMapping("/notifications/stream")
    public SseEmitter streamNotifications(@RequestParam Long userId) {
        return notificationService.subscribe(userId);
    }
    // --------------------

    @GetMapping("/users/{userId}/notifications")
    public List<Notification> getAllNotifications(@PathVariable Long userId) {
        return notificationService.getAllNotifications(userId);
    }

    @GetMapping("/users/{userId}/notifications/unread")
    public List<Notification> getUnreadNotifications(@PathVariable Long userId) {
        return notificationService.getUnreadNotifications(userId);
    }

    @GetMapping("/users/{userId}/notifications/unread-count")
    public Long getUnreadCount(@PathVariable Long userId) {
        return notificationService.getUnreadCount(userId);
    }

    @PutMapping("/notifications/{notificationId}/read")
    public void markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
    }

    @PutMapping("/users/{userId}/notifications/read-all")
    public void markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
    }
}