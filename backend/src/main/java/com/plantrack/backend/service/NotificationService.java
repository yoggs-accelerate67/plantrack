package com.plantrack.backend.service;

import com.plantrack.backend.model.Notification;
import com.plantrack.backend.model.User;
import com.plantrack.backend.repository.NotificationRepository;
import com.plantrack.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

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
            logger.info("Notification created successfully: notificationId={}, userId={}, type={}, entityType={}, entityId={}", 
                    saved.getNotificationId(), userId, type, entityType, entityId);
        } catch (Exception e) {
            logger.error("Failed to create notification: userId={}, type={}, entityType={}, entityId={}", 
                    userId, type, entityType, entityId, e);
            throw e; // Re-throw to see the error
        }
    }

    /**
     * Notify employee when initiative is assigned
     */
    public void notifyInitiativeAssigned(Long employeeUserId, String initiativeTitle, Long initiativeId) {
        logger.debug("Sending initiative assignment notification: userId={}, initiativeId={}, title={}", 
                employeeUserId, initiativeId, initiativeTitle);
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
        logger.debug("Sending status update notification: managerId={}, employeeName={}, initiativeId={}, newStatus={}", 
                managerUserId, employeeName, initiativeId, newStatus);
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
        logger.debug("Sending weekly report notification: adminId={}", adminUserId);
        createNotification(
            adminUserId,
            "WEEKLY_REPORT",
            "Weekly Analytics Report: " + reportSummary,
            "SYSTEM",
            null
        );
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        logger.debug("Fetching unread notifications: userId={}", userId);
        List<Notification> notifications = notificationRepository.findByUserUserIdAndStatus(userId, "UNREAD");
        logger.debug("Found {} unread notifications for user: userId={}", notifications.size(), userId);
        return notifications;
    }

    public List<Notification> getAllNotifications(Long userId) {
        logger.debug("Fetching all notifications: userId={}", userId);
        List<Notification> notifications = notificationRepository.findByUserUserIdOrderByCreatedDateDesc(userId);
        logger.debug("Found {} total notifications for user: userId={}", notifications.size(), userId);
        return notifications;
    }

    public Long getUnreadCount(Long userId) {
        logger.debug("Getting unread count: userId={}", userId);
        Long count = notificationRepository.countUnreadByUserId(userId);
        logger.debug("Unread count: userId={}, count={}", userId, count);
        return count;
    }

    public void markAsRead(Long notificationId) {
        logger.debug("Marking notification as read: notificationId={}", notificationId);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> {
                    logger.error("Notification not found: notificationId={}", notificationId);
                    return new RuntimeException("Notification not found");
                });
        notification.setStatus("READ");
        notificationRepository.save(notification);
        logger.debug("Notification marked as read: notificationId={}", notificationId);
    }

    public void markAllAsRead(Long userId) {
        logger.info("Marking all notifications as read: userId={}", userId);
        List<Notification> unreadNotifications = getUnreadNotifications(userId);
        for (Notification notification : unreadNotifications) {
            notification.setStatus("READ");
            notificationRepository.save(notification);
        }
        logger.info("Marked {} notifications as read: userId={}", unreadNotifications.size(), userId);
    }
}