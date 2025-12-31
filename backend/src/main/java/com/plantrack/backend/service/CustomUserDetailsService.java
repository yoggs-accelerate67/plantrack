package com.plantrack.backend.service;

import com.plantrack.backend.model.User;
import com.plantrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // 1. Find the user by email
        User user = userRepository.findByEmail(email); // We need to add this to Repo!
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }

        // 2. Convert to Spring Security's "UserDetails" format
        // We map your "MANAGER" role to Spring's "ROLE_MANAGER" format
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );
    }
}