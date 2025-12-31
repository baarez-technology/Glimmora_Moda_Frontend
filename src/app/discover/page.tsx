'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Sparkles, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { products, brands, brandStories } from '@/data/mock-data';
import BudgetFilter from '@/components/shared/BudgetFilter';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'brands' | 'stories'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(50000);

  // Filter products by budget
  const filteredProducts = useMemo(() => {
    return products.filter(p => p.price >= budgetMin && p.price <= budgetMax);
  }, [budgetMin, budgetMax]);

  const occasions = [
    { id: 'evening', label: 'Evening & Events', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80' },
    { id: 'professional', label: 'Professional', image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80' },
    { id: 'casual', label: 'Everyday Luxury', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
    { id: 'travel', label: 'Travel', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80' }
  ];

  const moods = [
    { id: 'minimal', label: 'Minimal & Structured' },
    { id: 'classic', label: 'Classic & Timeless' },
    { id: 'bold', label: 'Bold & Contemporary' },
    { id: 'artistic', label: 'Artistic & Expressive' }
  ];

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Hero Search */}
      <section className="bg-charcoal-deep text-ivory-cream py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="text-gold-soft" size={24} />
            <span className="text-sm tracking-[0.2em] uppercase text-gold-soft">Fashion Intelligence</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-6">
            What are you looking for?
          </h1>
          <p className="text-taupe mb-10">
            Describe what you need, and our intelligence will guide you to the perfect pieces.
          </p>

          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Try: 'Evening bag for gallery opening' or 'Classic structured jacket'"
              className="w-full px-6 py-4 pr-12 bg-ivory-cream text-charcoal-deep rounded-full text-lg placeholder:text-greige focus:outline-none focus:ring-2 focus:ring-gold-muted"
            />
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-greige" size={20} />
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-6">
            {['Evening dress', 'Iconic bags', 'Heritage pieces', 'Gift ideas'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setSearchQuery(suggestion)}
                className="px-4 py-2 border border-taupe/50 text-taupe rounded-full text-sm hover:border-ivory-cream hover:text-ivory-cream transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-sand">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'products', label: 'Products' },
              { id: 'brands', label: 'Brand Universes' },
              { id: 'stories', label: 'Stories' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-4 text-sm tracking-wide border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-charcoal-deep text-charcoal-deep'
                    : 'border-transparent text-stone hover:text-charcoal-deep'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Explore by Occasion */}
      <section className="py-16 lg:py-24 px-6 lg:px-12">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-gold-muted mb-2">By Occasion</p>
              <h2 className="font-display text-2xl text-charcoal-deep">Where will you wear it?</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {occasions.map((occ) => (
              <Link
                key={occ.id}
                href={`/discover?occasion=${occ.id}`}
                className="group relative aspect-[4/5] rounded-xl overflow-hidden"
              >
                <Image
                  src={occ.image}
                  alt={occ.label}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-display text-xl text-ivory-cream">{occ.label}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Explore by Mood */}
      <section className="py-16 bg-parchment px-6 lg:px-12">
        <div className="max-w-[1800px] mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.3em] uppercase text-gold-muted mb-2">By Mood</p>
            <h2 className="font-display text-2xl text-charcoal-deep">What's your aesthetic today?</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {moods.map((mood) => (
              <Link
                key={mood.id}
                href={`/discover?mood=${mood.id}`}
                className="p-6 lg:p-8 bg-white rounded-xl text-center hover:shadow-md transition-all group"
              >
                <h3 className="font-display text-lg text-charcoal-deep group-hover:text-gold-deep transition-colors">
                  {mood.label}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 lg:py-24 px-6 lg:px-12">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-gold-muted mb-2">AGI Curated</p>
              <h2 className="font-display text-2xl text-charcoal-deep">Exceptional Pieces</h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
                  showFilters ? 'bg-charcoal-deep text-ivory-cream' : 'bg-parchment text-charcoal-deep hover:bg-sand'
                }`}
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>
              <Link href="/collection/all" className="text-sm text-gold-muted hover:text-gold-deep flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Budget Filter */}
          {showFilters && (
            <div className="mb-8 p-6 bg-white rounded-xl shadow-sm">
              <div className="max-w-md">
                <BudgetFilter
                  minPrice={0}
                  maxPrice={50000}
                  currentMin={budgetMin}
                  currentMax={budgetMax}
                  onChange={(min, max) => {
                    setBudgetMin(min);
                    setBudgetMax(max);
                  }}
                />
              </div>
              {(budgetMin > 0 || budgetMax < 50000) && (
                <p className="text-sm text-stone mt-4">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {filteredProducts.slice(0, 8).map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group"
              >
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-parchment mb-3">
                  <Image
                    src={product.images[0]?.url || ''}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p className="text-xs tracking-[0.15em] uppercase text-greige">{product.brandName}</p>
                <h3 className="font-display text-base text-charcoal-deep group-hover:text-gold-deep transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-stone">€{product.price.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Universes */}
      <section className="py-16 bg-charcoal-deep px-6 lg:px-12">
        <div className="max-w-[1800px] mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.3em] uppercase text-gold-soft mb-2">Enter Their World</p>
            <h2 className="font-display text-2xl text-ivory-cream">Brand Universes</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brand/${brand.slug}`}
                className="group relative aspect-square rounded-xl overflow-hidden"
              >
                <Image
                  src={brand.heroImage}
                  alt={brand.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-noir/50 group-hover:bg-noir/30 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="font-display text-xl text-ivory-cream">{brand.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="py-16 lg:py-24 px-6 lg:px-12">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-gold-muted mb-2">Heritage & Craft</p>
              <h2 className="font-display text-2xl text-charcoal-deep">Stories to Explore</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {brandStories.slice(0, 3).map((story) => (
              <Link
                key={story.id}
                href={`/story/${story.slug}`}
                className="group"
              >
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4">
                  <Image
                    src={story.heroImage}
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="tag-intelligence">{story.type}</span>
                  </div>
                </div>
                <h3 className="font-display text-xl text-charcoal-deep group-hover:text-gold-deep transition-colors mb-2">
                  {story.title}
                </h3>
                <p className="text-sm text-stone line-clamp-2">{story.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
