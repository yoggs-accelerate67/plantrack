package com.plantrack.backend.dto;

import com.plantrack.backend.model.PlanPriority;
import com.plantrack.backend.model.PlanStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public class PlanDTO {
    private Long planId;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
    
    private PlanPriority priority;
    private PlanStatus status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long userId;
    private String userName;

    public PlanDTO() {}

    // Getters and Setters
    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public PlanPriority getPriority() { return priority; }
    public void setPriority(PlanPriority priority) { this.priority = priority; }

    public PlanStatus getStatus() { return status; }
    public void setStatus(PlanStatus status) { this.status = status; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
}


