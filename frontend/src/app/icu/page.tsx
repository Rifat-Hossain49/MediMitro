'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BedDouble,
  CalendarCheck,
  MapPin,
  Phone,
  Clock,
  User,
  Stethoscope,
  Heart,
  Activity,
  Monitor,
  X,
  Check,
  Star,
  AlertCircle,
  Users,
  Filter,
  Search,
  RefreshCw,
  Timer,
  Building,
  Plus,
  Minus,
  CreditCard,
  UserCheck
} from 'lucide-react'

interface Doctor {
  id: string
  name: string
  specialty: string
  experience: number
  rating: number
  availability: 'available' | 'busy' | 'off-duty'
}

interface Nurse {
  id: string
  name: string
  experience: number
  specialty: string
  shift: 'day' | 'night' | 'both'
  rating: number
}

interface ICUBed {
  id: string
  bedNumber: string
  type: 'general' | 'cardiac' | 'neuro' | 'pediatric'
  status: 'available' | 'occupied' | 'maintenance'
  pricePerDay: number
  facilities: string[]
}

interface Hospital {
  id: string
  name: string
  address: string
  phone: string
  distance: number
  rating: number
  totalBeds: number
  availableBeds: number
  facilities: string[]
  icuBeds: ICUBed[]
  doctors: Doctor[]
  nurses: Nurse[]
}

interface BookingDetails {
  patientName: string
  patientAge: string
  condition: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  admissionDate: string
  expectedDays: number
  selectedDoctor?: Doctor
  selectedNurses: Nurse[]
  emergencyContact: string
  emergencyPhone: string
}

