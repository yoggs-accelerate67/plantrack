package com.plantrack.backend.service;

import com.plantrack.backend.model.User;
import com.plantrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditService auditService;

    public User createUser(User user) {
        // Hash password if provided
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        User savedUser = userRepository.save(user);
        
        // Audit Log
        auditService.logCreate("USER", savedUser.getUserId(),
            "Created user: " + savedUser.getName() + " (" + savedUser.getEmail() + ") with role: " + savedUser.getRole());
        
        return savedUser;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // UPDATED: Return User directly, not Optional
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        if (userDetails.getName() != null) {
            user.setName(userDetails.getName());
        }
        if (userDetails.getEmail() != null) {
            user.setEmail(userDetails.getEmail());
        }
        // Only update password if provided
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
        }
        if (userDetails.getDepartment() != null) {
            user.setDepartment(userDetails.getDepartment());
        }
        if (userDetails.getRole() != null) {
            user.setRole(userDetails.getRole());
        }
        if (userDetails.getStatus() != null) {
            user.setStatus(userDetails.getStatus());
        }
        
        User savedUser = userRepository.save(user);
        
        // Audit Log
        auditService.logUpdate("USER", id, "Updated user: " + savedUser.getName() + " (" + savedUser.getEmail() + ")");
        
        return savedUser;
    }

    // ADDED: Missing delete method
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        String userName = user.getName();
        String userEmail = user.getEmail();
        userRepository.deleteById(id);
        
        // Audit Log
        auditService.logDelete("USER", id, "Deleted user: " + userName + " (" + userEmail + ")");
    }
}