# Moda Glimmora — Design Reference

---

## Color Palette

### Neutrals (Foundation)

| Name | Hex |
|------|-----|
| ivory-cream | `#FAF8F5` |
| ivory-warm | `#F5F1EA` |
| parchment | `#EDE8DF` |
| sand-light | `#E5DFD3` |
| sand | `#D4CBBF` |
| taupe | `#B8AEA0` |
| greige | `#9A8F82` |
| stone | `#7A7068` |
| charcoal-warm | `#4A453D` |
| charcoal-deep | `#2D2A26` |
| noir | `#1A1816` |

### Accents

| Name | Hex |
|------|-----|
| gold-soft | `#C9A962` |
| gold-muted | `#B89B4A` |
| gold-deep | `#9A7F35` |
| champagne | `#E8DCC4` |
| bronze-whisper | `#A8927A` |
| sapphire-mist | `#4A5568` |
| sapphire-subtle | `#5C6B7A` |
| sapphire-deep | `#2C3E50` |
| azure-whisper | `#E8ECF0` |

### Semantic

| Name | Hex |
|------|-----|
| success | `#4A6347` |
| success-soft | `#6B8068` |
| warning | `#A68B3D` |
| warning-soft | `#C4A35A` |
| error | `#8B5252` |
| error-soft | `#A67272` |
| info | `#4A5A6A` |
| info-soft | `#6B7A8A` |

### Surfaces

| Name | Value |
|------|-------|
| surface-base | `#FAF8F5` |
| surface-elevated | `#FFFFFF` |
| surface-sunken | `#F0EBE3` |
| surface-overlay | `rgba(45, 42, 38, 0.04)` |
| surface-glass | `rgba(250, 248, 245, 0.85)` |

### Text

| Name | Hex |
|------|-----|
| text-primary | `#1A1816` |
| text-secondary | `#4A453D` |
| text-tertiary | `#7A7068` |
| text-muted | `#9A8F82` |
| text-inverse | `#FAF8F5` |

### Borders

| Name | Value |
|------|-------|
| border-subtle | `rgba(180, 170, 155, 0.20)` |
| border-default | `rgba(180, 170, 155, 0.35)` |
| border-strong | `rgba(122, 112, 104, 0.50)` |
| divider | `rgba(180, 170, 155, 0.15)` |

---

## Typography

### Fonts

| Role | Family | Weights |
|------|--------|---------|
| Display / Headlines | Cormorant Garamond, Georgia, serif | 300, 400, 500, 600 |
| Body / UI | Outfit, -apple-system, sans-serif | 300, 400, 500, 600 |

Both imported from Google Fonts.

Font smoothing applied globally:
```
-webkit-font-smoothing: antialiased
-moz-osx-font-smoothing: grayscale
```

### Sizing Scale

| Use | Size |
|-----|------|
| Hero headline | `text-[15vw]` → `md:text-[12vw]` → `lg:text-[10vw]` |
| Brand hero h1 | `clamp(3rem, 8vw, 7rem)` |
| Section heading | `clamp(1.75rem, 4vw, 2.5rem)` |
| Page heading | `text-3xl md:text-4xl lg:text-5xl` |
| Card title | `text-lg md:text-xl` (Cormorant Garamond) |
| Body text | `text-base` (Outfit) |
| Labels / small caps | `text-xs` or `text-[10px]` to `text-[9px]` |
| Badges / counts | `text-[10px]` |

### Letter Spacing (Tracking)

| Use | Value |
|-----|-------|
| Hero headlines | `-0.04em` |
| Section headings | `-0.02em` |
| Logo | `0.15em` |
| Navigation links | `0.1em` |
| Button text | `0.15em` |
| Category labels | `0.2em – 0.25em` |
| Small caps / season tags | `0.3em – 0.5em` |

### Line Height

| Use | Value |
|-----|-------|
| Hero / display | `0.85` |
| Large headings | `1.0 – 1.1` |
| Body text | `1.6` |

