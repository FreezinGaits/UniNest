import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, signToken } from '@/lib/auth/session';

const publicRoutes = ['/', '/login', '/register', '/api', '/investor', '/demo'];
const roleRoutes: Record<string, string> = {
  STUDENT: '/student',
  LANDLORD: '/landlord',
  ADMIN: '/admin',
  COLLEGE: '/college',
  PROVIDER: '/provider',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');

  const isPublic = publicRoutes.some(r => pathname === r || pathname.startsWith(r + '/'));
  const isProtected = !isPublic && !pathname.startsWith('/_next') && !pathname.startsWith('/favicon');

  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let res = NextResponse.next();

  if (sessionCookie && request.method === 'GET') {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Role-based route protection
      if (isProtected) {
        const allowedPrefix = roleRoutes[parsed.role];
        const isRoleMismatch = allowedPrefix && !pathname.startsWith(allowedPrefix) && parsed.role !== 'ADMIN';
        if (isRoleMismatch) {
          return NextResponse.redirect(new URL(allowedPrefix + '/dashboard', request.url));
        }
      }

      res.cookies.set({
        name: 'session',
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString(),
        }),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresInOneDay,
      });
    } catch {
      res.cookies.delete('session');
      if (isProtected) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)'],
};
