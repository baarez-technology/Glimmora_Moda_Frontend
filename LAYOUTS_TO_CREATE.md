# Layout Files to Create After Migration

After running `node migrate-route-groups.js`, create these layout files:

## 1. Consumer Layout
**Location:** `src/app/(consumer)/layout.tsx`

```tsx
// This layout wraps all consumer routes
// URLs: /, /discover, /product/[slug], /checkout, etc.

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Consumer routes are publicly accessible, so no auth guard needed
  return <>{children}</>;
}
```

**Why:** Consumer portal doesn't need extra authentication. The root layout already provides AppProvider, Header, Footer, etc.

---

## 2. UHNI Layout
**Location:** `src/app/(uhni)/layout.tsx`

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function UHNILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isUHNI, isHydrated } = useApp();

  useEffect(() => {
    // Wait for hydration before checking auth
    if (isHydrated && !isUHNI) {
      // Redirect non-UHNI users to UHNI login page
      router.push('/auth/login/uhni');
    }
  }, [isUHNI, isHydrated, router]);

  // Don't render UHNI content until hydrated and authenticated
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold-soft border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isUHNI) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
```

**Why:** UHNI routes require authentication. This layout guards all `/uhni/*` routes and redirects unauthorized users to login.

---

## 3. Update Root Layout (Optional Enhancement)
**Location:** `src/app/layout.tsx`

The current root layout uses `ConditionalLayout` which checks for `/auth`, `/admin`, `/brand`. Since we removed admin/brand, we can:

**Option A:** Keep it as-is (works fine)

**Option B:** Remove ConditionalLayout and always show Header/Footer, hiding them only on auth pages:

```tsx
import type { Metadata } from 'next';
import './globals.css';
import ConditionalLayout from '@/components/layout/ConditionalLayout';
import AGIConcierge from '@/components/shared/AGIConcierge';
import ToastContainer from '@/components/shared/Toast';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'ModaGlimmora | Experience-First Luxury Commerce',
  description: 'The world\'s first AGI-native fashion universe. Experience luxury through intelligence, not transaction.',
  keywords: ['luxury fashion', 'designer brands', 'Dior', 'Gucci', 'Hermès', 'Louis Vuitton', 'fashion intelligence'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ivory-cream">
        <AppProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <AGIConcierge />
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
```

**Why:** ConditionalLayout already handles showing/hiding Header/Footer based on pathname. We've already updated it to only check `/auth` routes.

---

## Summary

After running migration:
1. ✅ Create `src/app/(consumer)/layout.tsx` (passthrough layout)
2. ✅ Create `src/app/(uhni)/layout.tsx` (auth-guarded layout)
3. ✅ Root layout already updated (ConditionalLayout fixed)

The route groups work because:
- `(consumer)` and `(uhni)` folders are invisible in URLs (Next.js route groups)
- Consumer routes: `/`, `/discover`, `/product/[slug]` (no prefix)
- UHNI routes: `/uhni/concierge`, `/uhni/autonomous`, `/uhni/sourcing` (with /uhni prefix)