---

## Gradients

### Named Gradients

| Name | Value |
|------|-------|
| ivory-flow | `linear-gradient(135deg, #FAF8F5 0%, #EDE8DF 100%)` |
| gold-whisper | `linear-gradient(135deg, #E8DCC4 0%, #C9A962 100%)` |
| intelligence-depth | `linear-gradient(180deg, #2C3E50 0%, #4A5568 100%)` |
| noir-editorial | `linear-gradient(135deg, #1A1816 0%, #2D2A26 50%, #4A453D 100%)` |
| dawn-luxury | `linear-gradient(135deg, #E8ECF0 0%, #FAF8F5 50%, #E8DCC4 100%)` |
| gold-aura | `linear-gradient(180deg, rgba(201, 169, 98, 0.1) 0%, rgba(250, 248, 245, 0) 100%)` |

### Image Overlay Gradients (inline)

| Use | Class |
|-----|-------|
| Hero overlay (dark) | `bg-gradient-to-b from-black/40 via-black/20 to-black/70` |
| Hero directional | `bg-gradient-to-r from-black/50 via-transparent to-black/30` |
| Product card bottom | `bg-gradient-to-t from-noir/70 via-noir/20 to-transparent` |
| Simple bottom fade | `bg-gradient-to-t from-noir/60 via-transparent to-transparent` |

---

## Shadows

| Name | Value |
|------|-------|
| sm | `0 1px 2px rgba(26, 24, 22, 0.04)` |
| md | `0 4px 12px rgba(26, 24, 22, 0.06)` |
| lg | `0 12px 32px rgba(26, 24, 22, 0.08)` |
| xl | `0 24px 64px rgba(26, 24, 22, 0.12)` |

All shadows use `noir (#1A1816)` base for a warm, soft luxury feel.

---

## Buttons

### Primary
```
bg: charcoal-deep (#2D2A26)    hover: noir (#1A1816)
text: ivory-cream, uppercase
padding: px-8 py-4
font: Outfit text-sm tracking-[0.15em]
transition: all 300ms
```

### Secondary
```
bg: transparent              hover: border-charcoal-deep
text: charcoal-deep, uppercase
border: border border-sand (#D4CBBF)
padding: px-8 py-4
font: Outfit text-sm tracking-[0.15em]
transition: all 300ms
```

### Gold
```
bg: gold-muted (#B89B4A)     hover: gold-deep (#9A7F35)
text: noir, uppercase
padding: px-8 py-4
font: Outfit text-sm tracking-[0.15em]
transition: all 300ms
```

### Inline CTA Link
```
text: text-sm tracking-[0.1em–0.3em] uppercase
color: charcoal-warm → hover: noir
display: flex items-center gap-2
often paired with ArrowRight or ArrowUpRight icon
```

---

## Cards

### Elevated Card
```
bg: white
border-radius: rounded-lg
shadow: shadow-md
hover: shadow-lg + -translate-y-1
transition: all 300ms
```

### Product Card
```
aspect-ratio: 3/4
bg placeholder: sand-light (#E5DFD3) or ivory-warm
image: object-cover, scale-[1.02] on hover (1000ms ease-out)
overlay: gradient-to-t from-noir/70 (bottom)
title: font-display (Cormorant Garamond) text-lg md:text-xl
```

### Bento Grid Card (featured)
```
col-span-2 row-span-2 for hero item
standard items: aspect-square or aspect-[3/4]
image: scale-105 on hover (700–1000ms)
overlay: gradient-to-t from-noir/60 or from-noir/70
title: font-display, various sizes text-lg → text-4xl
badge: text-[10px] tracking-[0.3em] uppercase
```

---

## Inputs

### Luxury Input
```
width: w-full
padding: px-5 py-4
bg: ivory-cream (#FAF8F5)
border: border border-sand (#D4CBBF)
text: charcoal-deep, text-base (Outfit)
placeholder: greige (#9A8F82)
focus: outline-none, border-gold-muted (#B89B4A)
transition: colors 300ms
```

