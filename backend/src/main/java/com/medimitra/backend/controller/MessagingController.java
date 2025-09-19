package com.medimitra.backend.controller;

import com.medimitra.backend.model.DoctorPatientMessage;
import com.medimitra.backend.repository.DoctorPatientMessageRepository;
import com.medimitra.backend.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messaging")
@CrossOrigin(origins = "*")
public class MessagingController {

    @Autowired
    private DoctorPatientMessageRepository messageRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    // Simple test endpoint
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of("success", true, "message", "Messaging controller is working"));
    }

    // Get all conversations for a user (patient or doctor)
    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            
            // Get conversations where user is either doctor or patient
            List<Map<String, Object>> conversations = messageRepository.findConversationsByUser(userEmail);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "conversations", conversations
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "Failed to fetch conversations: " + e.getMessage()));
        }
    }

    // Get messages between a specific doctor and patient
    @GetMapping("/conversation/{doctorId}/{patientId}")
    public ResponseEntity<?> getMessages(@PathVariable String doctorId, @PathVariable String patientId) {
        try {
            List<DoctorPatientMessage> messages = messageRepository.findMessagesBetweenDoctorAndPatient(doctorId, patientId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "messages", messages
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "Failed to fetch messages: " + e.getMessage()));
        }
    }

    // Send a message
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> messageData) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            
            String doctorId = (String) messageData.get("doctorId");
            String patientId = (String) messageData.get("patientId");
            String message = (String) messageData.get("message");
            String appointmentId = (String) messageData.get("appointmentId");
            String senderType = (String) messageData.get("senderType"); // "doctor" or "patient"
            
            // Verify the user is authorized to send this message
            if (!isUserAuthorizedForMessage(userEmail, doctorId, patientId, senderType)) {
                return ResponseEntity.status(403)
                    .body(Map.of("success", false, "message", "Unauthorized to send this message"));
            }
            
            // Check if appointment is confirmed (only allow messaging after confirmation)
            if (appointmentId != null) {
                if (!isAppointmentConfirmed(appointmentId)) {
                    return ResponseEntity.status(400)
                        .body(Map.of("success", false, "message", "Can only message after appointment is confirmed"));
                }
            }
            
            DoctorPatientMessage newMessage = new DoctorPatientMessage();
            newMessage.setId(UUID.randomUUID().toString());
            newMessage.setDoctorId(doctorId);
            newMessage.setPatientId(patientId);
            newMessage.setAppointmentId(appointmentId);
            newMessage.setSenderType(senderType);
            newMessage.setMessage(message);
            newMessage.setMessageType("text");
            newMessage.setIsRead(false);
            newMessage.setCreatedAt(LocalDateTime.now());
            
            messageRepository.save(newMessage);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Message sent successfully",
                "messageId", newMessage.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "Failed to send message: " + e.getMessage()));
        }
    }

    // Mark message as read
    @PutMapping("/read/{messageId}")
    public ResponseEntity<?> markAsRead(@PathVariable String messageId) {
        try {
            messageRepository.markAsRead(messageId, LocalDateTime.now());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Message marked as read"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "Failed to mark message as read: " + e.getMessage()));
        }
    }

    // Get unread message count for a user
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = auth.getName();
            
            int unreadCount = messageRepository.getUnreadCountForUser(userEmail);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "unreadCount", unreadCount
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "Failed to get unread count: " + e.getMessage()));
        }
    }

    private boolean isUserAuthorizedForMessage(String userEmail, String doctorId, String patientId, String senderType) {
        // This is a simplified check - in a real app, you'd verify the user's role and IDs
        // For now, we'll allow if the user is authenticated
        return userEmail != null && !userEmail.isEmpty();
    }

    private boolean isAppointmentConfirmed(String appointmentId) {
        try {
            return appointmentRepository.isAppointmentConfirmed(appointmentId);
        } catch (Exception e) {
            return false;
        }
    }

    // Create initial conversation when appointment is confirmed
    @PostMapping("/create-conversation")
    public ResponseEntity<?> createConversation(@RequestBody Map<String, Object> conversationData) {
        try {
            String doctorId = (String) conversationData.get("doctorId");
            String patientId = (String) conversationData.get("patientId");
            String appointmentId = (String) conversationData.get("appointmentId");
            String message = (String) conversationData.get("message");
            
            if (doctorId == null || patientId == null || appointmentId == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Missing required fields"));
            }
            
            // Check if appointment is confirmed
            if (!isAppointmentConfirmed(appointmentId)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Can only create conversation for confirmed appointments"));
            }
            
            // Create initial message
            DoctorPatientMessage initialMessage = new DoctorPatientMessage();
            initialMessage.setId(UUID.randomUUID().toString());
            initialMessage.setDoctorId(doctorId);
            initialMessage.setPatientId(patientId);
            initialMessage.setAppointmentId(appointmentId);
            initialMessage.setSenderType("system");
            initialMessage.setMessage(message != null ? message : "Appointment confirmed. You can now communicate with your doctor.");
            initialMessage.setMessageType("text");
            initialMessage.setIsRead(false);
            initialMessage.setCreatedAt(LocalDateTime.now());
            
            messageRepository.save(initialMessage);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Conversation created successfully",
                "conversationId", initialMessage.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "message", "Failed to create conversation: " + e.getMessage()));
        }
    }
}

