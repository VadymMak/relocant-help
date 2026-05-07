import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Admin auth: protect /[locale]/admin/* except /[locale]/admin/login
  if (/^\/[a-z]{2}\/admin/.test(pathname) && !/^\/[a-z]{2}\/admin\/login/.test(pathname)) {
    const session = req.cookies.get('admin_session')
    if (!session?.value) {
      const locale = pathname.split('/')[1] ?? 'uk'
      const url = req.nextUrl.clone()
      url.pathname = `/${locale}/admin/login`
      return NextResponse.redirect(url)
    }
  }

  const response = intlMiddleware(req)
  response.headers.set('x-pathname', pathname)
  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
