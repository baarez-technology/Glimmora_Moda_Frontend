### Architecture: ModaGlimmora

This repo is a **Next.js App Router** project whose runtime behavior is primarily:
- **Route-driven UI** under `src/app/**`
- **Mock domain data** under `src/data/mock-data.ts`
- **Client state + persistence** in `src/context/AppContext.tsx` (via `localStorage`)

There is currently **no backend layer in-repo** (no `route.ts` API handlers, no `middleware.ts`).

---

### Repository map (by responsibility)

- **`src/app/`**: routes (pages), global layout, CSS
  - **`src/app/layout.tsx`**: global shell + global providers
  - **`src/app/**/page.tsx`**: route screens (e.g. `/product/[slug]`, `/brand/[slug]`, `/checkout`)
  - **`src/app/globals.css`**: design tokens + Tailwind component classes
- **`src/components/`**: UI modules, grouped by “feature area”
  - `components/layout/*`: `Header`, `Footer`
  - `components/product/*`: product intelligence modules (availability, fit confidence, outfits)
  - `components/navigation/*`: command palette / whisper bar / overlays (not fully wired globally yet)
  - `components/home/*`, `components/discover/*`, `components/wardrobe/*`: large section components
- **`src/types/index.ts`**: domain model (Product, Brand, Orders, Calendar, UHNI, etc.)
- **`src/data/mock-data.ts`**: in-memory “DB” + query helpers (e.g. `getProductBySlug`)
- **`src/context/AppContext.tsx`**: global app state (cart/wardrobe/orders/toasts/tier) + `localStorage` persistence
- **`src/contexts/*`**: additional providers (navigation/cursor) currently separate from `AppContext`

---

### Runtime entrypoints (what mounts what)

The core entrypoint is `src/app/layout.tsx`, which mounts:
- **`<AppProvider>`** (global state)
- **`<Header />`** and **`<Footer />`** (always-on chrome)
- **`<AGIConcierge />`** (floating assistant UI)
- **`<ToastContainer />`** (global notifications)

In practice, most pages are **client components** (`'use client'`) and rely on:
- `mock-data.ts` for content
- `AppContext` for persistent user state

---

### Data model vs app state (important distinction)

This codebase intentionally separates:
- **Domain data (static for now)**:
  - lives in `src/data/mock-data.ts`
  - typed by `src/types/index.ts`
  - accessed via helper functions (e.g. `getProductsByBrand`, `getStoryBySlug`)
- **User/app state (dynamic)**:
  - lives in `src/context/AppContext.tsx`
  - persisted to `localStorage`
  - consumed via `useApp()`

`AppContext` stores (high level):
- **Considerations** (cart-like list)
- **Wardrobe**
- **Saved outfits**
- **Restock alerts**
- **Orders**
- **Toasts**
- **User tier** (`standard | preferred | uhni`) which gates UHNI routes/features

Some route pages also read *additional* user personalization directly from `localStorage` (e.g. Body Twin / Fashion Identity) rather than via `AppContext`.

---

### Primary user flows (route-level)

- **Discovery → Product**
  - `/discover` filters/searches `mock-data` in-memory
  - `/product/[slug]` loads product via `getProductBySlug(slug)`
  - “Add to considerations” writes to `AppContext` (and persists)

- **Considerations → Checkout → Orders**
  - `/consideration` reads `considerations` from `AppContext`
  - `/checkout` reads items, collects shipping fields, then calls:
    - `addOrder(considerations, total)`
    - `clearConsiderations()`
  - `/profile/orders` surfaces the order history (from `AppContext`)

- **Login → Role/Tier**
  - `/auth/login/*` is UI-only; “login” sets `setUserRole(...)` in `AppContext`
  - Tier drives which UHNI cards/pages appear in `/profile`

---

### Consumer flow (deep dive)

This section traces the **consumer experience** as it exists today (no backend), including **state transitions** and **persistence points**.

#### 1) Consumer flow diagram (happy path)

```text
Landing (/)  ──> Discover (/discover) or Search (/search?q=...)
   |                         |
   |                         v
   |                   Product (/product/:slug)
   |                         |
   |                         +--> select variants (size/color)
   |                         +--> addToConsiderations(product, variants, agiNote)
   |                         v
   |                   Considerations (/consideration)
   |                         |
   |                         +--> removeFromConsiderations(id)
   |                         +--> proceed -> /checkout
   |                         v
   |                   Checkout (/checkout)
   |                         |
   |                         +--> addOrder(considerations, total)
   |                         +--> clearConsiderations()
   |                         v
   |                   Confirmation (Checkout step)
   |
   v
Profile (/profile) -> Orders (/profile/orders) / Wardrobe (/wardrobe) / Calendar (/calendar)
```

#### 2) What “state” exists for consumers (and where it lives)

- **Global persisted app state (AppContext)**
  - `moda-considerations`
  - `moda-wardrobe`
  - `moda-outfits`
  - `moda-restock-alerts`
  - `moda-orders`
  - `moda-user-tier`
- **Profile-style personalization (read outside AppContext)**
  - `moda-fashion-identity`
  - `moda-body-twin`
- **Other**
  - `moda-browsing-history` (settings can clear it, but nothing currently writes it)

#### 3) Deep trace by route

- **Auth (consumer) → “logged in”**
  - `/auth/login/consumer` sets `userTier` to `standard` and routes to `/profile`.
  - There is no route protection—tier is used to toggle features in UI.

- **Discover/Search → product selection**
  - `/discover` and `/search` filter in-memory arrays from `mock-data.ts` (no fetching).
  - Selecting a product routes to `/product/[slug]`.

