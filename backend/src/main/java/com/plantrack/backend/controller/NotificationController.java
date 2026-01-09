package com.plantrack.backend.controller;

import com.plantrack.backend.model.Notification;
import com.plantrack.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // --- NEW SSE ENDPOINT ---
    @GetMapping("/notifications/stream")
    public SseEmitter streamNotifications(@RequestParam Long userId) {
        // Note: In a real app, you'd extract userId from the SecurityContext
        // but since we passed the token in query params, SecurityContext is populated.
        // We can just trust the userId passed or grab it from auth.
        return notificationService.subscribe(userId);
    }
    // ------------------------

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