import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  // Only apply middleware to dashboard routes
  if (!req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // Require authentication for dashboard access
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.redirect(new URL('/api/auth/signin', req.url));
  }

  // No plan-based redirects; single simplified dashboard
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};