'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, Filter, Sparkles, ArrowRight } from 'lucide-react';
import { products, brands, brandStories, collections } from '@/data/mock-data';

type SearchTab = 'all' | 'products' | 'brands' | 'stories' | 'collections';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

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
    { id: 'brands', label: 'Brands', count: results.brands.length },
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
      {/* Search Header */}
      <div className="bg-white border-b border-sand sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-6">
          <div className="relative max-w-2xl mx-auto">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-greige" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands, stories..."
              className="w-full pl-12 pr-12 py-4 bg-parchment border border-sand rounded-full font-body text-charcoal-deep focus:outline-none focus:border-gold-muted transition-colors"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-greige hover:text-charcoal-deep"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex items-center gap-1 overflow-x-auto pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-charcoal-deep text-ivory-cream'
                    : 'text-stone hover:bg-parchment'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8">
        {query ? (
          <>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-gold-muted" />
                <p className="text-stone">
                  {totalResults} result{totalResults !== 1 ? 's' : ''} for "<span className="text-charcoal-deep font-medium">{query}</span>"
                </p>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-sand rounded-full text-sm text-charcoal-warm hover:border-charcoal-deep transition-colors lg:hidden"
              >
                <Filter size={14} />
                Filters
              </button>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <aside className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="bg-white rounded-xl p-6 shadow-sm sticky top-40">
                  <h3 className="font-display text-lg text-charcoal-deep mb-4">Filters</h3>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-charcoal-deep mb-3">Price Range</h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-full px-3 py-2 border border-sand rounded text-sm"
                        placeholder="Min"
                      />
                      <span className="text-greige">-</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full px-3 py-2 border border-sand rounded text-sm"
                        placeholder="Max"
                      />
                    </div>
                  </div>

                  {/* Brand Filter */}
                  <div>
                    <h4 className="text-sm font-medium text-charcoal-deep mb-3">Brands</h4>
                    <div className="space-y-2">
                      {brands.map((brand) => (
                        <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand.id)}
                            onChange={() => toggleBrandFilter(brand.id)}
                            className="w-4 h-4 rounded border-sand text-gold-muted focus:ring-gold-muted"
                          />
                          <span className="text-sm text-stone">{brand.name}</span>
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
                      className="mt-6 text-sm text-gold-muted hover:text-gold-deep"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </aside>

              {/* Results */}
              <div className="lg:col-span-3">
                {totalResults === 0 ? (
                  <div className="text-center py-20 bg-white rounded-xl">
                    <Search size={48} className="mx-auto text-greige mb-4" />
                    <h3 className="font-display text-xl text-charcoal-deep mb-2">
                      No results found
                    </h3>
                    <p className="text-stone mb-6">
                      Try adjusting your search or filters to find what you're looking for.
                    </p>
                    <Link href="/discover" className="btn-primary inline-flex">
                      Explore All
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {/* Products */}
                    {(activeTab === 'all' || activeTab === 'products') && results.products.length > 0 && (
                      <section>
                        {activeTab === 'all' && (
                          <div className="flex items-center justify-between mb-6">
                            <h2 className="font-display text-xl text-charcoal-deep">Products</h2>
                            {results.products.length > 4 && (
                              <button
                                onClick={() => setActiveTab('products')}
                                className="text-sm text-gold-muted hover:text-gold-deep flex items-center gap-1"
                              >
                                View all {results.products.length}
                                <ArrowRight size={14} />
                              </button>
                            )}
                          </div>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                          {(activeTab === 'all' ? results.products.slice(0, 6) : results.products).map((product) => (
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
                              <p className="text-xs tracking-[0.15em] uppercase text-greige mb-1">
                                {product.brandName}
                              </p>
                              <h3 className="font-display text-base text-charcoal-deep group-hover:text-gold-deep transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-sm text-stone mt-1">
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
                          <h2 className="font-display text-xl text-charcoal-deep mb-6">Brand Universes</h2>
                        )}
                        <div className="grid md:grid-cols-2 gap-4">
                          {results.brands.map((brand) => (
                            <Link
                              key={brand.id}
                              href={`/brand/${brand.slug}`}
                              className="group relative aspect-[2/1] rounded-xl overflow-hidden"
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
                          <h2 className="font-display text-xl text-charcoal-deep mb-6">Stories</h2>
                        )}
                        <div className="grid md:grid-cols-2 gap-6">
                          {results.stories.map((story) => (
                            <Link
                              key={story.id}
                              href={`/story/${story.slug}`}
                              className="group bg-white rounded-xl overflow-hidden shadow-sm"
                            >
                              <div className="relative aspect-[16/9]">
                                <Image
                                  src={story.heroImage}
                                  alt={story.title}
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                              </div>
                              <div className="p-5">
                                <p className="text-xs tracking-[0.15em] uppercase text-gold-muted mb-2">
                                  {story.type}
                                </p>
                                <h3 className="font-display text-lg text-charcoal-deep group-hover:text-gold-deep transition-colors">
                                  {story.title}
                                </h3>
                                <p className="text-sm text-stone mt-2 line-clamp-2">{story.excerpt}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Collections */}
                    {(activeTab === 'all' || activeTab === 'collections') && results.collections.length > 0 && (
                      <section>
                        {activeTab === 'all' && (
                          <h2 className="font-display text-xl text-charcoal-deep mb-6">Collections</h2>
                        )}
                        <div className="grid md:grid-cols-2 gap-6">
                          {results.collections.map((collection) => (
                            <Link
                              key={collection.id}
                              href={`/collection/${collection.slug}`}
                              className="group relative aspect-[2/1] rounded-xl overflow-hidden"
                            >
                              <Image
                                src={collection.heroImage}
                                alt={collection.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-noir/70 to-transparent" />
                              <div className="absolute bottom-0 left-0 right-0 p-6">
                                <p className="text-xs tracking-[0.15em] uppercase text-gold-soft mb-1">
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
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-parchment rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles size={32} className="text-gold-muted" />
            </div>
            <h2 className="font-display text-2xl text-charcoal-deep mb-4">
              What are you looking for?
            </h2>
            <p className="text-stone mb-8 max-w-md mx-auto">
              Search for products, brands, stories, or collections. Our Fashion Intelligence will help you find exactly what you need.
            </p>

            {/* Popular Searches */}
            <div className="max-w-lg mx-auto">
              <p className="text-sm text-greige mb-4">Popular searches</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Lady Dior', 'Gucci Jackie', 'Hermès', 'Evening bags', 'Silk', 'Italian leather'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-4 py-2 bg-white border border-sand rounded-full text-sm text-charcoal-warm hover:border-gold-muted transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
