'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Search, ArrowRight, X, SlidersHorizontal, ChevronLeft, ChevronRight, Crown, AlertTriangle, RefreshCw } from 'lucide-react';
import { getRecommendedBrands, getRecommendedProducts, searchStories } from '@/services/recommendation.service';
import type { Product, Brand, BrandStory } from '@/types';

function DiscoverContent() {
  const searchParams = useSearchParams();
  const occasionParam = searchParams.get('occasion');
  const moodParam = searchParams.get('mood');
  const brandIdParam = searchParams.get('brandId');
  const categoryParam = searchParams.get('category');

  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'brands' | 'stories'>('all');
  const [budgetRange, setBudgetRange] = useState<string | null>(null);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(occasionParam ? [occasionParam] : []);
  const [selectedMoods, setSelectedMoods] = useState<string[]>(moodParam ? [moodParam] : []);
  const [showFilters, setShowFilters] = useState(false);
  const [activeProductHover, setActiveProductHover] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandStories, setBrandStories] = useState<BrandStory[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 20;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowFilters(false); };
    if (showFilters) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [showFilters]);

  useEffect(() => {
    async function loadData() {
      try {
        setDataLoading(prev => (isLoaded ? prev : true));
        const productParams: Parameters<typeof getRecommendedProducts>[0] = { page_size: 100 };
        if (brandIdParam) productParams.filter_brand_id = brandIdParam;

        if (budgetRange) {
          const range = budgetRanges[budgetRange];
          if (range) {
            productParams.user_min_budget = range.min;
            productParams.user_max_budget = range.max;
          }
        }

        if (selectedOccasions.length || selectedMoods.length) {
          productParams.user_preferences = {};
          if (selectedOccasions.length) productParams.user_preferences.occasions = selectedOccasions;
          if (selectedMoods.length) {
            // Send aesthetic IDs directly — backend uses the same keys
            productParams.user_preferences.aesthetics = selectedMoods;
          }
        }

        const [productsResult, brandsResult, storiesResult] = await Promise.allSettled([
          getRecommendedProducts(productParams),
          getRecommendedBrands(),
          searchStories(),
        ]);

        if (productsResult.status === 'fulfilled') {
          setProducts(productsResult.value);
        } else {
          console.error('[uhni-discover] Products API failed:', productsResult.reason);
          setError(productsResult.reason?.message || 'Failed to load products');
          setProducts([]);
        }

        setBrands(brandsResult.status === 'fulfilled' ? brandsResult.value : []);
        setBrandStories(storiesResult.status === 'fulfilled' ? storiesResult.value : []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load data';
        console.error('Failed to load discover page data:', err);
        setError(message);
      } finally {
        setDataLoading(false);
        setIsLoaded(true);
      }
    }
    loadData();
  }, [brandIdParam, budgetRange, selectedOccasions, selectedMoods, isLoaded]);

  const budgetRanges: Record<string, { min: number; max: number }> = {
    'under-500': { min: 0, max: 500 },
    '500-1500': { min: 500, max: 1500 },
    '1500-5000': { min: 1500, max: 5000 },
    '5000-plus': { min: 5000, max: 50000 },
  };

  const filteredProducts = useMemo(() => {
    const filtered = products.filter(p => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesBrand = p.brandName.toLowerCase().includes(query);
        const matchesTags = p.tags?.some(tag => tag.toLowerCase().includes(query));
        if (!matchesName && !matchesBrand && !matchesTags) return false;
      }
      if (categoryParam) {
        const cat = p.category?.toLowerCase() || '';
        if (!cat.includes(categoryParam.toLowerCase())) return false;
      }
      return true;
    });
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'newest': return -1;
        case 'brand-az': return a.brandName.localeCompare(b.brandName);
        default: return 0;
      }
    });
  }, [searchQuery, categoryParam, products, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [budgetRange, searchQuery, selectedOccasions, selectedMoods, sortBy]);

  const filteredBrands = useMemo(() => {
    if (!searchQuery) return brands;
    const query = searchQuery.toLowerCase();
    return brands.filter(b => b.name.toLowerCase().includes(query));
  }, [searchQuery, brands]);

  const filteredStories = useMemo(() => {
    if (!searchQuery) return brandStories;
    const query = searchQuery.toLowerCase();
    return brandStories.filter(s => s.title.toLowerCase().includes(query));
  }, [searchQuery, brandStories]);

  const clearFilters = () => {
    setSelectedOccasions([]);
    setSelectedMoods([]);
    setSearchQuery('');
    setBudgetRange(null);
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedOccasions.length > 0 || selectedMoods.length > 0 || !!searchQuery || !!budgetRange;

  const occasionOptions = [
    { id: 'professional', label: 'Professional' },
    { id: 'social', label: 'Social Events' },
    { id: 'casual', label: 'Casual Daily' },
    { id: 'formal', label: 'Formal' },
    { id: 'travel', label: 'Travel' },
    { id: 'art', label: 'Art & Culture' },
  ];

  const moodOptions = useMemo(() => {
    const labels: Record<string, string> = {
      minimal: 'Minimal & Structured',
      classic: 'Classic & Timeless',
      artistic: 'Artistic & Expressive',
      contemporary: 'Bold & Contemporary',
    };
    return Object.entries(labels).map(([id, label]) => ({ id, label }));
  }, []);

  const budgets = [
    { id: 'under-500', label: 'Under €500' },
    { id: '500-1500', label: '€500 - €1,500' },
    { id: '1500-5000', label: '€1,500 - €5,000' },
    { id: '5000-plus', label: '€5,000+' }
  ];

  if (!isLoaded && dataLoading) {
    return (
      <div className="min-h-screen bg-noir flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-soft border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-sand tracking-wider">Loading exclusive pieces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-noir min-h-screen">
      {/* Hero */}
      <section className="border-b border-gold-soft/10 py-16 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
          <div className="flex items-center gap-2 mb-4">
            <Crown size={14} className="text-gold-soft" />
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50">Private Access</span>
          </div>
          <h1 className="font-display text-[clamp(2.5rem,6vw,4rem)] text-ivory-cream leading-[1] tracking-[-0.02em] mb-6">
            Discover
          </h1>
          {/* Search */}
          <div className="max-w-lg">
            <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pieces, maisons, aesthetics..."
                className="w-full px-5 py-4 pr-12 bg-charcoal-deep border border-gold-soft/20 text-ivory-cream text-sm placeholder:text-sand/50 focus:outline-none focus:border-gold-soft/40 transition-all duration-300"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-sand/50 group-focus-within:text-gold-soft transition-colors" size={18} />
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-[52px] z-40 bg-noir/95 backdrop-blur-md border-b border-gold-soft/10">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
          <div className="flex items-center justify-between py-5">
            <nav className="flex gap-10">
              {[
                { id: 'all', label: 'All' },
                { id: 'products', label: 'Pieces' },
                { id: 'brands', label: 'Maisons' },
                { id: 'stories', label: 'Stories' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`relative text-sm tracking-[0.15em] uppercase transition-all duration-300 ${
                    activeTab === tab.id ? 'text-gold-soft' : 'text-sand hover:text-ivory-cream'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute -bottom-5 left-0 right-0 h-px bg-gold-soft" />
                  )}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-charcoal-deep border border-gold-soft/20 text-sm text-sand focus:outline-none focus:border-gold-soft transition-colors"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="brand-az">Brand A-Z</option>
              </select>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="group flex items-center gap-3 text-sm tracking-[0.15em] uppercase text-sand hover:text-gold-soft transition-colors"
              >
                <span>Refine</span>
                <SlidersHorizontal size={16} />
                {hasActiveFilters && <span className="w-2 h-2 bg-gold-soft rounded-full" />}
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-3 pb-4">
              {searchQuery && (
                <span className="inline-flex items-center gap-3 px-4 py-2 border border-gold-soft/30 text-gold-soft text-xs tracking-[0.1em]">
                  {searchQuery}
                  <button onClick={() => setSearchQuery('')}><X size={12} /></button>
                </span>
              )}
              {selectedOccasions.map((occ) => (
                <span key={occ} className="inline-flex items-center gap-3 px-4 py-2 border border-gold-soft/30 text-gold-soft text-xs tracking-[0.1em]">
                  {occasionOptions.find(o => o.id === occ)?.label ?? occ}
                  <button onClick={() => setSelectedOccasions(prev => prev.filter(id => id !== occ))}><X size={12} /></button>
                </span>
              ))}
              {selectedMoods.map((mood) => (
                <span key={mood} className="inline-flex items-center gap-3 px-4 py-2 border border-gold-soft/30 text-gold-soft text-xs tracking-[0.1em]">
                  {moodOptions.find(m => m.id === mood)?.label ?? mood}
                  <button onClick={() => setSelectedMoods(prev => prev.filter(id => id !== mood))}><X size={12} /></button>
                </span>
              ))}
              {budgetRange && (
                <span className="inline-flex items-center gap-3 px-4 py-2 border border-gold-soft/30 text-gold-soft text-xs tracking-[0.1em]">
                  {budgets.find(b => b.id === budgetRange)?.label}
                  <button onClick={() => setBudgetRange(null)}><X size={12} /></button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs tracking-wider uppercase text-sand hover:text-ivory-cream ml-2">
                Clear All
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowFilters(false)}>
          <div className="absolute inset-0 bg-noir/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-charcoal-deep border-l border-gold-soft/10 h-full overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display text-xl text-ivory-cream">Refine</h3>
              <button onClick={() => setShowFilters(false)} className="text-sand hover:text-ivory-cream"><X size={20} /></button>
            </div>

            {/* Occasions */}
            <div className="mb-8">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold-soft/50 mb-4">Occasion</p>
              <div className="space-y-2">
                {occasionOptions.map(occ => (
                  <button
                    key={occ.id}
                    onClick={() => setSelectedOccasions(prev => prev.includes(occ.id) ? prev.filter(id => id !== occ.id) : [...prev, occ.id])}
                    className={`w-full text-left px-4 py-3 text-sm border transition-colors ${
                      selectedOccasions.includes(occ.id) ? 'border-gold-soft bg-gold-soft/5 text-ivory-cream' : 'border-gold-soft/10 text-sand hover:border-gold-soft/30'
                    }`}
                  >
                    {occ.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aesthetics */}
            <div className="mb-8">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold-soft/50 mb-4">Aesthetic</p>
              <div className="space-y-2">
                {moodOptions.map(mood => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMoods(prev => prev.includes(mood.id) ? prev.filter(id => id !== mood.id) : [...prev, mood.id])}
                    className={`w-full text-left px-4 py-3 text-sm border transition-colors ${
                      selectedMoods.includes(mood.id) ? 'border-gold-soft bg-gold-soft/5 text-ivory-cream' : 'border-gold-soft/10 text-sand hover:border-gold-soft/30'
                    }`}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="mb-8">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold-soft/50 mb-4">Budget</p>
              <div className="space-y-2">
                {budgets.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setBudgetRange(budgetRange === b.id ? null : b.id)}
                    className={`w-full text-left px-4 py-3 text-sm border transition-colors ${
                      budgetRange === b.id ? 'border-gold-soft bg-gold-soft/5 text-ivory-cream' : 'border-gold-soft/10 text-sand hover:border-gold-soft/30'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowFilters(false)}
              className="w-full py-4 bg-gold-soft text-noir text-sm tracking-[0.15em] uppercase hover:bg-gold-deep transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 pt-8">
          <div className="flex items-center gap-4 p-5 border border-red-500/30 bg-red-500/5">
            <AlertTriangle size={18} className="text-red-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-ivory-cream">Unable to load content</p>
              <p className="text-xs text-sand/60 mt-1">{error}</p>
            </div>
            <button
              onClick={() => { setError(null); setIsLoaded(false); setDataLoading(true); }}
              className="flex items-center gap-2 px-4 py-2 border border-gold-soft/30 text-gold-soft text-xs tracking-[0.15em] uppercase hover:border-gold-soft transition-colors shrink-0"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
          {/* Products */}
          {(activeTab === 'all' || activeTab === 'products') && (
            <div className="mb-16">
              {activeTab === 'all' && (
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50">
                    {filteredProducts.length} Pieces
                  </h2>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-10">
                {paginatedProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}?productId=${product.id}`}
                    className="group"
                    onMouseEnter={() => setActiveProductHover(index)}
                    onMouseLeave={() => setActiveProductHover(null)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-charcoal-deep">
                      <Image
                        src={product.images[0]?.url || 'https://placehold.co/800x1000/F5F0EB/8B8680?text=No+Image'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-noir/0 group-hover:bg-noir/20 transition-all duration-500 flex items-center justify-center">
                        <div className={`w-12 h-12 rounded-full bg-gold-soft/20 backdrop-blur-sm flex items-center justify-center transform transition-all duration-500 ${activeProductHover === index ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                          <ArrowRight size={16} className="text-ivory-cream" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="text-[9px] tracking-[0.2em] uppercase text-ivory-cream bg-noir/80 px-3 py-1.5">
                          €{product.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-sand/50 mb-1">{product.brandName}</p>
                    <h3 className="font-display text-base text-ivory-cream leading-tight group-hover:text-gold-soft transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-3 border border-gold-soft/20 text-sand hover:border-gold-soft disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-sand">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-3 border border-gold-soft/20 text-sand hover:border-gold-soft disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Brands */}
          {(activeTab === 'all' || activeTab === 'brands') && filteredBrands.length > 0 && (
            <div className="mb-16">
              <h2 className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50 mb-8">
                {filteredBrands.length} Maisons
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brand/${brand.slug}`}
                    className="group"
                  >
                    <div className="relative aspect-square overflow-hidden mb-4 bg-charcoal-deep">
                      {brand.logoUrl && (
                        <Image src={brand.logoUrl} alt={brand.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-noir/60 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <p className="font-display text-lg text-ivory-cream">{brand.name}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Stories */}
          {(activeTab === 'all' || activeTab === 'stories') && filteredStories.length > 0 && (
            <div className="mb-16">
              <h2 className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50 mb-8">
                {filteredStories.length} Stories
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStories.map((story) => (
                  <Link
                    key={story.id}
                    href={`/story/${story.slug}?storyId=${story.id}`}
                    className="group bg-charcoal-deep border border-gold-soft/10 overflow-hidden"
                  >
                    <div className="relative aspect-[16/11] bg-noir">
                      {story.heroImage && (
                        <Image src={story.heroImage} alt={story.title} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-700" />
                      )}
                    </div>
                    <div className="p-6">
                      <p className="text-[10px] tracking-[0.35em] uppercase text-gold-soft">{story.type}</p>
                      <p className="mt-3 font-display text-xl text-ivory-cream leading-tight group-hover:text-gold-soft transition-colors line-clamp-2">
                        {story.title}
                      </p>
                      <p className="mt-3 text-sm text-sand line-clamp-3">{story.excerpt}</p>
                      <div className="mt-6 inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-gold-soft">
                        Read <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredProducts.length === 0 && filteredBrands.length === 0 && filteredStories.length === 0 && (
            <div className="text-center py-20">
              <p className="text-sand mb-4">No results found for your current filters.</p>
              <button onClick={clearFilters} className="text-xs tracking-wider uppercase text-gold-soft hover:text-gold-deep">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function UHNIDiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-noir flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold-soft border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DiscoverContent />
    </Suspense>
  );
}
