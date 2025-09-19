import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { patientId } = params

    // Get doctor ID from session
    const doctorResponse = await fetch('http://localhost:8080/api/doctor-portal/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': session.user.email,
      },
    })

    const doctorData = await doctorResponse.json()
    if (!doctorData.success || !doctorData.doctor?.id) {
      return NextResponse.json({ success: false, message: 'Doctor profile not found' }, { status: 404 })
    }

    const response = await fetch(`http://localhost:8080/api/appointments/messaging/conversation/${doctorData.doctor.id}/${patientId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': session.user.email,
      },
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
