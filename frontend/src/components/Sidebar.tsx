'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import type { Role } from '@/lib/roles'
import { Heart, Calendar, FileText, Pill, MapPin, BedDouble, ShoppingCart, User, Settings } from 'lucide-react'

type NavItem = { name: string; href: string; icon: React.ComponentType<{ className?: string }> }

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role: Role = (session?.user?.role as Role) || 'patient'

  const base: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Heart },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'EHR', href: '/ehr', icon: FileText },
  ]

  const patient: NavItem[] = [
    { name: 'Prescriptions', href: '/prescriptions', icon: FileText },
    { name: 'Medications', href: '/meds', icon: Pill },
    { name: 'Hire Ambulance', href: '/hire-ambulance', icon: MapPin },
    { name: 'ICU Beds', href: '/icu', icon: BedDouble },
    { name: 'Pharmacy', href: '/pharmacy', icon: ShoppingCart },
  ]

  const doctor: NavItem[] = [
    { name: 'Physician', href: '/physician', icon: User },
    { name: 'ICU Beds', href: '/icu', icon: BedDouble },
  ]

  const admin: NavItem[] = [
    { name: 'Admin', href: '/admin', icon: Settings },
  ]

  const tail: NavItem[] = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const items: NavItem[] = [
    ...base,
    ...(role === 'patient' ? patient : []),
    ...(role === 'doctor' ? doctor : []),
    ...(role === 'system_admin' ? admin : []),
    ...tail,
  ]

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:gap-2 border-r border-gray-100 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-4">
      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <motion.div
              key={item.name}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active 
                    ? 'text-blue-700 bg-gradient-to-r from-blue-50 to-blue-100 border-r-2 border-blue-500' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50'
                }`}
                aria-current={active ? 'page' : undefined}
                onClick={onNavigate}
              >
                <motion.div
                  whileHover={{ rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : ''}`} />
                </motion.div>
                <span className={active ? 'font-semibold' : ''}>{item.name}</span>
              </Link>
            </motion.div>
          )
        })}
      </nav>
    </aside>
  )
}


