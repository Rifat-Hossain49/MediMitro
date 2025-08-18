import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/getUserRole'
import { Bell, Pill } from 'lucide-react'

export default async function MedicationScheduler() {
  try {
    await requireRole(['patient'])
  } catch {
    redirect('/')
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Medication Scheduler</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border border-gray-200 rounded-lg px-3 py-2" placeholder="Medication name" />
            <input className="border border-gray-200 rounded-lg px-3 py-2" placeholder="Dose (e.g., 500mg)" />
            <input className="border border-gray-200 rounded-lg px-3 py-2" placeholder="Frequency (e.g., 2x/day)" />
            <input className="border border-gray-200 rounded-lg px-3 py-2" placeholder="Start date" />
          </div>
          <div className="flex items-center gap-2 text-gray-700"><Bell className="w-4 h-4"/> SMS/Push reminders will be sent at dose times.</div>
          <button className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"><Pill className="w-4 h-4"/> Schedule</button>
        </div>
      </main>
    </div>
  )
}


