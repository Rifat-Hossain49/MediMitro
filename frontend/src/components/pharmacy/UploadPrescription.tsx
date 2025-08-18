'use client'

import React, { useRef, useState } from 'react'

type Props = {
  onUpload: (file: File) => Promise<void>
}

export default function UploadPrescription({ onUpload }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      await onUpload(file)
    } catch (err) {
      setError('Upload failed')
    } finally {
      setBusy(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={onChange}
        disabled={busy}
        className="block w-full text-sm text-gray-900 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
      />
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}