export default function ICUReservationSystem() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [selectedBed, setSelectedBed] = useState<ICUBed | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    patientName: '',
    patientAge: '',
    condition: '',
    urgency: 'medium',
    admissionDate: '',
    expectedDays: 1,
    selectedNurses: [],
    emergencyContact: '',
    emergencyPhone: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Set mounted flag for client-side rendering
  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock data
  useEffect(() => {
    const mockHospitals: Hospital[] = [
      {
        id: '1',
        name: 'City General Hospital',
        address: '123 Medical Center Drive, Downtown',
        phone: '+1 (555) 123-4567',
        distance: 2.3,
        rating: 4.7,
        totalBeds: 24,
        availableBeds: 8,
        facilities: ['24/7 Emergency', 'Advanced Monitoring', 'Ventilator Support', 'Cardiac Care'],
        icuBeds: [
          {
            id: 'bed1',
            bedNumber: 'ICU-101',
            type: 'general',
            status: 'available',
            pricePerDay: 1200,
            facilities: ['Ventilator', 'Cardiac Monitor', 'Defibrillator', 'IV Pump']
          },
          {
            id: 'bed2',
            bedNumber: 'ICU-102',
            type: 'cardiac',
            status: 'available',
            pricePerDay: 1500,
            facilities: ['Advanced Cardiac Monitor', 'ECMO', 'Balloon Pump', 'Ventilator']
          },
          {
            id: 'bed3',
            bedNumber: 'ICU-103',
            type: 'neuro',
            status: 'available',
            pricePerDay: 1400,
            facilities: ['Neuro Monitor', 'ICP Monitor', 'Ventilator', 'EEG']
          }
        ],
        doctors: [
          {
            id: 'doc1',
            name: 'Dr. Sarah Johnson',
            specialty: 'Critical Care Medicine',
            experience: 12,
            rating: 4.9,
            availability: 'available'
          },
          {
            id: 'doc2',
            name: 'Dr. Michael Chen',
            specialty: 'Cardiothoracic Surgery',
            experience: 15,
            rating: 4.8,
            availability: 'available'
          }
        ],
        nurses: [
          {
            id: 'nurse1',
            name: 'Jennifer Martinez',
            experience: 8,
            specialty: 'Critical Care',
            shift: 'day',
            rating: 4.8
          },
          {
            id: 'nurse2',
            name: 'Robert Wilson',
            experience: 6,
            specialty: 'Cardiac Care',
            shift: 'night',
            rating: 4.6
          }
        ]
      },
      {
        id: '2',
        name: 'Mercy Medical Center',
        address: '456 Healthcare Boulevard, Midtown',
        phone: '+1 (555) 234-5678',
        distance: 4.1,
        rating: 4.5,
        totalBeds: 18,
        availableBeds: 3,
        facilities: ['Emergency Care', 'Advanced ICU', 'Surgical Services', 'Radiology'],
        icuBeds: [
          {
            id: 'bed4',
            bedNumber: 'ICU-201',
            type: 'general',
            status: 'available',
            pricePerDay: 1100,
            facilities: ['Ventilator', 'Monitor', 'IV Pump']
          },
          {
            id: 'bed5',
            bedNumber: 'ICU-202',
            type: 'pediatric',
            status: 'available',
            pricePerDay: 1300,
            facilities: ['Pediatric Ventilator', 'Specialized Monitor', 'Warmer']
          }
        ],
        doctors: [
          {
            id: 'doc4',
            name: 'Dr. David Park',
            specialty: 'Pulmonology',
            experience: 14,
            rating: 4.6,
            availability: 'available'
          }
        ],
        nurses: [
          {
            id: 'nurse4',
            name: 'Amanda Davis',
            experience: 7,
            specialty: 'Pediatric Care',
            shift: 'day',
            rating: 4.7
          }
        ]
      }
    ]
    setHospitals(mockHospitals)
  }, [])

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const refreshData = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 1000)
  }

  const handleBookBed = (hospital: Hospital, bed: ICUBed) => {
    setSelectedHospital(hospital)
    setSelectedBed(bed)
    setShowBookingModal(true)
  }

  const handleNurseSelection = (nurse: Nurse) => {
    setBookingDetails(prev => ({
      ...prev,
      selectedNurses: prev.selectedNurses.some(n => n.id === nurse.id)
        ? prev.selectedNurses.filter(n => n.id !== nurse.id)
        : [...prev.selectedNurses, nurse]
    }))
  }

  const calculateTotalCost = () => {
    if (!selectedBed) return 0
    const bedCost = selectedBed.pricePerDay * bookingDetails.expectedDays
    const nurseCost = bookingDetails.selectedNurses.length * 200 * bookingDetails.expectedDays
    return bedCost + nurseCost
  }

  const getBedTypeIcon = (type: string) => {
    switch (type) {
      case 'cardiac': return <Heart className="w-4 h-4 text-red-500" />
      case 'neuro': return <Activity className="w-4 h-4 text-purple-500" />
      case 'pediatric': return <Users className="w-4 h-4 text-blue-500" />
      default: return <BedDouble className="w-4 h-4 text-gray-500" />
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredHospitals = hospitals.filter(hospital => 
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-green-600 rounded-full">
              <BedDouble className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ICU Bed Reservation</h1>
          <p className="text-gray-600">Real-time ICU bed availability with specialist booking</p>
          
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Timer className="w-4 h-4" />
              <span>Last updated: {mounted ? lastUpdated.toLocaleTimeString() : '--:--:--'}</span>
            </div>
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </motion.div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search hospitals by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center"
          >
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2">{hospitals.length}</div>
            <div className="text-sm text-gray-600">Hospitals</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center"
          >
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
              <BedDouble className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {hospitals.reduce((sum, h) => sum + h.availableBeds, 0)}
            </div>
            <div className="text-sm text-gray-600">Available Beds</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center"
          >
            <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
              <Stethoscope className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {hospitals.reduce((sum, h) => sum + h.doctors.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Specialists</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center"
          >
            <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-4">
              <UserCheck className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {hospitals.reduce((sum, h) => sum + h.nurses.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Nurses</div>
          </motion.div>
        </div>

        {/* Hospital Cards */}
        <div className="space-y-6">
          {filteredHospitals.map((hospital) => (
            <motion.div
              key={hospital.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            >
              {/* Hospital Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{hospital.name}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-700">{hospital.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{hospital.address}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-600">{hospital.phone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{hospital.availableBeds}</div>
                    <div className="text-xs text-gray-600">Available Beds</div>
                  </div>
                </div>

                {/* Facilities */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Facilities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {hospital.facilities.map((facility, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Available ICU Beds */}
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <BedDouble className="w-5 h-5" />
                  <span>Available ICU Beds</span>
                </h4>
                
                {hospital.icuBeds.filter(bed => bed.status === 'available').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BedDouble className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No ICU beds currently available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hospital.icuBeds
                      .filter(bed => bed.status === 'available')
                      .map((bed) => (
                        <motion.div
                          key={bed.id}
                          whileHover={{ scale: 1.02 }}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {getBedTypeIcon(bed.type)}
                              <span className="font-semibold text-gray-900">{bed.bedNumber}</span>
                            </div>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {bed.type.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="text-lg font-bold text-green-600">
                              ${bed.pricePerDay}/day
                            </div>
                          </div>

                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Equipment:</h5>
                            <div className="flex flex-wrap gap-1">
                              {bed.facilities.map((facility, index) => (
                                <span key={index} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  {facility}
                                </span>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => handleBookBed(hospital, bed)}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                          >
                            <CalendarCheck className="w-4 h-4" />
                            <span>Reserve Bed</span>
              </button>
                        </motion.div>
                      ))}
                  </div>
                )}
            </div>
            </motion.div>
          ))}
        </div>

        {/* Booking Modal */}
        {showBookingModal && selectedHospital && selectedBed && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Reserve ICU Bed</h2>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Booking Form */}
                  <div className="space-y-6">
                    {/* Patient Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                          <input
                            type="text"
                            value={bookingDetails.patientName}
                            onChange={(e) => setBookingDetails(prev => ({ ...prev, patientName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                            placeholder="Enter patient name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                          <input
                            type="number"
                            value={bookingDetails.patientAge}
                            onChange={(e) => setBookingDetails(prev => ({ ...prev, patientAge: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                            placeholder="Age"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Medical Condition</label>
                          <textarea
                            value={bookingDetails.condition}
                            onChange={(e) => setBookingDetails(prev => ({ ...prev, condition: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                            placeholder="Describe the medical condition"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
                          <select
                            value={bookingDetails.urgency}
                            onChange={(e) => setBookingDetails(prev => ({ ...prev, urgency: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                          <span className={`inline-block mt-1 px-2 py-1 text-xs rounded ${getUrgencyColor(bookingDetails.urgency)}`}>
                            {bookingDetails.urgency.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Admission Date</label>
                          <input
                            type="datetime-local"
                            value={bookingDetails.admissionDate}
                            onChange={(e) => setBookingDetails(prev => ({ ...prev, admissionDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expected Stay: {bookingDetails.expectedDays} days
                          </label>
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => setBookingDetails(prev => ({ 
                                ...prev, 
                                expectedDays: Math.max(1, prev.expectedDays - 1) 
                              }))}
                              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="flex-1 text-center font-medium">{bookingDetails.expectedDays} days</span>
                            <button
                              onClick={() => setBookingDetails(prev => ({ 
                                ...prev, 
                                expectedDays: prev.expectedDays + 1 
                              }))}
                              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Doctor Selection */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Specialist Doctor</h3>
                      <div className="space-y-3">
                        {selectedHospital.doctors.map((doctor) => (
                          <motion.div
                            key={doctor.id}
                            whileHover={{ scale: 1.02 }}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              bookingDetails.selectedDoctor?.id === doctor.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setBookingDetails(prev => ({ ...prev, selectedDoctor: doctor }))}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                                <p className="text-sm text-gray-600">{doctor.specialty}</p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className="text-xs text-gray-500">{doctor.experience} years</span>
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    <span className="text-xs text-gray-600">{doctor.rating}</span>
                                  </div>
                                </div>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                doctor.availability === 'available' 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {doctor.availability}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Nurse Selection */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Nurses (Optional)</h3>
                      <div className="space-y-3">
                        {selectedHospital.nurses.map((nurse) => (
                          <motion.div
                            key={nurse.id}
                            whileHover={{ scale: 1.02 }}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              bookingDetails.selectedNurses.some(n => n.id === nurse.id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleNurseSelection(nurse)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900">{nurse.name}</h4>
                                <p className="text-sm text-gray-600">{nurse.specialty}</p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className="text-xs text-gray-500">{nurse.experience} years</span>
                                  <span className="text-xs text-gray-500">{nurse.shift} shift</span>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">+$200/day</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Summary */}
                  <div className="space-y-6">
                    {/* Booking Summary */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Hospital:</span>
                          <span className="font-semibold">{selectedHospital.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Bed:</span>
                          <span className="font-semibold">{selectedBed.bedNumber}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-semibold capitalize">{selectedBed.type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Daily Rate:</span>
                          <span className="font-semibold">${selectedBed.pricePerDay}</span>
                        </div>
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">ICU Bed ({bookingDetails.expectedDays} days):</span>
                          <span className="font-semibold">${selectedBed.pricePerDay * bookingDetails.expectedDays}</span>
                        </div>
                        {bookingDetails.selectedNurses.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Nurses ({bookingDetails.selectedNurses.length} × {bookingDetails.expectedDays} days):</span>
                            <span className="font-semibold">${bookingDetails.selectedNurses.length * 200 * bookingDetails.expectedDays}</span>
                          </div>
                        )}
                        <div className="border-t border-yellow-200 pt-3 flex items-center justify-between">
                          <span className="text-lg font-semibold text-gray-900">Total Cost:</span>
                          <span className="text-xl font-bold text-green-600">${calculateTotalCost()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-semibold"
                        onClick={() => {
                          alert('ICU bed reservation confirmed!')
                          setShowBookingModal(false)
                        }}
                      >
                        <CreditCard className="w-5 h-5" />
                        <span>Confirm Reservation - ${calculateTotalCost()}</span>
                      </button>
                      
                      <button
                        onClick={() => setShowBookingModal(false)}
                        className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}