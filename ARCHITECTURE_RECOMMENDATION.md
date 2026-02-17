# ModaGlimmora - Recommended Architecture

## Problem Statement
Current architecture has all portal features mixed in a single `AppContext`, leading to:
- Poor type safety (using `any` types)
- Difficult maintenance
- No clear separation of concerns
- Hard to test individual portals

## Recommended Structure

### 1. Context Layer Separation
```
src/context/
├── AppContext.tsx          # Shared global state (toasts, theme, navigation)
├── AuthContext.tsx         # Authentication & user tier management
├── ConsumerContext.tsx     # Consumer portal (cart, wishlist, wardrobe)
├── UHNIContext.tsx         # UHNI portal (concierge, sourcing, bespoke)
├── AdminContext.tsx        # Admin portal (users, analytics, monitoring)
└── BrandContext.tsx        # Brand portal (products, collections, AGI)
```

### 2. Type Definitions Separation
```
src/types/
├── index.ts               # Shared types (Product, Brand, etc.)
├── consumer.ts            # ConsiderationsItem, WardrobeItem, etc.
├── uhni.ts                # PersonalConcierge, SourcingRequest, etc.
├── admin.ts               # UserManagement, SystemMetrics, etc.
└── brand.ts               # BrandPartner, BrandAGIConfig, etc.
```

### 3. Route Organization (Optional - Route Groups)
```
src/app/
├── (consumer)/            # Route group for consumer portal
│   ├── page.tsx
│   ├── discover/
│   ├── product/[slug]/
│   └── checkout/
├── (uhni)/                # Route group for UHNI portal
│   ├── profile/autonomous/
│   ├── profile/concierge/
│   └── profile/sourcing/
├── admin/                 # Admin portal
│   ├── page.tsx
│   ├── users/
│   └── analytics/
└── brand/                 # Brand portal
    ├── page.tsx
    ├── products/
    └── agi/
```

### 4. Provider Hierarchy
```tsx
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>           {/* Outermost - manages user tier */}
          <AppProvider>          {/* Global shared state */}
            <PortalProviders>    {/* Conditionally loads portal contexts */}
              <Header />
              <main>{children}</main>
              <Footer />
              <ToastContainer />
            </PortalProviders>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 5. Conditional Portal Loading
```tsx
// src/context/PortalProviders.tsx
'use client';

export function PortalProviders({ children }) {
  const { userTier } = useAuth();

  return (
    <ConsumerProvider>
      {userTier === 'uhni' && (
        <UHNIProvider>
          {children}
        </UHNIProvider>
      )}
      {userTier === 'admin' && (
        <AdminProvider>
          {children}
        </AdminProvider>
      )}
      {userTier === 'brand' && (
        <BrandProvider>
          {children}
        </BrandProvider>
      )}
      {!['uhni', 'admin', 'brand'].includes(userTier) && children}
    </ConsumerProvider>
  );
}
```

## Benefits of This Approach

### 1. **Clear Separation of Concerns**
- Each portal has its own context with specific types
- No mixing of unrelated features
- Easy to understand what each portal does

### 2. **Better Type Safety**
```typescript
// Instead of:
brandPartner: any | null;  // ❌ Bad

// We have:
interface BrandContext {
  partner: BrandPartner;
  products: BrandProduct[];
  agiConfig: BrandAGIConfig;
  analytics: BrandAnalytics;
}  // ✅ Good
```

### 3. **Optimized Bundle Size**
- Tree-shaking removes unused portal code
- Consumer users don't download admin/brand code
- Faster page loads

### 4. **Easier Testing**
```typescript
// Test consumer features in isolation
<ConsumerProvider>
  <ProductPage />
</ConsumerProvider>

// Test UHNI features separately
<UHNIProvider>
  <ConciergePanel />
