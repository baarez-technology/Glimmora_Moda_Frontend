'use client';

import { use, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, X, SlidersHorizontal } from 'lucide-react';
import { getCollectionBySlug, products as allProducts, brands } from '@/data/mock-data';
import { notFound } from 'next/navigation';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

type CategoryFilter = 'all' | 'bags' | 'clothing' | 'shoes' | 'accessories';

export default function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = use(params);
  const collection = getCollectionBySlug(slug);
  const [isLoaded, setIsLoaded] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeProductHover, setActiveProductHover] = useState<number | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // If no specific collection found, show all products
  const isAllProducts = slug === 'all';
  const baseProducts = isAllProducts ? allProducts : collection?.products || [];

  // Filter products by category
  const displayProducts = useMemo(() => {
    if (categoryFilter === 'all') return baseProducts;

    return baseProducts.filter(p => {
      const category = p.category?.toLowerCase() || '';
      const tags = p.tags?.map(t => t.toLowerCase()) || [];

      switch (categoryFilter) {
        case 'bags':
          return category.includes('bag') || tags.some(t => t.includes('bag') || t.includes('handbag'));
        case 'clothing':
          return category.includes('clothing') || category.includes('jacket') || category.includes('coat') ||
                 tags.some(t => t.includes('jacket') || t.includes('coat') || t.includes('dress') || t.includes('blazer'));
        case 'shoes':
          return category.includes('shoe') || category.includes('footwear') ||
                 tags.some(t => t.includes('shoe') || t.includes('loafer') || t.includes('heel') || t.includes('boot'));
        case 'accessories':
          return category.includes('accessor') || category.includes('jewelry') ||
                 tags.some(t => t.includes('scarf') || t.includes('belt') || t.includes('jewelry') || t.includes('watch'));
        default:
          return true;
      }
    });
  }, [baseProducts, categoryFilter]);

  if (!collection && !isAllProducts) {
    notFound();
  }

  const categoryOptions: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'bags', label: 'Bags' },
    { id: 'clothing', label: 'Clothing' },
    { id: 'shoes', label: 'Shoes' },
    { id: 'accessories', label: 'Accessories' }
  ];

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* ============================================
          HERO - Balanced Collection Header
          ============================================ */}
      <section className="relative h-[50vh] min-h-[350px] max-h-[500px] w-full overflow-hidden">
        <Image
          src={collection?.heroImage || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80'}
          alt={collection?.name || 'All Products'}
          fill
          className={`object-cover transition-all duration-[2s] ease-out ${isLoaded ? 'scale-100' : 'scale-110'}`}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-noir/20 via-noir/10 to-noir/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-noir/50 via-noir/20 to-transparent" />

        {/* Hero Content */}
        <div className="relative h-full flex items-end px-8 md:px-16 lg:px-24 pb-10 md:pb-14">
          <div className={`max-w-2xl transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {collection && (
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/80 block mb-3">
                {collection.season} {collection.year}
              </span>
            )}

            <h1 className="font-display text-[clamp(2rem,6vw,4rem)] text-ivory-cream leading-[0.95] tracking-[-0.02em] mb-4">
              {collection?.name || 'All Pieces'}
            </h1>

            {collection && (
              <p className="text-base text-ivory-cream/70 max-w-lg leading-relaxed">
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ============================================
          FILTER BAR - Editorial Navigation
          ============================================ */}
      <section className="sticky top-0 z-40 bg-ivory-cream/95 backdrop-blur-md">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16 lg:px-24">
          <div className="flex items-center justify-between py-5 border-b border-sand/30">
            {/* Product Count */}
            <div className="text-sm text-stone">
              <span className="text-charcoal-deep font-medium">{displayProducts.length}</span>
              {' '}piece{displayProducts.length !== 1 ? 's' : ''}
              {categoryFilter !== 'all' && (
                <span className="text-taupe"> in {categoryOptions.find(c => c.id === categoryFilter)?.label}</span>
              )}
            </div>

            {/* Desktop Filters */}
            <nav className="hidden lg:flex gap-8">
              {categoryOptions.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setCategoryFilter(category.id)}
                  className={`relative text-sm tracking-[0.15em] uppercase transition-all duration-300 ${
                    categoryFilter === category.id
                      ? 'text-charcoal-deep'
                      : 'text-stone hover:text-charcoal-deep'
                  }`}
                >
                  {category.label}
                  {categoryFilter === category.id && (
                    <span className="absolute -bottom-5 left-0 right-0 h-px bg-charcoal-deep" />
                  )}
                </button>
              ))}
            </nav>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden group flex items-center gap-2 text-sm tracking-[0.15em] uppercase text-charcoal-deep"
            >
              <span>Filter</span>
              <span className="relative">
                <SlidersHorizontal size={16} />
                {categoryFilter !== 'all' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold-muted rounded-full" />
                )}
              </span>
            </button>
          </div>

          {/* Active Filter Chip */}
          {categoryFilter !== 'all' && (
            <div className="py-4">
              <span className="inline-flex items-center gap-3 px-4 py-2 border border-charcoal-deep text-charcoal-deep text-xs tracking-[0.1em]">
                {categoryOptions.find(c => c.id === categoryFilter)?.label}
                <button onClick={() => setCategoryFilter('all')} className="hover:text-gold-deep transition-colors">
                  <X size={12} />
                </button>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          PRODUCTS GRID
          ============================================ */}
      <section className="bg-parchment py-16 lg:py-24">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16 lg:px-24">
          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-10 md:gap-y-16">
              {displayProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="group"
                  onMouseEnter={() => setActiveProductHover(index)}
                  onMouseLeave={() => setActiveProductHover(null)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-ivory-cream mb-5">
                    <Image
                      src={product.images[0]?.url || ''}
                      alt={product.name}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-105"
                    />

                    {/* Hover Action */}
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
                  <div className="space-y-1.5">
                    <p className="text-[10px] tracking-[0.25em] uppercase text-taupe">
                      {product.brandName}
                    </p>
                    <h3 className="font-display text-lg md:text-xl text-charcoal-deep leading-tight group-hover:text-charcoal-warm transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-stone">
                      €{product.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-ivory-cream">
              <p className="font-display text-2xl text-charcoal-deep mb-4">No pieces found</p>
              <p className="text-stone mb-8 max-w-md mx-auto">
                No {categoryOptions.find(c => c.id === categoryFilter)?.label.toLowerCase()} in this collection.
              </p>
              <button
                onClick={() => setCategoryFilter('all')}
                className="group inline-flex items-center gap-4"
              >
                <span className="text-sm tracking-[0.2em] uppercase text-charcoal-deep group-hover:text-gold-deep transition-colors">
                  View All Pieces
                </span>
                <span className="w-12 h-12 rounded-full border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-500">
                  <ArrowRight size={16} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors duration-500" />
                </span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          EXPLORE MORE - Related Brands
          ============================================ */}
      <section className="bg-charcoal-deep py-20 lg:py-28">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16 lg:px-24">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <span className="text-[10px] tracking-[0.4em] uppercase text-gold-soft/50 block mb-2">
                Continue Exploring
              </span>
              <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-ivory-cream leading-[1.1] tracking-[-0.02em]">
                More Maisons
              </h2>
            </div>
            <Link
              href="/discover"
              className="group inline-flex items-center gap-3 text-sm tracking-[0.15em] uppercase text-ivory-cream/60 hover:text-ivory-cream transition-colors"
            >
              <span>All Maisons</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Brand Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {brands.slice(0, 4).map((brand) => (
              <Link
                key={brand.id}
                href={`/brand/${brand.slug}`}
                className="group relative aspect-[4/3] overflow-hidden"
              >
                <Image
                  src={brand.heroImage}
                  alt={brand.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-noir/40 group-hover:bg-noir/20 transition-colors duration-500" />
                <div className="absolute inset-0 flex items-end p-5 md:p-6">
                  <h3 className="font-display text-xl md:text-2xl text-ivory-cream">{brand.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          MOBILE FILTER DRAWER
          ============================================ */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-500 ${showFilters ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-noir/50 backdrop-blur-sm"
          onClick={() => setShowFilters(false)}
        />

        {/* Drawer */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-full max-w-sm bg-ivory-cream transform transition-transform duration-500 ease-out ${showFilters ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-sand/30">
            <h3 className="font-display text-xl text-charcoal-deep">Filter</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="w-10 h-10 rounded-full border border-sand flex items-center justify-center text-stone hover:border-charcoal-deep hover:text-charcoal-deep transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Filter Content */}
          <div className="px-6 py-8">
            <h4 className="text-[11px] tracking-[0.4em] uppercase text-taupe mb-6">Category</h4>
            <div className="space-y-1">
              {categoryOptions.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setCategoryFilter(category.id);
                    setShowFilters(false);
                  }}
                  className={`flex items-center justify-between w-full text-left py-3 text-sm transition-all ${
                    categoryFilter === category.id
                      ? 'text-charcoal-deep'
                      : 'text-stone hover:text-charcoal-deep'
                  }`}
                >
                  <span>{category.label}</span>
                  {categoryFilter === category.id && (
                    <span className="w-2 h-2 bg-gold-muted rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 px-6 py-6 border-t border-sand/30 bg-ivory-cream">
            <button
              onClick={() => {
                setCategoryFilter('all');
                setShowFilters(false);
              }}
              className="w-full py-4 text-sm tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep transition-colors border border-sand hover:border-charcoal-deep"
            >
              Clear Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
