'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Archive, Calendar, Sparkles, ArrowRight, Crown, BookOpen, Search, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getHeritageEvents, getCulturalJourneys, getBrands } from '@/services/uhni.service';
import { searchStories } from '@/services/recommendation.service';
import type { HeritageEvent, HeritageEventSignificance, CulturalJourney, Brand, BrandStory } from '@/types';

type Tab = 'timeline' | 'stories';
type SignificanceFilter = 'all' | HeritageEventSignificance;
type SortOption = 'newest' | 'brand-az';

const STORY_TYPES = ['heritage', 'craftsmanship', 'collection', 'collaboration', 'artisan'] as const;
const TYPE_LABELS: Record<string, string> = {
  heritage: 'Heritage',
  craftsmanship: 'Craftsmanship',
  collection: 'Collection',
  collaboration: 'Collaboration',
  artisan: 'Artisan',
};

function safeImageSrc(src: string | undefined) {
  return src && src.length > 0 ? src : 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=90';
}

export default function HeritageAndStoriesPage() {
  const searchParams = useSearchParams();
  const { concierge } = useApp();
  const initialTab = searchParams.get('tab') === 'stories' ? 'stories' : 'timeline';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [isLoaded, setIsLoaded] = useState(false);

  // Heritage timeline state
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [significanceFilter, setSignificanceFilter] = useState<SignificanceFilter>('all');
  const [events, setEvents] = useState<HeritageEvent[]>([]);
  const [journeys, setJourneys] = useState<CulturalJourney[]>([]);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);

  // Stories state
  const [stories, setStories] = useState<BrandStory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    Promise.all([
      getHeritageEvents().then(res => setEvents(res.data)),
      getCulturalJourneys().then(res => setJourneys(res.data)),
      getBrands().then(res => setAllBrands(res.data)),
      searchStories().then(data => setStories(data)),
    ]).catch(() => {}).finally(() => {
      setIsLoaded(true);
    });
  }, []);

  // Heritage helpers
  const significanceFilters: { value: SignificanceFilter; label: string }[] = [
    { value: 'all', label: 'All Events' },
    { value: 'milestone', label: 'Milestones' },
    { value: 'collection', label: 'Collections' },
    { value: 'innovation', label: 'Innovations' },
    { value: 'cultural', label: 'Cultural' },
  ];

  const filteredEvents = events
    .filter(event => selectedBrand === 'all' || event.brandId === selectedBrand)
    .filter(event => significanceFilter === 'all' || event.significance === significanceFilter)
    .sort((a, b) => b.year - a.year);

  const getSignificanceBadge = (significance: HeritageEventSignificance) => {
    switch (significance) {
      case 'milestone': return { text: 'Milestone', className: 'bg-gold-soft/10 text-gold-soft' };
      case 'collection': return { text: 'Collection', className: 'bg-parchment text-charcoal-deep' };
      case 'innovation': return { text: 'Innovation', className: 'bg-success/10 text-success' };
      case 'cultural': return { text: 'Cultural', className: 'bg-gold-muted/10 text-gold-muted' };
      default: return { text: significance, className: 'bg-parchment text-stone' };
    }
  };

  const availableBrands = [...new Set(events.map(e => e.brandId))];
  const brandOptions = allBrands.filter(b => availableBrands.includes(b.id));

  // Stories helpers
  const availableTypes = useMemo(() => {
    const types = new Set(stories.map(s => s.type));
    return STORY_TYPES.filter(t => types.has(t));
  }, [stories]);

  const filteredStories = useMemo(() => {
    let result = [...stories];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => s.title.toLowerCase().includes(q) || s.excerpt.toLowerCase().includes(q));
    }
    if (activeType) {
      result = result.filter(s => s.type === activeType);
    }
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else if (sortBy === 'brand-az') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    return result;
  }, [stories, searchQuery, activeType, sortBy]);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'timeline', label: 'Heritage Timeline', count: events.length },
    { key: 'stories', label: 'Stories & Narratives', count: stories.length },
  ];

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading heritage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/uhni"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3 mb-4">
              <Crown size={16} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                UHNI Exclusive
              </span>
            </div>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              Heritage & Stories
            </h1>
            <p className="text-sand mt-3">Brand history, milestones, cultural narratives, and craft stories</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-10 border-b border-ivory-cream/10">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-4 text-sm tracking-[0.1em] uppercase transition-colors relative flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'text-gold-soft'
                    : 'text-sand/60 hover:text-sand'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 ${
                    activeTab === tab.key ? 'bg-gold-soft/20 text-gold-soft' : 'bg-ivory-cream/10 text-sand/60'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-soft" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* TAB 1: Heritage Timeline                       */}
      {/* ═══════════════════════════════════════════════ */}
      {activeTab === 'timeline' && (
        <div className="max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="flex-shrink-0">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full md:w-48 px-4 py-3 bg-white border border-sand text-charcoal-deep text-sm focus:outline-none focus:border-charcoal-deep"
              >
                <option value="all">All Brands</option>
                {brandOptions.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Significance</label>
              <div className="flex gap-1 bg-parchment p-1 overflow-x-auto">
                {significanceFilters.map(f => (
                  <button
                    key={f.value}
                    onClick={() => setSignificanceFilter(f.value)}
                    className={`px-4 py-2 text-xs tracking-[0.1em] uppercase whitespace-nowrap transition-colors ${
                      significanceFilter === f.value
                        ? 'bg-white text-charcoal-deep'
                        : 'text-stone hover:text-charcoal-deep'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-sand transform md:-translate-x-1/2" />
            <div className="space-y-12">
              {filteredEvents.map((event, index) => {
                const badge = getSignificanceBadge(event.significance);
                const isLeft = index % 2 === 0;
                return (
                  <div
                    key={event.id}
                    className={`relative flex flex-col md:flex-row gap-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-16 h-16 bg-charcoal-deep flex items-center justify-center z-10">
                      <span className="font-display text-lg text-gold-soft">{event.year}</span>
                    </div>
                    <div className={`ml-24 md:ml-0 md:w-[calc(50%-4rem)] ${isLeft ? 'md:pr-8' : 'md:pl-8'}`}>
                      <div className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                        {event.image && (
                          <div className="relative aspect-[16/10] mb-4 overflow-hidden">
                            <Image src={event.image} alt={event.title} fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <span className={`inline-block px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${badge.className} mb-2`}>
                              {badge.text}
                            </span>
                            <h3 className="font-display text-lg text-charcoal-deep">{event.title}</h3>
                          </div>
                          <span className="text-xs text-taupe whitespace-nowrap">
                            {allBrands.find(b => b.id === event.brandId)?.name}
                          </span>
                        </div>
                        <p className="text-sm text-stone leading-relaxed mb-4">{event.longDescription || event.description}</p>
                        {event.relatedProducts && event.relatedProducts.length > 0 && (
                          <div className="pt-4 border-t border-sand">
                            <span className="text-[10px] tracking-[0.15em] uppercase text-taupe block mb-2">Related in Collection</span>
                            <div className="flex gap-2">
                              {event.relatedProducts.map(productId => (
                                <Link
                                  key={productId}
                                  href={`/product/${productId}`}
                                  className="px-3 py-1.5 bg-parchment text-xs text-charcoal-deep hover:bg-sand transition-colors"
                                >
                                  View Product
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="hidden md:block md:w-[calc(50%-4rem)]" />
                  </div>
                );
              })}
            </div>

            {filteredEvents.length === 0 && (
              <div className="text-center py-16 bg-parchment ml-24 md:ml-0">
                <Calendar size={32} className="text-taupe mx-auto mb-4" />
                <p className="text-stone">No heritage events match your filter criteria.</p>
              </div>
            )}
          </div>

          {/* Cultural Journeys */}
          <div className="mt-20">
            <div className="flex items-center gap-4 mb-8">
              <BookOpen size={24} className="text-gold-soft" />
              <div>
                <span className="text-[10px] tracking-[0.4em] uppercase text-taupe block">Explore</span>
                <h2 className="font-display text-2xl text-charcoal-deep">Cultural Journeys</h2>
              </div>
            </div>
            <p className="text-stone mb-8 max-w-2xl">
              Immersive experiences that connect fashion heritage to art, travel, craft, and cultural movements.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {journeys.slice(0, 4).map((journey) => (
                <Link key={journey.id} href={`/discover/journeys/${journey.id}`} className="group relative aspect-[2/1] overflow-hidden">
                  <Image src={journey.heroImage} alt={journey.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-noir/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-gold-soft/80 block mb-1">{journey.duration} · {journey.difficulty}</span>
                    <h3 className="font-display text-xl text-ivory-cream mb-1">{journey.title}</h3>
                    <p className="text-sm text-sand/80">{journey.subtitle}</p>
                  </div>
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={18} className="text-ivory-cream" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Concierge CTA */}
          {concierge && (
            <div className="mt-12 bg-charcoal-deep p-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-gold-soft/20 flex items-center justify-center flex-shrink-0">
                  <Crown size={24} className="text-gold-soft" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl text-ivory-cream mb-2">Personal Heritage Consultation</h3>
                  <p className="text-sand text-sm mb-6">
                    Connect with {concierge.name} for a personalized heritage journey. Learn how specific archive pieces relate to items in your wardrobe.
                  </p>
                  <Link
                    href="/uhni/concierge"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-soft/10 text-gold-soft text-xs tracking-[0.15em] uppercase hover:bg-gold-soft/20 transition-colors"
                  >
                    <Sparkles size={14} />
                    Schedule Consultation
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* TAB 2: Stories & Narratives                    */}
      {/* ═══════════════════════════════════════════════ */}
      {activeTab === 'stories' && (
        <div className="bg-noir">
          <section className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 py-14 lg:py-20">
            {/* Search, Filter & Sort */}
            <div className="space-y-5">
              <div className="relative max-w-md">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sand/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stories by title or excerpt..."
                  className="w-full pl-11 pr-10 py-3 bg-charcoal-deep border border-gold-soft/20 text-ivory-cream placeholder:text-sand/40 text-sm tracking-wide focus:outline-none focus:border-gold-soft/40 transition-colors"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-sand/40 hover:text-ivory-cream transition-colors">
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveType(null)}
                    className={`px-4 py-1.5 text-[11px] tracking-[0.2em] uppercase border transition-colors ${
                      activeType === null ? 'bg-gold-soft text-noir border-gold-soft' : 'bg-charcoal-deep text-sand border-gold-soft/20 hover:border-gold-soft/40'
                    }`}
                  >
                    All
                  </button>
                  {availableTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveType(activeType === type ? null : type)}
                      className={`px-4 py-1.5 text-[11px] tracking-[0.2em] uppercase border transition-colors ${
                        activeType === type ? 'bg-gold-soft text-noir border-gold-soft' : 'bg-charcoal-deep text-sand border-gold-soft/20 hover:border-gold-soft/40'
                      }`}
                    >
                      {TYPE_LABELS[type] || type}
                    </button>
                  ))}
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-4 py-2 bg-charcoal-deep border border-gold-soft/20 text-sm text-sand tracking-wide focus:outline-none focus:border-gold-soft/40 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="brand-az">Title A-Z</option>
                </select>
              </div>
            </div>

            {(searchQuery || activeType) && (
              <p className="mt-4 text-xs tracking-[0.2em] uppercase text-sand/40">
                {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'} found
              </p>
            )}

            {/* Stories Grid */}
            <div className="mt-6 lg:mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {filteredStories.map((s) => (
                <Link key={s.id} href={`/story/${s.slug}?storyId=${s.id}`} className="group bg-charcoal-deep border border-gold-soft/10 overflow-hidden">
                  <div className="relative aspect-[16/11] bg-noir">
                    <Image src={safeImageSrc(s.heroImage)} alt={s.title} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                  </div>
                  <div className="p-6">
                    <p className="text-[10px] tracking-[0.35em] uppercase text-gold-soft">{s.type}</p>
                    <p className="mt-3 font-display text-xl text-ivory-cream leading-tight group-hover:text-gold-soft transition-colors line-clamp-2">{s.title}</p>
                    <p className="mt-3 text-sm text-sand line-clamp-3">{s.excerpt}</p>
                    <div className="mt-6 inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gold-soft">
                      Read <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredStories.length === 0 && (
              <div className="mt-6 text-center py-20 bg-charcoal-deep border border-gold-soft/10">
                <p className="text-sand text-sm">No stories match your search or filter.</p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveType(null); }}
                  className="mt-4 text-xs tracking-[0.2em] uppercase text-gold-soft hover:text-gold-deep"
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
