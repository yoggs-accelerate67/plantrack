package com.plantrack.backend.service;

import com.plantrack.backend.dto.PlanDTO;
import com.plantrack.backend.dto.PlanDetailDTO;
import com.plantrack.backend.mapper.PlanMapper;
import com.plantrack.backend.mapper.MilestoneMapper;
import com.plantrack.backend.model.Plan;
import com.plantrack.backend.model.User;
import com.plantrack.backend.repository.MilestoneRepository;
import com.plantrack.backend.repository.PlanRepository;
import com.plantrack.backend.repository.UserRepository;
import com.plantrack.backend.repository.InitiativeRepository;
import com.plantrack.backend.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
public class PlanService {

    @Autowired
    private PlanRepository planRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MilestoneRepository milestoneRepository;

    @Autowired
    private InitiativeRepository initiativeRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PlanMapper planMapper;

    @Autowired
    private MilestoneMapper milestoneMapper;

    @Autowired
    private AuditService auditService;

    @Transactional
    public PlanDTO createPlan(Long userId, PlanDTO planDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        Plan plan = planMapper.toEntity(planDTO);
        plan.setUser(user);

        if (plan.getStartDate() == null) {
            plan.setStartDate(LocalDateTime.now());
        }
        
        Plan savedPlan = planRepository.save(plan);
        auditService.logCreate("Plan", savedPlan.getPlanId());

        notificationService.createNotification(
            userId, 
            "INFO", 
            "New Plan Created: '" + savedPlan.getTitle() + "'."
        );
        
        return planMapper.toDTO(savedPlan);
    }

    public Page<PlanDTO> getPlansByUserId(Long userId, Pageable pageable) {
        return planRepository.findByUserUserId(userId, pageable)
                .map(planMapper::toDTO);
    }

    public Page<PlanDTO> getAllPlans(Pageable pageable) {
        return planRepository.findAll(pageable)
                .map(planMapper::toDTO);
    }

    @Transactional
    public PlanDTO updatePlan(Long planId, PlanDTO planDTO) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + planId));
        
        String oldStatus = plan.getStatus() != null ? plan.getStatus().name() : "null";
        
        plan.setTitle(planDTO.getTitle());
        plan.setDescription(planDTO.getDescription());
        plan.setPriority(planDTO.getPriority());
        plan.setStatus(planDTO.getStatus());
        plan.setStartDate(planDTO.getStartDate());
        plan.setEndDate(planDTO.getEndDate());
        
        Plan savedPlan = planRepository.save(plan);
        
        String newStatus = savedPlan.getStatus() != null ? savedPlan.getStatus().name() : "null";
        if (!oldStatus.equals(newStatus)) {
            auditService.logUpdate("Plan", planId, 
                String.format("Status changed from %s to %s", oldStatus, newStatus));
        } else {
            auditService.logUpdate("Plan", planId, "Plan details updated");
        }
        
        return planMapper.toDTO(savedPlan);
    }

    @Transactional
    public void deletePlan(Long planId) {
        planRepository.deleteById(planId);
        auditService.logDelete("Plan", planId);
    }

    public PlanDetailDTO getPlanDetail(Long planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + planId));
        
        PlanDetailDTO dto = new PlanDetailDTO();
        dto.setPlanId(plan.getPlanId());
        dto.setTitle(plan.getTitle());
        dto.setDescription(plan.getDescription());
        dto.setPriority(plan.getPriority());
        dto.setStatus(plan.getStatus());
        dto.setStartDate(plan.getStartDate());
        dto.setEndDate(plan.getEndDate());
        
        if (plan.getUser() != null) {
            dto.setUserId(plan.getUser().getUserId());
            dto.setUserName(plan.getUser().getName());
        }
        
        // Fetch milestones and their initiatives
        var milestones = milestoneRepository.findByPlanPlanId(planId);
        dto.setMilestones(milestones.stream()
            .map(m -> {
                var initiatives = initiativeRepository.findByMilestoneMilestoneId(m.getMilestoneId());
                return milestoneMapper.toDetailDTO(m, initiatives);
            })
            .collect(Collectors.toList()));
        
        return dto;
    }
}