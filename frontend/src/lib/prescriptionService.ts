import { uploadFile } from './appwrite'

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-backend-domain.com/api'
  : 'http://localhost:8080/api'

export interface PrescriptionUpload {
  file: File
  patientId: string
  title: string
  description?: string
}

export interface PrescriptionDocument {
  id: string
  patientId: string
  documentType: string
  title: string
  description?: string
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  appwriteFileId: string
  uploadedBy: string
  uploadDate: string
  reconciled: boolean
}

class PrescriptionService {
  /**
   * Upload prescription file to Appwrite cloud storage and save metadata to database
   */
  async uploadPrescription(upload: PrescriptionUpload): Promise<PrescriptionDocument> {
    try {
      console.log('=== Prescription Upload Start ===')
      console.log('File:', upload.file.name, upload.file.size, 'bytes')
      console.log('Patient ID:', upload.patientId)
      console.log('Title:', upload.title)

      // Step 1: Upload file to Appwrite cloud storage
      console.log('Step 1: Uploading to Appwrite...')
      const uploadResult = await uploadFile(upload.file, (progress) => {
        console.log(`Upload progress: ${progress}%`)
      })

      console.log('Appwrite upload successful:', uploadResult)

      // Step 2: Save document metadata to database via backend API
      console.log('Step 2: Saving metadata to database...')
      const formData = new FormData()
      formData.append('file', upload.file)
      formData.append('patientId', upload.patientId)
      formData.append('documentType', 'patient_upload') // Use patient_upload as base type
      formData.append('title', upload.title) // Title should contain "prescription" for filtering
      if (upload.description) {
        formData.append('description', upload.description)
      }

      const response = await fetch(`${API_BASE_URL}/ehr/documents/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Database save successful:', result)

      // Step 3: Create and return prescription document object
      const prescriptionDocument: PrescriptionDocument = {
        id: result.documentId,
        patientId: upload.patientId,
        documentType: 'patient_upload',
        title: upload.title,
        description: upload.description,
        fileUrl: uploadResult.fileUrl,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        mimeType: uploadResult.mimeType,
        appwriteFileId: uploadResult.fileId,
        uploadedBy: upload.patientId,
        uploadDate: new Date().toISOString(),
        reconciled: false
      }

      console.log('=== Prescription Upload Complete ===')
      return prescriptionDocument

    } catch (error) {
      console.error('=== Prescription Upload Error ===')
      console.error('Error details:', error)

      // Provide specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Authorization failed')) {
          throw new Error('File upload authorization failed. Please check Appwrite permissions.')
        } else if (error.message.includes('Bucket not found')) {
          throw new Error('Storage bucket not found. Please contact support.')
        } else if (error.message.includes('File size')) {
          throw new Error('File size too large. Please use files smaller than 10MB.')
        } else if (error.message.includes('not authorized')) {
          throw new Error('Not authorized to upload files. Please log in again.')
        }
        throw error
      }

      throw new Error('Prescription upload failed. Please try again.')
    }
  }

  /**
   * Get prescription documents for a patient
   */
  async getPrescriptionDocuments(patientId: string): Promise<PrescriptionDocument[]> {
    try {
      console.log('Getting prescription documents for patient:', patientId)

      const response = await fetch(`${API_BASE_URL}/ehr/documents/${patientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch documents' }))
        throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const documents = await response.json()

      // Filter only prescription documents - look for documents with "prescription" in title
      // This ensures we only show actual prescriptions, not all patient uploads
      const prescriptions = documents.filter((doc: any) => {
        const title = (doc.title || '').toLowerCase()
        const description = (doc.description || '').toLowerCase()

        // Only include documents that explicitly mention prescription
        return title.includes('prescription') || description.includes('prescription')
      })

      // Map to our interface
      return prescriptions.map((doc: any) => ({
        id: doc.id,
        patientId: doc.patient_id || doc.patientId,
        documentType: doc.document_type || doc.documentType,
        title: doc.title,
        description: doc.description,
        fileUrl: doc.file_url || doc.fileUrl,
        fileName: doc.file_name || doc.fileName,
        fileSize: doc.file_size || doc.fileSize,
        mimeType: doc.mime_type || doc.mimeType,
        appwriteFileId: doc.appwrite_file_id || doc.appwriteFileId,
        uploadedBy: doc.uploaded_by || doc.uploadedBy,
        uploadDate: doc.upload_date || doc.uploadDate,
        reconciled: doc.reconciled || false
      }))

    } catch (error) {
      console.error('Error fetching prescription documents:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to fetch prescription documents')
    }
  }

  /**
   * Delete a prescription document
   */
  async deletePrescriptionDocument(documentId: string, appwriteFileId: string): Promise<void> {
    try {
      // Delete from database first
      const response = await fetch(`${API_BASE_URL}/ehr/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to delete document' }))
        throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      // Delete from Appwrite storage
      const { deleteFile } = await import('./appwrite')
      await deleteFile(appwriteFileId)

    } catch (error) {
      console.error('Error deleting prescription document:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to delete prescription document')
    }
  }
}

export const prescriptionService = new PrescriptionService()
export default prescriptionService
