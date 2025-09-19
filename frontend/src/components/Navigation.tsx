'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Menu, X, Heart, Calendar, FileText, Users, AlertCircle, User, LogOut } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import Sidebar from './Sidebar'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { user } = useUser()

  const isActive = (href: string) => pathname === href

  // Sliding sidebar state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeOnOutside = (e: MouseEvent) => {
    if (!drawerRef.current) return
    if (!drawerRef.current.contains(e.target as Node)) setDrawerOpen(false)
  }
  useEffect(() => {
    if (!drawerOpen) return
    document.addEventListener('mousedown', closeOnOutside)
    return () => document.removeEventListener('mousedown', closeOnOutside)
  }, [drawerOpen])

  return (
    <nav className="sticky top-0 z-50 bg-white/70 supports-[backdrop-filter]:bg-white/60 backdrop-blur shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <div className="flex items-center min-w-0">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">MediMitro</span>
                <span className="text-xs text-gray-500 -mt-1">Health Companion</span>
              </div>
            </Link>
          </div>
          {/* Quick Actions (center, md+) */}
          {session && (
            <div className="hidden md:flex items-center gap-2 flex-1 justify-center min-w-0">
              <Link href="/appointments" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 whitespace-nowrap">
                <Calendar className="w-4 h-4" /> Book Appointment
              </Link>
              <Link href="/ehr" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-600 text-white text-sm hover:bg-green-700 whitespace-nowrap">
                <FileText className="w-4 h-4" /> View Records
              </Link>
              <Link href="/appointments" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-600 text-white text-sm hover:bg-purple-700 whitespace-nowrap">
                <Users className="w-4 h-4" /> Find Doctors
              </Link>
              <Link href="/hire-ambulance" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 text-white text-sm hover:bg-red-700 whitespace-nowrap animate-pulse">
                <AlertCircle className="w-4 h-4" /> Emergency
              </Link>
            </div>
          )}

          {/* Right corner - Auth buttons */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                  aria-label="Open menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user?.name || session.user?.name || session.user?.email}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          signOut({ callbackUrl: '/' })
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button (left already has brand) */}
        </div>
      </div>

      {/* Sliding drawer for mobile */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${drawerOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!drawerOpen}
      >
        {/* overlay */}
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setDrawerOpen(false)}
        />
        {/* panel */}
        <div
          ref={drawerRef}
          className={`absolute left-0 top-0 h-full w-72 bg-white shadow-xl transition-transform ${drawerOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold">MediMitro</span>
            </div>
            <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="p-1 rounded-md hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-2">
            {session && (
              <Sidebar onNavigate={() => setDrawerOpen(false)} />
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
