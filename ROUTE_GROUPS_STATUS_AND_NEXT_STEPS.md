# Route Groups Migration - Status & Next Steps

## ✅ What I've Completed

### 1. Created Portal Structure
- ✅ Created `src/app/(consumer)/layout.tsx` - Passthrough layout for consumer routes
- ✅ Created `src/app/(uhni)/layout.tsx` - Auth-guarded layout for UHNI routes
- ✅ Created `src/app/(consumer)/page.tsx` - Home page in consumer portal

### 2. Updated Navigation Links
- ✅ Updated `src/app/profile/page.tsx` - Changed UHNI nav links:
  - `/profile/concierge` → `/uhni/concierge`
  - `/profile/autonomous` → `/uhni/autonomous`
  - `/profile/sourcing` → `/uhni/sourcing`
  - `/profile/bespoke` → `/uhni/bespoke`

### 3. Updated Middleware
- ✅ Updated `src/middleware.ts` to handle `/uhni/*` routes
- ✅ Changed matcher to `['/uhni/:path*']`
- ✅ Auth guard now handled by (uhni)/layout.tsx

---

## 🔄 Physical File Movements Needed

You need to run these commands to complete the reorganization:

### Step 1: Move ALL Consumer Routes to (consumer)/

```bash
cd /Users/kavi/Baarez-Projects/Moda-Glimmora-new-v2/src/app

# Consumer feature folders
mv discover "(consumer)/"
mv product "(consumer)/"
mv collection "(consumer)/"
mv checkout "(consumer)/"
mv wardrobe "(consumer)/"
mv consideration "(consumer)/"
mv outfit-builder "(consumer)/"
mv calendar "(consumer)/"
mv search "(consumer)/"
mv stories "(consumer)/"
mv story "(consumer)/"
mv profile "(consumer)/"
```

### Step 2: Move UHNI Routes to (uhni)/uhni/

```bash
cd /Users/kavi/Baarez-Projects/Moda-Glimmora-new-v2/src/app

# From consumer profile to UHNI portal
mv "(consumer)/profile/concierge" "(uhni)/uhni/"
mv "(consumer)/profile/autonomous" "(uhni)/uhni/"
mv "(consumer)/profile/sourcing" "(uhni)/uhni/"
mv "(consumer)/profile/bespoke" "(uhni)/uhni/"
mv "(consumer)/profile/intelligence" "(uhni)/uhni/"
```

### Step 3: Delete Admin/Brand Login Pages

```bash
cd /Users/kavi/Baarez-Projects/Moda-Glimmora-new-v2/src/app

rm -rf auth/login/admin
rm -rf auth/login/brand
```

### Step 4: Verify the Structure

```bash
cd /Users/kavi/Baarez-Projects/Moda-Glimmora-new-v2/src/app

echo "=== Consumer Portal ==="
ls -1 "(consumer)"

echo ""
echo "=== Consumer Profile (should NOT have UHNI routes) ==="
ls -1 "(consumer)/profile"

echo ""
echo "=== UHNI Portal ==="
ls -1 "(uhni)/uhni"
```

---

## 📊 Expected Final Structure

```
src/app/
├── (consumer)/                    # Consumer Portal (URLs: /, /discover, etc.)
│   ├── layout.tsx                 # ✅ Created
│   ├── page.tsx                   # ✅ Created (home)
│   ├── discover/                  # ⏳ Needs to be moved
│   ├── product/                   # ⏳ Needs to be moved
│   ├── collection/                # ⏳ Needs to be moved
│   ├── checkout/                  # ⏳ Needs to be moved
│   ├── wardrobe/                  # ⏳ Needs to be moved
│   ├── consideration/             # ⏳ Needs to be moved
│   ├── outfit-builder/            # ⏳ Needs to be moved
│   ├── calendar/                  # ⏳ Needs to be moved
│   ├── search/                    # ⏳ Needs to be moved
│   ├── stories/                   # ⏳ Needs to be moved
│   ├── story/                     # ⏳ Needs to be moved
│   └── profile/                   # ⏳ Needs to be moved (consumer profile only)
│       ├── page.tsx               # ✅ Updated (nav links fixed)
│       ├── settings/
│       ├── orders/
│       ├── wishlist/
│       └── ... (consumer features)
│
├── (uhni)/                        # UHNI Portal
│   ├── layout.tsx                 # ✅ Created (auth guard)
│   └── uhni/                      # (URLs: /uhni/concierge, etc.)
│       ├── concierge/             # ⏳ Needs to be moved
│       ├── autonomous/            # ⏳ Needs to be moved
│       ├── sourcing/              # ⏳ Needs to be moved
│       ├── bespoke/               # ⏳ Needs to be moved
│       └── intelligence/          # ⏳ Needs to be moved
│
├── auth/                          # Shared (no changes needed)
│   ├── login/
│   │   ├── page.tsx
│   │   ├── consumer/
│   │   ├── uhni/
│   │   ├── admin/                 # ⏳ Needs deletion
│   │   └── brand/                 # ⏳ Needs deletion
│   └── register/
│
├── onboarding/                    # Shared (no changes)
├── layout.tsx                     # Root layout (no changes)
└── not-found.tsx                  # 404 page (no changes)
```

