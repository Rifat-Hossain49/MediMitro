import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/getUserRole'
import { FileText, Upload, Shield } from 'lucide-react'

export default async function EHRPage() {
  try {
    await requireRole(['patient'])
  } catch {
    redirect('/')
  }

  return (
    <div className="min-h-screen">
      <main className="py-2">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Health Records</h1>
          <p className="text-gray-600 mt-1">Secure, patient-controlled storage and sharing.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
              <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <Upload className="w-4 h-4" /> Upload
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Record #{i}</p>
                    <p className="text-sm text-gray-600">PDF • 1.2 MB</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Access</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-700">Generate a one-time QR or OTP for doctor access.</p>
              </div>
              <button className="w-full inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                <Shield className="w-4 h-4" /> Generate Secure Code
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}


