// Consumer Portal Layout
// This layout wraps all consumer-facing routes
// URLs: /, /discover, /product/[slug], /checkout, /wardrobe, /profile, etc.
// All consumer routes require authentication

import AuthGuard from '@/components/auth/AuthGuard';

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // All consumer routes require authentication
  // The AuthGuard will redirect to /auth/login if not authenticated
  return <AuthGuard>{children}</AuthGuard>;
}
