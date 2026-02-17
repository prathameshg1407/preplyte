import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes (Unauthenticated users allowed)
// Updated to include OAuth callback route
const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/callback'];

// Landing pages per role
const ROLE_REDIRECT: Record<string, string> = {
  PLATFORM_ADMIN: '/admin',
  INSTITUTE_ADMIN: '/institute-admin',
  USER: '/dashboard',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow OAuth callback route without authentication
  if (pathname === '/callback') {
    return NextResponse.next();
  }

  const hasSession = request.cookies.get('has_session')?.value === 'true';
  const role = request.cookies.get('role')?.value as keyof typeof ROLE_REDIRECT | undefined;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);

  // If user is authenticated + tries to access login/register → redirect by role
  if (hasSession && isPublicRoute && role && ROLE_REDIRECT[role]) {
    return NextResponse.redirect(new URL(ROLE_REDIRECT[role], request.url));
  }

  // If no session + trying to access protected route → redirect to login
  if (!hasSession && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user has role but trying to access wrong area's base path → fix redirect
  if (hasSession && role && ROLE_REDIRECT[role]) {
    const requiredBase = ROLE_REDIRECT[role];
    if (!pathname.startsWith(requiredBase) && !isPublicRoute) {
      return NextResponse.redirect(new URL(requiredBase, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};
