package com.plantrack.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class InitiativeDTO {
    private Long initiativeId;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    private String status; // PLANNED, IN_PROGRESS, COMPLETED
    private Long milestoneId;
    private String milestoneTitle;
    private Long assignedUserId;
    private String assignedUserName;

    public InitiativeDTO() {}

    // Getters and Setters
    public Long getInitiativeId() { return initiativeId; }
    public void setInitiativeId(Long initiativeId) { this.initiativeId = initiativeId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getMilestoneId() { return milestoneId; }
    public void setMilestoneId(Long milestoneId) { this.milestoneId = milestoneId; }

    public String getMilestoneTitle() { return milestoneTitle; }
    public void setMilestoneTitle(String milestoneTitle) { this.milestoneTitle = milestoneTitle; }

    public Long getAssignedUserId() { return assignedUserId; }
    public void setAssignedUserId(Long assignedUserId) { this.assignedUserId = assignedUserId; }

    public String getAssignedUserName() { return assignedUserName; }
    public void setAssignedUserName(String assignedUserName) { this.assignedUserName = assignedUserName; }
}


