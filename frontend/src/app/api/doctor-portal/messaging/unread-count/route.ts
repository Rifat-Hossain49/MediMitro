import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/doctor-portal/messaging/unread-count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': process.env.DEMO_USER_EMAIL || 'demo@example.com',
      },
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch unread count' },
      { status: 500 }
    )
  }
}

