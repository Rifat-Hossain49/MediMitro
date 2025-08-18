'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { products } from '@/lib/pharmacy/data'
import { Pill, Search, Filter } from 'lucide-react'
import { useCart } from './CartContext'
import ProductCard from './ProductCard'

const categories = Array.from(new Set(products.map((p) => p.category)))

export default function Catalog() {
  const { addToCart } = useCart()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | 'All'>('All')
  const [rxOnly, setRxOnly] = useState(false)

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (rxOnly && !p.rxRequired) return false
      if (category !== 'All' && p.category !== category) return false
      const q = query.trim().toLowerCase()
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.genericName.toLowerCase().includes(q)
      )
    })
  }, [query, category, rxOnly])

  return (
    <div>
      <div className="flex flex-col md:flex-row items-stretch md:items-end gap-3 mb-6">
        <div className="flex-1">
          <label className="text-sm text-gray-800">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Search by brand, generic, or name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-600">Category</label>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              className="pl-9 pr-8 py-2 border rounded-lg min-w-48 bg-white text-gray-900"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            >
              <option>All</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <label className="inline-flex items-center gap-2 select-none">
          <input type="checkbox" checked={rxOnly} onChange={(e) => setRxOnly(e.target.checked)} className="accent-blue-600" />
          <span className="text-sm text-gray-700">Prescription items only</span>
        </label>
      </div>

      <SectionedGrid products={filtered} />
    </div>
  )
}

function SectionedGrid({ products }: { products: typeof import('@/lib/pharmacy/data').products }) {
  const byCategory = products.reduce<Record<string, typeof products>>((acc, p) => {
    acc[p.category] = acc[p.category] || []
    acc[p.category].push(p)
    return acc
  }, {})

  return (
    <div className="space-y-10">
      {Object.entries(byCategory).map(([category, items]) => (
        <div key={category}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">{category}</h3>
            <Link href={`/pharmacy?category=${encodeURIComponent(category)}`} className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}


