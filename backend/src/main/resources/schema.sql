-- MediMitra Healthcare System Database Schema
-- PostgreSQL Database Schema for Spring JDBC

-- Drop tables in correct order (foreign keys first)
-- Drop EHR tables first
DROP TABLE IF EXISTS ehr_documents CASCADE;
DROP TABLE IF EXISTS ehr_amendment_requests CASCADE;
DROP TABLE IF EXISTS ehr_patient_data CASCADE;
DROP TABLE IF EXISTS ehr_specialist_reports CASCADE;
DROP TABLE IF EXISTS ehr_immunizations CASCADE;
DROP TABLE IF EXISTS ehr_visit_summaries CASCADE;
DROP TABLE IF EXISTS ehr_imaging CASCADE;
DROP TABLE IF EXISTS ehr_lab_results CASCADE;
DROP TABLE IF EXISTS ehr_medications CASCADE;
DROP TABLE IF EXISTS ehr_allergies CASCADE;
DROP TABLE IF EXISTS ehr_medical_history CASCADE;
DROP TABLE IF EXISTS ehr_demographics CASCADE;

-- Drop main tables
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table - Core user management
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    image TEXT,
    role VARCHAR(50) DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin', 'pharmacist')),
    phone_number VARCHAR(20),
    date_of_birth TIMESTAMP,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    emergency_contact VARCHAR(255),
    blood_type VARCHAR(5) CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    allergies TEXT, -- JSON string of allergies
    medical_history TEXT, -- JSON string of medical history
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors table - Doctor-specific information
CREATE TABLE doctors (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    experience INTEGER DEFAULT 0 CHECK (experience >= 0),
    hospital VARCHAR(255),
    consultation_fee DECIMAL(10,2) NOT NULL CHECK (consultation_fee >= 0),
    availability TEXT, -- JSON string of available time slots
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_ratings INTEGER DEFAULT 0 CHECK (total_ratings >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Appointments table - Medical appointments
CREATE TABLE appointments (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    doctor_id VARCHAR(255) NOT NULL,
    date_time TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL CHECK (duration > 0), -- in minutes
    type VARCHAR(20) NOT NULL CHECK (type IN ('online', 'in-person', 'emergency')),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
    notes TEXT,
    symptoms TEXT, -- Patient's reported symptoms
    diagnosis TEXT, -- Doctor's diagnosis
    prescription TEXT, -- Prescription details
    fee DECIMAL(10,2) NOT NULL CHECK (fee >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Prescriptions table - Medical prescriptions
CREATE TABLE prescriptions (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    doctor_id VARCHAR(255),
    medications TEXT NOT NULL, -- JSON array of medications
    instructions TEXT NOT NULL,
    date_issued TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'fulfilled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

-- Medical Records table - Patient medical records
CREATE TABLE medical_records (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    record_type VARCHAR(50) NOT NULL CHECK (record_type IN ('lab_result', 'imaging', 'prescription', 'visit_note')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    file_url TEXT,
    date_recorded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    doctor_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- EHR Demographics table - Extended patient demographics
CREATE TABLE ehr_demographics (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) UNIQUE NOT NULL,
    marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'other')),
    occupation VARCHAR(255),
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(100),
    preferred_language VARCHAR(50),
    ethnicity VARCHAR(100),
    religion VARCHAR(100),
    next_of_kin_name VARCHAR(255),
    next_of_kin_relationship VARCHAR(100),
    next_of_kin_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- EHR Medical History table - Detailed medical history
CREATE TABLE ehr_medical_history (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    condition_name VARCHAR(255) NOT NULL,
    condition_code VARCHAR(50), -- ICD-10 code
    date_diagnosed DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'chronic', 'remission')),
    severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe')),
    notes TEXT,
    doctor_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

-- EHR Allergies table - Patient allergies and reactions
CREATE TABLE ehr_allergies (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    allergen VARCHAR(255) NOT NULL,
    allergen_type VARCHAR(50) CHECK (allergen_type IN ('food', 'medication', 'environmental', 'other')),
    reaction VARCHAR(255) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe', 'life-threatening')),
    date_identified DATE,
    notes TEXT,
    verified_by_doctor BOOLEAN DEFAULT FALSE,
    doctor_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

-- EHR Medications table - Current and past medications
CREATE TABLE ehr_medications (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    route VARCHAR(50), -- oral, injection, topical, etc.
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'completed')),
    prescribed_by VARCHAR(255),
    reason VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (prescribed_by) REFERENCES doctors(id) ON DELETE SET NULL
);

-- EHR Lab Results table - Laboratory test results
CREATE TABLE ehr_lab_results (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    test_code VARCHAR(50), -- LOINC code
    result_value VARCHAR(255),
    reference_range VARCHAR(255),
    unit VARCHAR(50),
    status VARCHAR(20) DEFAULT 'final' CHECK (status IN ('pending', 'preliminary', 'final', 'corrected')),
    abnormal_flag VARCHAR(20) CHECK (abnormal_flag IN ('normal', 'high', 'low', 'critical')),
    test_date DATE NOT NULL,
    ordered_by VARCHAR(255),
    lab_name VARCHAR(255),
    notes TEXT,
    file_url TEXT, -- Appwrite file URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ordered_by) REFERENCES doctors(id) ON DELETE SET NULL
);

-- EHR Imaging table - Medical imaging records
CREATE TABLE ehr_imaging (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    study_type VARCHAR(100) NOT NULL, -- X-ray, MRI, CT, Ultrasound, etc.
    body_part VARCHAR(100) NOT NULL,
    study_date DATE NOT NULL,
    findings TEXT,
    impression TEXT,
    radiologist_name VARCHAR(255),
    ordered_by VARCHAR(255),
    facility_name VARCHAR(255),
    study_id VARCHAR(100), -- DICOM Study ID
    file_url TEXT, -- Appwrite file URL for images
    report_url TEXT, -- Appwrite file URL for report
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ordered_by) REFERENCES doctors(id) ON DELETE SET NULL
);

-- EHR Visit Summaries table - Detailed visit records
CREATE TABLE ehr_visit_summaries (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    doctor_id VARCHAR(255),
    visit_date DATE NOT NULL,
    visit_type VARCHAR(50) CHECK (visit_type IN ('routine', 'urgent', 'emergency', 'follow-up', 'consultation')),
    chief_complaint TEXT,
    history_of_present_illness TEXT,
    physical_examination TEXT,
    assessment TEXT,
    plan TEXT,
    vital_signs JSONB, -- {"bp": "120/80", "pulse": "72", "temp": "98.6", "resp": "16"}
    diagnosis_codes TEXT, -- ICD-10 codes
    procedure_codes TEXT, -- CPT codes
    facility_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

-- EHR Immunizations table - Vaccination records
CREATE TABLE ehr_immunizations (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    vaccine_name VARCHAR(255) NOT NULL,
    vaccine_code VARCHAR(50), -- CVX code
    date_administered DATE NOT NULL,
    dose_number INTEGER,
    route VARCHAR(50), -- intramuscular, oral, nasal, etc.
    site VARCHAR(50), -- left arm, right arm, etc.
    manufacturer VARCHAR(255),
    lot_number VARCHAR(100),
    expiration_date DATE,
    administered_by VARCHAR(255),
    facility_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- EHR Specialist Reports table - Reports from specialists
CREATE TABLE ehr_specialist_reports (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    specialist_id VARCHAR(255),
    specialty VARCHAR(100) NOT NULL,
    report_date DATE NOT NULL,
    referral_reason TEXT,
    consultation_summary TEXT,
    recommendations TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    report_file_url TEXT, -- Appwrite file URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (specialist_id) REFERENCES doctors(id) ON DELETE SET NULL
);

-- Patient Generated Health Data (PGHD) table
CREATE TABLE ehr_patient_data (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('blood_pressure', 'blood_glucose', 'weight', 'heart_rate', 'temperature', 'symptoms', 'exercise', 'sleep', 'medication_adherence', 'mood', 'pain_level', 'other')),
    value VARCHAR(255) NOT NULL,
    unit VARCHAR(50),
    recorded_date TIMESTAMP NOT NULL,
    notes TEXT,
    source VARCHAR(50) DEFAULT 'patient' CHECK (source IN ('patient', 'device', 'app')),
    device_info TEXT, -- JSON string for device information
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Amendment Requests table - For patient corrections and annotations
CREATE TABLE ehr_amendment_requests (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    record_type VARCHAR(50) NOT NULL, -- table name or record type
    record_id VARCHAR(255) NOT NULL, -- ID of the record being amended
    amendment_type VARCHAR(20) NOT NULL CHECK (amendment_type IN ('correction', 'annotation')),
    field_name VARCHAR(255) NOT NULL,
    current_value TEXT,
    proposed_value TEXT,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    reviewed_by VARCHAR(255),
    review_date TIMESTAMP,
    review_notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Document Storage table - For uploaded documents
CREATE TABLE ehr_documents (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('lab_report', 'imaging_report', 'discharge_summary', 'insurance_card', 'other_medical', 'patient_upload')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL, -- Appwrite file URL
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    appwrite_file_id VARCHAR(255), -- Appwrite file ID for management
    uploaded_by VARCHAR(255),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reconciled BOOLEAN DEFAULT FALSE, -- Whether staff has reviewed/reconciled
    reconciled_by VARCHAR(255),
    reconciled_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reconciled_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_doctors_license_number ON doctors(license_number);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);
CREATE INDEX idx_doctors_rating ON doctors(rating DESC);

CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date_time ON appointments(date_time);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_type ON appointments(type);

CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescriptions_date_issued ON prescriptions(date_issued);

CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_record_type ON medical_records(record_type);
CREATE INDEX idx_medical_records_date_recorded ON medical_records(date_recorded);

-- EHR table indexes
CREATE INDEX idx_ehr_demographics_patient_id ON ehr_demographics(patient_id);
CREATE INDEX idx_ehr_medical_history_patient_id ON ehr_medical_history(patient_id);
CREATE INDEX idx_ehr_medical_history_status ON ehr_medical_history(status);
CREATE INDEX idx_ehr_allergies_patient_id ON ehr_allergies(patient_id);
CREATE INDEX idx_ehr_allergies_allergen_type ON ehr_allergies(allergen_type);
CREATE INDEX idx_ehr_medications_patient_id ON ehr_medications(patient_id);
CREATE INDEX idx_ehr_medications_status ON ehr_medications(status);
CREATE INDEX idx_ehr_lab_results_patient_id ON ehr_lab_results(patient_id);
CREATE INDEX idx_ehr_lab_results_test_date ON ehr_lab_results(test_date);
CREATE INDEX idx_ehr_imaging_patient_id ON ehr_imaging(patient_id);
CREATE INDEX idx_ehr_imaging_study_date ON ehr_imaging(study_date);
CREATE INDEX idx_ehr_visit_summaries_patient_id ON ehr_visit_summaries(patient_id);
CREATE INDEX idx_ehr_visit_summaries_visit_date ON ehr_visit_summaries(visit_date);
CREATE INDEX idx_ehr_immunizations_patient_id ON ehr_immunizations(patient_id);
CREATE INDEX idx_ehr_immunizations_date_administered ON ehr_immunizations(date_administered);
CREATE INDEX idx_ehr_specialist_reports_patient_id ON ehr_specialist_reports(patient_id);
CREATE INDEX idx_ehr_specialist_reports_report_date ON ehr_specialist_reports(report_date);
CREATE INDEX idx_ehr_patient_data_patient_id ON ehr_patient_data(patient_id);
CREATE INDEX idx_ehr_patient_data_data_type ON ehr_patient_data(data_type);
CREATE INDEX idx_ehr_patient_data_recorded_date ON ehr_patient_data(recorded_date);
CREATE INDEX idx_ehr_amendment_requests_patient_id ON ehr_amendment_requests(patient_id);
CREATE INDEX idx_ehr_amendment_requests_status ON ehr_amendment_requests(status);
CREATE INDEX idx_ehr_documents_patient_id ON ehr_documents(patient_id);
CREATE INDEX idx_ehr_documents_document_type ON ehr_documents(document_type);
CREATE INDEX idx_ehr_documents_upload_date ON ehr_documents(upload_date);

-- Note: Automatic timestamp updates will be handled by the application layer
-- This avoids complex PostgreSQL function syntax issues

