package com.plantrack.backend.mapper;

import com.plantrack.backend.dto.InitiativeDTO;
import com.plantrack.backend.model.Initiative;
import org.springframework.stereotype.Component;

@Component
public class InitiativeMapper {

    public InitiativeDTO toDTO(Initiative initiative) {
        if (initiative == null) return null;
        
        InitiativeDTO dto = new InitiativeDTO();
        dto.setInitiativeId(initiative.getInitiativeId());
        dto.setTitle(initiative.getTitle());
        dto.setDescription(initiative.getDescription());
        dto.setStatus(initiative.getStatus());
        
        if (initiative.getMilestone() != null) {
            dto.setMilestoneId(initiative.getMilestone().getMilestoneId());
            dto.setMilestoneTitle(initiative.getMilestone().getTitle());
        }
        
        if (initiative.getAssignedUser() != null) {
            dto.setAssignedUserId(initiative.getAssignedUser().getUserId());
            dto.setAssignedUserName(initiative.getAssignedUser().getName());
        }
        
        return dto;
    }

    public Initiative toEntity(InitiativeDTO dto) {
        if (dto == null) return null;
        
        Initiative initiative = new Initiative();
        initiative.setInitiativeId(dto.getInitiativeId());
        initiative.setTitle(dto.getTitle());
        initiative.setDescription(dto.getDescription());
        initiative.setStatus(dto.getStatus());
        
        return initiative;
    }
}


