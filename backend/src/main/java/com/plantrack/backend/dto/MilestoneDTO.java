package com.plantrack.backend.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class MilestoneDTO {
    private Long milestoneId;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private LocalDateTime dueDate;
    private Double completionPercent;
    private String status; // PLANNED, IN_PROGRESS, COMPLETED
    private Long planId;
    private String planTitle;

    public MilestoneDTO() {}

    // Getters and Setters
    public Long getMilestoneId() { return milestoneId; }
    public void setMilestoneId(Long milestoneId) { this.milestoneId = milestoneId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public Double getCompletionPercent() { return completionPercent; }
    public void setCompletionPercent(Double completionPercent) { this.completionPercent = completionPercent; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }

    public String getPlanTitle() { return planTitle; }
    public void setPlanTitle(String planTitle) { this.planTitle = planTitle; }
}


