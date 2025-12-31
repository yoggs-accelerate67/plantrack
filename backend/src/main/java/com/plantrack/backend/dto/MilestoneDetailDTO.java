package com.plantrack.backend.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class MilestoneDetailDTO {
    private Long milestoneId;
    private String title;
    private LocalDateTime dueDate;
    private Double completionPercent;
    private String status;
    private List<InitiativeDTO> initiatives = new ArrayList<>();

    public MilestoneDetailDTO() {}

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

    public List<InitiativeDTO> getInitiatives() { return initiatives; }
    public void setInitiatives(List<InitiativeDTO> initiatives) { this.initiatives = initiatives; }
}


