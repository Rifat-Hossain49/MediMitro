package com.medimitra.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ambulance_bookings")
public class AmbulanceBooking {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @NotBlank(message = "Patient ID is required")
  private String patientId;

  @NotBlank(message = "Emergency type is required")
  private String emergencyType; // medical, trauma, cardiac, stroke, general

  @NotBlank(message = "Priority is required")
  private String priority; // critical, high, medium, low

  @NotBlank(message = "Pickup address is required")
  private String pickupAddress;

  private String pickupLatitude;
  private String pickupLongitude;

  @NotBlank(message = "Destination is required")
  private String destination;

  private String destinationLatitude;
  private String destinationLongitude;

  private String contactPhone;

  private String symptoms;
  private String additionalInfo;

  private String status = "requested"; // requested, dispatched, en_route, arrived, completed, cancelled

  private String ambulanceId;
  private String driverId;
  private String paramedicsIds; // JSON array of paramedic IDs

  private BigDecimal estimatedCost;
  private BigDecimal finalCost;

  private LocalDateTime requestTime;
  private LocalDateTime dispatchTime;
  private LocalDateTime arrivalTime;
  private LocalDateTime completionTime;

  private Integer estimatedArrivalMinutes;

  private String cancellationReason;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  // Default constructor
  public AmbulanceBooking() {
    this.requestTime = LocalDateTime.now();
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
  }

  // Constructor with essential fields
  public AmbulanceBooking(String patientId, String emergencyType, String priority,
      String pickupAddress, String destination, String contactPhone) {
    this();
    this.patientId = patientId;
    this.emergencyType = emergencyType;
    this.priority = priority;
    this.pickupAddress = pickupAddress;
    this.destination = destination;
    this.contactPhone = contactPhone;
  }

  // Getters and Setters
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

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

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

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

  public BigDecimal getEstimatedCost() {
    return estimatedCost;
  }

  public void setEstimatedCost(BigDecimal estimatedCost) {
    this.estimatedCost = estimatedCost;
  }

  public BigDecimal getFinalCost() {
    return finalCost;
  }

  public void setFinalCost(BigDecimal finalCost) {
    this.finalCost = finalCost;
  }

  public LocalDateTime getRequestTime() {
    return requestTime;
  }

  public void setRequestTime(LocalDateTime requestTime) {
    this.requestTime = requestTime;
  }

  public LocalDateTime getDispatchTime() {
    return dispatchTime;
  }

  public void setDispatchTime(LocalDateTime dispatchTime) {
    this.dispatchTime = dispatchTime;
  }

  public LocalDateTime getArrivalTime() {
    return arrivalTime;
  }

  public void setArrivalTime(LocalDateTime arrivalTime) {
    this.arrivalTime = arrivalTime;
  }

  public LocalDateTime getCompletionTime() {
    return completionTime;
  }

  public void setCompletionTime(LocalDateTime completionTime) {
    this.completionTime = completionTime;
  }

  public Integer getEstimatedArrivalMinutes() {
    return estimatedArrivalMinutes;
  }

  public void setEstimatedArrivalMinutes(Integer estimatedArrivalMinutes) {
    this.estimatedArrivalMinutes = estimatedArrivalMinutes;
  }

  public String getCancellationReason() {
    return cancellationReason;
  }

  public void setCancellationReason(String cancellationReason) {
    this.cancellationReason = cancellationReason;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }

  // Utility methods
  public void updateTimestamp() {
    this.updatedAt = LocalDateTime.now();
  }

  public boolean isRequested() {
    return "requested".equals(this.status);
  }

  public boolean isDispatched() {
    return "dispatched".equals(this.status);
  }

  public boolean isEnRoute() {
    return "en_route".equals(this.status);
  }

  public boolean hasArrived() {
    return "arrived".equals(this.status);
  }

  public boolean isCompleted() {
    return "completed".equals(this.status);
  }

  public boolean isCancelled() {
    return "cancelled".equals(this.status);
  }

  public boolean isCritical() {
    return "critical".equals(this.priority);
  }

  public boolean isHighPriority() {
    return "high".equals(this.priority);
  }

  public void dispatch(String ambulanceId, String driverId, Integer estimatedMinutes) {
    this.status = "dispatched";
    this.ambulanceId = ambulanceId;
    this.driverId = driverId;
    this.estimatedArrivalMinutes = estimatedMinutes;
    this.dispatchTime = LocalDateTime.now();
    updateTimestamp();
  }

  public void markEnRoute() {
    this.status = "en_route";
    updateTimestamp();
  }

  public void markArrived() {
    this.status = "arrived";
    this.arrivalTime = LocalDateTime.now();
    updateTimestamp();
  }

  public void complete(BigDecimal finalCost) {
    this.status = "completed";
    this.finalCost = finalCost;
    this.completionTime = LocalDateTime.now();
    updateTimestamp();
  }

  public void cancel(String reason) {
    this.status = "cancelled";
    this.cancellationReason = reason;
    updateTimestamp();
  }

  @Override
  public String toString() {
    return "AmbulanceBooking{" +
        "id='" + id + '\'' +
        ", patientId='" + patientId + '\'' +
        ", emergencyType='" + emergencyType + '\'' +
        ", priority='" + priority + '\'' +
        ", pickupAddress='" + pickupAddress + '\'' +
        ", destination='" + destination + '\'' +
        ", status='" + status + '\'' +
        ", requestTime=" + requestTime +
        '}';
  }
}
