package com.plantrack.backend.service;

import com.plantrack.backend.dto.InitiativeDTO;
import com.plantrack.backend.mapper.InitiativeMapper;
import com.plantrack.backend.model.Initiative;
import com.plantrack.backend.model.Milestone;
import com.plantrack.backend.model.User;
import com.plantrack.backend.repository.InitiativeRepository;
import com.plantrack.backend.repository.MilestoneRepository;
import com.plantrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InitiativeService {

    @Autowired
    private InitiativeRepository initiativeRepository;

    @Autowired
    private MilestoneRepository milestoneRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InitiativeMapper initiativeMapper;

    @Autowired
    private AuditService auditService;

    @Transactional
    public InitiativeDTO createInitiative(Long milestoneId, Long assignedUserId, InitiativeDTO initiativeDTO) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        User user = userRepository.findById(assignedUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Initiative initiative = initiativeMapper.toEntity(initiativeDTO);
        initiative.setMilestone(milestone);
        initiative.setAssignedUser(user);
        
        Initiative savedInitiative = initiativeRepository.save(initiative);
        auditService.logCreate("Initiative", savedInitiative.getInitiativeId());

        updateMilestoneProgress(milestone);

        return initiativeMapper.toDTO(savedInitiative);
    }

    @Transactional
    public InitiativeDTO updateInitiative(Long id, InitiativeDTO initiativeDTO) {
        Initiative initiative = initiativeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Initiative not found"));

        String oldStatus = initiative.getStatus();
        
        initiative.setTitle(initiativeDTO.getTitle());
        initiative.setDescription(initiativeDTO.getDescription());
        initiative.setStatus(initiativeDTO.getStatus());
        
        Initiative savedInitiative = initiativeRepository.save(initiative);

        if (!oldStatus.equals(initiativeDTO.getStatus())) {
            auditService.logUpdate("Initiative", id, 
                String.format("Status changed from %s to %s", oldStatus, initiativeDTO.getStatus()));
        } else {
            auditService.logUpdate("Initiative", id, "Initiative details updated");
        }

        updateMilestoneProgress(initiative.getMilestone());
        return initiativeMapper.toDTO(savedInitiative);
    }

    public Page<InitiativeDTO> getInitiativesByMilestone(Long milestoneId, Pageable pageable) {
        return initiativeRepository.findByMilestoneMilestoneId(milestoneId, pageable)
                .map(initiativeMapper::toDTO);
    }

    public List<InitiativeDTO> getInitiativesByMilestoneList(Long milestoneId) {
        return initiativeRepository.findByMilestoneMilestoneId(milestoneId).stream()
                .map(initiativeMapper::toDTO)
                .toList();
    }

    @Transactional
    public void deleteInitiative(Long initiativeId) {
        Initiative initiative = initiativeRepository.findById(initiativeId)
                .orElseThrow(() -> new RuntimeException("Initiative not found"));
        Milestone milestone = initiative.getMilestone();
        
        initiativeRepository.deleteById(initiativeId);
        auditService.logDelete("Initiative", initiativeId);
        
        updateMilestoneProgress(milestone);
    }

    private void updateMilestoneProgress(Milestone milestone) {
        List<Initiative> initiatives = initiativeRepository.findByMilestoneMilestoneId(milestone.getMilestoneId());

        if (initiatives.isEmpty()) {
            milestone.setCompletionPercent(0.0);
            milestone.setStatus("PLANNED");
        } else {
            long completedCount = initiatives.stream()
                    .filter(i -> "COMPLETED".equalsIgnoreCase(i.getStatus()))
                    .count();

            double percent = ((double) completedCount / initiatives.size()) * 100;
            milestone.setCompletionPercent(percent);

            if (percent == 100.0) {
                milestone.setStatus("COMPLETED");
            } else if (percent > 0) {
                milestone.setStatus("IN_PROGRESS");
            } else {
                milestone.setStatus("PLANNED");
            }
        }
        
        milestoneRepository.save(milestone);
    }
}