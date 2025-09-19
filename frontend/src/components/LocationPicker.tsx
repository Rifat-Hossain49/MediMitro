'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet'
import { LatLngExpression, Icon, LatLng } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React Leaflet
const createCustomIcon = (color: string) => new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="${color === 'red' ? '#ef4444' : color === 'blue' ? '#3b82f6' : '#10b981'}" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0zm0 17.5c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z"/>
    </svg>
  `)}`
})

// Hospital icon with medical cross
const createHospitalIcon = () => new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path fill="#dc2626" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0zm0 17.5c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z"/>
      <rect x="10.5" y="7" width="4" height="11" fill="white"/>
      <rect x="7" y="10.5" width="11" height="4" fill="white"/>
    </svg>
  `)}`
})

interface Hospital {
  id: string
  name: string
  lat: number
  lng: number
  address: string
  type: string
  phone: string
}

// Top 10 most important hospitals for map display (subset of full database)
const BANGLADESH_HOSPITALS: Hospital[] = [
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
    id: 'ctg_1',
    name: 'Chittagong Medical College Hospital',
    lat: 22.3475,
    lng: 91.8123,
    address: 'K.B. Fazlul Kader Road, Chittagong 4203, Bangladesh',
    type: 'Government Medical College Hospital',
    phone: '+880 31-2502321'
  },
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
    id: 'raj_1',
    name: 'Rajshahi Medical College Hospital',
    lat: 24.3745,
    lng: 88.6042,
    address: 'Medical College Road, Rajshahi 6000, Bangladesh',
    type: 'Government Medical College Hospital',
    phone: '+880 721-772351'
  },
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
    id: 'bar_1',
    name: 'Barisal Medical College Hospital',
    lat: 22.7010,
    lng: 90.3535,
    address: 'Alekanda, Barisal 8200, Bangladesh',
    type: 'Government Medical College Hospital',
    phone: '+880 431-2177450'
  },
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
    id: 'mym_1',
    name: 'Mymensingh Medical College Hospital',
    lat: 24.7636,
    lng: 90.4203,
    address: 'Medical College Road, Mymensingh 2200, Bangladesh',
    type: 'Government Medical College Hospital',
    phone: '+880 91-66087'
  }
]

interface LocationPickerProps {
  onLocationSelect: (location: { address: string, lat: number, lng: number }) => void
  placeholder?: string
  markerColor?: 'red' | 'blue' | 'green'
  initialPosition?: [number, number]
  showHospitals?: boolean
}

interface LocationMarkerProps {
  onLocationSelect: (location: { address: string, lat: number, lng: number }) => void
  markerColor: 'red' | 'blue' | 'green'
}

function LocationMarker({ onLocationSelect, markerColor }: LocationMarkerProps) {
  const [position, setPosition] = useState<LatLng | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng
      setPosition(e.latlng)

      try {
        // Use Nominatim (OpenStreetMap) reverse geocoding service
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        )
        const data = await response.json()

        const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`

        onLocationSelect({
          address,
          lat,
          lng
        })
      } catch (error) {
        console.error('Reverse geocoding failed:', error)
        onLocationSelect({
          address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          lat,
          lng
        })
      }
    },
    ready: () => {
      setIsMapReady(true)
    }
  })

  useEffect(() => {
    // Get user's current location if available and map is ready
    if (navigator.geolocation && !position && isMapReady && map) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          try {
            const { latitude, longitude } = pos.coords
            const latlng = new LatLng(latitude, longitude)
            setPosition(latlng)

            // Set map view with a small delay to ensure map is ready
            setTimeout(() => {
              if (map && map.getContainer()) {
                map.setView([latitude, longitude], 13)
              }
            }, 100)

            // Auto-select current location
            onLocationSelect({
              address: `Current Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              lat: latitude,
              lng: longitude
            })
          } catch (error) {
            console.error('Error setting user location:', error)
          }
        },
        (error) => {
          console.warn('Geolocation failed:', error)
          // Don't force a view change if geolocation fails - let user interact naturally
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    }
  }, [map, position, isMapReady, onLocationSelect])

  return position === null ? null : (
    <Marker
      position={position}
      icon={createCustomIcon(markerColor)}
    />
  )
}

export default function LocationPicker({
  onLocationSelect,
  placeholder = "Click on the map to select a location",
  markerColor = 'red',
  initialPosition = [23.8103, 90.4125], // Dhaka, Bangladesh as default
  showHospitals = true
}: LocationPickerProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={initialPosition}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker onLocationSelect={onLocationSelect} markerColor={markerColor} />

          {/* Hospital Markers */}
          {showHospitals && BANGLADESH_HOSPITALS.map((hospital) => (
            <Marker
              key={hospital.id}
              position={[hospital.lat, hospital.lng]}
              icon={createHospitalIcon()}
            >
              <Popup>
                <div className="p-2 min-w-48">
                  <h3 className="font-bold text-red-600 mb-1">{hospital.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{hospital.type}</p>
                  <p className="text-xs text-gray-500 mb-2">{hospital.address}</p>
                  <p className="text-xs text-blue-600">{hospital.phone}</p>
                  <button
                    onClick={() => {
                      onLocationSelect({
                        address: hospital.address,
                        lat: hospital.lat,
                        lng: hospital.lng
                      })
                    }}
                    className="mt-2 text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    Select this hospital
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <p className="text-sm text-gray-600 text-center">
        {placeholder}
        {showHospitals && (
          <span className="block mt-1 text-xs text-red-600">
            🏥 Red markers with crosses show nearby hospitals
          </span>
        )}
      </p>
    </div>
  )
}
