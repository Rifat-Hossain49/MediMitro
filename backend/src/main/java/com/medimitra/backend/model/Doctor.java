package com.medimitra.backend.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public class Doctor {
    private String id;
    
    @NotBlank(message = "User ID is required")
    private String userId;
    
    @NotBlank(message = "License number is required")
    private String licenseNumber;
    
    @NotBlank(message = "Specialization is required")
    private String specialization;
    
    @Min(value = 0, message = "Experience cannot be negative")
    private int experience; // years of experience
    
    private String hospital;
    
    @NotNull(message = "Consultation fee is required")
    @Min(value = 0, message = "Consultation fee cannot be negative")
    private BigDecimal consultationFee;
    
    private String availability; // JSON string of available time slots
    private BigDecimal rating = BigDecimal.ZERO;
    private int totalRatings = 0;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Transient field for user information (not stored in database)
    private Map<String, Object> userInfo;

    // Default constructor
    public Doctor() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor with essential fields
    public Doctor(String userId, String licenseNumber, String specialization, 
                  int experience, BigDecimal consultationFee) {
        this();
        this.userId = userId;
        this.licenseNumber = licenseNumber;
        this.specialization = specialization;
        this.experience = experience;
        this.consultationFee = consultationFee;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public int getExperience() {
        return experience;
    }

    public void setExperience(int experience) {
        this.experience = experience;
    }

    public String getHospital() {
        return hospital;
    }

    public void setHospital(String hospital) {
        this.hospital = hospital;
    }

    public BigDecimal getConsultationFee() {
        return consultationFee;
    }

    public void setConsultationFee(BigDecimal consultationFee) {
        this.consultationFee = consultationFee;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public int getTotalRatings() {
        return totalRatings;
    }

    public void setTotalRatings(int totalRatings) {
        this.totalRatings = totalRatings;
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

    public Map<String, Object> getUserInfo() {
        return userInfo;
    }

    public void setUserInfo(Map<String, Object> userInfo) {
        this.userInfo = userInfo;
    }

    // Utility methods
    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }

    public void updateRating(BigDecimal newRating) {
        if (this.totalRatings == 0) {
            this.rating = newRating;
            this.totalRatings = 1;
        } else {
            BigDecimal totalScore = this.rating.multiply(BigDecimal.valueOf(this.totalRatings));
            totalScore = totalScore.add(newRating);
            this.totalRatings++;
            this.rating = totalScore.divide(BigDecimal.valueOf(this.totalRatings), 2, BigDecimal.ROUND_HALF_UP);
        }
        updateTimestamp();
    }

    @Override
    public String toString() {
        return "Doctor{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", licenseNumber='" + licenseNumber + '\'' +
                ", specialization='" + specialization + '\'' +
                ", experience=" + experience +
                ", consultationFee=" + consultationFee +
                ", rating=" + rating +
                '}';
    }
}

