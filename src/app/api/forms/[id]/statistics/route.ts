import { NextRequest, NextResponse } from 'next/server'

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')
    
    const response = await fetch(`${apiUrl}/forms/${params.id}/statistics`, {
      headers: {
        'Authorization': token || '',
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Error fetching form statistics:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 