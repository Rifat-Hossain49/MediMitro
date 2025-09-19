package com.medimitra.backend.model;

import java.time.LocalDateTime;

public class DoctorPatientMessage {
    private String id;
    private String doctorId;
    private String patientId;
    private String appointmentId;
    private String senderType; // "doctor" or "patient"
    private String message;
    private String messageType; // "text", "image", "file", "prescription"
    private String attachmentUrl;
    private boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;

    // Constructors
    public DoctorPatientMessage() {}

    public DoctorPatientMessage(String id, String doctorId, String patientId, String appointmentId, 
                               String senderType, String message, String messageType, 
                               String attachmentUrl, boolean isRead, LocalDateTime readAt, 
                               LocalDateTime createdAt) {
        this.id = id;
        this.doctorId = doctorId;
        this.patientId = patientId;
        this.appointmentId = appointmentId;
        this.senderType = senderType;
        this.message = message;
        this.messageType = messageType;
        this.attachmentUrl = attachmentUrl;
        this.isRead = isRead;
        this.readAt = readAt;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(String appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getSenderType() {
        return senderType;
    }

    public void setSenderType(String senderType) {
        this.senderType = senderType;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }

    public String getAttachmentUrl() {
        return attachmentUrl;
    }

    public void setAttachmentUrl(String attachmentUrl) {
        this.attachmentUrl = attachmentUrl;
    }

    public boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

