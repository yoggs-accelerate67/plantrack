package com.plantrack.backend.service;

import com.plantrack.backend.model.User;
import com.plantrack.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditService auditService;

    public User createUser(User user) {
        logger.debug("Creating user: email={}, name={}, role={}", 
                user.getEmail(), user.getName(), user.getRole());
        
        // Hash password if provided
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            logger.debug("Password hashed for user: email={}", user.getEmail());
        }
        User savedUser = userRepository.save(user);
        
        // Audit Log
        auditService.logCreate("USER", savedUser.getUserId(),
            "Created user: " + savedUser.getName() + " (" + savedUser.getEmail() + ") with role: " + savedUser.getRole());
        
        logger.info("User created: userId={}, email={}, name={}, role={}, department={}", 
                savedUser.getUserId(), savedUser.getEmail(), savedUser.getName(), 
                savedUser.getRole(), savedUser.getDepartment());
        return savedUser;
    }

    public List<User> getAllUsers() {
        logger.debug("Fetching all users");
        List<User> users = userRepository.findAll();
        logger.info("Retrieved {} users", users.size());
        return users;
    }

    // UPDATED: Return User directly, not Optional
    public User getUserById(Long id) {
        logger.debug("Fetching user by ID: userId={}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("User not found: userId={}", id);
                    return new RuntimeException("User not found with id: " + id);
                });
        logger.debug("Retrieved user: userId={}, email={}", id, user.getEmail());
        return user;
    }

    public User updateUser(Long id, User userDetails) {
        logger.debug("Updating user: userId={}, email={}", id, userDetails.getEmail());
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("User not found: userId={}", id);
                    return new RuntimeException("User not found with id: " + id);
                });
        
        if (userDetails.getName() != null) {
            user.setName(userDetails.getName());
        }
        if (userDetails.getEmail() != null) {
            user.setEmail(userDetails.getEmail());
        }
        // Only update password if provided
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
            logger.debug("Password updated for user: userId={}", id);
        }
        if (userDetails.getDepartment() != null) {
            user.setDepartment(userDetails.getDepartment());
        }
        if (userDetails.getRole() != null) {
            logger.info("User role changed: userId={}, oldRole={}, newRole={}", 
                    id, user.getRole(), userDetails.getRole());
            user.setRole(userDetails.getRole());
        }
        if (userDetails.getStatus() != null) {
            logger.info("User status changed: userId={}, oldStatus={}, newStatus={}", 
                    id, user.getStatus(), userDetails.getStatus());
            user.setStatus(userDetails.getStatus());
        }
        
        User savedUser = userRepository.save(user);
        
        // Audit Log
        auditService.logUpdate("USER", id, "Updated user: " + savedUser.getName() + " (" + savedUser.getEmail() + ")");
        
        logger.info("User updated: userId={}, email={}, name={}", 
                id, savedUser.getEmail(), savedUser.getName());
        return savedUser;
    }

    // ADDED: Missing delete method
    public void deleteUser(Long id) {
        logger.info("Deleting user: userId={}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    logger.error("User not found for deletion: userId={}", id);
                    return new RuntimeException("User not found with id: " + id);
                });
        
        String userName = user.getName();
        String userEmail = user.getEmail();
        userRepository.deleteById(id);
        
        // Audit Log
        auditService.logDelete("USER", id, "Deleted user: " + userName + " (" + userEmail + ")");
        
        logger.info("User deleted: userId={}, email={}, name={}", id, userEmail, userName);
    }
}