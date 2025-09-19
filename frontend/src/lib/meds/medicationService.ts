const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api'

export interface PatientMedication {
  id: string
  patientId: string
  medicationName: string
  dosage: string
  frequency: string
  route?: string
  startDate: string
  endDate?: string
  status: 'active' | 'discontinued' | 'completed'
  prescribedBy?: string
  prescribedByName?: string
  reason?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface MedicationRequest {
  patientId: string
  medicationName: string
  dosage: string
  frequency: string
  route?: string
  startDate: string
  endDate?: string
  status?: 'active' | 'discontinued' | 'completed'
  prescribedBy?: string
  reason?: string
  notes?: string
}

class MedicationService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}/ehr${endpoint}`
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getMedications(patientId: string): Promise<PatientMedication[]> {
    try {
      const response = await this.makeRequest(`/medications/${patientId}`)
      return response.medications || []
    } catch (error) {
      console.error('Failed to fetch medications:', error)
      return []
    }
  }

  async addMedication(medication: MedicationRequest): Promise<{ success: boolean; id?: string; message?: string }> {
    try {
      const response = await this.makeRequest('/medications', {
        method: 'POST',
        body: JSON.stringify(medication),
      })
      return response
    } catch (error) {
      console.error('Failed to add medication:', error)
      return { success: false, message: 'Failed to add medication' }
    }
  }

  async updateMedication(medicationId: string, medication: Partial<MedicationRequest>): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.makeRequest(`/medications/${medicationId}`, {
        method: 'PUT',
        body: JSON.stringify(medication),
      })
      return response
    } catch (error) {
      console.error('Failed to update medication:', error)
      return { success: false, message: 'Failed to update medication' }
    }
  }

  async deleteMedication(medicationId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.makeRequest(`/medications/${medicationId}`, {
        method: 'DELETE',
      })
      return response
    } catch (error) {
      console.error('Failed to delete medication:', error)
      return { success: false, message: 'Failed to delete medication' }
    }
  }
}

export const medicationService = new MedicationService()

