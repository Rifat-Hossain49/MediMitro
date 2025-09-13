package com.medimitra.backend.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Appointment {
    private String id;
    
    @NotBlank(message = "Patient ID is required")
    private String patientId;
    
    @NotBlank(message = "Doctor ID is required")
    private String doctorId;
    
    @NotNull(message = "Date and time is required")
    private LocalDateTime dateTime;
    
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private int duration; // in minutes
    
    @NotBlank(message = "Appointment type is required")
    private String type; // online, in-person, emergency
    
    private String status = "scheduled"; // scheduled, completed, cancelled, no-show
    private String notes;
    private String symptoms; // Patient's reported symptoms
    private String diagnosis; // Doctor's diagnosis
    private String prescription; // Prescription details
    
    @NotNull(message = "Fee is required")
    @Min(value = 0, message = "Fee cannot be negative")
    private BigDecimal fee;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default constructor
    public Appointment() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor with essential fields
    public Appointment(String patientId, String doctorId, LocalDateTime dateTime, 
                      int duration, String type, BigDecimal fee) {
        this();
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.dateTime = dateTime;
        this.duration = duration;
        this.type = type;
        this.fee = fee;
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

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
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

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getPrescription() {
        return prescription;
    }

    public void setPrescription(String prescription) {
        this.prescription = prescription;
    }

    public BigDecimal getFee() {
        return fee;
    }

    public void setFee(BigDecimal fee) {
        this.fee = fee;
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

    public boolean isScheduled() {
        return "scheduled".equals(this.status);
    }

    public boolean isCompleted() {
        return "completed".equals(this.status);
    }

    public boolean isCancelled() {
        return "cancelled".equals(this.status);
    }

    public LocalDateTime getEndTime() {
        return this.dateTime.plusMinutes(this.duration);
    }

    public boolean isOnline() {
        return "online".equals(this.type);
    }

    public boolean isInPerson() {
        return "in-person".equals(this.type);
    }

    public boolean isEmergency() {
        return "emergency".equals(this.type);
    }

    @Override
    public String toString() {
        return "Appointment{" +
                "id='" + id + '\'' +
                ", patientId='" + patientId + '\'' +
                ", doctorId='" + doctorId + '\'' +
                ", dateTime=" + dateTime +
                ", duration=" + duration +
                ", type='" + type + '\'' +
                ", status='" + status + '\'' +
                ", fee=" + fee +
                '}';
    }
}

