'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  Camera, 
  Scan, 
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
  Trash2,
  Activity,
  TrendingUp,
  Heart,
  Stethoscope,
  FileCheck,
  CloudUpload,
  Zap,
  Target,
  BookOpen,
  User
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

interface Notification {
  id: string
  type: 'medication' | 'followup' | 'diagnostic' | 'refill'
  title: string
  message: string
  time: string
  isRead: boolean
  priority: 'low' | 'medium' | 'high'
}

export default function PrescriptionsPage() {
  const [activeTab, setActiveTab] = useState('upload') // upload, medications, history, notifications
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock data
  const [prescriptions] = useState<Prescription[]>([
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

  const [notifications] = useState<Notification[]>([
    {
      id: 'n1',
      type: 'medication',
      title: 'Medication Reminder',
      message: 'Time to take Metformin 500mg',
      time: '2:00 PM',
      isRead: false,
      priority: 'high'
    },
    {
      id: 'n2',
      type: 'followup',
      title: 'Follow-up Appointment',
      message: 'Follow-up with Dr. Sarah Johnson due in 2 weeks',
      time: 'Feb 15, 2024',
      isRead: false,
      priority: 'medium'
    },
    {
      id: 'n3',
      type: 'diagnostic',
      title: 'HbA1c Test Due',
      message: 'Time for your quarterly diabetes check',
      time: 'Feb 10, 2024',
      isRead: true,
      priority: 'medium'
    },
    {
      id: 'n4',
      type: 'refill',
      title: 'Prescription Refill',
      message: 'Lisinopril prescription expires in 1 week',
      time: 'Feb 8, 2024',
      isRead: false,
      priority: 'low'
    }
  ])

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    setIsProcessing(true)
    
    // Simulate OCR processing
    setTimeout(() => {
      setIsProcessing(false)
      setShowUploadModal(false)
      setActiveTab('history')
    }, 3000)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files[0]) {
      handleFileUpload(files[0])
    }
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'medication': return <Pill className="w-5 h-5 text-blue-600" />
      case 'followup': return <Calendar className="w-5 h-5 text-green-600" />
      case 'diagnostic': return <Stethoscope className="w-5 h-5 text-purple-600" />
      case 'refill': return <AlertCircle className="w-5 h-5 text-orange-600" />
      default: return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Prescription Manager</h1>
          <p className="text-gray-600 mt-2">Upload, track, and manage your medications with smart reminders</p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit mx-auto">
          {[
            { id: 'upload', label: 'Upload', icon: Upload },
            { id: 'medications', label: 'My Medications', icon: Pill },
            { id: 'history', label: 'Prescription History', icon: FileText },
            { id: 'notifications', label: 'Notifications', icon: Bell }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === 'notifications' && notifications.filter(n => !n.isRead).length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
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
                  {/* Upload Methods */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Upload Your Prescription</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* File Upload */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowUploadModal(true)}
                        className="p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                      >
                        <CloudUpload className="w-12 h-12 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-semibold text-gray-900 mb-2">Upload File</h3>
                        <p className="text-sm text-gray-600">Choose PDF, JPG, PNG files</p>
                      </motion.button>

                      {/* Camera Capture */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
                      >
                        <Camera className="w-12 h-12 text-green-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-semibold text-gray-900 mb-2">Take Photo</h3>
                        <p className="text-sm text-gray-600">Capture with camera</p>
                      </motion.button>

                      {/* OCR Scan */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-6 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
                      >
                        <Scan className="w-12 h-12 text-purple-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="font-semibold text-gray-900 mb-2">Smart Scan</h3>
                        <p className="text-sm text-gray-600">AI-powered text extraction</p>
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

              {/* Medications Tab */}
              {activeTab === 'medications' && (
                <motion.div
                  key="medications"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Active Medications</h2>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {prescriptions.flatMap(p => p.medications).filter(m => m.isActive).length} active
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {prescriptions.flatMap(p => p.medications).filter(m => m.isActive).map((medication) => (
                        <motion.div
                          key={medication.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                              <div className="text-3xl">{getMedicationIcon(medication.type)}</div>
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">{medication.name}</h3>
                                <p className="text-gray-600">{medication.dosage} • {medication.frequency}</p>
                                <p className="text-sm text-gray-500">Prescribed by {medication.prescribedBy}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600 mb-1">Next dose</div>
                              <div className="font-semibold text-blue-600">{medication.nextDose}</div>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                              <span>Treatment Progress</span>
                              <span>{medication.completionPercentage}% complete</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${medication.completionPercentage}%` }}
                              />
                            </div>
                          </div>

                          {/* Instructions & Side Effects */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
                              <p className="text-sm text-gray-600">{medication.instructions}</p>
                            </div>
                            {medication.sideEffects && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Side Effects</h4>
                                <div className="flex flex-wrap gap-1">
                                  {medication.sideEffects.map((effect, index) => (
                                    <span key={index} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                                      {effect}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-3">
                            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                              <CheckCircle className="w-4 h-4" />
                              <span>Mark as Taken</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                              <Edit3 className="w-4 h-4" />
                              <span>Edit Schedule</span>
                            </button>
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

                    <div className="space-y-4">
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

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Health Notifications</h2>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {notifications.filter(n => !n.isRead).length} unread
                        </span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Mark all as read
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`border rounded-lg p-4 transition-all ${
                            notification.isRead 
                              ? 'border-gray-200 bg-gray-50' 
                              : 'border-blue-200 bg-blue-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1">
                                <h3 className={`font-semibold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                                  {notification.title}
                                </h3>
                                <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-700'}`}>
                                  {notification.message}
                                </p>
                                <div className="flex items-center space-x-3 mt-2">
                                  <span className="text-xs text-gray-500">{notification.time}</span>
                                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                                    {notification.priority.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              {notification.type === 'medication' && (
                                <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                                  Mark Taken
                                </button>
                              )}
                              <button className="p-1 text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                              </button>
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

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Overview</h3>
              <div className="space-y-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {prescriptions.flatMap(p => p.medications).filter(m => m.isActive).length}
                  </div>
                  <div className="text-sm text-gray-600">Active Medications</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{prescriptions.length}</div>
                  <div className="text-sm text-gray-600">Prescriptions</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {notifications.filter(n => !n.isRead).length}
                  </div>
                  <div className="text-sm text-gray-600">Pending Alerts</div>
                </div>
              </div>
            </div>

            {/* Next Medication */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Next Medication</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Metformin 500mg</span>
                  <span className="font-semibold">2:00 PM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Time remaining</span>
                  <span className="font-semibold">1h 23m</span>
                </div>
                <button className="w-full bg-white bg-opacity-20 text-white py-2 rounded-lg hover:bg-opacity-30 transition-colors">
                  Set Reminder
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Upload Prescription</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Bell className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Set Medication Reminder</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Schedule Follow-up</span>
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
                    onClick={() => setShowUploadModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {isProcessing ? (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="inline-flex p-4 bg-blue-100 rounded-full mb-4"
                    >
                      <Zap className="w-8 h-8 text-blue-600" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Your Prescription</h3>
                    <p className="text-gray-600">Our AI is extracting medication details...</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3 }}
                        className="bg-blue-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
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
                        if (file) handleFileUpload(file)
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

