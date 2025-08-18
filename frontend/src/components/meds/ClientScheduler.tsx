'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Medication, DoseLog } from '@/lib/meds/types'

const MEDS_KEY = 'mm_meds_v1'
const LOG_KEY = 'mm_meds_log_v1'
const NOTIFY_KEY = 'mm_meds_notify_v1'
const ENABLE_KEY = 'mm_meds_reminders_enabled'

function nowLocalISODate() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

export default function ClientScheduler() {
  const [meds, setMeds] = useState<Medication[]>([])
  const [log, setLog] = useState<DoseLog>({})
  const [notifyLog, setNotifyLog] = useState<Record<string, boolean>>({})
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(true)
  const intervalRef = useRef<number | null>(null)

  const [form, setForm] = useState({ name: '', dose: '', timesPerDay: 2, times: ['08:00', '20:00'], startDate: nowLocalISODate(), notes: '' })

  useEffect(() => {
    try { const raw = localStorage.getItem(MEDS_KEY); if (raw) setMeds(JSON.parse(raw)) } catch {}
    try { const raw = localStorage.getItem(LOG_KEY); if (raw) setLog(JSON.parse(raw)) } catch {}
    try { const rawN = localStorage.getItem(NOTIFY_KEY); if (rawN) setNotifyLog(JSON.parse(rawN)) } catch {}
    try { const rawE = localStorage.getItem(ENABLE_KEY); if (rawE) setRemindersEnabled(JSON.parse(rawE)) } catch {}
  }, [])

  useEffect(() => { try { localStorage.setItem(MEDS_KEY, JSON.stringify(meds)) } catch {} }, [meds])
  useEffect(() => { try { localStorage.setItem(LOG_KEY, JSON.stringify(log)) } catch {} }, [log])
  useEffect(() => { try { localStorage.setItem(NOTIFY_KEY, JSON.stringify(notifyLog)) } catch {} }, [notifyLog])
  useEffect(() => { try { localStorage.setItem(ENABLE_KEY, JSON.stringify(remindersEnabled)) } catch {} }, [remindersEnabled])

  useEffect(() => {
    if (!remindersEnabled) {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      intervalRef.current = null
      return
    }
    // Ask permission once
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }

    const check = () => {
      try {
        const now = new Date()
        const todayStr = now.toISOString().slice(0, 10)
        for (const m of meds) {
          if (m.startDate > todayStr) continue
          for (const t of m.times) {
            const key = `${m.id}_${todayStr}_${t}`
            if (log[key]) continue // already taken
            if (notifyLog[key]) continue // already notified
            const due = dateAtLocalTime(todayStr, t)
            const msUntil = due.getTime() - now.getTime()
            // window: from -5 min to +10 min around due time triggers once
            if (msUntil <= 10 * 60 * 1000 && msUntil >= -5 * 60 * 1000) {
              triggerReminder(m.name, m.dose, t)
              setNotifyLog((prev) => ({ ...prev, [key]: true }))
            }
          }
        }
      } catch {}
    }

    check()
    const id = window.setInterval(check, 60 * 1000)
    intervalRef.current = id
    return () => {
      window.clearInterval(id)
      intervalRef.current = null
    }
  }, [meds, log, notifyLog, remindersEnabled])

  function dateAtLocalTime(dateISO: string, time: string): Date {
    const [h, m] = time.split(':').map((n) => Number(n))
    const d = new Date(dateISO + 'T00:00:00')
    d.setHours(h, m, 0, 0)
    return d
  }

  function triggerReminder(name: string, dose: string, time: string) {
    const title = `Time for ${name}`
    const body = `${dose} at ${time}`
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, silent: true })
      }
    } catch {}
  }

  const addMedication = () => {
    const id = `m_${Date.now()}`
    setMeds((prev) => [...prev, { id, name: form.name, dose: form.dose, timesPerDay: form.timesPerDay, times: form.times.slice(0, form.timesPerDay), startDate: form.startDate, notes: form.notes }])
    setForm({ name: '', dose: '', timesPerDay: 2, times: ['08:00', '20:00'], startDate: nowLocalISODate(), notes: '' })
  }

  const toggleTaken = (medId: string, date: string, time: string) => {
    const key = `${medId}_${date}_${time}`
    setLog((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const today = nowLocalISODate()
  const adherence = useMemo(() => {
    const total = meds.reduce((acc, m) => acc + m.times.length, 0)
    const taken = meds.reduce((acc, m) => acc + m.times.filter((t) => log[`${m.id}_${today}_${t}`]).length, 0)
    return total ? Math.round((taken / total) * 100) : 0
  }, [meds, log, today])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder:text-gray-500" placeholder="Medication name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 placeholder:text-gray-500" placeholder="Dose (e.g., 500mg)" value={form.dose} onChange={(e) => setForm({ ...form, dose: e.target.value })} />
          <select className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900" value={form.timesPerDay} onChange={(e) => setForm({ ...form, timesPerDay: Number(e.target.value) })}>
            {[1,2,3,4].map((n) => <option key={n} value={n}>{n}x/day</option>)}
          </select>
          <input className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          {[...Array(form.timesPerDay)].map((_, i) => (
            <input key={i} className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900" type="time" value={form.times[i] ?? ''} onChange={(e) => setForm({ ...form, times: Object.assign([...form.times], { [i]: e.target.value }) })} />
          ))}
          <input className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 md:col-span-2 placeholder:text-gray-500" placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        <button className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700" onClick={addMedication}>Add</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Today</h2>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">Adherence: <span className="font-medium text-gray-900">{adherence}%</span></div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-emerald-600" checked={remindersEnabled} onChange={(e) => setRemindersEnabled(e.target.checked)} />
              <span className="text-gray-700">Reminders</span>
            </label>
          </div>
        </div>
        <div className="space-y-4">
          {meds.length === 0 && <div className="text-gray-500">No medications scheduled.</div>}
          {meds.map((m) => (
            <div key={m.id} className="p-4 border rounded-lg">
              <div className="font-medium text-gray-900">{m.name} – {m.dose}</div>
              <div className="text-xs text-gray-500">Start {m.startDate}{m.notes ? ` • ${m.notes}` : ''}</div>
              <div className="flex flex-wrap gap-2 mt-3">
                {m.times.map((t) => {
                  const key = `${m.id}_${today}_${t}`
                  const taken = !!log[key]
                  return (
                    <button key={t} onClick={() => toggleTaken(m.id, today, t)} className={`px-3 py-1.5 rounded-full text-sm ${taken ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                      {t} {taken ? '✓' : ''}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


