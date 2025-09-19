package com.medimitra.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "icu_beds")
public class ICUBed {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @NotBlank(message = "Bed number is required")
  private String bedNumber;

  @NotBlank(message = "Hospital is required")
  private String hospital;

  private String hospitalAddress;

  @NotBlank(message = "ICU type is required")
  private String icuType; // general, cardiac, neuro, pediatric

  private String status = "available"; // available, occupied, maintenance, reserved

  private BigDecimal dailyRate;

  private String equipment; // JSON string of available equipment

  private String assignedPatientId;

  private LocalDateTime reservationStartTime;
  private LocalDateTime reservationEndTime;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  // Default constructor
  public ICUBed() {
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
  }

  // Constructor with essential fields
  public ICUBed(String bedNumber, String hospital, String icuType, BigDecimal dailyRate) {
    this();
    this.bedNumber = bedNumber;
    this.hospital = hospital;
    this.icuType = icuType;
    this.dailyRate = dailyRate;
  }

  // Getters and Setters
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getBedNumber() {
    return bedNumber;
  }

  public void setBedNumber(String bedNumber) {
    this.bedNumber = bedNumber;
  }

  public String getHospital() {
    return hospital;
  }

  public void setHospital(String hospital) {
    this.hospital = hospital;
  }

  public String getHospitalAddress() {
    return hospitalAddress;
  }

  public void setHospitalAddress(String hospitalAddress) {
    this.hospitalAddress = hospitalAddress;
  }

  public String getIcuType() {
    return icuType;
  }

  public void setIcuType(String icuType) {
    this.icuType = icuType;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public BigDecimal getDailyRate() {
    return dailyRate;
  }

  public void setDailyRate(BigDecimal dailyRate) {
    this.dailyRate = dailyRate;
  }

  public String getEquipment() {
    return equipment;
  }

  public void setEquipment(String equipment) {
    this.equipment = equipment;
  }

  public String getAssignedPatientId() {
    return assignedPatientId;
  }

  public void setAssignedPatientId(String assignedPatientId) {
    this.assignedPatientId = assignedPatientId;
  }

  public LocalDateTime getReservationStartTime() {
    return reservationStartTime;
  }

  public void setReservationStartTime(LocalDateTime reservationStartTime) {
    this.reservationStartTime = reservationStartTime;
  }

  public LocalDateTime getReservationEndTime() {
    return reservationEndTime;
  }

  public void setReservationEndTime(LocalDateTime reservationEndTime) {
    this.reservationEndTime = reservationEndTime;
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

  public boolean isAvailable() {
    return "available".equals(this.status);
  }

  public boolean isOccupied() {
    return "occupied".equals(this.status);
  }

  public boolean isReserved() {
    return "reserved".equals(this.status);
  }

  public boolean isInMaintenance() {
    return "maintenance".equals(this.status);
  }

  public void markAsOccupied(String patientId) {
    this.status = "occupied";
    this.assignedPatientId = patientId;
    updateTimestamp();
  }

  public void markAsAvailable() {
    this.status = "available";
    this.assignedPatientId = null;
    this.reservationStartTime = null;
    this.reservationEndTime = null;
    updateTimestamp();
  }

  public void reserve(String patientId, LocalDateTime startTime, LocalDateTime endTime) {
    this.status = "reserved";
    this.assignedPatientId = patientId;
    this.reservationStartTime = startTime;
    this.reservationEndTime = endTime;
    updateTimestamp();
  }

  @Override
  public String toString() {
    return "ICUBed{" +
        "id='" + id + '\'' +
        ", bedNumber='" + bedNumber + '\'' +
        ", hospital='" + hospital + '\'' +
        ", icuType='" + icuType + '\'' +
        ", status='" + status + '\'' +
        ", dailyRate=" + dailyRate +
        '}';
  }
}
