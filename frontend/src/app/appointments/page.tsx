'use client'

import { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Search,
  Filter,
  Phone,
  Video,
  CheckCircle,
  XCircle,
  X,
  Mic,
  MicOff,
  Sparkles,
  Star,
  Users,
  Building2,
  Stethoscope,
  ChevronRight,
  ArrowLeft,
  Edit3,
  Trash2,
  Clock3,
  ChevronDown,
  Eye,
  Loader2
} from 'lucide-react'

// Types
interface Doctor {
  id: string
  userId: string
  licenseNumber: string
  specialization: string
  experience: number
  hospital: string
  consultationFee: number
  availability: string
  rating: number
  totalRatings: number
  // Optional AI enrichment fields
  aiConfidence?: number // 0.0 - 1.0
  aiReason?: string
  userInfo?: {
    id: string
    name: string
    email: string
    image?: string
  }
}

interface Appointment {
  id: string
  patientId: string
  doctorId: string
  dateTime: string
  duration: number
  type: string
  status: string
  notes?: string
  symptoms?: string
  diagnosis?: string
  prescription?: string
  fee: number
  createdAt: string
  updatedAt: string
}

interface BookAppointmentRequest {
  patientId: string
  doctorId: string
  date: string
  time: string
  duration: number
  type: string
  notes?: string
  symptoms?: string
}

