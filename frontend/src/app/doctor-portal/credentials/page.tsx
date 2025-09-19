'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  User,
  GraduationCap,
  Award,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Save,
  Camera
} from 'lucide-react'

interface DoctorCredentials {
  medicalDegree: string
  university: string
  graduationYear: string
  boardCertification: string
  additionalQualifications: string
  languages: string[]
  bio: string
  hospital: string
  consultationFee: number
  profilePicture: File | null
  verificationDocuments: File[]
}

export default function DoctorCredentialsPage() {
  const router = useRouter()
  const [credentials, setCredentials] = useState<DoctorCredentials>({
    medicalDegree: '',
    university: '',
    graduationYear: '',
    boardCertification: '',
    additionalQualifications: '',
    languages: [],
    bio: '',
    hospital: '',
    consultationFee: 0,
    profilePicture: null,
    verificationDocuments: []
  })
  const [currentLanguage, setCurrentLanguage] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  const handleInputChange = (field: keyof DoctorCredentials, value: any) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addLanguage = () => {
    if (currentLanguage.trim() && !credentials.languages.includes(currentLanguage.trim())) {
      setCredentials(prev => ({
        ...prev,
        languages: [...prev.languages, currentLanguage.trim()]
      }))
      setCurrentLanguage('')
    }
  }

  const removeLanguage = (language: string) => {
    setCredentials(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }))
  }

  const handleFileUpload = (field: 'profilePicture' | 'verificationDocuments', files: FileList | null) => {
    if (!files) return

    if (field === 'profilePicture') {
      setCredentials(prev => ({
        ...prev,
        profilePicture: files[0]
      }))
    } else {
      const newFiles = Array.from(files)
      setCredentials(prev => ({
        ...prev,
        verificationDocuments: [...prev.verificationDocuments, ...newFiles]
      }))
    }
  }

  const removeVerificationDocument = (index: number) => {
    setCredentials(prev => ({
      ...prev,
      verificationDocuments: prev.verificationDocuments.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('medicalDegree', credentials.medicalDegree)
      formData.append('university', credentials.university)
      formData.append('graduationYear', credentials.graduationYear)
      formData.append('boardCertification', credentials.boardCertification)
      formData.append('additionalQualifications', credentials.additionalQualifications)
      formData.append('languages', JSON.stringify(credentials.languages))
      formData.append('bio', credentials.bio)
      formData.append('hospital', credentials.hospital)
      formData.append('consultationFee', credentials.consultationFee.toString())

      if (credentials.profilePicture) {
        formData.append('profilePicture', credentials.profilePicture)
      }

      credentials.verificationDocuments.forEach((file, index) => {
        formData.append(`verificationDocument_${index}`, file)
      })

      const response = await fetch('/api/doctor-portal/credentials', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Credentials submitted successfully! Your application is now under review.')
        setMessageType('success')
        // Reset form
        setCredentials({
          medicalDegree: '',
          university: '',
          graduationYear: '',
          boardCertification: '',
          additionalQualifications: '',
          languages: [],
          bio: '',
          hospital: '',
          consultationFee: 0,
          profilePicture: null,
          verificationDocuments: []
        })
      } else {
        setMessage(data.message || 'Failed to submit credentials. Please try again.')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('An error occurred while submitting credentials. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Submit Your Credentials</h1>
                <p className="text-gray-600">Complete your professional profile for verification</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Verification Required</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Submit your credentials to be verified by our admin team. Once approved, you'll be able to receive patient appointments and access all doctor features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              messageType === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {messageType === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{message}</span>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <User className="w-6 h-6 mr-3 text-blue-600" />
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Medical Degree *
                </label>
                <select
                  value={credentials.medicalDegree}
                  onChange={(e) => handleInputChange('medicalDegree', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  required
                >
                  <option value="">Select your degree</option>
                  <option value="MBBS">MBBS (Bachelor of Medicine, Bachelor of Surgery)</option>
                  <option value="MD">MD (Doctor of Medicine)</option>
                  <option value="MS">MS (Master of Surgery)</option>
                  <option value="DM">DM (Doctorate of Medicine)</option>
                  <option value="MCh">MCh (Master of Chirurgiae)</option>
                  <option value="DNB">DNB (Diplomate of National Board)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  University/Institution *
                </label>
                <input
                  type="text"
                  value={credentials.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter your university name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Graduation Year *
                </label>
                <input
                  type="number"
                  value={credentials.graduationYear}
                  onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="e.g., 2020"
                  min="1950"
                  max="2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Board Certification
                </label>
                <input
                  type="text"
                  value={credentials.boardCertification}
                  onChange={(e) => handleInputChange('boardCertification', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="e.g., American Board of Internal Medicine"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Additional Qualifications
              </label>
              <textarea
                value={credentials.additionalQualifications}
                onChange={(e) => handleInputChange('additionalQualifications', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                rows={3}
                placeholder="List any additional certifications, fellowships, or specializations"
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Award className="w-6 h-6 mr-3 text-green-600" />
              Professional Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Hospital/Clinic
                </label>
                <input
                  type="text"
                  value={credentials.hospital}
                  onChange={(e) => handleInputChange('hospital', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Enter hospital or clinic name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Consultation Fee (BDT)
                </label>
                <input
                  type="number"
                  value={credentials.consultationFee}
                  onChange={(e) => handleInputChange('consultationFee', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="e.g., 1000"
                  min="0"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Professional Bio
              </label>
              <textarea
                value={credentials.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                rows={4}
                placeholder="Tell us about your experience, specializations, and approach to patient care"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Languages Spoken
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={currentLanguage}
                  onChange={(e) => setCurrentLanguage(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Add a language"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                />
                <button
                  type="button"
                  onClick={addLanguage}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {credentials.languages.map((language, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {language}
                    <button
                      type="button"
                      onClick={() => removeLanguage(language)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* File Uploads */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Upload className="w-6 h-6 mr-3 text-purple-600" />
              Documents & Photos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('profilePicture', e.target.files)}
                    className="hidden"
                    id="profile-picture"
                  />
                  <label
                    htmlFor="profile-picture"
                    className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {credentials.profilePicture ? credentials.profilePicture.name : 'Click to upload'}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Verification Documents
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleFileUpload('verificationDocuments', e.target.files)}
                    className="hidden"
                    id="verification-docs"
                  />
                  <label
                    htmlFor="verification-docs"
                    className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Upload Documents
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Upload degree certificates, licenses, etc.
                  </p>
                </div>
              </div>
            </div>

            {credentials.verificationDocuments.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Uploaded Documents:</h3>
                <div className="space-y-2">
                  {credentials.verificationDocuments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeVerificationDocument(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Submit Credentials
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

