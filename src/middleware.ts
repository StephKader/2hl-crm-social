import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('chatwoot_session');
  const { pathname } = request.nextUrl;

  // Pas de session + route protégée → login
  if (!session && !pathname.startsWith('/login') && !pathname.startsWith('/api/chatwoot/auth')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Session + page login → dashboard
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/conversations/:path*',
    '/contacts/:path*',
    '/categories/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/login',
  ],
};
