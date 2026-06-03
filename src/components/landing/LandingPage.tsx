'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Sparkles, Eye, Lock, Globe } from 'lucide-react';

const MAISONS = [
  {
    name: 'Dior',
    tagline: 'House of Couture',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=85',
    accent: '1947',
  },
  {
    name: 'Hermès',
    tagline: 'Artisans Since 1837',
    image: 'https://images.unsplash.com/photo-1606293459107-7906d64bbe09?w=900&q=85',
    accent: '1837',
  },
  {
    name: 'Gucci',
    tagline: 'Florentine Mastery',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=85',
    accent: '1921',
  },
  {
    name: 'Louis Vuitton',
    tagline: 'The Art of Travel',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=85',
    accent: '1854',
  },
  {
    name: 'Bottega Veneta',
    tagline: 'Quiet Luxury',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900&q=85',
    accent: '1966',
  },
];

const PILLARS = [
  {
    icon: Eye,
    label: 'Discovery',
    title: 'Non-Transactional',
    body: 'Explore maisons through heritage, craft, and atelier — without entering a commerce flow.',
  },
  {
    icon: Sparkles,
    label: 'Intelligence',
    title: 'Quietly Considered',
    body: 'Recommendations grounded in your taste, body, and lived occasions — explainable, reversible, yours.',
  },
  {
    icon: Lock,
    label: 'Trust',
    title: 'No Dark Patterns',
    body: 'No artificial urgency. No data sales. Your identity is never inferred from sensitive attributes.',
  },
  {
    icon: Globe,
    label: 'Reach',
    title: 'Never Out of Stock',
    body: 'A global inventory intelligence layer that surfaces pieces from boutiques you would never have known.',
  },
];

