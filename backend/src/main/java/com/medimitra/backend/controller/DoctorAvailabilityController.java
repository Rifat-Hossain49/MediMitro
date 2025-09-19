package com.medimitra.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@RestController
@RequestMapping("/doctor-portal/availability")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class DoctorAvailabilityController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Add availability slot
    @PostMapping("/slots")
    public ResponseEntity<?> addAvailabilitySlot(@RequestBody Map<String, Object> slotData) {
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
            String dayOfWeek = (String) slotData.get("dayOfWeek");
            String startTime = (String) slotData.get("startTime");
            String endTime = (String) slotData.get("endTime");
            Integer slotDuration = (Integer) slotData.getOrDefault("slotDuration", 30);
            Integer maxPatientsPerSlot = (Integer) slotData.getOrDefault("maxPatientsPerSlot", 1);

            // Check for overlapping slots
            String checkOverlapSql = """
                SELECT COUNT(*) FROM doctor_availability_slots 
                WHERE doctor_id = ? AND day_of_week = ? 
                AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))
                """;

            int overlapCount = jdbcTemplate.queryForObject(checkOverlapSql, Integer.class,
                doctorId, dayOfWeek, startTime, startTime, endTime, endTime);

            if (overlapCount > 0) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Time slot overlaps with existing availability"));
            }

            // Insert new slot
            String insertSlotSql = """
                INSERT INTO doctor_availability_slots 
                (id, doctor_id, day_of_week, start_time, end_time, slot_duration, max_patients_per_slot, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

            String slotId = "slot_" + System.currentTimeMillis();
            int rowsAffected = jdbcTemplate.update(insertSlotSql,
                slotId, doctorId, dayOfWeek, startTime, endTime, slotDuration, maxPatientsPerSlot,
                LocalDateTime.now(), LocalDateTime.now());

            if (rowsAffected > 0) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Availability slot added successfully",
                    "slotId", slotId
                ));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Failed to add availability slot"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to add slot: " + e.getMessage()));
        }
    }

    // Get doctor's availability slots
    @GetMapping("/slots")
    public ResponseEntity<?> getAvailabilitySlots() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            
            if (userEmail == null || userEmail.equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Not authenticated"));
            }

            String sql = """
                SELECT das.*, 
                       COUNT(a.id) as booked_appointments,
                       (das.max_patients_per_slot - COUNT(a.id)) as available_slots
                FROM doctor_availability_slots das
                JOIN doctors d ON das.doctor_id = d.id
                JOIN users u ON d.user_id = u.id
                LEFT JOIN appointments a ON das.id = a.availability_slot_id 
                    AND a.status IN ('scheduled', 'completed')
                    AND DATE(a.date_time) = CURRENT_DATE + INTERVAL '1 day' * (
                        CASE das.day_of_week
                            WHEN 'monday' THEN 1
                            WHEN 'tuesday' THEN 2
                            WHEN 'wednesday' THEN 3
                            WHEN 'thursday' THEN 4
                            WHEN 'friday' THEN 5
                            WHEN 'saturday' THEN 6
                            WHEN 'sunday' THEN 0
                        END - EXTRACT(DOW FROM CURRENT_DATE)
                    )
                WHERE u.email = ?
                GROUP BY das.id, das.doctor_id, das.day_of_week, das.start_time, das.end_time, 
                         das.slot_duration, das.is_available, das.max_patients_per_slot, 
                         das.created_at, das.updated_at
                ORDER BY das.day_of_week, das.start_time
                """;

            List<Map<String, Object>> slots = jdbcTemplate.queryForList(sql, userEmail);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "slots", slots
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch slots: " + e.getMessage()));
        }
    }

    // Update availability slot
    @PutMapping("/slots/{slotId}")
    public ResponseEntity<?> updateAvailabilitySlot(@PathVariable String slotId, @RequestBody Map<String, Object> slotData) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            
            if (userEmail == null || userEmail.equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Not authenticated"));
            }

            // Verify slot belongs to doctor
            String verifySlotSql = """
                SELECT COUNT(*) FROM doctor_availability_slots das
                JOIN doctors d ON das.doctor_id = d.id
                JOIN users u ON d.user_id = u.id
                WHERE das.id = ? AND u.email = ?
                """;

            int slotCount = jdbcTemplate.queryForObject(verifySlotSql, Integer.class, slotId, userEmail);
            if (slotCount == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Slot not found or access denied"));
            }

            // Update slot
            String updateSlotSql = """
                UPDATE doctor_availability_slots SET 
                day_of_week = ?, start_time = ?, end_time = ?, slot_duration = ?, 
                max_patients_per_slot = ?, is_available = ?, updated_at = ?
                WHERE id = ?
                """;

            int rowsAffected = jdbcTemplate.update(updateSlotSql,
                slotData.get("dayOfWeek"), slotData.get("startTime"), slotData.get("endTime"),
                slotData.get("slotDuration"), slotData.get("maxPatientsPerSlot"),
                slotData.get("isAvailable"), LocalDateTime.now(), slotId);

            if (rowsAffected > 0) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Slot updated successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Failed to update slot"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to update slot: " + e.getMessage()));
        }
    }

    // Delete availability slot
    @DeleteMapping("/slots/{slotId}")
    public ResponseEntity<?> deleteAvailabilitySlot(@PathVariable String slotId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            
            if (userEmail == null || userEmail.equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Not authenticated"));
            }

            // Verify slot belongs to doctor
            String verifySlotSql = """
                SELECT COUNT(*) FROM doctor_availability_slots das
                JOIN doctors d ON das.doctor_id = d.id
                JOIN users u ON d.user_id = u.id
                WHERE das.id = ? AND u.email = ?
                """;

            int slotCount = jdbcTemplate.queryForObject(verifySlotSql, Integer.class, slotId, userEmail);
            if (slotCount == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Slot not found or access denied"));
            }

            // Check if slot has future appointments
            String checkAppointmentsSql = """
                SELECT COUNT(*) FROM appointments 
                WHERE availability_slot_id = ? AND status = 'scheduled' AND date_time > NOW()
                """;

            int appointmentCount = jdbcTemplate.queryForObject(checkAppointmentsSql, Integer.class, slotId);
            if (appointmentCount > 0) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Cannot delete slot with future appointments"));
            }

            // Delete slot
            String deleteSlotSql = "DELETE FROM doctor_availability_slots WHERE id = ?";
            int rowsAffected = jdbcTemplate.update(deleteSlotSql, slotId);

            if (rowsAffected > 0) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Slot deleted successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Failed to delete slot"));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to delete slot: " + e.getMessage()));
        }
    }

    // Get available time slots for a specific date
    @GetMapping("/available-slots")
    public ResponseEntity<?> getAvailableSlots(@RequestParam String date) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            
            if (userEmail == null || userEmail.equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Not authenticated"));
            }

            // Get day of week for the requested date
            String getDayOfWeekSql = "SELECT EXTRACT(DOW FROM ?::date) as dow";
            List<Map<String, Object>> dowResults = jdbcTemplate.queryForList(getDayOfWeekSql, date);
            int dayOfWeekNum = ((Number) dowResults.get(0).get("dow")).intValue();
            
            String dayOfWeek = switch (dayOfWeekNum) {
                case 1 -> "monday";
                case 2 -> "tuesday";
                case 3 -> "wednesday";
                case 4 -> "thursday";
                case 5 -> "friday";
                case 6 -> "saturday";
                case 0 -> "sunday";
                default -> "monday";
            };

            String sql = """
                SELECT das.*, 
                       COUNT(a.id) as booked_appointments,
                       (das.max_patients_per_slot - COUNT(a.id)) as available_slots
                FROM doctor_availability_slots das
                JOIN doctors d ON das.doctor_id = d.id
                JOIN users u ON d.user_id = u.id
                LEFT JOIN appointments a ON das.id = a.availability_slot_id 
                    AND a.status = 'scheduled'
                    AND DATE(a.date_time) = ?::date
                WHERE u.email = ? AND das.day_of_week = ? AND das.is_available = true
                GROUP BY das.id, das.doctor_id, das.day_of_week, das.start_time, das.end_time, 
                         das.slot_duration, das.is_available, das.max_patients_per_slot, 
                         das.created_at, das.updated_at
                HAVING (das.max_patients_per_slot - COUNT(a.id)) > 0
                ORDER BY das.start_time
                """;

            List<Map<String, Object>> availableSlots = jdbcTemplate.queryForList(sql, date, userEmail, dayOfWeek);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "date", date,
                "dayOfWeek", dayOfWeek,
                "availableSlots", availableSlots
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch available slots: " + e.getMessage()));
        }
    }
}

