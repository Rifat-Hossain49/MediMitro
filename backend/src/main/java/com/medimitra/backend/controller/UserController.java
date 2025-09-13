package com.medimitra.backend.controller;

import com.medimitra.backend.model.User;
import com.medimitra.backend.repository.UserRepository;
// import com.medimitra.backend.security.JwtAuthenticationFilter; // Removed - using NextAuth.js
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();

            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "User not found"));
            }

            User user = userOptional.get();
            Map<String, Object> profile = createUserProfileMap(user);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "user", profile
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch profile: " + e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(@Valid @RequestBody UpdateProfileRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();

            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "User not found"));
            }

            User user = userOptional.get();
            
            // Update user fields
            if (request.getName() != null) user.setName(request.getName());
            if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
            if (request.getDateOfBirth() != null) user.setDateOfBirth(request.getDateOfBirth());
            if (request.getGender() != null) user.setGender(request.getGender());
            if (request.getAddress() != null) user.setAddress(request.getAddress());
            if (request.getEmergencyContact() != null) user.setEmergencyContact(request.getEmergencyContact());
            if (request.getBloodType() != null) user.setBloodType(request.getBloodType());
            if (request.getAllergies() != null) user.setAllergies(request.getAllergies());
            if (request.getMedicalHistory() != null) user.setMedicalHistory(request.getMedicalHistory());
            if (request.getImage() != null) user.setImage(request.getImage());

            user.updateTimestamp();
            User updatedUser = userRepository.save(user);

            Map<String, Object> profile = createUserProfileMap(updatedUser);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Profile updated successfully",
                "user", profile
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to update profile: " + e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();

            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "User not found"));
            }

            User user = userOptional.get();

            // Verify current password
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Current password is incorrect"));
            }

            // Update password
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            user.updateTimestamp();
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password changed successfully"
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to change password: " + e.getMessage()));
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            List<Map<String, Object>> userList = users.stream()
                .map(this::createUserSummaryMap)
                .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "users", userList,
                "total", users.size()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch users: " + e.getMessage()));
        }
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUsersByRole(@PathVariable String role) {
        try {
            List<User> users = userRepository.findByRole(role);
            List<Map<String, Object>> userList = users.stream()
                .map(this::createUserSummaryMap)
                .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "users", userList,
                "total", users.size(),
                "role", role
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch users by role: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("total", userRepository.count());
            stats.put("patients", userRepository.countByRole("patient"));
            stats.put("doctors", userRepository.countByRole("doctor"));
            stats.put("pharmacists", userRepository.countByRole("pharmacist"));
            stats.put("admins", userRepository.countByRole("admin"));

            return ResponseEntity.ok(Map.of(
                "success", true,
                "stats", stats
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch user stats: " + e.getMessage()));
        }
    }

    // Helper methods
    private Map<String, Object> createUserProfileMap(User user) {
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("email", user.getEmail());
        profile.put("name", user.getName());
        profile.put("image", user.getImage());
        profile.put("role", user.getRole());
        profile.put("phoneNumber", user.getPhoneNumber());
        profile.put("dateOfBirth", user.getDateOfBirth());
        profile.put("gender", user.getGender());
        profile.put("address", user.getAddress());
        profile.put("emergencyContact", user.getEmergencyContact());
        profile.put("bloodType", user.getBloodType());
        profile.put("allergies", user.getAllergies());
        profile.put("medicalHistory", user.getMedicalHistory());
        profile.put("emailVerified", user.isEmailVerified());
        profile.put("createdAt", user.getCreatedAt());
        profile.put("updatedAt", user.getUpdatedAt());
        return profile;
    }

    private Map<String, Object> createUserSummaryMap(User user) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("id", user.getId());
        summary.put("email", user.getEmail());
        summary.put("name", user.getName());
        summary.put("role", user.getRole());
        summary.put("emailVerified", user.isEmailVerified());
        summary.put("createdAt", user.getCreatedAt());
        return summary;
    }

    // DTOs for request bodies
    public static class UpdateProfileRequest {
        private String name;
        private String phoneNumber;
        private java.time.LocalDateTime dateOfBirth;
        private String gender;
        private String address;
        private String emergencyContact;
        private String bloodType;
        private String allergies;
        private String medicalHistory;
        private String image;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public java.time.LocalDateTime getDateOfBirth() { return dateOfBirth; }
        public void setDateOfBirth(java.time.LocalDateTime dateOfBirth) { this.dateOfBirth = dateOfBirth; }

        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getEmergencyContact() { return emergencyContact; }
        public void setEmergencyContact(String emergencyContact) { this.emergencyContact = emergencyContact; }

        public String getBloodType() { return bloodType; }
        public void setBloodType(String bloodType) { this.bloodType = bloodType; }

        public String getAllergies() { return allergies; }
        public void setAllergies(String allergies) { this.allergies = allergies; }

        public String getMedicalHistory() { return medicalHistory; }
        public void setMedicalHistory(String medicalHistory) { this.medicalHistory = medicalHistory; }

        public String getImage() { return image; }
        public void setImage(String image) { this.image = image; }
    }

    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;

        // Getters and setters
        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
