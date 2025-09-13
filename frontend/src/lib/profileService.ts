'use client'

export interface UserProfile {
  id: string
  email: string
  name: string
  image?: string
  role: string
  phoneNumber?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  emergencyContact?: string
  bloodType?: string
  allergies?: string
  medicalHistory?: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  name?: string
  phoneNumber?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  emergencyContact?: string
  bloodType?: string
  allergies?: string
  medicalHistory?: string
  image?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ProfileStats {
  profileCompletion: number
  totalAppointments: number
  activeMedications: number
  healthRecords: number
  lastUpdate: string
}

class ProfileService {
  private baseUrl = '/api'

  // Get current user profile
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch profile')
      }

      return data.user
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error
    }
  }

  // Update user profile
  async updateProfile(updates: UpdateProfileRequest): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message || 'Failed to update profile')
      }

      return data.user
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  // Change password
  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/users/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(passwordData)
      })

      if (!response.ok) {
        throw new Error(`Failed to change password: ${response.statusText}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      throw error
    }
  }

  // Calculate profile completion percentage
  calculateProfileCompletion(profile: UserProfile): number {
    const fields = [
      profile.name,
      profile.email,
      profile.phoneNumber,
      profile.dateOfBirth,
      profile.gender,
      profile.address,
      profile.bloodType,
      profile.emergencyContact
    ]

    const completedFields = fields.filter(field => field && field.trim() !== '').length
    return Math.round((completedFields / fields.length) * 100)
  }

  // Get profile statistics
  async getProfileStats(): Promise<ProfileStats> {
    try {
      const profile = await this.getUserProfile()
      
      // In a real app, these would come from separate API calls
      // For now, we'll calculate/mock some values
      const profileCompletion = this.calculateProfileCompletion(profile)
      
      return {
        profileCompletion,
        totalAppointments: 12, // This would come from appointments API
        activeMedications: 3,   // This would come from medications API
        healthRecords: 8,       // This would come from EHR API
        lastUpdate: profile.updatedAt
      }
    } catch (error) {
      console.error('Error fetching profile stats:', error)
      throw error
    }
  }

  // Parse allergies from JSON string
  parseAllergies(allergiesJson?: string): string[] {
    if (!allergiesJson) return []
    try {
      return JSON.parse(allergiesJson)
    } catch {
      // If it's not JSON, treat as comma-separated string
      return allergiesJson.split(',').map(a => a.trim()).filter(a => a)
    }
  }

  // Convert allergies array to JSON string
  stringifyAllergies(allergies: string[]): string {
    return JSON.stringify(allergies)
  }

  // Parse emergency contacts from JSON string
  parseEmergencyContacts(contactsJson?: string): Array<{name: string, relationship: string, phone: string}> {
    if (!contactsJson) return []
    try {
      return JSON.parse(contactsJson)
    } catch {
      // If it's not JSON, return empty array
      return []
    }
  }

  // Convert emergency contacts array to JSON string
  stringifyEmergencyContacts(contacts: Array<{name: string, relationship: string, phone: string}>): string {
    return JSON.stringify(contacts)
  }

  // Format date for display
  formatDate(dateString?: string): string {
    if (!dateString) return ''
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  // Format date for input field
  formatDateForInput(dateString?: string): string {
    if (!dateString) return ''
    try {
      return new Date(dateString).toISOString().split('T')[0]
    } catch {
      return ''
    }
  }

  // Auto-save profile changes with debouncing
  private saveTimeout: NodeJS.Timeout | null = null
  
  autoSaveProfile(updates: UpdateProfileRequest, delay: number = 2000): Promise<UserProfile> {
    return new Promise((resolve, reject) => {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout)
      }

      this.saveTimeout = setTimeout(async () => {
        try {
          const updatedProfile = await this.updateProfile(updates)
          resolve(updatedProfile)
        } catch (error) {
          reject(error)
        }
      }, delay)
    })
  }

  // Cancel pending auto-save
  cancelAutoSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }
  }
}

export const profileService = new ProfileService()
export default profileService
