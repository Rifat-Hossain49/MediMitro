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
@RequestMapping("/doctor-portal/meetings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class DoctorMeetingController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Create a new meeting
    @PostMapping("/create")
    public ResponseEntity<?> createMeeting(@RequestBody Map<String, Object> meetingData) {
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
            String patientId = (String) meetingData.get("patientId");
            String meetingTitle = (String) meetingData.get("meetingTitle");
            String meetingDescription = (String) meetingData.get("meetingDescription");
            String scheduledTime = (String) meetingData.get("scheduledTime");
            Integer durationMinutes = (Integer) meetingData.getOrDefault("durationMinutes", 60);
            String appointmentId = (String) meetingData.get("appointmentId");

            // Verify patient exists
            String checkPatientSql = "SELECT COUNT(*) FROM users WHERE id = ? AND role = 'patient'";
            int patientCount = jdbcTemplate.queryForObject(checkPatientSql, Integer.class, patientId);
            if (patientCount == 0) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Patient not found"));
            }

            // Generate meeting ID and link (in real implementation, integrate with video service)
            String meetingId = "meeting_" + System.currentTimeMillis();
            String meetingLink = "https://meet.medimitra.com/" + meetingId;

            // Insert meeting
            String insertMeetingSql = """
                INSERT INTO video_meetings 
                (id, doctor_id, patient_id, appointment_id, meeting_title, meeting_description, 
                 meeting_link, meeting_id, scheduled_time, duration_minutes, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

            String videoMeetingId = "vm_" + System.currentTimeMillis();
            int rowsAffected = jdbcTemplate.update(insertMeetingSql,
                videoMeetingId, doctorId, patientId, appointmentId, meetingTitle, meetingDescription,
                meetingLink, meetingId, LocalDateTime.parse(scheduledTime), durationMinutes, "scheduled",
                LocalDateTime.now(), LocalDateTime.now());

            if (rowsAffected > 0) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Meeting created successfully",
                    "meetingId", videoMeetingId,
                    "meetingLink", meetingLink,
                    "meetingData", Map.of(
                        "id", videoMeetingId,
                        "meetingId", meetingId,
                        "meetingLink", meetingLink,
                        "scheduledTime", scheduledTime,
                        "durationMinutes", durationMinutes
                    )
                ));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Failed to create meeting"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to create meeting: " + e.getMessage()));
        }
    }

    // Get doctor's meetings
    @GetMapping
    public ResponseEntity<?> getDoctorMeetings(@RequestParam(defaultValue = "all") String status) {
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

            String sql;
            List<Object> params = new ArrayList<>();
            params.add(doctorId);

            if (!"all".equals(status)) {
                sql = """
                    SELECT vm.*, u.name as patient_name, u.email as patient_email, u.phone_number as patient_phone
                    FROM video_meetings vm
                    JOIN users u ON vm.patient_id = u.id
                    WHERE vm.doctor_id = ? AND vm.status = ?
                    ORDER BY vm.scheduled_time DESC
                    """;
                params.add(status);
            } else {
                sql = """
                    SELECT vm.*, u.name as patient_name, u.email as patient_email, u.phone_number as patient_phone
                    FROM video_meetings vm
                    JOIN users u ON vm.patient_id = u.id
                    WHERE vm.doctor_id = ?
                    ORDER BY vm.scheduled_time DESC
                    """;
            }

            List<Map<String, Object>> meetings = jdbcTemplate.queryForList(sql, params.toArray());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "meetings", meetings
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch meetings: " + e.getMessage()));
        }
    }

    // Update meeting status
    @PutMapping("/{meetingId}/status")
    public ResponseEntity<?> updateMeetingStatus(@PathVariable String meetingId, @RequestBody Map<String, Object> statusData) {
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
            String status = (String) statusData.get("status");
            String recordingUrl = (String) statusData.get("recordingUrl");

            // Verify meeting belongs to doctor
            String verifyMeetingSql = "SELECT COUNT(*) FROM video_meetings WHERE id = ? AND doctor_id = ?";
            int meetingCount = jdbcTemplate.queryForObject(verifyMeetingSql, Integer.class, meetingId, doctorId);
            if (meetingCount == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Meeting not found or access denied"));
            }

            // Update meeting status
            String updateStatusSql = """
                UPDATE video_meetings SET 
                status = ?, recording_url = ?, updated_at = ?
                WHERE id = ?
                """;

            int rowsAffected = jdbcTemplate.update(updateStatusSql,
                status, recordingUrl, LocalDateTime.now(), meetingId);

            if (rowsAffected > 0) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Meeting status updated successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Failed to update meeting status"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to update meeting status: " + e.getMessage()));
        }
    }

    // Cancel meeting
    @PutMapping("/{meetingId}/cancel")
    public ResponseEntity<?> cancelMeeting(@PathVariable String meetingId) {
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

            // Verify meeting belongs to doctor
            String verifyMeetingSql = "SELECT COUNT(*) FROM video_meetings WHERE id = ? AND doctor_id = ?";
            int meetingCount = jdbcTemplate.queryForObject(verifyMeetingSql, Integer.class, meetingId, doctorId);
            if (meetingCount == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Meeting not found or access denied"));
            }

            // Cancel meeting
            String cancelMeetingSql = """
                UPDATE video_meetings SET 
                status = 'cancelled', updated_at = ?
                WHERE id = ?
                """;

            int rowsAffected = jdbcTemplate.update(cancelMeetingSql, LocalDateTime.now(), meetingId);

            if (rowsAffected > 0) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Meeting cancelled successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Failed to cancel meeting"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to cancel meeting: " + e.getMessage()));
        }
    }

    // Get meeting details
    @GetMapping("/{meetingId}")
    public ResponseEntity<?> getMeetingDetails(@PathVariable String meetingId) {
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

            String sql = """
                SELECT vm.*, u.name as patient_name, u.email as patient_email, u.phone_number as patient_phone
                FROM video_meetings vm
                JOIN users u ON vm.patient_id = u.id
                WHERE vm.id = ? AND vm.doctor_id = ?
                """;

            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, meetingId, doctorId);
            if (results.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Meeting not found"));
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "meeting", results.get(0)
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch meeting details: " + e.getMessage()));
        }
    }
}

