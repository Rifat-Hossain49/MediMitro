-- Sample data for MediMitra Healthcare System
-- This file is automatically executed by Spring Boot on startup

-- Insert sample users (patients and staff)
INSERT INTO users (id, email, password, name, role, phone_number, date_of_birth, gender, address, emergency_contact, blood_type, email_verified, created_at, updated_at) 
VALUES 
    ('user-patient-1', 'john.doe@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'John Doe', 'patient', '+1-555-0101', '1985-03-15', 'male', '123 Main St, City, State', 'Jane Doe +1-555-0102', 'O+', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('user-patient-2', 'emily.smith@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Emily Smith', 'patient', '+1-555-0201', '1992-07-22', 'female', '456 Oak Ave, City, State', 'Mike Smith +1-555-0202', 'A+', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('user-doctor-1', 'dr.sarah.johnson@hospital.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Sarah Johnson', 'doctor', '+1-555-1001', '1978-11-08', 'female', '789 Medical Dr, City, State', 'Emergency Contact +1-555-1002', 'B+', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('user-doctor-2', 'dr.michael.chen@hospital.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Dr. Michael Chen', 'doctor', '+1-555-1101', '1982-04-14', 'male', '321 Health Blvd, City, State', 'Emergency Contact +1-555-1102', 'AB+', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert sample doctors
INSERT INTO doctors (id, user_id, license_number, specialization, experience, hospital, consultation_fee, availability, rating, total_ratings, created_at, updated_at)
VALUES 
    ('doctor-1', 'user-doctor-1', 'MD123456', 'Critical Care Medicine', 12, 'City General Hospital', 250.00, '{"monday": ["09:00-17:00"], "tuesday": ["09:00-17:00"], "wednesday": ["09:00-17:00"]}', 4.9, 156, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('doctor-2', 'user-doctor-2', 'MD789012', 'Cardiothoracic Surgery', 15, 'Mercy Medical Center', 350.00, '{"monday": ["08:00-16:00"], "wednesday": ["08:00-16:00"], "friday": ["08:00-16:00"]}', 4.8, 203, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert sample ICU beds
INSERT INTO icu_beds (id, bed_number, hospital, hospital_address, icu_type, status, daily_rate, equipment, assigned_patient_id, reservation_start_time, reservation_end_time, created_at, updated_at)
VALUES 
    ('icu-bed-1', 'ICU-101', 'City General Hospital', '123 Medical Center Drive, Downtown', 'general', 'available', 1200.00, '["Ventilator", "Cardiac Monitor", "Defibrillator", "IV Pump"]', NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('icu-bed-2', 'ICU-102', 'City General Hospital', '123 Medical Center Drive, Downtown', 'cardiac', 'available', 1500.00, '["Advanced Cardiac Monitor", "ECMO", "Balloon Pump", "Ventilator"]', NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('icu-bed-3', 'ICU-103', 'City General Hospital', '123 Medical Center Drive, Downtown', 'neuro', 'available', 1400.00, '["Neuro Monitor", "ICP Monitor", "Ventilator", "EEG"]', NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('icu-bed-4', 'ICU-201', 'Mercy Medical Center', '456 Healthcare Boulevard, Midtown', 'general', 'available', 1100.00, '["Ventilator", "Monitor", "IV Pump"]', NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('icu-bed-5', 'ICU-202', 'Mercy Medical Center', '456 Healthcare Boulevard, Midtown', 'pediatric', 'available', 1300.00, '["Pediatric Ventilator", "Specialized Monitor", "Warmer"]', NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('icu-bed-6', 'ICU-104', 'City General Hospital', '123 Medical Center Drive, Downtown', 'general', 'occupied', 1200.00, '["Ventilator", "Cardiac Monitor", "Defibrillator", "IV Pump"]', 'user-patient-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '3 days', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert sample ambulance bookings
INSERT INTO ambulance_bookings (id, patient_id, emergency_type, priority, pickup_address, pickup_latitude, pickup_longitude, destination, destination_latitude, destination_longitude, contact_phone, symptoms, additional_info, status, ambulance_id, driver_id, paramedics_ids, estimated_cost, final_cost, request_time, dispatch_time, arrival_time, completion_time, estimated_arrival_minutes, cancellation_reason, created_at, updated_at)
VALUES 
    ('amb-booking-1', 'user-patient-2', 'medical', 'high', '789 Emergency Lane, City', '40.7128', '-74.0060', 'City General Hospital', '40.7589', '-73.9851', '+1-555-9999', 'Severe chest pain', 'Patient conscious but in distress', 'completed', 'AMB-001', 'DRIVER-001', '["PARA-001", "PARA-002"]', 450.00, 420.00, CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour 55 minutes', CURRENT_TIMESTAMP - INTERVAL '1 hour 45 minutes', CURRENT_TIMESTAMP - INTERVAL '1 hour', 8, NULL, CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
    ('amb-booking-2', 'user-patient-1', 'trauma', 'critical', '456 Accident Spot, City', '40.7485', '-73.9857', 'Emergency Medical Center', '40.7505', '-73.9934', '+1-555-8888', 'Motor vehicle accident', 'Multiple injuries, patient stable', 'en_route', 'AMB-002', 'DRIVER-002', '["PARA-003", "PARA-004"]', 750.00, NULL, CURRENT_TIMESTAMP - INTERVAL '15 minutes', CURRENT_TIMESTAMP - INTERVAL '10 minutes', NULL, NULL, 5, NULL, CURRENT_TIMESTAMP - INTERVAL '15 minutes', CURRENT_TIMESTAMP - INTERVAL '10 minutes')
ON CONFLICT (id) DO NOTHING;

-- Insert sample appointments
INSERT INTO appointments (id, patient_id, doctor_id, date_time, duration, type, status, notes, symptoms, diagnosis, prescription, fee, created_at, updated_at)
VALUES 
    ('appt-1', 'user-patient-1', 'doctor-1', CURRENT_TIMESTAMP + INTERVAL '2 days', 30, 'in-person', 'scheduled', 'Regular checkup', 'Fatigue, occasional headaches', NULL, NULL, 250.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('appt-2', 'user-patient-2', 'doctor-2', CURRENT_TIMESTAMP + INTERVAL '1 week', 45, 'in-person', 'scheduled', 'Cardiac consultation', 'Chest pain, shortness of breath', NULL, NULL, 350.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert sample prescriptions
INSERT INTO prescriptions (id, patient_id, doctor_id, medications, instructions, date_issued, valid_until, status, created_at, updated_at)
VALUES 
    ('rx-1', 'user-patient-1', 'doctor-1', '[{"name": "Lisinopril", "dosage": "10mg", "frequency": "Once daily"}, {"name": "Aspirin", "dosage": "81mg", "frequency": "Once daily"}]', 'Take with food. Monitor blood pressure regularly.', CURRENT_TIMESTAMP - INTERVAL '1 week', CURRENT_TIMESTAMP + INTERVAL '3 weeks', 'active', CURRENT_TIMESTAMP - INTERVAL '1 week', CURRENT_TIMESTAMP - INTERVAL '1 week'),
    ('rx-2', 'user-patient-2', 'doctor-2', '[{"name": "Metformin", "dosage": "500mg", "frequency": "Twice daily"}]', 'Take with meals to reduce stomach upset.', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '27 days', 'active', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- Insert sample medical records
INSERT INTO medical_records (id, patient_id, record_type, title, description, file_url, date_recorded, doctor_notes, created_at, updated_at)
VALUES 
    ('record-1', 'user-patient-1', 'visit_note', 'Routine Physical Examination', 'Annual physical examination with blood work', NULL, CURRENT_TIMESTAMP - INTERVAL '1 month', 'Patient in good overall health. Blood pressure slightly elevated.', CURRENT_TIMESTAMP - INTERVAL '1 month', CURRENT_TIMESTAMP - INTERVAL '1 month'),
    ('record-2', 'user-patient-2', 'lab_result', 'Complete Blood Count', 'CBC with differential and platelets', NULL, CURRENT_TIMESTAMP - INTERVAL '2 weeks', 'All values within normal limits.', CURRENT_TIMESTAMP - INTERVAL '2 weeks', CURRENT_TIMESTAMP - INTERVAL '2 weeks')
ON CONFLICT (id) DO NOTHING;

-- Insert sample medications (drug database)
INSERT INTO medications (id, name, generic_name, manufacturer, description, side_effects, dosage_form, strength, category, requires_prescription, created_at, updated_at)
VALUES 
    ('med-1', 'Lisinopril', 'Lisinopril', 'Generic Pharma', 'ACE inhibitor used to treat high blood pressure and heart failure', 'Dizziness, dry cough, fatigue, headache', 'Tablet', '10mg', 'Cardiovascular', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('med-2', 'Aspirin', 'Acetylsalicylic acid', 'Bayer', 'NSAID used for pain relief, fever reduction, and cardiovascular protection', 'Stomach upset, bleeding risk, ringing in ears', 'Tablet', '81mg', 'Pain Relief', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('med-3', 'Metformin', 'Metformin hydrochloride', 'Generic Pharma', 'Antidiabetic medication used to treat type 2 diabetes', 'Nausea, diarrhea, metallic taste, stomach upset', 'Tablet', '500mg', 'Diabetes', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('med-4', 'Atorvastatin', 'Atorvastatin calcium', 'Pfizer', 'Statin used to lower cholesterol and reduce cardiovascular risk', 'Muscle pain, liver problems, digestive issues', 'Tablet', '20mg', 'Cardiovascular', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('med-5', 'Omeprazole', 'Omeprazole', 'Generic Pharma', 'Proton pump inhibitor used to treat acid reflux and stomach ulcers', 'Headache, nausea, diarrhea, stomach pain', 'Capsule', '20mg', 'Gastrointestinal', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('med-6', 'Vitamin D3', 'Cholecalciferol', 'Nature Made', 'Vitamin supplement for bone health and immune function', 'Nausea, vomiting, constipation, weakness', 'Softgel', '1000 IU', 'Vitamins', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('med-7', 'Ibuprofen', 'Ibuprofen', 'Advil', 'NSAID used for pain relief, inflammation, and fever reduction', 'Stomach upset, dizziness, headache, rash', 'Tablet', '200mg', 'Pain Relief', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('med-8', 'Loratadine', 'Loratadine', 'Claritin', 'Antihistamine used to treat allergies and hay fever', 'Drowsiness, dry mouth, headache, fatigue', 'Tablet', '10mg', 'Allergy', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert sample patient medications (EHR)
INSERT INTO ehr_medications (id, patient_id, medication_name, dosage, frequency, route, start_date, end_date, status, prescribed_by, reason, notes, created_at, updated_at)
VALUES 
    ('ehr-med-1', 'user-patient-1', 'Lisinopril', '10mg', 'Once daily', 'oral', CURRENT_DATE - INTERVAL '30 days', NULL, 'active', 'doctor-1', 'Hypertension management', 'Take in the morning with or without food', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ehr-med-2', 'user-patient-1', 'Aspirin', '81mg', 'Once daily', 'oral', CURRENT_DATE - INTERVAL '30 days', NULL, 'active', 'doctor-1', 'Cardiovascular protection', 'Low-dose aspirin for heart health', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ehr-med-3', 'user-patient-2', 'Metformin', '500mg', 'Twice daily', 'oral', CURRENT_DATE - INTERVAL '14 days', NULL, 'active', 'doctor-2', 'Type 2 diabetes management', 'Take with meals to reduce stomach upset', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ehr-med-4', 'user-patient-2', 'Vitamin D3', '1000 IU', 'Once daily', 'oral', CURRENT_DATE - INTERVAL '60 days', NULL, 'active', NULL, 'Bone health and immune support', 'Take with a meal containing fat for better absorption', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;