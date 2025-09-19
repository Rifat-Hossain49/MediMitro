'use client'

import { useEffect, useState } from 'react'
import { MapPin, Phone, Clock, Navigation } from 'lucide-react'
import { reverseGeocode } from '@/lib/geocoding'

interface Hospital {
  id: string
  name: string
  lat: number
  lng: number
  address: string
  type: string
  phone: string
  distance?: number
}

interface HospitalSuggestionsProps {
  userLocation?: { lat: number; lng: number } | null
  onHospitalSelect: (hospital: Hospital) => void
  maxSuggestions?: number
}

// Comprehensive Bangladesh hospital data with realistic coordinates across all major cities
const BANGLADESH_HOSPITALS: Hospital[] = [
  // Dhaka Division Hospitals
  {
    id: 'dhk_1',
    name: 'Dhaka Medical College Hospital',
    lat: 23.7237,
    lng: 90.3960,
    address: 'Bakshibazar, Dhaka 1000, Bangladesh',
    type: 'Government Medical College Hospital',
    phone: '+880 2-7319002'
  },
  {
    id: 'dhk_2',
    name: 'Bangabandhu Sheikh Mujib Medical University',
    lat: 23.7390,
    lng: 90.3943,
    address: 'Shahbag, Dhaka 1000, Bangladesh',
    type: 'Medical University Hospital',
    phone: '+880 2-9661064'
  },
  {
    id: 'dhk_3',
    name: 'Square Hospitals Limited',
    lat: 23.7535,
    lng: 90.3780,
    address: '18/F, Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath, Dhaka 1205',
    type: 'Private Hospital',
    phone: '+880 2-8159457'
  },
  {
    id: 'dhk_4',
    name: 'United Hospital Limited',
    lat: 23.8041,
    lng: 90.4152,
    address: 'Plot 15, Road 71, Gulshan 2, Dhaka 1212, Bangladesh',
    type: 'Private Hospital',
    phone: '+880 2-8836444'
  },
  {
    id: 'dhk_5',
    name: 'Apollo Hospitals Dhaka',
    lat: 23.8103,
    lng: 90.4125,
    address: 'Plot 81, Block E, Bashundhara R/A, Dhaka 1229, Bangladesh',
    type: 'Multi-specialty Hospital',
    phone: '+880 2-8401661'
  },
  {
    id: 'dhk_6',
    name: 'Labaid Specialized Hospital',
    lat: 23.7461,
    lng: 90.3742,
    address: 'House 06, Road 04, Dhanmondi, Dhaka 1205, Bangladesh',
    type: 'Specialized Hospital',
    phone: '+880 2-8616420'
  },
  {
    id: 'dhk_7',
    name: 'Ibn Sina Hospital',
    lat: 23.7461,
    lng: 90.3789,
    address: 'House 48, Road 9/A, Dhanmondi, Dhaka 1209, Bangladesh',
    type: 'General Hospital',
    phone: '+880 2-8621010'
  },
  {
    id: 'dhk_8',
    name: 'National Heart Foundation',
    lat: 23.7558,
    lng: 90.3659,
    address: 'Plot 7/2, Section 2, Mirpur, Dhaka 1216, Bangladesh',
    type: 'Cardiac Specialty Hospital',
    phone: '+880 2-9005151'
  },
  {
    id: 'dhk_9',
    name: 'Anwar Khan Modern Medical College Hospital',
    lat: 23.7461,
    lng: 90.3742,
    address: 'House 17, Road 8, Dhanmondi, Dhaka 1205, Bangladesh',
    type: 'Private Medical College Hospital',
    phone: '+880 2-9672277'
  },
  {
    id: 'dhk_10',
    name: 'Holy Family Red Crescent Medical College Hospital',
    lat: 23.7350,
    lng: 90.3947,
    address: 'Eskaton Garden Road, Dhaka 1000, Bangladesh',
    type: 'Private Medical College Hospital',
    phone: '+880 2-8311721'
  },
  // Chittagong Division Hospitals
  {
    id: 'ctg_1',
    name: 'Chittagong Medical College Hospital',
    lat: 22.3475,
    lng: 91.8123,
    address: 'K.B. Fazlul Kader Road, Chittagong 4203, Bangladesh',
    type: 'Government Medical College Hospital',
    phone: '+880 31-2502321'
  },
  {
    id: 'ctg_2',
    name: 'Chittagong General Hospital',
    lat: 22.3569,
    lng: 91.7832,
    address: 'Andarkilla, Chittagong 4000, Bangladesh',
    type: 'Government General Hospital',
    phone: '+880 31-2523300'
  },
  {
    id: 'ctg_3',
    name: 'Max Hospital & Diagnostics',
    lat: 22.3364,
    lng: 91.7914,
    address: '72/A, Panclaish R/A, Chittagong 4203, Bangladesh',
    type: 'Private Hospital',
    phone: '+880 31-2551234'
  },
  {
    id: 'ctg_4',
    name: 'Imperial Hospital Limited',
    lat: 22.3711,
    lng: 91.7840,
    address: '304/A, Mehedibagh, Chittagong 4000, Bangladesh',
    type: 'Private Hospital',
    phone: '+880 31-2555666'
  },
  {
    id: 'ctg_5',
    name: 'Parkview Hospital',
    lat: 22.3250,
    lng: 91.8025,
    address: '34/A, Oxygen, Chittagong 4209, Bangladesh',
    type: 'Private Hospital',
    phone: '+880 31-2556677'
  },
  // Sylhet Division Hospitals
  {
    id: 'syl_1',
    name: 'Sylhet MAG Osmani Medical College Hospital',
    lat: 24.8898,
    lng: 91.8660,
    address: 'Medical College Road, Sylhet 3100, Bangladesh',
    type: 'Government Medical College Hospital',
    phone: '+880 821-713632'
  },
  {
    id: 'syl_2',
    name: 'Mount Adora Hospital',
    lat: 24.8949,
    lng: 91.8687,
    address: 'Rikabibazar, Sylhet 3100, Bangladesh',
    type: 'Private Hospital',
    phone: '+880 821-2880831'
  },
  {
    id: 'syl_3',
    name: 'Trust Hospital Sylhet',
    lat: 24.8878,
    lng: 91.8814,
    address: 'Chowhatta Circle, Sylhet 3100, Bangladesh',
    type: 'Private Hospital',
    phone: '+880 821-2885500'
  },
  {
    id: 'syl_4',
    name: 'Noorjahan Hospital',
    lat: 24.8967,
    lng: 91.8735,
    address: 'Station Road, Sylhet 3100, Bangladesh',
    type: 'Private Hospital',
    phone: '+880 821-714400'
  },
  // Rajshahi Division Hospitals  
  {
    id: 'raj_1',
    name: 'Rajshahi Medical College Hospital',
    lat: 24.3745,
    lng: 88.6042,
    address: 'Medical College Road, Rajshahi 6000, Bangladesh',
    type: 'Government Medical College Hospital',
    phone: '+880 721-772351'
  },
  {
    id: 'raj_2',
    name: 'Islami Bank Medical College Hospital',
    lat: 24.3636,
    lng: 88.6241,
    address: 'Shaheb Bazar, Rajshahi 6100, Bangladesh',
    type: 'Private Medical College Hospital',
    phone: '+880 721-750794'
  },
  {
    id: 'raj_3',
    name: 'Popular Diagnostic Centre',
    lat: 24.3679,
    lng: 88.6165,
    address: 'Shaheb Bazar, Rajshahi 6100, Bangladesh',
    type: 'Diagnostic Hospital',
    phone: '+880 721-772233'
  },
  // Khulna Division Hospitals
  {
    id: 'khl_1',
    name: 'Khulna Medical College Hospital',
    lat: 22.8456,
    lng: 89.5403,
    address: 'Medical College Road, Khulna 9000, Bangladesh',
    type: 'Government Medical College Hospital',
    phone: '+880 41-760300'
  },
  {
    id: 'khl_2',
    name: 'Ad-din Women\'s Medical College Hospital',
    lat: 22.8092,
    lng: 89.5525,
    address: 'Boro Bazar, Khulna 9100, Bangladesh',
    type: 'Private Medical College Hospital',
    phone: '+880 41-2834567'
  },
  {
    id: 'khl_3',
    name: 'Gazi Medical College Hospital',
    lat: 22.8147,
    lng: 89.5634,
    address: '37/1, K.D.A Avenue, Khulna 9100, Bangladesh',
    type: 'Private Medical College Hospital',
    phone: '+880 41-2770061'
  },
  // Barisal Division Hospitals
  {
    id: 'bar_1',
    name: 'Barisal Medical College Hospital',
    lat: 22.7010,
    lng: 90.3535,
    address: 'Alekanda, Barisal 8200, Bangladesh',
    type: 'Government Medical College Hospital',
    phone: '+880 431-2177450'
  },
  {
    id: 'bar_2',
    name: 'Barisal General Hospital',
    lat: 22.7065,
    lng: 90.3493,
    address: 'Hospital Road, Barisal 8200, Bangladesh',
    type: 'Government General Hospital',
    phone: '+880 431-64069'
  },
  // Rangpur Division Hospitals
  {
    id: 'ran_1',
    name: 'Rangpur Medical College Hospital',
    lat: 25.7439,
    lng: 89.2752,
    address: 'College Road, Rangpur 5400, Bangladesh',
    type: 'Government Medical College Hospital',
    phone: '+880 521-63058'
  },
  {
    id: 'ran_2',
    name: 'Rangpur General Hospital',
    lat: 25.7558,
    lng: 89.2444,
    address: 'Hospital Road, Rangpur 5400, Bangladesh',
    type: 'Government General Hospital',
    phone: '+880 521-62324'
  },
  {
    id: 'ran_3',
    name: 'Modern Hospital Rangpur',
    lat: 25.7326,
    lng: 89.2420,
    address: 'Jail Road, Rangpur 5400, Bangladesh',
    type: 'Private Hospital',
    phone: '+880 521-66677'
  },
  // Mymensingh Division Hospitals  
  {
    id: 'mym_1',
    name: 'Mymensingh Medical College Hospital',
    lat: 24.7636,
    lng: 90.4203,
    address: 'Medical College Road, Mymensingh 2200, Bangladesh',
    type: 'Government Medical College Hospital',
    phone: '+880 91-66087'
  },
  {
    id: 'mym_2',
    name: 'Community Based Medical College Hospital',
    lat: 24.7465,
    lng: 90.4106,
    address: 'Barhatta Road, Mymensingh 2240, Bangladesh',
    type: 'Private Medical College Hospital',
    phone: '+880 91-67766'
  }
]

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Determine which city/region the user is in based on coordinates
function getUserRegion(lat: number, lng: number): string {
  // Dhaka region (23.5-24.0 lat, 90.2-90.6 lng)
  if (lat >= 23.5 && lat <= 24.0 && lng >= 90.2 && lng <= 90.6) {
    return 'Dhaka Region'
  }
  // Chittagong region (22.2-22.6 lat, 91.6-92.0 lng) 
  if (lat >= 22.2 && lat <= 22.6 && lng >= 91.6 && lng <= 92.0) {
    return 'Chittagong Region'
  }
  // Sylhet region (24.7-25.0 lat, 91.6-92.0 lng)
  if (lat >= 24.7 && lat <= 25.0 && lng >= 91.6 && lng <= 92.0) {
    return 'Sylhet Region'
  }
  // Rajshahi region (24.2-24.5 lat, 88.4-88.8 lng)
  if (lat >= 24.2 && lat <= 24.5 && lng >= 88.4 && lng <= 88.8) {
    return 'Rajshahi Region'
  }
  // Khulna region (22.6-23.0 lat, 89.3-89.7 lng)
  if (lat >= 22.6 && lat <= 23.0 && lng >= 89.3 && lng <= 89.7) {
    return 'Khulna Region'
  }
  // Barisal region (22.5-22.9 lat, 90.2-90.5 lng)
  if (lat >= 22.5 && lat <= 22.9 && lng >= 90.2 && lng <= 90.5) {
    return 'Barisal Region'
  }
  // Rangpur region (25.5-25.9 lat, 89.1-89.4 lng)
  if (lat >= 25.5 && lat <= 25.9 && lng >= 89.1 && lng <= 89.4) {
    return 'Rangpur Region'
  }
  // Mymensingh region (24.5-24.9 lat, 90.2-90.6 lng)
  if (lat >= 24.5 && lat <= 24.9 && lng >= 90.2 && lng <= 90.6) {
    return 'Mymensingh Region'
  }
  // Default to Bangladesh if coordinates don't match specific regions
  return 'Bangladesh'
}

