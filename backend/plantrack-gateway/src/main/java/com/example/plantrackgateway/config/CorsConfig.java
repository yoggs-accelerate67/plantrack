package com.example.plantrackgateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow your Angular frontend
        config.setAllowedOrigins(List.of("http://localhost:4200"));

        // Allow all standard HTTP methods, including OPTIONS (critical for CORS)
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // Allow all headers
        config.setAllowedHeaders(List.of("*"));

        // Required for JWT tokens and credentials
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this CORS config to all routes hitting the Gateway
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }
}