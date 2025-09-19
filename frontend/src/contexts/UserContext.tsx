'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
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
  const { data: session, status } = useSession()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    // Only fetch user profile if user is authenticated
    if (!session?.user?.email || status !== 'authenticated') {
      setUser(null)
      setLoading(false)
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const userData = await profileService.getUserProfile()
      setUser(userData)
    } catch (err) {
      console.error('Failed to fetch user:', err)
      // Only set error if we're still authenticated (avoid errors during sign-out)
      if (status === 'authenticated') {
        setError(err instanceof Error ? err.message : 'Failed to fetch user data')
      }
      setUser(null)
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

  // Only fetch user profile when session is available and authenticated
  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
      return
    }

    if (status === 'authenticated' && session?.user?.email) {
      fetchUser()
    } else if (status === 'unauthenticated') {
      // Clear user data when unauthenticated
      setUser(null)
      setLoading(false)
      setError(null)
    }
  }, [session, status])

  const value: UserContextType = {
    user,
    loading: loading || status === 'loading',
    error,
    updateUser,
    refreshUser,
    isAuthenticated: status === 'authenticated' && !!session?.user
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export default UserContext

