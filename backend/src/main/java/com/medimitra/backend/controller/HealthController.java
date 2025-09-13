package com.medimitra.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class HealthController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/status")
    public ResponseEntity<?> getHealthStatus() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check database connectivity
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            
            response.put("status", "UP");
            response.put("timestamp", LocalDateTime.now());
            response.put("service", "MediMitra Backend API");
            response.put("version", "1.0.0");
            response.put("database", "Connected");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("status", "DOWN");
            response.put("timestamp", LocalDateTime.now());
            response.put("service", "MediMitra Backend API");
            response.put("version", "1.0.0");
            response.put("database", "Disconnected");
            response.put("error", e.getMessage());
            
            return ResponseEntity.status(503).body(response);
        }
    }

    @GetMapping("/info")
    public ResponseEntity<?> getApplicationInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("application", "MediMitra Healthcare Management System");
        info.put("description", "Backend API for comprehensive healthcare management");
        info.put("version", "1.0.0");
        info.put("build", "Spring Boot 3.2.1");
        info.put("java", System.getProperty("java.version"));
        info.put("timestamp", LocalDateTime.now());
        
        Map<String, Object> features = new HashMap<>();
        features.put("authentication", "JWT-based authentication");
        features.put("authorization", "Role-based access control");
        features.put("database", "PostgreSQL with Spring JDBC");
        features.put("security", "Spring Security");
        features.put("cors", "Enabled for frontend integration");
        
        info.put("features", features);
        
        return ResponseEntity.ok(info);
    }
}

