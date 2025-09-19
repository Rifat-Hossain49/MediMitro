import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const icuType = searchParams.get('icuType')
    const hospital = searchParams.get('hospital')

    let url = `${BACKEND_URL}/api/icu-beds/available`
    const params = new URLSearchParams()

    if (icuType) params.set('icuType', icuType)
    if (hospital) params.set('hospital', hospital)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      beds: data.beds || [],
      totalAvailable: data.totalAvailable || 0
    })

  } catch (error) {
    console.error('ICU beds fetch error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Unable to fetch ICU bed availability. The service may be temporarily unavailable.',
        beds: [],
        totalAvailable: 0
      },
      { status: 500 }
    )
  }
}

