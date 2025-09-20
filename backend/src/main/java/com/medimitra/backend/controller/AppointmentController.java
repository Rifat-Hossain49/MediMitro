package com.medimitra.backend.controller;

import com.medimitra.backend.model.Appointment;
import com.medimitra.backend.model.Doctor;
import com.medimitra.backend.model.DoctorPatientMessage;
import com.medimitra.backend.repository.AppointmentRepository;
import com.medimitra.backend.repository.DoctorRepository;
import com.medimitra.backend.repository.DoctorPatientMessageRepository;
import com.medimitra.backend.repository.UserRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

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

    @Autowired
    private DoctorPatientMessageRepository messageRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

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
                        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'h:mm a"), // 2024-12-30T9:00 AM
                        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"), // 2024-12-30T09:00
                        DateTimeFormatter.ISO_LOCAL_DATE_TIME // 2024-12-30T09:00:00
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

            // Create initial conversation for messaging
            try {
                DoctorPatientMessage initialMessage = new DoctorPatientMessage();
                initialMessage.setId(UUID.randomUUID().toString());
                initialMessage.setDoctorId(request.getDoctorId());
                initialMessage.setPatientId(request.getPatientId());
                initialMessage.setAppointmentId(savedAppointment.getId());
                initialMessage.setSenderType("system");
                initialMessage.setMessage(
                        "Appointment confirmed! You can now communicate with your doctor through this chat.");
                initialMessage.setMessageType("text");
                initialMessage.setIsRead(false);
                initialMessage.setCreatedAt(LocalDateTime.now());

                messageRepository.save(initialMessage);
            } catch (Exception e) {
                // Log error but don't fail the appointment booking
                System.err.println("Failed to create initial conversation: " + e.getMessage());
            }

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
                    "symptoms", savedAppointment.getSymptoms()));

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
                    .body(Map.of("success", false, "message",
                            "Failed to fetch upcoming appointments: " + e.getMessage()));
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

            // If appointment is completed, create a conversation for messaging
            if ("completed".equals(request.getStatus())) {
                try {
                    DoctorPatientMessage initialMessage = new DoctorPatientMessage();
                    initialMessage.setId(UUID.randomUUID().toString());
                    initialMessage.setDoctorId(appointment.getDoctorId());
                    initialMessage.setPatientId(appointment.getPatientId());
                    initialMessage.setAppointmentId(appointment.getId());
                    initialMessage.setSenderType("system");
                    initialMessage.setMessage(
                            "Appointment completed! You can now communicate with your doctor through this chat for follow-up questions or concerns.");
                    initialMessage.setMessageType("text");
                    initialMessage.setIsRead(false);
                    initialMessage.setCreatedAt(LocalDateTime.now());

                    messageRepository.save(initialMessage);
                } catch (Exception e) {
                    // Log error but don't fail the appointment update
                    System.err.println("Failed to create conversation for completed appointment: " + e.getMessage());
                }
            }

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

            // Generate available slots (simplified - you can enhance this based on doctor's
            // availability)
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("availableSlots", generateAvailableSlots(startOfDay, existingAppointments));
            response.put("doctor", Map.of(
                    "id", doctor.getId(),
                    "consultationFee", doctor.getConsultationFee(),
                    "specialization", doctor.getSpecialization()));

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
                "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00");

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
        public String getPatientId() {
            return patientId;
        }

        public void setPatientId(String patientId) {
            this.patientId = patientId;
        }

        public String getDoctorId() {
            return doctorId;
        }

        public void setDoctorId(String doctorId) {
            this.doctorId = doctorId;
        }

        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }

        public String getTime() {
            return time;
        }

        public void setTime(String time) {
            this.time = time;
        }

        public int getDuration() {
            return duration;
        }

        public void setDuration(int duration) {
            this.duration = duration;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }

        public String getSymptoms() {
            return symptoms;
        }

        public void setSymptoms(String symptoms) {
            this.symptoms = symptoms;
        }
    }

    public static class UpdateStatusRequest {
        private String status;
        private String notes;

        // Getters and setters
        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }

    // Simple messaging endpoints for completed appointments
    @GetMapping("/messaging/conversations")
    public ResponseEntity<?> getConversations(HttpServletRequest request) {
        try {
            // Get authenticated user email from header
            String userEmail = request.getHeader("X-User-Email");
            if (userEmail == null || userEmail.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "User email not provided"));
            }

            // Get conversations from the messaging repository filtered by authenticated
            // user
            List<Map<String, Object>> conversations = messageRepository.findConversationsByUser(userEmail);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "conversations", conversations));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to fetch conversations: " + e.getMessage()));
        }
    }

    @GetMapping("/messaging/conversation/{doctorId}/{patientId}")
    public ResponseEntity<?> getMessages(@PathVariable String doctorId, @PathVariable String patientId,
            HttpServletRequest request) {
        try {
            // Get authenticated user email from header
            String userEmail = request.getHeader("X-User-Email");
            if (userEmail == null || userEmail.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "User email not provided"));
            }

            // Verify that the authenticated user is authorized to access this conversation
            String checkUserSql = "SELECT role FROM users WHERE email = ?";
            String userRole;
            try {
                userRole = jdbcTemplate.queryForObject(checkUserSql, String.class, userEmail);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "User not found"));
            }

            // Check authorization based on user role
            boolean isAuthorized = false;
            if ("patient".equals(userRole)) {
                // For patients, verify they are the patient in this conversation
                String checkPatientSql = "SELECT COUNT(*) FROM users WHERE email = ? AND id = ? AND role = 'patient'";
                int patientCount = jdbcTemplate.queryForObject(checkPatientSql, Integer.class, userEmail, patientId);
                isAuthorized = patientCount > 0;
            } else if ("doctor".equals(userRole)) {
                // For doctors, verify they are the doctor in this conversation
                String checkDoctorSql = "SELECT COUNT(*) FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = ? AND d.id = ?";
                int doctorCount = jdbcTemplate.queryForObject(checkDoctorSql, Integer.class, userEmail, doctorId);
                isAuthorized = doctorCount > 0;
            }

            if (!isAuthorized) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("success", false, "message", "Not authorized to access this conversation"));
            }

            List<DoctorPatientMessage> messages = messageRepository.findMessagesBetweenDoctorAndPatient(doctorId,
                    patientId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "messages", messages));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to fetch messages: " + e.getMessage()));
        }
    }

    @PostMapping("/messaging/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> messageData, HttpServletRequest request) {
        try {
            // Get authenticated user email from header
            String userEmail = request.getHeader("X-User-Email");
            if (userEmail == null || userEmail.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "User email not provided"));
            }

            String doctorId = (String) messageData.get("doctorId");
            String patientIdFromRequest = (String) messageData.get("patientId");
            String message = (String) messageData.get("message");
            String appointmentId = (String) messageData.get("appointmentId");
            String senderType = (String) messageData.get("senderType");
            String attachmentUrl = (String) messageData.get("attachmentUrl");
            String messageType = (String) messageData.get("messageType");

            String actualPatientId;

            // If sender is patient, resolve patient ID from authenticated user email
            if ("patient".equals(senderType)) {
                String getUserIdSql = "SELECT id FROM users WHERE email = ? AND role = 'patient'";
                try {
                    actualPatientId = jdbcTemplate.queryForObject(getUserIdSql, String.class, userEmail);
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("success", false, "message", "Patient not found for email: " + userEmail));
                }
            } else {
                // For doctor senders, use the patientId from request but verify doctor
                // authorization
                actualPatientId = patientIdFromRequest;

                // Verify that the authenticated user is actually the doctor
                String getDoctorIdSql = "SELECT d.id FROM doctors d JOIN users u ON d.user_id = u.id WHERE u.email = ? AND d.id = ?";
                try {
                    jdbcTemplate.queryForObject(getDoctorIdSql, String.class, userEmail, doctorId);
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("success", false, "message",
                                    "Not authorized to send messages as this doctor"));
                }
            }

            DoctorPatientMessage newMessage = new DoctorPatientMessage();
            newMessage.setId(UUID.randomUUID().toString());
            newMessage.setDoctorId(doctorId);
            newMessage.setPatientId(actualPatientId);
            newMessage.setAppointmentId(appointmentId);
            newMessage.setSenderType(senderType);
            newMessage.setMessage(message);
            newMessage.setMessageType(messageType != null ? messageType : "text");
            newMessage.setAttachmentUrl(attachmentUrl);
            newMessage.setIsRead(false);
            newMessage.setCreatedAt(LocalDateTime.now());

            messageRepository.save(newMessage);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Message sent successfully",
                    "messageId", newMessage.getId()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to send message: " + e.getMessage()));
        }
    }

    // Create messaging table if it doesn't exist
    @PostMapping("/messaging/create-table")
    public ResponseEntity<?> createMessagingTable() {
        try {
            String createTableSql = """
                    CREATE TABLE IF NOT EXISTS doctor_patient_messages (
                        id VARCHAR(255) PRIMARY KEY,
                        doctor_id VARCHAR(255) NOT NULL,
                        patient_id VARCHAR(255) NOT NULL,
                        appointment_id VARCHAR(255),
                        sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('doctor', 'patient', 'system')),
                        message TEXT NOT NULL,
                        message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'prescription')),
                        attachment_url TEXT,
                        is_read BOOLEAN DEFAULT FALSE,
                        read_at TIMESTAMP,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """;

            jdbcTemplate.execute(createTableSql);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Messaging table created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Failed to create table: " + e.getMessage()));
        }
    }
}
