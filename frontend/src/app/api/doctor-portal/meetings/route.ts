import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080/api'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    
    const response = await fetch(`${BACKEND_URL}/doctor-portal/meetings?status=${status}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': process.env.DEMO_USER_EMAIL || 'demo@example.com',
      },
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching meetings:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch meetings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${BACKEND_URL}/doctor-portal/meetings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': process.env.DEMO_USER_EMAIL || 'demo@example.com',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating meeting:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create meeting' },
      { status: 500 }
    )
  }
}

