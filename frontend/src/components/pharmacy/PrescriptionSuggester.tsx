'use client'

import { useEffect, useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import * as Tesseract from 'tesseract.js'
import { products } from '@/lib/pharmacy/data'
import { useCart } from './CartContext'
import UploadPrescription from './UploadPrescription'

type Extracted = {
  text: string
  lines: string[]
}

const fuse = new Fuse(products, {
  keys: [
    { name: 'genericName', weight: 0.6 },
    { name: 'name', weight: 0.25 },
    { name: 'brand', weight: 0.15 },
  ],
  threshold: 0.4,
})

function normalize(text: string) {
  return text.replace(/[^a-z0-9\s]/gi, ' ').replace(/\s+/g, ' ').trim().toLowerCase()
}

function parseMedicineCandidates(lines: string[]) {
  const tokens = lines.flatMap((l) => normalize(l).split(' ')).filter(Boolean)
  const unique = Array.from(new Set(tokens)).filter((t) => t.length > 2)
  const results = new Map<string, { score: number; productId: string }>()
  for (const token of unique) {
    const matches = fuse.search(token).slice(0, 3)
    for (const m of matches) {
      const prev = results.get(m.item.id)
      const score = Math.max(0, 1 - (m.score ?? 1))
      if (!prev || score > prev.score) results.set(m.item.id, { score, productId: m.item.id })
    }
  }
  return Array.from(results.values())
    .sort((a, b) => b.score - a.score)
    .map((r) => ({ product: products.find((p) => p.id === r.productId)!, score: r.score }))
}

export default function PrescriptionSuggester() {
  const { addToCart, uploadPrescription, prescriptions } = useCart()
  const [ocr, setOcr] = useState<Extracted | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const suggestions = useMemo(() => (ocr ? parseMedicineCandidates(ocr.lines).slice(0, 10) : []), [ocr])

  const runOCR = async (file: File) => {
    setBusy(true)
    setError(null)
    try {
      const { data } = await Tesseract.recognize(file, 'eng')
      const text = data.text ?? ''
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length)
      setOcr({ text, lines })
    } catch (e) {
      setError('Could not read prescription. Try a clearer photo.')
    } finally {
      setBusy(false)
    }
  }

  // Auto-suggest using most recent uploaded prescription if available
  useEffect(() => {
    // Find the last uploaded file (any productId)
    const last = prescriptions[prescriptions.length - 1]
    if (!last || ocr || busy) return
    ;(async () => {
      try {
        setBusy(true)
        const res = await fetch(last.dataUrl)
        const blob = await res.blob()
        const file = new File([blob], last.fileName || 'prescription.png', { type: blob.type })
        await runOCR(file)
      } catch {
        // ignore auto run failures
      } finally {
        setBusy(false)
      }
    })()
  }, [prescriptions, ocr, busy])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Suggested from your prescription</h2>
        <button
          className="text-xs text-blue-700 hover:underline disabled:text-gray-400"
          onClick={async () => {
            const last = prescriptions[prescriptions.length - 1]
            if (!last) return
            const res = await fetch(last.dataUrl)
            const blob = await res.blob()
            const file = new File([blob], last.fileName || 'prescription.png', { type: blob.type })
            await runOCR(file)
          }}
          disabled={prescriptions.length === 0 || busy}
        >
          Re-run on last upload
        </button>
      </div>

      <div className="space-y-4">
        <UploadPrescription
          onUpload={async (file) => {
            await uploadPrescription(file, '__general__')
            await runOCR(file)
          }}
        />
        {busy && <p className="text-sm text-gray-500">Reading prescription…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {suggestions.length > 0 && (
          <div className="pt-2 border-t">
            <ul className="divide-y">
              {suggestions.map(({ product, score }) => (
                <li key={product.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.brand} • {product.genericName} • {product.strength}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Match {(score * 100).toFixed(0)}%</span>
                    <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700" onClick={() => addToCart(product.id, 1)}>Add</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {ocr?.text && (
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer select-none">OCR text</summary>
            <pre className="whitespace-pre-wrap mt-2">{ocr.text}</pre>
          </details>
        )}
      </div>
    </div>
  )
}


