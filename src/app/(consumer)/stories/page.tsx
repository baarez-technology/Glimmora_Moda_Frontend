'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import * as brandService from '@/services/brand.service';
import type { BrandStory } from '@/types';

function safeImageSrc(src: string | undefined) {
  return src && src.length > 0 ? src : 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=90';
}

export default function StoriesIndexPage() {
  const [stories, setStories] = useState<BrandStory[]>([]);
  const [loading, setLoading] = useState(true);

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

        <div className="mt-10 lg:mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {stories.map((s) => (
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
      </section>
    </div>
  );
}



