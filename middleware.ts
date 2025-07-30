// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.split(' ')[1]

  const isProtected = request.nextUrl.pathname.startsWith('/forms')

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/', request.url)) // redirect to login
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/forms/:path*'], // only protect /forms route
}
