package com.medimitra.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class OpenRouterAIService {

    @Value("${openrouter.api.key:}")
    private String openRouterApiKey;

    @Value("${openrouter.api.url:https://openrouter.ai/api/v1/chat/completions}")
    private String openRouterApiUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OpenRouterAIService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public Map<String, Object> analyzeSymptomsAndRecommendDoctors(String symptoms, List<Map<String, Object>> availableDoctors) {
        try {
            if (openRouterApiKey == null || openRouterApiKey.isEmpty()) {
                return getFallbackRecommendation(symptoms, availableDoctors);
            }

            String prompt = createMedicalAnalysisPrompt(symptoms, availableDoctors);
            String aiResponse = callOpenRouterAPI(prompt);
            System.out.println("DEBUG: AI Response: " + aiResponse);
            return parseAIResponse(aiResponse, availableDoctors);
            
        } catch (Exception e) {
            System.err.println("ERROR: AI Analysis failed: " + e.getMessage());
            e.printStackTrace();
            return getFallbackRecommendation(symptoms, availableDoctors);
        }
    }

    private String createMedicalAnalysisPrompt(String symptoms, List<Map<String, Object>> availableDoctors) {
        StringBuilder doctorsInfo = new StringBuilder();
        for (Map<String, Object> doctor : availableDoctors) {
            doctorsInfo.append("- ID: ").append(doctor.get("id"))
                      .append(", Name: ").append(doctor.get("name"))
                      .append(", Specialization: ").append(doctor.get("specialization"))
                      .append(", Experience: ").append(doctor.get("experience")).append(" years")
                      .append(", Rating: ").append(doctor.get("rating"))
                      .append(", Hospital: ").append(doctor.get("hospital")).append("\n");
        }

        return String.format("""
            You are a medical AI assistant. Analyze the patient's symptoms and recommend the most suitable doctors from the available list.
            
            Patient Symptoms: "%s"
            
            Available Doctors:
            %s
            
            Analyze the symptoms and recommend doctors whose specialization best matches the medical condition. Consider specialization relevance, experience, and ratings.
            
            IMPORTANT: Use the exact doctor IDs from the list above (like "doc-1", "doc-2", etc.) in your recommendations.
            
            Return a JSON response with:
            {
                "analysis": {
                    "symptoms": "symptoms",
                    "conditions": ["possible conditions"],
                    "specializations": ["relevant specializations"]
                },
                "recommendedDoctors": [
                    {
                        "id": "exact_doctor_id_from_list_above",
                        "reason": "explanation",
                        "confidence": 0.9
                    }
                ]
            }
            
            Remember: Use the exact ID values (doc-1, doc-2, etc.) not the doctor names.
            """, symptoms, doctorsInfo.toString());
    }

    private String callOpenRouterAPI(String prompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + openRouterApiKey);
        headers.set("HTTP-Referer", "http://localhost:3000");
        headers.set("X-Title", "MediMitra Health Companion");

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "anthropic/claude-3.5-sonnet");
        requestBody.put("messages", Arrays.asList(
            Map.of("role", "user", "content", prompt)
        ));
        requestBody.put("max_tokens", 1000);
        requestBody.put("temperature", 0.3);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(
            openRouterApiUrl, 
            HttpMethod.POST, 
            entity, 
            Map.class
        );

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            Map<String, Object> responseBody = response.getBody();
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return (String) message.get("content");
            }
        }
        
        throw new Exception("Invalid response from OpenRouter API");
    }

    private Map<String, Object> parseAIResponse(String aiResponse, List<Map<String, Object>> availableDoctors) {
        try {
            String jsonPart = extractJsonFromResponse(aiResponse);
            System.out.println("DEBUG: Extracted JSON: " + jsonPart);
            Map<String, Object> aiAnalysis = objectMapper.readValue(jsonPart, Map.class);
            System.out.println("DEBUG: Parsed AI Analysis: " + aiAnalysis);
            
            List<Map<String, Object>> recommendations = (List<Map<String, Object>>) aiAnalysis.get("recommendedDoctors");
            List<Map<String, Object>> recommendedDoctors = new ArrayList<>();
            
            System.out.println("DEBUG: Found recommendations: " + (recommendations != null ? recommendations.size() : "null"));
            
            if (recommendations != null) {
                for (Map<String, Object> rec : recommendations) {
                    String doctorId = (String) rec.get("id");
                    System.out.println("DEBUG: Looking for doctor with ID: " + doctorId);
                    Map<String, Object> doctor = findDoctorById(availableDoctors, doctorId);
                    if (doctor != null) {
                        System.out.println("DEBUG: Found doctor: " + doctor.get("name"));
                        Map<String, Object> enhancedDoctor = new HashMap<>(doctor);
                        enhancedDoctor.put("aiReason", rec.get("reason"));
                        enhancedDoctor.put("aiConfidence", rec.get("confidence"));
                        recommendedDoctors.add(enhancedDoctor);
                    } else {
                        System.out.println("DEBUG: Doctor not found for ID: " + doctorId);
                    }
                }
            }
            
            System.out.println("DEBUG: Final recommended doctors count: " + recommendedDoctors.size());
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("doctors", recommendedDoctors);
            result.put("analysis", aiAnalysis.get("analysis"));
            result.put("source", "ai");
            
            return result;
            
        } catch (Exception e) {
            System.err.println("ERROR: Failed to parse AI response: " + e.getMessage());
            e.printStackTrace();
            return getFallbackRecommendation("", availableDoctors);
        }
    }

    private String extractJsonFromResponse(String response) {
        // Try to find JSON object in the response
        int startIndex = response.indexOf("{");
        int endIndex = response.lastIndexOf("}");
        
        if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
            return response.substring(startIndex, endIndex + 1);
        }
        
        return response;
    }

    private Map<String, Object> findDoctorById(List<Map<String, Object>> doctors, String doctorId) {
        return doctors.stream()
                .filter(doctor -> doctorId.equals(doctor.get("id")))
                .findFirst()
                .orElse(null);
    }

    private Map<String, Object> getFallbackRecommendation(String symptoms, List<Map<String, Object>> availableDoctors) {
        // Fallback to rule-based recommendation if OpenRouter is not available
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("doctors", availableDoctors);
        result.put("aiAnalysis", Map.of(
            "symptoms", symptoms,
            "interpretedConditions", Arrays.asList("General consultation recommended"),
            "urgency", "medium",
            "recommendedSpecializations", Arrays.asList("Internal Medicine"),
            "note", "AI analysis unavailable, showing all available doctors"
        ));
        result.put("source", "fallback");
        
        return result;
    }

    public boolean isConfigured() {
        return openRouterApiKey != null && !openRouterApiKey.isEmpty();
    }
}

