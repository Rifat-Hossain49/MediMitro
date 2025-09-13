package com.medimitra.backend.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class Prescription {
    private String id;
    
    @NotBlank(message = "Patient ID is required")
    private String patientId;
    
    private String doctorId;
    
    @NotBlank(message = "Medications are required")
    private String medications; // JSON array of medications
    
    @NotBlank(message = "Instructions are required")
    private String instructions;
    
    @NotNull(message = "Date issued is required")
    private LocalDateTime dateIssued;
    
    @NotNull(message = "Valid until date is required")
    private LocalDateTime validUntil;
    
    private String status = "active"; // active, expired, fulfilled
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default constructor
    public Prescription() {
        this.dateIssued = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        // Default validity: 30 days
        this.validUntil = LocalDateTime.now().plusDays(30);
    }

    // Constructor with essential fields
    public Prescription(String patientId, String doctorId, String medications, 
                       String instructions, LocalDateTime validUntil) {
        this();
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.medications = medications;
        this.instructions = instructions;
        if (validUntil != null) {
            this.validUntil = validUntil;
        }
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

    public String getMedications() {
        return medications;
    }

    public void setMedications(String medications) {
        this.medications = medications;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public LocalDateTime getDateIssued() {
        return dateIssued;
    }

    public void setDateIssued(LocalDateTime dateIssued) {
        this.dateIssued = dateIssued;
    }

    public LocalDateTime getValidUntil() {
        return validUntil;
    }

    public void setValidUntil(LocalDateTime validUntil) {
        this.validUntil = validUntil;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public boolean isActive() {
        return "active".equals(this.status);
    }

    public boolean isExpired() {
        return "expired".equals(this.status) || LocalDateTime.now().isAfter(this.validUntil);
    }

    public boolean isFulfilled() {
        return "fulfilled".equals(this.status);
    }

    public void markAsExpired() {
        this.status = "expired";
        updateTimestamp();
    }

    public void markAsFulfilled() {
        this.status = "fulfilled";
        updateTimestamp();
    }

    public long getDaysUntilExpiry() {
        if (isExpired()) {
            return 0;
        }
        return java.time.temporal.ChronoUnit.DAYS.between(LocalDateTime.now(), this.validUntil);
    }

    @Override
    public String toString() {
        return "Prescription{" +
                "id='" + id + '\'' +
                ", patientId='" + patientId + '\'' +
                ", doctorId='" + doctorId + '\'' +
                ", dateIssued=" + dateIssued +
                ", validUntil=" + validUntil +
                ", status='" + status + '\'' +
                '}';
    }
}

