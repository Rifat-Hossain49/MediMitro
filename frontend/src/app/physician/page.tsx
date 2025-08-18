import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/getUserRole'
import { Stethoscope, Pill } from 'lucide-react'

export default async function PhysicianPortal() {
  try {
    await requireRole(['doctor'])
  } catch {
    redirect('/')
  }

  return (
    <div className="min-h-screen">
      <main className="py-2">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Physician Portal</h1>
          <p className="text-gray-600 mt-1">Access authorized EHR and create e‑prescriptions.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Stethoscope className="w-5 h-5"/> Patient Lookup</h2>
            <div className="space-y-3">
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Enter QR/OTP or Patient ID" />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Retrieve Records</button>
            </div>
          </section>
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Pill className="w-5 h-5"/> Create e‑Prescription</h2>
            <div className="space-y-3">
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Medication name" />
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Dosage & schedule" />
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Issue Prescription</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}


