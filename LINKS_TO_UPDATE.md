# Links to Update After Route Groups Migration

After running the migration script, these links need to be updated from `/profile/*` to `/uhni/*`:

## Files with Links to Update

### 1. `/src/middleware.ts`
**Change:**
- `/profile/vip-access` → Keep as-is (consumer feature)
- `/profile/autonomous-shopping` → `/uhni/autonomous`
- `/profile/sourcing-requests` → `/uhni/sourcing`
- `/profile/bespoke-orders` → `/uhni/bespoke`

### 2. `/src/app/profile/page.tsx` (will be at `(consumer)/profile/page.tsx`)
**UHNI Navigation Items - Change:**
- `href="/profile/concierge"` → `href="/uhni/concierge"`
- `href="/profile/autonomous"` → `href="/uhni/autonomous"`
- `href="/profile/sourcing"` → `href="/uhni/sourcing"`
- `href="/profile/bespoke"` → `href="/uhni/bespoke"`
- `href="/profile/intelligence"` → `href="/uhni/intelligence"`

### 3. `/src/app/profile/intelligence/page.tsx` (will be at `(uhni)/uhni/intelligence/page.tsx`)
**Internal UHNI links - Change:**
- Any links to `/profile/concierge` → `/uhni/concierge`
- Any links to `/profile/autonomous` → `/uhni/autonomous`
- Any links to `/profile/sourcing` → `/uhni/sourcing`

### 4. `/src/app/profile/sourcing/page.tsx` (will be at `(uhni)/uhni/sourcing/page.tsx`)
**Internal links:**
- `/profile/sourcing/new` → `/uhni/sourcing/new`

### 5. `/src/app/profile/sourcing/new/page.tsx` (will be at `(uhni)/uhni/sourcing/new/page.tsx`)
**Back button:**
- `/profile/sourcing` → `/uhni/sourcing`

### 6. `/src/app/profile/concierge/page.tsx` (will be at `(uhni)/uhni/concierge/page.tsx`)
**Internal links if any**

### 7. `/src/app/profile/bespoke/page.tsx` (will be at `(uhni)/uhni/bespoke/page.tsx`)
**Internal links if any**

### 8. `/src/app/auth/login/uhni/page.tsx`
**Redirect after login:**
- `router.push('/profile')` → Keep as-is (goes to consumer profile)
- OR change to `router.push('/uhni/intelligence')` for UHNI dashboard

### 9. `/src/app/auth/login/page.tsx`
**UHNI login link:**
- `href="/auth/login/uhni"` → Keep as-is (auth routes stay the same)

### 10. `/src/app/profile/wardrobe-analytics/page.tsx`
**Links to UHNI features if any**

### 11. `/src/app/profile/styling-sessions/page.tsx`
**Links to UHNI features if any**

### 12. `/src/app/profile/silent-cart/page.tsx`
**Links to UHNI features if any**

---

## Pattern to Find and Replace

### Find:
```
/profile/concierge
/profile/autonomous
/profile/sourcing
/profile/bespoke
/profile/intelligence
```

### Replace with:
```
/uhni/concierge
/uhni/autonomous
/uhni/sourcing
/uhni/bespoke
/uhni/intelligence
```

---

## Middleware Update

**File:** `/src/middleware.ts`

**Before:**
```typescript
if (pathname.startsWith('/profile/vip-access') ||
    pathname.startsWith('/profile/autonomous-shopping') ||
    pathname.startsWith('/profile/sourcing-requests') ||
    pathname.startsWith('/profile/bespoke-orders')) {
```

**After:**
```typescript
if (pathname.startsWith('/uhni')) {
  // All UHNI routes are guarded by the (uhni)/layout.tsx
  return NextResponse.next();
}
```

**OR** (if you want to keep middleware guards):
```typescript
if (pathname.startsWith('/uhni/concierge') ||
    pathname.startsWith('/uhni/autonomous') ||
    pathname.startsWith('/uhni/sourcing') ||
    pathname.startsWith('/uhni/bespoke') ||
    pathname.startsWith('/uhni/intelligence')) {
  return NextResponse.next();
}
```

---

## URL Structure After Migration

### Consumer Portal (No prefix):
- `/` - Home
- `/discover` - Discover
- `/product/[slug]` - Products
- `/collection/[slug]` - Collections
- `/checkout` - Checkout
- `/wardrobe` - Wardrobe
- `/consideration` - Cart
- `/profile` - Consumer profile hub
- `/profile/settings` - Settings
- `/profile/orders` - Orders
- `/profile/wishlist` - Wishlist
- `/profile/preferences` - Preferences

### UHNI Portal (`/uhni` prefix):
- `/uhni/concierge` - Personal Concierge
- `/uhni/autonomous` - Autonomous Shopping
- `/uhni/sourcing` - Sourcing Requests
- `/uhni/sourcing/new` - New Sourcing Request
- `/uhni/bespoke` - Bespoke Orders
- `/uhni/intelligence` - Intelligence Dashboard

### Shared (No change):
- `/auth/login` - Login hub
- `/auth/login/consumer` - Consumer login
- `/auth/login/uhni` - UHNI login
- `/auth/register` - Registration
- `/onboarding` - Onboarding

---

## Testing After Updates

1. **Consumer Routes:** Navigate to /, /discover, /product pages - should work
2. **Consumer Profile:** Go to /profile - should show consumer features
3. **UHNI Routes:** Go to /uhni/concierge - should redirect to login if not UHNI
4. **UHNI Login:** Login as UHNI → should access /uhni/* routes
5. **Links:** Click all UHNI nav items - should go to /uhni/* not /profile/*
