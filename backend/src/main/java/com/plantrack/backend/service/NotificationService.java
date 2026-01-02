package com.plantrack.backend.service;

import com.plantrack.backend.model.Notification;
import com.plantrack.backend.model.User;
import com.plantrack.backend.repository.NotificationRepository;
import com.plantrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create a basic notification
     */
    public void createNotification(Long userId, String type, String message) {
        createNotification(userId, type, message, null, null);
    }

    /**
     * Create a notification with entity linking
     */
    public void createNotification(Long userId, String type, String message, String entityType, Long entityId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

            Notification notification = new Notification();
            notification.setUser(user);
            notification.setType(type);
            notification.setMessage(message);
            notification.setEntityType(entityType);
            notification.setEntityId(entityId);
            // Status and createdDate are set in constructor, but ensure they're set
            if (notification.getStatus() == null) {
                notification.setStatus("UNREAD");
            }
            if (notification.getCreatedDate() == null) {
                notification.setCreatedDate(java.time.LocalDateTime.now());
            }
            
            Notification saved = notificationRepository.save(notification);
            System.out.println("Notification created successfully: ID=" + saved.getNotificationId() + 
                             ", User=" + userId + ", Type=" + type + ", Message=" + message);
        } catch (Exception e) {
            System.err.println("Failed to create notification for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-throw to see the error
        }
    }

    /**
     * Notify employee when initiative is assigned
     */
    public void notifyInitiativeAssigned(Long employeeUserId, String initiativeTitle, Long initiativeId) {
        createNotification(
            employeeUserId,
            "ASSIGNMENT",
            "You have been assigned to initiative: " + initiativeTitle,
            "INITIATIVE",
            initiativeId
        );
    }

    /**
     * Notify manager when employee updates initiative status
     */
    public void notifyStatusUpdate(Long managerUserId, String employeeName, String initiativeTitle, String newStatus, Long initiativeId) {
        createNotification(
            managerUserId,
            "STATUS_UPDATE",
            employeeName + " updated initiative '" + initiativeTitle + "' to " + newStatus,
            "INITIATIVE",
            initiativeId
        );
    }

    /**
     * Notify admin when weekly report is generated
     */
    public void notifyWeeklyReport(Long adminUserId, String reportSummary) {
        createNotification(
            adminUserId,
            "WEEKLY_REPORT",
            "Weekly Analytics Report: " + reportSummary,
            "SYSTEM",
            null
        );
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserUserIdAndStatus(userId, "UNREAD");
    }

    public List<Notification> getAllNotifications(Long userId) {
        return notificationRepository.findByUserUserIdOrderByCreatedDateDesc(userId);
    }

    public Long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setStatus("READ");
        notificationRepository.save(notification);
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = getUnreadNotifications(userId);
        for (Notification notification : unreadNotifications) {
            notification.setStatus("READ");
            notificationRepository.save(notification);
        }
    }
}