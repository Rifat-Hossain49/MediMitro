'use client'

import { useState } from 'react'
import EmergencyAmbulanceBooking from '@/components/EmergencyAmbulanceBooking'
import { Truck, AlertTriangle } from 'lucide-react'

export default function HireAmbulancePage() {
  // Since this is for signed-in users, show the component directly without modal wrapper
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-red-600 via-orange-500 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                <Truck className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Emergency Ambulance Service</h1>
                <p className="text-xl text-red-100 mt-2">Professional medical transportation when every second counts</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 text-red-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">24/7 Available</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>5-8 min Response Time</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Booking Component */}
      <div className="relative">
        <div className="absolute inset-0 bg-white"></div>
        <EmergencyAmbulanceBooking
          isOpen={true}
          onClose={() => { }}
        />
      </div>
    </div>
  )
}
