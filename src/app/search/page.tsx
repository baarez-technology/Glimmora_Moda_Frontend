'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { products, brands, brandStories, collections } from '@/data/mock-data';

type SearchTab = 'all' | 'products' | 'brands' | 'stories' | 'collections';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeHover, setActiveHover] = useState<number | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Update query when URL changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  // Search results
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { products: [], brands: [], stories: [], collections: [] };

    const matchedProducts = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brandName.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)
    ).filter(p =>
      p.price >= priceRange[0] &&
      p.price <= priceRange[1] &&
      (selectedBrands.length === 0 || selectedBrands.includes(p.brandId))
    );

    const matchedBrands = brands.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.tagline.toLowerCase().includes(q)
    );

    const matchedStories = brandStories.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.excerpt.toLowerCase().includes(q)
    );

    const matchedCollections = collections.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );

    return {
      products: matchedProducts,
      brands: matchedBrands,
      stories: matchedStories,
      collections: matchedCollections
    };
  }, [query, priceRange, selectedBrands]);

  const totalResults = results.products.length + results.brands.length + results.stories.length + results.collections.length;

  const tabs: { id: SearchTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: totalResults },
    { id: 'products', label: 'Products', count: results.products.length },
    { id: 'brands', label: 'Maisons', count: results.brands.length },
    { id: 'stories', label: 'Stories', count: results.stories.length },
    { id: 'collections', label: 'Collections', count: results.collections.length },
  ];

  const toggleBrandFilter = (brandId: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(b => b !== brandId)
        : [...prev, brandId]
    );
  };

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* ============================================
          SEARCH HEADER
          ============================================ */}
      <section className="bg-charcoal-deep">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24 py-12 lg:py-16">
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50 block mb-6 text-center">
              Discover
            </span>

            {/* Search Input */}
            <div className="relative max-w-2xl mx-auto">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-taupe" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, maisons, stories..."
                className="w-full pl-14 pr-14 py-5 bg-charcoal-warm border border-ivory-cream/20 text-ivory-cream placeholder:text-taupe focus:outline-none focus:border-ivory-cream/40 transition-colors"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-taupe hover:text-ivory-cream transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-ivory-cream/10">
          <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
            <div className="flex items-center gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm tracking-[0.1em] uppercase whitespace-nowrap transition-all relative ${
                    activeTab === tab.id
                      ? 'text-ivory-cream'
                      : 'text-taupe hover:text-ivory-cream'
                  }`}
                >
                  {tab.label} ({tab.count})
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-soft" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          MAIN CONTENT
          ============================================ */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
          {query ? (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-12">
                <p className="text-stone">
                  <span className="font-display text-2xl text-charcoal-deep">{totalResults}</span>
                  <span className="ml-2">result{totalResults !== 1 ? 's' : ''} for</span>
                  <span className="text-charcoal-deep font-medium ml-1">"{query}"</span>
                </p>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-5 py-3 border border-sand text-sm tracking-[0.1em] uppercase text-charcoal-deep hover:border-charcoal-deep transition-colors lg:hidden"
                >
                  <SlidersHorizontal size={14} />
                  Filters
                </button>
              </div>

              <div className="grid lg:grid-cols-4 gap-12 lg:gap-16">
                {/* Filters Sidebar */}
                <aside className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                  <div className="bg-parchment p-8 sticky top-32">
                    <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-6">
                      Refine Results
                    </span>

                    {/* Price Range */}
                    <div className="mb-8 pb-8 border-b border-sand/50">
                      <h4 className="text-sm tracking-[0.15em] uppercase text-charcoal-deep mb-4">Price Range</h4>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                          className="w-full px-4 py-3 bg-ivory-cream border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                          placeholder="Min"
                        />
                        <span className="text-taupe">—</span>
                        <input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                          className="w-full px-4 py-3 bg-ivory-cream border border-sand text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                          placeholder="Max"
                        />
                      </div>
                    </div>

                    {/* Brand Filter */}
                    <div>
                      <h4 className="text-sm tracking-[0.15em] uppercase text-charcoal-deep mb-4">Maisons</h4>
                      <div className="space-y-3">
                        {brands.map((brand) => (
                          <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 border flex items-center justify-center transition-all ${
                              selectedBrands.includes(brand.id)
                                ? 'border-charcoal-deep bg-charcoal-deep'
                                : 'border-sand group-hover:border-charcoal-deep'
                            }`}>
                              {selectedBrands.includes(brand.id) && (
                                <svg className="w-3 h-3 text-ivory-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={selectedBrands.includes(brand.id)}
                              onChange={() => toggleBrandFilter(brand.id)}
                              className="sr-only"
                            />
                            <span className="text-sm text-stone group-hover:text-charcoal-deep transition-colors">{brand.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {(selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 50000) && (
                      <button
                        onClick={() => {
                          setSelectedBrands([]);
                          setPriceRange([0, 50000]);
                        }}
                        className="mt-8 text-sm tracking-[0.1em] uppercase text-stone hover:text-charcoal-deep transition-colors"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </aside>

                {/* Results */}
                <div className="lg:col-span-3">
                  {totalResults === 0 ? (
                    <div className="text-center py-20 bg-parchment">
                      <Search size={48} className="mx-auto text-taupe mb-6" />
                      <h3 className="font-display text-[clamp(1.5rem,3vw,2rem)] text-charcoal-deep mb-4">
                        No Results Found
                      </h3>
                      <p className="text-stone mb-10 max-w-md mx-auto">
                        Try adjusting your search or filters to find what you're looking for.
                      </p>
                      <Link
                        href="/discover"
                        className="group inline-flex items-center gap-4"
                      >
                        <span className="text-sm tracking-[0.15em] uppercase text-charcoal-deep">
                          Explore All
                        </span>
                        <span className="w-12 h-12 border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-300">
                          <ArrowRight size={16} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors" />
                        </span>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-16">
                      {/* Products */}
                      {(activeTab === 'all' || activeTab === 'products') && results.products.length > 0 && (
                        <section>
                          {activeTab === 'all' && (
                            <div className="flex items-end justify-between mb-8">
                              <div>
                                <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-2">
                                  {results.products.length} found
                                </span>
                                <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] text-charcoal-deep leading-[1.1]">
                                  Products
                                </h2>
                              </div>
                              {results.products.length > 6 && (
                                <button
                                  onClick={() => setActiveTab('products')}
                                  className="group inline-flex items-center gap-2 text-sm tracking-[0.1em] uppercase text-stone hover:text-charcoal-deep transition-colors"
                                >
                                  <span>View all</span>
                                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                              )}
                            </div>
                          )}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-8 gap-y-10">
                            {(activeTab === 'all' ? results.products.slice(0, 6) : results.products).map((product, index) => (
                              <Link
                                key={product.id}
                                href={`/product/${product.slug}`}
                                className="group"
                                onMouseEnter={() => setActiveHover(index)}
                                onMouseLeave={() => setActiveHover(null)}
                              >
                                <div className="relative aspect-[3/4] overflow-hidden bg-parchment mb-5">
                                  <Image
                                    src={product.images[0]?.url || ''}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                  />
                                  {/* Hover Action */}
                                  <div className="absolute inset-0 flex items-center justify-center bg-noir/0 group-hover:bg-noir/20 transition-all duration-500">
                                    <div className={`w-14 h-14 bg-ivory-cream flex items-center justify-center transform transition-all duration-500 ${activeHover === index ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                                      <ArrowRight size={18} className="text-charcoal-deep" />
                                    </div>
                                  </div>
                                </div>
                                <p className="text-[10px] tracking-[0.25em] uppercase text-taupe mb-1">
                                  {product.brandName}
                                </p>
                                <h3 className="font-display text-lg text-charcoal-deep leading-tight group-hover:text-charcoal-warm transition-colors">
                                  {product.name}
                                </h3>
                                <p className="text-sm text-stone mt-2">
                                  €{product.price.toLocaleString()}
                                </p>
                              </Link>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Brands */}
                      {(activeTab === 'all' || activeTab === 'brands') && results.brands.length > 0 && (
                        <section>
                          {activeTab === 'all' && (
                            <div className="mb-8">
                              <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-2">
                                {results.brands.length} found
                              </span>
                              <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] text-charcoal-deep leading-[1.1]">
                                Maisons
                              </h2>
                            </div>
                          )}
                          <div className="grid md:grid-cols-2 gap-6">
                            {results.brands.map((brand) => (
                              <Link
                                key={brand.id}
                                href={`/brand/${brand.slug}`}
                                className="group relative aspect-[2/1] overflow-hidden"
                              >
                                <Image
                                  src={brand.heroImage}
                                  alt={brand.name}
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-noir/50 group-hover:bg-noir/40 transition-colors" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                                  <h3 className="font-display text-2xl text-ivory-cream mb-2">{brand.name}</h3>
                                  <p className="text-sm text-sand">{brand.tagline}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Stories */}
                      {(activeTab === 'all' || activeTab === 'stories') && results.stories.length > 0 && (
                        <section>
                          {activeTab === 'all' && (
                            <div className="mb-8">
                              <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-2">
                                {results.stories.length} found
                              </span>
                              <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] text-charcoal-deep leading-[1.1]">
                                Stories
                              </h2>
                            </div>
                          )}
                          <div className="grid md:grid-cols-2 gap-6">
                            {results.stories.map((story) => (
                              <Link
                                key={story.id}
                                href={`/story/${story.slug}`}
                                className="group"
                              >
                                <div className="relative aspect-[16/9] overflow-hidden mb-5">
                                  <Image
                                    src={story.heroImage}
                                    alt={story.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                  />
                                </div>
                                <p className="text-[10px] tracking-[0.25em] uppercase text-gold-muted mb-2">
                                  {story.type}
                                </p>
                                <h3 className="font-display text-xl text-charcoal-deep group-hover:text-charcoal-warm transition-colors mb-2">
                                  {story.title}
                                </h3>
                                <p className="text-sm text-stone line-clamp-2">{story.excerpt}</p>
                              </Link>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Collections */}
                      {(activeTab === 'all' || activeTab === 'collections') && results.collections.length > 0 && (
                        <section>
                          {activeTab === 'all' && (
                            <div className="mb-8">
                              <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-2">
                                {results.collections.length} found
                              </span>
                              <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] text-charcoal-deep leading-[1.1]">
                                Collections
                              </h2>
                            </div>
                          )}
                          <div className="grid md:grid-cols-2 gap-6">
                            {results.collections.map((collection) => (
                              <Link
                                key={collection.id}
                                href={`/collection/${collection.slug}`}
                                className="group relative aspect-[2/1] overflow-hidden"
                              >
                                <Image
                                  src={collection.heroImage}
                                  alt={collection.name}
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-noir/70 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                  <p className="text-[10px] tracking-[0.25em] uppercase text-gold-soft mb-2">
                                    {collection.season} {collection.year}
                                  </p>
                                  <h3 className="font-display text-xl text-ivory-cream">
                                    {collection.name}
                                  </h3>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Empty State - No Query */
            <div className={`text-center py-20 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="w-20 h-20 bg-charcoal-deep flex items-center justify-center mx-auto mb-10">
                <Search size={32} className="text-gold-soft" />
              </div>

              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-6">
                Begin Your Search
              </span>

              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] text-charcoal-deep leading-[1] tracking-[-0.02em] mb-6">
                What are you looking for?
              </h2>

              <p className="text-stone mb-12 max-w-md mx-auto">
                Search for products, maisons, stories, or collections to discover exceptional pieces.
              </p>

              {/* Popular Searches */}
              <div className="max-w-xl mx-auto">
                <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-6">Popular Searches</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {['Lady Dior', 'Gucci Jackie', 'Hermès', 'Evening bags', 'Silk', 'Italian leather'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-5 py-3 border border-sand text-sm text-charcoal-deep hover:border-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream transition-all duration-300"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SearchFallback() {
  return (
    <div className="min-h-screen bg-ivory-cream">
      <div className="bg-charcoal-deep">
        <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24 py-12 lg:py-16">
          <div className="max-w-2xl mx-auto">
            <div className="w-full h-16 bg-charcoal-warm animate-pulse" />
          </div>
        </div>
      </div>
      <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24 py-16">
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-parchment flex items-center justify-center mx-auto mb-6 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  );
}
