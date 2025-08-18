import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/getUserRole'
import { Building2, Users, Pill, DollarSign } from 'lucide-react'

export default async function AdminPanel() {
  try {
    await requireRole(['system_admin'])
  } catch {
    redirect('/')
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin – Data Governance</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Hospitals', icon: Building2 },
            { title: 'Doctors', icon: Users },
            { title: 'Drug Catalogue', icon: Pill },
            { title: 'Tariffs', icon: DollarSign },
          ].map((card) => (
            <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-gray-900 font-semibold"><card.icon className="w-5 h-5"/> {card.title}</div>
              <p className="text-sm text-gray-600 mt-2">Create, read, update, and delete records.</p>
              <button className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">Manage</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}


