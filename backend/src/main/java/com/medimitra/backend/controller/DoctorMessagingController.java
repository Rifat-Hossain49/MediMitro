package com.medimitra.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/doctor-portal/messaging")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class DoctorMessagingController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Send message to patient
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> messageData) {
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
            String patientId = (String) messageData.get("patientId");
            String message = (String) messageData.get("message");
            String messageType = (String) messageData.getOrDefault("messageType", "text");
            String appointmentId = (String) messageData.get("appointmentId");
            String attachmentUrl = (String) messageData.get("attachmentUrl");

            // Verify patient exists
            String checkPatientSql = "SELECT COUNT(*) FROM users WHERE id = ? AND role = 'patient'";
            int patientCount = jdbcTemplate.queryForObject(checkPatientSql, Integer.class, patientId);
            if (patientCount == 0) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Patient not found"));
            }

            // Insert message
            String insertMessageSql = """
                INSERT INTO doctor_patient_messages 
                (id, doctor_id, patient_id, appointment_id, sender_type, message, message_type, attachment_url, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

            String messageId = "msg_" + System.currentTimeMillis();
            int rowsAffected = jdbcTemplate.update(insertMessageSql,
                messageId, doctorId, patientId, appointmentId, "doctor", message, messageType, attachmentUrl, LocalDateTime.now());

            if (rowsAffected > 0) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Message sent successfully",
                    "messageId", messageId
                ));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Failed to send message"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to send message: " + e.getMessage()));
        }
    }

    // Get conversation with a patient
    @GetMapping("/conversation/{patientId}")
    public ResponseEntity<?> getConversation(@PathVariable String patientId, 
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "50") int size) {
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

            // Get conversation messages
            String sql = """
                SELECT m.*, 
                       CASE 
                           WHEN m.sender_type = 'doctor' THEN du.name
                           ELSE pu.name
                       END as sender_name,
                       CASE 
                           WHEN m.sender_type = 'doctor' THEN du.email
                           ELSE pu.email
                       END as sender_email
                FROM doctor_patient_messages m
                LEFT JOIN doctors d ON m.doctor_id = d.id
                LEFT JOIN users du ON d.user_id = du.id
                LEFT JOIN users pu ON m.patient_id = pu.id
                WHERE m.doctor_id = ? AND m.patient_id = ?
                ORDER BY m.created_at DESC
                LIMIT ? OFFSET ?
                """;

            List<Map<String, Object>> messages = jdbcTemplate.queryForList(sql, 
                doctorId, patientId, size, page * size);

            // Get patient info
            String getPatientSql = "SELECT id, name, email, phone_number FROM users WHERE id = ?";
            List<Map<String, Object>> patientResults = jdbcTemplate.queryForList(getPatientSql, patientId);
            Map<String, Object> patientInfo = patientResults.isEmpty() ? new HashMap<>() : patientResults.get(0);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "messages", messages,
                "patient", patientInfo,
                "pagination", Map.of(
                    "page", page,
                    "size", size,
                    "total", messages.size()
                )
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch conversation: " + e.getMessage()));
        }
    }

    // Get all conversations for doctor
    @GetMapping("/conversations")
    public ResponseEntity<?> getAllConversations() {
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

            // Get conversations with latest message
            String sql = """
                SELECT DISTINCT ON (m.patient_id) 
                       m.patient_id,
                       u.name as patient_name,
                       u.email as patient_email,
                       u.phone_number as patient_phone,
                       m.message as last_message,
                       m.created_at as last_message_time,
                       m.sender_type as last_sender_type,
                       COUNT(CASE WHEN m.sender_type = 'patient' AND m.is_read = false THEN 1 END) as unread_count
                FROM doctor_patient_messages m
                JOIN users u ON m.patient_id = u.id
                WHERE m.doctor_id = ?
                GROUP BY m.patient_id, u.name, u.email, u.phone_number, m.message, m.created_at, m.sender_type
                ORDER BY m.patient_id, m.created_at DESC
                """;

            List<Map<String, Object>> conversations = jdbcTemplate.queryForList(sql, doctorId);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "conversations", conversations
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch conversations: " + e.getMessage()));
        }
    }

    // Mark messages as read
    @PutMapping("/mark-read/{patientId}")
    public ResponseEntity<?> markMessagesAsRead(@PathVariable String patientId) {
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

            // Mark messages as read
            String markReadSql = """
                UPDATE doctor_patient_messages 
                SET is_read = true, read_at = ?
                WHERE doctor_id = ? AND patient_id = ? AND sender_type = 'patient' AND is_read = false
                """;

            int rowsAffected = jdbcTemplate.update(markReadSql, LocalDateTime.now(), doctorId, patientId);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Messages marked as read",
                "updatedCount", rowsAffected
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to mark messages as read: " + e.getMessage()));
        }
    }

    // Get unread message count
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount() {
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

            // Get unread count
            String unreadCountSql = """
                SELECT COUNT(*) as unread_count
                FROM doctor_patient_messages 
                WHERE doctor_id = ? AND sender_type = 'patient' AND is_read = false
                """;

            List<Map<String, Object>> results = jdbcTemplate.queryForList(unreadCountSql, doctorId);
            int unreadCount = ((Number) results.get(0).get("unread_count")).intValue();

            return ResponseEntity.ok(Map.of(
                "success", true,
                "unreadCount", unreadCount
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to get unread count: " + e.getMessage()));
        }
    }
}

