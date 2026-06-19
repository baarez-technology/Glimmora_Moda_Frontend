'use client';

import { use, useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ImageWithFallback from '@/components/shared/ImageWithFallback';
import { ArrowRight, MapPin, Clock, ArrowLeft, ChevronLeft, ChevronRight, Sparkles, Star, Navigation, Phone } from 'lucide-react';
import * as brandService from '@/services/brand.service';
import { getRecommendedProductsPaginated, getRecommendedBrands, searchStories, getCollections } from '@/services/recommendation.service';
import { getAllShopLocations as getAllBrandShops, type BrandShopLocation } from '@/services/brand-locations.service';
import { getReviewsByBrand, type ProductReview } from '@/services/reviews.service';
import type { PaginatedProducts } from '@/services/recommendation.service';
import { notFound } from 'next/navigation';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Product, Brand, BrandStory, Collection } from '@/types';
import { productHref } from '@/services/customer-collection.service';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export default function BrandPage({ params }: BrandPageProps) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const brandIdParam = searchParams.get('brandId');
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stories, setStories] = useState<BrandStory[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeProductHover, setActiveProductHover] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shopLocation, setShopLocation] = useState<BrandShopLocation | null>(null);
  const [brandReviews, setBrandReviews] = useState<ProductReview[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [productsLoading, setProductsLoading] = useState(false);
  const PRODUCTS_PER_PAGE = 20;
  const productsRef = useRef<HTMLElement>(null);
  const loadedBrandRef = useRef<Brand | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        let loadedBrand: Brand | null = null;

        if (brandIdParam) {
          // Real API brand — get info from recommendation API
          const apiBrands = await getRecommendedBrands();
          const match = apiBrands.find(b => b.id === brandIdParam);
          if (match) {
            loadedBrand = match;
          } else {
            // Brand ID provided but not found in API — build from slug
            const brandName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            loadedBrand = {
              id: brandIdParam,
              name: brandName,
              slug,
              tagline: '',
              description: '',
              heroImage: '',
              logoUrl: '',
              heritage: { founded: 0, founder: '', origin: '', story: '' },
              collections: [],
              stories: [],
            };
          }
        } else {
          // No brandId param — try to find brand from real API by matching slug
          try {
            const apiBrands = await getRecommendedBrands();
            const slugMatch = apiBrands.find(b => b.slug === slug);
            if (slugMatch) {
              loadedBrand = slugMatch;
            }
          } catch { /* API failed */ }
          // If not found in API, try mock data
          if (!loadedBrand) {
            const brandRes = await brandService.getBrandBySlug(slug);
            loadedBrand = brandRes.data ?? null;
          }
        }

        if (!loadedBrand) {
          notFound();
          return;
        }

        setBrand(loadedBrand);
        loadedBrandRef.current = loadedBrand;

        // Load products (page 1), stories, and collections from real API
        const [productsResult, brandStories, brandCollections] = await Promise.all([
          getRecommendedProductsPaginated({
            filter_brand_id: loadedBrand.id,
            page_number: 1,
            page_size: PRODUCTS_PER_PAGE,
            disable_personalization: true,
          }),
          searchStories({ brand_id: loadedBrand.id }),
          getCollections(loadedBrand.id),
        ]);

        console.log('[brand-page] Products loaded:', productsResult.products.length, '| total:', productsResult.totalMatched);
        setProducts(productsResult.products);
        setTotalPages(productsResult.totalPages);
        setTotalProducts(productsResult.totalMatched);
        setStories(brandStories);
        setCollections(brandCollections);
      } catch (err) {
        console.error('[brand-page] Error loading data:', err);
        if (!brand) {
          notFound();
        } else {
          setError(err instanceof Error ? err.message : 'Unable to load recommendations.');
        }
      } finally {
        setLoading(false);
        setTimeout(() => setIsLoaded(true), 50);
        // Load shop location and reviews (non-blocking)
        try {
          const allShops = await getAllBrandShops();
          const brandShop = allShops.find(s => s.is_active) || null;
          setShopLocation(brandShop);
        } catch { /* no shops */ }
        try {
          const reviews = getReviewsByBrand();
          setBrandReviews(reviews);
        } catch { /* no reviews */ }
      }
    }

    loadData();
  }, [slug, brandIdParam]);

  // Fetch products when page changes
  useEffect(() => {
    if (!loadedBrandRef.current || currentPage === 1) return;

    async function loadPageProducts() {
      setProductsLoading(true);
      try {
        const result = await getRecommendedProductsPaginated({
          filter_brand_id: loadedBrandRef.current!.id,
          page_number: currentPage,
          page_size: PRODUCTS_PER_PAGE,
          disable_personalization: true,
        });
        setProducts(result.products);
        setTotalPages(result.totalPages);
        setTotalProducts(result.totalMatched);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load products.');
      } finally {
        setProductsLoading(false);
      }
    }

    loadPageProducts();
  }, [currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border border-charcoal-deep/20 border-t-charcoal-deep rounded-full animate-spin" />
          <p className="text-xs tracking-[0.2em] uppercase text-stone">Loading</p>
        </div>
      </div>
    );
  }

  if (!brand) return null;

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* ═══ HERO ═══ */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <ImageWithFallback
          src={brand.heroImage}
          alt={brand.name}
          label={brand.name}
          variant="dark"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-noir/30 to-noir/10" />

        {/* Back Button */}
        <div className="absolute top-8 left-8 z-10">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="tracking-wider">Back</span>
          </button>
        </div>

        <div className={`absolute bottom-0 left-0 right-0 p-8 md:p-16 lg:p-24 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="max-w-[1400px] mx-auto">
            <p className="font-body text-[10px] tracking-[0.5em] uppercase text-white/50 mb-4">
              Ethnic Zone · Grab Your Fashion
            </p>
            <h1 className="font-display text-[clamp(3rem,8vw,7rem)] text-white leading-[0.9] tracking-[-0.03em] mb-4">
              {brand.name}
            </h1>
            <p className="text-lg text-white/70 max-w-xl font-light">
              {brand.tagline}
            </p>
          </div>
        </div>
      </section>

      {/* ═══ HERITAGE ═══ */}
      {(brand.description || brand.heritage.story || brand.heritage.founded > 0) ? (
      <section className={`py-20 lg:py-28 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <span className="font-body text-[10px] tracking-[0.4em] uppercase text-stone block mb-4">
                Heritage
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-charcoal-deep tracking-[-0.02em] mb-8">
                The Story
              </h2>
              <p className="text-stone leading-relaxed text-lg mb-8">
                {brand.description}
              </p>
              <p className="text-stone leading-relaxed">
                {brand.heritage.story}
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <div className="bg-white p-8 border border-sand/30">
                <div className="grid grid-cols-2 gap-8">
                  {brand.heritage.founded > 0 && (
                  <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-stone mb-2">Founded</p>
                    <p className="font-display text-3xl text-charcoal-deep">{brand.heritage.founded}</p>
                  </div>
                  )}
                  {brand.heritage.founder && (
                  <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-stone mb-2">Founder</p>
                    <p className="font-display text-lg text-charcoal-deep">{brand.heritage.founder}</p>
                  </div>
                  )}
                </div>
                {brand.heritage.origin && (
                <div className="mt-8 pt-8 border-t border-sand/30 flex items-center gap-3">
                  <MapPin size={16} className="text-stone" />
                  <p className="text-sm text-charcoal-deep">{brand.heritage.origin}</p>
                </div>
                )}
              </div>
              <div className="bg-white p-8 border border-sand/30">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="font-display text-2xl text-charcoal-deep">{products.length}</p>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-stone mt-1">Pieces</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl text-charcoal-deep">{collections.length}</p>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-stone mt-1">Collections</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl text-charcoal-deep">{stories.length}</p>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-stone mt-1">Stories</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      ) : null}

      {/* ═══ STORE LOCATION ═══ */}
      {shopLocation && (
        <section className={`py-20 lg:py-28 bg-charcoal-deep transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="font-body text-[10px] tracking-[0.4em] uppercase text-white/40 block mb-4">
                  Visit Us
                </span>
                <h2 className="font-display text-3xl md:text-4xl text-ivory-cream tracking-[-0.02em] mb-8">
                  {shopLocation.shop_name || 'Our Store'}
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin size={16} className="text-gold-muted" />
                    </div>
                    <div>
                      <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-2">Address</p>
                      <p className="text-ivory-cream leading-relaxed">
                        {shopLocation.address_line_1}<br />
                        {shopLocation.address_line_2 && <>{shopLocation.address_line_2}<br /></>}
                        {shopLocation.city}, {shopLocation.state}
                        {shopLocation.country && <><br />{shopLocation.country}</>}
                      </p>
                    </div>
                  </div>
                  {shopLocation.opening_hours && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <Clock size={16} className="text-gold-muted" />
                      </div>
                      <div>
                        <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-2">Hours</p>
                        <p className="text-ivory-cream">{shopLocation.opening_hours}</p>
                        <p className="text-white/40 text-sm mt-1">Online appointments available</p>
                      </div>
                    </div>
                  )}
                  {brandReviews.length > 0 && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <Star size={16} className="text-gold-muted" />
                      </div>
                      <div>
                        <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-2">Rating</p>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const avg = brandReviews.reduce((s, r) => s + r.rating, 0) / brandReviews.length;
                            return (
                              <>
                                <span className="font-display text-2xl text-ivory-cream">{avg.toFixed(1)}</span>
                                <div className="flex items-center gap-0.5">
                                  {[1,2,3,4,5].map(i => (
                                    <Star key={i} size={12} className={i <= Math.round(avg) ? 'text-gold-muted fill-gold-muted' : 'text-gold-muted fill-gold-muted/40'} />
                                  ))}
                                </div>
                                <span className="text-sm text-white/40">{brandReviews.length} review{brandReviews.length !== 1 ? 's' : ''}</span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                  {shopLocation.phone && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <Phone size={16} className="text-gold-muted" />
                      </div>
                      <div>
                        <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-2">Phone</p>
                        <p className="text-ivory-cream">{shopLocation.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-10">
                  <a
                    href={`https://maps.google.com/?q=${shopLocation.latitude},${shopLocation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-3 border border-white/20 text-ivory-cream hover:bg-white/10 transition-colors text-sm tracking-[0.15em] uppercase"
                  >
                    <Navigation size={15} />
                    Get Directions
                  </a>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] bg-white/5 border border-white/10 overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2000!2d${shopLocation.longitude}!3d${shopLocation.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin`}
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'grayscale(100%) invert(90%) contrast(80%)' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${shopLocation.shop_name} Location`}
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-20 h-20 border border-gold-muted/20 pointer-events-none" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ PRODUCTS ═══ */}
      {error && (
        <section className="py-20 lg:py-28 bg-white">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 text-center">
            <p className="font-display text-xl text-charcoal-deep mb-3">Unable to load products</p>
            <p className="text-sm text-stone mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 border border-sand text-charcoal-deep text-sm tracking-wide hover:bg-parchment transition-colors"
            >
              Try Again
            </button>
          </div>
        </section>
      )}
      {!error && (products.length > 0 || totalProducts > 0) && (
        <section ref={productsRef} className="py-20 lg:py-28 bg-white">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="font-body text-[10px] tracking-[0.4em] uppercase text-stone block mb-3">
                  The Collection
                </span>
                <h2 className="font-display text-3xl md:text-4xl text-charcoal-deep tracking-[-0.02em]">
                  Pieces by {brand.name}
                </h2>
              </div>
              <span className="text-sm text-stone">{totalProducts} pieces</span>
            </div>

            {/* Products loading overlay */}
            <div className={`relative ${productsLoading ? 'opacity-50 pointer-events-none' : ''}`}>
              {productsLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-8 h-8 border border-charcoal-deep/20 border-t-charcoal-deep rounded-full animate-spin" />
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product, index) => (
                  <Link
                    key={product.id}
                    href={productHref(product.id, product.name)}
                    className="group"
                    onMouseEnter={() => setActiveProductHover(index)}
                    onMouseLeave={() => setActiveProductHover(null)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-parchment mb-3">
                      <ImageWithFallback
                        src={product.images[0]?.url}
                        alt={product.name}
                        label={product.name}
                        variant="light"
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className={`object-cover transition-transform duration-700 ${activeProductHover === index ? 'scale-105' : 'scale-100'}`}
                      />
                    </div>
                    <div>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-stone mb-1">{brand.name}</p>
                      <h3 className="font-display text-base text-charcoal-deep group-hover:text-gold-muted transition-colors leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-sm text-stone mt-1">
                        {product.currency === 'INR' ? '₹' : product.currency === 'EUR' ? '€' : product.currency === 'GBP' ? '£' : '$'}
                        {product.price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex flex-col items-center gap-4">
                <p className="text-sm text-stone">
                  Showing {((currentPage - 1) * PRODUCTS_PER_PAGE) + 1}-{Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts)} of {totalProducts} pieces
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setCurrentPage(p => p - 1); productsRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                    disabled={currentPage === 1 || productsLoading}
                    className="w-10 h-10 rounded-full border border-sand flex items-center justify-center text-charcoal-deep hover:border-charcoal-deep disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Show limited page numbers with ellipsis for many pages */}
                  {(() => {
                    const pages: (number | string)[] = [];
                    if (totalPages <= 7) {
                      // Show all pages if 7 or less
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      // Always show first page
                      pages.push(1);

                      if (currentPage > 3) {
                        pages.push('...');
                      }

                      // Show pages around current page
                      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                        if (!pages.includes(i)) pages.push(i);
                      }

                      if (currentPage < totalPages - 2) {
                        pages.push('...');
                      }

                      // Always show last page
                      if (!pages.includes(totalPages)) pages.push(totalPages);
                    }

                    return pages.map((page, idx) => (
                      typeof page === 'string' ? (
                        <span key={`ellipsis-${idx}`} className="w-10 h-10 flex items-center justify-center text-stone">
                          {page}
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => { setCurrentPage(page); productsRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                          disabled={productsLoading}
                          className={`w-10 h-10 rounded-full text-sm tracking-wider transition-all disabled:cursor-not-allowed ${
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

                  <button
                    onClick={() => { setCurrentPage(p => p + 1); productsRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                    disabled={currentPage === totalPages || productsLoading}
                    className="w-10 h-10 rounded-full border border-sand flex items-center justify-center text-charcoal-deep hover:border-charcoal-deep disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══ COLLECTIONS ═══ */}
      {collections.length > 0 && (
        <section className="py-20 lg:py-28">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
            <div className="mb-12">
              <span className="font-body text-[10px] tracking-[0.4em] uppercase text-stone block mb-3">
                Seasonal Edits
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-charcoal-deep tracking-[-0.02em]">
                Collections
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collection/${collection.slug}?collectionId=${collection.id}&brandId=${brand.id}`}
                  className="group"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-parchment mb-4">
                    <ImageWithFallback
                      src={collection.heroImage}
                      alt={collection.name}
                      label={collection.name}
                      variant="light"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-noir/20 group-hover:bg-noir/10 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-white/60">
                        {collection.season} {collection.year}
                      </p>
                      <h3 className="font-display text-xl text-white mt-1">{collection.name}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ STORIES ═══ */}
      {stories.length > 0 && (
        <section className="py-20 lg:py-28 bg-parchment">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
            <div className="mb-12">
              <span className="font-body text-[10px] tracking-[0.4em] uppercase text-stone block mb-3">
                From the Maison
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-charcoal-deep tracking-[-0.02em]">
                Stories
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/story/${story.slug}?storyId=${story.id}`}
                  className="group bg-white"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <ImageWithFallback
                      src={story.heroImage}
                      alt={story.title}
                      label={story.title}
                      variant="dark"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-stone mb-2 capitalize">
                      {story.type}
                    </p>
                    <h3 className="font-display text-lg text-charcoal-deep group-hover:text-gold-muted transition-colors mb-2">
                      {story.title}
                    </h3>
                    <p className="text-sm text-stone line-clamp-2">{story.excerpt}</p>
                    <div className="flex items-center gap-2 mt-4 text-xs text-stone">
                      <Clock size={12} />
                      <span>{story.readTime} min read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ TESTIMONIALS ═══ */}
      {brandReviews.length > 0 && (
      <section className={`py-20 lg:py-28 bg-white transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="mb-12">
            <span className="font-body text-[10px] tracking-[0.4em] uppercase text-stone block mb-3">
              Client Stories
            </span>
            <div className="flex items-end justify-between">
              <h2 className="font-display text-3xl md:text-4xl text-charcoal-deep tracking-[-0.02em]">
                What Our Clients Say
              </h2>
              {(() => {
                const avg = brandReviews.reduce((s, r) => s + r.rating, 0) / brandReviews.length;
                return (
                  <div className="flex items-center gap-2 pb-1">
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={14} className={i <= Math.round(avg) ? 'text-gold-muted fill-gold-muted' : 'text-gold-muted fill-gold-muted/40'} />
                      ))}
                    </div>
                    <span className="font-display text-2xl text-charcoal-deep">{avg.toFixed(1)}</span>
                    <span className="text-sm text-stone">· {brandReviews.length} Review{brandReviews.length !== 1 ? 's' : ''}</span>
                  </div>
                );
              })()}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brandReviews.slice(0, 6).map((review, index) => (
              <div
                key={index}
                className="bg-parchment/40 p-8 border border-sand/30 hover:border-sand transition-colors group"
              >
                <div className="flex items-center gap-0.5 mb-4">
                  {[1,2,3,4,5].map(i => (
                    <Star
                      key={i}
                      size={12}
                      className={i <= review.rating ? 'text-gold-muted fill-gold-muted' : 'text-sand fill-sand'}
                    />
                  ))}
                </div>
                <p className="text-stone leading-relaxed text-sm mb-2 font-medium text-charcoal-deep">{review.title}</p>
                <p className="text-stone leading-relaxed text-sm mb-6 group-hover:text-charcoal-deep transition-colors">
                  &ldquo;{review.content}&rdquo;
                </p>
                <div className="flex items-end justify-between pt-4 border-t border-sand/30">
                  <div>
                    <p className="font-display text-base text-charcoal-deep">{review.customer_name}</p>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-stone mt-0.5">{review.product_name}</p>
                  </div>
                  <p className="text-xs text-taupe">{new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ═══ STYLING SESSION CTA ═══ */}
      <section className="py-16 bg-parchment">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 bg-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold-soft/20 flex items-center justify-center">
                <Sparkles size={24} className="text-gold-muted" />
              </div>
              <div>
                <h3 className="font-display text-xl text-charcoal-deep">Book a Styling Session</h3>
                <p className="text-sm text-stone mt-1">
                  Get personalized styling advice from {brand.name}&apos;s experts
                </p>
              </div>
            </div>
            <Link
              href={`/profile/styling-sessions?tab=book&brand=${brand.id}`}
              className="inline-flex items-center gap-3 px-8 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.15em] uppercase"
            >
              <Sparkles size={16} />
              Book Session
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 text-center">
          <p className="font-body text-[10px] tracking-[0.4em] uppercase text-stone mb-4">
            Continue Exploring
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-charcoal-deep tracking-[-0.02em] mb-8">
            Discover More Maisons
          </h2>
          <Link
            href="/discover?tab=brands"
            className="inline-flex items-center gap-3 px-10 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.15em] uppercase"
          >
            Explore All Brands
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
