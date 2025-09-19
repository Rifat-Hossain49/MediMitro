package com.medimitra.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AdminController {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    // Get all pending doctor verifications
    @GetMapping("/pending-doctors")
    public ResponseEntity<?> getPendingDoctors() {
        try {
            // Enhanced query with all doctor credential fields
            String sql = """
                SELECT u.id, u.name, u.email, u.phone_number, u.created_at,
                       d.license_number, d.specialization, d.verification_status,
                       d.medical_degree, d.university, d.graduation_year, d.board_certification,
                       d.additional_qualifications, d.languages, d.bio, d.hospital, d.consultation_fee
                FROM users u
                LEFT JOIN doctors d ON u.id = d.user_id
                WHERE u.role = 'doctor' AND (d.verification_status = 'pending' OR d.verification_status IS NULL)
                ORDER BY u.created_at DESC
                """;

            List<Map<String, Object>> pendingDoctors = jdbcTemplate.queryForList(sql);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "doctors", pendingDoctors
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch pending doctors: " + e.getMessage()));
        }
    }

    // Verify a doctor
    @PostMapping("/verify-doctor/{userId}")
    public ResponseEntity<?> verifyDoctor(@PathVariable String userId, @RequestBody Map<String, Object> verificationData) {
        try {
            String action = (String) verificationData.get("action"); // "approve" or "reject"
            String adminId = (String) verificationData.get("adminId");
            String rejectionReason = (String) verificationData.get("rejectionReason");

            // Check if user exists and is a doctor
            String checkUserSql = "SELECT COUNT(*) FROM users WHERE id = ? AND role = 'doctor'";
            int userCount = jdbcTemplate.queryForObject(checkUserSql, Integer.class, userId);
            if (userCount == 0) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "User not found or not a doctor"));
            }

            if ("approve".equals(action)) {
                // Create doctor record if it doesn't exist
                String checkDoctorSql = "SELECT COUNT(*) FROM doctors WHERE user_id = ?";
                int doctorCount = jdbcTemplate.queryForObject(checkDoctorSql, Integer.class, userId);
                
                if (doctorCount == 0) {
                    // Get user data
                    String getUserSql = "SELECT * FROM users WHERE id = ?";
                    List<Map<String, Object>> userResults = jdbcTemplate.queryForList(getUserSql, userId);
                    if (userResults.isEmpty()) {
                        return ResponseEntity.badRequest()
                            .body(Map.of("success", false, "message", "User not found"));
                    }

                    // Create doctor record with default values
                    String createDoctorSql = """
                        INSERT INTO doctors (id, user_id, license_number, specialization, medical_degree, 
                        university, graduation_year, board_certification, additional_qualifications, 
                        languages, bio, hospital, consultation_fee, verification_documents, 
                        verification_status, is_verified, verified_at, verified_by, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """;

                    String doctorId = "doctor_" + System.currentTimeMillis();
                    jdbcTemplate.update(createDoctorSql,
                        doctorId, userId, "PENDING_LICENSE", "General Practice", "MD",
                        "University", 2020, "", "", "", "General Practice", 100.0, "",
                        "approved", true, LocalDateTime.now(), adminId, LocalDateTime.now(), LocalDateTime.now());
                } else {
                    // Update existing doctor record
                    String updateDoctorSql = """
                        UPDATE doctors SET 
                        verification_status = ?, is_verified = ?, verified_at = ?, verified_by = ?, updated_at = ?
                        WHERE user_id = ?
                        """;

                    jdbcTemplate.update(updateDoctorSql,
                        "approved", true, LocalDateTime.now(), adminId, LocalDateTime.now(), userId);
                }

                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Doctor approved successfully"
                ));

            } else if ("reject".equals(action)) {
                // Update doctor record to rejected
                String updateDoctorSql = """
                    UPDATE doctors SET 
                    verification_status = ?, is_verified = ?, rejection_reason = ?, verified_at = ?, verified_by = ?, updated_at = ?
                    WHERE user_id = ?
                    """;

                int rowsAffected = jdbcTemplate.update(updateDoctorSql,
                    "rejected", false, rejectionReason, LocalDateTime.now(), adminId, LocalDateTime.now(), userId);

                if (rowsAffected == 0) {
                    // Create doctor record with rejected status
                    String createDoctorSql = """
                        INSERT INTO doctors (id, user_id, license_number, specialization, medical_degree, 
                        university, graduation_year, board_certification, additional_qualifications, 
                        languages, bio, hospital, consultation_fee, verification_documents, 
                        verification_status, is_verified, rejection_reason, verified_at, verified_by, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """;

                    String doctorId = "doctor_" + System.currentTimeMillis();
                    jdbcTemplate.update(createDoctorSql,
                        doctorId, userId, "REJECTED", "General Practice", "MD",
                        "University", 2020, "", "", "", "General Practice", 100.0, "",
                        "rejected", false, rejectionReason, LocalDateTime.now(), adminId, LocalDateTime.now(), LocalDateTime.now());
                }

                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Doctor rejected successfully"
                ));
            } else {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Invalid action. Use 'approve' or 'reject'"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to verify doctor: " + e.getMessage()));
        }
    }

    // Get all verified doctors
    @GetMapping("/verified-doctors")
    public ResponseEntity<?> getVerifiedDoctors() {
        try {
            String sql = """
                SELECT d.*, u.name, u.email, u.phone_number, u.created_at as user_created_at
                FROM doctors d
                JOIN users u ON d.user_id = u.id
                WHERE d.verification_status = 'approved' AND d.is_verified = true
                ORDER BY d.verified_at DESC
                """;

            List<Map<String, Object>> verifiedDoctors = jdbcTemplate.queryForList(sql);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "verifiedDoctors", verifiedDoctors
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch verified doctors: " + e.getMessage()));
        }
    }

    // Get verification statistics
    @GetMapping("/verification-stats")
    public ResponseEntity<?> getVerificationStats() {
        try {
            String pendingSql = "SELECT COUNT(*) FROM users WHERE role = 'doctor' AND id NOT IN (SELECT user_id FROM doctors WHERE verification_status = 'approved')";
            String approvedSql = "SELECT COUNT(*) FROM doctors WHERE verification_status = 'approved' AND is_verified = true";
            String rejectedSql = "SELECT COUNT(*) FROM doctors WHERE verification_status = 'rejected'";

            int pendingCount = jdbcTemplate.queryForObject(pendingSql, Integer.class);
            int approvedCount = jdbcTemplate.queryForObject(approvedSql, Integer.class);
            int rejectedCount = jdbcTemplate.queryForObject(rejectedSql, Integer.class);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "stats", Map.of(
                    "pending", pendingCount,
                    "approved", approvedCount,
                    "rejected", rejectedCount,
                    "total", pendingCount + approvedCount + rejectedCount
                )
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch verification stats: " + e.getMessage()));
        }
    }

    // Create admin user
    @PostMapping("/create-admin")
    public ResponseEntity<Map<String, Object>> createAdmin(@RequestBody Map<String, String> adminData) {
        try {
            String email = adminData.get("email");
            String password = adminData.get("password");
            String name = adminData.get("name");
            
            if (email == null || password == null || name == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Email, password, and name are required"));
            }
            
            // Check if admin already exists
            String checkAdminSql = "SELECT id FROM users WHERE email = ? AND role = 'admin'";
            List<Map<String, Object>> existingAdmin = jdbcTemplate.queryForList(checkAdminSql, email);
            
            if (!existingAdmin.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Admin with this email already exists"));
            }
            
            // Create admin user
            String adminId = "admin_" + System.currentTimeMillis();
            String hashedPassword = passwordEncoder.encode(password);
            
            String insertAdminSql = """
                INSERT INTO users (id, email, password, name, role, email_verified, created_at, updated_at)
                VALUES (?, ?, ?, ?, 'admin', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """;
            
            jdbcTemplate.update(insertAdminSql, adminId, email, hashedPassword, name);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Admin user created successfully",
                "adminId", adminId
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "Failed to create admin: " + e.getMessage()));
        }
    }

    // Reset admin password
    @PostMapping("/reset-admin-password")
    public ResponseEntity<Map<String, Object>> resetAdminPassword(@RequestBody Map<String, String> adminData) {
        try {
            String email = adminData.get("email");
            String newPassword = adminData.get("password");
            
            if (email == null || newPassword == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Email and password are required"));
            }
            
            // Check if admin exists
            String checkAdminSql = "SELECT id FROM users WHERE email = ? AND role = 'admin'";
            List<Map<String, Object>> existingAdmin = jdbcTemplate.queryForList(checkAdminSql, email);
            
            if (existingAdmin.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Admin with this email does not exist"));
            }
            
            // Update admin password
            String hashedPassword = passwordEncoder.encode(newPassword);
            String updatePasswordSql = "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ? AND role = 'admin'";
            
            int updatedRows = jdbcTemplate.update(updatePasswordSql, hashedPassword, email);
            
            if (updatedRows > 0) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Admin password updated successfully"
                ));
            } else {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Failed to update password"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "Failed to reset admin password: " + e.getMessage()));
        }
    }
}
