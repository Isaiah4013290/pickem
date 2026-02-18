import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/join', '/login', '/pending', '/set-password', '/admin-login', '/api/auth']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))

  if (isPublic) return NextResponse.next()

  const token = request.cookies.get('pickem_session')?.value

  if (!token && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