---

## Badges & Tags

### Small Category / Season Badge
```
bg: transparent
border: border border-white/20
text: white uppercase text-[10px] tracking-[0.4em]
padding: px-4 py-2
```

### Intelligence / Dark Tag
```
bg: sapphire-mist (#4A5568)
text: ivory-cream uppercase text-xs tracking-[0.1em]
padding: px-4 py-1.5
border-radius: rounded-sm
```

### Count Badge (cart / wishlist)
```
bg: gold-muted (#B89B4A)
text: noir text-[10px]
size: min-w-4 h-4 rounded-full
position: absolute -top-1 -right-1
display: flex items-center justify-center px-1
```

### Section Divider Line
```
width: w-16
height: h-px (1px)
bg: gold-muted (#B89B4A)
margin: mx-auto
```

---

## Animations

### CSS Keyframes

| Name | Effect | Duration |
|------|--------|----------|
| fadeInUp | opacity 0→1, translateY 20px→0 | 0.6s ease |
| fadeIn | opacity 0→1 | 0.4s ease |
| slideUp | opacity 0→1, translateY 100%→0 | 0.5s ease |
| shimmer | background-position sweep (loading skeleton) | 1.5s infinite |

### Framer Motion Patterns

**Page load stagger:**
- Elements delay: `delay-300`, `delay-500`, `delay-700`, `delay-1000`
- Each item fades up from 20–30px offset

**Text reveal (SplitText / TextReveal):**
- Letter-by-letter reveal with `rotateX` 3D
- Stagger: 0.03s per character
- Duration: 0.8s per letter

**Card hover (MorphingCard):**
- `borderRadius` morphs `0% → 24%` on hover (0.6s)
- Image scale `1 → 1.08` (0.8s)
- `rotateX` / `rotateY` 3D rotation tracks mouse position

**Image hover:**
- `scale-[1.02]` to `scale-[1.05]` on hover
- Duration: 700ms – 1000ms ease-out

**Standard hover transition:**
```
transition-all duration-300
```

**Custom easing (Framer Motion):**
```
ease: [0.16, 1, 0.3, 1]
```

---

## Layout Patterns

### Spacing Rhythm

| Use | Value |
|-----|-------|
| Section vertical padding | `py-24 lg:py-32` |
| Container horizontal padding | `px-6 md:px-12 lg:px-16` |
| Hero inner padding | `px-8 md:px-16 lg:px-24` |
| Card inner padding | `p-6 md:p-8` |
| Grid gap (tight) | `gap-3 md:gap-4` |
| Grid gap (airy) | `gap-8 lg:gap-12` |

### Max Widths

| Use | Value |
|-----|-------|
| Wide content | `max-w-[1800px]` |
| Standard section | `max-w-[1600px]` |
| Narrower section | `max-w-[1400px]` |
| Reading width | `max-w-[1200px]` |
| Modals / focused | `max-w-[800px]` |

### Hero Sections
```
height: h-[100svh] or h-[70vh] min-h-[500px]
headline: text-[15vw] → md:text-[12vw] → lg:text-[10vw]
leading: leading-[0.85]
tracking: tracking-[-0.04em]
content anchored: bottom + pb-16 md:pb-24 lg:pb-32
overlays: layered gradients for depth
```

### Product Grid
```
grid: grid-cols-2 md:grid-cols-4
gap: gap-3 md:gap-4
featured item: col-span-2 row-span-2 (bento)
images: aspect-[3/4], bg sand-light placeholder
```

### Two-Column Editorial
```
grid lg:grid-cols-2 gap-8 lg:gap-12
left: large featured product aspect-[3/4]
right: 2×2 grid of smaller products
brand label: text-[9px] tracking-[0.25em] uppercase
product name: font-display text-lg–text-2xl
```

