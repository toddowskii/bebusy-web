import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/signup' || path === '/create-profile'

  // Get the token from cookies
  const token = request.cookies.get('sb-access-token')?.value || ''

  // Redirect to login if accessing protected route without token
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to home if accessing auth pages with token
  if (isPublicPath && token && path !== '/create-profile') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
