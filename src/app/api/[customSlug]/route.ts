import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ customSlug: string }> }
) {
  try {
    const { customSlug } = await params
    
    // Forward the request to the backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    const response = await fetch(`${apiUrl}/${customSlug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { message: error.message || 'Custom URL tidak ditemukan' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Return the response from backend
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error resolving custom URL:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
} 