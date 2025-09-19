package com.medimitra.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "medical_records")
public class MedicalRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @NotBlank(message = "Patient ID is required")
    private String patientId;

    @NotBlank(message = "Record type is required")
    private String recordType; // lab_result, imaging, prescription, visit_note

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private String fileUrl;

    @NotNull(message = "Date recorded is required")
    private LocalDateTime dateRecorded;

    private String doctorNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default constructor
    public MedicalRecord() {
        this.dateRecorded = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor with essential fields
    public MedicalRecord(String patientId, String recordType, String title,
            String description, LocalDateTime dateRecorded) {
        this();
        this.patientId = patientId;
        this.recordType = recordType;
        this.title = title;
        this.description = description;
        if (dateRecorded != null) {
            this.dateRecorded = dateRecorded;
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

    public String getRecordType() {
        return recordType;
    }

    public void setRecordType(String recordType) {
        this.recordType = recordType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public LocalDateTime getDateRecorded() {
        return dateRecorded;
    }

    public void setDateRecorded(LocalDateTime dateRecorded) {
        this.dateRecorded = dateRecorded;
    }

    public String getDoctorNotes() {
        return doctorNotes;
    }

    public void setDoctorNotes(String doctorNotes) {
        this.doctorNotes = doctorNotes;
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

    public boolean isLabResult() {
        return "lab_result".equals(this.recordType);
    }

    public boolean isImaging() {
        return "imaging".equals(this.recordType);
    }

    public boolean isPrescription() {
        return "prescription".equals(this.recordType);
    }

    public boolean isVisitNote() {
        return "visit_note".equals(this.recordType);
    }

    public boolean hasFile() {
        return this.fileUrl != null && !this.fileUrl.trim().isEmpty();
    }

    @Override
    public String toString() {
        return "MedicalRecord{" +
                "id='" + id + '\'' +
                ", patientId='" + patientId + '\'' +
                ", recordType='" + recordType + '\'' +
                ", title='" + title + '\'' +
                ", dateRecorded=" + dateRecorded +
                '}';
    }
}
