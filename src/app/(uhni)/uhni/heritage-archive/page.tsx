'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Archive, Calendar, Sparkles, ArrowRight, Crown, BookOpen } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { heritageEvents, culturalJourneys, brands } from '@/data';
import type { HeritageEvent, HeritageEventSignificance } from '@/types';

type SignificanceFilter = 'all' | HeritageEventSignificance;

export default function HeritageArchivePage() {
  const router = useRouter();
  const { isUHNI, concierge } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [significanceFilter, setSignificanceFilter] = useState<SignificanceFilter>('all');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isUHNI) {
      router.push('/profile');
    }
  }, [isUHNI, router]);

  if (!isUHNI) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const significanceFilters: { value: SignificanceFilter; label: string }[] = [
    { value: 'all', label: 'All Events' },
    { value: 'milestone', label: 'Milestones' },
    { value: 'collection', label: 'Collections' },
    { value: 'innovation', label: 'Innovations' },
    { value: 'cultural', label: 'Cultural' },
  ];

  const filteredEvents = heritageEvents
    .filter(event => selectedBrand === 'all' || event.brandId === selectedBrand)
    .filter(event => significanceFilter === 'all' || event.significance === significanceFilter)
    .sort((a, b) => b.year - a.year);

  const getSignificanceBadge = (significance: HeritageEventSignificance) => {
    switch (significance) {
      case 'milestone':
        return { text: 'Milestone', className: 'bg-gold-soft/10 text-gold-soft' };
      case 'collection':
        return { text: 'Collection', className: 'bg-parchment text-charcoal-deep' };
      case 'innovation':
        return { text: 'Innovation', className: 'bg-success/10 text-success' };
      case 'cultural':
        return { text: 'Cultural', className: 'bg-gold-muted/10 text-gold-muted' };
      default:
        return { text: significance, className: 'bg-parchment text-stone' };
    }
  };

  const availableBrands = [...new Set(heritageEvents.map(e => e.brandId))];
  const brandOptions = brands.filter(b => availableBrands.includes(b.id));

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gold-soft/20 flex items-center justify-center">
                <Archive size={28} className="text-gold-soft" />
              </div>
              <div>
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                  Fashion Heritage
                </span>
                <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
                  Heritage Archive
                </h1>
              </div>
            </div>
            <p className="text-sand mt-4 max-w-xl">
              Journey through the defining moments of fashion history. Discover how the past connects to contemporary collections and informs your personal style narrative.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          {/* Brand Filter */}
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

          {/* Significance Filter Tabs */}
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
          {/* Timeline Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-sand transform md:-translate-x-1/2" />

          {/* Events */}
          <div className="space-y-12">
            {filteredEvents.map((event, index) => {
              const badge = getSignificanceBadge(event.significance);
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={event.id}
                  className={`relative flex flex-col md:flex-row gap-8 ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Year Badge */}
                  <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-16 h-16 bg-charcoal-deep flex items-center justify-center z-10">
                    <span className="font-display text-lg text-gold-soft">{event.year}</span>
                  </div>

                  {/* Content Card */}
                  <div className={`ml-24 md:ml-0 md:w-[calc(50%-4rem)] ${isLeft ? 'md:pr-8' : 'md:pl-8'}`}>
                    <div className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                      {/* Image */}
                      {event.image && (
                        <div className="relative aspect-[16/10] mb-4 overflow-hidden">
                          <Image
                            src={event.image}
                            alt={event.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <span className={`inline-block px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${badge.className} mb-2`}>
                            {badge.text}
                          </span>
                          <h3 className="font-display text-lg text-charcoal-deep">
                            {event.title}
                          </h3>
                        </div>
                        <span className="text-xs text-taupe whitespace-nowrap">
                          {brands.find(b => b.id === event.brandId)?.name}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-stone leading-relaxed mb-4">
                        {event.longDescription || event.description}
                      </p>

                      {/* Related Products */}
                      {event.relatedProducts && event.relatedProducts.length > 0 && (
                        <div className="pt-4 border-t border-sand">
                          <span className="text-[10px] tracking-[0.15em] uppercase text-taupe block mb-2">
                            Related in Collection
                          </span>
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

                  {/* Spacer for alternating layout */}
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

        {/* Cultural Journeys Section */}
        <div className="mt-20">
          <div className="flex items-center gap-4 mb-8">
            <BookOpen size={24} className="text-gold-soft" />
            <div>
              <span className="text-[10px] tracking-[0.4em] uppercase text-taupe block">Explore</span>
              <h2 className="font-display text-2xl text-charcoal-deep">Cultural Journeys</h2>
            </div>
          </div>

          <p className="text-stone mb-8 max-w-2xl">
            Immersive experiences that connect fashion heritage to art, travel, craft, and cultural movements. Each journey deepens your understanding of the pieces you own.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {culturalJourneys.slice(0, 4).map((journey) => (
              <Link
                key={journey.id}
                href={`/discover/journeys/${journey.id}`}
                className="group relative aspect-[2/1] overflow-hidden"
              >
                <Image
                  src={journey.heroImage}
                  alt={journey.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-noir/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-gold-soft/80 block mb-1">
                    {journey.duration} · {journey.difficulty}
                  </span>
                  <h3 className="font-display text-xl text-ivory-cream mb-1">
                    {journey.title}
                  </h3>
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
                <h3 className="font-display text-xl text-ivory-cream mb-2">
                  Personal Heritage Consultation
                </h3>
                <p className="text-sand text-sm mb-6">
                  Connect with {concierge.name} for a personalized heritage journey. Learn how specific archive pieces relate to items in your wardrobe and discover acquisition opportunities for vintage and heritage pieces.
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
    </div>
  );
}
