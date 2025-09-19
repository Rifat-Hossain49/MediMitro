package com.medimitra.backend.controller;

import com.medimitra.backend.model.Doctor;
import com.medimitra.backend.model.User;
import com.medimitra.backend.repository.DoctorRepository;
import com.medimitra.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/doctor-portal")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class DoctorPortalController {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Doctor registration with credentials
    @PostMapping("/register")
    public ResponseEntity<?> registerDoctor(@RequestBody Map<String, Object> doctorData) {
        try {
            // Extract user data
            String email = (String) doctorData.get("email");
            String password = (String) doctorData.get("password");
            String name = (String) doctorData.get("name");
            String phoneNumber = (String) doctorData.get("phoneNumber");
            String address = (String) doctorData.get("address");
            String gender = (String) doctorData.get("gender");
            String dateOfBirth = (String) doctorData.get("dateOfBirth");

            // Extract doctor-specific data
            String licenseNumber = (String) doctorData.get("licenseNumber");
            String specialization = (String) doctorData.get("specialization");
            String medicalDegree = (String) doctorData.get("medicalDegree");
            String university = (String) doctorData.get("university");
            Integer graduationYear = (Integer) doctorData.get("graduationYear");
            String boardCertification = (String) doctorData.get("boardCertification");
            String hospital = (String) doctorData.get("hospital");
            Double consultationFee = ((Number) doctorData.get("consultationFee")).doubleValue();
            String bio = (String) doctorData.get("bio");
            String languages = (String) doctorData.get("languages"); // JSON string
            String additionalQualifications = (String) doctorData.get("additionalQualifications"); // JSON string
            String verificationDocuments = (String) doctorData.get("verificationDocuments"); // JSON string

            // Check if user already exists
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Email already registered"));
            }

            // Check if license number already exists
            String checkLicenseSql = "SELECT COUNT(*) FROM doctors WHERE license_number = ?";
            int licenseCount = jdbcTemplate.queryForObject(checkLicenseSql, Integer.class, licenseNumber);
            if (licenseCount > 0) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "License number already exists"));
            }

            // Create user account
            User user = new User();
            user.setEmail(email);
            user.setPassword(password); // Will be encoded by UserRepository
            user.setName(name);
            user.setRole("doctor");
            user.setPhoneNumber(phoneNumber);
            user.setAddress(address);
            user.setGender(gender);
            user.setDateOfBirth(LocalDateTime.parse(dateOfBirth + "T00:00:00"));
            user.setEmailVerified(false);

            User savedUser = userRepository.save(user);

            // Create doctor profile
            String doctorId = "doctor_" + System.currentTimeMillis();
            String insertDoctorSql = """
                INSERT INTO doctors (id, user_id, license_number, specialization, medical_degree, 
                university, graduation_year, board_certification, additional_qualifications, 
                languages, bio, hospital, consultation_fee, verification_documents, 
                verification_status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

            jdbcTemplate.update(insertDoctorSql,
                doctorId, savedUser.getId(), licenseNumber, specialization, medicalDegree,
                university, graduationYear, boardCertification, additionalQualifications,
                languages, bio, hospital, consultationFee, verificationDocuments,
                "pending", LocalDateTime.now(), LocalDateTime.now());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Doctor registration submitted successfully. Awaiting verification.",
                "doctorId", doctorId,
                "userId", savedUser.getId()
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Registration failed: " + e.getMessage()));
        }
    }

    // Debug endpoint to check table columns
    @GetMapping("/debug-columns")
    public ResponseEntity<Map<String, Object>> getDoctorTableColumns() {
        try {
            String checkColumnsSql = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'doctors' ORDER BY ordinal_position";
            List<Map<String, Object>> columns = jdbcTemplate.queryForList(checkColumnsSql);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("columns", columns);
            response.put("total_columns", columns.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Migration endpoint to add missing columns
    @PostMapping("/migrate-schema")
    public ResponseEntity<Map<String, Object>> migrateDoctorSchema() {
        try {
            // Add missing columns to doctors table
            String addColumnsSql = """
                ALTER TABLE doctors 
                ADD COLUMN IF NOT EXISTS medical_degree VARCHAR(255),
                ADD COLUMN IF NOT EXISTS university VARCHAR(255),
                ADD COLUMN IF NOT EXISTS graduation_year INTEGER,
                ADD COLUMN IF NOT EXISTS board_certification VARCHAR(255),
                ADD COLUMN IF NOT EXISTS additional_qualifications TEXT,
                ADD COLUMN IF NOT EXISTS languages TEXT,
                ADD COLUMN IF NOT EXISTS bio TEXT,
                ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
                ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
                ADD COLUMN IF NOT EXISTS verification_documents TEXT,
                ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending',
                ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
                ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP,
                ADD COLUMN IF NOT EXISTS verified_by VARCHAR(255)
                """;
            
            jdbcTemplate.execute(addColumnsSql);
            
            // Update existing records with default values
            String updateExistingSql = """
                UPDATE doctors 
                SET 
                    medical_degree = 'Not Specified',
                    university = 'Not Specified',
                    graduation_year = 2000,
                    board_certification = 'Not Specified',
                    additional_qualifications = '[]',
                    languages = '[]',
                    bio = 'No bio provided',
                    is_verified = FALSE,
                    verification_status = 'pending'
                WHERE medical_degree IS NULL
                """;
            
            int updatedRows = jdbcTemplate.update(updateExistingSql);
            
            // Add constraints
            String addConstraintsSql = """
                ALTER TABLE doctors 
                ALTER COLUMN medical_degree SET NOT NULL,
                ALTER COLUMN university SET NOT NULL,
                ALTER COLUMN graduation_year SET NOT NULL
                """;
            
            jdbcTemplate.execute(addConstraintsSql);
            
            // Create indexes
            String createIndexesSql = """
                CREATE INDEX IF NOT EXISTS idx_doctors_verification_status ON doctors(verification_status);
                CREATE INDEX IF NOT EXISTS idx_doctors_is_verified ON doctors(is_verified)
                """;
            
            jdbcTemplate.execute(createIndexesSql);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Database schema migration completed successfully");
            response.put("updated_existing_records", updatedRows);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", "Migration failed: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // Get doctor profile
    @GetMapping("/profile")
    public ResponseEntity<?> getDoctorProfile(HttpServletRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            
            // If not authenticated through Spring Security, try to get email from header
            if (userEmail == null || userEmail.equals("anonymousUser")) {
                userEmail = request.getHeader("X-User-Email");
                if (userEmail == null || userEmail.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Not authenticated"));
                }
            }

            // First check if user exists
            String userSql = "SELECT * FROM users WHERE email = ?";
            List<Map<String, Object>> userResults = jdbcTemplate.queryForList(userSql, userEmail);
            if (userResults.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "User not found"));
            }

            Map<String, Object> user = userResults.get(0);

            // Check if doctor profile exists
            String doctorSql = """
                SELECT d.*, u.name, u.email, u.phone_number, u.address, u.gender, u.date_of_birth
                FROM doctors d
                JOIN users u ON d.user_id = u.id
                WHERE u.email = ?
                """;

            List<Map<String, Object>> doctorResults = jdbcTemplate.queryForList(doctorSql, userEmail);
            
            Map<String, Object> doctorProfile;
            if (doctorResults.isEmpty()) {
                // Create a default doctor profile for unverified doctors
                doctorProfile = new HashMap<>();
                doctorProfile.put("id", user.get("id"));
                doctorProfile.put("name", user.get("name"));
                doctorProfile.put("email", user.get("email"));
                doctorProfile.put("phone_number", user.get("phone_number"));
                doctorProfile.put("address", user.get("address"));
                doctorProfile.put("gender", user.get("gender"));
                doctorProfile.put("date_of_birth", user.get("date_of_birth"));
                doctorProfile.put("specialization", "General Medicine");
                doctorProfile.put("is_verified", false);
                doctorProfile.put("verification_status", "pending");
                doctorProfile.put("consultation_fee", 0);
                doctorProfile.put("rating", 0);
                doctorProfile.put("total_ratings", 0);
            } else {
                doctorProfile = doctorResults.get(0);
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "doctor", doctorProfile
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch profile: " + e.getMessage()));
        }
    }

    // Update doctor profile
    @PutMapping("/profile")
    public ResponseEntity<?> updateDoctorProfile(@RequestBody Map<String, Object> profileData) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            
            if (userEmail == null || userEmail.equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Not authenticated"));
            }

            // Get doctor ID
            String getDoctorIdSql = "SELECT d.id FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = ?";
            List<Map<String, Object>> doctorResults = jdbcTemplate.queryForList(getDoctorIdSql, userEmail);
            if (doctorResults.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Doctor not found"));
            }

            String doctorId = (String) doctorResults.get(0).get("id");

            // Update doctor profile
            String updateDoctorSql = """
                UPDATE doctors SET 
                specialization = ?, medical_degree = ?, university = ?, graduation_year = ?,
                board_certification = ?, additional_qualifications = ?, languages = ?,
                bio = ?, hospital = ?, consultation_fee = ?, updated_at = ?
                WHERE id = ?
                """;

            int rowsAffected = jdbcTemplate.update(updateDoctorSql,
                profileData.get("specialization"), profileData.get("medicalDegree"),
                profileData.get("university"), profileData.get("graduationYear"),
                profileData.get("boardCertification"), profileData.get("additionalQualifications"),
                profileData.get("languages"), profileData.get("bio"),
                profileData.get("hospital"), profileData.get("consultationFee"),
                LocalDateTime.now(), doctorId);

            if (rowsAffected > 0) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Profile updated successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Failed to update profile"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to update profile: " + e.getMessage()));
        }
    }

    // Submit doctor credentials for verification
    @PostMapping("/credentials")
    public ResponseEntity<?> submitCredentials(
            HttpServletRequest request,
            @RequestParam("medicalDegree") String medicalDegree,
            @RequestParam("university") String university,
            @RequestParam("graduationYear") String graduationYear,
            @RequestParam(value = "boardCertification", required = false) String boardCertification,
            @RequestParam(value = "additionalQualifications", required = false) String additionalQualifications,
            @RequestParam("languages") String languagesJson,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "hospital", required = false) String hospital,
            @RequestParam(value = "consultationFee", required = false) String consultationFeeStr,
            @RequestParam(value = "profilePicture", required = false) MultipartFile profilePicture,
            @RequestParam(value = "verificationDocument_0", required = false) MultipartFile[] verificationDocuments) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            
            // If not authenticated through Spring Security, try to get email from header
            if (userEmail == null || userEmail.equals("anonymousUser")) {
                userEmail = request.getHeader("X-User-Email");
                if (userEmail == null || userEmail.isEmpty()) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Not authenticated"));
                }
            }

            // Get user ID
            String getUserSql = "SELECT id FROM users WHERE email = ?";
            List<Map<String, Object>> userResults = jdbcTemplate.queryForList(getUserSql, userEmail);
            if (userResults.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "User not found"));
            }

            String userId = (String) userResults.get(0).get("id");
            String doctorId = "doctor_" + userId;

            // Parse languages JSON
            List<String> languages = new ArrayList<>();
            try {
                // Simple JSON parsing for languages array
                String languagesStr = languagesJson.replaceAll("[\\[\\]\"]", "");
                if (!languagesStr.isEmpty()) {
                    languages = Arrays.asList(languagesStr.split(","));
                }
            } catch (Exception e) {
                // If JSON parsing fails, treat as single language
                languages = Arrays.asList(languagesJson);
            }

            // Parse consultation fee
            int consultationFee = 0;
            try {
                consultationFee = Integer.parseInt(consultationFeeStr);
            } catch (NumberFormatException e) {
                // Keep default value of 0
            }

            // Parse graduation year
            int graduationYearInt = 2020; // Default value
            try {
                graduationYearInt = Integer.parseInt(graduationYear);
            } catch (NumberFormatException e) {
                // Keep default value
            }

            // Check if doctor already exists
            String checkDoctorSql = "SELECT id FROM doctors WHERE user_id = ?";
            List<Map<String, Object>> existingDoctor = jdbcTemplate.queryForList(checkDoctorSql, userId);

            if (existingDoctor.isEmpty()) {
                // First, let's check what columns actually exist in the doctors table
                try {
                    String checkColumnsSql = "SELECT column_name FROM information_schema.columns WHERE table_name = 'doctors'";
                    List<Map<String, Object>> columns = jdbcTemplate.queryForList(checkColumnsSql);
                    System.out.println("Available columns in doctors table: " + columns);
                } catch (Exception e) {
                    System.out.println("Error checking columns: " + e.getMessage());
                }

                // Create new doctor record with all credential fields
                String insertDoctorSql = """
                    INSERT INTO doctors (
                        id, user_id, license_number, specialization, medical_degree, university, graduation_year,
                        board_certification, additional_qualifications, languages, bio, hospital,
                        consultation_fee, is_verified, verification_status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """;

                // Generate a license number
                String licenseNumber = "LIC-" + System.currentTimeMillis();

                jdbcTemplate.update(insertDoctorSql,
                    doctorId, userId, licenseNumber, "General Medicine", medicalDegree, university, graduationYearInt,
                    boardCertification, additionalQualifications, String.join(",", languages), bio, hospital,
                    consultationFee, false, "pending"
                );

                System.out.println("Doctor record created successfully with all credentials");
            } else {
                // Update existing doctor record with all credential fields
                String updateDoctorSql = """
                    UPDATE doctors SET 
                        medical_degree = ?, university = ?, graduation_year = ?,
                        board_certification = ?, additional_qualifications = ?, languages = ?,
                        bio = ?, hospital = ?, consultation_fee = ?, verification_status = ?,
                        updated_at = ?
                    WHERE user_id = ?
                    """;

                jdbcTemplate.update(updateDoctorSql,
                    medicalDegree, university, graduationYearInt, boardCertification, additionalQualifications,
                    String.join(",", languages), bio, hospital, consultationFee, "pending",
                    LocalDateTime.now(), userId
                );
                
                System.out.println("Doctor record updated successfully with all credentials");
            }

            // Handle file uploads (simplified - in production, save to file storage)
            if (profilePicture != null && !profilePicture.isEmpty()) {
                // In production, save to cloud storage and store URL
                System.out.println("Profile picture uploaded: " + profilePicture.getOriginalFilename());
            }

            if (verificationDocuments != null) {
                for (MultipartFile doc : verificationDocuments) {
                    if (doc != null && !doc.isEmpty()) {
                        // In production, save to cloud storage and store URLs
                        System.out.println("Verification document uploaded: " + doc.getOriginalFilename());
                    }
                }
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Credentials submitted successfully. Your application is under review."
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to submit credentials: " + e.getMessage()));
        }
    }

    // Get doctor's appointments
    @GetMapping("/appointments")
    public ResponseEntity<?> getDoctorAppointments() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            
            if (userEmail == null || userEmail.equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Not authenticated"));
            }

            String sql = """
                SELECT a.*, u.name as patient_name, u.email as patient_email, u.phone_number as patient_phone
                FROM appointments a
                JOIN doctors d ON a.doctor_id = d.id
                JOIN users u ON a.patient_id = u.id
                JOIN users du ON d.user_id = du.id
                WHERE du.email = ?
                ORDER BY a.date_time DESC
                """;

            List<Map<String, Object>> appointments = jdbcTemplate.queryForList(sql, userEmail);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "appointments", appointments
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch appointments: " + e.getMessage()));
        }
    }

    // Get doctor's patients
    @GetMapping("/patients")
    public ResponseEntity<?> getDoctorPatients() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            
            if (userEmail == null || userEmail.equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Not authenticated"));
            }

            String sql = """
                SELECT DISTINCT u.id, u.name, u.email, u.phone_number, u.gender, u.date_of_birth,
                       COUNT(a.id) as total_appointments,
                       MAX(a.date_time) as last_appointment
                FROM users u
                JOIN appointments a ON u.id = a.patient_id
                JOIN doctors d ON a.doctor_id = d.id
                JOIN users du ON d.user_id = du.id
                WHERE du.email = ?
                GROUP BY u.id, u.name, u.email, u.phone_number, u.gender, u.date_of_birth
                ORDER BY last_appointment DESC
                """;

            List<Map<String, Object>> patients = jdbcTemplate.queryForList(sql, userEmail);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "patients", patients
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch patients: " + e.getMessage()));
        }
    }

    // Get verification status
    @GetMapping("/verification-status")
    public ResponseEntity<?> getVerificationStatus() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            
            if (userEmail == null || userEmail.equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Not authenticated"));
            }

            String sql = """
                SELECT verification_status, rejection_reason, verified_at, is_verified
                FROM doctors d
                JOIN users u ON d.user_id = u.id
                WHERE u.email = ?
                """;

            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, userEmail);
            if (results.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Doctor not found"));
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "verification", results.get(0)
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch verification status: " + e.getMessage()));
        }
    }
}
