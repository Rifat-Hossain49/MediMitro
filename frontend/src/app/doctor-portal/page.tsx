'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  User,
  Calendar,
  MessageSquare,
  MessageCircle,
  Video,
  FileText,
  Settings,
  Bell,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  LogOut
} from 'lucide-react'

interface DoctorProfile {
  id: string
  name: string
  email: string
  specialization: string
  verification_status: string
  is_verified: boolean
  consultation_fee: number
  rating: number
  total_ratings: number
  medical_degree?: string
  university?: string
  graduation_year?: number
  board_certification?: string
  additional_qualifications?: string
  languages?: string
  bio?: string
  hospital?: string
}

interface DashboardStats {
  totalAppointments: number
  todayAppointments: number
  totalPatients: number
  unreadMessages: number
  upcomingMeetings: number
}

export default function DoctorPortal() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    todayAppointments: 0,
    totalPatients: 0,
    unreadMessages: 0,
    upcomingMeetings: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDoctorProfile()
    loadDashboardStats()
  }, [])

  const loadDoctorProfile = async () => {
    try {
      const response = await fetch('/api/doctor-portal/profile')
      const data = await response.json()
      if (data.success) {
        setDoctorProfile(data.doctor)
        console.log('Loaded doctor profile:', data.doctor);
      } else {
        console.error('Failed to load doctor profile:', data.message)
      }
    } catch (error) {
      console.error('Failed to load doctor profile:', error)
    }
  }

  const loadDashboardStats = async () => {
    try {
      // Load appointments
      const appointmentsResponse = await fetch('/api/doctor-portal/appointments')
      const appointmentsData = await appointmentsResponse.json()

      // Load patients
      const patientsResponse = await fetch('/api/doctor-portal/patients')
      const patientsData = await patientsResponse.json()

      // Load unread messages
      const messagesResponse = await fetch('/api/doctor-portal/messaging/unread-count')
      const messagesData = await messagesResponse.json()

      // Load meetings
      const meetingsResponse = await fetch('/api/doctor-portal/meetings?status=scheduled')
      const meetingsData = await meetingsResponse.json()

      setStats({
        totalAppointments: appointmentsData.appointments?.length || 0,
        todayAppointments: appointmentsData.appointments?.filter((apt: any) =>
          new Date(apt.date_time).toDateString() === new Date().toDateString()
        ).length || 0,
        totalPatients: patientsData.patients?.length || 0,
        unreadMessages: messagesData.unreadCount || 0,
        upcomingMeetings: meetingsData.meetings?.length || 0
      })
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare }
  ]

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, Dr. {doctorProfile?.name?.split(' ')[0] || 'Doctor'}!
        </h1>
        <p className="text-blue-100">
          {doctorProfile?.specialization} • {doctorProfile?.is_verified ? 'Verified' : 'Pending Verification'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalAppointments}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Today's Appointments</p>
              <p className="text-3xl font-bold text-gray-900">{stats.todayAppointments}</p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Unread Messages</p>
              <p className="text-3xl font-bold text-gray-900">{stats.unreadMessages}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-orange-600" />
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('appointments')}
              className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-blue-700 font-medium">View Appointments</span>
              <Calendar className="w-5 h-5 text-blue-600" />
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="text-green-700 font-medium">View Messages</span>
              <MessageSquare className="w-5 h-5 text-green-600" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Verification Status</h3>
            <button
              onClick={loadDoctorProfile}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>

          {/* Debug information - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs">
              <strong>Debug Info:</strong><br />
              Medical Degree: {doctorProfile?.medical_degree || 'undefined'}<br />
              Verification Status: {doctorProfile?.verification_status || 'undefined'}<br />
              Is Verified: {doctorProfile?.is_verified ? 'true' : 'false'}<br />
              University: {doctorProfile?.university || 'undefined'}
            </div>
          )}

          {/* Check if doctor has submitted credentials by looking at medical_degree field */}
          {(() => {
            console.log('Doctor profile data:', doctorProfile);
            console.log('Medical degree:', doctorProfile?.medical_degree);
            console.log('Verification status:', doctorProfile?.verification_status);
            console.log('Has credentials:', doctorProfile?.medical_degree && doctorProfile.medical_degree !== 'Not Specified' && doctorProfile.medical_degree !== '');
            // Check if doctor has submitted credentials by looking at medical_degree or verification_status
            const hasCredentials = (doctorProfile?.medical_degree &&
              doctorProfile.medical_degree !== 'Not Specified' &&
              doctorProfile.medical_degree !== '') ||
              (doctorProfile?.verification_status === 'pending' &&
                doctorProfile?.medical_degree);
            console.log('Final has credentials check:', hasCredentials);
            return hasCredentials;
          })() ? (
            // Doctor has submitted credentials
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {doctorProfile?.is_verified ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span className="text-green-700 font-medium">Verified Doctor</span>
                  </>
                ) : doctorProfile?.verification_status === 'rejected' ? (
                  <>
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <span className="text-red-700 font-medium">Application Rejected</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-6 h-6 text-yellow-600" />
                    <span className="text-yellow-700 font-medium">Waiting for Confirmation</span>
                  </>
                )}
              </div>

              <div className={`p-4 rounded-lg border-l-4 ${doctorProfile?.is_verified
                  ? 'border-green-500 bg-green-50'
                  : doctorProfile?.verification_status === 'rejected'
                    ? 'border-red-500 bg-red-50'
                    : 'border-yellow-500 bg-yellow-50'
                }`}>
                <p className={`text-sm ${doctorProfile?.is_verified
                    ? 'text-green-800'
                    : doctorProfile?.verification_status === 'rejected'
                      ? 'text-red-800'
                      : 'text-yellow-800'
                  }`}>
                  {doctorProfile?.is_verified
                    ? '🎉 Congratulations! Your account is fully verified and you have access to all features.'
                    : doctorProfile?.verification_status === 'rejected'
                      ? '❌ Your application was rejected. Please contact support for more information or resubmit your credentials.'
                      : '⏳ Your credentials have been submitted and are under review by our admin team. You will be notified once the verification process is complete.'
                  }
                </p>
              </div>

              {/* Progress indicator for verification steps */}
              {!doctorProfile?.is_verified && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span>Verification Progress</span>
                    <span>
                      {doctorProfile?.verification_status === 'rejected' ? '0/3' :
                        doctorProfile?.verification_status === 'pending' ? '2/3' : '1/3'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${doctorProfile?.verification_status === 'rejected' ? 'bg-red-500 w-0' :
                          doctorProfile?.verification_status === 'pending' ? 'bg-yellow-500 w-2/3' :
                            'bg-blue-500 w-1/3'
                        }`}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Submitted</span>
                    <span>Under Review</span>
                    <span>Verified</span>
                  </div>
                </div>
              )}

              {doctorProfile?.verification_status === 'rejected' && (
                <button
                  onClick={() => window.location.href = '/doctor-portal/credentials'}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mt-4"
                >
                  Resubmit Your Credentials
                </button>
              )}
            </div>
          ) : (
            // Doctor hasn't submitted credentials yet
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                <span className="text-orange-700 font-medium">Pending Verification</span>
              </div>

              <div className="p-4 rounded-lg border-l-4 border-orange-500 bg-orange-50">
                <p className="text-sm text-orange-800">
                  <strong>Action Required:</strong> You need to submit your credentials for verification to be listed as a doctor and receive patient appointments.
                </p>
              </div>

              <button
                onClick={() => window.location.href = '/doctor-portal/credentials'}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Submit Your Credentials for Verification
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctor portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Doctor Portal</h2>
            <p className="text-sm text-gray-600">MediMitra Healthcare</p>
          </div>

          <nav className="mt-6">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-gray-50 transition-colors ${activeTab === item.id ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-700'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.id === 'messages' && stats.unreadMessages > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {stats.unreadMessages}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="mt-auto p-6 border-t border-gray-200">
            <button
              onClick={() => {
                signOut({ callbackUrl: '/' })
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'appointments' && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Appointments</h3>
                <p className="text-gray-500 mb-4">Manage your patient appointments</p>
                <a
                  href="/doctor-portal/appointments"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Appointments
                </a>
              </div>
            )}
            {activeTab === 'messages' && (
              <div className="h-full -m-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-full">
                  {/* Header */}
                  <div className="bg-white shadow-lg border-b border-gray-200">
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg mr-3 shadow-lg">
                            <MessageCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Patient Messages</h3>
                            <p className="text-sm text-gray-500">Communicate with your patients</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open('/doctor-portal/messaging', '_blank')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Open in New Tab
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages Content */}
                  <div className="p-6">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 h-[500px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <MessageCircle className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Patient Messages</h3>
                        <p className="text-gray-500 mb-4">Access your patient conversations</p>
                        <button
                          onClick={() => window.location.href = '/doctor-portal/messaging'}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Open Messages
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
