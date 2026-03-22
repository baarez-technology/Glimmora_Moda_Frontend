// Consumer Portal Layout
// This layout wraps all consumer-facing routes
// URLs: /, /discover, /product/[slug], /checkout, /wardrobe, /profile, etc.
// All consumer routes require authentication

import AuthGuard from '@/components/auth/AuthGuard';
import { MaintenanceGate } from '@/components/MaintenanceGate';

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // All consumer routes require authentication
  // The AuthGuard will redirect to /auth/login if not authenticated
  // MaintenanceGate shows a maintenance screen when admin enables maintenance mode
  return (
    <AuthGuard>
      <MaintenanceGate>{children}</MaintenanceGate>
    </AuthGuard>
  );
}
