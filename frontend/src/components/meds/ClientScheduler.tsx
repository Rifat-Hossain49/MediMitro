'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Pill,
  Bell,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  Target,
  Trash2,
  Edit3,
  Heart,
  Star,
  Timer,
  Sparkles,
  PlusCircle
} from 'lucide-react'
import type { Medication, DoseLog } from '@/lib/meds/types'
import { profileService } from '@/lib/profileService'
import { medicationService, type PatientMedication } from '@/lib/meds/medicationService'

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
  const [activeTab, setActiveTab] = useState('schedule') // schedule, add
  const [showAddModal, setShowAddModal] = useState(false)
  const [userProfile, setUserProfile] = useState({ email: '', phone: '', id: '' })
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null)
  const alarmTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false)

  const [form, setForm] = useState({
    name: '',
    dose: '',
    timesPerDay: 2,
    times: ['08:00', '20:00'],
    startDate: nowLocalISODate(),
    notes: '',
    category: 'prescription' as const,
    priority: 'medium' as const,
    notifications: {
      browser: true,
      email: false,
      sms: false,
      alarm: false,
      reminderMinutes: 15
    }
  })

  // Convert backend medication to frontend format
  const convertBackendToFrontend = (backendMed: any): Medication => {
    console.log('🔄 Converting backend medication:', backendMed)
    
    // Parse frequency to determine times per day and times
    const frequency = (backendMed.frequency || '').toLowerCase()
    let timesPerDay = 1
    let times = ['08:00']
    
    if (frequency.includes('twice') || frequency.includes('2x')) {
      timesPerDay = 2
      times = ['08:00', '20:00']
    } else if (frequency.includes('three') || frequency.includes('3x')) {
      timesPerDay = 3
      times = ['08:00', '14:00', '20:00']
    } else if (frequency.includes('four') || frequency.includes('4x')) {
      timesPerDay = 4
      times = ['08:00', '12:00', '16:00', '20:00']
    }

    const converted = {
      id: backendMed.id,
      name: backendMed.medication_name || backendMed.medicationName || '',
      dose: backendMed.dosage || '',
      timesPerDay,
      times,
      startDate: backendMed.start_date || backendMed.startDate || '',
      notes: backendMed.notes || '',
      category: 'prescription' as const,
      priority: 'medium' as const,
      notifications: {
        browser: true,
        email: false,
        sms: false,
        alarm: false,
        reminderMinutes: 15
      },
      endDate: backendMed.end_date || backendMed.endDate,
      doctorName: backendMed.prescribed_by_name || backendMed.prescribedByName
    }
    
    console.log('✅ Converted to frontend format:', converted)
    return converted
  }

  // Convert frontend medication to backend format
  const convertFrontendToBackend = (frontendMed: Medication): MedicationRequest => {
    const frequency = `${frontendMed.timesPerDay} times daily (${frontendMed.times.join(', ')})`
    
    return {
      patientId: userProfile.id,
      medicationName: frontendMed.name,
      dosage: frontendMed.dose,
      frequency,
      route: 'oral',
      startDate: frontendMed.startDate,
      endDate: frontendMed.endDate,
      status: 'active',
      reason: frontendMed.notes,
      notes: frontendMed.notes
    }
  }

  // Load medications from backend
  const loadMedications = async () => {
    if (!userProfile.id) return
    
    try {
      setLoading(true)
      console.log('🔄 Loading medications for user:', userProfile.id)
      const backendMeds = await medicationService.getMedications(userProfile.id)
      console.log('📦 Backend medications received:', backendMeds)
      const frontendMeds = backendMeds.map(convertBackendToFrontend)
      console.log('🎯 Frontend medications after conversion:', frontendMeds)
      setMeds(frontendMeds)
    } catch (error) {
      console.error('Failed to load medications:', error)
      // Fallback to localStorage
      try { 
        const raw = localStorage.getItem(MEDS_KEY)
        if (raw) setMeds(JSON.parse(raw))
      } catch { }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    try { const raw = localStorage.getItem(LOG_KEY); if (raw) setLog(JSON.parse(raw)) } catch { }
    try { const rawN = localStorage.getItem(NOTIFY_KEY); if (rawN) setNotifyLog(JSON.parse(rawN)) } catch { }
    try { const rawE = localStorage.getItem(ENABLE_KEY); if (rawE) setRemindersEnabled(JSON.parse(rawE)) } catch { }
  }, [])

  // Load user profile from context
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await profileService.getUserProfile()
        setUserProfile({
          id: profile.id || '',
          email: profile.email || '',
          phone: profile.phoneNumber || ''
        })
      } catch (error) {
        console.error('Failed to load user profile for notifications:', error)
        // Fallback to empty profile
        setUserProfile({ id: '', email: '', phone: '' })
      }
    }

    loadUserProfile()
  }, [])

  // Load medications when user profile is loaded
  useEffect(() => {
    if (userProfile.id) {
      loadMedications()
    }
  }, [userProfile.id])

  useEffect(() => { try { localStorage.setItem(MEDS_KEY, JSON.stringify(meds)) } catch { } }, [meds])
  useEffect(() => { try { localStorage.setItem(LOG_KEY, JSON.stringify(log)) } catch { } }, [log])
  useEffect(() => { try { localStorage.setItem(NOTIFY_KEY, JSON.stringify(notifyLog)) } catch { } }, [notifyLog])
  useEffect(() => { try { localStorage.setItem(ENABLE_KEY, JSON.stringify(remindersEnabled)) } catch { } }, [remindersEnabled])

  useEffect(() => {
    if (!remindersEnabled) {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      intervalRef.current = null
      return
    }
    // Ask permission once
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => { })
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
              triggerReminder(m.name, m.dose, t, m)
              setNotifyLog((prev) => ({ ...prev, [key]: true }))
            }
          }
        }
      } catch { }
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

  function triggerReminder(name: string, dose: string, time: string, medication?: Medication) {
    const title = `Time for ${name}`
    const body = `${dose} at ${time}`

    try {
      // Browser notification
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body,
          icon: '/pill-icon.png',
          badge: '/pill-badge.png',
          tag: `med-${name}-${time}`,
          requireInteraction: true
        })

        notification.onclick = () => {
          window.focus()
          notification.close()
        }
      }

      // Email notification (if enabled and email available)
      if (medication?.notifications?.email && userProfile.email) {
        sendEmailNotification(userProfile.email, title, body)
      }

      // SMS notification (if enabled and phone available)
      if (medication?.notifications?.sms && userProfile.phone) {
        sendSMSNotification(userProfile.phone, `${title}: ${body}`)
      }

      // Alarm sound (if enabled)
      if (medication?.notifications?.alarm) {
        playAlarmSound()
      }

    } catch (error) {
      console.error('Notification error:', error)
    }
  }

  const sendEmailNotification = async (email: string, subject: string, message: string) => {
    try {
      // This would integrate with your backend email service
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message })
      })
      console.log('Email notification sent:', response.ok)
    } catch (error) {
      console.error('Email notification failed:', error)
    }
  }

  const sendSMSNotification = async (phone: string, message: string) => {
    try {
      // This would integrate with your backend SMS service (Twilio, etc.)
      const response = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message })
      })
      console.log('SMS notification sent:', response.ok)
    } catch (error) {
      console.error('SMS notification failed:', error)
    }
  }

  const playAlarmSound = () => {
    try {
      if (isAlarmPlaying) return // Prevent multiple alarms

      setIsAlarmPlaying(true)

      // Try to use Web Audio API for beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      const playBeep = () => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime) // 800Hz beep
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)

        oscillator.start()
        oscillator.stop(audioContext.currentTime + 0.2) // Short beep

        // Schedule next beep
        alarmTimeoutRef.current = setTimeout(() => {
          playBeep()
        }, 800) // Beep every 800ms
      }

      playBeep()

      // Auto-stop after 30 seconds
      setTimeout(() => {
        stopAlarm()
      }, 30000)

    } catch (error) {
      console.error('Alarm sound failed:', error)
      setIsAlarmPlaying(false)
      // Fallback: show alert
      alert('🔔 Medication Reminder: Time to take your medicine!')
    }
  }

  const stopAlarm = () => {
    setIsAlarmPlaying(false)

    if (alarmTimeoutRef.current) {
      clearTimeout(alarmTimeoutRef.current)
      alarmTimeoutRef.current = null
    }

    if (alarmAudioRef.current) {
      try {
        alarmAudioRef.current.pause()
        alarmAudioRef.current.currentTime = 0
      } catch (error) {
        // Ignore errors when stopping audio
      }
      alarmAudioRef.current = null
    }
  }

  const addMedication = async () => {
    if (!userProfile.id) {
      alert('Please log in to add medications')
      return
    }

    try {
      setLoading(true)
      
      const frontendMed: Medication = {
        id: `m_${Date.now()}`,
        name: form.name,
        dose: form.dose,
        timesPerDay: form.timesPerDay,
        times: form.times.slice(0, form.timesPerDay),
        startDate: form.startDate,
        notes: form.notes,
        category: form.category,
        priority: form.priority,
        notifications: form.notifications
      }

      const backendMed = convertFrontendToBackend(frontendMed)
      const result = await medicationService.addMedication(backendMed)

      if (result.success) {
        // Update the frontend medication with the backend ID
        frontendMed.id = result.id || frontendMed.id
        setMeds((prev) => [...prev, frontendMed])
        
        setForm({
          name: '',
          dose: '',
          timesPerDay: 2,
          times: ['08:00', '20:00'],
          startDate: nowLocalISODate(),
          notes: '',
          category: 'prescription',
          priority: 'medium',
          notifications: {
            browser: true,
            email: false,
            sms: false,
            alarm: false,
            reminderMinutes: 15
          }
        })
        setShowAddModal(false)
        alert('Medication added successfully!')
      } else {
        alert('Failed to add medication: ' + (result.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error adding medication:', error)
      alert('Failed to add medication. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const deleteMedication = async (id: string) => {
    try {
      setLoading(true)
      const result = await medicationService.deleteMedication(id)
      
      if (result.success) {
        setMeds((prev) => prev.filter(m => m.id !== id))
        alert('Medication deleted successfully!')
      } else {
        alert('Failed to delete medication: ' + (result.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error deleting medication:', error)
      alert('Failed to delete medication. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'prescription': return Pill
      case 'supplement': return Sparkles
      case 'vitamins': return Star
      default: return Heart
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'prescription': return 'blue'
      case 'supplement': return 'green'
      case 'vitamins': return 'yellow'
      default: return 'purple'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red'
      case 'medium': return 'orange'
      case 'low': return 'green'
      default: return 'gray'
    }
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

  // Calculate statistics
  const totalDoses = meds.reduce((acc, m) => acc + m.times.length, 0)
  const takenDoses = meds.reduce((acc, m) => acc + m.times.filter((t) => log[`${m.id}_${today}_${t}`]).length, 0)
  const upcomingDoses = meds.reduce((acc, m) => {
    const now = new Date()
    return acc + m.times.filter(t => {
      const doseTime = dateAtLocalTime(today, t)
      return doseTime > now && !log[`${m.id}_${today}_${t}`]
    }).length
  }, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-12"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-4 bg-orange-400 rounded-2xl shadow-lg border-2 border-orange-500">
                    <Pill className="w-10 h-10 text-purple-900" strokeWidth={2} fill="currentColor" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-yellow-100">Smart Medication Manager</h1>
                    <p className="text-xl text-yellow-50 mt-2 font-medium">Never miss a dose with intelligent tracking and reminders</p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center space-x-8 mt-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-yellow-100 font-semibold">{adherence}% adherence today</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-yellow-200" strokeWidth={2} />
                    <span className="text-yellow-100 font-medium">{upcomingDoses} doses remaining</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-yellow-200" strokeWidth={2} />
                    <span className="text-yellow-100 font-medium">{meds.length} active medications</span>
                  </div>
                </div>
              </div>

              {/* Today's Progress */}
              <div className="hidden lg:block">
                <div className="bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 text-center border-2 border-gray-700 shadow-lg">
                  <div className="text-3xl font-bold text-green-400 mb-2">{takenDoses}/{totalDoses}</div>
                  <div className="text-gray-300 text-sm mb-3 font-medium">Today's Doses</div>
                  <div className="w-32 bg-gray-700 rounded-full h-3 shadow-inner">
                    <div
                      className="bg-green-400 h-3 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${adherence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Tab Navigation */}
        <div className="flex space-x-2 mb-8 bg-white p-2 rounded-2xl shadow-lg border-2 border-gray-100 w-fit mx-auto">
          {[
            { id: 'schedule', label: 'Today\'s Schedule', icon: Calendar, color: 'blue' },
            { id: 'add', label: 'Add Medication', icon: PlusCircle, color: 'green' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-200 ${activeTab === tab.id
                  ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg transform scale-105`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Schedule Tab */}
              {activeTab === 'schedule' && (
                <motion.div
                  key="schedule"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Today's Medications */}
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border-2 border-blue-100 p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">Today's Schedule</h2>
                          <p className="text-gray-600">Track your medication adherence</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{adherence}%</div>
                          <div className="text-sm text-gray-600">Adherence</div>
                        </div>
                        <label className="inline-flex items-center space-x-3">
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-600 rounded"
                            checked={remindersEnabled}
                            onChange={(e) => setRemindersEnabled(e.target.checked)}
                          />
                          <span className="font-medium text-gray-700">Smart Reminders</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {loading && (
                        <div className="text-center py-12">
                          <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                            <Pill className="w-12 h-12 text-blue-600 animate-pulse" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">Loading medications...</h3>
                          <p className="text-gray-500">Please wait while we fetch your medication data</p>
                        </div>
                      )}
                      
                      {!loading && meds.length === 0 && (
                        <div className="text-center py-12">
                          <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                            <Pill className="w-12 h-12 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">No medications scheduled</h3>
                          <p className="text-gray-500 mb-6">Add your first medication to get started</p>
                          <button
                            onClick={() => setActiveTab('add')}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all"
                          >
                            <Plus className="w-5 h-5 inline mr-2" />
                            Add Medication
                          </button>
                        </div>
                      )}

                      {!loading && meds.map((medication) => {
                        const CategoryIcon = getCategoryIcon(medication.category || 'prescription')
                        const categoryColor = getCategoryColor(medication.category || 'prescription')
                        const priorityColor = getPriorityColor(medication.priority || 'medium')

                        return (
                          <motion.div
                            key={medication.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="group bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-blue-300"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start space-x-4">
                                <div className={`p-3 bg-${categoryColor}-100 rounded-xl group-hover:bg-${categoryColor}-200 transition-colors`}>
                                  <CategoryIcon className={`w-6 h-6 text-${categoryColor}-600`} />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">{medication.name}</h3>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <span className="text-gray-600 font-medium">{medication.dose}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${priorityColor}-100 text-${priorityColor}-700`}>
                                      {medication.priority || 'medium'} priority
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Started {new Date(medication.startDate).toLocaleDateString()}
                                    {medication.notes && ` • ${medication.notes}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteMedication(medication.id)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Dose Times */}
                            <div className="flex flex-wrap gap-3">
                              {medication.times.map((time) => {
                                const key = `${medication.id}_${today}_${time}`
                                const taken = !!log[key]
                                const doseTime = dateAtLocalTime(today, time)
                                const now = new Date()
                                const isPast = doseTime < now
                                const isUpcoming = doseTime > now && Math.abs(doseTime.getTime() - now.getTime()) <= 30 * 60 * 1000 // 30 minutes

                                return (
                                  <motion.button
                                    key={time}
                                    onClick={() => toggleTaken(medication.id, today, time)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`relative px-6 py-3 rounded-xl font-semibold transition-all ${taken
                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                                        : isUpcoming
                                          ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg animate-pulse'
                                          : isPast && !taken
                                            ? 'bg-red-100 text-red-700 border-2 border-red-300'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                      }`}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <Clock className="w-4 h-4" />
                                      <span>{time}</span>
                                      {taken && <CheckCircle className="w-4 h-4" />}
                                      {isPast && !taken && <AlertCircle className="w-4 h-4" />}
                                    </div>
                                    {isUpcoming && (
                                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                                    )}
                                  </motion.button>
                                )
                              })}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Add Medication Tab */}
              {activeTab === 'add' && (
                <motion.div
                  key="add"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border-2 border-green-100 p-8">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <PlusCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Add New Medication</h2>
                        <p className="text-gray-600">Set up your medication schedule and reminders</p>
                      </div>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); addMedication(); }} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Medication Name *</label>
                          <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                            placeholder="e.g., Lisinopril"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Dose *</label>
                          <input
                            type="text"
                            value={form.dose}
                            onChange={(e) => setForm({ ...form, dose: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                            placeholder="e.g., 10mg"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Times per Day</label>
                          <select
                            value={form.timesPerDay}
                            onChange={(e) => {
                              const times = Number(e.target.value)
                              const defaultTimes = ['08:00', '14:00', '20:00', '02:00'].slice(0, times)
                              setForm({ ...form, timesPerDay: times, times: defaultTimes })
                            }}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                          >
                            <option value={1}>Once daily</option>
                            <option value={2}>Twice daily</option>
                            <option value={3}>Three times daily</option>
                            <option value={4}>Four times daily</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                          <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                          >
                            <option value="prescription">Prescription</option>
                            <option value="supplement">Supplement</option>
                            <option value="vitamins">Vitamins</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                          <select
                            value={form.priority}
                            onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dose Times</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {form.times.slice(0, form.timesPerDay).map((time, index) => (
                            <input
                              key={index}
                              type="time"
                              value={time}
                              onChange={(e) => {
                                const newTimes = [...form.times]
                                newTimes[index] = e.target.value
                                setForm({ ...form, times: newTimes })
                              }}
                              className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                          type="date"
                          value={form.startDate}
                          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                          className="w-full md:w-auto border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                        <textarea
                          value={form.notes}
                          onChange={(e) => setForm({ ...form, notes: e.target.value })}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                          placeholder="Additional instructions or notes..."
                        />
                      </div>

                      {/* Notification Preferences */}
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border-2 border-blue-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Bell className="w-5 h-5 mr-2 text-blue-600" />
                          Notification Preferences
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <label className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={form.notifications.browser}
                                onChange={(e) => setForm({
                                  ...form,
                                  notifications: { ...form.notifications, browser: e.target.checked }
                                })}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <div>
                                <span className="font-medium text-gray-900">Browser Notifications</span>
                                <p className="text-sm text-gray-600">Desktop notifications in your browser</p>
                              </div>
                            </label>

                            <label className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={form.notifications.email}
                                onChange={(e) => setForm({
                                  ...form,
                                  notifications: { ...form.notifications, email: e.target.checked }
                                })}
                                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                                disabled={!userProfile.email}
                              />
                              <div>
                                <span className={`font-medium ${userProfile.email ? 'text-gray-900' : 'text-gray-400'}`}>
                                  Email Notifications
                                </span>
                                <p className="text-sm text-gray-600">
                                  {userProfile.email ? `Send to ${userProfile.email}` : 'Add email in profile to enable'}
                                </p>
                              </div>
                            </label>
                          </div>

                          <div className="space-y-4">
                            <label className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={form.notifications.sms}
                                onChange={(e) => setForm({
                                  ...form,
                                  notifications: { ...form.notifications, sms: e.target.checked }
                                })}
                                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                disabled={!userProfile.phone}
                              />
                              <div>
                                <span className={`font-medium ${userProfile.phone ? 'text-gray-900' : 'text-gray-400'}`}>
                                  SMS Notifications
                                </span>
                                <p className="text-sm text-gray-600">
                                  {userProfile.phone ? `Send to ${userProfile.phone}` : 'Add phone in profile to enable'}
                                </p>
                              </div>
                            </label>

                            <label className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={form.notifications.alarm}
                                onChange={(e) => setForm({
                                  ...form,
                                  notifications: { ...form.notifications, alarm: e.target.checked }
                                })}
                                className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                              />
                              <div>
                                <span className="font-medium text-gray-900">Alarm Sound</span>
                                <p className="text-sm text-gray-600">Play alarm sound for 30 seconds</p>
                              </div>
                            </label>
                          </div>
                        </div>

                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reminder Time (minutes before dose)
                          </label>
                          <select
                            value={form.notifications.reminderMinutes}
                            onChange={(e) => setForm({
                              ...form,
                              notifications: { ...form.notifications, reminderMinutes: Number(e.target.value) }
                            })}
                            className="w-full md:w-auto border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                          >
                            <option value={0}>At dose time</option>
                            <option value={5}>5 minutes before</option>
                            <option value={10}>10 minutes before</option>
                            <option value={15}>15 minutes before</option>
                            <option value={30}>30 minutes before</option>
                            <option value={60}>1 hour before</option>
                          </select>
                        </div>

                        {(!userProfile.email || !userProfile.phone) && (
                          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-yellow-800">Complete your profile</p>
                                <p className="text-sm text-yellow-700">
                                  Add your email and phone number in your profile to enable all notification options.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => setActiveTab('schedule')}
                          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Adding...
                            </>
                          ) : (
                            'Add Medication'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl border-2 border-green-100 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-green-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Health Stats</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{adherence}%</div>
                      <div className="text-sm text-gray-600">Today's Adherence</div>
                    </div>
                    <Target className="w-8 h-8 text-green-400" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{meds.length}</div>
                      <div className="text-sm text-gray-600">Active Medications</div>
                    </div>
                    <Pill className="w-8 h-8 text-blue-400" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-orange-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{upcomingDoses}</div>
                      <div className="text-sm text-gray-600">Upcoming Doses</div>
                    </div>
                    <Timer className="w-8 h-8 text-orange-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Add Button */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl">
              <div className="text-center">
                <div className="p-4 bg-green-500 rounded-xl shadow-lg w-fit mx-auto mb-4 border-2 border-green-400">
                  <Plus className="w-8 h-8 text-green-100" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-yellow-100">Add New Medication</h3>
                <p className="text-yellow-200 mb-6 font-medium">Keep track of all your medications</p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="w-full bg-green-600 hover:bg-green-700 text-green-100 py-3 rounded-xl font-bold transition-all border-2 border-green-500 shadow-lg"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Reminders Toggle */}
            <div className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl shadow-xl border-2 border-yellow-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Smart Reminders</h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 rounded"
                    checked={remindersEnabled}
                    onChange={(e) => setRemindersEnabled(e.target.checked)}
                  />
                  <span className="font-medium text-gray-700">Enable Notifications</span>
                </label>
                <div className="text-sm text-gray-600">
                  Get reminded with browser, email, SMS, or alarm notifications.
                </div>

                {/* Stop Alarm Button */}
                <button
                  onClick={stopAlarm}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${isAlarmPlaying
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    }`}
                  disabled={!isAlarmPlaying}
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>{isAlarmPlaying ? 'Stop Alarm 🔔' : 'No Alarm Playing'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


