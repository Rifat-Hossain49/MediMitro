'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RoleRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (session?.user?.role === 'admin') {
      router.replace('/admin/dashboard')
    } else if (session?.user?.role === 'doctor') {
      router.replace('/doctor-portal')
    } else if (session?.user?.role === 'patient') {
      router.replace('/dashboard')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your portal...</p>
      </div>
    </div>
  )
}
