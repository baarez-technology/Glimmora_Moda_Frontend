# Correct Folder Structure for Multi-Portal Next.js App

## ❌ Current Structure (INCORRECT)

```
src/app/
├── page.tsx                    # Consumer home (mixed at root)
├── discover/                   # Consumer (mixed at root)
├── product/[slug]/             # Consumer (mixed at root)
├── checkout/                   # Consumer (mixed at root)
├── wardrobe/                   # Consumer (mixed at root)
├── profile/                    # MIXED: Consumer + UHNI together
│   ├── settings/               # Consumer
│   ├── autonomous/             # UHNI
│   ├── concierge/              # UHNI
│   └── sourcing/               # UHNI
├── admin/                      # Admin portal (correct location)
│   ├── users/
│   └── analytics/
└── brand/                      # Brand portal (correct location)
    ├── products/
    └── collections/
```

**Problems:**
1. ❌ Consumer routes scattered everywhere at root level
2. ❌ UHNI routes mixed with consumer in `/profile`
3. ❌ No clear separation between portals
4. ❌ Hard to apply different layouts per portal
5. ❌ Confusing for new developers

---

## ✅ CORRECT Structure - Option 1: Route Groups (RECOMMENDED)

**Route groups** in Next.js use `(folder)` syntax - they organize routes without affecting the URL.

```
src/app/
├── layout.tsx                           # Root layout (shared)
│
├── (consumer)/                          # 👥 CONSUMER PORTAL
│   ├── layout.tsx                       # Consumer-specific layout
│   ├── page.tsx                         # / (home)
│   ├── discover/
│   │   └── page.tsx                     # /discover
│   ├── product/
│   │   └── [slug]/
│   │       └── page.tsx                 # /product/[slug]
│   ├── collection/
│   │   └── [slug]/
│   │       └── page.tsx                 # /collection/[slug]
│   ├── checkout/
│   │   └── page.tsx                     # /checkout
│   ├── wardrobe/
│   │   └── page.tsx                     # /wardrobe
│   ├── consideration/
│   │   └── page.tsx                     # /consideration
│   ├── outfit-builder/
│   │   └── page.tsx                     # /outfit-builder
│   ├── search/
│   │   └── page.tsx                     # /search
│   ├── stories/
│   │   └── page.tsx                     # /stories
│   ├── story/
│   │   └── [slug]/
│   │       └── page.tsx                 # /story/[slug]
│   ├── calendar/
│   │   └── page.tsx                     # /calendar
│   └── profile/                         # Consumer profile only
│       ├── page.tsx                     # /profile
│       ├── settings/
│       ├── orders/
│       ├── preferences/
│       ├── restock-alerts/
│       └── wishlist/
│
├── (uhni)/                              # 💎 UHNI PORTAL
│   ├── layout.tsx                       # UHNI-specific layout
│   └── uhni/                            # All routes start with /uhni
│       ├── page.tsx                     # /uhni (dashboard)
│       ├── concierge/
│       │   └── page.tsx                 # /uhni/concierge
│       ├── autonomous/
│       │   └── page.tsx                 # /uhni/autonomous
│       ├── sourcing/
│       │   ├── page.tsx                 # /uhni/sourcing
│       │   └── new/
│       │       └── page.tsx             # /uhni/sourcing/new
│       ├── bespoke/
│       │   └── page.tsx                 # /uhni/bespoke
│       ├── intelligence/
│       │   └── page.tsx                 # /uhni/intelligence
│       ├── styling-sessions/
│       │   └── page.tsx                 # /uhni/styling-sessions
│       ├── vip-access/
│       │   └── page.tsx                 # /uhni/vip-access
│       ├── silent-cart/
│       │   └── page.tsx                 # /uhni/silent-cart
│       ├── gift-registry/
│       │   └── page.tsx                 # /uhni/gift-registry
│       └── wardrobe-analytics/
│           └── page.tsx                 # /uhni/wardrobe-analytics
│
├── admin/                               # 🔐 ADMIN PORTAL
│   ├── layout.tsx                       # Admin-specific layout
│   ├── page.tsx                         # /admin
│   ├── users/
│   │   └── page.tsx                     # /admin/users
│   ├── analytics/
│   │   └── page.tsx                     # /admin/analytics
│   ├── agi/
│   │   └── page.tsx                     # /admin/agi
│   ├── monitoring/
│   │   └── page.tsx                     # /admin/monitoring
│   └── audit/
│       └── page.tsx                     # /admin/audit
│
├── brand/                               # 🏢 BRAND PORTAL
│   ├── layout.tsx                       # Brand-specific layout
│   ├── page.tsx                         # /brand (dashboard)
│   ├── [slug]/
│   │   └── page.tsx                     # /brand/[slug] (brand page)
│   ├── products/
│   │   └── page.tsx                     # /brand/products
│   ├── collections/
│   │   └── page.tsx                     # /brand/collections
│   ├── agi/
│   │   └── page.tsx                     # /brand/agi
│   ├── analytics/
│   │   └── page.tsx                     # /brand/analytics
│   ├── bespoke/
│   │   └── page.tsx                     # /brand/bespoke
│   ├── boutiques/
│   │   └── page.tsx                     # /brand/boutiques
│   ├── campaigns/
│   │   └── page.tsx                     # /brand/campaigns
│   ├── customers/
│   │   └── page.tsx                     # /brand/customers
│   ├── revenue/
│   │   └── page.tsx                     # /brand/revenue
│   ├── sentiment/
│   │   └── page.tsx                     # /brand/sentiment
│   └── settings/
│       └── page.tsx                     # /brand/settings
│
├── auth/                                # 🔑 SHARED AUTH
│   ├── login/
│   │   ├── page.tsx                     # /auth/login (general)
│   │   ├── consumer/
│   │   │   └── page.tsx                 # /auth/login/consumer
│   │   ├── uhni/
│   │   │   └── page.tsx                 # /auth/login/uhni
│   │   ├── admin/
│   │   │   └── page.tsx                 # /auth/login/admin
│   │   └── brand/
│   │       └── page.tsx                 # /auth/login/brand
│   └── register/
│       └── page.tsx                     # /auth/register
│
├── onboarding/                          # 🎯 SHARED ONBOARDING
│   └── page.tsx                         # /onboarding
│
└── not-found.tsx                        # 404 page
```

