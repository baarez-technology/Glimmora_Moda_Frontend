'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AGIConcierge from '@/components/shared/AGIConcierge';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide header/footer on auth, onboarding, and brand portal pages
  // These pages have their own internal navigation/layout
  // UHNI portal keeps the consumer Header/Footer for consistent UI
  const isAuthPage = pathname?.startsWith('/auth');
  const isOnboardingPage = pathname?.startsWith('/onboarding');
  const isBrandPortal = pathname?.startsWith('/brand');

  if (isAuthPage || isOnboardingPage || isBrandPortal) {
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