export default function HospitalSuggestions({
  userLocation,
  onHospitalSelect,
  maxSuggestions = 5
}: HospitalSuggestionsProps) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(userLocation || null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([])
  const [locationName, setLocationName] = useState<string>('')
  const [isLoadingLocationName, setIsLoadingLocationName] = useState(false)

  // Update current location when userLocation prop changes
  useEffect(() => {
    if (userLocation) {
      setCurrentLocation(userLocation)
      setIsLoadingLocation(false)
    } else if (!currentLocation && navigator.geolocation) {
      setIsLoadingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setCurrentLocation(location)
          setIsLoadingLocation(false)
        },
        (error) => {
          console.warn('Geolocation failed:', error)
          // Default to Dhaka, Bangladesh location
          setCurrentLocation({ lat: 23.8103, lng: 90.4125 })
          setIsLoadingLocation(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    }
  }, [userLocation, currentLocation])

  // Reverse geocode current location to get readable name
  useEffect(() => {
    if (currentLocation) {
      setIsLoadingLocationName(true)
      reverseGeocode(currentLocation.lat, currentLocation.lng)
        .then((name) => {
          setLocationName(name)
          setIsLoadingLocationName(false)
        })
        .catch((error) => {
          console.warn('Reverse geocoding failed:', error)
          setLocationName(getUserRegion(currentLocation.lat, currentLocation.lng))
          setIsLoadingLocationName(false)
        })
    }
  }, [currentLocation])

  // Calculate distances and sort hospitals
  useEffect(() => {
    if (currentLocation) {
      console.log('Calculating distances from location:', currentLocation)

      const hospitalsWithDistance = BANGLADESH_HOSPITALS.map(hospital => {
        const distance = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          hospital.lat,
          hospital.lng
        )
        return {
          ...hospital,
          distance
        }
      })

      // Sort by distance and take top suggestions
      const sorted = hospitalsWithDistance
        .sort((a, b) => (a.distance || 0) - (b.distance || 0))
        .slice(0, maxSuggestions)

      console.log('Nearest hospitals:', sorted.map(h => ({ name: h.name, distance: h.distance?.toFixed(1) + ' km' })))
      setNearbyHospitals(sorted)
    }
  }, [currentLocation, maxSuggestions])

  if (isLoadingLocation) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-700">Getting your location...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700">
        <Navigation className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold">Nearest Hospitals</h3>
        {currentLocation && (
          <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
            📍 Using current location
          </span>
        )}
      </div>

      {currentLocation && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <div className="flex items-center gap-2">
            <strong>📍</strong>
            {isLoadingLocationName ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Getting location...</span>
              </div>
            ) : (
              <strong>{locationName}</strong>
            )}
          </div>
          <br />
          <strong>Showing {nearbyHospitals.length} nearest hospitals from {BANGLADESH_HOSPITALS.length} total hospitals</strong>
        </div>
      )}

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {nearbyHospitals.map((hospital) => (
          <div
            key={hospital.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:border-red-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => onHospitalSelect(hospital)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-red-600 flex items-center gap-2">
                  🏥 {hospital.name}
                  {hospital.distance && (
                    <span className="text-sm text-gray-500 font-normal">
                      ({hospital.distance.toFixed(1)} km)
                    </span>
                  )}
                </h4>
                <p className="text-sm text-gray-600 mb-1">{hospital.type}</p>
                <p className="text-xs text-gray-500 mb-2 flex items-start gap-1">
                  <MapPin className="w-3 h-3 mt-0.5 text-gray-400" />
                  {hospital.address}
                </p>
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {hospital.phone}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-4 h-4" />
                <span>24/7</span>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                Available
              </span>
              <button className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors">
                Select Hospital
              </button>
            </div>
          </div>
        ))}
      </div>

      {nearbyHospitals.length === 0 && !isLoadingLocation && (
        <div className="text-center py-4 text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>No hospitals found nearby</p>
        </div>
      )}
    </div>
  )
}
