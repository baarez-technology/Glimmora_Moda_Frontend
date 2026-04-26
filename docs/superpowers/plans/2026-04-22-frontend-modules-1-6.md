# Frontend Modules 1–6 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix frontend gaps for Modules 1–6 (Auth, Products, Cart/Checkout, Fit Confidence, Wardrobe, Brand Intelligence) as identified in FRONTEND_GAP_ANALYSIS.md — frontend only, no backend changes.

**Architecture:** Each module is self-contained. Changes are additive UI fixes (disclaimers, disabled states, new form fields, disclaimer banners) layered onto existing components. No new pages are created.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion

---

## MODULE 1 — Authentication

### Task 1.1: Add 401 session-expiry interceptor to api-client.ts

**Files:**
- Modify: `src/services/api-client.ts`

- [ ] In `apiRequest`, after `if (!response.ok)`, add a 401 redirect before throwing:

```typescript
if (response.status === 401) {
  if (typeof window !== 'undefined') {
    const current = window.location.pathname;
    if (!current.startsWith('/auth')) {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(current)}&reason=session_expired`;
    }
  }
}
```

Add this block immediately after `const response = await fetch(...)` and before the existing `if (!response.ok)` check.

- [ ] Commit:
```bash
git add src/services/api-client.ts
git commit -m "fix(auth): redirect to login on 401 with session_expired reason"
```

### Task 1.2: Show "Session expired" toast on login page when redirected

**Files:**
- Modify: `src/app/auth/login/page.tsx`

- [ ] In `LoginForm`, add a `useEffect` that reads `reason=session_expired` from `searchParams` and shows a toast:

```typescript
useEffect(() => {
  if (searchParams.get('reason') === 'session_expired') {
    showToast('Your session expired. Please sign in again.', 'error');
  }
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

Place this after the existing `isLoaded` useEffect.

- [ ] Commit:
```bash
git add src/app/auth/login/page.tsx
git commit -m "fix(auth): show session expired toast when redirected from 401"
```

### Task 1.3: Add OTP attempt counter UI to login page

**Files:**
- Modify: `src/app/auth/login/page.tsx`

- [ ] Find the OTP verification state section. Add these state variables near the top of `LoginForm`:

```typescript
const [otpAttempts, setOtpAttempts] = useState(0);
const [otpLockedUntil, setOtpLockedUntil] = useState<number | null>(null);
const [otpLockSeconds, setOtpLockSeconds] = useState(0);
```

- [ ] Add a countdown effect:

```typescript
useEffect(() => {
  if (!otpLockedUntil) return;
  const interval = setInterval(() => {
    const remaining = Math.ceil((otpLockedUntil - Date.now()) / 1000);
    if (remaining <= 0) {
      setOtpLockedUntil(null);
      setOtpLockSeconds(0);
    } else {
      setOtpLockSeconds(remaining);
    }
  }, 1000);
  return () => clearInterval(interval);
}, [otpLockedUntil]);
```

- [ ] In the OTP submit handler (search for where OTP verification errors are caught), increment the counter and set lockout:

```typescript
// After a failed OTP attempt:
const newAttempts = otpAttempts + 1;
setOtpAttempts(newAttempts);
if (newAttempts >= 5) {
  const lockMs = Math.pow(2, newAttempts - 5) * 16000; // 16s → 32s → 64s
  setOtpLockedUntil(Date.now() + lockMs);
}
```

- [ ] In the OTP input section JSX, add the attempt counter and lockout display below the OTP input field:

```tsx
{otpAttempts > 0 && !otpLockedUntil && (
  <p className="text-xs text-amber-600 text-center mt-1">
    {5 - otpAttempts} of 5 attempts remaining
  </p>
)}
{otpLockedUntil && (
  <p className="text-xs text-error text-center mt-1">
    Too many attempts. Try again in {otpLockSeconds}s
  </p>
)}
```

- [ ] Disable the OTP submit button when locked:

```tsx
disabled={isLoading || !!otpLockedUntil}
```

- [ ] On successful OTP, reset counters:

```typescript
setOtpAttempts(0);
setOtpLockedUntil(null);
```

- [ ] Commit:
```bash
git add src/app/auth/login/page.tsx
git commit -m "fix(auth): add OTP attempt counter and client-side lockout UI"
```

---

## MODULE 2 — Products & Catalog

### Task 2.1: Add disclaimer to SustainabilityScore.tsx

**Files:**
- Modify: `src/components/product/SustainabilityScore.tsx`

- [ ] In the expanded content section, find the `{/* Source Link */}` div at the bottom and add a disclaimer above it:

```tsx
{/* Disclaimer */}
<div className="px-5 pb-2">
  <p className="text-[10px] text-stone/50 italic">
    Estimated sustainability data — not verified by a third-party auditor. Figures are AI-generated approximations.
  </p>
</div>
```

- [ ] Also update the header subtitle. Find `{gradeInfo.label} environmental performance` and change it to:

```tsx
{gradeInfo.label} environmental performance · <span className="italic">Estimated</span>
```

- [ ] Commit:
```bash
git add src/components/product/SustainabilityScore.tsx
git commit -m "fix(products): add estimated data disclaimer to SustainabilityScore"
```

### Task 2.2: Add missing SOW 41P.3 fields to brand new product form

**Files:**
- Modify: `src/app/(brand)/brand/products/new/page.tsx`

- [ ] Add the new fields to the `formData` state:

```typescript
const [formData, setFormData] = useState({
  product_name: '',
  sku: '',
  price: '',
  collection_name: '',
  product_category: '',
  product_description: '',
  tagline: '',
  status: 'draft' as BrandProductStatus,
  // SOW 41P.3 fields:
  iv_eligible: false,
  commerce_eligible: true,
  heritage_tags: [] as string[],
  craft_tags: [] as string[],
  editorial_narrative: '',
  // SOW 41P.4 visibility fields:
  visibility_scope: 'public' as 'public' | 'logged_in' | 'uhni_only' | 'geo_restricted',
  experience_mode: 'commerce' as 'commerce' | 'story_only' | 'experience_iv' | 'concierge',
  commerce_action: 'add_to_cart' as 'add_to_cart' | 'request_to_buy' | 'concierge' | 'redirect',
});
```

- [ ] Add tag input state variables after existing `sizes` state:

```typescript
const [heritageTagInput, setHeritageTagInput] = useState('');
const [craftTagInput, setCraftTagInput] = useState('');
```

- [ ] Add tag handler functions after `handleRemoveSize`:

```typescript
const handleAddTag = (type: 'heritage_tags' | 'craft_tags', input: string, setInput: (v: string) => void) => {
  const val = input.trim().toLowerCase();
  if (!val || formData[type].includes(val)) return;
  setFormData(prev => ({ ...prev, [type]: [...prev[type], val] }));
  setInput('');
  setIsDirty(true);
};

const handleRemoveTag = (type: 'heritage_tags' | 'craft_tags', tag: string) => {
  setFormData(prev => ({ ...prev, [type]: prev[type].filter(t => t !== tag) }));
  setIsDirty(true);
};
```

- [ ] In the JSX form body, add a new section after the existing fields section and before the submit button. Find the closing `</form>` or the submit button area and insert:

```tsx
{/* SOW 41P.3 — Extended Product Fields */}
<div className="space-y-6 border-t border-sand pt-6">
  <h3 className="font-medium text-charcoal-deep text-sm tracking-wider uppercase">Product Classification</h3>

  {/* Checkboxes */}
  <div className="flex gap-6">
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={formData.iv_eligible}
        onChange={e => updateField('iv_eligible', e.target.checked)}
        className="rounded border-sand"
      />
      <span className="text-sm text-charcoal-deep">IV Eligible</span>
    </label>
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={formData.commerce_eligible}
        onChange={e => updateField('commerce_eligible', e.target.checked)}
        className="rounded border-sand"
      />
      <span className="text-sm text-charcoal-deep">Commerce Eligible</span>
    </label>
  </div>

  {/* Editorial Narrative */}
  <div>
    <label className="block text-xs tracking-wider uppercase text-stone mb-1">Editorial Narrative</label>
    <textarea
      value={formData.editorial_narrative}
      onChange={e => updateField('editorial_narrative', e.target.value)}
      rows={4}
      placeholder="Long-form brand story or editorial context for this product..."
      className="w-full border border-sand px-3 py-2 text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep"
    />
  </div>

  {/* Heritage Tags */}
  <div>
    <label className="block text-xs tracking-wider uppercase text-stone mb-1">Heritage Tags</label>
    <div className="flex gap-2 mb-2 flex-wrap">
      {formData.heritage_tags.map(tag => (
        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-sand text-stone text-xs rounded">
          {tag}
          <button type="button" onClick={() => handleRemoveTag('heritage_tags', tag)} className="text-stone hover:text-error">
            <X size={10} />
          </button>
        </span>
      ))}
    </div>
    <div className="flex gap-2">
      <input
        value={heritageTagInput}
        onChange={e => setHeritageTagInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag('heritage_tags', heritageTagInput, setHeritageTagInput))}
        placeholder="Add heritage tag (e.g. hand-embroidered)"
        className="flex-1 border border-sand px-3 py-1.5 text-sm focus:outline-none focus:border-charcoal-deep"
      />
      <button type="button" onClick={() => handleAddTag('heritage_tags', heritageTagInput, setHeritageTagInput)} className="px-3 py-1.5 border border-sand text-sm text-stone hover:bg-sand">
        Add
      </button>
    </div>
  </div>

  {/* Craft Tags */}
  <div>
    <label className="block text-xs tracking-wider uppercase text-stone mb-1">Craft Tags</label>
    <div className="flex gap-2 mb-2 flex-wrap">
      {formData.craft_tags.map(tag => (
        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-sand text-stone text-xs rounded">
          {tag}
          <button type="button" onClick={() => handleRemoveTag('craft_tags', tag)} className="text-stone hover:text-error">
            <X size={10} />
          </button>
        </span>
      ))}
    </div>
    <div className="flex gap-2">
      <input
        value={craftTagInput}
        onChange={e => setCraftTagInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag('craft_tags', craftTagInput, setCraftTagInput))}
        placeholder="Add craft tag (e.g. block-print)"
        className="flex-1 border border-sand px-3 py-1.5 text-sm focus:outline-none focus:border-charcoal-deep"
      />
      <button type="button" onClick={() => handleAddTag('craft_tags', craftTagInput, setCraftTagInput)} className="px-3 py-1.5 border border-sand text-sm text-stone hover:bg-sand">
        Add
      </button>
    </div>
  </div>
</div>

{/* SOW 41P.4 — Visibility Settings */}
<div className="space-y-4 border-t border-sand pt-6">
  <h3 className="font-medium text-charcoal-deep text-sm tracking-wider uppercase">Visibility Settings</h3>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <label className="block text-xs tracking-wider uppercase text-stone mb-1">Visibility Scope</label>
      <select
        value={formData.visibility_scope}
        onChange={e => updateField('visibility_scope', e.target.value as typeof formData.visibility_scope)}
        className="w-full border border-sand px-3 py-2 text-sm bg-white focus:outline-none focus:border-charcoal-deep"
      >
        <option value="public">Public</option>
        <option value="logged_in">Logged In Only</option>
        <option value="uhni_only">UHNI Only</option>
        <option value="geo_restricted">Geo Restricted</option>
      </select>
    </div>

    <div>
      <label className="block text-xs tracking-wider uppercase text-stone mb-1">Experience Mode</label>
      <select
        value={formData.experience_mode}
        onChange={e => updateField('experience_mode', e.target.value as typeof formData.experience_mode)}
        className="w-full border border-sand px-3 py-2 text-sm bg-white focus:outline-none focus:border-charcoal-deep"
      >
        <option value="commerce">Commerce</option>
        <option value="story_only">Story Only</option>
        <option value="experience_iv">Experience + IV</option>
        <option value="concierge">Concierge</option>
      </select>
    </div>

    <div>
      <label className="block text-xs tracking-wider uppercase text-stone mb-1">Commerce Action</label>
      <select
        value={formData.commerce_action}
        onChange={e => updateField('commerce_action', e.target.value as typeof formData.commerce_action)}
        className="w-full border border-sand px-3 py-2 text-sm bg-white focus:outline-none focus:border-charcoal-deep"
      >
        <option value="add_to_cart">Add to Cart</option>
        <option value="request_to_buy">Request to Buy</option>
        <option value="concierge">Concierge Handoff</option>
        <option value="redirect">Redirect</option>
      </select>
    </div>
  </div>
</div>
```

- [ ] In `handleSubmit`, pass the new fields to `createProduct`:

```typescript
const created = await createProduct({
  product_name: formData.product_name.trim(),
  sku: formData.sku.trim(),
  price: parseFloat(formData.price) || 0,
  collection_name: formData.collection_name,
  product_category: formData.product_category,
  product_description: formData.product_description,
  tagline: formData.tagline,
  status: formData.status,
  cover_image: coverImage || undefined,
  sizes,
  iv_eligible: formData.iv_eligible,
  commerce_eligible: formData.commerce_eligible,
  heritage_tags: formData.heritage_tags,
  craft_tags: formData.craft_tags,
  editorial_narrative: formData.editorial_narrative,
  visibility_scope: formData.visibility_scope,
  experience_mode: formData.experience_mode,
  commerce_action: formData.commerce_action,
});
```

- [ ] Commit:
```bash
git add src/app/(brand)/brand/products/new/page.tsx
git commit -m "feat(products): add SOW 41P.3 fields and visibility settings to new product form"
```

---

## MODULE 3 — Cart & Checkout

### Task 3.1: Add double-submit guard and processing state to checkout

**Files:**
- Modify: `src/app/(consumer)/checkout/page.tsx`

- [ ] Find the Place Order button (`disabled={isPlacingOrder}`). The button already has `isPlacingOrder` disabled state. Confirm the button renders a loading state when `isPlacingOrder` is true. If it doesn't have a "do not close" warning, add one.

Find the section where `isPlacingOrder` is set to `true` and add a processing banner. Search for `setIsPlacingOrder(true)` and above the button JSX add:

```tsx
{isPlacingOrder && (
  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm text-center">
    Order is being processed — please do not close this window.
  </div>
)}
```

Place this immediately above the Place Order button element.

- [ ] Add clear payment failure error state. Find the order error display area (search for `error` state rendering in the JSX) and ensure payment failures show a support link. Add or update the error display near the Place Order button:

```tsx
{error && (
  <div className="mb-4 p-4 bg-error/5 border border-error/20 text-error text-sm">
    <p className="font-medium mb-1">Payment could not be completed</p>
    <p className="text-xs text-stone mb-2">{error}</p>
    <p className="text-xs text-stone">
      Need help?{' '}
      <a href="mailto:support@modaglimmora.com" className="underline">
        Contact support
      </a>
      {placedOrder && ` — Reference: ${placedOrder.order_id}`}
    </p>
  </div>
)}
```

- [ ] Commit:
```bash
git add src/app/(consumer)/checkout/page.tsx
git commit -m "fix(checkout): add processing warning banner and payment failure support link"
```

---

## MODULE 4 — Fit Confidence & Digital Body Twin

### Task 4.1: Add disclaimer and range format to FitConfidenceCard

**Files:**
- Modify: `src/components/product/FitConfidenceCard.tsx`

- [ ] Add a disclaimer banner inside the expanded content, immediately after the opening `<div className="px-4 pb-4 border-t border-sand pt-4">`:

```tsx
{/* Disclaimer */}
<div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
  <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
  <p className="text-xs text-amber-700">
    Size recommendation is an estimate. Check the brand&apos;s size guide for exact measurements before ordering.
  </p>
</div>
```

`AlertCircle` is already imported.

- [ ] Change the "Recommended Size" display from showing a single size to showing a size range hint. Find the `<p className="font-display text-lg text-charcoal-deep">{fitConfidence.suggestedSize}</p>` and replace with:

```tsx
<div>
  <p className="font-display text-lg text-charcoal-deep">{fitConfidence.suggestedSize}</p>
  <p className="text-[10px] text-stone mt-0.5">Estimated — verify with brand size chart</p>
</div>
```

- [ ] Change the overall score display in the header from "92%" to show it as a guideline. Find `{fitConfidence.overallScore}%` in the header button and wrap it:

```tsx
<div className="text-right">
  <div className={`text-2xl font-display ${getScoreColor(fitConfidence.overallScore)}`}>
    {fitConfidence.overallScore}%
  </div>
  <p className="text-[9px] text-stone/60 tracking-wider">estimate</p>
</div>
```

- [ ] Commit:
```bash
git add src/components/product/FitConfidenceCard.tsx
git commit -m "fix(fit): add disclaimer banner and estimate label to FitConfidenceCard"
```

---

## MODULE 5 — Wardrobe Management

### Task 5.1: Add dismiss/feedback action to WardrobeGapAnalysis

**Files:**
- Modify: `src/components/wardrobe/WardrobeGapAnalysis.tsx`

- [ ] Add dismissed state and import `X` icon (check if already imported, if not add it):

```typescript
const [dismissedGaps, setDismissedGaps] = useState<Set<string>>(new Set());
```

- [ ] Add `X` to the lucide imports if not present: `import { Sparkles, ChevronRight, AlertCircle, TrendingUp, ShoppingBag, X, ThumbsDown } from 'lucide-react';`

- [ ] Add dismiss handler:

```typescript
const handleDismissGap = (gapId: string) => {
  setDismissedGaps(prev => new Set(prev).add(gapId));
};
```

- [ ] In the gaps map, filter dismissed gaps and add dismiss button. Find `{analysis.gaps.map((gap) => (` and change it to:

```tsx
{analysis.gaps.filter(gap => !dismissedGaps.has(gap.id)).map((gap) => (
```

- [ ] Inside each gap card JSX (find the gap card container — it's the `<div>` wrapping each gap), add a dismiss button in the gap card header area. Find the priority badge element and add a dismiss button next to it:

```tsx
<div className="flex items-start justify-between gap-2 mb-3">
  {/* existing priority badge */}
  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getPriorityColor(gap.priority)}`}>
    {getPriorityLabel(gap.priority)}
  </span>
  <div className="flex gap-1">
    <button
      onClick={() => handleDismissGap(gap.id)}
      title="Not relevant"
      className="p-1 text-stone/40 hover:text-stone hover:bg-sand rounded transition-colors"
    >
      <X size={12} />
    </button>
  </div>
</div>
```

- [ ] Add a disclaimer above the gaps list. Find `<div className="flex items-center justify-between mb-4">` (the gap section header) and add above it:

```tsx
<div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4 text-xs text-amber-700">
  <AlertCircle size={13} className="mt-0.5 flex-shrink-0 text-amber-600" />
  Suggestions are AI-generated based on style patterns — not grounded in your full purchase history. Use as inspiration.
</div>
```

- [ ] Commit:
```bash
git add src/components/wardrobe/WardrobeGapAnalysis.tsx
git commit -m "fix(wardrobe): add dismiss action and AI disclaimer to gap analysis"
```

### Task 5.2: Add wardrobe value disclaimer

**Files:**
- Modify: `src/app/(consumer)/wardrobe/page.tsx` (or whichever file renders wardrobe value — search for "wardrobe value")

- [ ] Search for wardrobe value display:
```bash
grep -rn "wardrobeValue\|wardrobe_value\|total.*value\|WardrobeValue" src/app/\(consumer\)/wardrobe/ src/components/wardrobe/ -i
```

- [ ] Find where the wardrobe value number is displayed and add a sub-label below it:

```tsx
<p className="text-[10px] text-stone/50 mt-0.5">Based on original purchase prices, not resale value</p>
```

- [ ] Commit:
```bash
git add src/app/(consumer)/wardrobe/page.tsx  # or correct file
git commit -m "fix(wardrobe): add original purchase price disclaimer to wardrobe value"
```

---

## MODULE 6 — Brand Intelligence Dashboards

### Task 6.1: Add heuristic disclaimer banner to IntelligencePageWrapper

**Files:**
- Modify: `src/components/brand/IntelligencePageWrapper.tsx`

- [ ] Import `AlertCircle` and `Info` from lucide-react (check what's already imported):

```typescript
import { AlertCircle, Info } from 'lucide-react';
```

- [ ] Add a `showHeuristicBanner` prop (default `true`) to the interface:

```typescript
interface IntelligencePageWrapperProps {
  title: string;
  subtitle: string;
  acronym?: string;
  phase?: number;
  status?: string;
  backendNote?: string;
  children: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  showHeuristicBanner?: boolean;
}
```

- [ ] Destructure it with a default:

```typescript
export default function IntelligencePageWrapper({
  title,
  subtitle,
  acronym,
  children,
  isLoading,
  error,
  showHeuristicBanner = true,
}: IntelligencePageWrapperProps) {
```

- [ ] Add the banner between the header section and the content section:

```tsx
{/* Heuristic Disclaimer Banner */}
{showHeuristicBanner && (
  <div className="mx-8 mt-4 mb-0 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200">
    <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
    <div>
      <p className="text-xs font-medium text-amber-800 mb-0.5">Heuristic Indicators</p>
      <p className="text-xs text-amber-700">
        These metrics are based on behavioral proxies and are being refined with machine learning.
        Use as directional guidance only — not as definitive business intelligence.
      </p>
    </div>
  </div>
)}
```

Place this between `{/* Content */}` and `<div>` wrapping the isLoading/error/children block.

- [ ] Commit:
```bash
git add src/components/brand/IntelligencePageWrapper.tsx
git commit -m "feat(intelligence): add heuristic disclaimer banner to IntelligencePageWrapper"
```

### Task 6.2: Remove "AI-powered" copy from intelligence page headers

**Files:**
- Modify: `src/app/(brand)/brand/intelligence/cultural-authority/page.tsx`
- Modify: `src/app/(brand)/brand/intelligence/memory/page.tsx`
- Modify: `src/app/(brand)/brand/intelligence/boutiques/page.tsx`
- Modify: `src/app/(brand)/brand/intelligence/design-demand/page.tsx`
- Modify: `src/app/(brand)/brand/intelligence/digital-twin/page.tsx`
- Modify: `src/app/(brand)/brand/intelligence/client-genome/page.tsx`

- [ ] For each intelligence page, find and update the `subtitle` prop passed to `IntelligencePageWrapper`. Remove "AI-powered", "intelligence-driven", "AI analysis" language. Replace with neutral descriptions. Example for cultural authority:

```tsx
// Before:
subtitle="AI-powered cultural authority scoring across key brand dimensions"
// After:
subtitle="Track cultural authority across key brand dimensions"
```

Run this to find all subtitle values:
```bash
grep -rn "subtitle=" src/app/\(brand\)/brand/intelligence/ | grep -i "ai\|intelligence\|powered\|driven"
```

Fix each one found.

- [ ] Commit:
```bash
git add src/app/(brand)/brand/intelligence/
git commit -m "fix(intelligence): remove AI-powered copy from intelligence page subtitles"
```

### Task 6.3: Add "Heuristic Indicator" tooltip to MetricCard

**Files:**
- Find MetricCard: `find src/components/brand -name "MetricCard.tsx"`
- Modify the file found

- [ ] Add a `heuristicNote` optional prop to `MetricCard`:

If `MetricCard.tsx` exists, add this prop and render a tooltip/note below each metric value:

```typescript
interface MetricCardProps {
  // ... existing props
  heuristicNote?: string;
}
```

In the card JSX, below the metric value, add:

```tsx
{heuristicNote && (
  <div className="flex items-center gap-1 mt-1">
    <Info size={10} className="text-amber-500" />
    <p className="text-[10px] text-amber-600">{heuristicNote}</p>
  </div>
)}
```

- [ ] For boutique performance page (`src/app/(brand)/brand/intelligence/boutiques/page.tsx`), find the "Footfall" and "Conversion Rate" metric cards and add a note that these require real POS data. Find where footfall is displayed and add:

```tsx
heuristicNote="Estimated from online views — requires POS data for accuracy"
```

For conversion rate:
```tsx
heuristicNote="Based on estimated footfall — not validated against actual visits"
```

- [ ] Commit:
```bash
git add src/components/brand/ src/app/(brand)/brand/intelligence/boutiques/
git commit -m "fix(intelligence): add heuristic tooltip to MetricCard and boutique metrics"
```