### Three-Column Story Grid
```
grid md:grid-cols-3 gap-6 lg:gap-8
each card: aspect-[4/5]
image: scale-[1.03] on hover (700ms)
type label: text-[10px] tracking-[0.2em] uppercase
title: font-display text-lg
```

### Brand Hero
```
height: h-[70vh] min-h-[500px]
inner: p-8 md:p-16 lg:p-24
h1: clamp(3rem, 8vw, 7rem), font-display
description: text-lg, text-white/70
```

### Split Info Card Layout
```
grid lg:grid-cols-2 gap-16 lg:gap-24
right card: bg-white p-8 border border-sand/30
stats row: grid grid-cols-2 gap-8 (or grid-cols-3)
stat number: font-display text-2xl–text-3xl
stat label: text-[10px] tracking-[0.3em] uppercase
```

### CTA Block (centered, dark bg)
```
bg: charcoal-deep or noir
inner: max-w-[800px] mx-auto text-center
heading: font-display text-3xl–text-5xl text-ivory-cream
subtext: Outfit, text-greige/muted
```

---

## Navigation Header

```
position: fixed top-0 left-0 right-0 z-50
bg: ivory-cream/95, backdrop-blur-sm
border-b: border-sand/30
padding: px-6 lg:px-12 py-4

logo: font-display text-2xl lg:text-3xl tracking-[0.15em] uppercase
      absolutely centered: left-1/2 -translate-x-1/2

nav links: text-sm tracking-[0.1em] uppercase
           text-charcoal-warm → hover: text-noir

top announcement bar: text-xs tracking-[0.2em] uppercase
                      border-b border-sand/20
                      (hidden on desktop, shown on mobile)
```

### Dropdown Menus
```
bg: white, shadow-lg, rounded-lg
padding: p-6, min-w-[280px]
heading: text-xs tracking-[0.15em] uppercase text-greige
items: space-y-3, font-display text-lg text-charcoal-deep
       hover: text-gold-muted
```

### Account / Notification Dropdowns
```
bg: white, shadow-xl, border border-sand/30–sand/50
items: px-4–5 py-3–4, text-sm text-charcoal-deep
       border-b border-sand/20, hover: bg-parchment (or /50)
unread dot: w-1.5 h-1.5 rounded-full bg-gold-soft
notification width: w-80, max-h-72 overflow-y-auto
date text: text-[10px]
```

### Mobile Menu
```
position: absolute top-full left-0 right-0
bg: white, shadow-lg, animate-slide-up
max-h-[80vh] overflow-y-auto
padding: p-6, space-y-6
section labels: text-xs tracking-[0.15em] uppercase text-greige
```

---

## Scrollbar & Selection

```css
/* Scrollbar */
::-webkit-scrollbar         { width: 8px }
::-webkit-scrollbar-track   { background: #EDE8DF }  /* parchment */
::-webkit-scrollbar-thumb   { background: #B8AEA0; border-radius: 4px }
::-webkit-scrollbar-thumb:hover { background: #7A7068 }

/* Text selection */
::selection {
  background: #E8DCC4;  /* champagne */
  color: #1A1816;       /* noir */
}
```

---

## Design Mood Summary

**Overall feeling:** Editorial luxury — warm, sophisticated, unhurried.

**Color story:** Warm cream and sand base with gold as the primary premium signal. Sapphire tones used only for intelligence/data features. Everything else stays in the warm neutral range.

**Typography story:** Two fonts only. Cormorant Garamond for every headline (light, elegant, editorial). Outfit for all body text and UI labels (clean, modern). Extreme letter-spacing on small labels creates the luxury spacing feel.

**Animation story:** Slow, confident, never abrupt. Images scale gently. Text reveals letter by letter. Entrance animations are staggered — the page breathes in rather than jumping at you.

**Whitespace story:** Very generous. Sections breathe with py-24 to py-32. Grids never feel cramped. The emptiness is intentional.

**Interaction story:** Hover states are subtle — a gentle image scale, a color shift, a shadow lift. Nothing dramatic. The product is the hero, not the interaction.
