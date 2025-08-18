'use client'

import { useState } from 'react'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Plus, 
  Search,
  Filter,
  Phone,
  Video,
  CheckCircle,
  XCircle,
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
  X,
  Eye
} from 'lucide-react'

// Mock data
const hospitals = [
  {
    id: 1,
    name: 'City General Hospital',
    location: 'Downtown Medical District',
    departments: ['Cardiology', 'Neurology', 'Oncology', 'Emergency', 'Pediatrics']
  },
  {
    id: 2,
    name: 'MediCare Center',
    location: 'Uptown Health Complex',
    departments: ['Dermatology', 'Orthopedics', 'General Medicine', 'ENT']
  },
  {
    id: 3,
    name: 'Wellness Hospital',
    location: 'East Side Medical Hub',
    departments: ['Psychiatry', 'Gastroenterology', 'Ophthalmology', 'Radiology']
  }
]

const doctors = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    department: 'Cardiology',
    hospital: 'City General Hospital',
    hospitalId: 1,
    rating: 4.8,
    reviewCount: 156,
    experience: '15 years',
    education: 'MD - Harvard Medical School',
    languages: ['English', 'Spanish'],
    specializations: ['Heart Surgery', 'Interventional Cardiology', 'Echocardiography'],
    consultationFee: 150,
    location: 'City General Hospital, Room 204',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
    shifts: [
      { day: 'Monday', times: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
      { day: 'Tuesday', times: ['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'] },
      { day: 'Wednesday', times: ['10:00 AM', '11:00 AM', '2:00 PM'] },
      { day: 'Friday', times: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'] }
    ],
    aboutText: 'Dr. Sarah Johnson is a leading cardiologist with over 15 years of experience in treating complex heart conditions. She specializes in minimally invasive cardiac procedures and has performed over 2000 successful surgeries.',
    conditions: ['Heart Disease', 'Hypertension', 'Arrhythmia', 'Heart Failure', 'Chest Pain']
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialty: 'Dermatology',
    department: 'Dermatology',
    hospital: 'MediCare Center',
    hospitalId: 2,
    rating: 4.9,
    reviewCount: 203,
    experience: '12 years',
    education: 'MD - Johns Hopkins University',
    languages: ['English', 'Mandarin'],
    specializations: ['Skin Cancer Treatment', 'Cosmetic Dermatology', 'Pediatric Dermatology'],
    consultationFee: 120,
    location: 'MediCare Center, Suite 301',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    availableDays: ['Monday', 'Wednesday', 'Thursday', 'Saturday'],
    shifts: [
      { day: 'Monday', times: ['10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
      { day: 'Wednesday', times: ['9:00 AM', '10:00 AM', '11:00 AM', '4:00 PM'] },
      { day: 'Thursday', times: ['10:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'] },
      { day: 'Saturday', times: ['9:00 AM', '10:00 AM', '11:00 AM'] }
    ],
    aboutText: 'Dr. Michael Chen is a board-certified dermatologist known for his expertise in both medical and cosmetic dermatology. He has published numerous research papers on innovative skin treatments.',
    conditions: ['Acne', 'Eczema', 'Psoriasis', 'Skin Cancer', 'Rosacea', 'Hair Loss']
  },
  {
    id: 3,
    name: 'Dr. Emily Davis',
    specialty: 'General Medicine',
    department: 'General Medicine',
    hospital: 'MediCare Center',
    hospitalId: 2,
    rating: 4.7,
    reviewCount: 89,
    experience: '8 years',
    education: 'MD - Stanford University',
    languages: ['English', 'French'],
    specializations: ['Preventive Care', 'Chronic Disease Management', 'Health Screenings'],
    consultationFee: 100,
    location: 'MediCare Center, Room 105',
    image: 'https://images.unsplash.com/photo-1594824475546-7da6ba09d5c4?w=150&h=150&fit=crop&crop=face',
    availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    shifts: [
      { day: 'Tuesday', times: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM'] },
      { day: 'Wednesday', times: ['9:00 AM', '2:00 PM', '3:00 PM'] },
      { day: 'Thursday', times: ['10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'] },
      { day: 'Friday', times: ['9:00 AM', '10:00 AM', '11:00 AM'] }
    ],
    aboutText: 'Dr. Emily Davis is a compassionate family physician who focuses on comprehensive primary care and preventive medicine. She believes in building long-term relationships with her patients.',
    conditions: ['Annual Checkups', 'Cold & Flu', 'Diabetes', 'High Blood Pressure', 'Vaccinations']
  },
  {
    id: 4,
    name: 'Dr. James Wilson',
    specialty: 'Neurology',
    department: 'Neurology',
    hospital: 'City General Hospital',
    hospitalId: 1,
    rating: 4.9,
    reviewCount: 127,
    experience: '20 years',
    education: 'MD, PhD - Mayo Clinic',
    languages: ['English'],
    specializations: ['Stroke Treatment', 'Epilepsy', 'Movement Disorders', 'Headache Medicine'],
    consultationFee: 200,
    location: 'City General Hospital, Neurology Wing',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    shifts: [
      { day: 'Monday', times: ['10:00 AM', '11:00 AM', '2:00 PM'] },
      { day: 'Tuesday', times: ['9:00 AM', '10:00 AM', '3:00 PM', '4:00 PM'] },
      { day: 'Thursday', times: ['9:00 AM', '10:00 AM', '11:00 AM'] },
      { day: 'Friday', times: ['2:00 PM', '3:00 PM', '4:00 PM'] }
    ],
    aboutText: 'Dr. James Wilson is a renowned neurologist with extensive experience in treating complex neurological disorders. He leads the stroke center and has pioneered several treatment protocols.',
    conditions: ['Headaches', 'Epilepsy', 'Stroke', 'Memory Problems', 'Parkinson\'s Disease']
  }
]

const upcomingAppointments = [
  {
    id: 1,
    doctor: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    date: 'Dec 10, 2024',
    time: '2:30 PM',
    type: 'In-person',
    status: 'Confirmed',
    location: 'City General Hospital',
    queueNumber: 3,
    estimatedWaitTime: '25-30 minutes',
    appointmentId: 'APT001'
  },
  {
    id: 2,
    doctor: 'Dr. Michael Chen',
    specialty: 'Dermatology',
    date: 'Dec 12, 2024',
    time: '10:00 AM',
    type: 'Video Call',
    status: 'Pending',
    location: 'Online',
    queueNumber: 1,
    estimatedWaitTime: '5-10 minutes',
    appointmentId: 'APT002'
  }
]

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState('book') // book, manage
  const [searchType, setSearchType] = useState('ai') // ai, manual
  const [isListening, setIsListening] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [manualFilters, setManualFilters] = useState({
    hospital: '',
    department: '',
    doctorName: ''
  })
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [filteredDoctors, setFilteredDoctors] = useState(doctors)
  const [showFilters, setShowFilters] = useState(false)

  // AI Search suggestions based on symptoms
  const getAISuggestions = (query) => {
    const suggestions = {
      'chest pain': ['Cardiology'],
      'heart': ['Cardiology'],
      'skin': ['Dermatology'],
      'acne': ['Dermatology'],
      'headache': ['Neurology', 'General Medicine'],
      'fever': ['General Medicine'],
      'cold': ['General Medicine'],
      'depression': ['Psychiatry'],
      'anxiety': ['Psychiatry'],
      'eye': ['Ophthalmology'],
      'vision': ['Ophthalmology']
    }
    
    const lowerQuery = query.toLowerCase()
    let suggestedSpecialties = []
    
    for (const [symptom, specialties] of Object.entries(suggestions)) {
      if (lowerQuery.includes(symptom)) {
        suggestedSpecialties.push(...specialties)
      }
    }
    
    return [...new Set(suggestedSpecialties)]
  }

  // Filter doctors based on AI suggestions
  const handleAISearch = () => {
    if (!aiQuery.trim()) {
      setFilteredDoctors(doctors)
      return
    }
    
    const suggestedSpecialties = getAISuggestions(aiQuery)
    if (suggestedSpecialties.length > 0) {
      const filtered = doctors.filter(doctor => 
        suggestedSpecialties.includes(doctor.specialty) ||
        doctor.conditions.some(condition => 
          condition.toLowerCase().includes(aiQuery.toLowerCase())
        )
      )
      setFilteredDoctors(filtered)
    } else {
      // Fallback to general search
      const filtered = doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(aiQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(aiQuery.toLowerCase()) ||
        doctor.conditions.some(condition => 
          condition.toLowerCase().includes(aiQuery.toLowerCase())
        )
      )
      setFilteredDoctors(filtered)
    }
  }

  // Manual search filtering
  const handleManualSearch = () => {
    let filtered = doctors

    if (manualFilters.hospital) {
      filtered = filtered.filter(doctor => doctor.hospitalId === parseInt(manualFilters.hospital))
    }
    
    if (manualFilters.department) {
      filtered = filtered.filter(doctor => doctor.department === manualFilters.department)
    }
    
    if (manualFilters.doctorName) {
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(manualFilters.doctorName.toLowerCase())
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
        setAiQuery("I have been experiencing chest pain and shortness of breath")
        setIsListening(false)
      }, 2000)
    }
  }

  // Get available departments for selected hospital
  const getAvailableDepartments = () => {
    if (!manualFilters.hospital) return []
    const hospital = hospitals.find(h => h.id === parseInt(manualFilters.hospital))
    return hospital ? hospital.departments : []
  }

  return (
    <div className="min-h-screen">
      <main className="py-2">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointments</h1>
          <p className="text-gray-600">Find doctors, book appointments, and manage your healthcare</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('book')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === 'book'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Book Appointment
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              activeTab === 'manage'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Manage Appointments
          </button>
        </div>

        {activeTab === 'book' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Search Section */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Find Your Doctor</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSearchType('ai')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        searchType === 'ai'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 inline mr-2" />
                      AI Search
                    </button>
                    <button
                      onClick={() => setSearchType('manual')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        searchType === 'manual'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Search className="w-4 h-4 inline mr-2" />
                      Manual Search
                    </button>
                  </div>
                </div>

                {searchType === 'ai' && (
                  <div className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        placeholder="Describe your symptoms or health concerns in your own words. For example: 'I have chest pain and difficulty breathing' or 'Need skin checkup for acne'"
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-500"
                        rows={3}
                      />
                      <button
                        onClick={toggleVoiceInput}
                        className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all ${
                          isListening
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {isListening && (
                      <div className="flex items-center space-x-2 text-red-600">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                        <span className="text-sm">Listening... Speak now</span>
                      </div>
                    )}

                    <button
                      onClick={handleAISearch}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Find Doctors with AI</span>
                    </button>

                    {aiQuery && getAISuggestions(aiQuery).length > 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800 mb-2">AI suggests these specialties:</p>
                        <div className="flex flex-wrap gap-2">
                          {getAISuggestions(aiQuery).map((specialty, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {searchType === 'manual' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
                        <select
                          value={manualFilters.hospital}
                          onChange={(e) => setManualFilters({...manualFilters, hospital: e.target.value, department: ''})}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Hospitals</option>
                          {hospitals.map(hospital => (
                            <option key={hospital.id} value={hospital.id}>{hospital.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select
                          value={manualFilters.department}
                          onChange={(e) => setManualFilters({...manualFilters, department: e.target.value})}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Departments</option>
                          {getAvailableDepartments().map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
                        <input
                          type="text"
                          value={manualFilters.doctorName}
                          onChange={(e) => setManualFilters({...manualFilters, doctorName: e.target.value})}
                          placeholder="Search by name..."
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={handleManualSearch}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search Doctors</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Results */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Available Doctors ({filteredDoctors.length})
                  </h3>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {showFilters && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Available Today</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Video Consultation</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Highly Rated (4.5+)</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {filteredDoctors.map((doctor) => (
                    <div key={doctor.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                      <div className="flex items-start space-x-4">
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                              <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm text-gray-600">{doctor.experience} experience</span>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="text-sm font-medium text-gray-900">{doctor.rating}</span>
                                  <span className="text-sm text-gray-600">({doctor.reviewCount} reviews)</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 mt-2">
                                <Building2 className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-600">{doctor.hospital}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900">${doctor.consultationFee}</div>
                              <div className="text-sm text-gray-600">Consultation</div>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2">Specializations:</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {doctor.specializations.slice(0, 3).map((spec, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setSelectedDoctor(doctor)}
                                className="flex items-center space-x-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Profile</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedDoctor(doctor)
                                  setShowBookingModal(true)
                                }}
                                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <Calendar className="w-4 h-4" />
                                <span>Book Appointment</span>
                              </button>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>Next available: Today 2:00 PM</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{hospitals.length}</div>
                    <div className="text-sm text-gray-600">Partner Hospitals</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{doctors.length}+</div>
                    <div className="text-sm text-gray-600">Available Doctors</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">24/7</div>
                    <div className="text-sm text-gray-600">Emergency Support</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Our AI assistant can help you find the right doctor based on your symptoms.
                </p>
                <button className="w-full bg-white bg-opacity-20 text-white py-2 rounded-lg hover:bg-opacity-30 transition-colors">
                  Chat with AI Assistant
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Appointments */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Appointments</h2>
                
                <div className="space-y-6">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{appointment.doctor}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'Confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{appointment.specialty}</p>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-600">{appointment.date}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-600">{appointment.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-600">{appointment.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-600">Queue #{appointment.queueNumber}</span>
                            </div>
                          </div>

                          <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Clock3 className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">
                                Estimated wait time: {appointment.estimatedWaitTime}
                              </span>
                            </div>
                            <p className="text-xs text-blue-600 mt-1">
                              You are #{appointment.queueNumber} in the queue. Arrive 15 minutes early.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <button className="flex items-center space-x-2 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                            <Edit3 className="w-4 h-4" />
                            <span>Reschedule</span>
                          </button>
                          <button className="flex items-center space-x-2 px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Appointment ID: {appointment.appointmentId}</span>
                          <div className="flex space-x-2">
                            {appointment.type === 'Video Call' && (
                              <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                <Video className="w-4 h-4" />
                                <span>Join Call</span>
                              </button>
                            )}
                            <button className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                              <MapPin className="w-4 h-4" />
                              <span>Get Directions</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Appointment History & Stats */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Stats</h3>
                <div className="space-y-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-gray-600">This Year</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">2</div>
                    <div className="text-sm text-gray-600">Upcoming</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Plus className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Book New Appointment</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span className="font-medium">View Calendar</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Appointment History</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Doctor Profile Modal */}
        {selectedDoctor && !showBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={selectedDoctor.image}
                      alt={selectedDoctor.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedDoctor.name}</h2>
                      <p className="text-blue-600 font-semibold text-lg">{selectedDoctor.specialty}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="font-semibold">{selectedDoctor.rating}</span>
                          <span className="text-gray-600">({selectedDoctor.reviewCount} reviews)</span>
                        </div>
                        <span className="text-gray-600">{selectedDoctor.experience} experience</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDoctor(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">About</h3>
                      <p className="text-gray-600">{selectedDoctor.aboutText}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Education & Experience</h3>
                      <div className="space-y-2">
                        <p className="text-gray-600"><strong>Education:</strong> {selectedDoctor.education}</p>
                        <p className="text-gray-600"><strong>Experience:</strong> {selectedDoctor.experience}</p>
                        <p className="text-gray-600"><strong>Languages:</strong> {selectedDoctor.languages.join(', ')}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Specializations</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedDoctor.specializations.map((spec, index) => (
                          <span key={index} className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Conditions Treated</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedDoctor.conditions.map((condition, index) => (
                          <span key={index} className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
                            {condition}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Consultation Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Consultation Fee:</span>
                          <span className="font-semibold">${selectedDoctor.consultationFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Location:</span>
                          <span className="text-right">{selectedDoctor.location}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Available Schedule</h4>
                      <div className="space-y-2">
                        {selectedDoctor.shifts.map((shift, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="font-medium">{shift.day}:</span>
                            <span className="text-gray-600">
                              {shift.times.length > 0 ? `${shift.times.length} slots` : 'Unavailable'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setShowBookingModal(true)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Calendar className="w-5 h-5" />
                      <span>Book Appointment</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
                  <button
                    onClick={() => {
                      setShowBookingModal(false)
                      setSelectedSlot(null)
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex items-start space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={selectedDoctor.image}
                    alt={selectedDoctor.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{selectedDoctor.name}</h3>
                    <p className="text-blue-600">{selectedDoctor.specialty}</p>
                    <p className="text-gray-600 text-sm">{selectedDoctor.location}</p>
                    <p className="text-gray-900 font-semibold">Consultation Fee: ${selectedDoctor.consultationFee}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Select Date & Time</h3>
                    <div className="space-y-4">
                      {selectedDoctor.shifts.map((shift, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium mb-3">{shift.day}</h4>
                          <div className="grid grid-cols-3 gap-2">
                            {shift.times.map((time, timeIndex) => (
                              <button
                                key={timeIndex}
                                onClick={() => setSelectedSlot({ day: shift.day, time })}
                                className={`p-2 text-sm border rounded-lg transition-colors ${
                                  selectedSlot?.day === shift.day && selectedSlot?.time === time
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                                }`}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedSlot && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Appointment Summary</h4>
                      <div className="space-y-1 text-sm text-blue-800">
                        <p><strong>Date:</strong> {selectedSlot.day}</p>
                        <p><strong>Time:</strong> {selectedSlot.time}</p>
                        <p><strong>Estimated Queue Position:</strong> #2</p>
                        <p><strong>Estimated Wait Time:</strong> 15-20 minutes</p>
                        <p><strong>Total Fee:</strong> ${selectedDoctor.consultationFee}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Appointment Type</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <User className="w-6 h-6 text-blue-600" />
                          <div className="text-left">
                            <div className="font-medium">In-Person</div>
                            <div className="text-sm text-gray-600">Visit doctor's chamber</div>
                          </div>
                        </div>
                      </button>
                      <button className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Video className="w-6 h-6 text-purple-600" />
                          <div className="text-left">
                            <div className="font-medium">Video Call</div>
                            <div className="text-sm text-gray-600">Online consultation</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Visit (Optional)
                    </label>
                    <textarea
                      placeholder="Briefly describe your health concern or reason for this appointment..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setShowBookingModal(false)
                        setSelectedSlot(null)
                        setSelectedDoctor(null)
                      }}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!selectedSlot}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
