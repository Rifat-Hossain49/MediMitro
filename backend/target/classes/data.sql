-- Sample data for MediMitra Healthcare System
-- This file contains test data for development and demonstration

-- Insert sample users (passwords are hashed with BCrypt)
-- Default password for all users: "password123"
INSERT INTO users (id, email, password, name, role, phone_number, gender, address, email_verified, created_at, updated_at) VALUES
('user-1', 'admin@medimitra.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeO.z5.JGZfNh/K4W', 'System Administrator', 'admin', '+1234567890', 'other', '123 Admin Street, Tech City', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-2', 'dr.smith@medimitra.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeO.z5.JGZfNh/K4W', 'Dr. John Smith', 'doctor', '+1234567891', 'male', '456 Medical Ave, Health City', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-3', 'dr.johnson@medimitra.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeO.z5.JGZfNh/K4W', 'Dr. Sarah Johnson', 'doctor', '+1234567892', 'female', '789 Wellness Blvd, Care Town', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-4', 'patient1@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeO.z5.JGZfNh/K4W', 'Alice Williams', 'patient', '+1234567893', 'female', '101 Patient Lane, Recovery City', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-5', 'patient2@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeO.z5.JGZfNh/K4W', 'Bob Chen', 'patient', '+1234567894', 'male', '202 Health Street, Wellness Town', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-6', 'pharmacist@medimitra.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeO.z5.JGZfNh/K4W', 'Maria Rodriguez', 'pharmacist', '+1234567895', 'female', '303 Pharmacy Plaza, Med City', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample doctors
INSERT INTO doctors (id, user_id, license_number, specialization, experience, hospital, consultation_fee, availability, rating, total_ratings, created_at, updated_at) VALUES
('doc-1', 'user-2', 'MD12345', 'Cardiology', 15, 'Central Medical Hospital', 150.00, '{"monday": ["09:00", "17:00"], "tuesday": ["09:00", "17:00"], "wednesday": ["09:00", "17:00"], "thursday": ["09:00", "17:00"], "friday": ["09:00", "17:00"]}', 4.8, 25, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('doc-2', 'user-3', 'MD67890', 'Dermatology', 8, 'Skin Care Specialists', 120.00, '{"monday": ["10:00", "18:00"], "wednesday": ["10:00", "18:00"], "friday": ["10:00", "18:00"], "saturday": ["09:00", "13:00"]}', 4.6, 18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample appointments
INSERT INTO appointments (id, patient_id, doctor_id, date_time, duration, type, status, notes, symptoms, diagnosis, fee, created_at, updated_at) VALUES
('apt-1', 'user-4', 'doc-1', '2024-12-30 10:00:00', 30, 'in-person', 'scheduled', 'Regular checkup', 'Chest pain, shortness of breath', NULL, 150.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('apt-2', 'user-5', 'doc-2', '2024-12-31 14:00:00', 45, 'online', 'scheduled', 'Skin consultation', 'Rash on arms', NULL, 120.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('apt-3', 'user-4', 'doc-1', '2024-12-25 09:00:00', 30, 'in-person', 'completed', 'Follow-up visit', 'Feeling better', 'Hypertension under control', 150.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample prescriptions
INSERT INTO prescriptions (id, patient_id, doctor_id, medications, instructions, date_issued, valid_until, status, created_at, updated_at) VALUES
('presc-1', 'user-4', 'doc-1', '[{"name": "Lisinopril", "dosage": "10mg", "frequency": "once daily", "duration": "30 days"}]', 'Take with food. Monitor blood pressure regularly.', '2024-12-25 09:30:00', '2025-01-25 09:30:00', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('presc-2', 'user-5', 'doc-2', '[{"name": "Hydrocortisone Cream", "dosage": "1%", "frequency": "twice daily", "duration": "14 days"}]', 'Apply thin layer to affected areas. Avoid contact with eyes.', '2024-12-20 15:00:00', '2025-01-20 15:00:00', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample medical records
INSERT INTO medical_records (id, patient_id, record_type, title, description, date_recorded, doctor_notes, created_at, updated_at) VALUES
('rec-1', 'user-4', 'lab_result', 'Blood Pressure Monitoring', 'Blood pressure readings: 130/85 mmHg. Slight elevation noted.', '2024-12-25 09:15:00', 'Patient responding well to medication. Continue current treatment.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rec-2', 'user-5', 'visit_note', 'Dermatology Consultation', 'Patient presented with inflammatory skin condition on bilateral arms. Prescribed topical treatment.', '2024-12-20 14:30:00', 'Recommend follow-up in 2 weeks to assess treatment response.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rec-3', 'user-4', 'imaging', 'Chest X-Ray', 'Chest X-ray shows normal cardiac silhouette and clear lung fields.', '2024-12-20 10:00:00', 'No acute cardiopulmonary abnormalities detected.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert sample EHR data

-- EHR Demographics
INSERT INTO ehr_demographics (id, patient_id, marital_status, occupation, insurance_provider, insurance_policy_number, preferred_language, ethnicity, next_of_kin_name, next_of_kin_relationship, next_of_kin_phone, created_at, updated_at) VALUES
('demo-1', 'user-4', 'married', 'Software Engineer', 'Blue Cross Blue Shield', 'BCBS-123456789', 'English', 'Caucasian', 'John Williams', 'Spouse', '+1234567899', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('demo-2', 'user-5', 'single', 'Teacher', 'Aetna Health', 'AET-987654321', 'English', 'Asian', 'Susan Chen', 'Mother', '+1234567898', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- EHR Medical History
INSERT INTO ehr_medical_history (id, patient_id, condition_name, condition_code, date_diagnosed, status, severity, notes, doctor_id, created_at, updated_at) VALUES
('hist-1', 'user-4', 'Hypertension', 'I10', '2022-03-15', 'active', 'moderate', 'Essential hypertension, well controlled with medication', 'doc-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('hist-2', 'user-4', 'Type 2 Diabetes', 'E11.9', '2021-08-20', 'active', 'mild', 'Diabetes mellitus type 2 without complications', 'doc-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('hist-3', 'user-5', 'Eczema', 'L30.9', '2020-06-10', 'chronic', 'mild', 'Atopic dermatitis, recurring episodes', 'doc-2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- EHR Allergies
INSERT INTO ehr_allergies (id, patient_id, allergen, allergen_type, reaction, severity, date_identified, notes, verified_by_doctor, doctor_id, created_at, updated_at) VALUES
('allergy-1', 'user-4', 'Penicillin', 'medication', 'Rash, hives', 'moderate', '2019-05-12', 'Developed rash after taking penicillin for infection', true, 'doc-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('allergy-2', 'user-4', 'Shellfish', 'food', 'Swelling, difficulty breathing', 'severe', '2018-07-22', 'Anaphylactic reaction after eating shrimp', true, 'doc-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('allergy-3', 'user-5', 'Pollen', 'environmental', 'Sneezing, watery eyes', 'mild', '2017-04-15', 'Seasonal allergies during spring', true, 'doc-2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- EHR Medications
INSERT INTO ehr_medications (id, patient_id, medication_name, dosage, frequency, route, start_date, status, prescribed_by, reason, notes, created_at, updated_at) VALUES
('med-1', 'user-4', 'Lisinopril', '10mg', 'Once daily', 'Oral', '2022-03-15', 'active', 'doc-1', 'Hypertension management', 'Take in the morning with water', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('med-2', 'user-4', 'Metformin', '500mg', 'Twice daily', 'Oral', '2021-08-20', 'active', 'doc-1', 'Type 2 Diabetes management', 'Take with meals to reduce GI upset', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('med-3', 'user-5', 'Hydrocortisone Cream', '1%', 'As needed', 'Topical', '2024-12-20', 'active', 'doc-2', 'Eczema treatment', 'Apply thin layer to affected areas', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- EHR Lab Results
INSERT INTO ehr_lab_results (id, patient_id, test_name, test_code, result_value, reference_range, unit, status, abnormal_flag, test_date, ordered_by, lab_name, notes, created_at, updated_at) VALUES
('lab-1', 'user-4', 'Hemoglobin A1C', '4548-4', '7.2', '4.0-5.6', '%', 'final', 'high', '2024-12-20', 'doc-1', 'Central Lab Services', 'Diabetes monitoring', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('lab-2', 'user-4', 'Total Cholesterol', '2093-3', '190', '<200', 'mg/dL', 'final', 'normal', '2024-12-20', 'doc-1', 'Central Lab Services', 'Cardiovascular risk assessment', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('lab-3', 'user-5', 'Complete Blood Count', '58410-2', 'Normal', 'See individual components', '', 'final', 'normal', '2024-12-15', 'doc-2', 'Central Lab Services', 'Routine screening', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- EHR Imaging
INSERT INTO ehr_imaging (id, patient_id, study_type, body_part, study_date, findings, impression, radiologist_name, ordered_by, facility_name, study_id, created_at, updated_at) VALUES
('img-1', 'user-4', 'Chest X-Ray', 'Chest', '2024-12-20', 'Normal cardiac silhouette. Clear lung fields bilaterally. No acute abnormalities.', 'Normal chest radiograph', 'Dr. Robert Kim', 'doc-1', 'Central Medical Imaging', 'CXR-2024-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('img-2', 'user-5', 'Skin Biopsy', 'Arm', '2024-12-10', 'Epidermal hyperplasia with chronic inflammation consistent with eczema.', 'Chronic eczematous dermatitis', 'Dr. Lisa Park', 'doc-2', 'Dermatology Associates', 'BIOPSY-2024-001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- EHR Visit Summaries
INSERT INTO ehr_visit_summaries (id, patient_id, doctor_id, visit_date, visit_type, chief_complaint, history_of_present_illness, physical_examination, assessment, plan, vital_signs, diagnosis_codes, facility_name, notes, created_at, updated_at) VALUES
('visit-1', 'user-4', 'doc-1', '2024-12-25', 'follow-up', 'Routine diabetes and hypertension follow-up', 'Patient reports feeling well. No new symptoms. Compliance with medications good.', 'BP: 128/82, HR: 68, T: 98.6F. No acute distress.', 'Diabetes and hypertension stable', 'Continue current medications. Recheck labs in 3 months.', '{"bp": "128/82", "pulse": "68", "temp": "98.6", "resp": "16"}', 'I10, E11.9', 'Central Medical Hospital', 'Patient doing well on current regimen', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('visit-2', 'user-5', 'doc-2', '2024-12-20', 'routine', 'Skin rash follow-up', 'Patient reports improvement in eczema with topical treatment.', 'Skin: Mild erythema on arms, improved from last visit.', 'Eczema responding to treatment', 'Continue topical steroid. Follow-up in 2 weeks.', '{"bp": "110/70", "pulse": "72", "temp": "98.4", "resp": "14"}', 'L30.9', 'Skin Care Specialists', 'Good response to treatment', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- EHR Immunizations
INSERT INTO ehr_immunizations (id, patient_id, vaccine_name, vaccine_code, date_administered, dose_number, route, site, manufacturer, administered_by, facility_name, notes, created_at, updated_at) VALUES
('imm-1', 'user-4', 'COVID-19 mRNA Vaccine', '208', '2024-10-15', 1, 'Intramuscular', 'Left arm', 'Pfizer-BioNTech', 'Nurse Smith', 'Central Medical Hospital', 'Annual booster', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('imm-2', 'user-4', 'Influenza Vaccine', '141', '2024-09-20', 1, 'Intramuscular', 'Right arm', 'Sanofi Pasteur', 'Nurse Johnson', 'Central Medical Hospital', 'Seasonal flu vaccine', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('imm-3', 'user-5', 'COVID-19 mRNA Vaccine', '208', '2024-11-01', 1, 'Intramuscular', 'Left arm', 'Moderna', 'Nurse Davis', 'Community Health Center', 'Annual booster', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- EHR Specialist Reports
INSERT INTO ehr_specialist_reports (id, patient_id, specialist_id, specialty, report_date, referral_reason, consultation_summary, recommendations, follow_up_required, created_at, updated_at) VALUES
('spec-1', 'user-4', 'doc-1', 'Cardiology', '2024-11-15', 'Hypertension management', 'Comprehensive cardiac evaluation. EKG normal. Echocardiogram shows normal LV function.', 'Continue current antihypertensive therapy. Lifestyle modifications emphasized.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('spec-2', 'user-5', 'doc-2', 'Dermatology', '2024-12-20', 'Chronic eczema', 'Detailed skin examination. Chronic eczematous changes noted on bilateral arms.', 'Topical steroid therapy. Moisturizer regimen. Avoid known triggers.', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- EHR Patient Data (PGHD)
INSERT INTO ehr_patient_data (id, patient_id, data_type, value, unit, recorded_date, notes, source, created_at, updated_at) VALUES
('pghd-1', 'user-4', 'blood_pressure', '125/80', 'mmHg', '2024-12-26 08:00:00', 'Morning reading', 'patient', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pghd-2', 'user-4', 'blood_glucose', '110', 'mg/dL', '2024-12-26 07:30:00', 'Fasting glucose', 'device', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pghd-3', 'user-5', 'symptoms', 'Mild itching on arms', '', '2024-12-26 10:00:00', 'Eczema flare-up', 'patient', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pghd-4', 'user-4', 'weight', '180', 'lbs', '2024-12-26 07:00:00', 'Daily weigh-in', 'patient', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- EHR Amendment Requests
INSERT INTO ehr_amendment_requests (id, patient_id, record_type, record_id, amendment_type, field_name, current_value, proposed_value, reason, status, submitted_at, updated_at) VALUES
('amend-1', 'user-4', 'ehr_allergies', 'allergy-1', 'correction', 'severity', 'moderate', 'mild', 'The reaction was actually mild, not moderate. Only had slight rash.', 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('amend-2', 'user-5', 'ehr_visit_summaries', 'visit-2', 'annotation', 'physical_examination', 'Skin: Mild erythema on arms, improved from last visit.', 'The rash was more noticeable in the morning but improved throughout the day.', 'Want to add context about timing of symptoms', 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

