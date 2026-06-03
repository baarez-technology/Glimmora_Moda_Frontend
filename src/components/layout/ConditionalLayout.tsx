'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AGIConcierge from '@/components/shared/AGIConcierge';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, isHydrated } = useAuth();

  const isAuthPage = pathname?.startsWith('/auth');
  const isOnboardingPage = pathname?.startsWith('/onboarding');
  const isBrandPortal = pathname?.startsWith('/brand');
  const isAdminPortal = pathname?.startsWith('/admin');

  // Anonymous landing — default the root URL to no-chrome until we know the user
  // is authenticated. Avoids Header firing API calls on the public landing.
  const isHomeRoute = pathname === '/';
  const isPublicLanding = isHomeRoute && (!isHydrated || !isAuthenticated);

  if (isAuthPage || isOnboardingPage || isBrandPortal || isAdminPortal || isPublicLanding) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="pt-[72px] lg:pt-[104px]">
        {children}
      </main>
      <Footer />
      <AGIConcierge />
    </>
  );
}