### Key Benefits:

1. **Clear Portal Separation**
   - `(consumer)/` - All consumer routes
   - `(uhni)/uhni/` - All UHNI routes start with `/uhni`
   - `admin/` - All admin routes start with `/admin`
   - `brand/` - All brand routes start with `/brand`

2. **Portal-Specific Layouts**
   ```tsx
   // src/app/(consumer)/layout.tsx
   export default function ConsumerLayout({ children }) {
     return (
       <ConsumerProvider>
         {children}
       </ConsumerProvider>
     );
   }

   // src/app/(uhni)/layout.tsx
   export default function UHNILayout({ children }) {
     const { isUHNI } = useAuth();
     if (!isUHNI) redirect('/');

     return (
       <UHNIProvider>
         <UHNIHeader />
         {children}
       </UHNIProvider>
     );
   }
   ```

3. **Different Headers/Footers per Portal**
   - Consumer: Public header with login/cart
   - UHNI: Gold-themed header with concierge access
   - Admin: Dark admin panel header
   - Brand: Brand dashboard header

4. **URL Structure**
   - Consumer: `/ /discover /product/[slug]` (clean)
   - UHNI: `/uhni/concierge /uhni/sourcing` (clear)
   - Admin: `/admin/users /admin/analytics`
   - Brand: `/brand/products /brand/agi`

---

## ✅ CORRECT Structure - Option 2: Subdomain-based (ADVANCED)

If you want completely separate domains:

```
www.modaglimmora.com          → Consumer portal
uhni.modaglimmora.com         → UHNI portal
admin.modaglimmora.com        → Admin portal
partner.modaglimmora.com      → Brand portal
```

**Folder Structure:**
```
src/
├── app/                       # Consumer (main domain)
│   ├── page.tsx
│   ├── discover/
│   └── product/[slug]/
│
├── app-uhni/                  # UHNI subdomain
│   ├── page.tsx
│   ├── concierge/
│   └── sourcing/
│
├── app-admin/                 # Admin subdomain
│   ├── page.tsx
│   └── users/
│
└── app-brand/                 # Brand subdomain
    ├── page.tsx
    └── products/
```

**next.config.js:**
```js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'uhni.modaglimmora.com' }],
        destination: '/uhni/:path*'
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'admin.modaglimmora.com' }],
        destination: '/admin/:path*'
      }
    ];
  }
};
```

