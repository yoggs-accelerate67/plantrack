package com.plantrack.backend.controller;

import com.plantrack.backend.model.Notification;
import com.plantrack.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Get all notifications for a user
    @GetMapping("/users/{userId}/notifications")
    public List<Notification> getAllNotifications(@PathVariable Long userId) {
        return notificationService.getAllNotifications(userId);
    }

    // Get unread notifications for a user
    @GetMapping("/users/{userId}/notifications/unread")
    public List<Notification> getUnreadNotifications(@PathVariable Long userId) {
        return notificationService.getUnreadNotifications(userId);
    }

    // Get unread count for a user
    @GetMapping("/users/{userId}/notifications/unread-count")
    public Long getUnreadCount(@PathVariable Long userId) {
        return notificationService.getUnreadCount(userId);
    }

    // Mark a notification as read
    @PutMapping("/notifications/{notificationId}/read")
    public void markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
    }

    // Mark all notifications as read for a user
    @PutMapping("/users/{userId}/notifications/read-all")
    public void markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
    }
}