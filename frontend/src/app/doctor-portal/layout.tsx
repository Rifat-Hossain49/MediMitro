import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Doctor Portal - MediMitro',
  description: 'Doctor portal for healthcare professionals',
}

export default function DoctorPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
