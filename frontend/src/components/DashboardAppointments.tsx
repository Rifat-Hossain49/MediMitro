'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, User, Video, MapPin } from 'lucide-react'

interface Appointment {
  id: string
  patientId: string
  doctorId: string
  dateTime: string
  duration: number
  type: string
  status: string
  notes?: string
  symptoms?: string
  fee: number
  patientInfo?: {
    name: string
    email: string
  }
}

export default function DashboardAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      // Get user profile first
      const profileResponse = await fetch('/api/profile')
      const profileData = await profileResponse.json()

      if (profileData.success && profileData.user?.id) {
        // Fetch user's appointments
        const appointmentsResponse = await fetch(`http://localhost:8080/api/appointments/patient/${profileData.user.id}`)
        const appointmentsData = await appointmentsResponse.json()

        if (appointmentsData.success) {
          setAppointments(appointmentsData.appointments || [])
        }
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateTime: string) => {
    const date = new Date(dateTime)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Upcoming Appointments</h2>
            <p className="text-gray-600 font-medium">Your scheduled medical consultations.</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Upcoming Appointments</h2>
          <p className="text-gray-600 font-medium">Your scheduled medical consultations.</p>
        </div>
        <a
          href="/appointments"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center space-x-2"
        >
          <Calendar className="w-5 h-5" />
          <span>+ Book New</span>
        </a>
      </div>

      {appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Dr. Haji Biryani</h3>
                      <p className="text-purple-600 font-semibold mb-2">Cardiothoracic Surgery</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 font-medium">{formatDate(appointment.dateTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 font-medium">{formatTime(appointment.dateTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {appointment.type === 'online' ? (
                        <Video className="w-4 h-4 text-blue-500" />
                      ) : (
                        <MapPin className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-sm text-gray-600 font-medium">
                        {appointment.type === 'online' ? 'Video Call' : 'In-Person'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 font-medium">Duration: {appointment.duration} min</span>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Notes:</span> {appointment.notes}
                      </p>
                    </div>
                  )}

                  {appointment.symptoms && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Symptoms:</span> {appointment.symptoms}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${getStatusColor(appointment.status)}`}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                  <span className="text-lg font-bold text-gray-900">৳{appointment.fee}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No upcoming appointments</h3>
          <p className="text-gray-700 mb-6 font-medium">Schedule your next appointment with a specialist.</p>
          <a
            href="/appointments"
            className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
          >
            <Calendar className="w-5 h-5" />
            <span>Book Appointment</span>
          </a>
        </div>
      )}
    </div>
  )
}

