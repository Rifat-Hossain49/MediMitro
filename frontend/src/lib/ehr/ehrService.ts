const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com/api' 
  : 'http://localhost:8080/api';

export interface EHRSummary {
  demographics: number;
  medicalHistory: number;
  medications: number;
  allergies: number;
  labResults: number;
  imaging: number;
  visitSummaries: number;
  immunizations: number;
  specialistReports: number;
  documents: number;
  patientData: number;
  amendmentRequests: number;
}

export interface PatientData {
  id: string;
  patientId: string;
  dataType: string;
  value: string;
  unit?: string;
  recordedDate: string;
  notes?: string;
  source: 'patient' | 'device' | 'app';
  deviceInfo?: string;
}

export interface AmendmentRequest {
  id: string;
  patientId: string;
  recordType: string;
  recordId: string;
  amendmentType: 'correction' | 'annotation';
  fieldName: string;
  currentValue?: string;
  proposedValue?: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  submittedAt: string;
  reviewedBy?: string;
  reviewDate?: string;
  reviewNotes?: string;
}

export interface DocumentUpload {
  file: File;
  patientId: string;
  documentType: string;
  title: string;
  description?: string;
}

class EHRService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/ehr${endpoint}`;
    console.log('=== EHR API REQUEST DEBUG ===');
    console.log('Method:', options.method || 'GET');
    console.log('Full URL:', url);
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Endpoint:', endpoint);
    console.log('================================');
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      console.error('=== EHR API ERROR ===');
      console.error('Status:', response.status, response.statusText);
      console.error('URL that failed:', url);
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      console.error('Error details:', error);
      console.error('===================');
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('=== EHR API SUCCESS ===');
    console.log('URL:', url);
    console.log('Response:', result);
    console.log('=====================');
    return result;
  }

  // ==================== SUMMARY ====================
  
  async getEHRSummary(patientId: string): Promise<EHRSummary> {
    return this.makeRequest(`/summary/${patientId}`);
  }

  // ==================== DEMOGRAPHICS ====================
  
  async getDemographics(patientId: string) {
    return this.makeRequest(`/demographics/${patientId}`);
  }

  async updateDemographics(patientId: string, demographics: any) {
    return this.makeRequest('/demographics', {
      method: 'POST',
      body: JSON.stringify({ ...demographics, patientId }),
    });
  }

  // ==================== PATIENT DATA (PGHD) ====================
  
  async getPatientData(patientId: string, dataType?: string, days: number = 30): Promise<PatientData[]> {
    const params = new URLSearchParams({ days: days.toString() });
    if (dataType) params.set('dataType', dataType);
    
    console.log('Getting patient data for:', patientId);
    console.log('Request URL:', `/patient-data/${patientId}?${params}`);
    
    return this.makeRequest(`/patient-data/${patientId}?${params}`);
  }

  async addPatientData(data: Omit<PatientData, 'id'>): Promise<void> {
    return this.makeRequest('/patient-data', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== AMENDMENT REQUESTS ====================
  
  async getAmendmentRequests(patientId: string): Promise<AmendmentRequest[]> {
    return this.makeRequest(`/amendment-requests/${patientId}`);
  }

  async submitAmendmentRequest(request: Omit<AmendmentRequest, 'id' | 'status' | 'submittedAt'>): Promise<void> {
    return this.makeRequest('/amendment-requests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // ==================== DOCUMENTS ====================
  
  async uploadDocument(upload: DocumentUpload): Promise<any> {
    const formData = new FormData();
    formData.append('file', upload.file);
    formData.append('patientId', upload.patientId);
    formData.append('documentType', upload.documentType);
    formData.append('title', upload.title);
    if (upload.description) {
      formData.append('description', upload.description);
    }

    const response = await fetch(`${API_BASE_URL}/ehr/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getDocuments(patientId: string) {
    return this.makeRequest(`/documents/${patientId}`);
  }

  // ==================== EHR SECTIONS ====================
  
  async getAllergies(patientId: string) {
    return this.makeRequest(`/allergies/${patientId}`);
  }

  async getMedications(patientId: string) {
    return this.makeRequest(`/medications/${patientId}`);
  }

  async getLabResults(patientId: string) {
    return this.makeRequest(`/lab-results/${patientId}`);
  }

  async getImaging(patientId: string) {
    return this.makeRequest(`/imaging/${patientId}`);
  }

  async getVisitSummaries(patientId: string) {
    return this.makeRequest(`/visit-summaries/${patientId}`);
  }

  async getImmunizations(patientId: string) {
    return this.makeRequest(`/immunizations/${patientId}`);
  }

  async getSpecialistReports(patientId: string) {
    return this.makeRequest(`/specialist-reports/${patientId}`);
  }

  async getMedicalHistory(patientId: string) {
    return this.makeRequest(`/medical-history/${patientId}`);
  }

  // ==================== STORAGE STATUS ====================
  
  async getStorageStatus() {
    return this.makeRequest('/storage/status');
  }

  // ==================== DOCUMENT MANAGEMENT ====================
  
  async saveDocumentMetadata(documentData: {
    patientId: string;
    documentType: string;
    title: string;
    description: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    appwriteFileId: string;
  }) {
    return this.makeRequest('/documents/save', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  }

  async getDocuments(patientId: string) {
    return this.makeRequest(`/documents/${patientId}`);
  }

  // ==================== AMENDMENT REQUESTS ====================
  
  async submitAmendmentRequest(amendmentData: {
    patientId: string;
    recordType: string;
    recordId: string;
    amendmentType: 'correction' | 'annotation';
    fieldName: string;
    currentValue: string;
    proposedValue: string;
    reason: string;
  }) {
    return this.makeRequest('/amendment-requests', {
      method: 'POST',
      body: JSON.stringify(amendmentData),
    });
  }

  // ==================== PATIENT GENERATED HEALTH DATA ====================
  
  async addPatientData(pghd: {
    patientId: string;
    dataType: string;
    value: string;
    unit?: string;
    notes?: string;
    source: string;
  }) {
    console.log('=== Frontend PGHD Debug ===');
    console.log('Sending PGHD data:', pghd);
    
    try {
      const result = await this.makeRequest('/patient-data', {
        method: 'POST',
        body: JSON.stringify(pghd),
      });
      console.log('PGHD success:', result);
      return result;
    } catch (error) {
      console.error('=== Frontend PGHD Error ===');
      console.error('Error details:', error);
      console.error('PGHD data that failed:', pghd);
      throw error;
    }
  }
}

export const ehrService = new EHRService();
export default ehrService;
