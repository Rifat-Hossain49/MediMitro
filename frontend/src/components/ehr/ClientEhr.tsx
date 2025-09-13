'use client'

import { useState, useEffect } from 'react'
import { ehrService, type EHRSummary, type AmendmentRequest, type PatientData } from '@/lib/ehr/ehrService'
import FileUpload from './FileUpload'
import {
  User,
  Heart,
  Pill,
  AlertTriangle,
  FileText,
  Upload,
  Shield,
  Calendar,
  Stethoscope,
  TestTube,
  Camera,
  Syringe,
  MessageSquare,
  Edit3,
  Plus,
  Download,
  Eye,
  Clock,
  Users,
  Activity,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Trash2,
  QrCode
} from 'lucide-react'

interface EHRSection {
  id: string
  title: string
  icon: any
  color: string
  bgColor: string
  count: number
  description: string
}

interface AmendmentRequest {
  id: string
  type: 'correction' | 'annotation'
  field: string
  currentValue: string
  proposedValue: string
  reason: string
  status: 'pending' | 'approved' | 'denied'
  submittedAt: string
}

export default function ClientEhr() {
  const [activeSection, setActiveSection] = useState('overview')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showAmendmentModal, setShowAmendmentModal] = useState(false)
  const [showPGHDModal, setShowPGHDModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [selectedAmendment, setSelectedAmendment] = useState<AmendmentRequest | null>(null)
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [pghd, setPGHD] = useState({
    dataType: '',
    value: '',
    unit: '',
    notes: '',
    source: 'patient'
  })
  
  // Data states
  const [ehrSummary, setEhrSummary] = useState<EHRSummary | null>(null)
  const [amendmentRequests, setAmendmentRequests] = useState<AmendmentRequest[]>([])
  const [sectionData, setSectionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Hardcoded patient ID for demo - in real app, get from auth/session
  const patientId = 'user-4'

  // Load initial data
  useEffect(() => {
    loadEHRData()
  }, [])

  const loadEHRData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load summary and amendment requests
      const [summary, amendments] = await Promise.all([
        ehrService.getEHRSummary(patientId),
        ehrService.getAmendmentRequests(patientId)
      ])
      
      setEhrSummary(summary)
      setAmendmentRequests(amendments)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load EHR data')
    } finally {
      setLoading(false)
    }
  }

  const loadSectionData = async (sectionId: string) => {
    try {
      setLoading(true)
      let data
      
      switch (sectionId) {
        case 'demographics':
          data = await ehrService.getDemographics(patientId)
          break
        case 'medical-history':
          data = await ehrService.getMedicalHistory(patientId)
          break
        case 'medications':
          data = await ehrService.getMedications(patientId)
          break
        case 'allergies':
          data = await ehrService.getAllergies(patientId)
          break
        case 'lab-results':
          data = await ehrService.getLabResults(patientId)
          break
        case 'imaging':
          data = await ehrService.getImaging(patientId)
          break
        case 'visits':
          data = await ehrService.getVisitSummaries(patientId)
          break
        case 'immunizations':
          data = await ehrService.getImmunizations(patientId)
          break
        case 'specialist-reports':
          data = await ehrService.getSpecialistReports(patientId)
          break
        case 'documents':
          data = await ehrService.getDocuments(patientId)
          break
        case 'patient-data':
          data = await ehrService.getPatientData(patientId)
          break
        case 'test-reports':
          // Combine lab results and imaging
          const [labResults, imaging] = await Promise.all([
            ehrService.getLabResults(patientId),
            ehrService.getImaging(patientId)
          ])
          data = [
            ...labResults.map(item => ({ ...item, reportType: 'Lab Result' })),
            ...imaging.map(item => ({ ...item, reportType: 'Imaging' }))
          ].sort((a, b) => new Date(b.test_date || b.study_date).getTime() - new Date(a.test_date || a.study_date).getTime())
          break
        case 'health-summary':
          // Get summary data for overview
          data = await ehrService.getEHRSummary(patientId)
          break
        default:
          data = []
      }
      
      setSectionData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load section data')
    } finally {
      setLoading(false)
    }
  }

  const ehrSections: EHRSection[] = [
    {
      id: 'documents',
      title: 'Documents & Files',
      icon: FileText,
      color: 'blue',
      bgColor: 'bg-blue-50',
      count: ehrSummary?.documents || 0,
      description: 'Medical documents, reports and files'
    },
    {
      id: 'patient-data',
      title: 'Health Data',
      icon: Activity,
      color: 'green',
      bgColor: 'bg-green-50',
      count: ehrSummary?.patientData || 0,
      description: 'Personal health measurements and vitals'
    },
    {
      id: 'test-reports',
      title: 'Test Reports',
      icon: TestTube,
      color: 'purple',
      bgColor: 'bg-purple-50',
      count: (ehrSummary?.labResults || 0) + (ehrSummary?.imaging || 0),
      description: 'Lab results, imaging and diagnostic tests'
    },
    {
      id: 'health-summary',
      title: 'Health Summary',
      icon: Heart,
      color: 'red',
      bgColor: 'bg-red-50',
      count: 1,
      description: 'Comprehensive overview of your health records'
    }
  ]

  // Handle file upload
  const handleFileUpload = async (file: File, title: string, description: string, documentType: string) => {
    try {
      setLoading(true)
      await ehrService.uploadDocument({
        file,
        patientId,
        documentType,
        title,
        description
      })
      
      setShowUploadModal(false)
      // Refresh summary
      loadEHRData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  // Handle PGHD submission
  const handlePGHDSubmit = async (data: Omit<PatientData, 'id'>) => {
    try {
      setLoading(true)
      console.log('=== ClientEhr PGHD Debug ===');
      console.log('Original data:', data);
      
      // Ensure patientId is included
      const pghd = {
        ...data,
        patientId: patientId
      };
      console.log('PGHD with patientId:', pghd);
      
      await ehrService.addPatientData(pghd)
      
      setShowPGHDModal(false)
      // Refresh summary
      loadEHRData()
    } catch (err) {
      console.error('=== ClientEhr PGHD Error ===');
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add patient data')
    } finally {
      setLoading(false)
    }
  }

  // Handle amendment request submission
  const handleAmendmentSubmit = async (request: Omit<AmendmentRequest, 'id' | 'status' | 'submittedAt'>) => {
    try {
      setLoading(true)
      await ehrService.submitAmendmentRequest(request)
      
      setShowAmendmentModal(false)
      // Refresh amendment requests
      const amendments = await ehrService.getAmendmentRequests(patientId)
      setAmendmentRequests(amendments)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit amendment request')
    } finally {
      setLoading(false)
    }
  }

  const renderSectionOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {ehrSections.map((section) => {
        const IconComponent = section.icon
        return (
          <div
            key={section.id}
            className={`group ${section.bgColor} rounded-2xl p-8 border-2 border-${section.color}-200 hover:border-${section.color}-300 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105`}
            onClick={() => {
              setActiveSection(section.id)
              loadSectionData(section.id)
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 bg-${section.color}-100 group-hover:bg-${section.color}-200 rounded-xl transition-colors`}>
                <IconComponent className={`w-8 h-8 text-${section.color}-600`} />
              </div>
              <div className="text-right">
                <span className={`text-3xl font-bold text-${section.color}-600 block`}>
                  {section.count}
                </span>
                <span className="text-sm text-gray-500">records</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h3>
            <p className="text-gray-600 mb-6">{section.description}</p>
            <div className="flex items-center justify-between">
              <div className={`flex items-center text-${section.color}-600 group-hover:text-${section.color}-700 font-medium`}>
                <span>View details</span>
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  const renderQuickActions = () => (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl shadow-lg border p-8 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h2>
        <p className="text-gray-600">Manage your health records easily</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Upload Documents */}
        <button
          onClick={() => setShowUploadModal(true)}
          className="group flex items-center p-6 bg-white hover:bg-blue-50 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <div className="p-3 bg-blue-100 group-hover:bg-blue-200 rounded-lg mr-4 transition-colors">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-900">Upload Documents</h3>
            <p className="text-sm text-gray-600">Add medical files, reports & records</p>
          </div>
        </button>

        {/* Add Health Data */}
        <button
          onClick={() => setShowPGHDModal(true)}
          className="group flex items-center p-6 bg-white hover:bg-green-50 rounded-xl border-2 border-green-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <div className="p-3 bg-green-100 group-hover:bg-green-200 rounded-lg mr-4 transition-colors">
            <Activity className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 group-hover:text-green-900">Add Health Data</h3>
            <p className="text-sm text-gray-600">Record vitals, symptoms & measurements</p>
          </div>
        </button>
      </div>
    </div>
  )

  const renderAmendmentRequests = () => (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Amendment Requests</h3>
      <div className="space-y-4">
        {amendmentRequests.map((request) => (
          <div key={request.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{request.field}</h4>
                <p className="text-sm text-gray-600">Type: {request.type}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {request.status}
              </span>
            </div>
            <div className="text-sm space-y-2">
              <div>
                <span className="font-medium">Current:</span> {request.currentValue}
              </div>
              <div>
                <span className="font-medium">Proposed:</span> {request.proposedValue}
              </div>
              <div>
                <span className="font-medium">Reason:</span> {request.reason}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSectionDetails = (sectionId: string) => {
    const section = ehrSections.find(s => s.id === sectionId)
    if (!section) return null

    const IconComponent = section.icon

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveSection('overview')}
              className="text-blue-600 hover:text-blue-700"
            >
              ← Back to Overview
            </button>
            <div className={`p-3 ${section.bgColor} rounded-lg`}>
              <IconComponent className={`w-6 h-6 text-${section.color}-600`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              <p className="text-gray-600">{section.description}</p>
            </div>
          </div>
        </div>

        {/* Real data content */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => loadSectionData(sectionId)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {sectionData && Array.isArray(sectionData) && sectionData.length > 0 ? (
                sectionData.map((item: any, index: number) => (
                  <div key={item.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {renderRecordContent(item, sectionId)}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {/* Only show preview button for documents that have files */}
                        {sectionId === 'documents' && (
                          <button 
                            onClick={() => {
                              setSelectedFile(item)
                              setShowPreviewModal(true)
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600"
                            title="Preview file"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Only show download button for documents with files */}
                        {sectionId === 'documents' && (item.file_url || item.appwrite_file_id) && (
                          <button 
                            onClick={() => {
                              const downloadUrl = item.appwrite_file_id 
                                ? `https://sfo.cloud.appwrite.io/v1/storage/buckets/medimitra-files/files/${item.appwrite_file_id}/download?project=68c307fe002f136b2920`
                                : item.file_url;
                              window.open(downloadUrl, '_blank');
                            }}
                            className="p-2 text-gray-400 hover:text-green-600"
                            title="Download file"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Show amendment button for all record types */}
                        <button 
                          onClick={() => {
                            setSelectedAmendment({
                              id: item.id || index.toString(),
                              recordType: sectionId,
                              recordId: item.id || index.toString(),
                              amendmentType: 'correction',
                              fieldName: '',
                              currentValue: '',
                              proposedValue: '',
                              reason: '',
                              status: 'pending',
                              submittedAt: new Date().toISOString()
                            });
                            setShowAmendmentModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-yellow-600"
                          title="Request amendment"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-${section.color}-100 flex items-center justify-center`}>
                    <section.icon className={`w-6 h-6 text-${section.color}-600`} />
                  </div>
                  <p>No {section.title.toLowerCase()} records found</p>
                  <p className="text-sm mt-1">Records will appear here once added by healthcare providers</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderRecordContent = (item: any, sectionId: string) => {
    switch (sectionId) {
      case 'demographics':
        return (
          <div>
            <h4 className="font-medium text-gray-900">{item.name || 'Patient Information'}</h4>
            <div className="text-sm text-gray-600 mt-1 space-y-1">
              <p>Email: {item.email}</p>
              <p>Phone: {item.phone_number}</p>
              <p>Date of Birth: {item.date_of_birth ? new Date(item.date_of_birth).toLocaleDateString() : 'Not provided'}</p>
              <p>Blood Type: {item.blood_type || 'Not provided'}</p>
              {item.insurance_provider && <p>Insurance: {item.insurance_provider}</p>}
            </div>
          </div>
        )
      
      case 'allergies':
        return (
          <div>
            <h4 className="font-medium text-gray-900">{item.allergen}</h4>
            <div className="text-sm text-gray-600 mt-1">
              <p>Type: {item.allergen_type} • Severity: <span className={`font-medium ${item.severity === 'severe' ? 'text-red-600' : item.severity === 'moderate' ? 'text-orange-600' : 'text-yellow-600'}`}>{item.severity}</span></p>
              <p>Reaction: {item.reaction}</p>
              {item.date_identified && <p>Identified: {new Date(item.date_identified).toLocaleDateString()}</p>}
              {item.doctor_name && <p>Verified by: {item.doctor_name}</p>}
            </div>
          </div>
        )
      
      case 'medications':
        return (
          <div>
            <h4 className="font-medium text-gray-900">{item.medication_name}</h4>
            <div className="text-sm text-gray-600 mt-1">
              <p>Dosage: {item.dosage} • Frequency: {item.frequency}</p>
              <p>Route: {item.route} • Status: <span className={`font-medium ${item.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>{item.status}</span></p>
              {item.start_date && <p>Started: {new Date(item.start_date).toLocaleDateString()}</p>}
              {item.prescribed_by_name && <p>Prescribed by: {item.prescribed_by_name}</p>}
              {item.reason && <p>Reason: {item.reason}</p>}
            </div>
          </div>
        )
      
      case 'lab-results':
        return (
          <div>
            <h4 className="font-medium text-gray-900">{item.test_name}</h4>
            <div className="text-sm text-gray-600 mt-1">
              <p>Result: <span className={`font-medium ${item.abnormal_flag === 'high' || item.abnormal_flag === 'low' ? 'text-orange-600' : item.abnormal_flag === 'critical' ? 'text-red-600' : 'text-green-600'}`}>{item.result_value} {item.unit}</span></p>
              <p>Reference Range: {item.reference_range}</p>
              <p>Date: {new Date(item.test_date).toLocaleDateString()}</p>
              {item.lab_name && <p>Lab: {item.lab_name}</p>}
              {item.ordered_by_name && <p>Ordered by: {item.ordered_by_name}</p>}
            </div>
          </div>
        )
      
      case 'imaging':
        return (
          <div>
            <h4 className="font-medium text-gray-900">{item.study_type} - {item.body_part}</h4>
            <div className="text-sm text-gray-600 mt-1">
              <p>Date: {new Date(item.study_date).toLocaleDateString()}</p>
              {item.impression && <p>Impression: {item.impression}</p>}
              {item.radiologist_name && <p>Radiologist: {item.radiologist_name}</p>}
              {item.facility_name && <p>Facility: {item.facility_name}</p>}
              {item.study_id && <p>Study ID: {item.study_id}</p>}
            </div>
          </div>
        )
      
      case 'visits':
        return (
          <div>
            <h4 className="font-medium text-gray-900">{item.visit_type} Visit</h4>
            <div className="text-sm text-gray-600 mt-1">
              <p>Date: {new Date(item.visit_date).toLocaleDateString()}</p>
              {item.chief_complaint && <p>Chief Complaint: {item.chief_complaint}</p>}
              {item.assessment && <p>Assessment: {item.assessment}</p>}
              {item.doctor_name && <p>Provider: {item.doctor_name}</p>}
              {item.facility_name && <p>Facility: {item.facility_name}</p>}
            </div>
          </div>
        )
      
      case 'immunizations':
        return (
          <div>
            <h4 className="font-medium text-gray-900">{item.vaccine_name}</h4>
            <div className="text-sm text-gray-600 mt-1">
              <p>Date: {new Date(item.date_administered).toLocaleDateString()}</p>
              {item.dose_number && <p>Dose: {item.dose_number}</p>}
              <p>Site: {item.site} • Route: {item.route}</p>
              {item.manufacturer && <p>Manufacturer: {item.manufacturer}</p>}
              {item.administered_by && <p>Administered by: {item.administered_by}</p>}
              {item.facility_name && <p>Facility: {item.facility_name}</p>}
            </div>
          </div>
        )
      
      case 'specialist-reports':
        return (
          <div>
            <h4 className="font-medium text-gray-900">{item.specialty} Consultation</h4>
            <div className="text-sm text-gray-600 mt-1">
              <p>Date: {new Date(item.report_date).toLocaleDateString()}</p>
              {item.specialist_name && <p>Specialist: {item.specialist_name}</p>}
              {item.referral_reason && <p>Reason: {item.referral_reason}</p>}
              {item.consultation_summary && <p>Summary: {item.consultation_summary.substring(0, 150)}...</p>}
              {item.follow_up_required && <p className="text-orange-600 font-medium">Follow-up required</p>}
            </div>
          </div>
        )
      
      case 'medical-history':
        return (
          <div>
            <h4 className="font-medium text-gray-900">{item.condition_name}</h4>
            <div className="text-sm text-gray-600 mt-1">
              {item.condition_code && <p>Code: {item.condition_code}</p>}
              {item.date_diagnosed && <p>Diagnosed: {new Date(item.date_diagnosed).toLocaleDateString()}</p>}
              <p>Status: <span className={`font-medium ${item.status === 'active' ? 'text-red-600' : item.status === 'resolved' ? 'text-green-600' : 'text-orange-600'}`}>{item.status}</span></p>
              {item.severity && <p>Severity: {item.severity}</p>}
              {item.doctor_name && <p>Provider: {item.doctor_name}</p>}
              {item.notes && <p>Notes: {item.notes.substring(0, 100)}...</p>}
            </div>
          </div>
        )
      
      case 'documents':
        return (
          <div>
            <h4 className="font-medium text-gray-900">{item.title}</h4>
            <div className="text-sm text-gray-600 mt-1">
              <p>Type: <span className="font-medium">{item.document_type}</span></p>
              <p>Size: {(item.file_size / 1024).toFixed(1)} KB • Format: {item.mime_type}</p>
              {item.description && <p>Description: {item.description}</p>}
              <p>Uploaded: {new Date(item.upload_date).toLocaleDateString()}</p>
              {item.uploaded_by_name && <p>By: {item.uploaded_by_name}</p>}
            </div>
          </div>
        )
      
      case 'patient-data':
        return (
          <div>
            <h4 className="font-medium text-gray-900">{item.data_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
            <div className="text-sm text-gray-600 mt-1">
              <p>Value: <span className="font-medium text-blue-600">{item.value} {item.unit && item.unit}</span></p>
              <p>Recorded: {new Date(item.recorded_date).toLocaleDateString()} at {new Date(item.recorded_date).toLocaleTimeString()}</p>
              <p>Source: <span className="capitalize">{item.source}</span></p>
              {item.notes && <p>Notes: {item.notes}</p>}
              {item.device_info && <p>Device: {item.device_info}</p>}
            </div>
          </div>
        )
      
      case 'test-reports':
        return (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.reportType === 'Lab Result' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {item.reportType}
              </span>
              <h4 className="font-medium text-gray-900">{item.test_name || `${item.study_type} - ${item.body_part}`}</h4>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {item.reportType === 'Lab Result' ? (
                <>
                  <p>Result: <span className={`font-medium ${item.abnormal_flag === 'high' || item.abnormal_flag === 'low' ? 'text-orange-600' : item.abnormal_flag === 'critical' ? 'text-red-600' : 'text-green-600'}`}>{item.result_value} {item.unit}</span></p>
                  <p>Reference Range: {item.reference_range}</p>
                  <p>Date: {new Date(item.test_date).toLocaleDateString()}</p>
                  {item.lab_name && <p>Lab: {item.lab_name}</p>}
                  {item.ordered_by_name && <p>Ordered by: {item.ordered_by_name}</p>}
                </>
              ) : (
                <>
                  <p>Date: {new Date(item.study_date).toLocaleDateString()}</p>
                  {item.impression && <p>Impression: {item.impression}</p>}
                  {item.radiologist_name && <p>Radiologist: {item.radiologist_name}</p>}
                  {item.facility_name && <p>Facility: {item.facility_name}</p>}
                  {item.study_id && <p>Study ID: {item.study_id}</p>}
                </>
              )}
            </div>
          </div>
        )
      
      case 'health-summary':
        return (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Health Record Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Records:</span>
                  <span className="font-medium">{Object.values(sectionData || {}).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Documents:</span>
                  <span className="font-medium text-blue-600">{sectionData?.documents || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Health Data:</span>
                  <span className="font-medium text-green-600">{sectionData?.patientData || 0}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Lab Results:</span>
                  <span className="font-medium text-purple-600">{sectionData?.labResults || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Imaging:</span>
                  <span className="font-medium text-indigo-600">{sectionData?.imaging || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span className="font-medium text-gray-600">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div>
            <h4 className="font-medium text-gray-900">{item.title || item.name || 'Record'}</h4>
            <p className="text-sm text-gray-600 mt-1">{item.description || 'Medical record'}</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <div className="flex items-center justify-center mb-4">
              <Heart className="w-12 h-12 mr-4 text-white" />
              <h1 className="text-4xl font-bold">My Health Records</h1>
            </div>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Your personal health dashboard - securely manage your medical records, track health data, and access test reports
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* Quick Actions */}
          {renderQuickActions()}

          {/* Main Content */}
          {activeSection === 'overview' ? renderSectionOverview() : renderSectionDetails(activeSection)}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <FileUpload
          patientId={patientId}
          onUploadSuccess={loadEHRData}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      {/* Amendment Request Modal */}
      {showAmendmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Request Amendment</h3>
              <button onClick={() => setShowAmendmentModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form 
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (selectedAmendment) {
                  await handleAmendmentSubmit(selectedAmendment);
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  value={selectedAmendment?.amendmentType || 'correction'}
                  onChange={(e) => selectedAmendment && setSelectedAmendment({
                    ...selectedAmendment,
                    amendmentType: e.target.value as 'correction' | 'annotation'
                  })}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="correction">Correction Request</option>
                  <option value="annotation">Add Annotation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field/Record</label>
                <input 
                  type="text" 
                  value={selectedAmendment?.fieldName || ''}
                  onChange={(e) => selectedAmendment && setSelectedAmendment({
                    ...selectedAmendment,
                    fieldName: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-lg p-2" 
                  placeholder="e.g., Allergy - Penicillin severity" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
                <textarea 
                  value={selectedAmendment?.currentValue || ''}
                  onChange={(e) => selectedAmendment && setSelectedAmendment({
                    ...selectedAmendment,
                    currentValue: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-lg p-2" 
                  rows={2} 
                  placeholder="Current information in your record"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Change</label>
                <textarea 
                  value={selectedAmendment?.proposedValue || ''}
                  onChange={(e) => selectedAmendment && setSelectedAmendment({
                    ...selectedAmendment,
                    proposedValue: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-lg p-2" 
                  rows={2} 
                  placeholder="Your proposed correction"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea 
                  value={selectedAmendment?.reason || ''}
                  onChange={(e) => selectedAmendment && setSelectedAmendment({
                    ...selectedAmendment,
                    reason: e.target.value
                  })}
                  className="w-full border border-gray-300 rounded-lg p-2" 
                  rows={3} 
                  placeholder="Explain why this change is needed"
                  required
                ></textarea>
              </div>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => {
                    setShowAmendmentModal(false);
                    setSelectedAmendment(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PGHD Modal */}
      {showPGHDModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Patient Health Data</h3>
              <button onClick={() => setShowPGHDModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form 
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                console.log('=== Form PGHD Debug ===');
                console.log('Form PGHD data:', pghd);
                
                const pghDataToSubmit = {
                  patientId: patientId,
                  dataType: pghd.dataType,
                  value: pghd.value,
                  unit: pghd.unit || '',
                  notes: pghd.notes || '',
                  source: pghd.source
                };
                console.log('Final PGHD to submit:', pghDataToSubmit);
                
                await handlePGHDSubmit(pghDataToSubmit);
                setPGHD({ dataType: '', value: '', unit: '', notes: '', source: 'patient' });
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
                <select 
                  value={pghd.dataType}
                  onChange={(e) => setPGHD({...pghd, dataType: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                >
                  <option value="">Select data type</option>
                  <option value="blood_pressure">Blood Pressure</option>
                  <option value="blood_glucose">Blood Glucose</option>
                  <option value="weight">Weight</option>
                  <option value="symptoms">Symptoms</option>
                  <option value="exercise">Exercise</option>
                  <option value="sleep">Sleep</option>
                  <option value="temperature">Temperature</option>
                  <option value="heart_rate">Heart Rate</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value/Description</label>
                <input 
                  type="text" 
                  value={pghd.value}
                  onChange={(e) => setPGHD({...pghd, value: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2" 
                  placeholder="e.g., 120/80, 150 lbs, feeling dizzy" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit (Optional)</label>
                <input 
                  type="text" 
                  value={pghd.unit}
                  onChange={(e) => setPGHD({...pghd, unit: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2" 
                  placeholder="e.g., mmHg, lbs, mg/dL" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea 
                  value={pghd.notes}
                  onChange={(e) => setPGHD({...pghd, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2" 
                  rows={3} 
                  placeholder="Additional context, symptoms, or notes"
                ></textarea>
              </div>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => {
                    setShowPGHDModal(false);
                    setPGHD({ dataType: '', value: '', unit: '', notes: '', source: 'patient' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showPreviewModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedFile.title}</h3>
                <p className="text-sm text-gray-600">{selectedFile.document_type} • {selectedFile.file_name}</p>
              </div>
              <button 
                onClick={() => {
                  setShowPreviewModal(false)
                  setSelectedFile(null)
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-auto">
              {selectedFile.file_url ? (
                <div className="space-y-4">
                  {/* File Preview Based on Type */}
                  {selectedFile.mime_type?.startsWith('image/') ? (
                    <img 
                      src={selectedFile.appwrite_file_id 
                        ? `https://sfo.cloud.appwrite.io/v1/storage/buckets/medimitra-files/files/${selectedFile.appwrite_file_id}/view?project=68c307fe002f136b2920`
                        : selectedFile.file_url
                      } 
                      alt={selectedFile.title}
                      className="max-w-full h-auto rounded-lg shadow-lg"
                    />
                  ) : selectedFile.mime_type === 'application/pdf' ? (
                    <iframe
                      src={selectedFile.appwrite_file_id 
                        ? `https://sfo.cloud.appwrite.io/v1/storage/buckets/medimitra-files/files/${selectedFile.appwrite_file_id}/view?project=68c307fe002f136b2920`
                        : selectedFile.file_url
                      }
                      className="w-full h-96 rounded-lg border"
                      title={selectedFile.title}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                      <button
                        onClick={() => {
                          const downloadUrl = selectedFile.appwrite_file_id 
                            ? `https://sfo.cloud.appwrite.io/v1/storage/buckets/medimitra-files/files/${selectedFile.appwrite_file_id}/download?project=68c307fe002f136b2920`
                            : selectedFile.file_url;
                          window.open(downloadUrl, '_blank');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Download File
                      </button>
                    </div>
                  )}
                  
                  {/* File Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">File Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Size:</span>
                        <span className="ml-2 font-medium">{(selectedFile.file_size / 1024).toFixed(1)} KB</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-2 font-medium">{selectedFile.mime_type}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Uploaded:</span>
                        <span className="ml-2 font-medium">{new Date(selectedFile.upload_date).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Category:</span>
                        <span className="ml-2 font-medium">{selectedFile.document_type}</span>
                      </div>
                    </div>
                    {selectedFile.description && (
                      <div className="mt-3">
                        <span className="text-gray-600">Description:</span>
                        <p className="mt-1 text-gray-900">{selectedFile.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <p className="text-gray-600">File URL not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}