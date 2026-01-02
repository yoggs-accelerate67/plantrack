package com.plantrack.backend.repository;

import com.plantrack.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserUserIdAndStatus(Long userId, String status);
    
    @Query("SELECT n FROM Notification n WHERE n.user.userId = :userId ORDER BY n.createdDate DESC")
    List<Notification> findByUserUserIdOrderByCreatedDateDesc(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.userId = :userId AND n.status = 'UNREAD'")
    Long countUnreadByUserId(@Param("userId") Long userId);
    
    List<Notification> findByUserUserIdAndTypeOrderByCreatedDateDesc(Long userId, String type);
}