'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import Navigation from './Navigation'
import Sidebar from './Sidebar'
import Footer from './Footer'

interface DoctorPortalWrapperProps {
  children: ReactNode
  session: any
}

export default function DoctorPortalWrapper({ children, session }: DoctorPortalWrapperProps) {
  const pathname = usePathname()
  const isDoctorPortal = pathname?.startsWith('/doctor-portal')
  const isAdminPortal = pathname?.startsWith('/admin')

  if (isDoctorPortal || isAdminPortal) {
    // For doctor portal or admin portal, render only the children without Navigation, Sidebar, or Footer
    return <>{children}</>
  }

  // For regular pages, render with Navigation, Sidebar, and Footer
  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {session?.user && <Sidebar />}
        <main className={session?.user ? "flex-1" : "w-full"}>
          {children}
        </main>
      </div>
      <Footer />
    </>
  )
}
