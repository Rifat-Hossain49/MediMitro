'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, 
  Navigation as NavIcon, 
  PhoneCall, 
  Truck, 
  Clock, 
  User, 
  AlertTriangle,
  Star,
  Heart,
  Shield,
  DollarSign,
  Plus,
  Minus,
  CreditCard,
  CheckCircle,
  X,
  Route,
  Users,
  Stethoscope,
  Activity
} from 'lucide-react'

type AmbulanceType = {
  id: string
  name: string
  description: string
  icon: string
  basePrice: number
  pricePerKm: number
  eta: string
  available: number
  features: string[]
  capacity: number
}

type BookingStep = 'location' | 'destination' | 'ambulance' | 'details' | 'payment' | 'tracking'

export default function HireAmbulancePage() {
  const [step, setStep] = useState<BookingStep>('location')
  const [pickupLocation, setPickupLocation] = useState('')
  const [destination, setDestination] = useState('')
  const [selectedAmbulance, setSelectedAmbulance] = useState<AmbulanceType | null>(null)
  const [patientCount, setPatientCount] = useState(1)
  const [emergencyLevel, setEmergencyLevel] = useState('')
  const [specialRequirements, setSpecialRequirements] = useState<string[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [driverLocation, setDriverLocation] = useState({ lat: 0, lng: 0 })

  const ambulanceTypes: AmbulanceType[] = [
    {
      id: 'basic',
      name: 'Basic Life Support',
      description: 'Standard ambulance with basic medical equipment',
      icon: '🚑',
      basePrice: 50,
      pricePerKm: 5,
      eta: '8-12 min',
      available: 5,
      features: ['Basic First Aid', 'Oxygen', 'Stretcher', 'Emergency Medications'],
      capacity: 2
    },
    {
      id: 'advanced',
      name: 'Advanced Life Support',
      description: 'Equipped with advanced medical equipment and paramedics',
      icon: '🏥',
      basePrice: 100,
      pricePerKm: 8,
      eta: '5-10 min',
      available: 3,
      features: ['Cardiac Monitor', 'Defibrillator', 'IV Equipment', 'Advanced Medications', 'Ventilator'],
      capacity: 2
    },
    {
      id: 'critical',
      name: 'Critical Care Transport',
      description: 'ICU-level care with specialized medical team',
      icon: '🩺',
      basePrice: 200,
      pricePerKm: 15,
      eta: '6-15 min',
      available: 2,
      features: ['ICU Equipment', 'Specialized Nurses', 'Blood Products', 'Surgical Equipment'],
      capacity: 1
    },
    {
      id: 'neonatal',
      name: 'Neonatal Transport',
      description: 'Specialized for newborn and infant transport',
      icon: '👶',
      basePrice: 150,
      pricePerKm: 12,
      eta: '10-18 min',
      available: 1,
      features: ['Incubator', 'Neonatal Ventilator', 'Temperature Control', 'Pediatric Specialist'],
      capacity: 1
    }
  ]

  const emergencyLevels = [
    { id: 'critical', name: 'Life Threatening', description: 'Cardiac arrest, severe trauma', color: 'red', priority: 1 },
    { id: 'urgent', name: 'Urgent Care', description: 'Chest pain, difficulty breathing', color: 'orange', priority: 2 },
    { id: 'stable', name: 'Stable Transport', description: 'Medical transfer, routine transport', color: 'blue', priority: 3 },
    { id: 'non-emergency', name: 'Non-Emergency', description: 'Scheduled medical appointments', color: 'green', priority: 4 }
  ]

  const medicalRequirements = [
    'Wheelchair Accessible',
    'Oxygen Support',
    'Cardiac Monitoring',
    'IV Line Required',
    'Isolation Precautions',
    'Bariatric Equipment',
    'Mental Health Support'
  ]

  // Simulate real-time driver location updates
  useEffect(() => {
    if (step === 'tracking' && bookingConfirmed) {
      const interval = setInterval(() => {
        setDriverLocation(prev => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001
        }))
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [step, bookingConfirmed])

  // Calculate total price
  useEffect(() => {
    if (selectedAmbulance) {
      const distance = 8.5 // Mock distance in km
      const price = selectedAmbulance.basePrice + (selectedAmbulance.pricePerKm * distance)
      const urgencyMultiplier = emergencyLevel === 'critical' ? 1.5 : emergencyLevel === 'urgent' ? 1.2 : 1
      setTotalPrice(Math.round(price * urgencyMultiplier))
    }
  }, [selectedAmbulance, emergencyLevel])

  const handleBooking = async () => {
    setIsBooking(true)
    // Simulate booking process
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsBooking(false)
    setBookingConfirmed(true)
    setStep('tracking')
  }

  const toggleRequirement = (requirement: string) => {
    setSpecialRequirements(prev => 
      prev.includes(requirement) 
        ? prev.filter(r => r !== requirement)
        : [...prev, requirement]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Header */}
      <div className="bg-gradient-to-br from-red-600 via-orange-500 to-red-700 text-white">
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
                    <Truck className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">Emergency Ambulance Service</h1>
                    <p className="text-xl text-red-100 mt-2">Professional medical transportation when every second counts</p>
                  </div>
                </div>
                
                {/* Emergency Stats */}
                <div className="flex items-center space-x-8 mt-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-red-100 font-medium">24/7 Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-orange-200" />
                    <span className="text-orange-100">Avg response: 5-8 min</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-yellow-200" />
                    <span className="text-yellow-100">Licensed EMTs</span>
                  </div>
                </div>
              </div>
              
              {/* Emergency Button */}
              <div className="hidden lg:block">
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                    🚨 CALL 911
                  </button>
                  <p className="text-red-200 text-sm mt-2">For life-threatening emergencies</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Enhanced Progress Bar */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              {[
                { id: 'location', label: 'Pickup', icon: MapPin },
                { id: 'destination', label: 'Destination', icon: Heart },
                { id: 'ambulance', label: 'Ambulance', icon: Truck },
                { id: 'details', label: 'Details', icon: User },
                { id: 'payment', label: 'Payment', icon: CreditCard },
                { id: 'tracking', label: 'Tracking', icon: Activity }
              ].map((stepItem, index) => (
                <div key={stepItem.id} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    step === stepItem.id 
                      ? 'bg-red-500 text-white shadow-lg scale-110' 
                      : index < ['location', 'destination', 'ambulance', 'details', 'payment', 'tracking'].indexOf(step)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    <stepItem.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-sm mt-2 font-medium ${
                    step === stepItem.id ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {stepItem.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ 
                  width: `${
                    step === 'location' ? '16%' : 
                    step === 'destination' ? '33%' : 
                    step === 'ambulance' ? '50%' : 
                    step === 'details' ? '66%' : 
                    step === 'payment' ? '83%' : '100%'
                  }%` 
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Pickup Location */}
              {step === 'location' && (
                <motion.div
                  key="location"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-100 p-8"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Pickup Location</h2>
                  </div>
                  
                  {/* Map Placeholder */}
                  <div className="h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg mb-6 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                    <div className="text-center z-10">
                      <MapPin className="w-16 h-16 text-blue-500 mx-auto mb-2" />
                      <p className="text-gray-600">Interactive Map</p>
                      <p className="text-sm text-gray-500">Tap to set pickup location</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter pickup address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
                        <input
                          type="text"
                          value={pickupLocation}
                          onChange={(e) => setPickupLocation(e.target.value)}
                          placeholder="123 Main Street, City, State"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setPickupLocation('Current GPS Location - 123 Emergency St, Downtown')
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <NavIcon className="w-5 h-5" />
                      Use Current Location
                    </button>

                    {pickupLocation && (
                      <button
                        onClick={() => setStep('destination')}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Confirm Pickup Location
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Destination */}
              {step === 'destination' && (
                <motion.div
                  key="destination"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-xl border-2 border-red-100 p-8"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <Heart className="w-6 h-6 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Destination Hospital</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600 w-4 h-4" />
                        <input
                          type="text"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          placeholder="Hospital, clinic, or other destination"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                        />
                      </div>
                    </div>

                    {/* Quick Destinations */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">Quick select:</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          'City General Hospital',
                          'Emergency Medical Center', 
                          'Regional Trauma Center',
                          'Children\'s Hospital'
                        ].map(hospital => (
                          <motion.button
                            key={hospital}
                            onClick={() => setDestination(hospital)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group p-4 text-left border-2 border-red-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all bg-white shadow-md hover:shadow-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                                <Heart className="w-5 h-5 text-red-600" />
                              </div>
                              <span className="font-semibold text-gray-900">{hospital}</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep('location')}
                        className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      {destination && (
                        <button
                          onClick={() => setStep('ambulance')}
                          className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                        >
                          Continue
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Ambulance Selection */}
              {step === 'ambulance' && (
                <motion.div
                  key="ambulance"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-gradient-to-br from-white to-orange-50 rounded-2xl shadow-xl border-2 border-orange-100 p-8"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <Truck className="w-6 h-6 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Choose Ambulance Type</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {ambulanceTypes.map(ambulance => (
                      <motion.div
                        key={ambulance.id}
                        whileHover={{ scale: 1.02 }}
                        className={`group p-6 border-2 rounded-xl cursor-pointer transition-all shadow-lg hover:shadow-xl ${
                          selectedAmbulance?.id === ambulance.id
                            ? 'border-red-500 bg-gradient-to-r from-red-50 to-orange-50 shadow-red-200'
                            : 'border-gray-200 hover:border-orange-300 bg-white hover:bg-orange-50'
                        }`}
                        onClick={() => setSelectedAmbulance(ambulance)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="text-3xl">{ambulance.icon}</div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{ambulance.name}</h3>
                              <p className="text-sm text-gray-600 mb-2">{ambulance.description}</p>
                              
                              <div className="flex items-center gap-4 mb-3">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4 text-green-600" />
                                  <span className="text-sm text-green-600 font-medium">{ambulance.eta}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm text-blue-600">{ambulance.capacity} patients</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Truck className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm text-gray-600">{ambulance.available} available</span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1">
                                {ambulance.features.slice(0, 3).map(feature => (
                                  <span key={feature} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                    {feature}
                                  </span>
                                ))}
                                {ambulance.features.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                    +{ambulance.features.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              ${ambulance.basePrice}
                            </div>
                            <div className="text-sm text-gray-600">
                              + ${ambulance.pricePerKm}/km
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setStep('destination')}
                      className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    {selectedAmbulance && (
                      <button
                        onClick={() => setStep('details')}
                        className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                      >
                        Continue
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Emergency Details */}
              {step === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Emergency Details</h2>
                  
                  <div className="space-y-6">
                    {/* Emergency Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Emergency Level</label>
                      <div className="grid grid-cols-2 gap-3">
                        {emergencyLevels.map(level => (
                          <button
                            key={level.id}
                            onClick={() => setEmergencyLevel(level.id)}
                            className={`p-3 text-left border-2 rounded-lg transition-all ${
                              emergencyLevel === level.id
                                ? `border-${level.color}-500 bg-${level.color}-50`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-3 h-3 rounded-full bg-${level.color}-500`} />
                              <span className="font-medium text-gray-900">{level.name}</span>
                            </div>
                            <p className="text-sm text-gray-600">{level.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Patient Count */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Number of Patients</label>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setPatientCount(Math.max(1, patientCount - 1))}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-xl font-semibold w-8 text-center">{patientCount}</span>
                        <button
                          onClick={() => setPatientCount(Math.min(selectedAmbulance?.capacity || 2, patientCount + 1))}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-gray-600">
                          (Max {selectedAmbulance?.capacity} for this ambulance)
                        </span>
                      </div>
                    </div>

                    {/* Special Requirements */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Special Medical Requirements</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {medicalRequirements.map(requirement => (
                          <button
                            key={requirement}
                            onClick={() => toggleRequirement(requirement)}
                            className={`p-3 text-left border rounded-lg transition-all ${
                              specialRequirements.includes(requirement)
                                ? 'border-blue-500 bg-blue-50 text-blue-900'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                                specialRequirements.includes(requirement)
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`}>
                                {specialRequirements.includes(requirement) && (
                                  <CheckCircle className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <span className="text-sm">{requirement}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        placeholder="Describe the medical situation, special instructions, or any other relevant information..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setStep('ambulance')}
                      className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    {emergencyLevel && (
                      <button
                        onClick={() => setStep('payment')}
                        className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                      >
                        Continue to Payment
                      </button>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Payment */}
              {step === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment & Confirmation</h2>
                  
                  <div className="space-y-6">
                    {/* Payment Methods */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                      <div className="space-y-3">
                        {[
                          { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
                          { id: 'insurance', name: 'Insurance Coverage', icon: Shield },
                          { id: 'cash', name: 'Cash on Arrival', icon: DollarSign }
                        ].map(method => (
                          <div key={method.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300">
                            <input type="radio" name="payment" className="text-red-600" />
                            <method.icon className="w-5 h-5 text-gray-600" />
                            <span className="font-medium">{method.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Emergency Contact</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Contact Name"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                        />
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setStep('details')}
                      className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleBooking}
                      disabled={isBooking}
                      className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:bg-gray-400 flex items-center justify-center gap-2"
                    >
                      {isBooking ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Booking...
                        </>
                      ) : (
                        '🚨 BOOK AMBULANCE NOW'
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Real-time Tracking */}
              {step === 'tracking' && (
                <motion.div
                  key="tracking"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                >
                  <div className="text-center mb-6">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="inline-flex p-4 bg-green-500 rounded-full mb-4"
                    >
                      <Truck className="w-8 h-8 text-white" />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-green-600 mb-2">Ambulance Dispatched!</h2>
                    <p className="text-gray-600">Your emergency vehicle is on the way</p>
                  </div>

                  {/* Live Map */}
                  <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg mb-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                    <div className="absolute top-4 left-4 bg-white rounded-lg p-2 shadow-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Live Tracking</span>
                      </div>
                    </div>
                    
                    {/* Ambulance Position */}
                    <motion.div
                      animate={{
                        x: [50, 200, 300],
                        y: [150, 120, 100]
                      }}
                      transition={{ duration: 10, repeat: Infinity }}
                      className="absolute"
                    >
                      <div className="text-2xl">🚑</div>
                    </motion.div>
                    
                    <div className="absolute bottom-4 right-4 bg-white rounded-lg p-2 shadow-lg">
                      <div className="text-xs text-gray-600">8.5 km to destination</div>
                    </div>
                  </div>

                  {/* Driver Details */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">EMT John Rodriguez</h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">4.9 (156 reviews)</span>
                        </div>
                        <p className="text-sm text-gray-600">15 years experience</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Vehicle ID</div>
                        <div className="font-semibold">AMB-2024-001</div>
                      </div>
                    </div>
                  </div>

                  {/* Status Updates */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-900">Estimated Arrival</span>
                      </div>
                      <span className="text-green-600 font-bold">6-8 minutes</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Route className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">Distance Remaining</span>
                      </div>
                      <span className="text-blue-600 font-bold">4.2 km</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-orange-600" />
                        <span className="font-medium text-gray-900">Current Status</span>
                      </div>
                      <span className="text-orange-600 font-bold">En Route</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                      <PhoneCall className="w-4 h-4" />
                      Call EMT
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                      <AlertTriangle className="w-4 h-4" />
                      Update Emergency Details
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trip Summary */}
            {(step === 'ambulance' || step === 'details' || step === 'payment') && selectedAmbulance && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border-2 border-green-100 p-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Route className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Trip Summary</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Pickup</p>
                      <p className="font-medium text-gray-900">{pickupLocation}</p>
                    </div>
                  </div>
                  
                  <div className="border-l-2 border-dashed border-gray-300 ml-1.5 h-4"></div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Destination</p>
                      <p className="font-medium text-gray-900">{destination}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{selectedAmbulance.icon}</span>
                      <span className="font-medium">{selectedAmbulance.name}</span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base fare</span>
                        <span>${selectedAmbulance.basePrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Distance (8.5 km)</span>
                        <span>${(selectedAmbulance.pricePerKm * 8.5).toFixed(0)}</span>
                      </div>
                      {emergencyLevel === 'critical' && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Critical surcharge (50%)</span>
                          <span>+${Math.round((selectedAmbulance.basePrice + selectedAmbulance.pricePerKm * 8.5) * 0.5)}</span>
                        </div>
                      )}
                      {emergencyLevel === 'urgent' && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Urgent surcharge (20%)</span>
                          <span>+${Math.round((selectedAmbulance.basePrice + selectedAmbulance.pricePerKm * 8.5) * 0.2)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${totalPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Enhanced Emergency Contacts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-red-600 via-orange-500 to-red-700 rounded-2xl p-6 text-white shadow-2xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <PhoneCall className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Emergency Contacts</h3>
              </div>
              
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-4 rounded-xl transition-all backdrop-blur-sm border border-white border-opacity-20 font-semibold">
                  <div className="p-2 bg-red-500 rounded-lg">
                    <PhoneCall className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold">🚨 Emergency: 911</div>
                    <div className="text-sm text-red-100">Life-threatening emergencies</div>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 bg-white bg-opacity-10 hover:bg-opacity-20 text-white px-4 py-4 rounded-xl transition-all backdrop-blur-sm border border-white border-opacity-20">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <PhoneCall className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">MediMitra Support</div>
                    <div className="text-sm text-orange-100">1-800-AMBULANCE</div>
                  </div>
                </button>
                
                <button className="w-full flex items-center gap-3 bg-white bg-opacity-10 hover:bg-opacity-20 text-white px-4 py-4 rounded-xl transition-all backdrop-blur-sm border border-white border-opacity-20">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Stethoscope className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Medical Helpline</div>
                    <div className="text-sm text-orange-100">1-800-MEDHELP</div>
                  </div>
                </button>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white border-opacity-20">
                <div className="bg-white bg-opacity-10 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-300 mt-0.5" />
                    <p className="text-sm text-red-100">
                      <strong className="text-white">Critical Note:</strong> For immediate life-threatening emergencies, call 911 first, then use our service for non-critical transport needs.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Service Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-100 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Why Choose MediMitra?</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Licensed EMT professionals</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">GPS real-time tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Insurance accepted</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">24/7 availability</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
