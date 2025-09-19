package com.medimitra.backend.controller;

import com.medimitra.backend.model.AmbulanceBooking;
import com.medimitra.backend.repository.AmbulanceBookingRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/ambulance")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class AmbulanceBookingController {

  @Autowired
  private AmbulanceBookingRepository ambulanceBookingRepository;

  @PostMapping("/book")
  public ResponseEntity<?> bookAmbulance(@Valid @RequestBody BookAmbulanceRequest request) {
    try {
      // Create ambulance booking
      AmbulanceBooking booking = new AmbulanceBooking();
      booking.setPatientId(request.getPatientId());
      booking.setEmergencyType(request.getEmergencyType());
      booking.setPriority(request.getPriority());
      booking.setPickupAddress(request.getPickupAddress());
      booking.setPickupLatitude(request.getPickupLatitude());
      booking.setPickupLongitude(request.getPickupLongitude());
      booking.setDestination(request.getDestination());
      booking.setDestinationLatitude(request.getDestinationLatitude());
      booking.setDestinationLongitude(request.getDestinationLongitude());
      booking.setContactPhone(request.getContactPhone());
      booking.setSymptoms(request.getSymptoms());
      booking.setAdditionalInfo(request.getAdditionalInfo());
      booking.setStatus("requested");

      // Calculate estimated cost based on priority and distance
      BigDecimal estimatedCost = calculateEstimatedCost(request.getPriority(), request.getEmergencyType());
      booking.setEstimatedCost(estimatedCost);

      // Calculate estimated arrival time (simplified)
      int estimatedMinutes = calculateEstimatedArrival(request.getPriority());
      booking.setEstimatedArrivalMinutes(estimatedMinutes);

      // Save booking
      AmbulanceBooking savedBooking = ambulanceBookingRepository.save(booking);

      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("message", "Ambulance booking requested successfully");
      response.put("booking", createBookingResponse(savedBooking));
      response.put("estimatedArrival", estimatedMinutes + " minutes");

      return ResponseEntity.ok(response);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "Failed to book ambulance: " + e.getMessage()));
    }
  }

  @PostMapping("/{bookingId}/dispatch")
  public ResponseEntity<?> dispatchAmbulance(@PathVariable String bookingId,
      @Valid @RequestBody DispatchRequest request) {
    try {
      Optional<AmbulanceBooking> bookingOptional = ambulanceBookingRepository.findById(bookingId);
      if (bookingOptional.isEmpty()) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", "Booking not found"));
      }

      AmbulanceBooking booking = bookingOptional.get();

      if (!booking.isRequested()) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", "Booking is not in requested status"));
      }

      // Dispatch ambulance
      booking.dispatch(request.getAmbulanceId(), request.getDriverId(), request.getEstimatedMinutes());
      if (request.getParamedicsIds() != null) {
        booking.setParamedicsIds(request.getParamedicsIds());
      }

      AmbulanceBooking savedBooking = ambulanceBookingRepository.save(booking);

      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("message", "Ambulance dispatched successfully");
      response.put("booking", createBookingResponse(savedBooking));

      return ResponseEntity.ok(response);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "Failed to dispatch ambulance: " + e.getMessage()));
    }
  }

  @PostMapping("/{bookingId}/en-route")
  public ResponseEntity<?> markEnRoute(@PathVariable String bookingId) {
    try {
      Optional<AmbulanceBooking> bookingOptional = ambulanceBookingRepository.findById(bookingId);
      if (bookingOptional.isEmpty()) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", "Booking not found"));
      }

      AmbulanceBooking booking = bookingOptional.get();
      booking.markEnRoute();
      AmbulanceBooking savedBooking = ambulanceBookingRepository.save(booking);

      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("message", "Ambulance is now en route");
      response.put("booking", createBookingResponse(savedBooking));

      return ResponseEntity.ok(response);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "Failed to update status: " + e.getMessage()));
    }
  }

  @PostMapping("/{bookingId}/arrived")
  public ResponseEntity<?> markArrived(@PathVariable String bookingId) {
    try {
      Optional<AmbulanceBooking> bookingOptional = ambulanceBookingRepository.findById(bookingId);
      if (bookingOptional.isEmpty()) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", "Booking not found"));
      }

      AmbulanceBooking booking = bookingOptional.get();
      booking.markArrived();
      AmbulanceBooking savedBooking = ambulanceBookingRepository.save(booking);

      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("message", "Ambulance has arrived");
      response.put("booking", createBookingResponse(savedBooking));

      return ResponseEntity.ok(response);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "Failed to update status: " + e.getMessage()));
    }
  }

  @PostMapping("/{bookingId}/complete")
  public ResponseEntity<?> completeBooking(@PathVariable String bookingId,
      @RequestBody CompleteBookingRequest request) {
    try {
      Optional<AmbulanceBooking> bookingOptional = ambulanceBookingRepository.findById(bookingId);
      if (bookingOptional.isEmpty()) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", "Booking not found"));
      }

      AmbulanceBooking booking = bookingOptional.get();

      BigDecimal finalCost = request.getFinalCost() != null ? request.getFinalCost() : booking.getEstimatedCost();

      booking.complete(finalCost);
      AmbulanceBooking savedBooking = ambulanceBookingRepository.save(booking);

      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("message", "Ambulance booking completed");
      response.put("booking", createBookingResponse(savedBooking));

      return ResponseEntity.ok(response);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "Failed to complete booking: " + e.getMessage()));
    }
  }

  @PostMapping("/{bookingId}/cancel")
  public ResponseEntity<?> cancelBooking(@PathVariable String bookingId,
      @RequestBody CancelBookingRequest request) {
    try {
      Optional<AmbulanceBooking> bookingOptional = ambulanceBookingRepository.findById(bookingId);
      if (bookingOptional.isEmpty()) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", "Booking not found"));
      }

      AmbulanceBooking booking = bookingOptional.get();
      booking.cancel(request.getCancellationReason());
      AmbulanceBooking savedBooking = ambulanceBookingRepository.save(booking);

      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("message", "Ambulance booking cancelled");
      response.put("booking", createBookingResponse(savedBooking));

      return ResponseEntity.ok(response);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "Failed to cancel booking: " + e.getMessage()));
    }
  }

  @GetMapping("/patient/{patientId}")
  public ResponseEntity<?> getPatientBookings(@PathVariable String patientId) {
    try {
      List<AmbulanceBooking> bookings = ambulanceBookingRepository.findByPatientId(patientId);

      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("bookings", bookings.stream().map(this::createBookingResponse).toList());

      return ResponseEntity.ok(response);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "Failed to fetch bookings: " + e.getMessage()));
    }
  }

  @GetMapping("/active")
  public ResponseEntity<?> getActiveBookings() {
    try {
      List<AmbulanceBooking> bookings = ambulanceBookingRepository.findActiveBookings();

      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("bookings", bookings.stream().map(this::createBookingResponse).toList());
      response.put("totalActive", bookings.size());

      return ResponseEntity.ok(response);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "Failed to fetch active bookings: " + e.getMessage()));
    }
  }

  @GetMapping("/stats")
  public ResponseEntity<?> getBookingStats() {
    try {
      Map<String, Object> stats = new HashMap<>();
      stats.put("total", ambulanceBookingRepository.count());
      stats.put("requested", ambulanceBookingRepository.countByStatus("requested"));
      stats.put("dispatched", ambulanceBookingRepository.countByStatus("dispatched"));
      stats.put("enRoute", ambulanceBookingRepository.countByStatus("en_route"));
      stats.put("arrived", ambulanceBookingRepository.countByStatus("arrived"));
      stats.put("completed", ambulanceBookingRepository.countByStatus("completed"));
      stats.put("cancelled", ambulanceBookingRepository.countByStatus("cancelled"));
      stats.put("critical", ambulanceBookingRepository.countByPriority("critical"));
      stats.put("high", ambulanceBookingRepository.countByPriority("high"));

      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("stats", stats);

      return ResponseEntity.ok(response);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "Failed to fetch booking stats: " + e.getMessage()));
    }
  }

  @GetMapping("/{bookingId}")
  public ResponseEntity<?> getBookingDetails(@PathVariable String bookingId) {
    try {
      Optional<AmbulanceBooking> bookingOptional = ambulanceBookingRepository.findById(bookingId);
      if (bookingOptional.isEmpty()) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", "Booking not found"));
      }

      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("booking", createBookingResponse(bookingOptional.get()));

      return ResponseEntity.ok(response);

    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "Failed to fetch booking details: " + e.getMessage()));
    }
  }

  private BigDecimal calculateEstimatedCost(String priority, String emergencyType) {
    BigDecimal baseCost = new BigDecimal("500.00"); // Base cost

    // Priority multiplier
    switch (priority.toLowerCase()) {
      case "critical":
        baseCost = baseCost.multiply(new BigDecimal("2.0"));
        break;
      case "high":
        baseCost = baseCost.multiply(new BigDecimal("1.5"));
        break;
      case "medium":
        baseCost = baseCost.multiply(new BigDecimal("1.2"));
        break;
      default:
        break;
    }

    // Emergency type multiplier
    switch (emergencyType.toLowerCase()) {
      case "cardiac":
      case "stroke":
        baseCost = baseCost.multiply(new BigDecimal("1.3"));
        break;
      case "trauma":
        baseCost = baseCost.multiply(new BigDecimal("1.2"));
        break;
      default:
        break;
    }

    return baseCost;
  }

  private int calculateEstimatedArrival(String priority) {
    // Estimated arrival time based on priority
    switch (priority.toLowerCase()) {
      case "critical":
        return 5;
      case "high":
        return 8;
      case "medium":
        return 12;
      case "low":
        return 15;
      default:
        return 10;
    }
  }

  private Map<String, Object> createBookingResponse(AmbulanceBooking booking) {
    Map<String, Object> bookingMap = new HashMap<>();
    bookingMap.put("id", booking.getId());
    bookingMap.put("patientId", booking.getPatientId());
    bookingMap.put("emergencyType", booking.getEmergencyType());
    bookingMap.put("priority", booking.getPriority());
    bookingMap.put("pickupAddress", booking.getPickupAddress());
    bookingMap.put("destination", booking.getDestination());
    bookingMap.put("contactPhone", booking.getContactPhone());
    bookingMap.put("symptoms", booking.getSymptoms());
    bookingMap.put("status", booking.getStatus());
    bookingMap.put("ambulanceId", booking.getAmbulanceId());
    bookingMap.put("estimatedCost", booking.getEstimatedCost());
    bookingMap.put("finalCost", booking.getFinalCost());
    bookingMap.put("requestTime", booking.getRequestTime());
    bookingMap.put("dispatchTime", booking.getDispatchTime());
    bookingMap.put("arrivalTime", booking.getArrivalTime());
    bookingMap.put("completionTime", booking.getCompletionTime());
    bookingMap.put("estimatedArrivalMinutes", booking.getEstimatedArrivalMinutes());
    return bookingMap;
  }

  // DTOs for request bodies
  public static class BookAmbulanceRequest {
    private String patientId;
    private String emergencyType;
    private String priority;
    private String pickupAddress;
    private String pickupLatitude;
    private String pickupLongitude;
    private String destination;
    private String destinationLatitude;
    private String destinationLongitude;
    private String contactPhone;
    private String symptoms;
    private String additionalInfo;

    // Getters and setters
    public String getPatientId() {
      return patientId;
    }

    public void setPatientId(String patientId) {
      this.patientId = patientId;
    }

    public String getEmergencyType() {
      return emergencyType;
    }

    public void setEmergencyType(String emergencyType) {
      this.emergencyType = emergencyType;
    }

    public String getPriority() {
      return priority;
    }

    public void setPriority(String priority) {
      this.priority = priority;
    }

    public String getPickupAddress() {
      return pickupAddress;
    }

    public void setPickupAddress(String pickupAddress) {
      this.pickupAddress = pickupAddress;
    }

    public String getPickupLatitude() {
      return pickupLatitude;
    }

    public void setPickupLatitude(String pickupLatitude) {
      this.pickupLatitude = pickupLatitude;
    }

    public String getPickupLongitude() {
      return pickupLongitude;
    }

    public void setPickupLongitude(String pickupLongitude) {
      this.pickupLongitude = pickupLongitude;
    }

    public String getDestination() {
      return destination;
    }

    public void setDestination(String destination) {
      this.destination = destination;
    }

    public String getDestinationLatitude() {
      return destinationLatitude;
    }

    public void setDestinationLatitude(String destinationLatitude) {
      this.destinationLatitude = destinationLatitude;
    }

    public String getDestinationLongitude() {
      return destinationLongitude;
    }

    public void setDestinationLongitude(String destinationLongitude) {
      this.destinationLongitude = destinationLongitude;
    }

    public String getContactPhone() {
      return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
      this.contactPhone = contactPhone;
    }

    public String getSymptoms() {
      return symptoms;
    }

    public void setSymptoms(String symptoms) {
      this.symptoms = symptoms;
    }

    public String getAdditionalInfo() {
      return additionalInfo;
    }

    public void setAdditionalInfo(String additionalInfo) {
      this.additionalInfo = additionalInfo;
    }
  }

  public static class DispatchRequest {
    private String ambulanceId;
    private String driverId;
    private String paramedicsIds;
    private Integer estimatedMinutes;

    // Getters and setters
    public String getAmbulanceId() {
      return ambulanceId;
    }

    public void setAmbulanceId(String ambulanceId) {
      this.ambulanceId = ambulanceId;
    }

    public String getDriverId() {
      return driverId;
    }

    public void setDriverId(String driverId) {
      this.driverId = driverId;
    }

    public String getParamedicsIds() {
      return paramedicsIds;
    }

    public void setParamedicsIds(String paramedicsIds) {
      this.paramedicsIds = paramedicsIds;
    }

    public Integer getEstimatedMinutes() {
      return estimatedMinutes;
    }

    public void setEstimatedMinutes(Integer estimatedMinutes) {
      this.estimatedMinutes = estimatedMinutes;
    }
  }

  public static class CompleteBookingRequest {
    private BigDecimal finalCost;

    // Getters and setters
    public BigDecimal getFinalCost() {
      return finalCost;
    }

    public void setFinalCost(BigDecimal finalCost) {
      this.finalCost = finalCost;
    }
  }

  public static class CancelBookingRequest {
    private String cancellationReason;

    // Getters and setters
    public String getCancellationReason() {
      return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
      this.cancellationReason = cancellationReason;
    }
  }
}
