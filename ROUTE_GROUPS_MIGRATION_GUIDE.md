# Route Groups Migration Guide

## Current Status: Ready to Migrate

I've prepared everything for the route groups migration. Due to system limitations with bash execution, **you need to run one command manually**, then I'll complete the rest.

---

## Step 1: Run the Migration Script (YOU DO THIS)

Open your terminal and run:

```bash
cd /Users/kavi/Baarez-Projects/Moda-Glimmora-new-v2
node migrate-route-groups.js
```

### What This Does:

1. ✅ Creates `(consumer)/` and `(uhni)/uhni/` folders
2. ✅ Moves all consumer routes into `(consumer)/`
3. ✅ Moves UHNI routes from `/profile/*` to `(uhni)/uhni/*`
4. ✅ Deletes admin and brand login pages
5. ✅ Shows you the final structure

### Expected Output:

```
🚀 Starting ModaGlimmora Route Groups Migration...

📁 Step 1: Creating route group folders...
  ✓ Created (consumer)/
  ✓ Created (uhni)/uhni/
✅ Route group folders created

📦 Step 2: Moving consumer routes into (consumer)/...
  ✓ Moved page.tsx
  ✓ Moved discover
  ✓ Moved product
  ✓ Moved collection
  ✓ Moved checkout
  ✓ Moved wardrobe
  ✓ Moved consideration
  ✓ Moved outfit-builder
  ✓ Moved calendar
  ✓ Moved search
  ✓ Moved stories
  ✓ Moved story
  ✓ Moved profile
✅ Consumer routes moved

🔷 Step 3: Moving UHNI-exclusive routes to (uhni)/uhni/...
  ✓ Moved concierge to /uhni/concierge
  ✓ Moved autonomous to /uhni/autonomous
  ✓ Moved sourcing to /uhni/sourcing
  ✓ Moved bespoke to /uhni/bespoke
  ✓ Moved intelligence to /uhni/intelligence
✅ UHNI routes moved

🗑️  Step 4: Deleting admin and brand login pages...
  ✓ Deleted auth/login/admin
  ✓ Deleted auth/login/brand
✅ Old login pages removed

📊 Step 5: Final structure:

src/app/
├── (consumer)/           # Consumer portal
│   ├── calendar
│   ├── checkout
│   ├── collection
│   ├── consideration
│   ├── discover
│   ├── outfit-builder
│   ├── page.tsx
│   ├── product
│   ├── profile
│   ├── search
│   ├── stories
│   ├── story
│   └── wardrobe
│
├── (uhni)/              # UHNI portal
│   └── uhni/
│       ├── autonomous
│       ├── bespoke
│       ├── concierge
│       ├── intelligence
│       └── sourcing
│
├── auth/                # Shared authentication
├── onboarding/          # Shared onboarding
└── layout.tsx           # Root layout

✨ Migration complete!
```

---

## Step 2: Confirm Migration Success (YOU DO THIS)

After running the script, **reply back to me** with one of these:

- ✅ **"Migration successful"** - if you see the success message
- ❌ **"Migration failed"** + copy/paste any error messages

---

## Step 3: I'll Complete the Rest (I DO THIS)

Once you confirm the migration worked, I'll automatically:

1. ✅ Create `src/app/(consumer)/layout.tsx` (passthrough layout)
2. ✅ Create `src/app/(uhni)/layout.tsx` (auth-guarded layout)
3. ✅ Update `src/middleware.ts` for new `/uhni/*` routes
4. ✅ Update all internal links:
   - `/profile/concierge` → `/uhni/concierge`
   - `/profile/autonomous` → `/uhni/autonomous`
   - `/profile/sourcing` → `/uhni/sourcing`
   - `/profile/bespoke` → `/uhni/bespoke`
   - `/profile/intelligence` → `/uhni/intelligence`
5. ✅ Update navigation components
6. ✅ Test that everything still compiles

---

## Final URL Structure

### Before (Mixed):
```
/ (consumer)
/discover (consumer)
/profile (mixed - consumer + UHNI)
/profile/concierge (UHNI only)
/profile/autonomous (UHNI only)
/profile/sourcing (UHNI only)
```

### After (Separated):
```
/ (consumer)
/discover (consumer)
/profile (consumer only)
/profile/settings (consumer)
/profile/orders (consumer)
/uhni/concierge (UHNI only)
/uhni/autonomous (UHNI only)
/uhni/sourcing (UHNI only)
/uhni/bespoke (UHNI only)
/uhni/intelligence (UHNI only)
```

---

## Benefits

1. **Clear Separation**: Consumer and UHNI features are physically separated
2. **Easy to Find**: All UHNI features are in `(uhni)/uhni/` folder
3. **Auth Guards**: UHNI layout automatically protects all `/uhni/*` routes
4. **Scalable**: Easy to add new features to each portal
5. **Clean URLs**: UHNI features have clear `/uhni/*` prefix

---

## What to Do Right Now

```bash
cd /Users/kavi/Baarez-Projects/Moda-Glimmora-new-v2
node migrate-route-groups.js
```

Then tell me: **"Migration successful"** or paste any errors you see.

I'll handle the rest! 🚀
