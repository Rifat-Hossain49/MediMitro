import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { auth } from '@/auth'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { patientId, emergencyType, priority, pickupAddress, destination, contactPhone, symptoms, additionalInfo } = body

    if (!pickupAddress || !destination || !emergencyType || !priority) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking information' },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/api/ambulance/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patientId,
        emergencyType,
        priority,
        pickupAddress,
        destination,
        contactPhone: contactPhone || session.user.email, // Fallback to user email
        symptoms: symptoms || '',
        additionalInfo: additionalInfo || ''
      }),
    })

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`)
    }

    const data = await response.json()

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: data.message,
        booking: data.booking,
        estimatedArrival: data.estimatedArrival
      })
    } else {
      return NextResponse.json(
        { success: false, error: data.message || 'Booking failed' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Ambulance booking error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to process ambulance booking. The service may be temporarily unavailable.'
      },
      { status: 500 }
    )
  }
}

