import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get user tier from cookie or header (for now, we'll use a workaround with localStorage check on client)
  // In a real app, this would check an HTTP-only cookie with session token

  // For UHNI portal routes - all routes under /uhni/* are protected by (uhni)/layout.tsx
  if (pathname.startsWith('/uhni')) {
    // The (uhni)/layout.tsx will handle auth guard
    // This middleware just allows the request to proceed
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/uhni/:path*'
  ]
};
