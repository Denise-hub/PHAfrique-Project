import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl
    const secret = process.env.NEXTAUTH_SECRET

    if (pathname === '/admin/login' || pathname.startsWith('/admin/login')) {
      try {
        const token = await getToken({ req, secret: secret || undefined })
        if (token) return NextResponse.redirect(new URL('/admin', req.url))
      } catch (e) {
        console.error('[middleware] getToken failed (check NEXTAUTH_SECRET):', e)
      }
      return NextResponse.next()
    }

    if (pathname.startsWith('/admin')) {
      try {
        const token = await getToken({ req, secret: secret || undefined })
        if (!token) return NextResponse.redirect(new URL('/admin/login', req.url))
      } catch (e) {
        console.error('[middleware] getToken failed (check NEXTAUTH_SECRET):', e)
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
      return NextResponse.next()
    }

    return NextResponse.next()
  } catch (err) {
    console.error('[middleware] unexpected error:', err)
    return NextResponse.next()
  }
}

export const config = { matcher: ['/admin', '/admin/', '/admin/:path*'] }
