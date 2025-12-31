package com.plantrack.backend.service;

import com.plantrack.backend.dto.MilestoneDTO;
import com.plantrack.backend.mapper.MilestoneMapper;
import com.plantrack.backend.model.Milestone;
import com.plantrack.backend.model.Plan;
import com.plantrack.backend.repository.MilestoneRepository;
import com.plantrack.backend.repository.PlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MilestoneService {

    @Autowired
    private MilestoneRepository milestoneRepository;

    @Autowired
    private PlanRepository planRepository;

    @Autowired
    private MilestoneMapper milestoneMapper;

    @Autowired
    private AuditService auditService;

    @Transactional
    public MilestoneDTO createMilestone(Long planId, MilestoneDTO milestoneDTO) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan (Goal) not found with id: " + planId));
        
        Milestone milestone = milestoneMapper.toEntity(milestoneDTO);
        milestone.setPlan(plan);
        
        Milestone savedMilestone = milestoneRepository.save(milestone);
        auditService.logCreate("Milestone", savedMilestone.getMilestoneId());
        
        return milestoneMapper.toDTO(savedMilestone);
    }

    public Page<MilestoneDTO> getMilestonesByPlan(Long planId, Pageable pageable) {
        return milestoneRepository.findByPlanPlanId(planId, pageable)
                .map(milestoneMapper::toDTO);
    }

    public List<MilestoneDTO> getMilestonesByPlanList(Long planId) {
        return milestoneRepository.findByPlanPlanId(planId).stream()
                .map(milestoneMapper::toDTO)
                .toList();
    }

    @Transactional
    public MilestoneDTO updateMilestone(Long milestoneId, MilestoneDTO milestoneDTO) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));
        
        String oldStatus = milestone.getStatus();
        
        milestone.setTitle(milestoneDTO.getTitle());
        milestone.setDueDate(milestoneDTO.getDueDate());
        milestone.setCompletionPercent(milestoneDTO.getCompletionPercent());
        milestone.setStatus(milestoneDTO.getStatus());
        
        Milestone savedMilestone = milestoneRepository.save(milestone);
        
        String newStatus = savedMilestone.getStatus();
        if (!oldStatus.equals(newStatus)) {
            auditService.logUpdate("Milestone", milestoneId, 
                String.format("Status changed from %s to %s", oldStatus, newStatus));
        } else {
            auditService.logUpdate("Milestone", milestoneId, "Milestone details updated");
        }
        
        return milestoneMapper.toDTO(savedMilestone);
    }

    @Transactional
    public void deleteMilestone(Long milestoneId) {
        milestoneRepository.deleteById(milestoneId);
        auditService.logDelete("Milestone", milestoneId);
    }
}