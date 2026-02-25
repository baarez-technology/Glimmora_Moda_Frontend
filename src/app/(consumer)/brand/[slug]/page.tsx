'use client';

import { use, useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MapPin, Clock, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import * as brandService from '@/services/brand.service';
import * as collectionService from '@/services/collection.service';
import { getRecommendedProducts, getRecommendedBrands } from '@/services/recommendation.service';
import { notFound } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import type { Product, Brand, BrandStory, Collection } from '@/types';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export default function BrandPage({ params }: BrandPageProps) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const brandIdParam = searchParams.get('brandId');
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stories, setStories] = useState<BrandStory[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeProductHover, setActiveProductHover] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 20;
  const productsRef = useRef<HTMLElement>(null);

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
          // No brandId param — fall back to mock data lookup
          const brandRes = await brandService.getBrandBySlug(slug);
          loadedBrand = brandRes.data ?? null;
        }

        if (!loadedBrand) {
          notFound();
          return;
        }

        setBrand(loadedBrand);

        // Load products from real API, stories/collections from mock
        const [recommendedProducts, storiesRes, collectionsRes] = await Promise.all([
          getRecommendedProducts({ filter_brand_id: loadedBrand.id }),
          brandService.getStoriesByBrand(loadedBrand.id),
          collectionService.getCollectionsByBrand(loadedBrand.id),
        ]);

        setProducts(recommendedProducts);
        setStories(storiesRes.data ?? []);
        setCollections(collectionsRes.data ?? []);
      } catch (err) {
        if (!brand) {
          notFound();
        } else {
          setError(err instanceof Error ? err.message : 'Unable to load recommendations.');
        }
      } finally {
        setLoading(false);
        setTimeout(() => setIsLoaded(true), 50);
      }
    }

    loadData();
  }, [slug, brandIdParam]);

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
        {brand.heroImage ? (
          <Image
            src={brand.heroImage}
            alt={brand.name}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-charcoal-deep" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-noir/30 to-noir/10" />

        {/* Back Button */}
        <div className="absolute top-8 left-8 z-10">
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="tracking-wider">Back</span>
          </Link>
        </div>

        <div className={`absolute bottom-0 left-0 right-0 p-8 md:p-16 lg:p-24 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="max-w-[1400px] mx-auto">
            <p className="font-body text-[10px] tracking-[0.5em] uppercase text-white/50 mb-4">
              The House of
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
      {!error && products.length > 0 && (() => {
        const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
        const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const paginatedProducts = products.slice(start, start + PRODUCTS_PER_PAGE);

        return (
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
                <span className="text-sm text-stone">{products.length} pieces</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {paginatedProducts.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="group"
                    onMouseEnter={() => setActiveProductHover(index)}
                    onMouseLeave={() => setActiveProductHover(null)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-parchment mb-3">
                      <Image
                        src={product.images[0]?.url}
                        alt={product.name}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-3">
                  <button
                    onClick={() => { setCurrentPage(p => p - 1); productsRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-full border border-sand flex items-center justify-center text-charcoal-deep hover:border-charcoal-deep disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => { setCurrentPage(page); productsRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                      className={`w-10 h-10 rounded-full text-sm tracking-wider transition-all ${
                        currentPage === page
                          ? 'bg-charcoal-deep text-ivory-cream'
                          : 'border border-sand text-charcoal-deep hover:border-charcoal-deep'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => { setCurrentPage(p => p + 1); productsRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-full border border-sand flex items-center justify-center text-charcoal-deep hover:border-charcoal-deep disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </section>
        );
      })()}

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
                  href={`/collection/${collection.slug}`}
                  className="group"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-parchment mb-4">
                    <Image
                      src={collection.heroImage}
                      alt={collection.name}
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
                  href={`/story/${story.slug}`}
                  className="group bg-white"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={story.heroImage}
                      alt={story.title}
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
            href="/discover"
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
