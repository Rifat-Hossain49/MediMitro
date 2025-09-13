'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { UserProfile, profileService } from '@/lib/profileService'

interface UserContextType {
  user: UserProfile | null
  loading: boolean
  error: string | null
  updateUser: (updates: Partial<UserProfile>) => Promise<void>
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)
      const userData = await profileService.getUserProfile()
      setUser(userData)
    } catch (err) {
      console.error('Failed to fetch user:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch user data')
      // For development, set a mock user if API fails
      if (process.env.NODE_ENV === 'development') {
        setUser({
          id: 'mock-user-id',
          email: 'john.doe@email.com',
          name: 'John Doe',
          role: 'patient',
          phoneNumber: '+1 (555) 123-4567',
          dateOfBirth: '1985-03-15',
          gender: 'Male',
          address: '123 Health Street, Medical City, MC',
          bloodType: 'O+',
          allergies: '["Penicillin", "Peanuts"]',
          emergencyContact: '[{"name": "Jane Doe", "relationship": "Spouse", "phone": "+1 (555) 987-6543"}]',
          emailVerified: true,
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: new Date().toISOString()
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (updates: Partial<UserProfile>) => {
    try {
      setError(null)
      const updatedUser = await profileService.updateProfile(updates)
      setUser(updatedUser)
    } catch (err) {
      console.error('Failed to update user:', err)
      setError(err instanceof Error ? err.message : 'Failed to update user data')
      throw err
    }
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const value: UserContextType = {
    user,
    loading,
    error,
    updateUser,
    refreshUser,
    isAuthenticated: !!user
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export default UserContext

