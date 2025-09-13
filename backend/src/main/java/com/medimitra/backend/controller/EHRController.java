package com.medimitra.backend.controller;

import com.medimitra.backend.service.AppwriteStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/ehr")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class EHRController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private AppwriteStorageService storageService;

    // ==================== TEST ENDPOINT ====================
    
    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        System.out.println("=== EHR TEST ENDPOINT CALLED ===");
        return ResponseEntity.ok(Map.of("message", "EHR Controller is working", "timestamp", System.currentTimeMillis()));
    }

    // ==================== DEMOGRAPHICS ====================
    
    @GetMapping("/demographics/{patientId}")
    public ResponseEntity<?> getDemographics(@PathVariable String patientId) {
        try {
            String sql = """
                SELECT ed.*, u.name, u.email, u.phone_number, u.date_of_birth, u.gender, u.address, u.blood_type
                FROM ehr_demographics ed
                LEFT JOIN users u ON ed.patient_id = u.id
                WHERE ed.patient_id = ?
                """;
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, patientId);
            
            if (results.isEmpty()) {
                // Return basic user info if no demographics record exists
                String userSql = "SELECT name, email, phone_number, date_of_birth, gender, address, blood_type FROM users WHERE id = ?";
                List<Map<String, Object>> userResults = jdbcTemplate.queryForList(userSql, patientId);
                
                if (userResults.isEmpty()) {
                    return ResponseEntity.notFound().build();
                }
                
                return ResponseEntity.ok(userResults.get(0));
            }
            
            return ResponseEntity.ok(results.get(0));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get demographics: " + e.getMessage()));
        }
    }

    @PostMapping("/demographics")
    public ResponseEntity<?> createOrUpdateDemographics(@RequestBody Map<String, Object> demographics) {
        try {
            String patientId = (String) demographics.get("patientId");
            
            // Check if demographics record exists
            String checkSql = "SELECT COUNT(*) FROM ehr_demographics WHERE patient_id = ?";
            int count = jdbcTemplate.queryForObject(checkSql, Integer.class, patientId);
            
            if (count > 0) {
                // Update existing record
                String updateSql = """
                    UPDATE ehr_demographics SET 
                    marital_status = ?, occupation = ?, insurance_provider = ?, 
                    insurance_policy_number = ?, preferred_language = ?, ethnicity = ?, 
                    religion = ?, next_of_kin_name = ?, next_of_kin_relationship = ?, 
                    next_of_kin_phone = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE patient_id = ?
                    """;
                
                jdbcTemplate.update(updateSql,
                    demographics.get("maritalStatus"),
                    demographics.get("occupation"),
                    demographics.get("insuranceProvider"),
                    demographics.get("insurancePolicyNumber"),
                    demographics.get("preferredLanguage"),
                    demographics.get("ethnicity"),
                    demographics.get("religion"),
                    demographics.get("nextOfKinName"),
                    demographics.get("nextOfKinRelationship"),
                    demographics.get("nextOfKinPhone"),
                    patientId
                );
            } else {
                // Create new record
                String insertSql = """
                    INSERT INTO ehr_demographics 
                    (id, patient_id, marital_status, occupation, insurance_provider, 
                     insurance_policy_number, preferred_language, ethnicity, religion, 
                     next_of_kin_name, next_of_kin_relationship, next_of_kin_phone)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """;
                
                jdbcTemplate.update(insertSql,
                    "demo-" + UUID.randomUUID().toString(),
                    patientId,
                    demographics.get("maritalStatus"),
                    demographics.get("occupation"),
                    demographics.get("insuranceProvider"),
                    demographics.get("insurancePolicyNumber"),
                    demographics.get("preferredLanguage"),
                    demographics.get("ethnicity"),
                    demographics.get("religion"),
                    demographics.get("nextOfKinName"),
                    demographics.get("nextOfKinRelationship"),
                    demographics.get("nextOfKinPhone")
                );
            }
            
            return ResponseEntity.ok(Map.of("message", "Demographics updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update demographics: " + e.getMessage()));
        }
    }

    // ==================== PATIENT DATA (PGHD) ====================
    
    @GetMapping("/patient-data/{patientId}")
    public ResponseEntity<?> getPatientData(@PathVariable String patientId,
                                          @RequestParam(required = false) String dataType,
                                          @RequestParam(defaultValue = "30") int days) {
        try {
            System.out.println("=== GET PGHD DEBUG START ===");
            System.out.println("Getting patient data for: " + patientId);
            System.out.println("Data type filter: " + dataType);
            System.out.println("Days: " + days);
            
            StringBuilder sqlBuilder = new StringBuilder("""
                SELECT * FROM ehr_patient_data 
                WHERE patient_id = ? 
                AND recorded_date >= CURRENT_DATE - INTERVAL '""" + days + " days'");
            
            List<Object> params = new ArrayList<>();
            params.add(patientId);
            
            if (dataType != null && !dataType.isEmpty()) {
                sqlBuilder.append(" AND data_type = ?");
                params.add(dataType);
            }
            
            sqlBuilder.append(" ORDER BY recorded_date DESC");
            
            String finalSql = sqlBuilder.toString();
            System.out.println("Final SQL: " + finalSql);
            System.out.println("Parameters: " + params);
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(
                finalSql, 
                params.toArray()
            );
            
            System.out.println("Found " + results.size() + " patient data records");
            System.out.println("=== GET PGHD DEBUG END ===");
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            System.err.println("=== GET PGHD ERROR ===");
            System.err.println("Error getting patient data: " + e.getMessage());
            e.printStackTrace();
            System.err.println("=== GET PGHD ERROR END ===");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get patient data: " + e.getMessage()));
        }
    }

    // Note: POST /patient-data endpoint is implemented below with better logging

    // ==================== AMENDMENT REQUESTS ====================
    
    @GetMapping("/amendment-requests/{patientId}")
    public ResponseEntity<?> getAmendmentRequests(@PathVariable String patientId) {
        try {
            String sql = """
                SELECT ar.*, u.name as reviewer_name
                FROM ehr_amendment_requests ar
                LEFT JOIN users u ON ar.reviewed_by = u.id
                WHERE ar.patient_id = ?
                ORDER BY ar.submitted_at DESC
                """;
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, patientId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get amendment requests: " + e.getMessage()));
        }
    }

    // Note: POST /amendment-requests endpoint is implemented below

    // ==================== DOCUMENT UPLOAD ====================
    
    @PostMapping("/documents/save")
    public ResponseEntity<?> saveDocumentMetadata(@RequestBody Map<String, Object> documentData) {
        try {
            String sql = """
                INSERT INTO ehr_documents 
                (id, patient_id, document_type, title, description, file_url, file_name, 
                 file_size, mime_type, appwrite_file_id, uploaded_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
            
            String documentId = "doc-" + UUID.randomUUID().toString();
            
            jdbcTemplate.update(sql,
                documentId,
                documentData.get("patientId"),
                documentData.get("documentType"),
                documentData.get("title"),
                documentData.get("description"),
                documentData.get("fileUrl"),
                documentData.get("fileName"),
                documentData.get("fileSize"),
                documentData.get("mimeType"),
                documentData.get("appwriteFileId"),
                documentData.get("patientId") // uploaded_by
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("documentId", documentId);
            response.put("message", "Document metadata saved successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to save document metadata: " + e.getMessage()));
        }
    }
    
    @PostMapping("/documents/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("patientId") String patientId,
            @RequestParam("documentType") String documentType,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description) {
        
        try {
            // Upload file to Appwrite
            Map<String, Object> uploadResult = storageService.uploadFile(file, patientId, documentType);
            
            // Save document record to database
            String sql = """
                INSERT INTO ehr_documents 
                (id, patient_id, document_type, title, description, file_url, file_name, 
                 file_size, mime_type, appwrite_file_id, uploaded_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
            
            String documentId = "doc-" + UUID.randomUUID().toString();
            
            jdbcTemplate.update(sql,
                documentId,
                patientId,
                documentType,
                title,
                description,
                uploadResult.get("fileUrl"),
                uploadResult.get("fileName"),
                uploadResult.get("fileSize"),
                uploadResult.get("mimeType"),
                uploadResult.get("fileId"),
                patientId // uploaded_by
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("documentId", documentId);
            response.put("fileUrl", uploadResult.get("fileUrl"));
            response.put("message", "Document uploaded successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "File validation failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to upload document: " + e.getMessage()));
        }
    }

    @GetMapping("/documents/{patientId}")
    public ResponseEntity<?> getPatientDocuments(@PathVariable String patientId) {
        try {
            System.out.println("Getting documents for patient: " + patientId);
            
            String sql = """
                SELECT d.*, u.name as uploaded_by_name, r.name as reconciled_by_name
                FROM ehr_documents d
                LEFT JOIN users u ON d.uploaded_by = u.id
                LEFT JOIN users r ON d.reconciled_by = r.id
                WHERE d.patient_id = ?
                ORDER BY d.upload_date DESC
                """;
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, patientId);
            System.out.println("Found " + results.size() + " documents for patient " + patientId);
            
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            System.err.println("Error getting documents: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get documents: " + e.getMessage()));
        }
    }

    // ==================== AMENDMENT REQUESTS ====================
    
    @PostMapping("/amendment-requests")
    public ResponseEntity<?> submitAmendmentRequest(@RequestBody Map<String, Object> amendmentData) {
        try {
            System.out.println("Received amendment request: " + amendmentData);
            
            String sql = """
                INSERT INTO ehr_amendment_requests 
                (id, patient_id, record_type, record_id, amendment_type, field_name, 
                 current_value, proposed_value, reason, status, submitted_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """;
            
            String amendmentId = "amend-" + UUID.randomUUID().toString();
            
            System.out.println("Inserting amendment with ID: " + amendmentId);
            
            jdbcTemplate.update(sql,
                amendmentId,
                amendmentData.get("patientId"),
                amendmentData.get("recordType"),
                amendmentData.get("recordId"),
                amendmentData.get("amendmentType"),
                amendmentData.get("fieldName"),
                amendmentData.get("currentValue"),
                amendmentData.get("proposedValue"),
                amendmentData.get("reason")
            );
            
            System.out.println("Amendment request inserted successfully");
            
            Map<String, Object> response = new HashMap<>();
            response.put("amendmentId", amendmentId);
            response.put("message", "Amendment request submitted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error submitting amendment request: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to submit amendment request: " + e.getMessage()));
        }
    }
    
    // ==================== PATIENT GENERATED HEALTH DATA ====================
    
    @PostMapping("/patient-data")
    public ResponseEntity<?> addPatientData(@RequestBody Map<String, Object> pghd) {
        try {
            System.out.println("=== PGHD DEBUG START ===");
            System.out.println("Received PGHD data: " + pghd);
            
            // Validate required fields
            String patientId = (String) pghd.get("patientId");
            String dataType = (String) pghd.get("dataType");
            String value = (String) pghd.get("value");
            String source = (String) pghd.get("source");
            
            System.out.println("PatientId: " + patientId);
            System.out.println("DataType: " + dataType);
            System.out.println("Value: " + value);
            System.out.println("Source: " + source);
            
            if (patientId == null || patientId.isEmpty()) {
                throw new IllegalArgumentException("Patient ID is required");
            }
            if (dataType == null || dataType.isEmpty()) {
                throw new IllegalArgumentException("Data type is required");
            }
            if (value == null || value.isEmpty()) {
                throw new IllegalArgumentException("Value is required");
            }
            
            // Check if patient exists
            String checkPatientSql = "SELECT COUNT(*) FROM users WHERE id = ?";
            int patientCount = jdbcTemplate.queryForObject(checkPatientSql, Integer.class, patientId);
            System.out.println("Patient exists check: " + patientCount);
            
            if (patientCount == 0) {
                throw new IllegalArgumentException("Patient with ID " + patientId + " does not exist");
            }
            
            // Check if table exists
            String checkTableSql = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'ehr_patient_data'";
            int tableCount = jdbcTemplate.queryForObject(checkTableSql, Integer.class);
            System.out.println("Table exists check: " + tableCount);
            
            if (tableCount == 0) {
                throw new IllegalArgumentException("Table ehr_patient_data does not exist");
            }
            
            String sql = """
                INSERT INTO ehr_patient_data 
                (id, patient_id, data_type, value, unit, recorded_date, notes, source, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """;
            
            String pghd_id = "pghd-" + UUID.randomUUID().toString();
            System.out.println("Inserting PGHD with ID: " + pghd_id);
            
            jdbcTemplate.update(sql,
                pghd_id,
                patientId,
                dataType,
                value,
                pghd.get("unit"),
                pghd.get("notes"),
                source
            );
            
            System.out.println("PGHD inserted successfully");
            System.out.println("=== PGHD DEBUG END ===");
            
            Map<String, Object> response = new HashMap<>();
            response.put("pghd_id", pghd_id);
            response.put("message", "Patient data added successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("=== PGHD ERROR ===");
            System.err.println("Error adding PGHD: " + e.getMessage());
            System.err.println("Error class: " + e.getClass().getSimpleName());
            e.printStackTrace();
            System.err.println("=== PGHD ERROR END ===");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to add patient data: " + e.getMessage()));
        }
    }

    // ==================== EHR SECTION DATA ====================
    
    @GetMapping("/allergies/{patientId}")
    public ResponseEntity<?> getAllergies(@PathVariable String patientId) {
        try {
            String sql = """
                SELECT a.*, d.license_number, u.name as doctor_name
                FROM ehr_allergies a
                LEFT JOIN doctors d ON a.doctor_id = d.id
                LEFT JOIN users u ON d.user_id = u.id
                WHERE a.patient_id = ?
                ORDER BY a.date_identified DESC
                """;
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, patientId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get allergies: " + e.getMessage()));
        }
    }

    @GetMapping("/medications/{patientId}")
    public ResponseEntity<?> getMedications(@PathVariable String patientId) {
        try {
            String sql = """
                SELECT m.*, d.license_number, u.name as prescribed_by_name
                FROM ehr_medications m
                LEFT JOIN doctors d ON m.prescribed_by = d.id
                LEFT JOIN users u ON d.user_id = u.id
                WHERE m.patient_id = ?
                ORDER BY m.start_date DESC
                """;
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, patientId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get medications: " + e.getMessage()));
        }
    }

    @GetMapping("/lab-results/{patientId}")
    public ResponseEntity<?> getLabResults(@PathVariable String patientId) {
        try {
            String sql = """
                SELECT l.*, d.license_number, u.name as ordered_by_name
                FROM ehr_lab_results l
                LEFT JOIN doctors d ON l.ordered_by = d.id
                LEFT JOIN users u ON d.user_id = u.id
                WHERE l.patient_id = ?
                ORDER BY l.test_date DESC
                """;
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, patientId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get lab results: " + e.getMessage()));
        }
    }

    @GetMapping("/imaging/{patientId}")
    public ResponseEntity<?> getImaging(@PathVariable String patientId) {
        try {
            String sql = """
                SELECT i.*, d.license_number, u.name as ordered_by_name
                FROM ehr_imaging i
                LEFT JOIN doctors d ON i.ordered_by = d.id
                LEFT JOIN users u ON d.user_id = u.id
                WHERE i.patient_id = ?
                ORDER BY i.study_date DESC
                """;
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, patientId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get imaging: " + e.getMessage()));
        }
    }

    @GetMapping("/visit-summaries/{patientId}")
    public ResponseEntity<?> getVisitSummaries(@PathVariable String patientId) {
        try {
            String sql = """
                SELECT v.*, d.license_number, u.name as doctor_name
                FROM ehr_visit_summaries v
                LEFT JOIN doctors d ON v.doctor_id = d.id
                LEFT JOIN users u ON d.user_id = u.id
                WHERE v.patient_id = ?
                ORDER BY v.visit_date DESC
                """;
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, patientId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get visit summaries: " + e.getMessage()));
        }
    }

    @GetMapping("/immunizations/{patientId}")
    public ResponseEntity<?> getImmunizations(@PathVariable String patientId) {
        try {
            String sql = """
                SELECT * FROM ehr_immunizations 
                WHERE patient_id = ?
                ORDER BY date_administered DESC
                """;
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, patientId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get immunizations: " + e.getMessage()));
        }
    }

    @GetMapping("/specialist-reports/{patientId}")
    public ResponseEntity<?> getSpecialistReports(@PathVariable String patientId) {
        try {
            String sql = """
                SELECT s.*, d.license_number, u.name as specialist_name
                FROM ehr_specialist_reports s
                LEFT JOIN doctors d ON s.specialist_id = d.id
                LEFT JOIN users u ON d.user_id = u.id
                WHERE s.patient_id = ?
                ORDER BY s.report_date DESC
                """;
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, patientId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get specialist reports: " + e.getMessage()));
        }
    }

    @GetMapping("/medical-history/{patientId}")
    public ResponseEntity<?> getMedicalHistory(@PathVariable String patientId) {
        try {
            String sql = """
                SELECT h.*, d.license_number, u.name as doctor_name
                FROM ehr_medical_history h
                LEFT JOIN doctors d ON h.doctor_id = d.id
                LEFT JOIN users u ON d.user_id = u.id
                WHERE h.patient_id = ?
                ORDER BY h.date_diagnosed DESC
                """;
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, patientId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get medical history: " + e.getMessage()));
        }
    }

    // ==================== SUMMARY ENDPOINTS ====================
    
    @GetMapping("/summary/{patientId}")
    public ResponseEntity<?> getEHRSummary(@PathVariable String patientId) {
        try {
            Map<String, Object> summary = new HashMap<>();
            
            // Get counts for each section
            summary.put("demographics", 1); // Always has basic user info
            summary.put("medicalHistory", getCount("ehr_medical_history", patientId));
            summary.put("medications", getCount("ehr_medications", patientId));
            summary.put("allergies", getCount("ehr_allergies", patientId));
            summary.put("labResults", getCount("ehr_lab_results", patientId));
            summary.put("imaging", getCount("ehr_imaging", patientId));
            summary.put("visitSummaries", getCount("ehr_visit_summaries", patientId));
            summary.put("immunizations", getCount("ehr_immunizations", patientId));
            summary.put("specialistReports", getCount("ehr_specialist_reports", patientId));
            summary.put("documents", getCount("ehr_documents", patientId));
            summary.put("patientData", getCount("ehr_patient_data", patientId));
            summary.put("amendmentRequests", getCount("ehr_amendment_requests", patientId));
            
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get EHR summary: " + e.getMessage()));
        }
    }

    private int getCount(String tableName, String patientId) {
        try {
            return jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM " + tableName + " WHERE patient_id = ?", 
                Integer.class, 
                patientId
            );
        } catch (Exception e) {
            return 0;
        }
    }

    // ==================== APPWRITE STATUS ====================
    
    @GetMapping("/storage/status")
    public ResponseEntity<?> getStorageStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("configured", storageService.isConfigured());
        status.put("connected", storageService.testConnection());
        return ResponseEntity.ok(status);
    }
}
