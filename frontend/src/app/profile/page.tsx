'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@/contexts/UserContext'
import { profileService, ProfileStats } from '@/lib/profileService'
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
  const { user, loading: userLoading, updateUser } = useUser()
  const [activeSection, setActiveSection] = useState('overview')
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)

  // Parse user data into component state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: ''
  })

  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>({
    height: '',
    weight: '',
    bloodType: '',
    allergies: [],
    emergencyContacts: []
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    medicationReminders: true,
    healthTips: true
  })

  // Load user data when user changes
  useEffect(() => {
    if (user) {
      // Parse name into first and last name
      const nameParts = user.name?.split(' ') || ['', '']
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      // Parse address
      const addressParts = user.address?.split(', ') || ['', '', '']
      const address = addressParts[0] || ''
      const city = addressParts[1] || ''
      const state = addressParts[2] || ''

      setPersonalInfo({
        firstName,
        lastName,
        email: user.email || '',
        phone: user.phoneNumber || '',
        dateOfBirth: profileService.formatDateForInput(user.dateOfBirth),
        gender: user.gender || '',
        address,
        city,
        state
      })

      setMedicalInfo({
        height: '', // Not in user model, would need separate medical records
        weight: '', // Not in user model, would need separate medical records
        bloodType: user.bloodType || '',
        allergies: profileService.parseAllergies(user.allergies),
        emergencyContacts: profileService.parseEmergencyContacts(user.emergencyContact)
      })
    }
  }, [user])

  // Load profile stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await profileService.getProfileStats()
        setProfileStats(stats)
      } catch (error) {
        console.error('Failed to load profile stats:', error)
      }
    }
    
    if (user) {
      loadStats()
    }
  }, [user])

  const sections = [
    { id: 'overview', name: 'Overview', icon: User, color: 'blue' },
    { id: 'personal', name: 'Personal Info', icon: UserCheck, color: 'green' },
    { id: 'medical', name: 'Medical Info', icon: Stethoscope, color: 'red' },
    { id: 'security', name: 'Security', icon: Shield, color: 'orange' },
    { id: 'notifications', name: 'Notifications', icon: Bell, color: 'indigo' },
    { id: 'preferences', name: 'Preferences', icon: Settings, color: 'gray' }
  ]

  // Auto-save function with debouncing
  const autoSave = useCallback(async (updates: any) => {
    if (!autoSaveEnabled || !user) return
    
    try {
      setSaveStatus('saving')
      await profileService.autoSaveProfile(updates, 1500)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Auto-save failed:', error)
      setSaveStatus('idle')
    }
  }, [autoSaveEnabled, user])

  const handleSave = async (section: string) => {
    if (!user) return
    
    try {
      setSaveStatus('saving')
      
      let updates: any = {}
      
      if (section === 'personal') {
        updates = {
          name: `${personalInfo.firstName} ${personalInfo.lastName}`.trim(),
          phoneNumber: personalInfo.phone,
          dateOfBirth: personalInfo.dateOfBirth,
          gender: personalInfo.gender,
          address: `${personalInfo.address}, ${personalInfo.city}, ${personalInfo.state}`.replace(/^, |, $/g, '')
        }
      } else if (section === 'medical') {
        updates = {
          bloodType: medicalInfo.bloodType,
          allergies: profileService.stringifyAllergies(medicalInfo.allergies),
          emergencyContact: profileService.stringifyEmergencyContacts(medicalInfo.emergencyContacts)
        }
      } else if (section === 'allergies') {
        updates = {
          allergies: profileService.stringifyAllergies(medicalInfo.allergies)
        }
      } else if (section === 'emergency') {
        updates = {
          emergencyContact: profileService.stringifyEmergencyContacts(medicalInfo.emergencyContacts)
        }
      }

      await updateUser(updates)
      setSaveStatus('saved')
      setEditingSection(null)
      setTimeout(() => setSaveStatus('idle'), 2000)
      
      // Refresh stats after update
      const stats = await profileService.getProfileStats()
      setProfileStats(stats)
      
    } catch (error) {
      console.error('Save failed:', error)
      setSaveStatus('idle')
      // Show error to user (you could add a toast notification here)
    }
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

  // Show loading state
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl blur-3xl opacity-20"></div>
          
          {/* Header Content */}
          <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="text-center lg:text-left mb-6 lg:mb-0">
                <div className="flex items-center justify-center lg:justify-start mb-4">
                  <motion.div 
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl mr-4"
                  >
                    <User className="w-10 h-10 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-4xl font-bold mb-2">
                      Profile Management
                    </h1>
                    <p className="text-white/80 text-lg">
                      Comprehensive health profile & settings
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { 
                    label: 'Profile Complete', 
                    value: profileStats ? `${profileStats.profileCompletion}%` : '...', 
                    icon: UserCheck 
                  },
                  { 
                    label: 'Active Since', 
                    value: user ? new Date(user.createdAt).getFullYear().toString() : '...', 
                    icon: Calendar 
                  },
                  { 
                    label: 'Last Update', 
                    value: user ? profileService.formatDate(user.updatedAt) : '...', 
                    icon: Settings 
                  },
                  { 
                    label: 'Security', 
                    value: user?.emailVerified ? 'High' : 'Medium', 
                    icon: Shield 
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20"
                  >
                    <stat.icon className="w-6 h-6 mx-auto mb-2 text-white/90" />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-white/70">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-2xl opacity-20"></div>
              
              <div className={`relative rounded-2xl shadow-xl border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'}`}>
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="relative inline-block mb-4">
                      <motion.div 
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                        className="w-28 h-28 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <User className="w-14 h-14 text-white" />
                      </motion.div>
                      <motion.button 
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute bottom-0 right-0 p-3 rounded-full shadow-lg border-2 bg-gradient-to-r from-blue-500 to-purple-600 border-white hover:from-blue-600 hover:to-purple-700 transition-all"
                      >
                        <Camera className="w-4 h-4 text-white" />
                      </motion.button>
                    </div>
                    <h2 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user?.name || 'Loading...'}
                    </h2>
                    <p className={`text-sm mb-4 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Patient ID: #{user?.id || '...'}
                    </p>
                    
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full"
                    >
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">
                        Active Patient
                      </span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Navigation Menu */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-2xl shadow-xl border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'}`}
            >
              <div className="p-6">
                <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Navigation
                </h3>
                <nav className="space-y-2">
                  {sections.map((section, index) => (
                    <motion.button
                      key={section.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-200 ${
                        activeSection === section.id
                          ? `bg-gradient-to-r from-${section.color}-100 to-${section.color}-50 text-${section.color}-700 border-2 border-${section.color}-200 shadow-lg`
                          : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-blue-600'
                      }`}
                    >
                      <motion.div
                        whileHover={{ rotate: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <section.icon className="w-5 h-5" />
                      </motion.div>
                      <span>{section.name}</span>
                      {editingSection === section.id && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto"
                        >
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </nav>
              </div>
            </motion.div>

            {/* Enhanced Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-2xl shadow-xl border backdrop-blur-sm ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'}`}
            >
              <div className="p-6">
                <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl text-sm font-medium transition-all ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 hover:from-yellow-200 hover:to-orange-200' 
                        : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-purple-700 hover:from-indigo-200 hover:to-purple-200'
                    }`}
                  >
                    <motion.div
                      whileHover={{ rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </motion.div>
                    <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:from-green-200 hover:to-emerald-200 transition-all"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Export Data</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Enhanced Overview Section */}
              {activeSection === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  {/* Enhanced Profile Completion */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 rounded-2xl blur-2xl opacity-20"></div>
                    <div className={`relative rounded-2xl shadow-xl border backdrop-blur-sm p-8 ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'}`}>
                      <div className="flex flex-col lg:flex-row items-center justify-between mb-6">
                        <div className="text-center lg:text-left mb-4 lg:mb-0">
                          <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Profile Completion
                          </h3>
                          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Complete your medical information to get personalized health insights
                          </p>
                        </div>
                        <div className="text-center">
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                            className="relative w-24 h-24 mx-auto"
                          >
                            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray="85, 100"
                                strokeLinecap="round"
                                className="text-gradient bg-gradient-to-r from-blue-500 to-green-500"
                                style={{ stroke: 'url(#gradient)' }}
                              />
                              <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#3B82F6" />
                                  <stop offset="100%" stopColor="#10B981" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                                {profileStats ? `${profileStats.profileCompletion}%` : '...'}
                              </span>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: profileStats ? `${profileStats.profileCompletion}%` : '0%' }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 h-3 rounded-full relative"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-full animate-pulse"></div>
                          </motion.div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Personal Info Complete</span>
                          <span className={`font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {profileStats ? `${profileStats.profileCompletion}%` : '...'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { 
                        icon: Calendar, 
                        value: profileStats ? profileStats.totalAppointments.toString() : '...', 
                        label: 'Total Appointments',
                        gradient: 'from-blue-500 to-cyan-500',
                        bgGradient: 'from-blue-100 to-cyan-100',
                        change: '+2 this month',
                        trend: 'up'
                      },
                      { 
                        icon: Pill, 
                        value: profileStats ? profileStats.activeMedications.toString() : '...', 
                        label: 'Active Medications',
                        gradient: 'from-green-500 to-emerald-500',
                        bgGradient: 'from-green-100 to-emerald-100',
                        change: '1 updated',
                        trend: 'neutral'
                      },
                      { 
                        icon: FileText, 
                        value: profileStats ? profileStats.healthRecords.toString() : '...', 
                        label: 'Health Records',
                        gradient: 'from-purple-500 to-pink-500',
                        bgGradient: 'from-purple-100 to-pink-100',
                        change: '+1 this week',
                        trend: 'up'
                      }
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="relative group"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                        <div className={`relative rounded-2xl shadow-xl border backdrop-blur-sm p-6 text-center ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'}`}>
                          <motion.div 
                            whileHover={{ rotate: 360, scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                            className={`p-4 bg-gradient-to-br ${stat.bgGradient} rounded-2xl w-fit mx-auto mb-4 shadow-lg`}
                          >
                            <stat.icon className={`w-8 h-8 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent', backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
                          </motion.div>
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                            className={`text-3xl font-bold mb-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                          >
                            {stat.value}
                          </motion.div>
                          <div className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {stat.label}
                          </div>
                          <div className={`text-xs flex items-center justify-center space-x-1 ${
                            stat.trend === 'up' ? 'text-green-600' : 
                            stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {stat.trend === 'up' && <motion.div initial={{ y: 5 }} animate={{ y: 0 }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}>↗</motion.div>}
                            {stat.trend === 'down' && <motion.div initial={{ y: -5 }} animate={{ y: 0 }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}>↘</motion.div>}
                            <span>{stat.change}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Health Insights */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl blur-2xl opacity-20"></div>
                      <div className={`relative rounded-2xl shadow-xl border backdrop-blur-sm p-6 ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'}`}>
                        <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Health Insights</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                            <Heart className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Your vitals look great!</span>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">Next checkup in 2 weeks</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl blur-2xl opacity-20"></div>
                      <div className={`relative rounded-2xl shadow-xl border backdrop-blur-sm p-6 ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'}`}>
                        <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h4>
                        <div className="space-y-3">
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-xl hover:from-purple-200 hover:to-indigo-200 transition-all"
                          >
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">Add Health Data</span>
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 rounded-xl hover:from-orange-200 hover:to-yellow-200 transition-all"
                          >
                            <Calendar className="w-5 h-5" />
                            <span className="font-medium">Schedule Appointment</span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* Enhanced Personal Information Section */}
              {activeSection === 'personal' && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 rounded-2xl blur-2xl opacity-20"></div>
                  <div className={`relative rounded-2xl shadow-xl border backdrop-blur-sm p-8 ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-100'}`}>
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
                      <div>
                        <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Personal Information
                        </h3>
                        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Manage your personal details and contact information
                        </p>
                      </div>
                      <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                        {saveStatus === 'saved' && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-xl"
                          >
                            <Check className="w-5 h-5" />
                            <span className="font-medium">Saved Successfully</span>
                          </motion.div>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setEditingSection(editingSection === 'personal' ? null : 'personal')}
                          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                            editingSection === 'personal'
                              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                          }`}
                        >
                          {editingSection === 'personal' ? (
                            <>
                              <X className="w-5 h-5" />
                              <span>Cancel</span>
                            </>
                          ) : (
                            <>
                              <Edit className="w-5 h-5" />
                              <span>Edit</span>
                            </>
                          )}
                        </motion.button>
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
                        onChange={(e) => {
                          const newValue = e.target.value
                          setPersonalInfo(prev => ({ ...prev, firstName: newValue }))
                          if (editingSection === 'personal') {
                            autoSave({ name: `${newValue} ${personalInfo.lastName}`.trim() })
                          }
                        }}
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
                  </div>
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