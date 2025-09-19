package com.medimitra.backend.controller;

import com.medimitra.backend.model.Doctor;
import com.medimitra.backend.repository.DoctorRepository;
import com.medimitra.backend.repository.UserRepository;
import com.medimitra.backend.service.AIDoctorSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/doctors")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class DoctorController {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AIDoctorSearchService aiDoctorSearchService;

    @GetMapping
    public ResponseEntity<?> getAllDoctors() {
        try {
            // Only return verified doctors for appointment booking
            List<Doctor> doctors = doctorRepository.findVerifiedDoctors();
            
            // Enrich doctors with user information
            for (Doctor doctor : doctors) {
                userRepository.findById(doctor.getUserId()).ifPresent(user -> {
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("id", user.getId());
                    userInfo.put("name", user.getName());
                    userInfo.put("email", user.getEmail());
                    userInfo.put("image", user.getImage());
                    doctor.setUserInfo(userInfo);
                });
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("doctors", doctors);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "Failed to fetch doctors: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDoctorById(@PathVariable String id) {
        try {
            Optional<Doctor> doctorOptional = doctorRepository.findById(id);
            if (doctorOptional.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Doctor not found"));
            }

            Doctor doctor = doctorOptional.get();
            
            // Enrich doctor with user information
            userRepository.findById(doctor.getUserId()).ifPresent(user -> {
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("id", user.getId());
                userInfo.put("name", user.getName());
                userInfo.put("email", user.getEmail());
                userInfo.put("image", user.getImage());
                doctor.setUserInfo(userInfo);
            });
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("doctor", doctor);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "Failed to fetch doctor: " + e.getMessage()));
        }
    }

    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<?> getDoctorsBySpecialization(@PathVariable String specialization) {
        try {
            List<Doctor> doctors = doctorRepository.findVerifiedDoctorsBySpecialization(specialization);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("doctors", doctors);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "Failed to fetch doctors: " + e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchDoctors(@RequestParam(required = false) String specialization,
                                         @RequestParam(required = false) String hospital,
                                         @RequestParam(required = false) String name) {
        try {
            List<Doctor> doctors;
            
            if (specialization != null && !specialization.isEmpty()) {
                doctors = doctorRepository.findVerifiedDoctorsBySpecialization(specialization);
            } else if (hospital != null && !hospital.isEmpty()) {
                doctors = doctorRepository.findVerifiedDoctorsByHospital(hospital);
            } else if (name != null && !name.isEmpty()) {
                doctors = doctorRepository.findVerifiedDoctorsByName(name);
            } else {
                doctors = doctorRepository.findVerifiedDoctors();
            }
            
            // Enrich doctors with user information
            for (Doctor doctor : doctors) {
                userRepository.findById(doctor.getUserId()).ifPresent(user -> {
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("id", user.getId());
                    userInfo.put("name", user.getName());
                    userInfo.put("email", user.getEmail());
                    userInfo.put("image", user.getImage());
                    doctor.setUserInfo(userInfo);
                });
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("doctors", doctors);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "Failed to search doctors: " + e.getMessage()));
        }
    }

    @PostMapping("/ai-search")
    public ResponseEntity<?> searchDoctorsBySymptoms(@RequestBody Map<String, String> request) {
        try {
            String symptoms = request.get("symptoms");
            if (symptoms == null || symptoms.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Symptoms description is required"));
            }

            Map<String, Object> result = aiDoctorSearchService.searchDoctorsBySymptoms(symptoms);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "AI search failed: " + e.getMessage()));
        }
    }
}
