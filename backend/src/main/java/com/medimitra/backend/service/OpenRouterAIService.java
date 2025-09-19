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

    public Map<String, Object> analyzeSymptomsAndRecommendDoctors(String symptoms,
            List<Map<String, Object>> availableDoctors) {
        try {
            if (openRouterApiKey == null || openRouterApiKey.isEmpty() || !isValidApiKey()) {
                System.out.println("INFO: OpenRouter API key not configured or invalid, using rule-based fallback");
                return getFallbackRecommendation(symptoms, availableDoctors);
            }

            String prompt = createMedicalAnalysisPrompt(symptoms, availableDoctors);
            String aiResponse = callOpenRouterAPI(prompt);
            System.out.println("DEBUG: AI Response: " + aiResponse);
            return parseAIResponse(aiResponse, availableDoctors);

        } catch (Exception e) {
            System.err.println("ERROR: AI Analysis failed: " + e.getMessage());
            // Don't print full stack trace for 401 errors to reduce noise
            if (!e.getMessage().contains("401")) {
                e.printStackTrace();
            }
            return getFallbackRecommendation(symptoms, availableDoctors);
        }
    }

    private boolean isValidApiKey() {
        // Simple validation - check if the key looks like a valid OpenRouter key
        return openRouterApiKey != null &&
                openRouterApiKey.startsWith("sk-or-") &&
                openRouterApiKey.length() > 50;
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

        return String.format(
                """
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
                        """,
                symptoms, doctorsInfo.toString());
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
                Map.of("role", "user", "content", prompt)));
        requestBody.put("max_tokens", 1000);
        requestBody.put("temperature", 0.3);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                openRouterApiUrl,
                HttpMethod.POST,
                entity,
                Map.class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> responseBody = (Map<String, Object>) response.getBody();
            if (responseBody != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
        }

        throw new Exception("Invalid response from OpenRouter API");
    }

    private Map<String, Object> parseAIResponse(String aiResponse, List<Map<String, Object>> availableDoctors) {
        try {
            String jsonPart = extractJsonFromResponse(aiResponse);
            System.out.println("DEBUG: Extracted JSON: " + jsonPart);
            @SuppressWarnings("unchecked")
            Map<String, Object> aiAnalysis = objectMapper.readValue(jsonPart, Map.class);
            System.out.println("DEBUG: Parsed AI Analysis: " + aiAnalysis);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> recommendations = (List<Map<String, Object>>) aiAnalysis
                    .get("recommendedDoctors");
            List<Map<String, Object>> recommendedDoctors = new ArrayList<>();

            System.out.println(
                    "DEBUG: Found recommendations: " + (recommendations != null ? recommendations.size() : "null"));

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
        // Enhanced rule-based recommendation when OpenRouter is not available
        List<Map<String, Object>> recommendedDoctors = performRuleBasedRecommendation(symptoms, availableDoctors);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("doctors", recommendedDoctors);
        result.put("analysis", Map.of(
                "symptoms", symptoms,
                "interpretedConditions", interpretSymptoms(symptoms),
                "urgency", assessUrgency(symptoms),
                "recommendedSpecializations", getRecommendedSpecializations(symptoms),
                "totalMatches", recommendedDoctors.size(),
                "note", "Rule-based analysis (AI service temporarily unavailable)"));
        result.put("source", "rule_based_fallback");

        return result;
    }

    private List<Map<String, Object>> performRuleBasedRecommendation(String symptoms,
            List<Map<String, Object>> availableDoctors) {
        String symptomsLower = symptoms.toLowerCase();
        List<Map<String, Object>> scoredDoctors = new ArrayList<>();

        // Define symptom-to-specialization mapping
        Map<String, List<String>> symptomMapping = new HashMap<>();
        symptomMapping.put("chest pain", Arrays.asList("Cardiology", "Emergency Medicine"));
        symptomMapping.put("heart", Arrays.asList("Cardiology"));
        symptomMapping.put("breathing", Arrays.asList("Cardiology", "Pulmonology"));
        symptomMapping.put("shortness of breath", Arrays.asList("Cardiology", "Pulmonology"));
        symptomMapping.put("skin", Arrays.asList("Dermatology"));
        symptomMapping.put("rash", Arrays.asList("Dermatology"));
        symptomMapping.put("acne", Arrays.asList("Dermatology"));
        symptomMapping.put("headache", Arrays.asList("Neurology", "Internal Medicine"));
        symptomMapping.put("migraine", Arrays.asList("Neurology"));
        symptomMapping.put("dizziness", Arrays.asList("Neurology", "Cardiology"));
        symptomMapping.put("back pain", Arrays.asList("Orthopedics", "Physical Medicine"));
        symptomMapping.put("joint", Arrays.asList("Orthopedics", "Rheumatology"));
        symptomMapping.put("knee", Arrays.asList("Orthopedics"));
        symptomMapping.put("shoulder", Arrays.asList("Orthopedics"));
        symptomMapping.put("neck pain", Arrays.asList("Orthopedics"));
        symptomMapping.put("cough", Arrays.asList("Pulmonology", "Internal Medicine"));
        symptomMapping.put("asthma", Arrays.asList("Pulmonology"));
        symptomMapping.put("stomach", Arrays.asList("Gastroenterology"));
        symptomMapping.put("nausea", Arrays.asList("Gastroenterology"));
        symptomMapping.put("vomiting", Arrays.asList("Gastroenterology"));
        symptomMapping.put("diarrhea", Arrays.asList("Gastroenterology"));
        symptomMapping.put("anxiety", Arrays.asList("Psychiatry", "Psychology"));
        symptomMapping.put("depression", Arrays.asList("Psychiatry"));
        symptomMapping.put("stress", Arrays.asList("Psychiatry"));
        symptomMapping.put("panic", Arrays.asList("Psychiatry"));
        symptomMapping.put("child", Arrays.asList("Pediatrics"));
        symptomMapping.put("baby", Arrays.asList("Pediatrics"));
        symptomMapping.put("fever", Arrays.asList("Internal Medicine", "Pediatrics"));
        symptomMapping.put("fatigue", Arrays.asList("Internal Medicine"));
        symptomMapping.put("diabetes", Arrays.asList("Endocrinology"));
        symptomMapping.put("thyroid", Arrays.asList("Endocrinology"));
        symptomMapping.put("allergy", Arrays.asList("Allergy and Immunology"));

        // Find relevant specializations
        Set<String> relevantSpecializations = new HashSet<>();
        for (Map.Entry<String, List<String>> entry : symptomMapping.entrySet()) {
            if (symptomsLower.contains(entry.getKey())) {
                relevantSpecializations.addAll(entry.getValue());
            }
        }

        // If no specific symptoms found, add general specializations
        if (relevantSpecializations.isEmpty()) {
            relevantSpecializations.add("Internal Medicine");
            relevantSpecializations.add("General Practice");
        }

        // Score and rank doctors
        for (Map<String, Object> doctor : availableDoctors) {
            double score = 0.0;
            String specialization = (String) doctor.get("specialization");

            // Specialization match
            if (relevantSpecializations.contains(specialization)) {
                score += 10.0;
            }

            // Experience bonus
            Object exp = doctor.get("experience");
            if (exp instanceof Number) {
                score += Math.min(((Number) exp).doubleValue() * 0.1, 2.0);
            }

            // Rating bonus
            Object rating = doctor.get("rating");
            if (rating instanceof Number) {
                score += ((Number) rating).doubleValue() * 0.5;
            }

            // Review count bonus
            Object totalRatings = doctor.get("totalRatings");
            if (totalRatings instanceof Number) {
                score += Math.min(((Number) totalRatings).doubleValue() * 0.01, 1.0);
            }

            if (score > 0) {
                Map<String, Object> scoredDoctor = new HashMap<>(doctor);
                scoredDoctor.put("aiReason", "Specialization matches symptoms: " + specialization);
                scoredDoctor.put("aiConfidence", Math.min(score / 15.0, 1.0)); // Normalize to 0-1
                scoredDoctors.add(scoredDoctor);
            }
        }

        // Sort by score (highest first) and return top 5
        scoredDoctors.sort((a, b) -> {
            double scoreA = (Double) a.get("aiConfidence");
            double scoreB = (Double) b.get("aiConfidence");
            return Double.compare(scoreB, scoreA);
        });

        return scoredDoctors.stream().limit(5).collect(ArrayList::new, ArrayList::add, ArrayList::addAll);
    }

    private List<String> interpretSymptoms(String symptoms) {
        String symptomsLower = symptoms.toLowerCase();
        List<String> conditions = new ArrayList<>();

        if (symptomsLower.contains("chest") || symptomsLower.contains("heart")) {
            conditions.add("Cardiovascular symptoms");
        }
        if (symptomsLower.contains("skin") || symptomsLower.contains("rash")) {
            conditions.add("Dermatological condition");
        }
        if (symptomsLower.contains("headache") || symptomsLower.contains("dizziness")) {
            conditions.add("Neurological symptoms");
        }
        if (symptomsLower.contains("back") || symptomsLower.contains("joint")) {
            conditions.add("Musculoskeletal issue");
        }
        if (symptomsLower.contains("breathing") || symptomsLower.contains("cough")) {
            conditions.add("Respiratory symptoms");
        }
        if (symptomsLower.contains("stomach") || symptomsLower.contains("nausea")) {
            conditions.add("Gastrointestinal symptoms");
        }
        if (symptomsLower.contains("anxiety") || symptomsLower.contains("depression")) {
            conditions.add("Mental health concern");
        }

        if (conditions.isEmpty()) {
            conditions.add("General health concern");
        }

        return conditions;
    }

    private String assessUrgency(String symptoms) {
        String symptomsLower = symptoms.toLowerCase();

        if (symptomsLower.contains("chest pain") || symptomsLower.contains("severe") ||
                symptomsLower.contains("emergency") || symptomsLower.contains("urgent")) {
            return "high";
        }
        if (symptomsLower.contains("pain") || symptomsLower.contains("fever") ||
                symptomsLower.contains("difficulty")) {
            return "medium";
        }
        return "low";
    }

    private List<String> getRecommendedSpecializations(String symptoms) {
        String symptomsLower = symptoms.toLowerCase();
        Set<String> specializations = new HashSet<>();

        if (symptomsLower.contains("chest") || symptomsLower.contains("heart")) {
            specializations.add("Cardiology");
        }
        if (symptomsLower.contains("skin") || symptomsLower.contains("rash")) {
            specializations.add("Dermatology");
        }
        if (symptomsLower.contains("headache") || symptomsLower.contains("dizziness")) {
            specializations.add("Neurology");
        }
        if (symptomsLower.contains("back") || symptomsLower.contains("joint")) {
            specializations.add("Orthopedics");
        }
        if (symptomsLower.contains("breathing") || symptomsLower.contains("cough")) {
            specializations.add("Pulmonology");
        }
        if (symptomsLower.contains("stomach") || symptomsLower.contains("nausea")) {
            specializations.add("Gastroenterology");
        }
        if (symptomsLower.contains("anxiety") || symptomsLower.contains("depression")) {
            specializations.add("Psychiatry");
        }
        if (symptomsLower.contains("child") || symptomsLower.contains("baby")) {
            specializations.add("Pediatrics");
        }

        if (specializations.isEmpty()) {
            specializations.add("Internal Medicine");
        }

        return new ArrayList<>(specializations);
    }

    public boolean isConfigured() {
        return openRouterApiKey != null && !openRouterApiKey.isEmpty();
    }
}
