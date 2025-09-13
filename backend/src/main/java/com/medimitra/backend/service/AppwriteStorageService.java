package com.medimitra.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.List;
import java.util.Arrays;

@Service
public class AppwriteStorageService {

    @Value("${appwrite.endpoint:}")
    private String endpoint;

    @Value("${appwrite.project:}")
    private String projectId;

    @Value("${appwrite.api-key:}")
    private String apiKey;

    @Value("${appwrite.bucket-id:}")
    private String bucketId;

    private ObjectMapper objectMapper;

    // Allowed file types for medical documents
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
        "application/pdf",
        "image/jpeg",
        "image/jpg", 
        "image/png",
        "image/gif",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    );

    // Maximum file size: 50MB
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024;

    @PostConstruct
    public void init() {
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Upload a file (simplified version without actual Appwrite integration)
     */
    public Map<String, Object> uploadFile(MultipartFile file, String userId, String documentType) throws IOException {
        // Validate file
        validateFile(file);
        
        // Generate unique file ID
        String fileId = generateFileId(documentType);
        
        // For now, simulate file upload success
        // In a real implementation, this would upload to Appwrite
        Map<String, Object> result = new HashMap<>();
        result.put("fileId", fileId);
        result.put("fileName", file.getOriginalFilename());
        result.put("fileSize", file.getSize());
        result.put("mimeType", file.getContentType());
        result.put("fileUrl", getFileUrl(fileId));
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("userId", userId);
        metadata.put("documentType", documentType);
        metadata.put("originalName", file.getOriginalFilename());
        metadata.put("uploadedAt", System.currentTimeMillis());
        result.put("metadata", metadata);
        
        return result;
    }

    /**
     * Get file URL for viewing/downloading
     */
    public String getFileUrl(String fileId) {
        if (isConfigured()) {
            return String.format("%s/storage/buckets/%s/files/%s/view", endpoint, bucketId, fileId);
        }
        return "https://example.com/files/" + fileId; // Placeholder URL
    }

    /**
     * Get file download URL
     */
    public String getFileDownloadUrl(String fileId) {
        if (isConfigured()) {
            return String.format("%s/storage/buckets/%s/files/%s/download", endpoint, bucketId, fileId);
        }
        return "https://example.com/download/" + fileId; // Placeholder URL
    }

    /**
     * Delete a file from storage (simulated)
     */
    public boolean deleteFile(String fileId) {
        // For now, always return true (simulated success)
        return true;
    }

    /**
     * Get file information (simulated)
     */
    public Map<String, Object> getFileInfo(String fileId) {
        Map<String, Object> info = new HashMap<>();
        info.put("fileId", fileId);
        info.put("fileName", "sample-file.pdf");
        info.put("fileSize", 1024000L);
        info.put("mimeType", "application/pdf");
        info.put("createdAt", System.currentTimeMillis());
        info.put("updatedAt", System.currentTimeMillis());
        info.put("fileUrl", getFileUrl(fileId));
        info.put("downloadUrl", getFileDownloadUrl(fileId));
        
        return info;
    }

    /**
     * List files for a user (simulated)
     */
    public List<Map<String, Object>> listUserFiles(String userId) {
        // Return empty list for now
        return List.of();
    }

    /**
     * Validate uploaded file
     */
    private void validateFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("File is empty");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IOException("File size exceeds maximum allowed size of 50MB");
        }
        
        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType.toLowerCase())) {
            throw new IOException("File type not allowed. Supported types: PDF, Images (JPEG, PNG, GIF), Word documents, Text files");
        }
        
        String fileName = file.getOriginalFilename();
        if (fileName == null || fileName.trim().isEmpty()) {
            throw new IOException("File name is required");
        }
    }

    /**
     * Generate unique file ID
     */
    private String generateFileId(String documentType) {
        String prefix = documentType.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        if (prefix.length() > 10) {
            prefix = prefix.substring(0, 10);
        }
        return prefix + "_" + UUID.randomUUID().toString().replace("-", "");
    }

    /**
     * Check if Appwrite is properly configured
     */
    public boolean isConfigured() {
        return endpoint != null && !endpoint.isEmpty() &&
               projectId != null && !projectId.isEmpty() &&
               apiKey != null && !apiKey.isEmpty() &&
               bucketId != null && !bucketId.isEmpty();
    }

    /**
     * Test connection to Appwrite
     */
    public boolean testConnection() {
        // For now, return configuration status
        // In real implementation, this would test actual connectivity
        return isConfigured();
    }
}