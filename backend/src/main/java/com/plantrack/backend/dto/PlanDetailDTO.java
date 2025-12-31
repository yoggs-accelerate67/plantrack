package com.plantrack.backend.dto;

import com.plantrack.backend.model.PlanPriority;
import com.plantrack.backend.model.PlanStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class PlanDetailDTO {
    private Long planId;
    private String title;
    private String description;
    private PlanPriority priority;
    private PlanStatus status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long userId;
    private String userName;
    private List<MilestoneDetailDTO> milestones = new ArrayList<>();

    public PlanDetailDTO() {}

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

    public List<MilestoneDetailDTO> getMilestones() { return milestones; }
    public void setMilestones(List<MilestoneDetailDTO> milestones) { this.milestones = milestones; }
}


