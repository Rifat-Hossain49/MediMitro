'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { prescriptionService, type PrescriptionDocument } from '@/lib/prescriptionService'
import { 
  Upload, 
  FileText, 
  Camera, 
  Clock, 
  Calendar, 
  Bell, 
  Pill, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Plus, 
  Eye, 
  Download, 
  Edit3,
  Activity,
  Heart,
  FileCheck,
  CloudUpload,
  Zap,
  Target
} from 'lucide-react'

type PrescriptionStatus = 'processing' | 'completed' | 'error'
type MedicationType = 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'drops'

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  type: MedicationType
  instructions: string
  sideEffects?: string[]
  nextDose?: string
  completionPercentage: number
  isActive: boolean
  prescribedBy: string
  prescribedDate: string
}

interface Prescription {
  id: string
  fileName: string
  uploadDate: string
  status: PrescriptionStatus
  extractedText?: string
  medications: Medication[]
  doctorName: string
  diagnosis: string
  followUpDate?: string
  diagnosticTests?: string[]
  notes?: string
}


export default function PrescriptionsPage() {
  const [activeTab, setActiveTab] = useState('upload') // upload, history
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [realPrescriptions, setRealPrescriptions] = useState<PrescriptionDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Hardcoded patient ID for demo - in real app, get from auth/session
  const patientId = 'user-4'

  // Load real prescription documents on mount
  useEffect(() => {
    loadPrescriptionDocuments()
  }, [])

  // Handle camera stream setup
  useEffect(() => {
    if (cameraStream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = cameraStream
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch(console.error)
      }
    }
  }, [cameraStream])

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])
  
  const loadPrescriptionDocuments = async () => {
    try {
      setLoading(true)
      setError(null)
      const documents = await prescriptionService.getPrescriptionDocuments(patientId)
      setRealPrescriptions(documents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prescriptions')
    } finally {
      setLoading(false)
    }
  }

  // Mock data for display compatibility
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    {
      id: '1',
      fileName: 'prescription_jan_2024.pdf',
      uploadDate: '2024-01-15',
      status: 'completed',
      doctorName: 'Dr. Sarah Johnson',
      diagnosis: 'Hypertension, Type 2 Diabetes',
      followUpDate: '2024-02-15',
      diagnosticTests: ['HbA1c Test', 'Blood Pressure Monitoring'],
      medications: [
        {
          id: 'm1',
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '3 months',
          type: 'tablet',
          instructions: 'Take with meals',
          sideEffects: ['Nausea', 'Stomach upset'],
          nextDose: '2:00 PM',
          completionPercentage: 65,
          isActive: true,
          prescribedBy: 'Dr. Sarah Johnson',
          prescribedDate: '2024-01-15'
        },
        {
          id: 'm2',
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '6 months',
          type: 'tablet',
          instructions: 'Take in the morning',
          nextDose: '8:00 AM',
          completionPercentage: 70,
          isActive: true,
          prescribedBy: 'Dr. Sarah Johnson',
          prescribedDate: '2024-01-15'
        }
      ],
      notes: 'Monitor blood sugar levels daily. Follow up in 4 weeks.'
    },
    {
      id: '2',
      fileName: 'eye_checkup_prescription.jpg',
      uploadDate: '2024-01-10',
      status: 'completed',
      doctorName: 'Dr. Michael Chen',
      diagnosis: 'Dry Eyes, Computer Vision Syndrome',
      medications: [
        {
          id: 'm3',
          name: 'Artificial Tears',
          dosage: '2 drops',
          frequency: '4 times daily',
          duration: '1 month',
          type: 'drops',
          instructions: 'Apply to both eyes',
          nextDose: '11:00 AM',
          completionPercentage: 80,
          isActive: true,
          prescribedBy: 'Dr. Michael Chen',
          prescribedDate: '2024-01-10'
        }
      ]
    }
  ])


  const handleFileUpload = async (file: File, title?: string, description?: string) => {
    try {
      setUploadedFile(file)
      setIsProcessing(true)
      setError(null)
      setUploadProgress(0)
      
      // Upload to Appwrite and save to database
      const document = await prescriptionService.uploadPrescription({
        file,
        patientId,
        title: title || `Prescription - ${file.name.replace(/\.[^/.]+$/, '')}`,
        description: description || 'Prescription document uploaded by patient'
      })
      
      // Add to real prescriptions list
      setRealPrescriptions(prev => [document, ...prev])
      
      // Create a prescription object for UI compatibility
      const newPrescription: Prescription = {
        id: document.id,
        fileName: document.fileName,
        uploadDate: document.uploadDate.split('T')[0],
        status: 'completed',
        doctorName: 'Dr. Pending Review',
        diagnosis: 'Under Review',
        medications: [],
        notes: 'Prescription uploaded successfully. File stored in cloud storage and awaiting manual review for medication extraction.',
        extractedText: `File: ${document.fileName} (${(document.fileSize / 1024).toFixed(1)} KB)`
      }
      
      setPrescriptions(prev => [newPrescription, ...prev])
      setIsProcessing(false)
      setShowUploadModal(false)
      setActiveTab('history')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setIsProcessing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setError(null)
    const files = Array.from(e.dataTransfer.files)
    if (files[0]) {
      handleFileUpload(files[0])
    }
  }

  // Camera functionality
  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Use back camera on mobile
        } 
      })
      setCameraStream(stream)
      
      // Wait for video element to be available and set stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Ensure video plays
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.error)
        }
      }
    } catch (err) {
      console.error('Camera error:', err)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permissions and try again.')
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please ensure your device has a camera.')
        } else if (err.name === 'NotReadableError') {
          setError('Camera is being used by another application. Please close other apps and try again.')
        } else {
          setError(`Camera error: ${err.message}`)
        }
      } else {
        setError('Failed to access camera. Please try again.')
      }
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0)
        
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(imageDataUrl)
      }
    }
  }

  const uploadCapturedImage = async () => {
    if (!capturedImage) return
    
    try {
      // Convert data URL to File object
      const response = await fetch(capturedImage)
      const blob = await response.blob()
      const file = new File([blob], `prescription-photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
      
      // Upload the captured image
      await handleFileUpload(file)
      
      // Clean up
      setCapturedImage(null)
      setShowCameraModal(false)
      stopCamera()
    } catch (err) {
      setError('Failed to upload captured image')
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
  }

  // Cleanup camera on modal close
  const closeCameraModal = () => {
    setShowCameraModal(false)
    setCapturedImage(null)
    stopCamera()
    setError(null)
  }

  const getMedicationIcon = (type: MedicationType) => {
    switch (type) {
      case 'tablet': return '💊'
      case 'capsule': return '💊'
      case 'syrup': return '🍯'
      case 'injection': return '💉'
      case 'cream': return '🧴'
      case 'drops': return '💧'
      default: return '💊'
    }
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-12"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                    <Pill className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">Smart Prescription Manager</h1>
                    <p className="text-xl text-emerald-100 mt-2">AI-powered medication tracking and health management</p>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="flex items-center space-x-8 mt-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-100 font-medium">{prescriptions.flatMap(p => p.medications).filter(m => m.isActive).length} active medications</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-200" />
                    <span className="text-blue-100">{realPrescriptions.length + prescriptions.length} total prescriptions</span>
                  </div>
                </div>
              </div>
              
              {/* Stats Card */}
              <div className="hidden lg:block">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-white">{prescriptions.length}</div>
                      <div className="text-emerald-200 text-sm">Prescriptions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">95%</div>
                      <div className="text-emerald-200 text-sm">Adherence</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Enhanced Tab Navigation */}
        <div className="flex space-x-2 mb-8 bg-white p-2 rounded-2xl shadow-lg border-2 border-gray-100 w-fit mx-auto">
          {[
            { id: 'upload', label: 'Upload', icon: Upload, color: 'blue' },
            { id: 'history', label: 'Prescription History', icon: FileText, color: 'purple' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg transform scale-105`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Upload Tab */}
              {activeTab === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  {/* Enhanced Upload Methods */}
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-100 p-8">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Prescription</h2>
                      <p className="text-gray-600">Choose your preferred method to digitize your prescription</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* File Upload */}
                      <motion.button
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowUploadModal(true)}
                        className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl"
                      >
                        <CloudUpload className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-bold mb-2">Upload File</h3>
                        <p className="text-blue-100 text-sm">PDF, JPG, PNG up to 10MB</p>
                        <div className="mt-4 w-full bg-blue-400 bg-opacity-30 rounded-lg h-1">
                          <div className="w-0 group-hover:w-full bg-white h-1 rounded-lg transition-all duration-500"></div>
                        </div>
                      </motion.button>

                      {/* Camera Capture */}
                      <motion.button
                        whileHover={{ scale: 1.05, rotateY: 5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCameraModal(true)}
                        className="group bg-gradient-to-br from-green-500 to-green-600 text-white p-8 rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-xl hover:shadow-2xl"
                      >
                        <Camera className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-bold mb-2">Take Photo</h3>
                        <p className="text-green-100 text-sm">Instant camera capture</p>
                        <div className="mt-4 w-full bg-green-400 bg-opacity-30 rounded-lg h-1">
                          <div className="w-0 group-hover:w-full bg-white h-1 rounded-lg transition-all duration-500"></div>
                        </div>
                      </motion.button>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Why Upload Your Prescriptions?</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        {
                          icon: Bell,
                          title: 'Smart Reminders',
                          description: 'Never miss a dose with intelligent medication alerts',
                          color: 'blue'
                        },
                        {
                          icon: Activity,
                          title: 'Health Tracking',
                          description: 'Monitor your progress and medication adherence',
                          color: 'green'
                        },
                        {
                          icon: Calendar,
                          title: 'Follow-up Alerts',
                          description: 'Automatic reminders for doctor appointments',
                          color: 'purple'
                        },
                        {
                          icon: Target,
                          title: 'Personalized Insights',
                          description: 'Get tailored health recommendations',
                          color: 'orange'
                        }
                      ].map((benefit, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start space-x-4"
                        >
                          <div className={`p-3 rounded-lg bg-${benefit.color}-100`}>
                            <benefit.icon className={`w-6 h-6 text-${benefit.color}-600`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                            <p className="text-gray-600 text-sm">{benefit.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}


              {/* History Tab */}
              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Prescription History</h2>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New</span>
                      </button>
                    </div>

                    {loading && (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading prescriptions...</p>
                      </div>
                    )}
                    
                    {error && (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 mb-4">{error}</p>
                        <button 
                          onClick={loadPrescriptionDocuments}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Real prescription documents - Only shows documents with "prescription" in title/description */}
                      {realPrescriptions.map((doc) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="border border-green-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer bg-green-50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="p-3 bg-green-100 rounded-lg">
                                <FileCheck className="w-6 h-6 text-green-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                                <p className="text-gray-600">Cloud Storage Document</p>
                                <p className="text-sm text-gray-500">Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}</p>
                                <p className="text-sm text-gray-700 mt-2">
                                  <strong>File:</strong> {doc.fileName} ({(doc.fileSize / 1024).toFixed(1)} KB)
                                </p>
                                {doc.description && (
                                  <p className="text-sm text-gray-700">
                                    <strong>Description:</strong> {doc.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                Uploaded
                              </span>
                              <div className="flex space-x-1">
                                <button 
                                  onClick={() => window.open(doc.fileUrl, '_blank')}
                                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="View file"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => {
                                    const downloadUrl = doc.fileUrl.replace('/view?', '/download?')
                                    window.open(downloadUrl, '_blank')
                                  }}
                                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                  title="Download file"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-green-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm text-gray-600">Status: </span>
                                <span className="font-medium text-green-700">Stored in Cloud</span>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">File ID: </span>
                                <span className="font-mono text-xs text-gray-500">{doc.appwriteFileId.substring(0, 8)}...</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Show message if no real prescriptions found */}
                      {realPrescriptions.length === 0 && !loading && !error && (
                        <div className="text-center py-8 text-gray-500">
                          <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-blue-100 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600" />
                          </div>
                          <p>No prescription documents found</p>
                          <p className="text-sm mt-1">Upload prescription files to see them here</p>
                        </div>
                      )}
                      
                      {/* Mock prescription data for demo */}
                      {prescriptions.map((prescription) => (
                        <motion.div
                          key={prescription.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => setSelectedPrescription(prescription)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="p-3 bg-blue-100 rounded-lg">
                                <FileCheck className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{prescription.fileName}</h3>
                                <p className="text-gray-600">Dr. {prescription.doctorName}</p>
                                <p className="text-sm text-gray-500">Uploaded on {new Date(prescription.uploadDate).toLocaleDateString()}</p>
                                <p className="text-sm text-gray-700 mt-2"><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                prescription.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : prescription.status === 'processing'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                              </span>
                              <div className="flex space-x-1">
                                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg">
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Medications Summary */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm text-gray-600">Medications: </span>
                                <span className="font-medium text-gray-900">{prescription.medications.length} prescribed</span>
                              </div>
                              {prescription.followUpDate && (
                                <div>
                                  <span className="text-sm text-gray-600">Follow-up: </span>
                                  <span className="font-medium text-blue-600">{new Date(prescription.followUpDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Enhanced Quick Stats */}
            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-xl border-2 border-emerald-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Activity className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Health Overview</h3>
              </div>
              
              <div className="space-y-4">
                <div className="group bg-white rounded-xl p-4 hover:shadow-lg transition-all border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-emerald-600">
                        {prescriptions.flatMap(p => p.medications).filter(m => m.isActive).length}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Active Medications</div>
                    </div>
                    <Pill className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                
                <div className="group bg-white rounded-xl p-4 hover:shadow-lg transition-all border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-blue-600">{prescriptions.length}</div>
                      <div className="text-sm text-gray-600 font-medium">Total Prescriptions</div>
                    </div>
                    <FileText className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                
                <div className="group bg-white rounded-xl p-4 hover:shadow-lg transition-all border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-purple-600">
                        {realPrescriptions.length}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Cloud Files</div>
                    </div>
                    <CloudUpload className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Next Medication */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Next Medication</h3>
              </div>
              
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100 font-medium">Metformin 500mg</span>
                  <span className="font-bold text-lg">2:00 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Time remaining</span>
                  <span className="font-bold text-lg text-yellow-300">1h 23m</span>
                </div>
                <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-3">
                  <div className="bg-yellow-300 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-3 rounded-xl font-semibold transition-all backdrop-blur-sm border border-white border-opacity-20">
                  <Bell className="w-4 h-4 inline mr-2" />
                  Set Reminder
                </button>
              </div>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="group w-full flex items-center space-x-4 p-4 text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all hover:shadow-lg"
                >
                  <div className="p-2 bg-blue-200 rounded-lg group-hover:bg-blue-300 transition-colors">
                    <Upload className="w-5 h-5 text-blue-700" />
                  </div>
                  <span className="font-semibold text-blue-900">Upload Prescription</span>
                </button>
                
                <button className="group w-full flex items-center space-x-4 p-4 text-left bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-all hover:shadow-lg">
                  <div className="p-2 bg-green-200 rounded-lg group-hover:bg-green-300 transition-colors">
                    <Bell className="w-5 h-5 text-green-700" />
                  </div>
                  <span className="font-semibold text-green-900">Set Medication Reminder</span>
                </button>
                
                <button className="group w-full flex items-center space-x-4 p-4 text-left bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all hover:shadow-lg">
                  <div className="p-2 bg-purple-200 rounded-lg group-hover:bg-purple-300 transition-colors">
                    <Calendar className="w-5 h-5 text-purple-700" />
                  </div>
                  <span className="font-semibold text-purple-900">Schedule Follow-up</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Upload Prescription</h2>
                  <button
                    onClick={() => {
                      setShowUploadModal(false)
                      setError(null)
                      setUploadProgress(0)
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                )}
                
                {isProcessing ? (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="inline-flex p-4 bg-blue-100 rounded-full mb-4"
                    >
                      <Zap className="w-8 h-8 text-blue-600" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Uploading Your Prescription</h3>
                    <p className="text-gray-600">Uploading to secure cloud storage...</p>
                    {uploadProgress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                    onClick={() => {
                      setError(null)
                      fileInputRef.current?.click()
                    }}
                  >
                    <CloudUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Drop your prescription here or click to browse
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Supports PDF, JPG, PNG files up to 10MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleFileUpload(file)
                        }
                      }}
                    />
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Choose File
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Camera Modal */}
        {showCameraModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Take Photo</h2>
                  <button
                    onClick={closeCameraModal}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {!cameraStream && !capturedImage && (
                    <div className="text-center py-12">
                      <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Access Required</h3>
                      <p className="text-gray-600 mb-6">Click the button below to start your camera and take a photo of your prescription</p>
                      <button
                        onClick={startCamera}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Start Camera
                      </button>
                    </div>
                  )}

                  {cameraStream && !capturedImage && (
                    <div className="space-y-4">
                      <div className="relative bg-black rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full min-h-[300px] object-contain"
                          style={{ transform: 'scaleX(-1)' }}
                        />
                        <div className="absolute inset-0 border-2 border-dashed border-white border-opacity-50 m-4 rounded-lg pointer-events-none">
                          <div className="absolute top-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                            Position prescription within frame
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={closeCameraModal}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={capturePhoto}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <Camera className="w-5 h-5" />
                          <span>Capture Photo</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {capturedImage && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Photo Captured</h3>
                        <img
                          src={capturedImage}
                          alt="Captured prescription"
                          className="max-w-full h-auto max-h-96 mx-auto rounded-lg shadow-lg"
                        />
                      </div>
                      
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={retakePhoto}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Retake Photo
                        </button>
                        <button
                          onClick={uploadCapturedImage}
                          disabled={isProcessing}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                        >
                          {isProcessing ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <CloudUpload className="w-5 h-5" />
                              <span>Upload Photo</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Hidden canvas for image capture */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Prescription Detail Modal */}
        {selectedPrescription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Prescription Details</h2>
                  <button
                    onClick={() => setSelectedPrescription(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Prescription Info */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Prescription Details</h3>
                      <p className="text-gray-700"><strong>Doctor:</strong> {selectedPrescription.doctorName}</p>
                      <p className="text-gray-700"><strong>Date:</strong> {new Date(selectedPrescription.uploadDate).toLocaleDateString()}</p>
                      <p className="text-gray-700"><strong>Diagnosis:</strong> {selectedPrescription.diagnosis}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Follow-up Care</h3>
                      {selectedPrescription.followUpDate && (
                        <p className="text-gray-700"><strong>Next Appointment:</strong> {new Date(selectedPrescription.followUpDate).toLocaleDateString()}</p>
                      )}
                      {selectedPrescription.diagnosticTests && (
                        <div>
                          <p className="text-gray-700 mb-2"><strong>Recommended Tests:</strong></p>
                          <div className="flex flex-wrap gap-2">
                            {selectedPrescription.diagnosticTests.map((test, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                                {test}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Medications */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Prescribed Medications</h3>
                  {selectedPrescription.medications.map((medication) => (
                    <div key={medication.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{getMedicationIcon(medication.type)}</div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{medication.name}</h4>
                            <p className="text-gray-600">{medication.dosage} • {medication.frequency}</p>
                            <p className="text-sm text-gray-600">{medication.instructions}</p>
                            <p className="text-sm text-gray-500">Duration: {medication.duration}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          medication.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {medication.isActive ? 'Active' : 'Completed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPrescription.notes && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Additional Notes</h4>
                    <p className="text-gray-700">{selectedPrescription.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}

