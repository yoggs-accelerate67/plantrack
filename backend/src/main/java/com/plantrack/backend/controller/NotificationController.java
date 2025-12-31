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

    // Get unread notifications for a user
    // URL: GET http://localhost:8080/api/users/{userId}/notifications
    @GetMapping("/users/{userId}/notifications")
    public List<Notification> getNotifications(@PathVariable Long userId) {
        return notificationService.getUnreadNotifications(userId);
    }

    // Mark a notification as read
    // URL: PUT http://localhost:8080/api/notifications/{notificationId}/read
    @PutMapping("/notifications/{notificationId}/read")
    public void markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
    }
}