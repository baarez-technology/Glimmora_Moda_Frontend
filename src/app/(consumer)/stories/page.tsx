'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Search, X } from 'lucide-react';
import * as brandService from '@/services/brand.service';
import type { BrandStory } from '@/types';

function safeImageSrc(src: string | undefined) {
  return src && src.length > 0 ? src : 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=90';
}

type SortOption = 'newest' | 'brand-az';

const STORY_TYPES = ['heritage', 'craftsmanship', 'collection', 'collaboration', 'artisan'] as const;

const TYPE_LABELS: Record<string, string> = {
  heritage: 'Heritage',
  craftsmanship: 'Craftsmanship',
  collection: 'Collection',
  collaboration: 'Collaboration',
  artisan: 'Artisan',
};

export default function StoriesIndexPage() {
  const [stories, setStories] = useState<BrandStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await brandService.getFeaturedStories();
        setStories(res.data ?? []);
      } catch (error) {
        console.error('Failed to load stories:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Derive the set of types that actually exist in data
  const availableTypes = useMemo(() => {
    const types = new Set(stories.map(s => s.type));
    return STORY_TYPES.filter(t => types.has(t));
  }, [stories]);

  // Filtered and sorted stories
  const filteredStories = useMemo(() => {
    let result = [...stories];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        s =>
          s.title.toLowerCase().includes(q) ||
          s.excerpt.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (activeType) {
      result = result.filter(s => s.type === activeType);
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else if (sortBy === 'brand-az') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [stories, searchQuery, activeType, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-stone tracking-wider">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-cream">
      <section className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 py-14 lg:py-20">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-[10px] tracking-[0.5em] uppercase text-taupe">Stories</p>
            <h1 className="mt-4 font-display text-[clamp(2.2rem,4vw,3.4rem)] leading-[1] tracking-[-0.03em] text-charcoal-deep">
              Narrative & Craft
            </h1>
            <p className="mt-4 text-stone max-w-xl">
              Editorial context for objects: heritage, materials, and why a piece matters beyond trend.
            </p>
          </div>
          <Link href="/discover" className="btn-secondary">
            Open Discover <ArrowRight size={16} />
          </Link>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="mt-10 lg:mt-14 space-y-5">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories by title or excerpt..."
              className="w-full pl-11 pr-10 py-3 bg-white border border-sand/60 text-charcoal-deep placeholder:text-stone/40 text-sm tracking-wide focus:outline-none focus:border-charcoal-deep/40 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone/40 hover:text-charcoal-deep transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter & Sort Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Type Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveType(null)}
                className={`px-4 py-1.5 text-[11px] tracking-[0.2em] uppercase border transition-colors ${
                  activeType === null
                    ? 'bg-charcoal-deep text-ivory-cream border-charcoal-deep'
                    : 'bg-white text-stone border-sand/60 hover:border-charcoal-deep/30'
                }`}
              >
                All
              </button>
              {availableTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(activeType === type ? null : type)}
                  className={`px-4 py-1.5 text-[11px] tracking-[0.2em] uppercase border transition-colors ${
                    activeType === type
                      ? 'bg-charcoal-deep text-ivory-cream border-charcoal-deep'
                      : 'bg-white text-stone border-sand/60 hover:border-charcoal-deep/30'
                  }`}
                >
                  {TYPE_LABELS[type] || type}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 bg-white border border-sand/60 text-sm text-charcoal-deep tracking-wide focus:outline-none focus:border-charcoal-deep/40 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="brand-az">Title A-Z</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        {(searchQuery || activeType) && (
          <p className="mt-4 text-xs tracking-[0.2em] uppercase text-stone/60">
            {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'} found
          </p>
        )}

        {/* Stories Grid */}
        <div className="mt-6 lg:mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {filteredStories.map((s) => (
            <Link key={s.id} href={`/story/${s.slug}`} className="group bg-white border border-sand/60 overflow-hidden">
              <div className="relative aspect-[16/11] bg-parchment">
                <Image
                  src={safeImageSrc(s.heroImage)}
                  alt={s.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-6">
                <p className="text-[10px] tracking-[0.35em] uppercase text-gold-deep">{s.type}</p>
                <p className="mt-3 font-display text-2xl text-charcoal-deep leading-tight group-hover:text-charcoal-warm transition-colors line-clamp-2">
                  {s.title}
                </p>
                <p className="mt-3 text-sm text-stone line-clamp-3">{s.excerpt}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-charcoal-deep">
                  Read <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredStories.length === 0 && !loading && (
          <div className="mt-6 text-center py-20 bg-white border border-sand/60">
            <p className="text-stone/60 text-sm">No stories match your search or filter.</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveType(null); }}
              className="mt-4 text-xs tracking-[0.2em] uppercase text-charcoal-deep hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}



