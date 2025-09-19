package com.medimitra.backend.controller;

import com.medimitra.backend.model.User;
import com.medimitra.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Removed JwtUtil since using NextAuth.js

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest request) {
        try {
            // Check if user already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Email already registered"));
            }

            // Create new user
            User user = new User();
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setName(request.getName());
            user.setRole(request.getRole() != null ? request.getRole() : "patient");
            user.setEmailVerified(true); // Auto-verify for demo

            // Save user
            User savedUser = userRepository.save(user);

            // Return response (no JWT token since using NextAuth.js)
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User registered successfully");
            response.put("user", Map.of(
                "id", savedUser.getId(),
                "email", savedUser.getEmail(),
                "name", savedUser.getName(),
                "role", savedUser.getRole()
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-credentials")
    public ResponseEntity<?> verifyCredentials(@Valid @RequestBody LoginRequest request) {
        try {
            // Find user by email
            Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Invalid email or password"));
            }

            User user = userOptional.get();

            // Check password
            System.out.println("Debug: Checking password for user: " + user.getEmail());
            System.out.println("Debug: Stored password hash: " + user.getPassword());
            System.out.println("Debug: Input password: " + request.getPassword());
            
            boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
            System.out.println("Debug: Password matches: " + passwordMatches);
            
            if (!passwordMatches) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Invalid email or password"));
            }

            // Update last login
            try {
                userRepository.updateLastLogin(user.getId());
                System.out.println("Debug: Last login updated successfully for user: " + user.getEmail());
            } catch (Exception e) {
                System.out.println("Debug: Error updating last login: " + e.getMessage());
                e.printStackTrace();
            }

            // Return user data for NextAuth.js (no JWT token)
            try {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Credentials verified");
                
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", user.getId() != null ? user.getId() : "");
                userData.put("email", user.getEmail() != null ? user.getEmail() : "");
                userData.put("name", user.getName() != null ? user.getName() : "");
                userData.put("role", user.getRole() != null ? user.getRole() : "");
                userData.put("image", user.getImage() != null ? user.getImage() : "");
                
                response.put("user", userData);

                System.out.println("Debug: Returning successful response for user: " + user.getEmail());
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                System.out.println("Debug: Error building response: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Response building failed: " + e.getMessage()));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Verification failed: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        try {
            Optional<User> userOptional = userRepository.findByEmail(email);
            
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "User not found"));
            }

            User user = userOptional.get();

            return ResponseEntity.ok(Map.of(
                "success", true,
                "user", Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "name", user.getName(),
                    "role", user.getRole(),
                    "image", user.getImage(),
                    "emailVerified", user.isEmailVerified()
                )
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch user: " + e.getMessage()));
        }
    }

    @PostMapping("/oauth-user")
    public ResponseEntity<?> createOrUpdateOAuthUser(@Valid @RequestBody OAuthUserRequest request) {
        try {
            // Check if user exists
            Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
            
            if (existingUser.isPresent()) {
                // Update existing user with OAuth data
                User user = existingUser.get();
                user.setName(request.getName());
                user.setImage(request.getImage());
                user.setEmailVerified(true);
                
                User savedUser = userRepository.save(user);
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "User updated successfully",
                    "user", Map.of(
                        "id", savedUser.getId(),
                        "email", savedUser.getEmail(),
                        "name", savedUser.getName(),
                        "role", savedUser.getRole(),
                        "image", savedUser.getImage()
                    )
                ));
            } else {
                // Create new OAuth user
                User user = new User();
                user.setEmail(request.getEmail());
                user.setName(request.getName());
                user.setImage(request.getImage());
                user.setRole("patient"); // Default role for OAuth users
                user.setEmailVerified(true);
                user.setPassword(null); // OAuth users don't have passwords
                
                User savedUser = userRepository.save(user);
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "OAuth user created successfully",
                    "user", Map.of(
                        "id", savedUser.getId(),
                        "email", savedUser.getEmail(),
                        "name", savedUser.getName(),
                        "role", savedUser.getRole(),
                        "image", savedUser.getImage()
                    )
                ));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "OAuth user creation failed: " + e.getMessage()));
        }
    }

    // DTOs for request bodies
    public static class RegisterRequest {
        private String email;
        private String password;
        private String name;
        private String role;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class LoginRequest {
        private String email;
        private String password;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class OAuthUserRequest {
        private String email;
        private String name;
        private String image;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getImage() { return image; }
        public void setImage(String image) { this.image = image; }
    }
}
