package com.plantrack.backend.config;

import org.springframework.beans.factory.annotation.Autowired; // Import for Autowired
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // Import for DELETE/PUT rules
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // --- FIX: This was missing in your code ---
    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter; 
    // ------------------------------------------

@Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // 1. PUBLIC ACCESS
                .requestMatchers("/api/auth/**").permitAll()

                // =========================================================
                // 2. SPECIFIC EXCEPTIONS (MUST COME BEFORE GENERIC RULES!)
                // =========================================================
                
                // Allow Managers to Create Plans under a User ID
                // This MUST be before "/api/users/**"
                .requestMatchers("/api/users/*/plans/**").hasAnyRole("MANAGER", "ADMIN")

                // =========================================================
                // 3. GENERIC ADMIN RULES
                // =========================================================
                .requestMatchers("/api/users/**").hasRole("ADMIN")

                // 4. REPORTING
                .requestMatchers("/api/reports/**").hasAnyRole("MANAGER", "ADMIN")

                // 5. OTHER PLAN/MILESTONE URLS
                .requestMatchers("/api/plans/**", "/api/milestones/**").hasAnyRole("MANAGER", "ADMIN")

                // 6. INITIATIVES (Strict Rules)
                .requestMatchers(HttpMethod.DELETE, "/api/initiatives/**").hasAnyRole("MANAGER", "ADMIN")
                .requestMatchers("/api/initiatives/**").hasAnyRole("MANAGER", "EMPLOYEE", "ADMIN")

                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}