**Pros:**
- ✅ Complete isolation
- ✅ Can deploy separately
- ✅ Cleaner URLs (no /admin or /brand prefix)

**Cons:**
- ❌ More complex deployment
- ❌ Requires subdomain DNS setup
- ❌ Harder to share components/contexts

---

## 🎯 RECOMMENDED: Route Groups (Option 1)

**Why?**
1. ✅ Simple to implement
2. ✅ Clear organization
3. ✅ Easy to share code between portals
4. ✅ Portal-specific layouts
5. ✅ Works with current infrastructure

---

## Migration Path from Current to Recommended

### Step 1: Create Route Groups
```bash
mkdir -p src/app/\(consumer\)
mkdir -p src/app/\(uhni\)/uhni
```

### Step 2: Move Consumer Routes
```bash
# Move consumer routes into (consumer) group
mv src/app/discover src/app/\(consumer\)/
mv src/app/product src/app/\(consumer\)/
mv src/app/checkout src/app/\(consumer\)/
mv src/app/wardrobe src/app/\(consumer\)/
mv src/app/consideration src/app/\(consumer\)/
mv src/app/collection src/app/\(consumer\)/
mv src/app/outfit-builder src/app/\(consumer\)/
mv src/app/search src/app/\(consumer\)/
mv src/app/stories src/app/\(consumer\)/
mv src/app/calendar src/app/\(consumer\)/

# Move home page
mv src/app/page.tsx src/app/\(consumer\)/page.tsx
```

### Step 3: Create UHNI Portal
```bash
# Create UHNI structure
mkdir -p src/app/\(uhni\)/uhni
touch src/app/\(uhni\)/layout.tsx

# Move UHNI routes from profile to uhni
mv src/app/profile/autonomous src/app/\(uhni\)/uhni/
mv src/app/profile/concierge src/app/\(uhni\)/uhni/
mv src/app/profile/sourcing src/app/\(uhni\)/uhni/
mv src/app/profile/bespoke src/app/\(uhni\)/uhni/
mv src/app/profile/intelligence src/app/\(uhni\)/uhni/
mv src/app/profile/styling-sessions src/app/\(uhni\)/uhni/
mv src/app/profile/vip-access src/app/\(uhni\)/uhni/
mv src/app/profile/silent-cart src/app/\(uhni\)/uhni/
mv src/app/profile/gift-registry src/app/\(uhni\)/uhni/
mv src/app/profile/wardrobe-analytics src/app/\(uhni\)/uhni/
```

### Step 4: Keep Consumer Profile
```bash
# Keep these in consumer profile
src/app/(consumer)/profile/
├── page.tsx
├── settings/
├── orders/
├── preferences/
├── restock-alerts/
└── wishlist/
```

### Step 5: Add Portal Layouts
```tsx
// src/app/(consumer)/layout.tsx
export default function ConsumerLayout({ children }) {
  return <ConsumerProvider>{children}</ConsumerProvider>;
}

// src/app/(uhni)/layout.tsx
export default function UHNILayout({ children }) {
  const { isUHNI } = useAuth();
  if (!isUHNI) redirect('/');
  return <UHNIProvider>{children}</UHNIProvider>;
}
```

### Step 6: Update Links
```tsx
// Before
<Link href="/profile/concierge">Concierge</Link>

// After
<Link href="/uhni/concierge">Concierge</Link>
```

---

## Final Structure Summary

| Portal | URL Pattern | Folder Location | Layout |
|--------|-------------|-----------------|--------|
| **Consumer** | `/`, `/discover`, `/product/[slug]` | `app/(consumer)/` | Consumer layout |
| **UHNI** | `/uhni/*` | `app/(uhni)/uhni/` | UHNI layout |
| **Admin** | `/admin/*` | `app/admin/` | Admin layout |
| **Brand** | `/brand/*` | `app/brand/` | Brand layout |
| **Auth** | `/auth/*` | `app/auth/` | Shared |

**Current URLs stay the same for consumer, change for UHNI:**
- ✅ Consumer: No change (`/discover`, `/product/gucci-bag`)
- 🔄 UHNI: Change from `/profile/concierge` to `/uhni/concierge`
- ✅ Admin: No change (`/admin/users`)
- ✅ Brand: No change (`/brand/products`)