---

## 🔗 URL Structure After Migration

### ✅ Consumer Portal (No prefix)
- `/` - Home
- `/discover` - Discover products
- `/product/[slug]` - Product details
- `/collection/[slug]` - Collections
- `/checkout` - Checkout
- `/wardrobe` - Digital wardrobe
- `/consideration` - Shopping cart
- `/profile` - Consumer profile hub
- `/profile/settings` - Settings
- `/profile/orders` - Orders

### ✅ UHNI Portal (`/uhni` prefix)
- `/uhni/concierge` - Personal Concierge
- `/uhni/autonomous` - Autonomous Shopping
- `/uhni/sourcing` - Private Sourcing
- `/uhni/sourcing/new` - New Sourcing Request
- `/uhni/bespoke` - Bespoke Orders
- `/uhni/intelligence` - Intelligence Dashboard

### ✅ Shared (No change)
- `/auth/login` - Login hub
- `/auth/login/consumer` - Consumer login
- `/auth/login/uhni` - UHNI login
- `/auth/register` - Registration
- `/onboarding` - Onboarding

---

## 🧪 Testing After File Movements

Once you've moved the files, test these scenarios:

### 1. Consumer Routes
```bash
npm run dev
```

Visit these URLs:
- `http://localhost:3000/` → Should show home page ✅
- `http://localhost:3000/discover` → Should work
- `http://localhost:3000/product/gucci-jackie-1961` → Should work
- `http://localhost:3000/profile` → Should show consumer profile

### 2. UHNI Routes (Login as UHNI first)
- `http://localhost:3000/uhni/concierge` → Should redirect to login if not UHNI
- Login as UHNI → Then access `/uhni/concierge` → Should work
- Check that nav links in profile page go to `/uhni/*` URLs

### 3. Auth Guard
- Try accessing `/uhni/autonomous` without being logged in as UHNI
- Should redirect to `/auth/login/uhni`

---

## 🐛 Troubleshooting

### If routes don't work after moving files:

1. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Check TypeScript errors:**
   ```bash
   npx tsc --noEmit
   ```

3. **Verify folder structure:**
   ```bash
   ls -la src/app/(consumer)
   ls -la src/app/(uhni)/uhni
   ```

### If old URLs still work:

- Clear browser cache
- Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Restart dev server

---

## 📝 Summary

**What works now:**
- ✅ New folder structure created
- ✅ Layouts with proper auth guards
- ✅ Navigation links updated to new URLs
- ✅ Middleware configured for /uhni routes
- ✅ Home page copied to consumer portal

**What you need to do:**
1. Run the file movement commands above (Steps 1-4)
2. Test the application
3. Verify all routes work correctly

**One command to rule them all:**

If you want to run everything at once, use the migration script:

```bash
cd /Users/kavi/Baarez-Projects/Moda-Glimmora-new-v2
node migrate-route-groups.js
```

OR run the bash commands manually (shown in Steps 1-4 above).

---

## 🎯 Benefits After Migration

1. **Clear Separation**: Consumer and UHNI are physically separated
2. **Better Auth**: UHNI layout automatically protects all routes
3. **Clean URLs**: `/uhni/*` clearly indicates UHNI features
4. **Easy to Maintain**: Each portal has its own folder
5. **Scalable**: Easy to add new features to each portal

---

## ❓ Questions?

- Check `CORRECT_FOLDER_STRUCTURE.md` for the recommended architecture
- Check `ARCHITECTURE_RECOMMENDATION.md` for context layer separation
- The migration script is at `migrate-route-groups.js`

Once you run the file movements, everything will be complete! 🚀
