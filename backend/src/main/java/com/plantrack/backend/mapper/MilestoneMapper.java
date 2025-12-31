package com.plantrack.backend.mapper;

import com.plantrack.backend.dto.InitiativeDTO;
import com.plantrack.backend.dto.MilestoneDTO;
import com.plantrack.backend.dto.MilestoneDetailDTO;
import com.plantrack.backend.model.Initiative;
import com.plantrack.backend.model.Milestone;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class MilestoneMapper {

    public MilestoneDTO toDTO(Milestone milestone) {
        if (milestone == null) return null;
        
        MilestoneDTO dto = new MilestoneDTO();
        dto.setMilestoneId(milestone.getMilestoneId());
        dto.setTitle(milestone.getTitle());
        dto.setDueDate(milestone.getDueDate());
        dto.setCompletionPercent(milestone.getCompletionPercent());
        dto.setStatus(milestone.getStatus());
        
        if (milestone.getPlan() != null) {
            dto.setPlanId(milestone.getPlan().getPlanId());
            dto.setPlanTitle(milestone.getPlan().getTitle());
        }
        
        return dto;
    }

    public Milestone toEntity(MilestoneDTO dto) {
        if (dto == null) return null;
        
        Milestone milestone = new Milestone();
        milestone.setMilestoneId(dto.getMilestoneId());
        milestone.setTitle(dto.getTitle());
        milestone.setDueDate(dto.getDueDate());
        milestone.setCompletionPercent(dto.getCompletionPercent());
        milestone.setStatus(dto.getStatus());
        
        return milestone;
    }

    public MilestoneDetailDTO toDetailDTO(Milestone milestone, java.util.List<Initiative> initiatives) {
        if (milestone == null) return null;
        
        MilestoneDetailDTO dto = new MilestoneDetailDTO();
        dto.setMilestoneId(milestone.getMilestoneId());
        dto.setTitle(milestone.getTitle());
        dto.setDueDate(milestone.getDueDate());
        dto.setCompletionPercent(milestone.getCompletionPercent());
        dto.setStatus(milestone.getStatus());
        
        if (initiatives != null) {
            InitiativeMapper initiativeMapper = new InitiativeMapper();
            dto.setInitiatives(initiatives.stream()
                .map(initiativeMapper::toDTO)
                .collect(Collectors.toList()));
        }
        
        return dto;
    }
}

