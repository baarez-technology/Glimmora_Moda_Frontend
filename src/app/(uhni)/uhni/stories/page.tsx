'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Search, X, Crown } from 'lucide-react';
import { searchStories } from '@/services/recommendation.service';
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

export default function UHNIStoriesPage() {
  const [stories, setStories] = useState<BrandStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await searchStories();
        setStories(data);
      } catch (error) {
        console.error('Failed to load stories:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-noir flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-soft border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-sand tracking-wider">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir">
      <section className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 py-14 lg:py-20">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Crown size={14} className="text-gold-soft" />
              <p className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50">Stories</p>
            </div>
            <h1 className="font-display text-[clamp(2.2rem,4vw,3.4rem)] leading-[1] tracking-[-0.03em] text-ivory-cream">
              Narrative & Craft
            </h1>
            <p className="mt-4 text-sand max-w-xl">
              Editorial context for objects: heritage, materials, and why a piece matters beyond trend.
            </p>
          </div>
          <Link href="/uhni/discover" className="inline-flex items-center gap-2 px-6 py-3 border border-gold-soft/30 text-gold-soft text-sm tracking-[0.15em] uppercase hover:border-gold-soft transition-colors">
            Open Discover <ArrowRight size={16} />
          </Link>
        </div>

        {/* Search, Filter & Sort */}
        <div className="mt-10 lg:mt-14 space-y-5">
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
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sand/40 hover:text-ivory-cream transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveType(null)}
                className={`px-4 py-1.5 text-[11px] tracking-[0.2em] uppercase border transition-colors ${
                  activeType === null
                    ? 'bg-gold-soft text-noir border-gold-soft'
                    : 'bg-charcoal-deep text-sand border-gold-soft/20 hover:border-gold-soft/40'
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
                      ? 'bg-gold-soft text-noir border-gold-soft'
                      : 'bg-charcoal-deep text-sand border-gold-soft/20 hover:border-gold-soft/40'
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

        {/* Results Count */}
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
                <Image
                  src={safeImageSrc(s.heroImage)}
                  alt={s.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-6">
                <p className="text-[10px] tracking-[0.35em] uppercase text-gold-soft">{s.type}</p>
                <p className="mt-3 font-display text-xl text-ivory-cream leading-tight group-hover:text-gold-soft transition-colors line-clamp-2">
                  {s.title}
                </p>
                <p className="mt-3 text-sm text-sand line-clamp-3">{s.excerpt}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gold-soft">
                  Read <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredStories.length === 0 && !loading && (
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
  );
}
