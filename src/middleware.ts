import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get user tier from cookie or header (for now, we'll use a workaround with localStorage check on client)
  // In a real app, this would check an HTTP-only cookie with session token

  // Legacy profile routes → redirect to UHNI equivalents
  if (pathname === '/profile/silent-cart') {
    return NextResponse.redirect(new URL('/uhni/zero-ui', request.url));
  }
  if (pathname === '/profile/vip-access') {
    return NextResponse.redirect(new URL('/uhni/private-collections', request.url));
  }

  // UHNI portal routes (/uhni/*) are tier-gated:
  // - Client-side: (uhni)/layout.tsx reads userTier from AuthContext and redirects non-UHNI users
  // - Server-side (future): Replace this with JWT/session cookie check for userTier === 'uhni'
  // - Currently frontend-only, so server middleware just passes through
  if (pathname.startsWith('/uhni')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/uhni/:path*',
    '/profile/silent-cart',
    '/profile/vip-access',
  ]
};