const STORIES = [
  {
    label: 'Heritage',
    title: 'The Cannage, Recomposed',
    excerpt: 'How a Napoleon III chair became the soul of a maison. Eight hours of hand-stitching per bag.',
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=1200&q=85',
  },
  {
    label: 'Atelier',
    title: 'The Bar Jacket, Reimagined',
    excerpt: 'Seventy-seven years of New Look. Architectural shoulders cut by hand in Paris.',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=85',
  },
  {
    label: 'Craftsmanship',
    title: 'The Carré, Seventy Hands',
    excerpt: 'A single silk square traverses seventy artisans before it reaches yours.',
    image: 'https://images.unsplash.com/photo-1601762603339-fd61e28b698a?w=1200&q=85',
  },
];

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="bg-noir overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════════
          HERO — Full Screen Editorial
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative h-[100svh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=2000&q=90"
            alt="ModaGlimmora — luxury fashion intelligence"
            fill
            sizes="100vw"
            className={`object-cover transition-all duration-[2500ms] ease-out ${
              isLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'
            }`}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-noir/30 via-noir/10 to-noir/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-noir/40 via-transparent to-noir/20" />
        </div>

        <div className="relative h-full flex flex-col justify-between pt-28 pb-16 md:pb-24 lg:pb-32 px-8 md:px-16 lg:px-24">
          {/* Top Mark */}
          <div
            className={`flex items-center justify-between transition-all duration-1000 delay-300 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <span className="inline-block px-4 py-2 border border-white/20 text-[10px] tracking-[0.4em] uppercase text-white/70 backdrop-blur-sm">
              V10.2 · Intelligence
            </span>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/auth/login?mode=consumer" className="text-white/60 hover:text-white text-xs tracking-[0.3em] uppercase transition-colors duration-500">
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-3 border border-white/30 text-white text-xs tracking-[0.3em] uppercase hover:bg-white hover:text-charcoal-deep transition-all duration-500"
              >
                Begin
              </Link>
            </div>
          </div>

          {/* Hero Headline */}
          <div>
            <h1
              className={`transition-all duration-1000 delay-500 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              <span className="block font-display text-[14vw] md:text-[11vw] lg:text-[9vw] leading-[0.85] tracking-[-0.04em] text-white">
                Intelligence,
              </span>
              <span className="block font-display text-[14vw] md:text-[11vw] lg:text-[9vw] leading-[0.85] tracking-[-0.04em] text-white/40 italic -mt-2 md:-mt-4">
                not transaction.
              </span>
            </h1>

            <div
              className={`flex flex-col md:flex-row md:items-end md:justify-between mt-12 md:mt-16 gap-8 transition-all duration-1000 delay-700 ${
                isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <p className="font-body text-sm md:text-base text-white/60 max-w-lg leading-relaxed tracking-wide">
                The world&rsquo;s first fashion intelligence operating system.
                Discover the maisons, the atelier, the heritage — before you ever browse a product.
              </p>

              <Link
                href="/auth/register"
                className="group flex items-center gap-6 self-start md:self-auto"
              >
                <span className="font-body text-xs tracking-[0.3em] uppercase text-white/70 group-hover:text-white transition-colors duration-500">
                  Begin Your Journey
                </span>
                <span className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-ivory-cream group-hover:scale-110 transition-all duration-500">
                  <ArrowRight size={20} className="text-white group-hover:text-charcoal-deep transition-colors duration-500" strokeWidth={1} />
                </span>
              </Link>
            </div>
          </div>

          {/* Scroll Line */}
          <div
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-3 transition-opacity duration-1000 delay-1000 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="text-[9px] tracking-[0.3em] uppercase text-white/30">Scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MANIFESTO — Editorial Pull Quote
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-ivory-cream py-32 lg:py-44">
        <div className="max-w-5xl mx-auto px-8 md:px-16 text-center">
          <span className="font-body text-[11px] tracking-[0.4em] uppercase text-charcoal-warm block mb-8">
            The Premise
          </span>
          <p className="font-display text-3xl md:text-5xl lg:text-6xl leading-[1.15] tracking-[-0.02em] text-charcoal-deep">
            ModaGlimmora does not sell fashion.
            <span className="block text-stone italic mt-3">It decides what fashion should exist.</span>
          </p>
          <div className="w-16 h-px bg-gold-soft mx-auto mt-12 mb-8" />
          <p className="font-body text-sm md:text-base text-stone leading-relaxed max-w-2xl mx-auto tracking-wide">
            A global intelligence layer above maisons, marketplaces, and boutiques — surfacing pieces that resonate with who you are,
            not what an algorithm wants you to buy.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          THE MAISONS — Bento Grid
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-parchment py-24 lg:py-32">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex items-end justify-between mb-12 lg:mb-16">
            <div>
              <span className="font-body text-[11px] tracking-[0.3em] uppercase text-charcoal-warm block mb-3">
                The Houses
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal-deep tracking-[-0.02em]">
                Maisons in Residence
              </h2>
            </div>
            <Link href="/auth/register" className="group hidden md:flex items-center gap-2 text-stone hover:text-charcoal-deep transition-colors">
              <span className="font-body text-sm">Explore All</span>
              <ArrowRight size={16} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {/* Feature - 2x2 */}
            <Link
              href="/auth/register"
              className="col-span-2 row-span-2 group relative aspect-square overflow-hidden bg-sand-light"
            >
              <Image
                src={MAISONS[0].image}
                alt={MAISONS[0].name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-noir/30 to-transparent" />
              <div className="absolute top-6 right-6 text-white/50 text-[10px] tracking-[0.4em] uppercase">
                {MAISONS[0].accent}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <p className="font-body text-[10px] tracking-[0.3em] uppercase text-white/60 mb-3">{MAISONS[0].tagline}</p>
                <h3 className="font-display text-3xl md:text-5xl text-white mb-4 tracking-[-0.02em]">{MAISONS[0].name}</h3>
                <div className="flex items-center gap-2 text-white/70 group-hover:text-white transition-colors">
                  <span className="font-body text-xs tracking-wide">Discover the House</span>
                  <ArrowUpRight size={14} strokeWidth={1.5} />
                </div>
              </div>
            </Link>

            {/* Remaining - 1x1 */}
            {MAISONS.slice(1).map((m) => (
              <Link
                key={m.name}
                href="/auth/register"
                className="group relative aspect-square overflow-hidden bg-sand-light"
              >
                <Image
                  src={m.image}
                  alt={m.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-noir/10 to-transparent" />
                <div className="absolute top-4 right-4 text-white/40 text-[9px] tracking-[0.3em] uppercase">
                  {m.accent}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <p className="font-body text-[9px] tracking-[0.3em] uppercase text-white/50 mb-2">{m.tagline}</p>
                  <h3 className="font-display text-xl md:text-2xl text-white tracking-[-0.02em]">{m.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PILLARS — Four Principles
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-noir-editorial py-24 lg:py-32 text-ivory-cream">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-16 lg:mb-24">
            <span className="font-body text-[11px] tracking-[0.4em] uppercase text-gold-soft block mb-4">
              The Architecture
            </span>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl tracking-[-0.02em] text-ivory-cream">
              Four Pillars,<span className="italic text-ivory-cream/60"> One Premise.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-ivory-cream/10">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="bg-noir-editorial p-8 lg:p-10 flex flex-col justify-between min-h-[320px] group hover:bg-charcoal-deep/40 transition-colors duration-700"
                >
                  <div>
                    <Icon size={22} strokeWidth={1} className="text-gold-soft mb-8 group-hover:scale-110 transition-transform duration-500" />
                    <span className="font-body text-[10px] tracking-[0.4em] uppercase text-gold-soft/60 block mb-3">
                      {p.label}
                    </span>
                    <h3 className="font-display text-2xl lg:text-3xl text-ivory-cream tracking-[-0.02em] mb-4">
                      {p.title}
                    </h3>
                  </div>
                  <p className="font-body text-sm text-ivory-cream/60 leading-relaxed">
                    {p.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STORIES — Editorial Three-Column
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-ivory-cream py-24 lg:py-32">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex items-end justify-between mb-16 lg:mb-20">
            <div>
              <span className="font-body text-[11px] tracking-[0.3em] uppercase text-charcoal-warm block mb-3">
                Cultural Editorial
              </span>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal-deep tracking-[-0.02em]">
                Stories of Atelier
              </h2>
            </div>
            <Link href="/auth/register" className="group hidden md:flex items-center gap-2 text-stone hover:text-charcoal-deep transition-colors">
              <span className="font-body text-sm">Read More</span>
              <ArrowRight size={16} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {STORIES.map((s) => (
              <Link key={s.title} href="/auth/register" className="group">
                <div className="relative aspect-[4/5] overflow-hidden bg-sand-light mb-6">
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute top-5 left-5">
                    <span className="inline-block px-3 py-1.5 bg-ivory-cream/95 backdrop-blur-sm text-[10px] tracking-[0.3em] uppercase text-charcoal-deep">
                      {s.label}
                    </span>
                  </div>
                </div>
                <h3 className="font-display text-xl md:text-2xl text-charcoal-deep tracking-[-0.01em] mb-3 group-hover:text-gold-deep transition-colors duration-500">
                  {s.title}
                </h3>
                <p className="font-body text-sm text-stone leading-relaxed">
                  {s.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          TIERS — Two Doors
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-parchment py-24 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="text-center mb-16 lg:mb-20">
            <span className="font-body text-[11px] tracking-[0.3em] uppercase text-charcoal-warm block mb-3">
              Two Doors
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal-deep tracking-[-0.02em]">
              A Journey for Each.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Consumer */}
            <div className="bg-ivory-cream p-10 lg:p-14 group hover:shadow-lg transition-shadow duration-700">
              <span className="font-body text-[10px] tracking-[0.4em] uppercase text-gold-deep block mb-6">
                For the Curious
              </span>
              <h3 className="font-display text-3xl md:text-4xl text-charcoal-deep tracking-[-0.02em] mb-6">
                Consumer
              </h3>
              <p className="font-body text-sm text-stone leading-relaxed mb-10 max-w-md">
                Personal fashion identity, body twin, wardrobe intelligence, fit confidence,
                story-led discovery, and explainable recommendations — all yours, fully reversible.
              </p>
              <ul className="space-y-3 mb-10">
                {['Personal style identity', 'Digital body twin', 'Wardrobe gap analysis', 'Conversational discovery'].map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-sm font-body text-charcoal-warm">
                    <span className="w-px h-3 bg-gold-soft" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-4 text-charcoal-deep group/btn"
              >
                <span className="font-body text-xs tracking-[0.3em] uppercase">Begin as Consumer</span>
                <span className="w-12 h-12 border border-charcoal-deep/20 flex items-center justify-center group-hover/btn:bg-charcoal-deep group-hover/btn:border-charcoal-deep transition-all duration-500">
                  <ArrowRight size={16} className="text-charcoal-deep group-hover/btn:text-ivory-cream transition-colors duration-500" strokeWidth={1.5} />
                </span>
              </Link>
            </div>

            {/* UHNI */}
            <div className="bg-noir p-10 lg:p-14 text-ivory-cream group hover:shadow-xl transition-shadow duration-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gold-aura opacity-30 pointer-events-none" />
              <div className="relative">
                <span className="font-body text-[10px] tracking-[0.4em] uppercase text-gold-soft block mb-6">
                  By Invitation
                </span>
                <h3 className="font-display text-3xl md:text-4xl text-ivory-cream tracking-[-0.02em] mb-6">
                  UHNI
                </h3>
                <p className="font-body text-sm text-ivory-cream/70 leading-relaxed mb-10 max-w-md">
                  Zero-UI commerce, autonomous concierge, private sourcing, archive-to-contemporary access, bespoke commissioning —
                  delivered with concierge-grade discretion.
                </p>
                <ul className="space-y-3 mb-10">
                  {['Private sourcing', 'Autonomous concierge', 'Bespoke commissioning', 'Invisible commerce mode'].map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm font-body text-ivory-cream/70">
                      <span className="w-px h-3 bg-gold-soft" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-4 text-ivory-cream group/btn"
                >
                  <span className="font-body text-xs tracking-[0.3em] uppercase">Request Access</span>
                  <span className="w-12 h-12 border border-gold-soft/40 flex items-center justify-center group-hover/btn:bg-gold-soft group-hover/btn:border-gold-soft transition-all duration-500">
                    <ArrowRight size={16} className="text-gold-soft group-hover/btn:text-noir transition-colors duration-500" strokeWidth={1.5} />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA — Editorial Closing
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-noir py-32 lg:py-44 text-ivory-cream">
        <div className="max-w-4xl mx-auto px-8 md:px-16 text-center">
          <span className="font-body text-[10px] tracking-[0.4em] uppercase text-gold-soft block mb-8">
            When fashion stops guessing
          </span>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1.05] tracking-[-0.03em] text-ivory-cream mb-12">
            Intelligence
            <span className="block italic text-ivory-cream/50">begins.</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-12">
            <Link
              href="/auth/register"
              className="group px-10 py-5 bg-ivory-cream text-charcoal-deep text-xs tracking-[0.3em] uppercase flex items-center gap-4 hover:bg-gold-soft transition-colors duration-500"
            >
              Begin Your Journey
              <ArrowRight size={16} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-500" />
            </Link>
            <Link
              href="/auth/login?mode=consumer"
              className="px-10 py-5 border border-ivory-cream/30 text-ivory-cream text-xs tracking-[0.3em] uppercase hover:border-ivory-cream transition-colors duration-500"
            >
              Sign In
            </Link>
          </div>
          <p className="font-body text-[11px] tracking-[0.2em] uppercase text-ivory-cream/30 mt-16">
            ModaGlimmora · A Baarez Technology Solutions production
          </p>
        </div>
      </section>

    </div>
  );
}
