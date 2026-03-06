'use client';

import { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ArrowRight, X, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { getRecommendedBrands, getRecommendedProducts, searchStories } from '@/services/recommendation.service';
import { useApp } from '@/context/AppContext';
import type { Product, Brand, BrandStory } from '@/types';

function DiscoverContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isUHNI } = useApp();
  const occasionParam = searchParams.get('occasion');
  const moodParam = searchParams.get('mood');
  const brandIdParam = searchParams.get('brandId');
  const resultsRef = useRef<HTMLDivElement>(null);

  // UHNI users have their own discover page
  useEffect(() => {
    if (isUHNI) router.replace('/uhni/discover');
  }, [isUHNI, router]);

  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'brands' | 'stories'>('all');
  const [budgetRange, setBudgetRange] = useState<string | null>(null);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(occasionParam ? [occasionParam] : []);
  const [selectedMoods, setSelectedMoods] = useState<string[]>(moodParam ? [moodParam] : []);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeProductHover, setActiveProductHover] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandStories, setBrandStories] = useState<BrandStory[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 20;

  // ESC key handler for filter drawer
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMobileFilters(false);
      }
    };
    if (showMobileFilters) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [showMobileFilters]);

  useEffect(() => {
    async function loadData() {
      try {
        // Only show the full-page loader on the very first load
        setDataLoading(prev => (isLoaded ? prev : true));

        const productParams: Parameters<typeof getRecommendedProducts>[0] = {
          page_size: 100,
        };

        if (brandIdParam) {
          productParams.filter_brand_id = brandIdParam;
        }

        // Map UI budget buckets to API min/max budget fields
        if (budgetRange) {
          const range = budgetRanges[budgetRange];
          if (range) {
            productParams.user_min_budget = range.min;
            productParams.user_max_budget = range.max;
          }
        }

        // Map multi-select occasion/aesthetic filters to API user_preferences.
        if (selectedOccasions.length || selectedMoods.length) {
          productParams.user_preferences = {};

          if (selectedOccasions.length) {
            productParams.user_preferences.occasions = selectedOccasions;
          }

          if (selectedMoods.length) {
            // Send aesthetic IDs directly — backend uses the same keys
            productParams.user_preferences.aesthetics = selectedMoods;
          }
        }

        setLoadError(null);

        // Fetch products, brands, and stories in parallel.
        // Use allSettled so a products error doesn't block brands/stories.
        const [productsResult, brandsResult, storiesResult] = await Promise.allSettled([
          getRecommendedProducts(productParams),
          getRecommendedBrands(),
          searchStories(),
        ]);

        if (productsResult.status === 'fulfilled') {
          setProducts(productsResult.value);
          if (productsResult.value.length === 0) {
            console.warn('[discover] API returned 0 products — check browser console for [products] logs');
          }
        } else {
          console.error('[discover] Products API failed:', productsResult.reason);
          setLoadError(productsResult.reason?.message || 'Failed to load products');
          setProducts([]);
        }

        setBrands(brandsResult.status === 'fulfilled' ? brandsResult.value : []);
        setBrandStories(storiesResult.status === 'fulfilled' ? storiesResult.value : []);
      } catch (error) {
        console.error('Failed to load discover page data:', error);
        setLoadError(error instanceof Error ? error.message : 'Failed to load products');
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
    // Occasion and mood filters are already sent to the API (server-side filtering).
    // Only apply text search client-side so we don't double-filter and remove
    // products that the recommendation engine returned.
    const filtered = products.filter(p => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesBrand = p.brandName.toLowerCase().includes(query);
        const matchesTags = p.tags?.some(tag => tag.toLowerCase().includes(query));
        if (!matchesName && !matchesBrand && !matchesTags) return false;
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
  }, [searchQuery, products, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage, PRODUCTS_PER_PAGE]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [budgetRange, searchQuery, selectedOccasions, selectedMoods, sortBy]);

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

  const hasActiveFilters =
    selectedOccasions.length > 0 ||
    selectedMoods.length > 0 ||
    !!searchQuery ||
    !!budgetRange;

  // Derive available occasion and aesthetic options from the products
  // returned by the real recommendation API, so the refine panel reflects
  // actual data instead of purely static mocks.
  const occasionOptions = useMemo(
    () => [
      { id: 'professional', label: 'Professional' },
      { id: 'social', label: 'Social Events' },
      { id: 'casual', label: 'Casual Daily' },
      { id: 'formal', label: 'Formal' },
      { id: 'travel', label: 'Travel' },
      { id: 'art', label: 'Art & Culture' },
    ],
    []
  );

  const moodOptions = useMemo(() => {
    // Keep ids aligned with onboarding ("minimal", "classic", "artistic", "contemporary")
    const allowedIds = ['minimal', 'classic', 'artistic', 'contemporary'] as const;
    const labels: Record<string, string> = {
      minimal: 'Minimal & Structured',
      classic: 'Classic & Timeless',
      artistic: 'Artistic & Expressive',
      contemporary: 'Bold & Contemporary',
    };
    const present = new Set<string>();

    products.forEach((p) => {
      p.tags?.forEach((tag) => {
        const raw = tag.toLowerCase().replace(/\s+/g, '-');

        // Map richer backend aesthetic tokens to the UI buckets
        const bucket =
          raw.includes('minimal') ? 'minimal'
          : raw.includes('classic') || raw.includes('timeless') ? 'classic'
          : raw.includes('art') || raw.includes('cultural') || raw.includes('expressive') ? 'artistic'
          : raw.includes('contemporary') || raw.includes('bold') || raw.includes('statement') || raw.includes('modern') ? 'contemporary'
          : null;

        if (bucket && allowedIds.includes(bucket)) {
          present.add(bucket);
        }
      });
    });

    return allowedIds
      .filter((id) => present.has(id))
      .map((id) => ({ id, label: labels[id] }));
  }, [products]);

  const budgets = [
    { id: 'under-500', label: 'Under €500' },
    { id: '500-1500', label: '€500 - €1,500' },
    { id: '1500-5000', label: '€1,500 - €5,000' },
    { id: '5000-plus', label: '€5,000+' }
  ];

  if (!isLoaded && dataLoading) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-stone tracking-wider">Loading</p>
        </div>
      </div>
    );
  }

  if (isUHNI) return null;

  return (
    <div className="bg-ivory-cream">
      {/* ============================================
          HERO - Balanced Discovery
          ============================================ */}
      <section className="relative h-[60vh] min-h-[400px] max-h-[600px] w-full overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=90"
          alt="Discover"
          fill
          className={`object-cover transition-all duration-[2s] ease-out ${isLoaded ? 'scale-100' : 'scale-110'}`}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-noir/20 via-noir/10 to-noir/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-noir/40 via-transparent to-transparent" />

        {/* Hero Content - Left Aligned */}
        <div className="relative h-full flex items-end px-8 md:px-16 lg:px-24 pb-12 md:pb-16">
          <div className="w-full max-w-4xl">
            {/* Label */}
            <span className={`text-[10px] tracking-[0.5em] uppercase text-ivory-cream/60 block mb-4 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              The Collection
            </span>

            {/* Title */}
            <h1 className={`font-display text-[clamp(2.5rem,8vw,5rem)] text-ivory-cream leading-[0.95] tracking-[-0.02em] mb-8 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Discover
            </h1>

            {/* Search Bar */}
            <div className={`max-w-lg transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pieces, brands, aesthetics..."
                  className="w-full px-5 py-4 pr-12 bg-ivory-cream/95 backdrop-blur-md text-charcoal-deep text-sm placeholder:text-stone/60 focus:outline-none focus:bg-ivory-cream transition-all duration-300"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-stone/60 group-focus-within:text-charcoal-deep transition-colors" size={18} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FILTER BAR - Editorial Navigation
          ============================================ */}
      <section className="sticky top-0 z-40 bg-ivory-cream/95 backdrop-blur-md">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16 lg:px-24">
          <div className="flex items-center justify-between py-6 border-b border-sand/30">
            {/* Tabs - Editorial Style */}
            <nav className="flex gap-10 md:gap-12">
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
                    activeTab === tab.id
                      ? 'text-charcoal-deep'
                      : 'text-stone hover:text-charcoal-deep'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute -bottom-6 left-0 right-0 h-px bg-charcoal-deep" />
                  )}
                </button>
              ))}
            </nav>

            {/* Sort & Filter Controls */}
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-sand bg-white text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
              >
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest</option>
                <option value="brand-az">Brand A-Z</option>
              </select>

            <button
              onClick={() => setShowMobileFilters(true)}
              className="group flex items-center gap-3 text-sm tracking-[0.15em] uppercase text-charcoal-deep hover:text-gold-deep transition-colors"
            >
              <span>Refine</span>
              <span className="relative">
                <SlidersHorizontal size={16} className="transition-transform group-hover:rotate-180 duration-500" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold-muted rounded-full" />
                )}
              </span>
            </button>
            </div>
          </div>

          {/* Active Filters - Refined Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-3 py-4">
              {searchQuery && (
                <span className="inline-flex items-center gap-3 px-4 py-2 border border-charcoal-deep text-charcoal-deep text-xs tracking-[0.1em]">
                  {searchQuery}
                  <button onClick={() => setSearchQuery('')} className="hover:text-gold-deep transition-colors"><X size={12} /></button>
                </span>
              )}
              {selectedOccasions.map((occ) => (
                <span
                  key={occ}
                  className="inline-flex items-center gap-3 px-4 py-2 border border-charcoal-deep text-charcoal-deep text-xs tracking-[0.1em]"
                >
                  {occasionOptions.find(o => o.id === occ)?.label ?? occ}
                  <button
                    onClick={() =>
                      setSelectedOccasions(prev => prev.filter(id => id !== occ))
                    }
                    className="hover:text-gold-deep transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {selectedMoods.map((mood) => (
                <span
                  key={mood}
                  className="inline-flex items-center gap-3 px-4 py-2 border border-charcoal-deep text-charcoal-deep text-xs tracking-[0.1em]"
                >
                  {moodOptions.find(m => m.id === mood)?.label ?? mood}
                  <button
                    onClick={() =>
                      setSelectedMoods(prev => prev.filter(id => id !== mood))
                    }
                    className="hover:text-gold-deep transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              {budgetRange && (
                <span className="inline-flex items-center gap-3 px-4 py-2 border border-charcoal-deep text-charcoal-deep text-xs tracking-[0.1em]">
                  {budgets.find(b => b.id === budgetRange)?.label}
                  <button onClick={() => setBudgetRange(null)} className="hover:text-gold-deep transition-colors"><X size={12} /></button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs tracking-[0.1em] text-stone hover:text-charcoal-deep transition-colors ml-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          PRODUCTS GRID - Editorial Layout
          ============================================ */}
      {(activeTab === 'all' || activeTab === 'products') && (
        <section ref={resultsRef} className="bg-parchment py-16 lg:py-24">
          <div className="max-w-[1800px] mx-auto px-8 md:px-16 lg:px-24">
            {/* Section Header - Compact Editorial */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 lg:mb-16">
              <div>
                <span className="text-[10px] tracking-[0.4em] uppercase text-taupe block mb-2">
                  {hasActiveFilters ? 'Your Selection' : 'The Selection'}
                </span>
                <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em]">
                  {hasActiveFilters ? `${filteredProducts.length} Pieces` : 'Curated Pieces'}
                </h2>
              </div>
              <p className="text-sm text-stone max-w-sm">
                Exceptional pieces from distinguished maisons, selected for discerning taste.
              </p>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-12 md:gap-y-20">
                {paginatedProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}?productId=${product.id}`}
                    className="group"
                    onMouseEnter={() => setActiveProductHover(index)}
                    onMouseLeave={() => setActiveProductHover(null)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-ivory-cream mb-6">
                      <Image
                        src={product.images[0]?.url || 'https://placehold.co/800x1000/F5F0EB/8B8680?text=No+Image'}
                        alt={product.name}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-105"
                      />

                      {/* Hover Action - Arrow indicates navigation */}
                      <div className="absolute inset-0 flex items-center justify-center bg-noir/0 group-hover:bg-noir/20 transition-all duration-500">
                        <div className={`w-14 h-14 rounded-full bg-ivory-cream flex items-center justify-center transform transition-all duration-500 ${activeProductHover === index ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                          <ArrowRight size={18} className="text-charcoal-deep" />
                        </div>
                      </div>

                      {/* Limited Badge */}
                      {product.availability.status === 'limited' && (
                        <div className="absolute top-4 left-4">
                          <span className="text-[9px] tracking-[0.2em] uppercase text-charcoal-deep bg-ivory-cream px-3 py-1.5">
                            Limited Edition
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <p className="text-[10px] tracking-[0.25em] uppercase text-taupe">
                        {product.brandName}
                      </p>
                      <h3 className="font-display text-lg md:text-xl text-charcoal-deep leading-tight group-hover:text-charcoal-warm transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-stone">
                        {product.currency === 'INR' ? '₹' : product.currency === 'GBP' ? '£' : product.currency === 'USD' ? '$' : '€'}{product.price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-ivory-cream rounded-sm">
                <p className="font-display text-2xl text-charcoal-deep mb-4">
                  {loadError ? 'Unable to load products' : 'No pieces found'}
                </p>
                <p className="text-stone mb-8 max-w-md mx-auto">
                  {loadError
                    ? 'There was a problem connecting to the server. Please check your connection and try again.'
                    : 'We couldn\'t find pieces matching your criteria. Try adjusting your filters to explore more.'}
                </p>
                {loadError && (
                  <p className="text-xs text-stone/60 mb-6 font-mono">{loadError}</p>
                )}
                <button
                  onClick={loadError ? () => window.location.reload() : clearFilters}
                  className="group inline-flex items-center gap-4"
                >
                  <span className="text-sm tracking-[0.2em] uppercase text-charcoal-deep group-hover:text-gold-deep transition-colors">
                    {loadError ? 'Retry' : 'View All Pieces'}
                  </span>
                  <span className="w-12 h-12 rounded-full border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-500">
                    <ArrowRight size={16} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors duration-500" />
                  </span>
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 lg:mt-20 flex items-center justify-center gap-3">
                {/* Previous */}
                <button
                  onClick={() => { setCurrentPage(p => p - 1); resultsRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-full border border-sand flex items-center justify-center text-charcoal-deep hover:border-charcoal-deep disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => { setCurrentPage(page); resultsRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                    className={`w-10 h-10 rounded-full text-sm tracking-wider transition-all ${
                      currentPage === page
                        ? 'bg-charcoal-deep text-ivory-cream'
                        : 'border border-sand text-charcoal-deep hover:border-charcoal-deep'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next */}
                <button
                  onClick={() => { setCurrentPage(p => p + 1); resultsRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-full border border-sand flex items-center justify-center text-charcoal-deep hover:border-charcoal-deep disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Count */}
                <span className="ml-4 text-xs text-stone tracking-wider">
                  {filteredProducts.length} pieces
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============================================
          BRANDS - Full Bleed Editorial
          ============================================ */}
      {(activeTab === 'all' || activeTab === 'brands') && (
        <section className="bg-charcoal-deep py-20 lg:py-32">
          <div className="max-w-[1800px] mx-auto px-8 md:px-16 lg:px-24">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 lg:mb-16">
              <div>
                <span className="text-[10px] tracking-[0.4em] uppercase text-gold-soft/50 block mb-2">
                  Legendary Craftsmanship
                </span>
                <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-ivory-cream leading-[1.1] tracking-[-0.02em]">
                  The Maisons
                </h2>
              </div>
              <p className="text-sm text-taupe max-w-sm">
                Enter the world of heritage houses where artistry meets tradition.
              </p>
            </div>

            {/* Brand Grid - Editorial (All tab: show 6) */}
            {activeTab === 'all' && (
              <>
                <div className="grid grid-cols-12 gap-3 md:gap-4">
                  {/* Featured Brand */}
                  {filteredBrands[0] && (
                    <Link
                      href={`/brand/${filteredBrands[0].slug}?brandId=${filteredBrands[0].id}`}
                      className="col-span-12 lg:col-span-8 group relative aspect-[16/9] overflow-hidden"
                    >
                      <Image
                        src={filteredBrands[0].heroImage}
                        alt={filteredBrands[0].name}
                        fill
                        className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-noir/30 group-hover:bg-noir/10 transition-colors duration-700" />
                      <div className="absolute inset-0 flex items-end p-8 md:p-12">
                        <div>
                          <h3 className="font-display text-4xl md:text-6xl text-ivory-cream tracking-[-0.02em]">
                            {filteredBrands[0].name}
                          </h3>
                          <div className="mt-4 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <span className="text-xs tracking-[0.2em] uppercase text-ivory-cream">Enter</span>
                            <ArrowRight size={14} className="text-ivory-cream" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* Secondary Brands */}
                  <div className="col-span-12 lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
                    {filteredBrands.slice(1, 3).map((brand) => (
                      <Link
                        key={brand.id}
                        href={`/brand/${brand.slug}?brandId=${brand.id}`}
                        className="group relative aspect-[4/3] lg:aspect-[16/9] overflow-hidden"
                      >
                        <Image
                          src={brand.heroImage}
                          alt={brand.name}
                          fill
                          className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-noir/40 group-hover:bg-noir/20 transition-colors duration-500" />
                        <div className="absolute inset-0 flex items-end p-5">
                          <h3 className="font-display text-2xl text-ivory-cream">{brand.name}</h3>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Remaining Brands */}
                  {filteredBrands.slice(3, 6).map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/brand/${brand.slug}?brandId=${brand.id}`}
                      className="col-span-4 group relative aspect-square overflow-hidden"
                    >
                      <Image
                        src={brand.heroImage}
                        alt={brand.name}
                        fill
                        className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-noir/40 group-hover:bg-noir/20 transition-colors duration-500" />
                      <div className="absolute inset-0 flex items-end p-4 md:p-6">
                        <h3 className="font-display text-lg md:text-xl text-ivory-cream">{brand.name}</h3>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* View All Brands */}
                {filteredBrands.length > 6 && (
                  <div className="mt-12 lg:mt-16 text-center">
                    <button
                      onClick={() => setActiveTab('brands')}
                      className="group inline-flex items-center gap-4"
                    >
                      <span className="text-sm tracking-[0.15em] uppercase text-ivory-cream/60 group-hover:text-ivory-cream transition-colors">
                        All Maisons ({filteredBrands.length})
                      </span>
                      <span className="w-10 h-10 rounded-full border border-ivory-cream/30 flex items-center justify-center group-hover:bg-ivory-cream group-hover:border-ivory-cream transition-all duration-500">
                        <ArrowRight size={14} className="text-ivory-cream group-hover:text-charcoal-deep transition-colors duration-500" />
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Brand Grid - Full (Brands tab: show ALL) */}
            {activeTab === 'brands' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {filteredBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brand/${brand.slug}?brandId=${brand.id}`}
                    className="group relative aspect-[4/3] overflow-hidden"
                  >
                    <Image
                      src={brand.heroImage}
                      alt={brand.name}
                      fill
                      className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-noir/40 group-hover:bg-noir/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-end p-5 md:p-6">
                      <h3 className="font-display text-xl md:text-2xl text-ivory-cream">{brand.name}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============================================
          STORIES - Magazine Layout
          ============================================ */}
      {(activeTab === 'all' || activeTab === 'stories') && (
        <section className="py-20 lg:py-32 bg-ivory-cream">
          <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 lg:mb-16">
              <div>
                <span className="text-[10px] tracking-[0.4em] uppercase text-taupe block mb-2">
                  Heritage & Craft
                </span>
                <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em]">
                  Stories
                </h2>
              </div>
              <p className="text-sm text-stone max-w-sm">
                Behind the scenes of fashion's most enduring legacies.
              </p>
            </div>

            {/* Stories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {filteredStories.slice(0, 3).map((story) => (
                <Link
                  key={story.id}
                  href={`/story/${story.slug}?storyId=${story.id}`}
                  className="group"
                >
                  <div className="relative aspect-[4/5] overflow-hidden mb-6">
                    <Image
                      src={story.heroImage}
                      alt={story.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-noir/10 group-hover:bg-noir/0 transition-colors duration-500" />
                    <div className="absolute top-5 left-5">
                      <span className="text-[9px] tracking-[0.2em] uppercase text-charcoal-deep bg-ivory-cream/90 px-3 py-1.5">
                        {story.type}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-display text-xl md:text-2xl text-charcoal-deep leading-tight group-hover:text-charcoal-warm transition-colors mb-3">
                    {story.title}
                  </h3>
                  <p className="text-sm text-stone leading-relaxed line-clamp-2">
                    {story.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          FILTER DRAWER - Refined Overlay
          ============================================ */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-500 ${showMobileFilters ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-noir/50 backdrop-blur-sm"
          onClick={() => setShowMobileFilters(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-full max-w-md bg-ivory-cream transform transition-transform duration-500 ease-out ${showMobileFilters ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-8 border-b border-sand/30">
            <div>
              <span className="text-[10px] tracking-[0.4em] uppercase text-taupe block mb-1">
                Refine Your
              </span>
              <h3 className="font-display text-2xl text-charcoal-deep">Selection</h3>
            </div>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-12 h-12 rounded-full border border-sand flex items-center justify-center text-stone hover:border-charcoal-deep hover:text-charcoal-deep transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Filter Content */}
          <div className="px-8 py-10 space-y-12 overflow-y-auto h-[calc(100%-200px)]">
            {/* Occasion */}
            <div>
              <h4 className="text-[11px] tracking-[0.4em] uppercase text-taupe mb-6">Occasion</h4>
              <div className="space-y-1">
                {occasionOptions.map((occ) => (
                  <button
                    key={occ.id}
                    onClick={() =>
                      setSelectedOccasions(prev =>
                        prev.includes(occ.id)
                          ? prev.filter(id => id !== occ.id)
                          : [...prev, occ.id]
                      )
                    }
                    className={`flex items-center justify-between w-full text-left py-3 text-sm transition-all border-b border-transparent hover:border-sand/50 ${
                      selectedOccasions.includes(occ.id)
                        ? 'text-charcoal-deep'
                        : 'text-stone hover:text-charcoal-deep'
                    }`}
                  >
                    <span>{occ.label}</span>
                    {selectedOccasions.includes(occ.id) && (
                      <span className="w-2 h-2 bg-gold-muted rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Aesthetic */}
            <div>
              <h4 className="text-[11px] tracking-[0.4em] uppercase text-taupe mb-6">Aesthetic</h4>
              <div className="space-y-1">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() =>
                      setSelectedMoods(prev =>
                        prev.includes(mood.id)
                          ? prev.filter(id => id !== mood.id)
                          : [...prev, mood.id]
                      )
                    }
                    className={`flex items-center justify-between w-full text-left py-3 text-sm transition-all border-b border-transparent hover:border-sand/50 ${
                      selectedMoods.includes(mood.id)
                        ? 'text-charcoal-deep'
                        : 'text-stone hover:text-charcoal-deep'
                    }`}
                  >
                    <span>{mood.label}</span>
                    {selectedMoods.includes(mood.id) && (
                      <span className="w-2 h-2 bg-gold-muted rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <h4 className="text-[11px] tracking-[0.4em] uppercase text-taupe mb-6">Investment</h4>
              <div className="space-y-1">
                {budgets.map((budget) => (
                  <button
                    key={budget.id}
                    onClick={() => setBudgetRange(budgetRange === budget.id ? null : budget.id)}
                    className={`flex items-center justify-between w-full text-left py-3 text-sm transition-all border-b border-transparent hover:border-sand/50 ${
                      budgetRange === budget.id
                        ? 'text-charcoal-deep'
                        : 'text-stone hover:text-charcoal-deep'
                    }`}
                  >
                    <span>{budget.label}</span>
                    {budgetRange === budget.id && (
                      <span className="w-2 h-2 bg-gold-muted rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 px-8 py-6 border-t border-sand/30 bg-ivory-cream">
            <div className="flex gap-4">
              <button
                onClick={clearFilters}
                className="flex-1 py-4 text-sm tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep transition-colors border border-sand hover:border-charcoal-deep"
              >
                Clear All
              </button>
              <button
                onClick={() => {
                  setShowMobileFilters(false);
                  resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex-1 py-4 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.15em] uppercase hover:bg-noir transition-colors"
              >
                View Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiscoverLoading() {
  return (
    <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-stone tracking-wider">Loading</p>
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<DiscoverLoading />}>
      <DiscoverContent />
    </Suspense>
  );
}
