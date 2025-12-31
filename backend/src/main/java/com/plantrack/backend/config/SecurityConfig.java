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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // --- FIX: This was missing in your code ---
    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter; 
    // ------------------------------------------

@Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Allow Swagger UI
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
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

                // 5. PLAN RULES (Bob can delete, Alice can create)
                .requestMatchers(HttpMethod.POST, "/api/users/*/plans").hasAnyRole("MANAGER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/plans/**").hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/plans/**").hasAnyRole("MANAGER", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/plans/**").hasAnyRole("MANAGER", "ADMIN", "EMPLOYEE")

                // 6. MILESTONE RULES (Only Managers can create/update)
                .requestMatchers(HttpMethod.POST, "/api/plans/*/milestones").hasAnyRole("MANAGER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/milestones/**").hasAnyRole("MANAGER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/milestones/**").hasAnyRole("MANAGER", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/milestones/**").hasAnyRole("MANAGER", "ADMIN", "EMPLOYEE")

                // 7. INITIATIVE RULES (Managers create, Employees can only update status)
                .requestMatchers(HttpMethod.POST, "/api/milestones/*/initiatives").hasAnyRole("MANAGER", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/initiatives/**").hasAnyRole("MANAGER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/initiatives/**").hasAnyRole("MANAGER", "ADMIN", "EMPLOYEE")
                .requestMatchers(HttpMethod.GET, "/api/initiatives/**").hasAnyRole("MANAGER", "ADMIN", "EMPLOYEE")

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