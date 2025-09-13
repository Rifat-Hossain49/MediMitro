-- Manual creation of ehr_patient_data table
CREATE TABLE IF NOT EXISTS ehr_patient_data (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    data_type VARCHAR(50) NOT NULL CHECK (data_type IN ('blood_pressure', 'blood_glucose', 'weight', 'heart_rate', 'temperature', 'symptoms', 'exercise', 'sleep', 'medication_adherence', 'mood', 'pain_level', 'other')),
    value VARCHAR(255) NOT NULL,
    unit VARCHAR(50),
    recorded_date TIMESTAMP NOT NULL,
    notes TEXT,
    source VARCHAR(50) DEFAULT 'patient' CHECK (source IN ('patient', 'device', 'app')),
    device_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ehr_patient_data_patient_id ON ehr_patient_data(patient_id);
CREATE INDEX IF NOT EXISTS idx_ehr_patient_data_data_type ON ehr_patient_data(data_type);
CREATE INDEX IF NOT EXISTS idx_ehr_patient_data_recorded_date ON ehr_patient_data(recorded_date);


