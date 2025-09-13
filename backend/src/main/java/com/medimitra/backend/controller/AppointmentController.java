package com.medimitra.backend.controller;

import com.medimitra.backend.model.Appointment;
import com.medimitra.backend.model.Doctor;
import com.medimitra.backend.repository.AppointmentRepository;
import com.medimitra.backend.repository.DoctorRepository;
import com.medimitra.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/appointments")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@Valid @RequestBody BookAppointmentRequest request) {
        try {
            // Validate doctor exists
            Optional<Doctor> doctorOptional = doctorRepository.findById(request.getDoctorId());
            if (doctorOptional.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Doctor not found"));
            }

            Doctor doctor = doctorOptional.get();

            // Parse date and time - handle multiple formats
            LocalDateTime appointmentDateTime;
            try {
                // Try to parse the combined date and time string
                String dateTimeString = request.getDate() + "T" + request.getTime();
                
                // Try different date formats
                DateTimeFormatter[] formatters = {
                    DateTimeFormatter.ofPattern("yyyy-MM-dd'T'h:mm a"),  // 2024-12-30T9:00 AM
                    DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"),   // 2024-12-30T09:00
                    DateTimeFormatter.ISO_LOCAL_DATE_TIME                // 2024-12-30T09:00:00
                };
                
                appointmentDateTime = null;
                for (DateTimeFormatter formatter : formatters) {
                    try {
                        appointmentDateTime = LocalDateTime.parse(dateTimeString, formatter);
                        break;
                    } catch (DateTimeParseException e) {
                        // Try next formatter
                    }
                }
                
                if (appointmentDateTime == null) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Invalid date/time format: " + dateTimeString));
                }
            } catch (Exception e) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Failed to parse date/time: " + e.getMessage()));
            }

            // Check for conflicts
            if (appointmentRepository.hasConflictingAppointment(
                request.getDoctorId(), appointmentDateTime, request.getDuration(), null)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Time slot is not available"));
            }

            // Create appointment
            Appointment appointment = new Appointment();
            appointment.setPatientId(request.getPatientId());
            appointment.setDoctorId(request.getDoctorId());
            appointment.setDateTime(appointmentDateTime);
            appointment.setDuration(request.getDuration());
            appointment.setType(request.getType());
            appointment.setStatus("scheduled");
            appointment.setNotes(request.getNotes());
            appointment.setSymptoms(request.getSymptoms());
            appointment.setFee(doctor.getConsultationFee());

            // Save appointment
            Appointment savedAppointment = appointmentRepository.save(appointment);

            // Return response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Appointment booked successfully");
            response.put("appointment", Map.of(
                "id", savedAppointment.getId(),
                "patientId", savedAppointment.getPatientId(),
                "doctorId", savedAppointment.getDoctorId(),
                "dateTime", savedAppointment.getDateTime().toString(),
                "duration", savedAppointment.getDuration(),
                "type", savedAppointment.getType(),
                "status", savedAppointment.getStatus(),
                "fee", savedAppointment.getFee(),
                "notes", savedAppointment.getNotes(),
                "symptoms", savedAppointment.getSymptoms()
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to book appointment: " + e.getMessage()));
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientAppointments(@PathVariable String patientId) {
        try {
            List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("appointments", appointments);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch appointments: " + e.getMessage()));
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getDoctorAppointments(@PathVariable String doctorId) {
        try {
            List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("appointments", appointments);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch appointments: " + e.getMessage()));
        }
    }

    @GetMapping("/upcoming/{userId}")
    public ResponseEntity<?> getUpcomingAppointments(@PathVariable String userId, @RequestParam String role) {
        try {
            List<Appointment> appointments = appointmentRepository.findUpcomingAppointments(userId, role);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("appointments", appointments);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch upcoming appointments: " + e.getMessage()));
        }
    }

    @PutMapping("/{appointmentId}/status")
    public ResponseEntity<?> updateAppointmentStatus(@PathVariable String appointmentId, 
                                                   @RequestBody UpdateStatusRequest request) {
        try {
            Optional<Appointment> appointmentOptional = appointmentRepository.findById(appointmentId);
            if (appointmentOptional.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Appointment not found"));
            }

            Appointment appointment = appointmentOptional.get();
            appointment.setStatus(request.getStatus());
            if (request.getNotes() != null) {
                appointment.setNotes(request.getNotes());
            }

            Appointment updatedAppointment = appointmentRepository.save(appointment);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Appointment status updated successfully");
            response.put("appointment", updatedAppointment);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to update appointment: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{appointmentId}")
    public ResponseEntity<?> cancelAppointment(@PathVariable String appointmentId) {
        try {
            Optional<Appointment> appointmentOptional = appointmentRepository.findById(appointmentId);
            if (appointmentOptional.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Appointment not found"));
            }

            appointmentRepository.deleteById(appointmentId);

            return ResponseEntity.ok(Map.of("success", true, "message", "Appointment cancelled successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to cancel appointment: " + e.getMessage()));
        }
    }

    @GetMapping("/available-slots/{doctorId}")
    public ResponseEntity<?> getAvailableSlots(@PathVariable String doctorId, @RequestParam String date) {
        try {
            // Get doctor's availability
            Optional<Doctor> doctorOptional = doctorRepository.findById(doctorId);
            if (doctorOptional.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Doctor not found"));
            }

            Doctor doctor = doctorOptional.get();
            
            // Parse date
            LocalDateTime startOfDay = LocalDateTime.parse(date + "T00:00:00");
            LocalDateTime endOfDay = startOfDay.plusDays(1);

            // Get existing appointments for the day
            List<Appointment> existingAppointments = appointmentRepository
                .findByDoctorIdAndDateRange(doctorId, startOfDay, endOfDay);

            // Generate available slots (simplified - you can enhance this based on doctor's availability)
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("availableSlots", generateAvailableSlots(startOfDay, existingAppointments));
            response.put("doctor", Map.of(
                "id", doctor.getId(),
                "consultationFee", doctor.getConsultationFee(),
                "specialization", doctor.getSpecialization()
            ));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to fetch available slots: " + e.getMessage()));
        }
    }

    private List<String> generateAvailableSlots(LocalDateTime startOfDay, List<Appointment> existingAppointments) {
        // Simple implementation - generate hourly slots from 9 AM to 5 PM
        // You can enhance this to use doctor's actual availability
        List<String> slots = List.of(
            "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
        );
        
        // Filter out booked slots
        return slots.stream()
            .filter(slot -> !isSlotBooked(slot, existingAppointments))
            .toList();
    }

    private boolean isSlotBooked(String slot, List<Appointment> existingAppointments) {
        // Check if slot is already booked
        return existingAppointments.stream()
            .anyMatch(appointment -> {
                String appointmentTime = appointment.getDateTime().toLocalTime().toString().substring(0, 5);
                return appointmentTime.equals(slot);
            });
    }

    // DTOs for request bodies
    public static class BookAppointmentRequest {
        private String patientId;
        private String doctorId;
        private String date;
        private String time;
        private int duration = 30;
        private String type = "in-person";
        private String notes;
        private String symptoms;

        // Getters and setters
        public String getPatientId() { return patientId; }
        public void setPatientId(String patientId) { this.patientId = patientId; }

        public String getDoctorId() { return doctorId; }
        public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public String getTime() { return time; }
        public void setTime(String time) { this.time = time; }

        public int getDuration() { return duration; }
        public void setDuration(int duration) { this.duration = duration; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }

        public String getSymptoms() { return symptoms; }
        public void setSymptoms(String symptoms) { this.symptoms = symptoms; }
    }

    public static class UpdateStatusRequest {
        private String status;
        private String notes;

        // Getters and setters
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}
