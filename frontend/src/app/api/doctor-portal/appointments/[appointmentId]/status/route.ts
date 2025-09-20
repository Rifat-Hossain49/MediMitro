import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080/api'

export async function PUT(
  request: NextRequest,
  { params }: { params: { appointmentId: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await request.json()
    const { appointmentId } = params

    const response = await fetch(`${BACKEND_URL}/doctor-appointments/${appointmentId}/status?status=${status}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': session.user.email,
      },
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating appointment status:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update appointment status' },
      { status: 500 }
    )
  }
}
