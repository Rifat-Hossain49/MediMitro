-- Safe schema creation - Only creates tables if they don't exist
-- NO DROP STATEMENTS to preserve existing data

-- Create ehr_patient_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS ehr_patient_data (
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

-- Create ehr_amendment_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS ehr_amendment_requests (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    record_type VARCHAR(100) NOT NULL, -- e.g., 'ehr_allergies', 'ehr_medications'
    record_id VARCHAR(255) NOT NULL,   -- ID of the specific record being amended
    amendment_type VARCHAR(20) NOT NULL CHECK (amendment_type IN ('correction', 'annotation')),
    field_name VARCHAR(100) NOT NULL,  -- Field being corrected/annotated
    current_value TEXT,                -- Current value in the record
    proposed_value TEXT NOT NULL,      -- Patient's proposed change
    reason TEXT NOT NULL,              -- Why the change is needed
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    reviewed_by VARCHAR(255),          -- Staff member who reviewed
    review_notes TEXT,                 -- Staff notes on the decision
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_ehr_patient_data_patient_id ON ehr_patient_data(patient_id);
CREATE INDEX IF NOT EXISTS idx_ehr_patient_data_data_type ON ehr_patient_data(data_type);
CREATE INDEX IF NOT EXISTS idx_ehr_patient_data_recorded_date ON ehr_patient_data(recorded_date);
CREATE INDEX IF NOT EXISTS idx_ehr_amendment_requests_patient_id ON ehr_amendment_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_ehr_amendment_requests_status ON ehr_amendment_requests(status);


