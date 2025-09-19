// Utility functions for geocoding and reverse geocoding
// Using Nominatim (OpenStreetMap) - free service, no API key required

export interface LocationResult {
  display_name: string
  address: {
    city?: string
    state?: string
    country?: string
    suburb?: string
    neighbourhood?: string
    county?: string
    postcode?: string
  }
}

// Convert coordinates to human-readable address
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`
    )

    if (!response.ok) {
      throw new Error('Geocoding service unavailable')
    }

    const data: LocationResult = await response.json()

    if (!data.display_name) {
      throw new Error('No location found')
    }

    // Extract meaningful location parts
    const address = data.address
    const parts: string[] = []

    // Add city/suburb/neighbourhood
    if (address.city) {
      parts.push(address.city)
    } else if (address.suburb) {
      parts.push(address.suburb)
    } else if (address.neighbourhood) {
      parts.push(address.neighbourhood)
    }

    // Add state/county
    if (address.state) {
      parts.push(address.state)
    } else if (address.county) {
      parts.push(address.county)
    }

    // Add country
    if (address.country) {
      parts.push(address.country)
    }

    // If we have parts, join them; otherwise use the full display name
    if (parts.length > 0) {
      return parts.join(', ')
    }

    // Fallback to display name, but clean it up
    return data.display_name.split(',').slice(0, 3).join(', ')

  } catch (error) {
    console.warn('Reverse geocoding failed:', error)
    // Fallback to coordinates with region detection
    return getRegionFromCoordinates(lat, lng)
  }
}

// Fallback function to at least show region instead of raw coordinates
export function getRegionFromCoordinates(lat: number, lng: number): string {
  // Dhaka region (23.5-24.0 lat, 90.2-90.6 lng)
  if (lat >= 23.5 && lat <= 24.0 && lng >= 90.2 && lng <= 90.6) {
    return 'Dhaka, Bangladesh'
  }
  // Chittagong region (22.2-22.6 lat, 91.6-92.0 lng) 
  if (lat >= 22.2 && lat <= 22.6 && lng >= 91.6 && lng <= 92.0) {
    return 'Chittagong, Bangladesh'
  }
  // Sylhet region (24.7-25.0 lat, 91.6-92.0 lng)
  if (lat >= 24.7 && lat <= 25.0 && lng >= 91.6 && lng <= 92.0) {
    return 'Sylhet, Bangladesh'
  }
  // Rajshahi region (24.2-24.5 lat, 88.4-88.8 lng)
  if (lat >= 24.2 && lat <= 24.5 && lng >= 88.4 && lng <= 88.8) {
    return 'Rajshahi, Bangladesh'
  }
  // Khulna region (22.6-23.0 lat, 89.3-89.7 lng)
  if (lat >= 22.6 && lat <= 23.0 && lng >= 89.3 && lng <= 89.7) {
    return 'Khulna, Bangladesh'
  }
  // Barisal region (22.5-22.9 lat, 90.2-90.5 lng)
  if (lat >= 22.5 && lat <= 22.9 && lng >= 90.2 && lng <= 90.5) {
    return 'Barisal, Bangladesh'
  }
  // Rangpur region (25.5-25.9 lat, 89.1-89.4 lng)
  if (lat >= 25.5 && lat <= 25.9 && lng >= 89.1 && lng <= 89.4) {
    return 'Rangpur, Bangladesh'
  }
  // Mymensingh region (24.5-24.9 lat, 90.2-90.6 lng)
  if (lat >= 24.5 && lat <= 24.9 && lng >= 90.2 && lng <= 90.6) {
    return 'Mymensingh, Bangladesh'
  }
  // Default to Bangladesh if coordinates don't match specific regions
  return `Bangladesh (${lat.toFixed(3)}, ${lng.toFixed(3)})`
}

// Convert address to coordinates (forward geocoding)
export async function geocodeAddress(address: string): Promise<{ lat: number, lng: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&accept-language=en`
    )

    if (!response.ok) {
      throw new Error('Geocoding service unavailable')
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      return null
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    }

  } catch (error) {
    console.warn('Forward geocoding failed:', error)
    return null
  }
}


