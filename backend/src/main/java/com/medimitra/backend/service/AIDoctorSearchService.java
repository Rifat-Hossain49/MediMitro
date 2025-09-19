package com.medimitra.backend.service;

import com.medimitra.backend.model.Doctor;
import com.medimitra.backend.repository.DoctorRepository;
import com.medimitra.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIDoctorSearchService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OpenRouterAIService openRouterAIService;

    // Medical knowledge base - symptom to specialization mapping
    private final Map<String, List<String>> symptomToSpecialization;

    // Specialization priority weights
    private final Map<String, Integer> specializationPriority;

    public AIDoctorSearchService() {
        // Initialize symptom to specialization mapping
        this.symptomToSpecialization = new HashMap<>();
        initializeSymptomMapping();
        
        // Initialize specialization priority
        this.specializationPriority = new HashMap<>();
        initializeSpecializationPriority();
    }

    private void initializeSymptomMapping() {
        // Cardiovascular symptoms
        symptomToSpecialization.put("chest pain", Arrays.asList("Cardiology", "Cardiothoracic Surgery", "Emergency Medicine", "Critical Care Medicine"));
        symptomToSpecialization.put("heart palpitations", Arrays.asList("Cardiology", "Cardiothoracic Surgery"));
        symptomToSpecialization.put("shortness of breath", Arrays.asList("Cardiology", "Cardiothoracic Surgery", "Pulmonology", "Emergency Medicine", "Critical Care Medicine"));
        symptomToSpecialization.put("high blood pressure", Arrays.asList("Cardiology", "Internal Medicine"));
        symptomToSpecialization.put("irregular heartbeat", Arrays.asList("Cardiology", "Cardiothoracic Surgery"));
        symptomToSpecialization.put("chest tightness", Arrays.asList("Cardiology", "Cardiothoracic Surgery", "Pulmonology"));
        
        // Dermatological symptoms
        symptomToSpecialization.put("skin rash", Arrays.asList("Dermatology"));
        symptomToSpecialization.put("acne", Arrays.asList("Dermatology"));
        symptomToSpecialization.put("eczema", Arrays.asList("Dermatology"));
        symptomToSpecialization.put("psoriasis", Arrays.asList("Dermatology"));
        symptomToSpecialization.put("moles", Arrays.asList("Dermatology"));
        symptomToSpecialization.put("skin cancer", Arrays.asList("Dermatology", "Oncology"));
        symptomToSpecialization.put("hives", Arrays.asList("Dermatology", "Allergy and Immunology"));
        symptomToSpecialization.put("dry skin", Arrays.asList("Dermatology"));
        symptomToSpecialization.put("skin infection", Arrays.asList("Dermatology", "Infectious Disease"));
        
        // Neurological symptoms
        symptomToSpecialization.put("headache", Arrays.asList("Neurology", "Internal Medicine"));
        symptomToSpecialization.put("migraine", Arrays.asList("Neurology"));
        symptomToSpecialization.put("seizures", Arrays.asList("Neurology"));
        symptomToSpecialization.put("memory problems", Arrays.asList("Neurology", "Geriatrics"));
        symptomToSpecialization.put("dizziness", Arrays.asList("Neurology", "Internal Medicine", "Cardiology"));
        symptomToSpecialization.put("numbness", Arrays.asList("Neurology", "Orthopedics"));
        symptomToSpecialization.put("tingling", Arrays.asList("Neurology", "Orthopedics"));
        symptomToSpecialization.put("balance problems", Arrays.asList("Neurology", "Physical Medicine"));
        
        // Orthopedic symptoms
        symptomToSpecialization.put("back pain", Arrays.asList("Orthopedics", "Physical Medicine"));
        symptomToSpecialization.put("joint pain", Arrays.asList("Orthopedics", "Rheumatology"));
        symptomToSpecialization.put("knee pain", Arrays.asList("Orthopedics"));
        symptomToSpecialization.put("shoulder pain", Arrays.asList("Orthopedics"));
        symptomToSpecialization.put("neck pain", Arrays.asList("Orthopedics", "Physical Medicine"));
        symptomToSpecialization.put("fracture", Arrays.asList("Orthopedics", "Emergency Medicine"));
        symptomToSpecialization.put("arthritis", Arrays.asList("Orthopedics", "Rheumatology"));
        symptomToSpecialization.put("muscle pain", Arrays.asList("Orthopedics", "Physical Medicine"));
        
        // Respiratory symptoms
        symptomToSpecialization.put("cough", Arrays.asList("Pulmonology", "Internal Medicine"));
        symptomToSpecialization.put("asthma", Arrays.asList("Pulmonology", "Allergy and Immunology"));
        symptomToSpecialization.put("pneumonia", Arrays.asList("Pulmonology", "Infectious Disease"));
        symptomToSpecialization.put("bronchitis", Arrays.asList("Pulmonology"));
        symptomToSpecialization.put("lung infection", Arrays.asList("Pulmonology", "Infectious Disease"));
        symptomToSpecialization.put("breathing problems", Arrays.asList("Pulmonology", "Cardiology"));
        
        // Gastrointestinal symptoms
        symptomToSpecialization.put("stomach pain", Arrays.asList("Gastroenterology", "Internal Medicine"));
        symptomToSpecialization.put("nausea", Arrays.asList("Gastroenterology", "Internal Medicine"));
        symptomToSpecialization.put("vomiting", Arrays.asList("Gastroenterology", "Internal Medicine"));
        symptomToSpecialization.put("diarrhea", Arrays.asList("Gastroenterology", "Infectious Disease"));
        symptomToSpecialization.put("constipation", Arrays.asList("Gastroenterology", "Internal Medicine"));
        symptomToSpecialization.put("heartburn", Arrays.asList("Gastroenterology"));
        symptomToSpecialization.put("acid reflux", Arrays.asList("Gastroenterology"));
        symptomToSpecialization.put("ulcer", Arrays.asList("Gastroenterology"));
        
        // Mental Health symptoms
        symptomToSpecialization.put("anxiety", Arrays.asList("Psychiatry", "Psychology"));
        symptomToSpecialization.put("depression", Arrays.asList("Psychiatry", "Psychology"));
        symptomToSpecialization.put("stress", Arrays.asList("Psychiatry", "Psychology"));
        symptomToSpecialization.put("panic attacks", Arrays.asList("Psychiatry"));
        symptomToSpecialization.put("mood swings", Arrays.asList("Psychiatry"));
        symptomToSpecialization.put("insomnia", Arrays.asList("Psychiatry", "Sleep Medicine"));
        
        // Pediatric symptoms
        symptomToSpecialization.put("child fever", Arrays.asList("Pediatrics"));
        symptomToSpecialization.put("child cough", Arrays.asList("Pediatrics"));
        symptomToSpecialization.put("child rash", Arrays.asList("Pediatrics", "Dermatology"));
        symptomToSpecialization.put("child development", Arrays.asList("Pediatrics"));
        symptomToSpecialization.put("vaccination", Arrays.asList("Pediatrics"));
        
        // General symptoms
        symptomToSpecialization.put("fever", Arrays.asList("Internal Medicine", "Infectious Disease"));
        symptomToSpecialization.put("fatigue", Arrays.asList("Internal Medicine", "Endocrinology"));
        symptomToSpecialization.put("weight loss", Arrays.asList("Internal Medicine", "Endocrinology"));
        symptomToSpecialization.put("weight gain", Arrays.asList("Internal Medicine", "Endocrinology"));
        symptomToSpecialization.put("diabetes", Arrays.asList("Endocrinology", "Internal Medicine"));
        symptomToSpecialization.put("thyroid", Arrays.asList("Endocrinology"));
        symptomToSpecialization.put("allergy", Arrays.asList("Allergy and Immunology"));
        symptomToSpecialization.put("infection", Arrays.asList("Infectious Disease", "Internal Medicine"));
        
        // Additional skin-related keywords for better matching
        symptomToSpecialization.put("black", Arrays.asList("Dermatology"));
        symptomToSpecialization.put("dot", Arrays.asList("Dermatology"));
        symptomToSpecialization.put("spot", Arrays.asList("Dermatology"));
        symptomToSpecialization.put("mark", Arrays.asList("Dermatology"));
        symptomToSpecialization.put("blemish", Arrays.asList("Dermatology"));
    }

    private void initializeSpecializationPriority() {
        specializationPriority.put("Emergency Medicine", 10);
        specializationPriority.put("Cardiology", 9);
        specializationPriority.put("Cardiothoracic Surgery", 9);
        specializationPriority.put("Critical Care Medicine", 8);
        specializationPriority.put("Neurology", 8);
        specializationPriority.put("Oncology", 8);
        specializationPriority.put("Infectious Disease", 7);
        specializationPriority.put("Pulmonology", 7);
        specializationPriority.put("Gastroenterology", 6);
        specializationPriority.put("Orthopedics", 6);
        specializationPriority.put("Dermatology", 5);
        specializationPriority.put("Psychiatry", 5);
        specializationPriority.put("Pediatrics", 5);
        specializationPriority.put("Internal Medicine", 4);
        specializationPriority.put("Endocrinology", 4);
        specializationPriority.put("Allergy and Immunology", 3);
        specializationPriority.put("Physical Medicine", 3);
        specializationPriority.put("Sleep Medicine", 2);
        specializationPriority.put("Psychology", 2);
        specializationPriority.put("Rheumatology", 2);
        specializationPriority.put("Geriatrics", 2);
    }

    public Map<String, Object> searchDoctorsBySymptoms(String symptoms) {
        try {
            // Get all doctors and enrich with user information
            List<Doctor> allDoctors = doctorRepository.findAll();
            
            // Enrich doctors with user information
            for (Doctor doctor : allDoctors) {
                userRepository.findById(doctor.getUserId()).ifPresent(user -> {
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("id", user.getId());
                    userInfo.put("name", user.getName());
                    userInfo.put("email", user.getEmail());
                    userInfo.put("image", user.getImage());
                    doctor.setUserInfo(userInfo);
                });
            }
            
            // Convert doctors to map format for OpenRouter
            List<Map<String, Object>> doctorsForAI = allDoctors.stream()
                .map(this::convertDoctorToMap)
                .collect(Collectors.toList());
            
            // Try OpenRouter AI first if configured
            if (openRouterAIService.isConfigured()) {
                try {
                    Map<String, Object> aiResult = openRouterAIService.analyzeSymptomsAndRecommendDoctors(symptoms, doctorsForAI);
                    if (aiResult.get("success").equals(true)) {
                        return aiResult;
                    }
                } catch (Exception e) {
                    System.err.println("AI analysis failed, using rule-based search: " + e.getMessage());
                }
            }
            
            // Fallback to rule-based search
            return performRuleBasedSearch(symptoms, allDoctors);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error in AI search: " + e.getMessage());
            return errorResponse;
        }
    }

    private Map<String, Object> performRuleBasedSearch(String symptoms, List<Doctor> allDoctors) {
        // Extract keywords from symptoms
        List<String> keywords = extractKeywords(symptoms.toLowerCase());
        
        // Find matching specializations
        Set<String> relevantSpecializations = findRelevantSpecializations(keywords);
        
        // Score and rank doctors
        List<DoctorScore> scoredDoctors = scoreDoctors(allDoctors, keywords, relevantSpecializations);
        
        // Sort by score (highest first)
        scoredDoctors.sort((a, b) -> Double.compare(b.score, a.score));
        
        // Get top recommendations
        List<Doctor> recommendedDoctors = scoredDoctors.stream()
            .map(ds -> ds.doctor)
            .limit(5) // Top 5 recommendations
            .collect(Collectors.toList());
        
        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("doctors", recommendedDoctors);
        response.put("analysis", Map.of(
            "symptoms", symptoms,
            "keywords", keywords,
            "relevantSpecializations", new ArrayList<>(relevantSpecializations),
            "totalMatches", scoredDoctors.size(),
            "recommendations", recommendedDoctors.size(),
            "note", "Rule-based analysis (OpenRouter AI not configured)"
        ));
        response.put("source", "rule_based");
        
        return response;
    }

    private Map<String, Object> convertDoctorToMap(Doctor doctor) {
        Map<String, Object> doctorMap = new HashMap<>();
        String doctorName = doctor.getUserInfo() != null ? (String) doctor.getUserInfo().get("name") : "Dr. Unknown";
        
        doctorMap.put("id", doctor.getId());
        doctorMap.put("userId", doctor.getUserId());
        doctorMap.put("name", doctorName);
        doctorMap.put("specialization", doctor.getSpecialization());
        doctorMap.put("experience", doctor.getExperience());
        doctorMap.put("rating", doctor.getRating().doubleValue());
        doctorMap.put("totalRatings", doctor.getTotalRatings());
        doctorMap.put("hospital", doctor.getHospital());
        doctorMap.put("consultationFee", doctor.getConsultationFee());
        doctorMap.put("licenseNumber", doctor.getLicenseNumber());
        doctorMap.put("availability", doctor.getAvailability());
        
        if (doctor.getUserInfo() != null) {
            doctorMap.put("userInfo", doctor.getUserInfo());
        }
        
        return doctorMap;
    }

    private List<String> extractKeywords(String symptoms) {
        List<String> keywords = new ArrayList<>();
        
        // Split by common delimiters
        String[] words = symptoms.split("[\\s,;.!?]+");
        
        for (String word : words) {
            word = word.trim().toLowerCase();
            if (word.length() > 2) { // Ignore very short words
                keywords.add(word);
            }
        }
        
        // Add phrase matching for common symptom combinations
        if (symptoms.contains("chest pain")) keywords.add("chest pain");
        if (symptoms.contains("shortness of breath")) keywords.add("shortness of breath");
        if (symptoms.contains("high blood pressure")) keywords.add("high blood pressure");
        if (symptoms.contains("skin rash")) keywords.add("skin rash");
        if (symptoms.contains("back pain")) keywords.add("back pain");
        if (symptoms.contains("joint pain")) keywords.add("joint pain");
        if (symptoms.contains("stomach pain")) keywords.add("stomach pain");
        if (symptoms.contains("acid reflux")) keywords.add("acid reflux");
        if (symptoms.contains("panic attacks")) keywords.add("panic attacks");
        if (symptoms.contains("weight loss")) keywords.add("weight loss");
        if (symptoms.contains("weight gain")) keywords.add("weight gain");
        
        // Add skin-related symptom matching
        if (symptoms.contains("black dot")) keywords.add("moles");
        if (symptoms.contains("dark spot")) keywords.add("moles");
        if (symptoms.contains("skin spot")) keywords.add("skin cancer");
        if (symptoms.contains("skin mark")) keywords.add("moles");
        if (symptoms.contains("black") && symptoms.contains("skin")) keywords.add("moles");
        if (symptoms.contains("dot") && symptoms.contains("skin")) keywords.add("moles");
        
        return keywords;
    }

    private Set<String> findRelevantSpecializations(List<String> keywords) {
        Set<String> specializations = new HashSet<>();
        
        for (String keyword : keywords) {
            if (symptomToSpecialization.containsKey(keyword)) {
                specializations.addAll(symptomToSpecialization.get(keyword));
            }
        }
        
        return specializations;
    }

    private List<DoctorScore> scoreDoctors(List<Doctor> doctors, List<String> keywords, Set<String> relevantSpecializations) {
        List<DoctorScore> scoredDoctors = new ArrayList<>();
        
        for (Doctor doctor : doctors) {
            double score = calculateDoctorScore(doctor, keywords, relevantSpecializations);
            if (score > 0) { // Only include doctors with positive scores
                scoredDoctors.add(new DoctorScore(doctor, score));
            }
        }
        
        return scoredDoctors;
    }

    private double calculateDoctorScore(Doctor doctor, List<String> keywords, Set<String> relevantSpecializations) {
        double score = 0.0;
        
        // Base score for specialization match
        if (relevantSpecializations.contains(doctor.getSpecialization())) {
            score += 10.0; // High score for direct specialization match
            
            // Add priority bonus
            Integer priority = specializationPriority.get(doctor.getSpecialization());
            if (priority != null) {
                score += priority * 0.5;
            }
        }
        
        // Experience bonus
        score += Math.min(doctor.getExperience() * 0.1, 2.0); // Max 2 points for experience
        
        // Rating bonus
        score += doctor.getRating().doubleValue() * 0.5; // Max 2.5 points for rating
        
        // Review count bonus (more reviews = more reliable)
        score += Math.min(doctor.getTotalRatings() * 0.01, 1.0); // Max 1 point for review count
        
        // Hospital reputation bonus (simplified)
        if (doctor.getHospital() != null && !doctor.getHospital().isEmpty()) {
            score += 0.5; // Small bonus for having hospital affiliation
        }
        
        // Keyword matching in specialization
        String specialization = doctor.getSpecialization().toLowerCase();
        for (String keyword : keywords) {
            if (specialization.contains(keyword)) {
                score += 1.0;
            }
        }
        
        return score;
    }

    // Helper class for scoring
    private static class DoctorScore {
        final Doctor doctor;
        final double score;
        
        DoctorScore(Doctor doctor, double score) {
            this.doctor = doctor;
            this.score = score;
        }
    }
}
