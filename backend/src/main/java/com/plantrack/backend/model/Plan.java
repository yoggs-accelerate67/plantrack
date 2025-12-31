package com.plantrack.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*; // Import for validation
import java.time.LocalDateTime;

@Entity
@Table(name = "plans")
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long planId;

    @Column(nullable = false)
    @NotBlank(message = "Title is required") // <--- Validation
    private String title;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @Enumerated(EnumType.STRING)
    private PlanPriority priority;

    @Enumerated(EnumType.STRING)
    private PlanStatus status;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @ManyToOne 
    @JoinColumn(name = "user_id", nullable = false) 
    private User user;

    public Plan() {}

    // --- Getters and Setters ---
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

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}