</UHNIProvider>
```

### 5. **Scalability**
- Add new features to specific portals without touching others
- Multiple developers can work on different portals simultaneously
- Clear ownership boundaries

## Migration Strategy

### Phase 1: Extract Types (Week 1)
1. Create `src/types/consumer.ts`, `uhni.ts`, `admin.ts`, `brand.ts`
2. Move types from `index.ts` to appropriate files
3. Update imports across the codebase

### Phase 2: Create Portal Contexts (Week 2)
1. Create `ConsumerContext.tsx` - move cart, wardrobe, wishlist
2. Create `UHNIContext.tsx` - move concierge, sourcing, bespoke
3. Keep `AppContext.tsx` for shared state only (toasts, theme)

### Phase 3: Mount AuthContext (Week 2)
1. Mount `AuthContext` in root layout
2. Remove duplicate auth logic from `AppContext`
3. Update all components to use `useAuth()`

### Phase 4: Create Admin & Brand Contexts (Week 3)
1. Create `AdminContext.tsx` with proper types
2. Create `BrandContext.tsx` with proper types
3. Remove `@ts-nocheck` from all brand pages

### Phase 5: Implement Conditional Loading (Week 4)
1. Create `PortalProviders.tsx`
2. Only load portal contexts when needed
3. Test bundle size improvements

### Phase 6: Optional Route Groups (Week 5)
1. Organize routes using Next.js route groups
2. Clearer URL structure
3. Portal-specific layouts

## Example: Consumer Context

```typescript
// src/context/ConsumerContext.tsx
'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import type { ConsiderationsItem, WardrobeItem, SavedOutfit } from '@/types/consumer';
import { useAuth } from './AuthContext';
import { useApp } from './AppContext';

interface ConsumerContextType {
  // Considerations (Cart)
  considerations: ConsiderationsItem[];
  addToConsiderations: (product: Product, variants?: any) => void;
  removeFromConsiderations: (id: string) => void;
  clearConsiderations: () => void;

  // Wardrobe
  wardrobe: WardrobeItem[];
  addToWardrobe: (product: Product) => void;
  removeFromWardrobe: (id: string) => void;

  // Saved Outfits
  savedOutfits: SavedOutfit[];
  saveOutfit: (name: string, items: string[]) => void;
}

const ConsumerContext = createContext<ConsumerContextType | undefined>(undefined);

export function ConsumerProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useApp();
  const { isAuthenticated } = useAuth();

  const [considerations, setConsiderations] = useState<ConsiderationsItem[]>([]);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (isAuthenticated) {
      // Load data
    }
  }, [isAuthenticated]);

  const addToConsiderations = useCallback((product: Product, variants?: any) => {
    // Implementation
    showToast(`${product.name} added to considerations`, 'success');
  }, [showToast]);

  // ... rest of implementation

  return (
    <ConsumerContext.Provider value={{
      considerations,
      addToConsiderations,
      removeFromConsiderations,
      clearConsiderations,
      wardrobe,
      addToWardrobe,
      removeFromWardrobe,
      savedOutfits,
      saveOutfit
    }}>
      {children}
    </ConsumerContext.Provider>
  );
}

export function useConsumer() {
  const context = useContext(ConsumerContext);
  if (!context) {
    throw new Error('useConsumer must be used within ConsumerProvider');
  }
  return context;
}
```

## Current vs. Recommended Comparison

### Current (❌ Anti-pattern)
```typescript
// EVERYTHING in AppContext.tsx (500+ lines)
const AppContext = createContext<{
  // Consumer stuff
  considerations: any[];
  wardrobe: any[];
  // UHNI stuff
  concierge: any;
  sourcingRequests: any[];
  // Brand stuff (with any types!)
  brandPartner: any | null;
  brandAGIConfig: any | null;
  // Admin stuff (barely exists)
  // ...100+ more properties
}>();
```

### Recommended (✅ Clean)
```typescript
// Separate contexts
const ConsumerContext = createContext<ConsumerContextType>();
const UHNIContext = createContext<UHNIContextType>();
const BrandContext = createContext<BrandContextType>();
const AdminContext = createContext<AdminContextType>();

// Usage in components
const ProductPage = () => {
  const { addToConsiderations } = useConsumer();  // ✅ Type-safe
  const { isUHNI } = useAuth();
  const { showToast } = useApp();

  if (isUHNI) {
    const { concierge } = useUHNI();  // ✅ Only loaded for UHNI users
  }
};
```

## Conclusion

**Current Status:** The code structure works but is **NOT scalable**. You have:
- ✅ Consumer portal: Functional but mixed with other portals
- ✅ UHNI portal: Functional but mixed with other portals
- ⚠️ Admin portal: Minimal functionality, uses consumer context
- ❌ Brand portal: Stub implementation with `any` types and `@ts-nocheck`

**Recommendation:** Refactor to separate contexts **before** adding more features. The migration can be done incrementally over 4-5 weeks without breaking existing functionality.

**When to refactor:**
- NOW: If you plan to add significant features to each portal
- LATER: If you just need to fix bugs and make minor updates

**Risk of not refactoring:**
- Increasing technical debt
- Harder to maintain as team grows
- More bugs from type safety issues
- Slower development velocity
