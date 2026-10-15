import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || request.nextUrl.host || ''
  const hostname = request.nextUrl.hostname || ''

  // Detect whether request is accessing through admin domain/subdomain
  const isAdminHost =
    hostname.startsWith('admin.') ||
    host.startsWith('admin.') ||
    hostname === 'admin'

  if (isAdminHost) {
    // On the admin subdomain/host:
    // If accessing root '/' or empty path, rewrite to '/admin' so the Admin Console is the homepage
    if (pathname === '/' || pathname === '') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.rewrite(url)
    }

    // If accessing '/admin' directly on the admin subdomain, redirect to clean '/'
    if (pathname === '/admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  }

  // On the customer/client side (localhost / non-admin host):
  // If attempting to access '/admin', redirect to the dedicated admin subdomain
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const port = request.nextUrl.port ? `:${request.nextUrl.port}` : ''
    const protocol = request.nextUrl.protocol || 'http:'

    let targetAdminHost = 'admin.localhost'
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      targetAdminHost = `admin.${hostname}`
    }

    const subPath =
      pathname === '/admin' ? '/' : pathname.replace(/^\/admin/, '') || '/'
    const redirectUrl = `${protocol}//${targetAdminHost}${port}${subPath}`

    return NextResponse.redirect(new URL(redirectUrl))
  }

  return NextResponse.next()
}

export default proxy

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (/api/*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static asset extensions (.svg, .png, .jpg, .jpeg, .webp, .ico)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)',
  ],
}
