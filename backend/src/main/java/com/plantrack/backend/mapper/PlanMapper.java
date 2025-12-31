package com.plantrack.backend.mapper;

import com.plantrack.backend.dto.PlanDTO;
import com.plantrack.backend.model.Plan;
import org.springframework.stereotype.Component;

@Component
public class PlanMapper {

    public PlanDTO toDTO(Plan plan) {
        if (plan == null) return null;
        
        PlanDTO dto = new PlanDTO();
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
        
        return dto;
    }

    public Plan toEntity(PlanDTO dto) {
        if (dto == null) return null;
        
        Plan plan = new Plan();
        plan.setPlanId(dto.getPlanId());
        plan.setTitle(dto.getTitle());
        plan.setDescription(dto.getDescription());
        plan.setPriority(dto.getPriority());
        plan.setStatus(dto.getStatus());
        plan.setStartDate(dto.getStartDate());
        plan.setEndDate(dto.getEndDate());
        
        return plan;
    }
}