export default function AppointmentsPage() {
  const [searchType, setSearchType] = useState('ai')
  const [isListening, setIsListening] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [manualFilters, setManualFilters] = useState({
    hospital: '',
    department: '',
    doctorName: ''
  })
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ day: string, time: string } | null>(null)
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [appointmentType, setAppointmentType] = useState('in-person')
  const [appointmentNotes, setAppointmentNotes] = useState('')
  const [appointmentSymptoms, setAppointmentSymptoms] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [patientAdvice, setPatientAdvice] = useState<any>(null)
  const [userAppointments, setUserAppointments] = useState<any[]>([])

  // Fetch doctors and user appointments on component mount
  useEffect(() => {
    fetchDoctors()
    fetchUserAppointments()
  }, [])

  const fetchDoctors = async () => {
    try {
      setLoading(true)

      // Try to fetch from backend
      try {
        const response = await fetch('http://localhost:8080/api/doctors')

        if (response.ok) {
          const data = await response.json()

          if (data.success && data.doctors) {
            setFilteredDoctors(data.doctors)
            console.log('✅ Fetched doctors from backend:', data.doctors.length)
            return
          } else {
            console.warn('⚠️ Backend returned no doctors:', data.message)
          }
        } else {
          console.warn(`⚠️ Backend HTTP error: ${response.status}`)
        }
      } catch (backendError) {
        console.warn('⚠️ Backend not accessible, using mock data:', backendError)
      }

      // Fallback: Use mock doctors data
      console.log('🔄 Using mock doctors data')
      const mockDoctors: Doctor[] = [
        {
          id: 'mock-1',
          userId: 'user-mock-1',
          licenseNumber: 'MD12345',
          specialization: 'Cardiology',
          experience: 15,
          hospital: 'Central Medical Hospital',
          consultationFee: 150,
          availability: 'Available',
          rating: 4.8,
          totalRatings: 25,
          userInfo: {
            id: 'user-mock-1',
            name: 'Dr. John Smith',
            email: 'dr.smith@medimitra.com',
            image: null
          }
        },
        {
          id: 'mock-2',
          userId: 'user-mock-2',
          licenseNumber: 'MD67890',
          specialization: 'Dermatology',
          experience: 12,
          hospital: 'Skin Care Center',
          consultationFee: 120,
          availability: 'Available',
          rating: 4.6,
          totalRatings: 18,
          userInfo: {
            id: 'user-mock-2',
            name: 'Dr. Sarah Johnson',
            email: 'dr.johnson@medimitra.com',
            image: null
          }
        },
        {
          id: 'mock-3',
          userId: 'user-mock-3',
          licenseNumber: 'MD11111',
          specialization: 'Neurology',
          experience: 20,
          hospital: 'Brain Health Institute',
          consultationFee: 180,
          availability: 'Available',
          rating: 4.9,
          totalRatings: 32,
          userInfo: {
            id: 'user-mock-3',
            name: 'Dr. Michael Brown',
            email: 'dr.brown@medimitra.com',
            image: null
          }
        },
        {
          id: 'mock-4',
          userId: 'user-mock-4',
          licenseNumber: 'MD22222',
          specialization: 'Orthopedics',
          experience: 18,
          hospital: 'Sports Medicine Center',
          consultationFee: 160,
          availability: 'Available',
          rating: 4.7,
          totalRatings: 28,
          userInfo: {
            id: 'user-mock-4',
            name: 'Dr. Emily Davis',
            email: 'dr.davis@medimitra.com',
            image: null
          }
        },
        {
          id: 'mock-5',
          userId: 'user-mock-5',
          licenseNumber: 'MD33333',
          specialization: 'Pediatrics',
          experience: 10,
          hospital: 'Children\'s Hospital',
          consultationFee: 100,
          availability: 'Available',
          rating: 4.8,
          totalRatings: 22,
          userInfo: {
            id: 'user-mock-5',
            name: 'Dr. Lisa Wilson',
            email: 'dr.wilson@medimitra.com',
            image: null
          }
        }
      ]

      setFilteredDoctors(mockDoctors)

    } catch (error) {
      console.error('❌ Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserAppointments = async () => {
    try {
      // First try to get user ID from profile
      let userId = null
      try {
        const response = await fetch('/api/profile')
        const data = await response.json()
        
        if (data.success && data.user?.id) {
          userId = data.user.id
        }
      } catch (profileError) {
        console.warn('Profile fetch failed:', profileError)
        // For now, skip appointment fetch if profile fails
        setUserAppointments([])
        return
      }

      if (userId && userId !== 'temp-id') {
        // Fetch user's appointments
        try {
          const appointmentsResponse = await fetch(`http://localhost:8080/api/appointments/patient/${userId}`)
          const appointmentsData = await appointmentsResponse.json()
          
          if (appointmentsData.success) {
            setUserAppointments(appointmentsData.appointments || [])
          } else {
            console.warn('Failed to fetch appointments:', appointmentsData.message)
            setUserAppointments([])
          }
        } catch (appointmentError) {
          console.warn('Appointment fetch failed:', appointmentError)
          setUserAppointments([])
        }
      } else {
        console.warn('No valid user ID available, skipping appointment fetch')
        setUserAppointments([])
      }
    } catch (error) {
      console.error('Error fetching user appointments:', error)
      setUserAppointments([])
    }
  }

  const isDoctorBooked = (doctorId: string) => {
    return userAppointments.some(appointment => 
      appointment.doctorId === doctorId && 
      appointment.status === 'scheduled'
    )
  }

  // AI search functionality
  const handleAISearch = async () => {
    if (!aiQuery.trim()) {
      // If no query, show all doctors
      setPatientAdvice(null)
      fetchDoctors()
      return
    }

    try {
      setLoading(true)

      // Try backend AI search first
      try {
        const response = await fetch('http://localhost:8080/api/doctors/ai-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ symptoms: aiQuery }),
        })

        if (response.ok) {
          const data = await response.json()

          if (data.success && data.doctors && data.doctors.length > 0) {
            // If multiple doctors are returned, show only those with aiConfidence > 0.5
            let doctors = data.doctors as Doctor[]
            if (doctors.length > 1) {
              const confident = doctors.filter(d =>
                typeof (d as any).aiConfidence === 'number' ? (d as any).aiConfidence >= 0.5 : true
              )
              // Only apply the filter if it leaves at least one doctor; otherwise, keep original list
              if (confident.length > 0) {
                doctors = confident
              }
            }
            setFilteredDoctors(doctors)
            setPatientAdvice(data.patientAdvice || null)
            console.log('✅ AI Analysis successful:', data.analysis)
            console.log('✅ Patient advice received:', data.patientAdvice)
            return // Success, exit early
          } else {
            console.warn('⚠️ AI search returned no doctors:', data.message)
          }
        } else {
          console.warn(`⚠️ AI search HTTP error: ${response.status}`)
        }
      } catch (backendError) {
        console.warn('⚠️ Backend AI search failed, using fallback:', backendError)
      }

      // Fallback: Intelligent local search based on symptoms
      console.log('🔄 Using intelligent fallback search for:', aiQuery)
      const filtered = performLocalAISearch(aiQuery)
      setFilteredDoctors(filtered)

    } catch (error) {
      console.error('❌ Error in AI search:', error)
      // Final fallback: simple text search
      const filtered = filteredDoctors.filter(doctor =>
        doctor.userInfo?.name.toLowerCase().includes(aiQuery.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(aiQuery.toLowerCase())
      )
      setFilteredDoctors(filtered)
    } finally {
      setLoading(false)
    }
  }

  // Intelligent local search fallback
  const performLocalAISearch = (symptoms: string): Doctor[] => {
    const symptomsLower = symptoms.toLowerCase()

    // Define symptom-to-specialization mapping (simplified version of backend logic)
    const symptomMapping: { [key: string]: string[] } = {
      'chest pain': ['Cardiology', 'Cardiothoracic Surgery', 'Emergency Medicine', 'Critical Care Medicine'],
      'heart': ['Cardiology', 'Cardiothoracic Surgery'],
      'breathing': ['Cardiology', 'Cardiothoracic Surgery', 'Pulmonology'],
      'shortness of breath': ['Cardiology', 'Cardiothoracic Surgery', 'Pulmonology'],
      'skin': ['Dermatology'],
      'rash': ['Dermatology'],
      'acne': ['Dermatology'],
      'headache': ['Neurology', 'Internal Medicine'],
      'migraine': ['Neurology'],
      'dizziness': ['Neurology', 'Cardiology'],
      'back pain': ['Orthopedics', 'Physical Medicine'],
      'joint': ['Orthopedics', 'Rheumatology'],
      'knee': ['Orthopedics'],
      'shoulder': ['Orthopedics'],
      'neck pain': ['Orthopedics'],
      'cough': ['Pulmonology', 'Internal Medicine'],
      'asthma': ['Pulmonology'],
      'stomach': ['Gastroenterology'],
      'nausea': ['Gastroenterology'],
      'vomiting': ['Gastroenterology'],
      'diarrhea': ['Gastroenterology'],
      'anxiety': ['Psychiatry', 'Psychology'],
      'depression': ['Psychiatry'],
      'stress': ['Psychiatry'],
      'panic': ['Psychiatry'],
      'child': ['Pediatrics'],
      'baby': ['Pediatrics'],
      'fever': ['Internal Medicine', 'Pediatrics'],
      'fatigue': ['Internal Medicine'],
      'diabetes': ['Endocrinology'],
      'thyroid': ['Endocrinology'],
      'allergy': ['Allergy and Immunology']
    }

    // Find relevant specializations
    const relevantSpecializations = new Set<string>()
    for (const [symptom, specializations] of Object.entries(symptomMapping)) {
      if (symptomsLower.includes(symptom)) {
        specializations.forEach(spec => relevantSpecializations.add(spec))
      }
    }

    // If no specific symptoms found, add common specializations
    if (relevantSpecializations.size === 0) {
      relevantSpecializations.add('Internal Medicine')
      relevantSpecializations.add('General Practice')
    }

    // Filter and score doctors
    const scoredDoctors = filteredDoctors.map(doctor => {
      let score = 0

      // Specialization match
      if (relevantSpecializations.has(doctor.specialization)) {
        score += 10
      }

      // Experience bonus
      score += Math.min(doctor.experience * 0.1, 2)

      // Rating bonus
      score += doctor.rating * 0.5

      // Review count bonus
      score += Math.min(doctor.totalRatings * 0.01, 1)

      return { doctor, score }
    })

    // Sort by score and return top results
    return scoredDoctors
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.doctor)
      .slice(0, 8) // Return top 8 matches
  }

  // Manual search filtering
  const applyManualFilters = () => {
    let filtered = [...filteredDoctors]

    if (manualFilters.hospital) {
      filtered = filtered.filter(doctor => doctor.hospital.toLowerCase().includes(manualFilters.hospital.toLowerCase()))
    }

    if (manualFilters.department) {
      filtered = filtered.filter(doctor => doctor.specialization === manualFilters.department)
    }

    if (manualFilters.doctorName) {
      filtered = filtered.filter(doctor =>
        doctor.userInfo?.name.toLowerCase().includes(manualFilters.doctorName.toLowerCase())
      )
    }

    setFilteredDoctors(filtered)
  }

  // Voice input simulation
  const toggleVoiceInput = () => {
    setIsListening(!isListening)
    if (!isListening) {
      // Simulate voice input
      setTimeout(() => {
        setAiQuery('I have chest pain and difficulty breathing')
        setIsListening(false)
      }, 2000)
    }
  }

  // Cancel appointment
  const handleCancelAppointment = async (doctorId: string) => {
    try {
      // Find the appointment to cancel
      const appointment = userAppointments.find(apt => 
        apt.doctorId === doctorId && apt.status === 'scheduled'
      )
      
      if (!appointment) {
        alert('No appointment found to cancel')
        return
      }

      const response = await fetch(`http://localhost:8080/api/appointments/${appointment.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      
      if (result.success) {
        alert('Appointment cancelled successfully!')
        // Refresh appointments
        await fetchUserAppointments()
      } else {
        alert('Failed to cancel appointment: ' + result.message)
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert('Failed to cancel appointment. Please try again.')
    }
  }

  // Book appointment
  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      alert('Please select a doctor, date, and time')
      return
    }

    setBookingLoading(true)
    try {
      // Get the actual user ID from the profile
      const profileResponse = await fetch('/api/profile')
      const profileData = await profileResponse.json()
      
      if (!profileData.success || !profileData.user?.id) {
        alert('Unable to get user information. Please try logging in again.')
        return
      }

      const appointmentData: BookAppointmentRequest = {
        patientId: profileData.user.id, // Use actual user ID
        doctorId: selectedDoctor.id,
        date: selectedDate,
        time: selectedTime,
        duration: 30,
        type: appointmentType,
        notes: appointmentNotes,
        symptoms: appointmentSymptoms
      }

      const response = await fetch('http://localhost:8080/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      })

      const result = await response.json()

      if (result.success) {
        setBookingSuccess(true)
        // Refresh user appointments to show the new booking
        fetchUserAppointments()
        setTimeout(() => {
          setShowBookingModal(false)
          setBookingSuccess(false)
          setSelectedDoctor(null)
          setSelectedDate('')
          setSelectedTime('')
          setAppointmentNotes('')
          setAppointmentSymptoms('')
        }, 2000)
      } else {
        alert('Failed to book appointment: ' + result.message)
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      alert('Failed to book appointment. Please try again.')
    } finally {
      setBookingLoading(false)
    }
  }

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = []
    const startHour = 9
    const endHour = 17

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const displayTime = hour < 12 ? `${hour === 0 ? 12 : hour}:${minute.toString().padStart(2, '0')} AM` :
          `${hour === 12 ? 12 : hour - 12}:${minute.toString().padStart(2, '0')} PM`
        slots.push({ time: timeString, display: displayTime })
      }
    }
    return slots
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 text-center">
            <div className="flex items-center justify-center mb-4">
              <Stethoscope className="w-12 h-12 mr-4 text-white" />
              <h1 className="text-4xl font-bold">Book Appointment</h1>
            </div>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Find the right doctor for your needs and book appointments instantly with our AI-powered search
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* My Appointments Section */}
        {userAppointments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Appointments</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {userAppointments.length} appointment{userAppointments.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-4">
              {userAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Dr. Haji Biryani</h3>
                        <p className="text-sm text-gray-600">Cardiothoracic Surgery</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">
                            {new Date(appointment.dateTime).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(appointment.dateTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                          <span className="text-sm text-gray-500">
                            {appointment.type === 'online' ? 'Video Call' : 'In-Person'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        appointment.status === 'scheduled' 
                          ? 'bg-blue-100 text-blue-800'
                          : appointment.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">${appointment.fee}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Search Section */}
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border-2 border-blue-100 p-8 mb-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Your Perfect Doctor</h2>
                <p className="text-gray-600">Choose your preferred search method</p>
              </div>

              {/* Search Type Toggle */}
              <div className="flex space-x-4 mb-6 justify-center">
                <button
                  onClick={() => {
                    setSearchType('ai')
                    setAiQuery('')
                    setPatientAdvice(null)
                  }}
                  className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${searchType === 'ai'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200'
                    }`}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI Smart Search
                </button>
                <button
                  onClick={() => {
                    setSearchType('manual')
                    setManualFilters({ hospital: '', department: '', doctorName: '' })
                    setPatientAdvice(null)
                    fetchDoctors() // Reset to show all doctors
                  }}
                  className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${searchType === 'manual'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg border border-gray-200'
                    }`}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Manual Search
                </button>
              </div>

              {/* AI Search */}
              {searchType === 'ai' && (
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="Describe your symptoms or health concerns in your own words. For example: 'I have chest pain and difficulty breathing' or 'Need skin checkup for acne'"
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900 placeholder:text-gray-500"
                      rows={3}
                    />
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="font-medium mb-1">💡 Try these examples:</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setAiQuery('I have chest pain and shortness of breath')}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-colors"
                        >
                          Chest pain
                        </button>
                        <button
                          onClick={() => setAiQuery('I have a skin rash that is itchy and red')}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-colors"
                        >
                          Skin rash
                        </button>
                        <button
                          onClick={() => setAiQuery('I have severe headaches and dizziness')}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-colors"
                        >
                          Headaches
                        </button>
                        <button
                          onClick={() => setAiQuery('I have back pain and joint stiffness')}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-colors"
                        >
                          Back pain
                        </button>
                        <button
                          onClick={() => setAiQuery('I feel anxious and have panic attacks')}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-colors"
                        >
                          Anxiety
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={toggleVoiceInput}
                      className={`absolute right-3 top-3 p-2 rounded-full transition-colors ${isListening
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </div>
                  <button
                    onClick={handleAISearch}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Sparkles className="w-6 h-6 mr-3" />
                    Find Doctors with AI
                  </button>
                </div>
              )}

              {/* Manual Search */}
              {searchType === 'manual' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hospital</label>
                      <input
                        type="text"
                        value={manualFilters.hospital}
                        onChange={(e) => setManualFilters({ ...manualFilters, hospital: e.target.value })}
                        placeholder="Enter hospital name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <select
                        value={manualFilters.department}
                        onChange={(e) => setManualFilters({ ...manualFilters, department: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                      >
                        <option value="">Select Department</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Pediatrics">Pediatrics</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name</label>
                      <input
                        type="text"
                        value={manualFilters.doctorName}
                        onChange={(e) => setManualFilters({ ...manualFilters, doctorName: e.target.value })}
                        placeholder="Enter doctor name"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  <button
                    onClick={applyManualFilters}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Search className="w-6 h-6 mr-3" />
                    Search Doctors
                  </button>
                </div>
              )}
            </div>

            {/* Patient Advice Section */}
            {patientAdvice && (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-lg border-2 border-green-200 p-6 mb-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">AI Health Advice</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        patientAdvice.urgency === 'high' 
                          ? 'bg-red-100 text-red-700' 
                          : patientAdvice.urgency === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {patientAdvice.urgency?.toUpperCase() || 'LOW'} PRIORITY
                      </span>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 mb-4 border border-green-200">
                      <p className="text-gray-800 leading-relaxed">{patientAdvice.briefAdvice}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patientAdvice.monitoring && (
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                            <Eye className="w-4 h-4 mr-2" />
                            Monitor For
                          </h4>
                          <p className="text-sm text-gray-700">{patientAdvice.monitoring}</p>
                        </div>
                      )}
                      
                      {patientAdvice.immediateSteps && (
                        <div className="bg-white rounded-lg p-4 border border-orange-200">
                          <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
                            <Clock3 className="w-4 h-4 mr-2" />
                            Immediate Steps
                          </h4>
                          <p className="text-sm text-gray-700">{patientAdvice.immediateSteps}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Doctors List */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Available Doctors
                  </h2>
                  <p className="text-gray-600 mt-1">Found {filteredDoctors.length} doctors matching your criteria</p>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading doctors...</span>
                </div>
              ) : filteredDoctors.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredDoctors.map((doctor) => (
                    <div key={doctor.id} className="group bg-gradient-to-r from-white to-blue-50 border-2 border-gray-200 hover:border-blue-300 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-6">
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-blue-200 transition-colors">
                            <User className="w-10 h-10 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{doctor.userInfo?.name || 'Dr. Unknown'}</h3>
                            <p className="text-purple-600 font-semibold text-lg mb-3">{doctor.specialization}</p>
                            <div className="flex items-center space-x-6 mb-3">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600 font-medium">{doctor.experience} years experience</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-700 font-medium">{doctor.rating} ({doctor.totalRatings} reviews)</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600 font-medium">{doctor.hospital}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">${doctor.consultationFee}</div>
                          <div className="text-sm text-gray-600 font-medium">Consultation Fee</div>
                          {isDoctorBooked(doctor.id) && (
                            <div className="mt-2 flex items-center justify-end space-x-1">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-xs text-green-600 font-medium">Booked</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-600 font-medium">Available today at 2:00 PM</span>
                        </div>
                        {isDoctorBooked(doctor.id) ? (
                          <button
                            onClick={() => handleCancelAppointment(doctor.id)}
                            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <X className="w-5 h-5 mr-2" />
                            Cancel Appointment
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedDoctor(doctor)
                              setShowBookingModal(true)
                            }}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <Calendar className="w-5 h-5 mr-2" />
                            Book Appointment
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Stats Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border-2 border-purple-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Healthcare Network</h3>
                <div className="space-y-4">
                  <div className="group bg-blue-50 hover:bg-blue-100 rounded-xl p-4 transition-colors border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-200 rounded-lg group-hover:bg-blue-300 transition-colors">
                          <Building2 className="w-5 h-5 text-blue-700" />
                        </div>
                        <span className="text-sm font-semibold text-blue-900">Partner Hospitals</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-700">3</span>
                    </div>
                  </div>
                  <div className="group bg-green-50 hover:bg-green-100 rounded-xl p-4 transition-colors border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-200 rounded-lg group-hover:bg-green-300 transition-colors">
                          <Users className="w-5 h-5 text-green-700" />
                        </div>
                        <span className="text-sm font-semibold text-green-900">Available Doctors</span>
                      </div>
                      <span className="text-2xl font-bold text-green-700">{filteredDoctors.length}+</span>
                    </div>
                  </div>
                  <div className="group bg-purple-50 hover:bg-purple-100 rounded-xl p-4 transition-colors border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-200 rounded-lg group-hover:bg-purple-300 transition-colors">
                          <Clock className="w-5 h-5 text-purple-700" />
                        </div>
                        <span className="text-sm font-semibold text-purple-900">Emergency Support</span>
                      </div>
                      <span className="text-2xl font-bold text-purple-700">24/7</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-xl border-2 border-orange-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">💡 Quick Tips</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                    <p className="text-gray-700">Use AI search to describe your symptoms naturally</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                    <p className="text-gray-700">Book appointments up to 30 days in advance</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                    <p className="text-gray-700">Video consultations available for follow-ups</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Appointment Booked!</h3>
                  <p className="text-gray-600">Your appointment has been successfully scheduled.</p>
                </div>
              ) : (
                <>
                  {/* Doctor Info */}
                  <div className="flex items-start space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedDoctor.userInfo?.name || 'Dr. Unknown'}</h3>
                      <p className="text-blue-600">{selectedDoctor.specialization}</p>
                      <p className="text-gray-600 text-sm">{selectedDoctor.hospital}</p>
                      <p className="text-gray-900 font-semibold">Consultation Fee: ${selectedDoctor.consultationFee}</p>
                    </div>
                  </div>

                  {/* Date and Time Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                      >
                        <option value="">Select Time</option>
                        {generateTimeSlots().map((slot) => (
                          <option key={slot.time} value={slot.display}>
                            {slot.display}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Appointment Type */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Appointment Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setAppointmentType('in-person')}
                        className={`p-4 border rounded-lg text-left transition-colors ${appointmentType === 'in-person'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Users className="w-5 h-5" />
                          <div>
                            <div className="font-medium">In-Person</div>
                            <div className="text-sm text-gray-600">Visit doctor's chamber</div>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => setAppointmentType('online')}
                        className={`p-4 border rounded-lg text-left transition-colors ${appointmentType === 'online'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Video className="w-5 h-5" />
                          <div>
                            <div className="font-medium">Video Call</div>
                            <div className="text-sm text-gray-600">Online consultation</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit (Optional)</label>
                      <textarea
                        value={appointmentNotes}
                        onChange={(e) => setAppointmentNotes(e.target.value)}
                        placeholder="Briefly describe your health concern or reason for this appointment..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900 placeholder:text-gray-500"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms (Optional)</label>
                      <textarea
                        value={appointmentSymptoms}
                        onChange={(e) => setAppointmentSymptoms(e.target.value)}
                        placeholder="Describe any symptoms you're experiencing..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900 placeholder:text-gray-500"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowBookingModal(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBookAppointment}
                      disabled={bookingLoading || !selectedDate || !selectedTime}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {bookingLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        'Book Appointment'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}