- **Product page (core conversion point)**
  - Loads product by slug from `mock-data`.
  - Reads **Style Profile** from `localStorage` (`moda-fashion-identity`) for the “Match for You” badge.
  - Reads **Body Twin** from `localStorage` (`moda-body-twin`) to drive fit messaging.
  - Writes to global state via `useApp()`:
    - `addToConsiderations(...)` (primary conversion)
    - `addRestockAlert(...)` for unavailable items
    - toast feedback via `showToast(...)`

- **Considerations (cart-like)**
  - Source of truth is `useApp().considerations` (persisted).
  - Remove calls `removeFromConsiderations(id)`.
  - Proceeds to `/checkout`.

- **Checkout (order creation)**
  - Two-step UI; on “payment” it calls:
    - `addOrder(considerations, total)` then `clearConsiderations()`.
  - After this, the order appears under `/profile/orders`.

- **Calendar → “guided shopping”**
  - `/calendar` uses mock events from `AppContext.calendarEvents`.
  - For an event’s outfit suggestion, user can:
    - `saveOutfit(name, productIds, eventId)` (persists to `moda-outfits`)
    - `addToConsiderations(product, {}, note)` for suggested (not-owned) items

- **Wardrobe (owned items)**
  - Source of truth is `useApp().wardrobe` (persisted).
  - Supports removal via `removeFromWardrobe(id)`.

#### 4) Important flow breaks / mismatches to be aware of

- **Body Twin saving isn’t wired to persistence**
  - The product page loads `moda-body-twin` from `localStorage`, but the Body Twin page does not currently write it.
  - Result: consumers can “configure” Body Twin but product pages won’t actually use it unless the key is set elsewhere.

- **Style Profile schema mismatch**
  - Onboarding stores a lightweight object `{ occasions, aesthetics, confidence, budget }` into `moda-fashion-identity`.
  - The product page’s personalization logic expects something closer to `FashionIdentity` (including a `budgetRange`-style field), so budget alignment may not behave as intended.

### Diagram-style notes (how the system fits together)

#### 1) High-level layering

```text
Browser
  |
  v
Next.js App Router
  |
  +--> src/app/layout.tsx
         |
         +--> AppProvider  (src/context/AppContext.tsx)
         |      |
         |      +--> localStorage keys (persisted client state)
         |
         +--> Header / Footer (global chrome)
         +--> AGIConcierge + ToastContainer (global UX)
         |
         +--> Route page: src/app/**/page.tsx
                 |
                 +--> Feature components: src/components/**
                 |
                 +--> Domain reads: src/data/mock-data.ts
                 +--> State reads/writes: useApp()
```

#### 2) Domain data flow vs user state flow

```text
src/types/index.ts           src/data/mock-data.ts
  (interfaces)  <----typed----  (brands/products/stories + helper functions)
                                   |
                                   v
                              route pages + components
                                   |
                                   +--> READS domain entities (pure)

src/context/AppContext.tsx
  (considerations/wardrobe/orders/toasts/tier)
            |
            +--> HYDRATE from localStorage on mount
            +--> WRITE to localStorage on state changes
            |
            +--> used by route pages/components via useApp()
```

#### 3) Routing map (selected)

```text
src/app/
  page.tsx                     -> /
  discover/page.tsx             -> /discover
  search/page.tsx               -> /search?q=...
  brand/[slug]/page.tsx         -> /brand/:slug
  product/[slug]/page.tsx       -> /product/:slug
  consideration/page.tsx        -> /consideration
  checkout/page.tsx             -> /checkout
  profile/page.tsx              -> /profile
  profile/orders/page.tsx       -> /profile/orders
  auth/login/page.tsx           -> /auth/login
  auth/login/consumer/page.tsx  -> /auth/login/consumer
  auth/login/uhni/page.tsx      -> /auth/login/uhni
```

---

### Conventions you’ll see repeated

- **App Router**: route folders map directly to URLs; dynamic segments use `[slug]`, `[id]`.
- **Client-heavy pages**: many route pages are `'use client'` and rely on `useEffect` for mount animations + `localStorage` reads.
- **Data access**: prefer `mock-data` helper functions (`getProductBySlug`, etc.) rather than importing arrays everywhere.
- **State access**: prefer `useApp()` rather than direct `localStorage` reads (except where the repo currently does both).

---

### Extension guide (safe ways to evolve the codebase)

- **Add a new route**
  - Create `src/app/<route>/page.tsx`
  - Pull domain data via `src/data/mock-data.ts` helpers (or create one)
  - Use `useApp()` for persisted user state

- **Add a new domain entity**
  - Add interfaces/types to `src/types/index.ts`
  - Add mock entities + helper functions to `src/data/mock-data.ts`

- **Add new persistent state**
  - Add state + actions to `src/context/AppContext.tsx`
  - Add `localStorage` hydrate + write-back keys consistently

- **Introduce real data fetching**
  - Add `src/app/api/**/route.ts` handlers (or a separate backend)
  - Replace `mock-data.ts` usage with fetchers (keep `types/` as the contract)

---

### Known structural gaps / risks (current state)

- **Dependencies**: code imports `framer-motion` and `cmdk` in multiple components, but they are **not present in `package.json`** as checked. If these components are used in builds, installs may fail unless deps are added.
- **Multiple context systems**: `src/contexts/*` (Navigation/Cursor) exists but is **not mounted in `src/app/layout.tsx`**. Rendering components that call `useNavigation()`/`useCursor()` without mounting providers will throw.
- **Design token mismatch**: some pages use `swiss-*` Tailwind classes, while the palette in `tailwind.config.ts` / `globals.css` is primarily `ivory/parchment/charcoal/gold/...`. This suggests two competing token systems.


