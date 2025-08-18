import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/getUserRole'
import { MapPin, Navigation as NavIcon, PhoneCall } from 'lucide-react'

export default async function AmbulanceBooking() {
  try {
    await requireRole(['patient'])
  } catch {
    redirect('/')
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Ambulance Dispatch</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="h-80 rounded-lg bg-gradient-to-br from-blue-100 to-green-100 border border-gray-200 flex items-center justify-center text-gray-600">Map preview (live tracking)</div>
          </section>
          <aside className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
            <div className="flex items-center gap-2 text-gray-900 font-semibold"><MapPin className="w-5 h-5"/> Your location</div>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2" placeholder="Address or use GPS" />
            <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><NavIcon className="w-4 h-4"/> Request Ambulance</button>
            <button className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"><PhoneCall className="w-4 h-4"/> Call Support</button>
          </aside>
        </div>
      </main>
    </div>
  )
}


