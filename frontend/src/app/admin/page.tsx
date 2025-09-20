'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  AlertCircle,
  Eye,
  Search,
  Filter
} from 'lucide-react'

interface PendingDoctor {
  id: string
  name: string
  email: string
  phone_number: string
  created_at: string
  license_number?: string
  specialization?: string
  medical_degree?: string
  university?: string
  graduation_year?: number
  board_certification?: string
  hospital?: string
  consultation_fee?: number
  bio?: string
  languages?: string
  additional_qualifications?: string
  verification_documents?: string
  verification_status?: string
}

interface VerificationStats {
  pending: number
  approved: number
  rejected: number
  total: number
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('pending')
  const [pendingDoctors, setPendingDoctors] = useState<PendingDoctor[]>([])
  const [verifiedDoctors, setVerifiedDoctors] = useState<PendingDoctor[]>([])
  const [stats, setStats] = useState<VerificationStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState<PendingDoctor | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load pending doctors
      const pendingResponse = await fetch('/api/admin/pending-doctors')
      const pendingData = await pendingResponse.json()
      if (pendingData.success) {
        setPendingDoctors(pendingData.pendingDoctors)
      }

      // Load verified doctors
      const verifiedResponse = await fetch('/api/admin/verified-doctors')
      const verifiedData = await verifiedResponse.json()
      if (verifiedData.success) {
        setVerifiedDoctors(verifiedData.verifiedDoctors)
      }

      // Load stats
      const statsResponse = await fetch('/api/admin/verification-stats')
      const statsData = await statsResponse.json()
      if (statsData.success) {
        setStats(statsData.stats)
      }
    } catch (error) {
      console.error('Failed to load admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyDoctor = async (userId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/verify-doctor/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          adminId: 'admin-1', // In real app, get from session
          rejectionReason: action === 'reject' ? rejectionReason : null
        }),
      })

      const data = await response.json()
      if (data.success) {
        setShowModal(false)
        setSelectedDoctor(null)
        setRejectionReason('')
        loadData() // Reload data
        alert(action === 'approve' ? 'Doctor approved successfully!' : 'Doctor rejected successfully!')
      } else {
        alert('Failed to verify doctor: ' + data.message)
      }
    } catch (error) {
      console.error('Failed to verify doctor:', error)
      alert('Failed to verify doctor')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Manage doctor verifications and system administration</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Verification</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
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
                <p className="text-gray-600 text-sm font-medium">Approved Doctors</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
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
                <p className="text-gray-600 text-sm font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
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
                <p className="text-gray-600 text-sm font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                Pending Verification ({stats.pending})
              </button>
              <button
                onClick={() => setActiveTab('verified')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'verified'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                Verified Doctors ({stats.approved})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'pending' && (
              <div className="space-y-4">
                {pendingDoctors.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No pending doctor verifications</p>
                  </div>
                ) : (
                  pendingDoctors.map((doctor) => (
                    <motion.div
                      key={doctor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <UserCheck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                              <p className="text-gray-600">{doctor.email}</p>
                              <p className="text-sm text-gray-500">
                                Applied on {formatDate(doctor.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Specialization</p>
                              <p className="text-sm text-gray-600">{doctor.specialization || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Medical Degree</p>
                              <p className="text-sm text-gray-600">{doctor.medical_degree || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">University</p>
                              <p className="text-sm text-gray-600">{doctor.university || 'Not specified'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedDoctor(doctor)
                              setShowModal(true)
                            }}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Review</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'verified' && (
              <div className="space-y-4">
                {verifiedDoctors.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No verified doctors yet</p>
                  </div>
                ) : (
                  verifiedDoctors.map((doctor) => (
                    <motion.div
                      key={doctor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                              <p className="text-gray-600">{doctor.email}</p>
                              <p className="text-sm text-green-600 font-medium">
                                ✓ Verified on {formatDate(doctor.verified_at || doctor.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">Specialization</p>
                              <p className="text-sm text-gray-600">{doctor.specialization || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">License Number</p>
                              <p className="text-sm text-gray-600">{doctor.license_number || 'Not specified'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Consultation Fee</p>
                              <p className="text-sm text-gray-600">${doctor.consultation_fee || 'Not specified'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Verification Modal */}
        {showModal && selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Doctor Application</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Name</p>
                    <p className="text-sm text-gray-900">{selectedDoctor.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-sm text-gray-900">{selectedDoctor.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <p className="text-sm text-gray-900">{selectedDoctor.phone_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Specialization</p>
                    <p className="text-sm text-gray-900">{selectedDoctor.specialization || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Medical Degree</p>
                    <p className="text-sm text-gray-900">{selectedDoctor.medical_degree || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">University</p>
                    <p className="text-sm text-gray-900">{selectedDoctor.university || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Graduation Year</p>
                    <p className="text-sm text-gray-900">{selectedDoctor.graduation_year || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Hospital</p>
                    <p className="text-sm text-gray-900">{selectedDoctor.hospital || 'Not specified'}</p>
                  </div>
                </div>

                {selectedDoctor.bio && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Bio</p>
                    <p className="text-sm text-gray-900">{selectedDoctor.bio}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason (if rejecting)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter reason for rejection..."
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => handleVerifyDoctor(selectedDoctor.id, 'approve')}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Approve Doctor
                  </button>
                  <button
                    onClick={() => handleVerifyDoctor(selectedDoctor.id, 'reject')}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setSelectedDoctor(null)
                      setRejectionReason('')
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}