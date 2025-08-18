'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Calendar, 
  Edit, 
  X,
  Shield,
  Heart,
  Settings,
  Camera,
  Phone,
  Mail,
  Eye,
  EyeOff,
  Save,
  Plus,
  Check,
  AlertTriangle,
  Lock,
  UserCheck,
  Bell,
  Moon,
  Sun,
  Stethoscope,
  Pill,
  FileText,
  Trash2
} from 'lucide-react'

interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  city: string
  state: string
}

interface MedicalInfo {
  height: string
  weight: string
  bloodType: string
  allergies: string[]
  emergencyContacts: Array<{
    name: string
    relationship: string
    phone: string
  }>
}

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState('overview')
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1985-03-15',
    gender: 'Male',
    address: '123 Health Street',
    city: 'Medical City',
    state: 'MC'
  })

  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({
    height: '175 cm',
    weight: '68 kg',
    bloodType: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    emergencyContacts: [
      { name: 'Jane Doe', relationship: 'Spouse', phone: '+1 (555) 987-6543' },
      { name: 'Robert Doe', relationship: 'Brother', phone: '+1 (555) 456-7890' }
    ]
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    medicationReminders: true,
    healthTips: true
  })

  const sections = [
    { id: 'overview', name: 'Overview', icon: User, color: 'blue' },
    { id: 'personal', name: 'Personal Info', icon: UserCheck, color: 'green' },
    { id: 'medical', name: 'Medical Info', icon: Stethoscope, color: 'red' },
    { id: 'security', name: 'Security', icon: Shield, color: 'orange' },
    { id: 'notifications', name: 'Notifications', icon: Bell, color: 'indigo' },
    { id: 'preferences', name: 'Preferences', icon: Settings, color: 'gray' }
  ]

  const handleSave = (section: string) => {
    setSaveStatus('saving')
    setTimeout(() => {
      setSaveStatus('saved')
      setEditingSection(null)
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1000)
  }

  const addEmergencyContact = () => {
    setMedicalInfo(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { name: '', relationship: '', phone: '' }]
    }))
  }

  const removeEmergencyContact = (index: number) => {
    setMedicalInfo(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }))
  }

  const removeAllergy = (index: number) => {
    setMedicalInfo(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }))
  }

  const addAllergy = (allergy: string) => {
    if (allergy && !medicalInfo.allergies.includes(allergy)) {
      setMedicalInfo(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergy]
      }))
    }
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Interactive Profile
          </h1>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage your personal information with separate editing sections
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <button className={`absolute bottom-0 right-0 p-2 rounded-full shadow-md border hover:scale-110 transition-transform ${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                    <Camera className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                  </button>
                </div>
                <h2 className={`text-xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {personalInfo.firstName} {personalInfo.lastName}
                </h2>
                <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Patient ID: #12345
                </p>
                
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Active Patient
                  </span>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-2">
                {sections.map((section) => (
                  <motion.button
                    key={section.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left font-medium transition-all ${
                      activeSection === section.id
                        ? `bg-${section.color}-100 text-${section.color}-700 border border-${section.color}-200`
                        : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <span>{section.name}</span>
                    {editingSection === section.id && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </motion.button>
                ))}
              </nav>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Quick Actions
                </h3>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-full flex items-center space-x-2 p-2 rounded-lg text-sm transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Overview Section */}
              {activeSection === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Profile Completion */}
                  <div className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Profile Completion
                      </h3>
                      <span className="text-2xl font-bold text-blue-600">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                      <div className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Complete your medical information to get personalized health insights
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`rounded-xl shadow-lg border p-6 text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                    >
                      <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-2">12</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Total Appointments
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`rounded-xl shadow-lg border p-6 text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                    >
                      <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                        <Pill className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-600 mb-2">3</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Active Medications
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`rounded-xl shadow-lg border p-6 text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                    >
                      <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                        <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-purple-600 mb-2">8</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Health Records
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Personal Information Section */}
              {activeSection === 'personal' && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Personal Information
                    </h3>
                    <div className="flex items-center space-x-3">
                      {saveStatus === 'saved' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center space-x-2 text-green-600"
                        >
                          <Check className="w-4 h-4" />
                          <span className="text-sm">Saved</span>
                        </motion.div>
                      )}
                      <button
                        onClick={() => setEditingSection(editingSection === 'personal' ? null : 'personal')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          editingSection === 'personal'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {editingSection === 'personal' ? (
                          <>
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                          </>
                        ) : (
                          <>
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        First Name
                      </label>
                      <input
                        type="text"
                        value={personalInfo.firstName}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={editingSection !== 'personal'}
                        className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                          editingSection === 'personal'
                            ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500'
                            : isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-gray-300'
                            : 'border-gray-300 bg-gray-50 text-gray-700'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={personalInfo.lastName}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={editingSection !== 'personal'}
                        className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                          editingSection === 'personal'
                            ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500'
                            : isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-gray-300'
                            : 'border-gray-300 bg-gray-50 text-gray-700'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email
                      </label>
                      <div className="relative">
                        <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                          type="email"
                          value={personalInfo.email}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                          disabled={editingSection !== 'personal'}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg transition-colors ${
                            editingSection === 'personal'
                              ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500'
                              : isDarkMode
                              ? 'border-gray-600 bg-gray-700 text-gray-300'
                              : 'border-gray-300 bg-gray-50 text-gray-700'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Phone
                      </label>
                      <div className="relative">
                        <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                          type="tel"
                          value={personalInfo.phone}
                          onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={editingSection !== 'personal'}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg transition-colors ${
                            editingSection === 'personal'
                              ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500'
                              : isDarkMode
                              ? 'border-gray-600 bg-gray-700 text-gray-300'
                              : 'border-gray-300 bg-gray-50 text-gray-700'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={personalInfo.dateOfBirth}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        disabled={editingSection !== 'personal'}
                        className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                          editingSection === 'personal'
                            ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500'
                            : isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-gray-300'
                            : 'border-gray-300 bg-gray-50 text-gray-700'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Gender
                      </label>
                      <select
                        value={personalInfo.gender}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, gender: e.target.value }))}
                        disabled={editingSection !== 'personal'}
                        className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                          editingSection === 'personal'
                            ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500'
                            : isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-gray-300'
                            : 'border-gray-300 bg-gray-50 text-gray-700'
                        }`}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Address
                      </label>
                      <input
                        type="text"
                        value={personalInfo.address}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, address: e.target.value }))}
                        disabled={editingSection !== 'personal'}
                        className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                          editingSection === 'personal'
                            ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500'
                            : isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-gray-300'
                            : 'border-gray-300 bg-gray-50 text-gray-700'
                        }`}
                      />
                    </div>
                  </div>

                  {editingSection === 'personal' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6"
                    >
                      <button
                        onClick={() => setEditingSection(null)}
                        className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave('personal')}
                        disabled={saveStatus === 'saving'}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        {saveStatus === 'saving' ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Medical Information Section */}
              {activeSection === 'medical' && (
                <motion.div
                  key="medical"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Basic Medical Info */}
                  <div className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Basic Medical Information
                      </h3>
                      <button
                        onClick={() => setEditingSection(editingSection === 'medical' ? null : 'medical')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          editingSection === 'medical'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {editingSection === 'medical' ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                        <span>{editingSection === 'medical' ? 'Cancel' : 'Edit'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Height
                        </label>
                        <input
                          type="text"
                          value={medicalInfo.height}
                          onChange={(e) => setMedicalInfo(prev => ({ ...prev, height: e.target.value }))}
                          disabled={editingSection !== 'medical'}
                          className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                            editingSection === 'medical'
                              ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500'
                              : isDarkMode
                              ? 'border-gray-600 bg-gray-700 text-gray-300'
                              : 'border-gray-300 bg-gray-50 text-gray-700'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Weight
                        </label>
                        <input
                          type="text"
                          value={medicalInfo.weight}
                          onChange={(e) => setMedicalInfo(prev => ({ ...prev, weight: e.target.value }))}
                          disabled={editingSection !== 'medical'}
                          className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                            editingSection === 'medical'
                              ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500'
                              : isDarkMode
                              ? 'border-gray-600 bg-gray-700 text-gray-300'
                              : 'border-gray-300 bg-gray-50 text-gray-700'
                          }`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Blood Type
                        </label>
                        <select
                          value={medicalInfo.bloodType}
                          onChange={(e) => setMedicalInfo(prev => ({ ...prev, bloodType: e.target.value }))}
                          disabled={editingSection !== 'medical'}
                          className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                            editingSection === 'medical'
                              ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500'
                              : isDarkMode
                              ? 'border-gray-600 bg-gray-700 text-gray-300'
                              : 'border-gray-300 bg-gray-50 text-gray-700'
                          }`}
                        >
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </select>
                      </div>
                    </div>

                    {editingSection === 'medical' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6"
                      >
                        <button
                          onClick={() => setEditingSection(null)}
                          className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSave('medical')}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {/* Allergies */}
                  <div className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Allergies
                      </h3>
                      <button
                        onClick={() => setEditingSection(editingSection === 'allergies' ? null : 'allergies')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          editingSection === 'allergies'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {editingSection === 'allergies' ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                        <span>{editingSection === 'allergies' ? 'Cancel' : 'Edit'}</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {medicalInfo.allergies.map((allergy, index) => (
                        <motion.span
                          key={index}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="inline-flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>{allergy}</span>
                          {editingSection === 'allergies' && (
                            <button
                              onClick={() => removeAllergy(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </motion.span>
                      ))}
                    </div>

                    {editingSection === 'allergies' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="flex space-x-3">
                          <input
                            type="text"
                            placeholder="Add new allergy..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addAllergy(e.target.value)
                                e.target.value = ''
                              }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                          />
                          <button
                            onClick={(e) => {
                              const input = e.target.parentElement.querySelector('input')
                              addAllergy(input.value)
                              input.value = ''
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add</span>
                          </button>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => setEditingSection(null)}
                            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSave('allergies')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Emergency Contacts */}
                  <div className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Emergency Contacts
                      </h3>
                      <button
                        onClick={() => setEditingSection(editingSection === 'emergency' ? null : 'emergency')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          editingSection === 'emergency'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {editingSection === 'emergency' ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                        <span>{editingSection === 'emergency' ? 'Cancel' : 'Edit'}</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {medicalInfo.emergencyContacts.map((contact, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 border rounded-lg ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Name
                              </label>
                              <input
                                type="text"
                                value={contact.name}
                                onChange={(e) => {
                                  const newContacts = [...medicalInfo.emergencyContacts]
                                  newContacts[index].name = e.target.value
                                  setMedicalInfo(prev => ({ ...prev, emergencyContacts: newContacts }))
                                }}
                                disabled={editingSection !== 'emergency'}
                                className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                                  editingSection === 'emergency'
                                    ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500'
                                    : isDarkMode
                                    ? 'border-gray-600 bg-gray-600 text-gray-300'
                                    : 'border-gray-300 bg-white text-gray-700'
                                }`}
                              />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Relationship
                              </label>
                              <input
                                type="text"
                                value={contact.relationship}
                                onChange={(e) => {
                                  const newContacts = [...medicalInfo.emergencyContacts]
                                  newContacts[index].relationship = e.target.value
                                  setMedicalInfo(prev => ({ ...prev, emergencyContacts: newContacts }))
                                }}
                                disabled={editingSection !== 'emergency'}
                                className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                                  editingSection === 'emergency'
                                    ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500'
                                    : isDarkMode
                                    ? 'border-gray-600 bg-gray-600 text-gray-300'
                                    : 'border-gray-300 bg-white text-gray-700'
                                }`}
                              />
                            </div>
                            <div className="flex space-x-2">
                              <div className="flex-1">
                                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  Phone
                                </label>
                                <input
                                  type="tel"
                                  value={contact.phone}
                                  onChange={(e) => {
                                    const newContacts = [...medicalInfo.emergencyContacts]
                                    newContacts[index].phone = e.target.value
                                    setMedicalInfo(prev => ({ ...prev, emergencyContacts: newContacts }))
                                  }}
                                  disabled={editingSection !== 'emergency'}
                                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                                    editingSection === 'emergency'
                                      ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500'
                                      : isDarkMode
                                      ? 'border-gray-600 bg-gray-600 text-gray-300'
                                      : 'border-gray-300 bg-white text-gray-700'
                                  }`}
                                />
                              </div>
                              {editingSection === 'emergency' && (
                                <button
                                  onClick={() => removeEmergencyContact(index)}
                                  className="self-end p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {editingSection === 'emergency' && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6"
                      >
                        <button
                          onClick={addEmergencyContact}
                          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Plus className="w-5 h-5" />
                          <span>Add Emergency Contact</span>
                        </button>

                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                          <button
                            onClick={() => setEditingSection(null)}
                            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSave('emergency')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Security Section */}
              {activeSection === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                >
                  <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Security Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                          placeholder="Enter current password"
                        />
                        <button
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>Update Password</span>
                    </button>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className={`font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Two-Factor Authentication
                    </h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notifications Section */}
              {activeSection === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                >
                  <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Notification Preferences
                  </h3>
                  
                  <div className="space-y-6">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                      { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive text message notifications' },
                      { key: 'appointmentReminders', label: 'Appointment Reminders', description: 'Reminders before scheduled appointments' },
                      { key: 'medicationReminders', label: 'Medication Reminders', description: 'Alerts for medication schedules' },
                      { key: 'healthTips', label: 'Health Tips', description: 'Daily health tips and wellness advice' }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {setting.label}
                          </h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {setting.description}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications[setting.key]}
                            onChange={(e) => setNotifications(prev => ({
                              ...prev,
                              [setting.key]: e.target.checked
                            }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                    <button
                      onClick={() => handleSave('notifications')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Preferences</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Preferences Section */}
              {activeSection === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
                >
                  <h3 className={`text-lg font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Display & Privacy Preferences
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Language
                      </label>
                      <select className={`w-full px-3 py-2 border rounded-lg transition-colors ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-700'}`}>
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Timezone
                      </label>
                      <select className={`w-full px-3 py-2 border rounded-lg transition-colors ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-700'}`}>
                        <option value="EST">Eastern Time (EST)</option>
                        <option value="CST">Central Time (CST)</option>
                        <option value="MST">Mountain Time (MST)</option>
                        <option value="PST">Pacific Time (PST)</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Profile Visibility
                          </h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Allow healthcare providers to view your profile
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Data Analytics
                          </h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Help improve our services with anonymous usage data
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                    <button
                      onClick={() => handleSave('preferences')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Preferences</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Save Status Toast */}
        <AnimatePresence>
          {saveStatus === 'saved' && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
            >
              <Check className="w-5 h-5" />
              <span>Changes saved successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}