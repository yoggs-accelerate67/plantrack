package com.plantrack.backend.mapper;

import com.plantrack.backend.dto.UserDTO;
import com.plantrack.backend.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDTO toDTO(User user) {
        if (user == null) return null;
        
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setDepartment(user.getDepartment());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        
        return dto;
    }

    public User toEntity(UserDTO dto) {
        if (dto == null) return null;
        
        User user = new User();
        user.setUserId(dto.getUserId());
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setDepartment(dto.getDepartment());
        user.setRole(dto.getRole());
        user.setStatus(dto.getStatus());
        
        return user;
    }
}


