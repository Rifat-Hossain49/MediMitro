import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const formData = await request.formData()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      )
    }
    
    // Forward the form data to the backend with the actual user email
    const response = await fetch(`${BACKEND_URL}/doctor-portal/credentials`, {
      method: 'POST',
      headers: {
        'X-User-Email': session.user.email,
      },
      body: formData
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error submitting doctor credentials:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to submit credentials' },
      { status: 500 }
    )
  }
}
