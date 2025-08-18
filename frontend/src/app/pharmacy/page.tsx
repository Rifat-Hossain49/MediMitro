import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/getUserRole'
import { ShoppingCart, Pill } from 'lucide-react'

export default async function Pharmacy() {
  try {
    await requireRole(['patient'])
  } catch {
    redirect('/')
  }

  const products = [
    { name: 'Amoxicillin 500mg', type: 'Rx', price: '$8.99' },
    { name: 'Paracetamol 500mg', type: 'OTC', price: '$3.49' },
    { name: 'Cetirizine 10mg', type: 'OTC', price: '$4.20' },
  ]

  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Pharmacy</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 text-gray-900 font-semibold"><Pill className="w-5 h-5"/> {p.name}</div>
              <p className="text-sm text-gray-600">{p.type}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="font-medium text-gray-900">{p.price}</span>
                <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"><ShoppingCart className="w-4 h-4"/> Add</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}


