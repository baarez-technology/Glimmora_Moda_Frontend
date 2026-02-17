# COMPLETE TESTING GUIDE - ModaGlimmora UX Fixes

## 🚀 Quick Start
```bash
# Dev server should be running on:
http://localhost:3000

# If not running:
npm run dev
```

---

## ✅ TESTING CHECKLIST (All UX Fixes)

### TEST 1: Header Tier Labels Removed ⭐ CRITICAL
**What Changed**: Removed "Standard Member" label from header dropdown

**How to Test**:
1. Go to: `http://localhost:3000`
2. Click the **user icon** in top right corner (desktop)
3. **VERIFY**:
   - ❌ Should NOT see "ACCOUNT TYPE" or "Standard Member"
   - ✅ Should see: My Profile, Digital Wardrobe, Settings, Sign Out
4. On **mobile** (resize browser to < 768px):
   - Click hamburger menu
   - **VERIFY**: Same - no "Standard Member" label

**Expected Result**: Clean menu with no tier stigma

**If You See Issues**: Screenshot and tell me what you see

---

### TEST 2: Page Refresh Bug Fixed ⭐ CRITICAL
**What Changed**: Added hydration check before redirects

**How to Test Admin**:
1. Go to: `http://localhost:3000/auth/login/admin`
2. Login as admin (any credentials work - it's mock auth)
3. You'll be on: `http://localhost:3000/admin`
4. **Press F5 to refresh page** (or Cmd+R on Mac)
5. **VERIFY**: Should stay on `/admin` page
6. Refresh 3-4 times to confirm
7. **VERIFY**: Should NOT redirect to home page

**How to Test Brand**:
1. Go to: `http://localhost:3000/auth/login/brand`
2. Login
3. You'll be on: `http://localhost:3000/brand`
4. **Refresh page multiple times**
5. **VERIFY**: Should stay on brand dashboard

**How to Test UHNI**:
1. Go to: `http://localhost:3000/auth/login/uhni`
2. Login
3. Go to: `http://localhost:3000/profile/autonomous`
4. **Refresh page**
5. **VERIFY**: Should stay on autonomous page (not redirect to /profile)

**Expected Result**: No redirects on refresh

**If Issues**: Tell me which route redirects incorrectly

---

### TEST 3: Profile Page - No Membership Teaser
**What Changed**: Removed "Membership Benefits" upgrade box for standard users

**How to Test**:
1. **Logout** (click Sign Out)
2. Go to: `http://localhost:3000/auth/login/consumer`
3. Login as standard user
4. Go to: `http://localhost:3000/profile`
5. Scroll down to navigation section (left sidebar)
6. **VERIFY**:
   - ✅ Should see 7 features only (Wardrobe, Wishlist, Registry, Orders, Calendar, Preferences, Settings)
   - ❌ Should NOT see gold "Membership Benefits" box
   - ❌ Should NOT see "UHNI" badges
   - ❌ Should NOT see "Explore Membership" button

**Expected Result**: Clean navigation with just base features

---

### TEST 4: UHNI Features Show for UHNI Users
**How to Test**:
1. **Logout**
2. Go to: `http://localhost:3000/auth/login/uhni`
3. Login as UHNI
4. Go to: `http://localhost:3000/profile`
5. **VERIFY**:
   - ✅ Should see 15 features (7 base + 8 UHNI)
   - ✅ UHNI features have gold/subtle styling (not "UHNI" text badge)
   - Features include: Intelligence Dashboard, Wardrobe Analytics, VIP Access, Styling Sessions, Personal Concierge, Autonomous Shopping, Private Sourcing, Bespoke Orders

**Expected Result**: Expanded menu for UHNI users

---

### TEST 5: "Selections" Tooltip on Header
**What Changed**: Added tooltip explaining "Considerations" concept

**How to Test**:
1. On any page, look at header
2. Find the **Heart icon** (between Search and User icons)
3. **Hover mouse over the heart icon**
4. **VERIFY**:
   - ✅ Tooltip appears saying:
     - "Your Selections"
     - "Save pieces you're considering. Take your time to curate thoughtfully."

**Expected Result**: Tooltip appears on hover, explains feature

---

### TEST 6: Selections Page Renamed
**What Changed**: "Considerations" → "Your Selections"

**How to Test**:
1. Go to: `http://localhost:3000/consideration`
2. **VERIFY**:
   - ✅ Page title says "Your Selections" (not "Considerations")
   - ✅ Description mentions "personal curation space"

**Expected Result**: Clear, luxury-appropriate naming

---

### TEST 7: Empty States Updated
**What Changed**: Aspirational messaging instead of negative framing

**Test Empty Selections**:
1. Make sure you have 0 items in cart (fresh login)
2. Go to: `http://localhost:3000/consideration`
3. **VERIFY**:
   - ✅ Heading: "Begin Your Selection"
   - ✅ Body: "Your personal space to thoughtfully curate..."
   - ❌ Should NOT say: "Nothing Here Yet" or "Empty"

**Test Empty Wardrobe**:
1. Go to: `http://localhost:3000/profile`
2. Scroll to "Recent Wardrobe" section
3. If wardrobe is empty, **VERIFY**:
   - ✅ Heading: "Build Your Collection"
   - ✅ Body: "Your digital wardrobe awaits..."
   - ❌ Should NOT say: "Your wardrobe is empty"

**Expected Result**: Positive, aspirational empty states

---

### TEST 8: Product Availability Language
**What Changed**: "Sold Out" → "Available by Special Order"

**How to Test**:
1. Go to: `http://localhost:3000/discover`
2. Click on any product
3. On product page, look for availability section
4. **VERIFY**:
   - ✅ If limited: "Exclusive Limited Edition"
   - ✅ If unavailable: "Available by Special Order"
   - ❌ Should NOT say: "Currently Unavailable" or "Sold Out"
   - ✅ Description should mention "crafted exclusively" or "concierge"

**Expected Result**: Luxury language, no negative framing

---

### TEST 9: Social Proof Removed
**What Changed**: Removed fake "X viewing now" counters

**How to Test**:
1. Go to any product page
2. Look at product images
3. **VERIFY**:
   - ❌ Should NOT see "5 viewing now" badge
   - ❌ Should NOT see "Acquired in Paris 2 hours ago"
   - ✅ Clean product images only

**Expected Result**: No artificial urgency badges

---

### TEST 10: Logout Clears Data
**What Changed**: Fixed logout to use logout() function

**How to Test**:
1. Login as any user
2. Go to: `http://localhost:3000/discover`
3. Add 2-3 products to Selections (heart icon)
4. Go to: `http://localhost:3000/profile`
5. Click **Sign Out**
6. Check header - heart icon should show 0 items
7. Go to: `http://localhost:3000/consideration`
8. **VERIFY**: Empty state (items should be cleared)

**Expected Result**: All user data cleared on logout

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: "Page keeps refreshing infinitely"
**Cause**: Hydration check might be failing
**Solution**:
```bash
# Clear browser cache
# Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### Issue 2: "Still see 'Standard Member' label"
**Cause**: Browser cache
**Solution**:
1. Open DevTools (F12)
2. Go to Application tab → Clear storage
3. Hard refresh page

### Issue 3: "Tooltip doesn't appear"
**Cause**: Need to hover longer
**Solution**: Hover for 1-2 seconds on heart icon

### Issue 4: "Build failed"
**Check**:
```bash
npm run build
# Should show: ✓ Compiled successfully
```

---

## 📱 MOBILE TESTING

**Test on Mobile Devices**:
1. Resize browser to 375px width (iPhone size)
2. OR open DevTools → Device Mode (Cmd+Shift+M)
3. Test all scenarios above on mobile view
4. **Pay special attention to**:
   - Mobile hamburger menu (no tier labels)
   - Touch interactions
   - Tooltip on mobile (tap instead of hover)

---

## 🔍 SPECIFIC PAGES TO TEST

### Critical Routes:
- ✅ `/` - Home page
- ✅ `/auth/login/consumer` - Consumer login
- ✅ `/auth/login/uhni` - UHNI login
- ✅ `/auth/login/brand` - Brand login
- ✅ `/auth/login/admin` - Admin login
- ✅ `/profile` - Profile page (check navigation)
- ✅ `/consideration` - Selections page
- ✅ `/discover` - Discover products
- ✅ `/product/[any-product]` - Product detail
- ✅ `/admin` - Admin dashboard (refresh test)
- ✅ `/brand` - Brand dashboard (refresh test)
- ✅ `/profile/autonomous` - UHNI feature (refresh test)
- ✅ `/wardrobe` - Wardrobe page

---

## 🎯 WHAT TO LOOK FOR (Bug Checklist)

### Visual Bugs:
- [ ] Broken layouts
- [ ] Missing icons
- [ ] Overlapping text
- [ ] Wrong colors (gold vs sand vs taupe)
- [ ] Misaligned elements

### Functional Bugs:
- [ ] Links don't work
- [ ] Buttons don't respond
- [ ] Redirects to wrong page
- [ ] Infinite loading spinners
- [ ] Console errors (open DevTools F12)

### UX Issues:
- [ ] Confusing labels
- [ ] Tier labels still visible
- [ ] Aggressive upselling
- [ ] Negative messaging
- [ ] FOMO tactics

### Data Issues:
- [ ] Cart doesn't update
- [ ] Logout doesn't clear data
- [ ] Features don't appear for UHNI
- [ ] Features appear for standard users incorrectly

---

## 🚨 HOW TO REPORT ISSUES TO ME

**Format**:
```
1. What page: /profile
2. What you did: Clicked Sign Out
3. What happened: Got error message
4. What should happen: Should redirect to home
5. Screenshot: [paste image]
6. Browser: Chrome/Safari/Firefox
7. Console errors: [F12 → Console tab → paste errors]
```

---

## ✅ FINAL VERIFICATION

**Before saying "all good"**:
1. Test ALL 10 scenarios above
2. Test on both desktop and mobile
3. Test all 4 user roles (standard, UHNI, brand, admin)
4. Check browser console for errors (F12)
5. Do 5 full user journeys:
   - Browse → Add to cart → Logout
   - Login UHNI → Check profile features
   - Login Admin → Refresh page 5 times
   - Add items → Logout → Verify cleared
   - Hover tooltips → Read labels

---

## 🎓 EXPECTED BEHAVIOR SUMMARY

| Feature | Standard User | UHNI User | Admin/Brand |
|---------|--------------|-----------|-------------|
| Header Tier Label | None | None | "System Access" or "Partner Portal" |
| Profile Features | 7 base features | 15 features (7+8 UHNI) | N/A |
| Membership Teaser | None | None | N/A |
| Page Refresh | No redirect | No redirect | No redirect |
| Selections Tooltip | Shows on hover | Shows on hover | Shows on hover |
| Empty States | Aspirational | Aspirational | N/A |
| Product Availability | "By Special Order" | "By Special Order" | Same |
| Social Proof | Removed | Removed | Removed |

---

Need help with any specific issue? Tell me:
1. Which test number failed
2. What you see vs what you expected
3. Screenshot if possible
