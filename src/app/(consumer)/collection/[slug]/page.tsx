'use client';

import { use, useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import * as collectionService from '@/services/collection.service';
import * as productService from '@/services/product.service';
import * as brandService from '@/services/brand.service';
import { getCollections, getRecommendedProductsPaginated, getRecommendedBrands } from '@/services/recommendation.service';
import { notFound, useSearchParams } from 'next/navigation';
import type { Product, Brand, Collection } from '@/types';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

const PRODUCTS_PER_PAGE = 20;

export default function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const collectionIdParam = searchParams.get('collectionId');
  const brandIdParam = searchParams.get('brandId');
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [activeProductHover, setActiveProductHover] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');
  const [isRealApi, setIsRealApi] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load collection metadata and brands once
  useEffect(() => {
    async function loadCollectionData() {
      try {
        if (collectionIdParam) {
          // Real API — load collection metadata and brands
          const [apiCollections, apiBrands] = await Promise.all([
            getCollections(brandIdParam || undefined),
            getRecommendedBrands(),
          ]);

          const match = apiCollections.find(c => c.id === collectionIdParam);
          if (match) {
            setCollection(match);
            setIsRealApi(true);
          }
          setBrands(apiBrands);
        } else {
          // No collectionId param — fall back to mock data
          const [collectionRes, brandsRes] = await Promise.all([
            collectionService.getCollectionBySlug(slug),
            brandService.getAllBrands(),
          ]);
          setCollection(collectionRes.data ?? null);
          setBrands(brandsRes.data ?? []);
        }
      } catch (error) {
        console.error('Failed to load collection data:', error);
        // If real API fails, try mock as fallback
        if (collectionIdParam) {
          try {
            const [collectionRes, brandsRes] = await Promise.all([
              collectionService.getCollectionBySlug(slug),
              brandService.getAllBrands(),
            ]);
            setCollection(collectionRes.data ?? null);
            setBrands(brandsRes.data ?? []);
          } catch { /* ignore fallback errors */ }
        }
      }
    }
    loadCollectionData();
  }, [slug, collectionIdParam, brandIdParam]);

  // Load products with server-side pagination
  useEffect(() => {
    async function loadProducts() {
      try {
        if (isLoaded) {
          setProductsLoading(true);
        } else {
          setLoading(true);
        }

        if (collectionIdParam || brandIdParam) {
          // Real API with pagination
          const result = await getRecommendedProductsPaginated({
            filter_brand_id: brandIdParam || undefined,
            page_size: PRODUCTS_PER_PAGE,
            page_number: currentPage,
          });

          setProducts(result.products);
          setTotalPages(result.totalPages);
          setTotalProducts(result.totalMatched);
          setIsRealApi(true);
        } else {
          // Mock data fallback - client-side pagination
          const productsRes = await productService.getAllProducts();
          const allMockProducts = productsRes.data ?? [];
          const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
          const paginatedProducts = allMockProducts.slice(start, start + PRODUCTS_PER_PAGE);

          setProducts(paginatedProducts);
          setTotalPages(Math.ceil(allMockProducts.length / PRODUCTS_PER_PAGE));
          setTotalProducts(allMockProducts.length);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
      } finally {
        setLoading(false);
        setProductsLoading(false);
        setIsLoaded(true);
      }
    }
    loadProducts();
  }, [collectionIdParam, brandIdParam, currentPage, isLoaded]);

  // If no specific collection found, show all products
  const isAllProducts = slug === 'all';

  // Apply client-side sorting to products
  const displayProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'newest': return -1;
        case 'brand-az': return a.brandName.localeCompare(b.brandName);
        default: return 0;
      }
    });
  }, [products, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!collection && !isAllProducts) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* ============================================
          HERO - Balanced Collection Header
          ============================================ */}
      <section className="relative h-[50vh] min-h-[350px] max-h-[500px] w-full overflow-hidden">
        <Image
          src={collection?.heroImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80'}
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
              <span className="text-charcoal-deep font-medium">{totalProducts}</span>
              {' '}piece{totalProducts !== 1 ? 's' : ''}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
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
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          PRODUCTS GRID
          ============================================ */}
      <section ref={resultsRef} className="bg-parchment py-16 lg:py-24">
        <div className="max-w-[1800px] mx-auto px-8 md:px-16 lg:px-24">
          {displayProducts.length > 0 ? (
            <div className="relative">
              {/* Loading overlay for page transitions */}
              {productsLoading && (
                <div className="absolute inset-0 bg-parchment/80 z-10 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-10 md:gap-y-16">
                {displayProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}?productId=${product.id}`}
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
                        {product.currency === 'INR' ? '₹' : product.currency === 'GBP' ? '£' : product.currency === 'EUR' ? '€' : '$'}
                        {product.price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-3 flex-wrap">
                  {/* Previous */}
                  <button
                    onClick={() => { setCurrentPage(p => p - 1); resultsRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                    disabled={currentPage === 1 || productsLoading}
                    className="w-10 h-10 rounded-full border border-sand flex items-center justify-center text-charcoal-deep hover:border-charcoal-deep disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page Numbers with Smart Ellipsis */}
                  {(() => {
                    const pages: (number | string)[] = [];

                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (currentPage > 4) pages.push('...');
                      const start = Math.max(2, currentPage - 1);
                      const end = Math.min(totalPages - 1, currentPage + 1);
                      for (let i = start; i <= end; i++) {
                        if (!pages.includes(i)) pages.push(i);
                      }
                      if (currentPage < totalPages - 3) pages.push('...');
                      if (!pages.includes(totalPages)) pages.push(totalPages);
                    }

                    return pages.map((page, idx) => (
                      page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-stone">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => { setCurrentPage(page as number); resultsRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                          disabled={productsLoading}
                          className={`w-10 h-10 rounded-full text-sm tracking-wider transition-all disabled:opacity-50 ${
                            currentPage === page
                              ? 'bg-charcoal-deep text-ivory-cream'
                              : 'border border-sand text-charcoal-deep hover:border-charcoal-deep'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ));
                  })()}

                  {/* Next */}
                  <button
                    onClick={() => { setCurrentPage(p => p + 1); resultsRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                    disabled={currentPage === totalPages || productsLoading}
                    className="w-10 h-10 rounded-full border border-sand flex items-center justify-center text-charcoal-deep hover:border-charcoal-deep disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>

                  {/* Count */}
                  <span className="ml-4 text-xs text-stone tracking-wider">
                    {totalProducts} pieces
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-24 bg-ivory-cream">
              <p className="font-display text-2xl text-charcoal-deep mb-4">No pieces found</p>
              <p className="text-stone mb-8 max-w-md mx-auto">
                No pieces available in this collection.
              </p>
              <Link
                href="/discover"
                className="group inline-flex items-center gap-4"
              >
                <span className="text-sm tracking-[0.2em] uppercase text-charcoal-deep group-hover:text-gold-deep transition-colors">
                  Explore All Pieces
                </span>
                <span className="w-12 h-12 rounded-full border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-500">
                  <ArrowRight size={16} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors duration-500" />
                </span>
              </Link>
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
                href={`/brand/${brand.slug}${isRealApi ? `?brandId=${brand.id}` : ''}`}
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

    </div>
  );
}
