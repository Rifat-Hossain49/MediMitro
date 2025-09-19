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
  status: 'available' | 'occupied' | 'maintenance' | 'reserved'
  pricePerDay: number
  facilities: string[]
  reservationInfo?: {
    patientName: string
    startTime: string
    endTime: string
    isReservedByCurrentUser?: boolean
  }
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
  const [isReserving, setIsReserving] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLoadingBeds, setIsLoadingBeds] = useState(true)

  // Set mounted flag for client-side rendering
  useEffect(() => {
    setMounted(true)
    fetchICUBeds()
  }, [])

  // Fetch ICU beds from backend
  const fetchICUBeds = async () => {
    setIsLoadingBeds(true)
    try {
      const response = await fetch('http://localhost:8080/api/icu-beds')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.beds) {
          // Convert backend data to frontend format
          const backendBeds = data.beds
          const hospitalMap = new Map()
          
          // Group beds by hospital
          backendBeds.forEach((bed: any) => {
            if (!hospitalMap.has(bed.hospital)) {
              hospitalMap.set(bed.hospital, {
                id: bed.hospital.toLowerCase().replace(/\s+/g, '-'),
                name: bed.hospital,
                address: bed.hospitalAddress || 'Address not available',
                phone: '+880-XXXX-XXXX',
                distance: Math.random() * 10 + 1,
                rating: 4.5 + Math.random() * 0.5,
                totalBeds: 0,
                availableBeds: 0,
                facilities: ['24/7 Emergency', 'Advanced ICU'],
                icuBeds: [],
                doctors: [],
                nurses: []
              })
            }
            
            const hospital = hospitalMap.get(bed.hospital)
            hospital.totalBeds++
            if (bed.status === 'available') {
              hospital.availableBeds++
            }
            
            hospital.icuBeds.push({
              id: bed.id,
              bedNumber: bed.bedNumber,
              type: bed.icuType,
              status: bed.status,
              pricePerDay: bed.dailyRate ? Math.round(bed.dailyRate) : 10000,
              facilities: bed.equipment ? JSON.parse(bed.equipment) : ['Basic Equipment'],
              reservationInfo: bed.status === 'reserved' ? {
                patientName: bed.patientName || 'Unknown Patient',
                startTime: bed.startTime || new Date().toISOString(),
                endTime: bed.endTime || new Date().toISOString(),
                isReservedByCurrentUser: bed.patientId === 'user-patient-1' // Demo user check
              } : undefined
            })
          })
          
          // Convert map to array and update state
          const hospitalsArray = Array.from(hospitalMap.values())
          setHospitals(hospitalsArray)
          console.log('✅ Fetched ICU beds from backend:', hospitalsArray.length, 'hospitals')
          console.log('✅ ICU beds data:', hospitalsArray)
        }
      } else {
        console.warn('⚠️ Backend ICU beds not accessible, using mock data')
      }
    } catch (error) {
      console.warn('⚠️ Error fetching ICU beds from backend, using mock data:', error)
    } finally {
      setIsLoadingBeds(false)
    }
  }

  // Mock data fallback (only used if backend fails)
  useEffect(() => {
    // Only load mock data if no hospitals are loaded from backend
    if (hospitals.length === 0) {
      const bangladeshHospitals: Hospital[] = [
      {
        id: '1',
        name: 'Dhaka Medical College Hospital',
        address: 'Bakshibazar, Dhaka 1000, Bangladesh',
        phone: '+880 2-7319002',
        distance: 2.1,
        rating: 4.6,
        totalBeds: 32,
        availableBeds: 12,
        facilities: ['24/7 Emergency', 'Advanced ICU', 'Ventilator Support', 'Cardiac Care', 'Neurosurgery'],
        icuBeds: [
          {
            id: 'bed1',
            bedNumber: 'ICU-A101',
            type: 'general',
            status: 'available',
            pricePerDay: 8000,
            facilities: ['Ventilator', 'Cardiac Monitor', 'Defibrillator', 'IV Pump']
          },
          {
            id: 'bed2',
            bedNumber: 'ICU-A102',
            type: 'cardiac',
            status: 'available',
            pricePerDay: 12000,
            facilities: ['Advanced Cardiac Monitor', 'ECMO', 'Balloon Pump', 'Ventilator']
          },
          {
            id: 'bed3',
            bedNumber: 'ICU-A103',
            type: 'neuro',
            status: 'available',
            pricePerDay: 10000,
            facilities: ['Neuro Monitor', 'ICP Monitor', 'Ventilator', 'EEG']
          },
          {
            id: 'bed4',
            bedNumber: 'ICU-A104',
            type: 'general',
            status: 'available',
            pricePerDay: 8000,
            facilities: ['Ventilator', 'Monitor', 'IV Pump', 'Dialysis Support']
          }
        ],
        doctors: [
          {
            id: 'doc1',
            name: 'Prof. Dr. Mohammad Shahidullah',
            specialty: 'Critical Care Medicine',
            experience: 25,
            rating: 4.8,
            availability: 'available'
          },
          {
            id: 'doc2',
            name: 'Dr. Rashida Begum',
            specialty: 'Cardiothoracic Surgery',
            experience: 18,
            rating: 4.7,
            availability: 'available'
          },
          {
            id: 'doc3',
            name: 'Dr. Aminul Islam',
            specialty: 'Neurosurgery',
            experience: 20,
            rating: 4.6,
            availability: 'available'
          }
        ],
        nurses: [
          {
            id: 'nurse1',
            name: 'Fatima Khatun',
            experience: 12,
            specialty: 'Critical Care',
            shift: 'day',
            rating: 4.7
          },
          {
            id: 'nurse2',
            name: 'Shahana Begum',
            experience: 9,
            specialty: 'Cardiac Care',
            shift: 'night',
            rating: 4.5
          },
          {
            id: 'nurse3',
            name: 'Nasreen Akter',
            experience: 15,
            specialty: 'ICU Nursing',
            shift: 'both',
            rating: 4.8
          }
        ]
      },
      {
        id: '2',
        name: 'Bangabandhu Sheikh Mujib Medical University Hospital',
        address: 'Shahbag, Dhaka 1000, Bangladesh',
        phone: '+880 2-9661064',
        distance: 3.2,
        rating: 4.8,
        totalBeds: 28,
        availableBeds: 8,
        facilities: ['24/7 Emergency', 'Advanced ICU', 'Cardiac Surgery', 'Neurosurgery', 'Transplant Unit'],
        icuBeds: [
          {
            id: 'bed5',
            bedNumber: 'BSMMU-ICU-201',
            type: 'cardiac',
            status: 'available',
            pricePerDay: 15000,
            facilities: ['Advanced Cardiac Monitor', 'ECMO', 'IABP', 'Ventilator', 'Dialysis']
          },
          {
            id: 'bed6',
            bedNumber: 'BSMMU-ICU-202',
            type: 'neuro',
            status: 'available',
            pricePerDay: 13000,
            facilities: ['Neuro Monitor', 'ICP Monitor', 'Ventilator', 'EEG', 'CT Scanner Access']
          },
          {
            id: 'bed7',
            bedNumber: 'BSMMU-ICU-203',
            type: 'general',
            status: 'available',
            pricePerDay: 10000,
            facilities: ['Ventilator', 'Monitor', 'IV Pump', 'CRRT']
          }
        ],
        doctors: [
          {
            id: 'doc4',
            name: 'Prof. Dr. Kanak Kanti Barua',
            specialty: 'Cardiac Surgery',
            experience: 30,
            rating: 4.9,
            availability: 'available'
          },
          {
            id: 'doc5',
            name: 'Prof. Dr. Quazi Deen Mohammad',
            specialty: 'Neurology',
            experience: 28,
            rating: 4.8,
            availability: 'available'
          }
        ],
        nurses: [
          {
            id: 'nurse4',
            name: 'Ruma Akter',
            experience: 14,
            specialty: 'Cardiac ICU',
            shift: 'day',
            rating: 4.8
          },
          {
            id: 'nurse5',
            name: 'Salma Begum',
            experience: 11,
            specialty: 'Neuro ICU',
            shift: 'night',
            rating: 4.6
          }
        ]
      },
      {
        id: '3',
        name: 'Square Hospitals Limited',
        address: '18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka 1205',
        phone: '+880 2-8159457',
        distance: 4.5,
        rating: 4.7,
        totalBeds: 20,
        availableBeds: 6,
        facilities: ['24/7 Emergency', 'Premium ICU', 'Cardiac Care', 'Advanced Diagnostics', 'International Standards'],
        icuBeds: [
          {
            id: 'bed8',
            bedNumber: 'SQ-ICU-301',
            type: 'general',
            status: 'available',
            pricePerDay: 18000,
            facilities: ['Premium Ventilator', 'Advanced Monitor', 'Defibrillator', 'IV Pump']
          },
          {
            id: 'bed9',
            bedNumber: 'SQ-ICU-302',
            type: 'cardiac',
            status: 'available',
            pricePerDay: 25000,
            facilities: ['State-of-art Cardiac Monitor', 'ECMO', 'IABP', 'Premium Ventilator']
          }
        ],
        doctors: [
          {
            id: 'doc6',
            name: 'Dr. A.K.M. Manzurul Alam',
            specialty: 'Critical Care Medicine',
            experience: 22,
            rating: 4.8,
            availability: 'available'
          },
          {
            id: 'doc7',
            name: 'Dr. Masuda Begum',
            specialty: 'Cardiology',
            experience: 19,
            rating: 4.7,
            availability: 'available'
          }
        ],
        nurses: [
          {
            id: 'nurse6',
            name: 'Rashida Khatun',
            experience: 13,
            specialty: 'Critical Care',
            shift: 'day',
            rating: 4.9
          },
          {
            id: 'nurse7',
            name: 'Hosne Ara',
            experience: 10,
            specialty: 'Cardiac Care',
            shift: 'night',
            rating: 4.7
          }
        ]
      },
      {
        id: '4',
        name: 'United Hospital Limited',
        address: 'Plot 15, Road 71, Gulshan 2, Dhaka 1212, Bangladesh',
        phone: '+880 2-8836444',
        distance: 6.8,
        rating: 4.8,
        totalBeds: 24,
        availableBeds: 5,
        facilities: ['24/7 Emergency', 'Premium ICU', 'Cardiac Surgery', 'Neurosurgery', 'JCI Accredited'],
        icuBeds: [
          {
            id: 'bed10',
            bedNumber: 'UH-ICU-401',
            type: 'general',
            status: 'available',
            pricePerDay: 20000,
            facilities: ['Premium Ventilator', 'Advanced Monitor', 'Defibrillator', 'CRRT']
          },
          {
            id: 'bed11',
            bedNumber: 'UH-ICU-402',
            type: 'cardiac',
            status: 'available',
            pricePerDay: 28000,
            facilities: ['Advanced Cardiac Monitor', 'ECMO', 'IABP', 'Premium Ventilator', 'Dialysis']
          },
          {
            id: 'bed12',
            bedNumber: 'UH-ICU-403',
            type: 'pediatric',
            status: 'available',
            pricePerDay: 22000,
            facilities: ['Pediatric Ventilator', 'Specialized Monitor', 'Warmer', 'ECMO']
          }
        ],
        doctors: [
          {
            id: 'doc8',
            name: 'Prof. Dr. Samanta Lal Sen',
            specialty: 'Cardiac Surgery',
            experience: 35,
            rating: 4.9,
            availability: 'available'
          },
          {
            id: 'doc9',
            name: 'Dr. Dipti Rani Das',
            specialty: 'Pediatric ICU',
            experience: 16,
            rating: 4.7,
            availability: 'available'
          }
        ],
        nurses: [
          {
            id: 'nurse8',
            name: 'Shirin Akter',
            experience: 16,
            specialty: 'Cardiac ICU',
            shift: 'day',
            rating: 4.8
          },
          {
            id: 'nurse9',
            name: 'Mahmuda Khatun',
            experience: 12,
            specialty: 'Pediatric ICU',
            shift: 'both',
            rating: 4.7
          }
        ]
      },
      {
        id: '5',
        name: 'Apollo Hospitals Dhaka',
        address: 'Plot 81, Block E, Bashundhara R/A, Dhaka 1229, Bangladesh',
        phone: '+880 2-8401661',
        distance: 8.2,
        rating: 4.9,
        totalBeds: 30,
        availableBeds: 7,
        facilities: ['24/7 Emergency', 'Premium ICU', 'Cardiac Surgery', 'Neurosurgery', 'Transplant', 'International Standards'],
        icuBeds: [
          {
            id: 'bed13',
            bedNumber: 'APL-ICU-501',
            type: 'general',
            status: 'available',
            pricePerDay: 22000,
            facilities: ['Premium Ventilator', 'Advanced Monitor', 'Defibrillator', 'CRRT', 'ECMO']
          },
          {
            id: 'bed14',
            bedNumber: 'APL-ICU-502',
            type: 'cardiac',
            status: 'available',
            pricePerDay: 30000,
            facilities: ['State-of-art Cardiac Monitor', 'ECMO', 'IABP', 'Premium Ventilator', 'Dialysis']
          },
          {
            id: 'bed15',
            bedNumber: 'APL-ICU-503',
            type: 'neuro',
            status: 'available',
            pricePerDay: 25000,
            facilities: ['Advanced Neuro Monitor', 'ICP Monitor', 'Premium Ventilator', 'EEG', 'MRI Access']
          }
        ],
        doctors: [
          {
            id: 'doc10',
            name: 'Prof. Dr. Afiqul Islam',
            specialty: 'Cardiac Surgery',
            experience: 32,
            rating: 4.9,
            availability: 'available'
          },
          {
            id: 'doc11',
            name: 'Dr. Badrul Alam Mondal',
            specialty: 'Neurosurgery',
            experience: 24,
            rating: 4.8,
            availability: 'available'
          }
        ],
        nurses: [
          {
            id: 'nurse10',
            name: 'Taslima Begum',
            experience: 18,
            specialty: 'Critical Care',
            shift: 'day',
            rating: 4.9
          },
          {
            id: 'nurse11',
            name: 'Rehana Parvin',
            experience: 14,
            specialty: 'Cardiac ICU',
            shift: 'night',
            rating: 4.8
          }
        ]
      }
    ]
    setHospitals(bangladeshHospitals)
    }
  }, [hospitals.length])

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const refreshData = () => {
    setIsRefreshing(true)
    fetchICUBeds().finally(() => {
      setLastUpdated(new Date())
      setIsRefreshing(false)
    })
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
    const nurseCost = bookingDetails.selectedNurses.length * 2000 * bookingDetails.expectedDays
    return bedCost + nurseCost
  }

  const handleReserveBed = async () => {
    if (!selectedBed || !selectedHospital) {
      alert('Please select a bed and hospital first')
      return
    }

    setIsReserving(true)
    try {
      // Calculate start and end times
      const startTime = new Date()
      const endTime = new Date()
      endTime.setDate(endTime.getDate() + bookingDetails.expectedDays)

      // Format dates for Java LocalDateTime.parse() - remove timezone info
      const formatForJava = (date: Date) => {
        return date.toISOString().replace('Z', '').replace(/\.\d{3}/, '')
      }

      const reservationData = {
        bedId: selectedBed.id,
        patientId: 'user-patient-1', // Default patient ID for demo
        startTime: formatForJava(startTime),
        endTime: formatForJava(endTime)
      }

      console.log('🔄 Sending reservation data:', reservationData)

      const response = await fetch('http://localhost:8080/api/icu-beds/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationData),
      })

      const result = await response.json()

      if (result.success) {
        alert('ICU bed reservation confirmed! Your reservation has been saved.')
        setShowBookingModal(false)
        // Refresh the hospital data to show updated bed status
        await fetchICUBeds()
        setLastUpdated(new Date())
      } else {
        alert('Failed to reserve bed: ' + result.message)
      }
    } catch (error) {
      console.error('Error reserving bed:', error)
      alert('Failed to reserve bed. Please try again.')
    } finally {
      setIsReserving(false)
    }
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
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Header */}
      <div className="bg-gradient-to-br from-blue-600 via-teal-500 to-green-600 text-white">
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
                    <BedDouble className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">ICU Bed Reservation System</h1>
                    <p className="text-xl text-blue-100 mt-2">Real-time availability with specialized medical care</p>
                  </div>
                </div>

                {/* Real-time Stats */}
                <div className="flex items-center space-x-8 mt-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-100 font-medium">Live tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-4 h-4 text-teal-200" />
                    <span className="text-teal-100">24/7 monitoring</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="w-4 h-4 text-green-200" />
                    <span className="text-green-100">Specialist care</span>
                  </div>
                </div>
              </div>

              {/* Live Update Card */}
              <div className="hidden lg:block">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Timer className="w-5 h-5 text-white" />
                    <span className="font-semibold">Last Updated</span>
                  </div>
                  <div className="text-sm text-blue-200 mb-3">
                    {mounted ? lastUpdated.toLocaleTimeString() : '--:--:--'}
                  </div>
                  <button
                    onClick={refreshData}
                    disabled={isRefreshing}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-xl font-semibold transition-all backdrop-blur-sm border border-white border-opacity-20 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 inline mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Enhanced Search */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-100 p-8 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Find ICU Beds</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search hospitals by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500 text-lg"
            />
          </div>
        </div>

        {/* Enhanced Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white text-center transform transition-all hover:shadow-2xl"
          >
            <div className="p-4 bg-white bg-opacity-20 rounded-2xl w-fit mx-auto mb-4 group-hover:bg-opacity-30 transition-all backdrop-blur-sm">
              <Building className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold mb-2">{hospitals.length}</div>
            <div className="text-blue-100 font-medium">Partner Hospitals</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="group bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white text-center transform transition-all hover:shadow-2xl"
          >
            <div className="p-4 bg-white bg-opacity-20 rounded-2xl w-fit mx-auto mb-4 group-hover:bg-opacity-30 transition-all backdrop-blur-sm">
              <BedDouble className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {hospitals.reduce((sum, h) => sum + h.availableBeds, 0)}
            </div>
            <div className="text-green-100 font-medium">Available ICU Beds</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white text-center transform transition-all hover:shadow-2xl"
          >
            <div className="p-4 bg-white bg-opacity-20 rounded-2xl w-fit mx-auto mb-4 group-hover:bg-opacity-30 transition-all backdrop-blur-sm">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {hospitals.reduce((sum, h) => sum + h.doctors.length, 0)}
            </div>
            <div className="text-purple-100 font-medium">ICU Specialists</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="group bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white text-center transform transition-all hover:shadow-2xl"
          >
            <div className="p-4 bg-white bg-opacity-20 rounded-2xl w-fit mx-auto mb-4 group-hover:bg-opacity-30 transition-all backdrop-blur-sm">
              <UserCheck className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl font-bold mb-2">
              {hospitals.reduce((sum, h) => sum + h.nurses.length, 0)}
            </div>
            <div className="text-orange-100 font-medium">Critical Care Nurses</div>
          </motion.div>
        </div>

        {/* Hospital Cards */}
        <div className="space-y-6">
          {isLoadingBeds ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading ICU beds from database...</p>
              </div>
            </div>
          ) : filteredHospitals.length === 0 ? (
            <div className="text-center py-12">
              <BedDouble className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hospitals found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or check back later</p>
            </div>
          ) : (
            filteredHospitals.map((hospital) => (
            <motion.div
              key={hospital.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:border-blue-200"
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
                  <span>ICU Beds</span>
                </h4>

                {hospital.icuBeds.filter(bed => bed.status === 'available' || bed.status === 'reserved').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BedDouble className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No ICU beds currently available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hospital.icuBeds
                      .filter(bed => bed.status === 'available' || bed.status === 'reserved')
                      .map((bed) => (
                        <motion.div
                          key={bed.id}
                          whileHover={{ scale: bed.status === 'reserved' ? 1.0 : 1.02 }}
                          className={`group rounded-xl p-6 transition-all transform ${
                            bed.status === 'reserved' 
                              ? 'bg-orange-50 border-2 border-orange-200 hover:border-orange-300' 
                              : 'bg-white border-2 border-gray-200 hover:shadow-lg hover:border-blue-300 hover:scale-105'
                          }`}
                        >
                          {/* Reservation Status Banner */}
                          {bed.status === 'reserved' && (
                            <div className="mb-4 p-3 bg-orange-100 border border-orange-200 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Timer className="w-4 h-4 text-orange-600" />
                                <span className="text-sm font-semibold text-orange-800">
                                  {bed.reservationInfo?.isReservedByCurrentUser ? 'Reserved by You' : 'Reserved'}
                                </span>
                              </div>
                              {bed.reservationInfo && (
                                <div className="mt-2 text-xs text-orange-700">
                                  <p>Patient: {bed.reservationInfo.patientName}</p>
                                  <p>Period: {new Date(bed.reservationInfo.startTime).toLocaleDateString()} - {new Date(bed.reservationInfo.endTime).toLocaleDateString()}</p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {getBedTypeIcon(bed.type)}
                              <span className="font-semibold text-gray-900">{bed.bedNumber}</span>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${
                              bed.status === 'reserved' 
                                ? 'bg-orange-100 text-orange-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {bed.type.toUpperCase()}
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className={`text-lg font-bold ${
                              bed.status === 'reserved' ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              ৳{bed.pricePerDay.toLocaleString()}/day
                            </div>
                          </div>

                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Equipment:</h5>
                            <div className="flex flex-wrap gap-1">
                              {bed.facilities.map((facility, index) => (
                                <span key={index} className={`text-xs px-2 py-1 rounded ${
                                  bed.status === 'reserved' 
                                    ? 'bg-orange-100 text-orange-700' 
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {facility}
                                </span>
                              ))}
                            </div>
                          </div>

                          {bed.status === 'available' ? (
                            <button
                              onClick={() => handleBookBed(hospital, bed)}
                              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                              <CalendarCheck className="w-5 h-5" />
                              <span>Reserve ICU Bed</span>
                            </button>
                          ) : (
                            <div className="w-full bg-gray-100 text-gray-500 py-3 px-4 rounded-xl flex items-center justify-center space-x-2 font-semibold">
                              <X className="w-5 h-5" />
                              <span>Not Available</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))
          )}
        </div>

        {/* Enhanced Booking Modal */}
        {showBookingModal && selectedHospital && selectedBed && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                      <BedDouble className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Reserve ICU Bed</h2>
                      <p className="text-blue-100">{selectedHospital.name} • {selectedBed.bedNumber}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-8">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Booking Form */}
                  <div className="space-y-6">
                    {/* Patient Information */}
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg border-2 border-blue-100 p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Patient Information</h3>
                      </div>
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
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${bookingDetails.selectedDoctor?.id === doctor.id
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
                              <span className={`px-2 py-1 text-xs rounded-full ${doctor.availability === 'available'
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
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${bookingDetails.selectedNurses.some(n => n.id === nurse.id)
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
                              <div className="text-sm text-gray-600">+৳2,000/day</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Summary */}
                  <div className="space-y-6">
                    {/* Booking Summary */}
                    <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg border-2 border-green-100 p-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CalendarCheck className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Booking Summary</h3>
                      </div>
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
                          <span className="font-semibold">৳{selectedBed.pricePerDay.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">ICU Bed ({bookingDetails.expectedDays} days):</span>
                          <span className="font-semibold">৳{(selectedBed.pricePerDay * bookingDetails.expectedDays).toLocaleString()}</span>
                        </div>
                        {bookingDetails.selectedNurses.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Nurses ({bookingDetails.selectedNurses.length} × {bookingDetails.expectedDays} days):</span>
                            <span className="font-semibold">৳{(bookingDetails.selectedNurses.length * 2000 * bookingDetails.expectedDays).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="border-t border-yellow-200 pt-3 flex items-center justify-between">
                          <span className="text-lg font-semibold text-gray-900">Total Cost:</span>
                          <span className="text-xl font-bold text-green-600">৳{calculateTotalCost().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                      <button
                        className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all flex items-center justify-center space-x-3 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        onClick={handleReserveBed}
                        disabled={isReserving}
                      >
                        {isReserving ? (
                          <>
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Reserving...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-6 h-6" />
                            <span>Confirm Reservation - ৳{calculateTotalCost().toLocaleString()}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setShowBookingModal(false)}
                        className="w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
                      >
                        Cancel Booking
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