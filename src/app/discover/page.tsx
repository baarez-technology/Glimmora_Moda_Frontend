'use client';

import { useState, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Sparkles,
  ArrowRight,
  X,
  Package,
  ChevronDown,
  ChevronUp,
  Filter,
  LayoutGrid,
  Check
} from 'lucide-react';
import { products, brands, brandStories } from '@/data/mock-data';

function DiscoverContent() {
  const searchParams = useSearchParams();
  const occasionParam = searchParams.get('occasion');
  const moodParam = searchParams.get('mood');
  const resultsRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'brands' | 'stories'>('all');
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(50000);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(occasionParam);
  const [selectedMood, setSelectedMood] = useState<string | null>(moodParam);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Collapsible filter sections
  const [occasionOpen, setOccasionOpen] = useState(true);
  const [moodOpen, setMoodOpen] = useState(true);
  const [budgetOpen, setBudgetOpen] = useState(true);

  const scrollToResults = () => {
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Filter products by search, budget, occasion, and mood
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (p.price < budgetMin || p.price > budgetMax) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesBrand = p.brandName.toLowerCase().includes(query);
        const matchesTags = p.tags?.some(tag => tag.toLowerCase().includes(query));
        const matchesCategory = p.category?.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesTags && !matchesCategory) return false;
      }

      if (selectedOccasion) {
        const occasionTags: Record<string, string[]> = {
          evening: ['evening', 'formal', 'gala', 'party', 'elegant'],
          professional: ['professional', 'business', 'office', 'work', 'meeting'],
          casual: ['casual', 'everyday', 'relaxed', 'weekend'],
          travel: ['travel', 'versatile', 'comfortable', 'practical']
        };
        const matchTags = occasionTags[selectedOccasion] || [];
        const hasOccasionTag = p.tags?.some(tag =>
          matchTags.some(t => tag.toLowerCase().includes(t))
        );
        if (!hasOccasionTag) return false;
      }

      if (selectedMood) {
        const moodTags: Record<string, string[]> = {
          minimal: ['minimal', 'clean', 'structured', 'simple', 'modern'],
          classic: ['classic', 'timeless', 'heritage', 'traditional', 'elegant'],
          bold: ['bold', 'contemporary', 'statement', 'modern', 'avant-garde'],
          artistic: ['artistic', 'expressive', 'creative', 'unique', 'artisanal']
        };
        const matchTags = moodTags[selectedMood] || [];
        const hasMoodTag = p.tags?.some(tag =>
          matchTags.some(t => tag.toLowerCase().includes(t))
        );
        if (!hasMoodTag) return false;
      }

      return true;
    });
  }, [budgetMin, budgetMax, searchQuery, selectedOccasion, selectedMood]);

  const filteredBrands = useMemo(() => {
    if (!searchQuery) return brands;
    const query = searchQuery.toLowerCase();
    return brands.filter(b =>
      b.name.toLowerCase().includes(query) ||
      b.tagline?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filteredStories = useMemo(() => {
    if (!searchQuery) return brandStories;
    const query = searchQuery.toLowerCase();
    return brandStories.filter(s =>
      s.title.toLowerCase().includes(query) ||
      s.excerpt?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const clearFilters = () => {
    setSelectedOccasion(null);
    setSelectedMood(null);
    setSearchQuery('');
    setBudgetMin(0);
    setBudgetMax(50000);
  };

  const hasActiveFilters = selectedOccasion || selectedMood || searchQuery || budgetMin > 0 || budgetMax < 50000;
  const activeFilterCount = [selectedOccasion, selectedMood, searchQuery, (budgetMin > 0 || budgetMax < 50000) ? 'budget' : null].filter(Boolean).length;

  const occasions = [
    { id: 'evening', label: 'Evening & Events', icon: '✨' },
    { id: 'professional', label: 'Professional', icon: '💼' },
    { id: 'casual', label: 'Everyday Luxury', icon: '☀️' },
    { id: 'travel', label: 'Travel', icon: '✈️' }
  ];

  const moods = [
    { id: 'minimal', label: 'Minimal & Structured' },
    { id: 'classic', label: 'Classic & Timeless' },
    { id: 'bold', label: 'Bold & Contemporary' },
    { id: 'artistic', label: 'Artistic & Expressive' }
  ];

  const budgetPresets = [
    { label: 'Under €500', min: 0, max: 500 },
    { label: '€500 - €1,500', min: 500, max: 1500 },
    { label: '€1,500 - €5,000', min: 1500, max: 5000 },
    { label: '€5,000+', min: 5000, max: 50000 },
  ];

  // Filter Sidebar Component
  const FilterSidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`${isMobile ? '' : 'sticky top-24'}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-charcoal-deep" />
          <span className="font-display text-lg text-charcoal-deep">Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gold-muted hover:text-gold-deep transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Occasion Filter */}
      <div className="border-b border-sand pb-4 mb-4">
        <button
          onClick={() => setOccasionOpen(!occasionOpen)}
          className="flex items-center justify-between w-full py-2 group"
        >
          <span className="text-sm font-medium text-charcoal-deep tracking-wide uppercase">
            Occasion
          </span>
          {occasionOpen ? (
            <ChevronUp size={16} className="text-stone group-hover:text-charcoal-deep transition-colors" />
          ) : (
            <ChevronDown size={16} className="text-stone group-hover:text-charcoal-deep transition-colors" />
          )}
        </button>

        {occasionOpen && (
          <div className="mt-3 space-y-2">
            {occasions.map((occ) => (
              <button
                key={occ.id}
                onClick={() => {
                  setSelectedOccasion(selectedOccasion === occ.id ? null : occ.id);
                  if (!isMobile) scrollToResults();
                }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-all ${
                  selectedOccasion === occ.id
                    ? 'bg-charcoal-deep text-ivory-cream'
                    : 'hover:bg-parchment text-stone hover:text-charcoal-deep'
                }`}
              >
                <span className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selectedOccasion === occ.id
                    ? 'bg-gold-muted border-gold-muted'
                    : 'border-sand'
                }`}>
                  {selectedOccasion === occ.id && (
                    <Check size={12} className="text-charcoal-deep" />
                  )}
                </span>
                <span className="text-sm">{occ.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mood Filter */}
      <div className="border-b border-sand pb-4 mb-4">
        <button
          onClick={() => setMoodOpen(!moodOpen)}
          className="flex items-center justify-between w-full py-2 group"
        >
          <span className="text-sm font-medium text-charcoal-deep tracking-wide uppercase">
            Aesthetic
          </span>
          {moodOpen ? (
            <ChevronUp size={16} className="text-stone group-hover:text-charcoal-deep transition-colors" />
          ) : (
            <ChevronDown size={16} className="text-stone group-hover:text-charcoal-deep transition-colors" />
          )}
        </button>

        {moodOpen && (
          <div className="mt-3 space-y-2">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => {
                  setSelectedMood(selectedMood === mood.id ? null : mood.id);
                  if (!isMobile) scrollToResults();
                }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-all ${
                  selectedMood === mood.id
                    ? 'bg-charcoal-deep text-ivory-cream'
                    : 'hover:bg-parchment text-stone hover:text-charcoal-deep'
                }`}
              >
                <span className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selectedMood === mood.id
                    ? 'bg-gold-muted border-gold-muted'
                    : 'border-sand'
                }`}>
                  {selectedMood === mood.id && (
                    <Check size={12} className="text-charcoal-deep" />
                  )}
                </span>
                <span className="text-sm">{mood.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Budget Filter */}
      <div className="pb-4">
        <button
          onClick={() => setBudgetOpen(!budgetOpen)}
          className="flex items-center justify-between w-full py-2 group"
        >
          <span className="text-sm font-medium text-charcoal-deep tracking-wide uppercase">
            Budget
          </span>
          {budgetOpen ? (
            <ChevronUp size={16} className="text-stone group-hover:text-charcoal-deep transition-colors" />
          ) : (
            <ChevronDown size={16} className="text-stone group-hover:text-charcoal-deep transition-colors" />
          )}
        </button>

        {budgetOpen && (
          <div className="mt-3 space-y-2">
            {budgetPresets.map((preset) => {
              const isSelected = budgetMin === preset.min && budgetMax === preset.max;
              return (
                <button
                  key={preset.label}
                  onClick={() => {
                    if (isSelected) {
                      setBudgetMin(0);
                      setBudgetMax(50000);
                    } else {
                      setBudgetMin(preset.min);
                      setBudgetMax(preset.max);
                    }
                    if (!isMobile) scrollToResults();
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'bg-charcoal-deep text-ivory-cream'
                      : 'hover:bg-parchment text-stone hover:text-charcoal-deep'
                  }`}
                >
                  <span className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-gold-muted border-gold-muted'
                      : 'border-sand'
                  }`}>
                    {isSelected && (
                      <Check size={12} className="text-charcoal-deep" />
                    )}
                  </span>
                  <span className="text-sm">{preset.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Hero Search - Refined */}
      <section className="bg-charcoal-deep text-ivory-cream py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-gold-soft" size={20} />
            <span className="text-xs tracking-[0.25em] uppercase text-gold-soft">Fashion Intelligence</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">
            Discover Your Next Piece
          </h1>
          <p className="text-taupe text-sm md:text-base mb-8">
            Search our curated collection of luxury fashion
          </p>

          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search brands, products, or styles..."
              className="w-full px-5 py-3.5 pr-12 bg-ivory-cream text-charcoal-deep rounded-full text-base placeholder:text-greige focus:outline-none focus:ring-2 focus:ring-gold-muted"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-greige" size={18} />
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-5">
            {['Evening dress', 'Iconic bags', 'Heritage pieces'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setSearchQuery(suggestion);
                  scrollToResults();
                }}
                className="px-3 py-1.5 border border-taupe/40 text-taupe rounded-full text-xs hover:border-ivory-cream hover:text-ivory-cream transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-sand bg-white sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex gap-6 overflow-x-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'products', label: 'Products' },
              { id: 'brands', label: 'Brands' },
              { id: 'stories', label: 'Stories' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-3.5 text-sm tracking-wide border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-charcoal-deep text-charcoal-deep font-medium'
                    : 'border-transparent text-stone hover:text-charcoal-deep'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {(activeTab === 'all' || activeTab === 'products') && (
        <section ref={resultsRef} className="py-8 lg:py-12 px-6 scroll-mt-14">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex gap-8">
              {/* Desktop Filter Sidebar */}
              <aside className="hidden lg:block w-64 flex-shrink-0">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <FilterSidebar />
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1 min-w-0">
                {/* Mobile Filter Button + Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-xl text-charcoal-deep">
                      {hasActiveFilters ? 'Filtered Results' : 'All Products'}
                    </h2>
                    <p className="text-sm text-stone mt-0.5">
                      {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'} found
                    </p>
                  </div>

                  {/* Mobile Filter Toggle */}
                  <button
                    onClick={() => setShowMobileFilters(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm text-sm text-charcoal-deep"
                  >
                    <Filter size={16} />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="w-5 h-5 bg-charcoal-deep text-ivory-cream rounded-full text-xs flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Active Filters Pills */}
                {hasActiveFilters && (
                  <div className="mb-6 flex flex-wrap items-center gap-2">
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-charcoal-deep text-ivory-cream text-sm rounded-full">
                        "{searchQuery}"
                        <button onClick={() => setSearchQuery('')} className="hover:text-gold-soft ml-1">
                          <X size={14} />
                        </button>
                      </span>
                    )}
                    {selectedOccasion && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-charcoal-deep text-ivory-cream text-sm rounded-full">
                        {occasions.find(o => o.id === selectedOccasion)?.label}
                        <button onClick={() => setSelectedOccasion(null)} className="hover:text-gold-soft ml-1">
                          <X size={14} />
                        </button>
                      </span>
                    )}
                    {selectedMood && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-charcoal-deep text-ivory-cream text-sm rounded-full">
                        {moods.find(m => m.id === selectedMood)?.label}
                        <button onClick={() => setSelectedMood(null)} className="hover:text-gold-soft ml-1">
                          <X size={14} />
                        </button>
                      </span>
                    )}
                    {(budgetMin > 0 || budgetMax < 50000) && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-charcoal-deep text-ivory-cream text-sm rounded-full">
                        {budgetPresets.find(p => p.min === budgetMin && p.max === budgetMax)?.label ||
                          `€${budgetMin.toLocaleString()} - €${budgetMax.toLocaleString()}`}
                        <button onClick={() => { setBudgetMin(0); setBudgetMax(50000); }} className="hover:text-gold-soft ml-1">
                          <X size={14} />
                        </button>
                      </span>
                    )}
                    <button
                      onClick={clearFilters}
                      className="text-sm text-gold-muted hover:text-gold-deep transition-colors underline underline-offset-2"
                    >
                      Clear all
                    </button>
                  </div>
                )}

                {/* Product Grid */}
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                    {filteredProducts.slice(0, 12).map((product) => (
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
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <p className="text-[11px] tracking-[0.15em] uppercase text-greige">{product.brandName}</p>
                        <h3 className="font-display text-base text-charcoal-deep group-hover:text-gold-deep transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-stone mt-0.5">€{product.price.toLocaleString()}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-xl">
                    <Package size={40} className="mx-auto text-greige mb-4" />
                    <h3 className="font-display text-xl text-charcoal-deep mb-2">
                      No products match your filters
                    </h3>
                    <p className="text-stone mb-6 max-w-sm mx-auto text-sm">
                      Try adjusting your filters to find what you're looking for.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-charcoal-deep text-ivory-cream rounded-full text-sm hover:bg-noir transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}

                {/* View More Link */}
                {filteredProducts.length > 12 && (
                  <div className="text-center mt-10">
                    <Link
                      href="/collection/all"
                      className="inline-flex items-center gap-2 text-sm text-gold-muted hover:text-gold-deep transition-colors"
                    >
                      View all {filteredProducts.length} products
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Brand Universes */}
      {(activeTab === 'all' || activeTab === 'brands') && (
        <section className="py-12 lg:py-16 bg-charcoal-deep px-6">
          <div className="max-w-[1600px] mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs tracking-[0.25em] uppercase text-gold-soft mb-2">Enter Their World</p>
              <h2 className="font-display text-2xl text-ivory-cream">Brand Universes</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
              {filteredBrands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brand/${brand.slug}`}
                  className="group relative aspect-square rounded-xl overflow-hidden"
                >
                  <Image
                    src={brand.heroImage}
                    alt={brand.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-noir/50 group-hover:bg-noir/30 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="font-display text-lg text-ivory-cream text-center px-2">{brand.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stories */}
      {(activeTab === 'all' || activeTab === 'stories') && (
        <section className="py-12 lg:py-16 px-6">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-xs tracking-[0.25em] uppercase text-gold-muted mb-2">Heritage & Craft</p>
                <h2 className="font-display text-2xl text-charcoal-deep">Stories to Explore</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {filteredStories.slice(0, 3).map((story) => (
                <Link
                  key={story.id}
                  href={`/story/${story.slug}`}
                  className="group"
                >
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3">
                    <Image
                      src={story.heroImage}
                      alt={story.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-ivory-cream/90 text-charcoal-deep text-xs rounded-full">{story.type}</span>
                    </div>
                  </div>
                  <h3 className="font-display text-lg text-charcoal-deep group-hover:text-gold-deep transition-colors mb-1">
                    {story.title}
                  </h3>
                  <p className="text-sm text-stone line-clamp-2">{story.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-noir/50"
            onClick={() => setShowMobileFilters(false)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-ivory-cream overflow-y-auto">
            <div className="sticky top-0 bg-ivory-cream border-b border-sand px-5 py-4 flex items-center justify-between z-10">
              <span className="font-display text-lg text-charcoal-deep">Filters</span>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 -mr-2 text-stone hover:text-charcoal-deep"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              <FilterSidebar isMobile />
            </div>

            <div className="sticky bottom-0 bg-ivory-cream border-t border-sand p-5">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-charcoal-deep text-ivory-cream rounded-full text-sm font-medium hover:bg-noir transition-colors"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DiscoverLoading() {
  return (
    <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
      <div className="text-center">
        <Sparkles className="text-gold-muted animate-pulse mx-auto mb-4" size={32} />
        <p className="text-stone">Loading discover...</p>
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
