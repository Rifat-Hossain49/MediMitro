package com.medimitra.backend.controller;

import com.medimitra.backend.model.ICUBed;
import com.medimitra.backend.repository.ICUBedRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/icu-beds")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class ICUBedController {

  @Autowired
  private ICUBedRepository icuBedRepository;

  @GetMapping("/available")
  public ResponseEntity<?> getAvailableBeds(@RequestParam(required = false) String icuType,
      @RequestParam(required = false) String hospital) {
    try {
      List<ICUBed> beds;

      if (icuType != null && hospital != null) {
        beds = icuBedRepository.findAll().stream()
            .filter(bed -> bed.isAvailable() &&
                bed.getIcuType().equals(icuType) &&
                bed.getHospital().equals(hospital))
            .toList();
      } else if (icuType != null) {
        beds = icuBedRepository.findByIcuType(icuType).stream()
            .filter(ICUBed::isAvailable)
            .toList();
      } else if (hospital != null) {
        beds = icuBedRepository.findByHospital(hospital).stream()
            .filter(ICUBed::isAvailable)
            .toList();
      } else {
        beds = icuBedRepository.findAvailableBeds();
      }

      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("beds", beds);
      response.put("totalAvailable", beds.size());

      return ResponseEntity.ok(response);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "Failed to fetch available beds: " + e.getMessage()));
    }
  }

  @PostMapping("/reserve")
  public ResponseEntity<?> reserveBed(@Valid @RequestBody ReserveBedRequest request) {
    try {
      Optional<ICUBed> bedOptional = icuBedRepository.findById(request.getBedId());
      if (bedOptional.isEmpty()) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", "ICU bed not found"));
      }

      ICUBed bed = bedOptional.get();

      if (!bed.isAvailable()) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", "ICU bed is not available"));
      }

      // Parse dates
      LocalDateTime startTime;
      LocalDateTime endTime;
      try {
        startTime = LocalDateTime.parse(request.getStartTime());
        endTime = LocalDateTime.parse(request.getEndTime());
      } catch (DateTimeParseException e) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", "Invalid date format"));
      }

      if (startTime.isAfter(endTime)) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", "Start time cannot be after end time"));
      }

      // Reserve the bed
      bed.reserve(request.getPatientId(), startTime, endTime);
      ICUBed savedBed = icuBedRepository.save(bed);

      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("message", "ICU bed reserved successfully");
      response.put("bed", createBedResponse(savedBed));

      return ResponseEntity.ok(response);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "Failed to reserve bed: " + e.getMessage()));
    }
  }

  @PostMapping("/occupy")
  public ResponseEntity<?> occupyBed(@Valid @RequestBody OccupyBedRequest request) {
    try {
      Optional<ICUBed> bedOptional = icuBedRepository.findById(request.getBedId());
      if (bedOptional.isEmpty()) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", "ICU bed not found"));
      }

      ICUBed bed = bedOptional.get();

      if (!bed.isAvailable() && !bed.isReserved()) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", "ICU bed is not available"));
      }

      // Occupy the bed
      bed.markAsOccupied(request.getPatientId());
      ICUBed savedBed = icuBedRepository.save(bed);

      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("message", "ICU bed occupied successfully");
      response.put("bed", createBedResponse(savedBed));

      return ResponseEntity.ok(response);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "Failed to occupy bed: " + e.getMessage()));
    }
  }

  @PostMapping("/{bedId}/release")
  public ResponseEntity<?> releaseBed(@PathVariable String bedId) {
    try {
      Optional<ICUBed> bedOptional = icuBedRepository.findById(bedId);
      if (bedOptional.isEmpty()) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", "ICU bed not found"));
      }

      ICUBed bed = bedOptional.get();
      bed.markAsAvailable();
      ICUBed savedBed = icuBedRepository.save(bed);

      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("message", "ICU bed released successfully");
      response.put("bed", createBedResponse(savedBed));

      return ResponseEntity.ok(response);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "Failed to release bed: " + e.getMessage()));
    }
  }

  @GetMapping("/patient/{patientId}")
  public ResponseEntity<?> getPatientBeds(@PathVariable String patientId) {
    try {
      List<ICUBed> beds = icuBedRepository.findByPatientId(patientId);

      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("beds", beds);

      return ResponseEntity.ok(response);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "Failed to fetch patient beds: " + e.getMessage()));
    }
  }

  @GetMapping("/hospitals")
  public ResponseEntity<?> getHospitals() {
    try {
      List<String> hospitals = icuBedRepository.findDistinctHospitals();

      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("hospitals", hospitals);

      return ResponseEntity.ok(response);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "Failed to fetch hospitals: " + e.getMessage()));
    }
  }

  @GetMapping("/types")
  public ResponseEntity<?> getIcuTypes() {
    try {
      List<String> icuTypes = icuBedRepository.findDistinctIcuTypes();

      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("icuTypes", icuTypes);

      return ResponseEntity.ok(response);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "Failed to fetch ICU types: " + e.getMessage()));
    }
  }

  @GetMapping("/stats")
  public ResponseEntity<?> getBedStats() {
    try {
      Map<String, Object> stats = new HashMap<>();
      stats.put("total", icuBedRepository.count());
      stats.put("available", icuBedRepository.countByStatus("available"));
      stats.put("occupied", icuBedRepository.countByStatus("occupied"));
      stats.put("reserved", icuBedRepository.countByStatus("reserved"));
      stats.put("maintenance", icuBedRepository.countByStatus("maintenance"));

      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("stats", stats);

      return ResponseEntity.ok(response);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "Failed to fetch bed stats: " + e.getMessage()));
    }
  }

  @GetMapping("/{bedId}")
  public ResponseEntity<?> getBedDetails(@PathVariable String bedId) {
    try {
      Optional<ICUBed> bedOptional = icuBedRepository.findById(bedId);
      if (bedOptional.isEmpty()) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", "ICU bed not found"));
      }

      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("bed", createBedResponse(bedOptional.get()));

      return ResponseEntity.ok(response);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "Failed to fetch bed details: " + e.getMessage()));
    }
  }

  private Map<String, Object> createBedResponse(ICUBed bed) {
    Map<String, Object> bedMap = new HashMap<>();
    bedMap.put("id", bed.getId());
    bedMap.put("bedNumber", bed.getBedNumber());
    bedMap.put("hospital", bed.getHospital());
    bedMap.put("hospitalAddress", bed.getHospitalAddress());
    bedMap.put("icuType", bed.getIcuType());
    bedMap.put("status", bed.getStatus());
    bedMap.put("dailyRate", bed.getDailyRate());
    bedMap.put("equipment", bed.getEquipment());
    bedMap.put("assignedPatientId", bed.getAssignedPatientId());
    bedMap.put("reservationStartTime", bed.getReservationStartTime());
    bedMap.put("reservationEndTime", bed.getReservationEndTime());
    bedMap.put("createdAt", bed.getCreatedAt());
    bedMap.put("updatedAt", bed.getUpdatedAt());
    return bedMap;
  }

  // DTOs for request bodies
  public static class ReserveBedRequest {
    private String bedId;
    private String patientId;
    private String startTime;
    private String endTime;

    // Getters and setters
    public String getBedId() {
      return bedId;
    }

    public void setBedId(String bedId) {
      this.bedId = bedId;
    }

    public String getPatientId() {
      return patientId;
    }

    public void setPatientId(String patientId) {
      this.patientId = patientId;
    }

    public String getStartTime() {
      return startTime;
    }

    public void setStartTime(String startTime) {
      this.startTime = startTime;
    }

    public String getEndTime() {
      return endTime;
    }

    public void setEndTime(String endTime) {
      this.endTime = endTime;
    }
  }

  public static class OccupyBedRequest {
    private String bedId;
    private String patientId;

    // Getters and setters
    public String getBedId() {
      return bedId;
    }

    public void setBedId(String bedId) {
      this.bedId = bedId;
    }

    public String getPatientId() {
      return patientId;
    }

    public void setPatientId(String patientId) {
      this.patientId = patientId;
    }
  }
}
