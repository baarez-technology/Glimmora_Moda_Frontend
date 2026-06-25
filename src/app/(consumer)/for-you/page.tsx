'use client';

/**
 * For-You / Concierge Dashboard (P2 of consumer UX maturity rework)
 *
 * Single page that surfaces 6 of the 10 USPs at a glance so customers stop
 * needing to dig through profile sub-routes to find their AI intelligence.
 *
 * Sections (top to bottom):
 *   1. Header — "Your Personal Intelligence"
 *   2. Intelligence strip — 4 KPI tiles (Body Twin / Wardrobe / Calendar / Style DNA)
 *   3. Event-driven outfit (USP 8) — next upcoming event → outfit teaser
 *   4. Silent Cart gaps (USP 7) — 3 cards
 *   5. Stories curated for you (USP 3) — quick links
 *   6. Continue exploring (CTA → Discover)
 *
 * Pure FE composition. Uses existing services only — no new BE endpoints required.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Ruler, Shirt, Calendar as CalendarIcon, Sparkles,
  ArrowRight, BookOpen, AlertCircle,
} from 'lucide-react';

import { getDigitalBodyTwin } from '@/services/digital-body-twin.service';
import { getStyleDna, type StyleDna } from '@/services/style-dna.service';
import { getWardrobe, getSilentCart } from '@/services/wardrobe.service';
import { getCalendarEvents } from '@/services/calendar.service';
import { searchStories } from '@/services/recommendation.service';

import type { DigitalBodyTwin } from '@/types/intelligence';
import type { BackendCalendarEvent } from '@/types/calendar';
import type { GapAnalysisItem } from '@/services/wardrobe.service';
import { formatPrice } from '@/lib/currency';

// ─── Small reusable tile ─────────────────────────────────────────────────────

interface IntelligenceTileProps {
  icon: React.ReactNode;
  label: string;
  primary: string;
  secondary?: string;
  status: 'ready' | 'pending' | 'empty';
  ctaLabel: string;
  ctaHref: string;
}

function IntelligenceTile({ icon, label, primary, secondary, status, ctaLabel, ctaHref }: IntelligenceTileProps) {
  const accent =
    status === 'ready' ? 'bg-success/12 text-success'
    : status === 'pending' ? 'bg-warning/12 text-warning'
    : 'bg-stone/12 text-stone';

  return (
    <div className="group relative bg-white rounded-xl border border-sand/50 p-5 shadow-card-lift hover:shadow-luxe hover:-translate-y-0.5 transition-all duration-500 overflow-hidden">
      <div
        className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ background: 'radial-gradient(circle, rgba(201,169,98,0.18) 0%, transparent 70%)' }}
        aria-hidden="true"
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <span className="text-[10px] font-semibold tracking-[0.28em] uppercase text-stone">{label}</span>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent}`}>{icon}</div>
        </div>
        <p
          className="font-display font-light text-2xl text-charcoal-deep leading-tight tracking-[-0.025em] mb-1 font-mono-tight"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {primary}
        </p>
        {secondary && <p className="text-xs text-taupe mb-3">{secondary}</p>}
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-[0.15em] uppercase text-charcoal-deep hover:text-gold-deep transition-colors mt-2"
        >
          {ctaLabel}
          <ArrowRight size={11} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

interface StorySummary {
  id: string;
  brandId?: string;
  title: string;
  excerpt?: string;
}

export default function ForYouPage() {
  const [bodyTwin, setBodyTwin] = useState<DigitalBodyTwin | null>(null);
  const [styleDna, setStyleDna] = useState<StyleDna | null>(null);
  const [wardrobeCount, setWardrobeCount] = useState<number | null>(null);
  const [events, setEvents] = useState<BackendCalendarEvent[]>([]);
  const [silentCart, setSilentCart] = useState<GapAnalysisItem[]>([]);
  const [silentCartLoading, setSilentCartLoading] = useState(true);
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      try {
        const [twin, dna, wardrobeRes, evts] = await Promise.allSettled([
          getDigitalBodyTwin(),
          getStyleDna(),
          getWardrobe(),
          getCalendarEvents(false),
        ]);
        if (!active) return;
        if (twin.status === 'fulfilled') setBodyTwin(twin.value);
        if (dna.status === 'fulfilled') setStyleDna(dna.value);
        if (wardrobeRes.status === 'fulfilled') {
          const count = wardrobeRes.value?.data?.length ?? 0;
          setWardrobeCount(count);
        }
        if (evts.status === 'fulfilled') {
          // Show next 3 upcoming
          const now = Date.now();
          const upcoming = (evts.value || [])
            .filter(e => {
              const t = new Date(e.event_date).getTime();
              return !isNaN(t) && t >= now - 86400000; // include today
            })
            .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
            .slice(0, 3);
          setEvents(upcoming);
        }
      } finally {
        if (active) setLoading(false);
      }

      // Silent Cart is its own loader so its slower fetch doesn't gate the rest.
      try {
        const sc = await getSilentCart();
        if (active) setSilentCart((sc?.gap_analysis ?? []).slice(0, 3));
      } catch {
        // Empty / 404 / not-yet-generated → graceful empty state
      } finally {
        if (active) setSilentCartLoading(false);
      }

      // Stories — pulls from recommendation service which already has ES fallback.
      try {
        const fetched = await searchStories({ limit: 3 });
        if (active && Array.isArray(fetched)) {
          setStories(
            fetched.slice(0, 3).map(s => ({
              id: s.id,
              brandId: s.brandId,
              title: s.title,
              excerpt: s.excerpt,
            })),
          );
        }
      } catch {
        // ignore
      }
    };

    hydrate();
    return () => { active = false; };
  }, []);

  // ─── Computed display values ─────────────────────────────────────────────

  const bodyTwinTile = bodyTwin
    ? { primary: 'Captured', secondary: '11 measurements', status: 'ready' as const }
    : { primary: 'Not yet', secondary: '90 seconds to unlock fit AI', status: 'empty' as const };

  const wardrobeTile = wardrobeCount && wardrobeCount > 0
    ? { primary: `${wardrobeCount} piece${wardrobeCount === 1 ? '' : 's'}`, secondary: 'Feeds Silent Cart', status: 'ready' as const }
    : { primary: 'Empty', secondary: 'Add pieces you already own', status: 'empty' as const };

  const eventsTile = events.length > 0
    ? { primary: `${events.length} upcoming`, secondary: 'Next 30 days', status: 'ready' as const }
    : { primary: 'Sync calendar', secondary: 'Get event-based outfits', status: 'empty' as const };

  const styleDnaTile = styleDna
    ? { primary: styleDna.archetype || 'Captured', secondary: `${(styleDna.styleKeywords?.length ?? 0)} signal${(styleDna.styleKeywords?.length ?? 0) === 1 ? '' : 's'}`, status: 'ready' as const }
    : { primary: 'Pending', secondary: 'Refine onboarding answers', status: 'pending' as const };

  const nextEvent = events[0];

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-luxe opacity-90 pointer-events-none" aria-hidden="true" />
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,169,98,0.35) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-12 lg:py-16">
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-gold-deep animate-pulse-gold" />
            <span className="text-[10px] font-semibold tracking-[0.4em] uppercase text-gold-deep">
              For you · curated live
            </span>
          </div>
          <h1
            className="font-display font-light text-[clamp(2.25rem,4.5vw,3.75rem)] text-charcoal-deep leading-[1.04] mb-4"
            style={{ fontVariationSettings: '"opsz" 144' }}
          >
            Your Personal{' '}
            <span className="italic text-gold-deep" style={{ fontVariationSettings: '"opsz" 144' }}>
              Intelligence
            </span>
          </h1>
          <p className="text-base md:text-[15px] text-stone max-w-2xl leading-relaxed">
            Everything the platform knows about your style, body, calendar, and wardrobe — at a glance.
            The more complete this is, the sharper every recommendation gets.
          </p>
        </div>
      </section>

      {/* ── Intelligence strip — 4 tiles ─────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-8 -mt-2">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-36 rounded-xl bg-white border border-sand/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <IntelligenceTile
              icon={<Ruler size={16} strokeWidth={1.75} />}
              label="Body Twin"
              {...bodyTwinTile}
              ctaLabel={bodyTwin ? 'Update' : 'Capture'}
              ctaHref="/profile/body-twin"
            />
            <IntelligenceTile
              icon={<Shirt size={16} strokeWidth={1.75} />}
              label="Wardrobe"
              {...wardrobeTile}
              ctaLabel={wardrobeCount ? 'View' : 'Add pieces'}
              ctaHref="/wardrobe"
            />
            <IntelligenceTile
              icon={<CalendarIcon size={16} strokeWidth={1.75} />}
              label="Calendar"
              {...eventsTile}
              ctaLabel={events.length ? 'See events' : 'Connect'}
              ctaHref="/calendar"
            />
            <IntelligenceTile
              icon={<Sparkles size={16} strokeWidth={1.75} />}
              label="Style DNA"
              {...styleDnaTile}
              ctaLabel={styleDna ? 'Refine' : 'Capture'}
              ctaHref="/profile/style-dna"
            />
          </div>
        )}
      </section>

      {/* ── Event-driven outfit (USP 8) ──────────────────────────────────── */}
      {nextEvent && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-8">
          <div className="bg-noir text-ivory-cream rounded-2xl overflow-hidden shadow-glow-noir bg-mesh-noir">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
              <div className="lg:col-span-1 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-white/10">
                <span className="text-[10px] font-semibold tracking-[0.4em] uppercase text-gold-soft mb-3 block">
                  For your next event
                </span>
                <h2
                  className="font-display font-light text-3xl text-ivory-cream leading-tight mb-3 tracking-[-0.02em]"
                  style={{ fontVariationSettings: '"opsz" 144' }}
                >
                  {nextEvent.title}
                </h2>
                <p className="text-sm text-ivory-warm/70 mb-1">
                  {new Date(nextEvent.event_date).toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric',
                  })}
                </p>
                {nextEvent.location && (
                  <p className="text-xs text-ivory-warm/50">{nextEvent.location}</p>
                )}
                <Link
                  href={`/calendar?event=${nextEvent.calendar_event_id}`}
                  className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full bg-gold-soft/15 border border-gold-soft/30 text-gold-soft text-xs font-semibold tracking-[0.18em] uppercase hover:bg-gold-soft hover:text-noir transition-all"
                >
                  Plan outfit
                  <ArrowRight size={12} strokeWidth={2} />
                </Link>
              </div>
              <div className="lg:col-span-2 p-8 lg:p-10 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <p className="text-sm text-ivory-warm/60 leading-relaxed italic">
                    &ldquo;Complete-the-Look engine reads your wardrobe, body twin, and the event tone
                    to propose a full ensemble — anchored to {nextEvent.title.toLowerCase()}.&rdquo;
                  </p>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-gold-soft/70 mt-4">
                    USP 5 + 8
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Silent Cart (USP 7) ──────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-[10px] font-semibold tracking-[0.32em] uppercase text-gold-deep block mb-1.5">
              Silent Cart
            </span>
            <h2
              className="font-display font-light text-3xl text-charcoal-deep tracking-[-0.025em]"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              Gaps in your wardrobe
            </h2>
          </div>
          <Link
            href="/profile/silent-cart"
            className="group inline-flex items-center gap-1 text-[11px] font-semibold tracking-tight text-charcoal-deep hover:text-gold-deep transition-colors"
          >
            See all gaps
            <ArrowRight size={12} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {silentCartLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-56 rounded-xl bg-white border border-sand/40 animate-pulse" />
            ))}
          </div>
        ) : silentCart.length === 0 ? (
          <div className="bg-white rounded-xl border border-sand/50 p-10 text-center">
            <div className="w-12 h-12 mx-auto rounded-lg bg-stone/10 flex items-center justify-center mb-4">
              <AlertCircle size={18} className="text-stone" />
            </div>
            <p className="text-charcoal-deep font-medium mb-1">No gaps yet</p>
            <p className="text-xs text-stone mb-4">Add 5+ pieces to your wardrobe so the AI can analyze your gaps.</p>
            <Link
              href="/wardrobe"
              className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-[0.15em] uppercase text-charcoal-deep hover:text-gold-deep transition-colors"
            >
              Add pieces <ArrowRight size={11} strokeWidth={2} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {silentCart.map((gap, idx) => {
              const p = gap.matched_product;
              const score = Math.round((gap.product_match_score || 0) * 100);
              return (
                <div
                  key={idx}
                  className="group relative bg-white rounded-xl border border-sand/50 overflow-hidden shadow-card-lift hover:shadow-luxe hover:-translate-y-0.5 transition-all duration-500"
                >
                  <div
                    className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-gold-soft/0 via-gold-soft to-gold-soft/0 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-hidden="true"
                  />
                  <div className="p-5">
                    <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-gold-deep block mb-2">
                      Gap #{idx + 1} · {gap.suggestion.product_category}
                    </span>
                    <h3
                      className="font-display font-light text-lg text-charcoal-deep leading-tight tracking-[-0.01em] mb-2"
                      style={{ fontVariationSettings: '"opsz" 144' }}
                    >
                      {gap.suggestion.title}
                    </h3>
                    <p className="text-xs text-stone leading-relaxed mb-4">
                      {gap.suggestion.fabric} · {gap.suggestion.pattern} · {gap.suggestion.color}
                    </p>
                    {p ? (
                      <Link
                        href={`/product/${p.product_id}`}
                        className="block border-t border-sand/40 -mx-5 -mb-5 mt-4 px-5 py-4 bg-parchment/30 hover:bg-parchment/60 transition-colors"
                      >
                        <p className="text-xs tracking-[0.15em] uppercase text-taupe mb-1">{p.brand_name}</p>
                        <p className="text-sm text-charcoal-deep font-medium mb-1 truncate">{p.product_name}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-charcoal-deep font-mono-tight">{formatPrice(p.price)}</p>
                          {score > 0 && (
                            <span className="text-[10px] font-semibold tracking-tight text-gold-deep">
                              {score}% match
                            </span>
                          )}
                        </div>
                      </Link>
                    ) : (
                      <p className="text-[11px] italic text-taupe mt-2">No catalog match yet — check back soon</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Stories curated for you (USP 3) ──────────────────────────────── */}
      {stories.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.32em] uppercase text-gold-deep block mb-1.5">
                Editorial · curated
              </span>
              <h2
                className="font-display font-light text-3xl text-charcoal-deep tracking-[-0.025em]"
                style={{ fontVariationSettings: '"opsz" 144' }}
              >
                Stories for you
              </h2>
            </div>
            <Link
              href="/stories"
              className="group inline-flex items-center gap-1 text-[11px] font-semibold tracking-tight text-charcoal-deep hover:text-gold-deep transition-colors"
            >
              All stories
              <ArrowRight size={12} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {stories.map(story => (
              <Link
                key={story.id}
                href={`/story/${story.id}`}
                className="group block bg-white rounded-xl border border-sand/50 p-6 shadow-card-lift hover:shadow-luxe hover:-translate-y-0.5 transition-all duration-500"
              >
                <BookOpen size={18} strokeWidth={1.75} className="text-gold-deep mb-4" />
                <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-taupe mb-2">
                  Editorial
                </p>
                <h3
                  className="font-display font-light text-xl text-charcoal-deep leading-tight tracking-[-0.015em] mb-3 group-hover:text-gold-deep transition-colors"
                  style={{ fontVariationSettings: '"opsz" 144' }}
                >
                  {story.title}
                </h3>
                {story.excerpt && (
                  <p className="text-xs text-stone leading-relaxed line-clamp-3">{story.excerpt}</p>
                )}
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.2em] uppercase text-charcoal-deep mt-4 group-hover:gap-2 transition-all">
                  Read story
                  <ArrowRight size={11} strokeWidth={2} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Continue exploring CTA ───────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-12">
        <div className="bg-mesh-luxe rounded-2xl border border-sand/40 p-10 lg:p-14 text-center shadow-card-lift">
          <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-gold-deep mb-3">
            Continue your journey
          </p>
          <h2
            className="font-display font-light text-[clamp(1.75rem,3vw,2.5rem)] text-charcoal-deep leading-tight tracking-[-0.025em] mb-6"
            style={{ fontVariationSettings: '"opsz" 144' }}
          >
            Discover pieces tailored to your taste
          </h2>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-charcoal-deep text-ivory-cream text-xs font-semibold tracking-[0.18em] uppercase hover:bg-noir transition-all shadow-glow-noir hover:shadow-glow-gold"
          >
            View Discover
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
        </div>
      </section>
    </div>
  );
}
