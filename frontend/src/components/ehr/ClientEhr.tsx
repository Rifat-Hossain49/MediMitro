'use client'

import { useEffect, useState } from 'react'

type Doc = { id: string; name: string; sizeKB: number; type: string; dataUrl: string }

const EHR_KEY = 'mm_ehr_docs_v1'

export default function ClientEhr() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => { try { const raw = localStorage.getItem(EHR_KEY); if (raw) setDocs(JSON.parse(raw)) } catch {} }, [])
  useEffect(() => { try { localStorage.setItem(EHR_KEY, JSON.stringify(docs)) } catch {} }, [docs])

  const onUpload = async (file: File) => {
    setBusy(true)
    try {
      const dataUrl = await readAsDataUrl(file)
      const id = `d_${Date.now()}`
      setDocs((prev) => [{ id, name: file.name, sizeKB: Math.round(file.size / 1024), type: file.type || 'file', dataUrl }, ...prev])
    } finally {
      setBusy(false)
    }
  }

  const remove = (id: string) => setDocs((prev) => prev.filter((d) => d.id !== id))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
          <label className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer">
            <input type="file" className="hidden" onChange={(e) => e.target.files && onUpload(e.target.files[0])} />
            Upload
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="font-medium text-gray-900">{d.name}</p>
                <p className="text-sm text-gray-600">{d.type || 'file'} • {d.sizeKB} KB</p>
              </div>
              <div className="flex items-center gap-3">
                <a href={d.dataUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">View</a>
                <button onClick={() => remove(d.id)} className="text-red-600 hover:underline text-sm">Remove</button>
              </div>
            </div>
          ))}
          {docs.length === 0 && <div className="text-gray-500 p-4 border rounded-lg">No records yet. Upload to get started.</div>}
        </div>
      </section>

      <aside className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Share Access</h3>
        <p className="text-sm text-gray-700">Generate a one-time code to share records with a doctor.</p>
        <button disabled className="w-full inline-flex items-center justify-center gap-2 bg-gray-200 text-gray-600 px-4 py-2 rounded-lg">Coming soon</button>
      </aside>
    </div>
  )
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}


