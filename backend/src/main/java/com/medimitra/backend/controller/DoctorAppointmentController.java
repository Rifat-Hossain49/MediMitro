package com.medimitra.backend.controller;

import com.medimitra.backend.model.Appointment;
import com.medimitra.backend.repository.AppointmentRepository;
import com.medimitra.backend.repository.DoctorRepository;
import com.medimitra.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/doctor-appointments")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class DoctorAppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getDoctorAppointments(HttpServletRequest request) {
        try {
            // Get doctor ID from the authenticated user
            String doctorId = getDoctorIdFromRequest(request);
            if (doctorId == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Doctor not found"));
            }

            // Get all appointments for this doctor
            List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);
            
            // Enrich appointments with patient information
            for (Appointment appointment : appointments) {
                userRepository.findById(appointment.getPatientId()).ifPresent(patient -> {
                    Map<String, Object> patientInfo = new HashMap<>();
                    patientInfo.put("id", patient.getId());
                    patientInfo.put("name", patient.getName());
                    patientInfo.put("email", patient.getEmail());
                    patientInfo.put("phone", patient.getPhoneNumber());
                    patientInfo.put("image", patient.getImage());
                    appointment.setPatientInfo(patientInfo);
                });
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("appointments", appointments);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "Failed to fetch appointments: " + e.getMessage()));
        }
    }

    @GetMapping("/today")
    public ResponseEntity<?> getTodayAppointments(HttpServletRequest request) {
        try {
            String doctorId = getDoctorIdFromRequest(request);
            if (doctorId == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Doctor not found"));
            }

            List<Appointment> appointments = appointmentRepository.findTodayAppointmentsByDoctorId(doctorId);
            
            // Enrich appointments with patient information
            for (Appointment appointment : appointments) {
                userRepository.findById(appointment.getPatientId()).ifPresent(patient -> {
                    Map<String, Object> patientInfo = new HashMap<>();
                    patientInfo.put("id", patient.getId());
                    patientInfo.put("name", patient.getName());
                    patientInfo.put("email", patient.getEmail());
                    patientInfo.put("phone", patient.getPhoneNumber());
                    patientInfo.put("image", patient.getImage());
                    appointment.setPatientInfo(patientInfo);
                });
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("appointments", appointments);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "Failed to fetch today's appointments: " + e.getMessage()));
        }
    }

    @PutMapping("/{appointmentId}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable String appointmentId,
            @RequestParam String status,
            HttpServletRequest request) {
        try {
            String doctorId = getDoctorIdFromRequest(request);
            if (doctorId == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Doctor not found"));
            }

            Optional<Appointment> appointmentOptional = appointmentRepository.findById(appointmentId);
            if (appointmentOptional.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Appointment not found"));
            }

            Appointment appointment = appointmentOptional.get();
            
            // Verify this appointment belongs to the doctor
            if (!appointment.getDoctorId().equals(doctorId)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Unauthorized to update this appointment"));
            }

            appointment.setStatus(status);
            appointmentRepository.save(appointment);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Appointment status updated successfully");
            response.put("appointment", appointment);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "Failed to update appointment status: " + e.getMessage()));
        }
    }

    private String getDoctorIdFromRequest(HttpServletRequest request) {
        try {
            // Try to get from Spring Security context first
            String userEmail = request.getHeader("X-User-Email");
            if (userEmail != null) {
                Optional<String> userId = userRepository.findUserIdByEmail(userEmail);
                if (userId.isPresent()) {
                    Optional<String> doctorId = doctorRepository.findDoctorIdByUserId(userId.get());
                    return doctorId.orElse(null);
                }
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}

