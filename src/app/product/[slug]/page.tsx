'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Share2, Clock, X, Check, HeartOff, Bell, ArrowRight, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { getProductBySlug, brands, products as allProducts } from '@/data/mock-data';
import { notFound } from 'next/navigation';
import { useApp } from '@/context/AppContext';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const product = getProductBySlug(slug);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!product) {
    notFound();
  }

  const {
    addToConsiderations,
    isInConsiderations,
    removeFromConsiderations,
    considerations,
    addRestockAlert,
    hasRestockAlert,
    showToast
  } = useApp();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [sizeError, setSizeError] = useState(false);
  const [activeHover, setActiveHover] = useState<number | null>(null);

  const brand = brands.find(b => b.id === product.brandId);
  const sizeVariants = product.variants.filter(v => v.type === 'size');
  const colorVariants = product.variants.filter(v => v.type === 'color');

  const relatedProducts = allProducts
    .filter(p => p.brandId === product.brandId && p.id !== product.id)
    .slice(0, 4);

  const inConsiderations = isInConsiderations(product.id);
  const considerationItem = considerations.find(c => c.productId === product.id);
  const watchingRestock = hasRestockAlert(product.id);

  const handleAddToConsiderations = () => {
    if (sizeVariants.length > 0 && !selectedSize) {
      setSizeError(true);
      showToast('Please select a size', 'error');
      return;
    }
    setSizeError(false);

    const agiNote = "This piece pairs beautifully with structured tailoring. Based on your style preferences, it would complement your existing wardrobe.";

    addToConsiderations(
      product,
      { size: selectedSize || undefined, color: selectedColor || undefined },
      agiNote
    );
  };

  const handleRemoveFromConsiderations = () => {
    if (considerationItem) {
      removeFromConsiderations(considerationItem.id);
    }
  };

  const handleNotifyRestock = () => {
    addRestockAlert(product, selectedSize || undefined, selectedColor || undefined);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.brandName} - ${product.name}`,
          text: product.tagline,
          url: window.location.href
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard', 'success');
    }
  };

  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* ============================================
          MAIN PRODUCT SECTION
          ============================================ */}
      <section className="max-w-[1800px] mx-auto px-8 md:px-16 lg:px-24 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <div className={`space-y-4 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Main Image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-parchment group">
              <Image
                src={product.images[activeImage]?.url || ''}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700"
                priority
              />

              {/* Limited Badge */}
              {product.availability.status === 'limited' && (
                <div className="absolute top-6 left-6">
                  <span className="text-[9px] tracking-[0.2em] uppercase text-charcoal-deep bg-ivory-cream px-4 py-2">
                    Limited Availability
                  </span>
                </div>
              )}

              {/* Image Navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-ivory-cream/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ChevronLeft size={20} className="text-charcoal-deep" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-ivory-cream/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ChevronRightIcon size={20} className="text-charcoal-deep" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <span className="text-[10px] tracking-[0.3em] uppercase text-charcoal-deep bg-ivory-cream/90 px-4 py-2">
                  {activeImage + 1} / {product.images.length}
                </span>
              </div>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.slice(0, 4).map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setActiveImage(index)}
                    className={`relative aspect-square overflow-hidden transition-all duration-300 ${
                      activeImage === index
                        ? 'ring-1 ring-charcoal-deep'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={`lg:py-8 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Brand & Category */}
            <div className="flex items-center gap-3 mb-6">
              <Link
                href={`/brand/${brand?.slug || ''}`}
                className="text-[10px] tracking-[0.4em] uppercase text-taupe hover:text-charcoal-deep transition-colors"
              >
                {brand?.name}
              </Link>
              <span className="w-6 h-px bg-sand" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-taupe">
                {product.collection || product.category}
              </span>
            </div>

            {/* Product Name */}
            <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] text-charcoal-deep leading-[1] tracking-[-0.02em] mb-3">
              {product.name}
            </h1>
            <p className="text-lg text-stone mb-8">{product.tagline}</p>

            {/* Price */}
            <p className="font-display text-2xl text-charcoal-deep mb-10">
              {product.currency === 'EUR' ? '€' : '$'}{product.price.toLocaleString()}
            </p>

            {/* Narrative */}
            <div className="mb-10 pb-10 border-b border-sand/50">
              <p className="text-stone leading-relaxed">{product.narrative}</p>
            </div>

            {/* Size Selection */}
            {sizeVariants.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <p className={`text-[11px] tracking-[0.3em] uppercase ${sizeError ? 'text-error' : 'text-taupe'}`}>
                    Select Size {sizeError && <span className="text-error">*</span>}
                  </p>
                  <button className="text-xs tracking-[0.15em] uppercase text-stone hover:text-charcoal-deep transition-colors">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizeVariants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedSize(variant.value);
                        setSizeError(false);
                      }}
                      disabled={!variant.available}
                      className={`min-w-[56px] px-4 py-3 text-sm transition-all duration-300 ${
                        selectedSize === variant.value
                          ? 'bg-charcoal-deep text-ivory-cream'
                          : variant.available
                            ? `border border-sand hover:border-charcoal-deep text-charcoal-deep ${sizeError ? 'border-error/50' : ''}`
                            : 'border border-sand/30 text-greige cursor-not-allowed line-through'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
                {sizeError && (
                  <p className="text-xs text-error mt-3">Please select a size to continue</p>
                )}
              </div>
            )}

            {/* Color Selection */}
            {colorVariants.length > 0 && (
              <div className="mb-10">
                <p className="text-[11px] tracking-[0.3em] uppercase text-taupe mb-4">
                  Select Color
                </p>
                <div className="flex flex-wrap gap-3">
                  {colorVariants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedColor(variant.value)}
                      disabled={!variant.available}
                      className={`w-10 h-10 transition-all duration-300 ${
                        selectedColor === variant.value
                          ? 'ring-1 ring-charcoal-deep ring-offset-2'
                          : 'hover:ring-1 hover:ring-sand hover:ring-offset-1'
                      } ${!variant.available ? 'opacity-30 cursor-not-allowed' : ''}`}
                      style={{ backgroundColor: variant.value }}
                      title={variant.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Availability Status */}
            {product.availability.status !== 'available' && (
              <div className="mb-8 p-5 bg-parchment">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`w-2 h-2 rounded-full ${
                    product.availability.status === 'limited' ? 'bg-gold-muted' : 'bg-taupe'
                  }`} />
                  <p className="text-sm font-medium text-charcoal-deep">
                    {product.availability.status === 'limited' ? 'Limited Availability' : 'Currently Unavailable'}
                  </p>
                </div>
                <p className="text-sm text-stone">
                  {product.availability.status === 'limited'
                    ? 'This piece is part of a limited edition. Reserve early to secure your size.'
                    : 'This piece is currently sold out. Request notification when available.'
                  }
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              {inConsiderations ? (
                <button
                  onClick={handleRemoveFromConsiderations}
                  className="group w-full py-4 px-6 bg-charcoal-deep text-ivory-cream flex items-center justify-center gap-3 transition-all duration-300 hover:bg-charcoal-warm"
                >
                  <Check size={18} />
                  <span className="text-sm tracking-[0.15em] uppercase">In Your Considerations</span>
                </button>
              ) : (
                <button
                  onClick={handleAddToConsiderations}
                  className="group w-full py-4 px-6 bg-charcoal-deep text-ivory-cream flex items-center justify-center gap-3 transition-all duration-300 hover:bg-charcoal-warm"
                >
                  <span className="text-sm tracking-[0.15em] uppercase">Add to Considerations</span>
                  <Heart size={18} />
                </button>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleShare}
                  className="flex-1 py-4 px-6 border border-charcoal-deep text-charcoal-deep flex items-center justify-center gap-3 transition-all duration-300 hover:bg-charcoal-deep hover:text-ivory-cream"
                >
                  <Share2 size={16} />
                  <span className="text-sm tracking-[0.15em] uppercase">Share</span>
                </button>

                {watchingRestock ? (
                  <button
                    className="flex-1 py-4 px-6 border border-charcoal-deep bg-charcoal-deep text-ivory-cream flex items-center justify-center gap-3"
                    disabled
                  >
                    <Bell size={16} />
                    <span className="text-sm tracking-[0.15em] uppercase">Watching</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNotifyRestock}
                    className="flex-1 py-4 px-6 border border-charcoal-deep text-charcoal-deep flex items-center justify-center gap-3 transition-all duration-300 hover:bg-charcoal-deep hover:text-ivory-cream"
                  >
                    <Bell size={16} />
                    <span className="text-sm tracking-[0.15em] uppercase">Notify</span>
                  </button>
                )}
              </div>
            </div>

            {/* Style Note */}
            <div className="mt-10 pt-10 border-t border-sand/50">
              <p className="text-[10px] tracking-[0.4em] uppercase text-taupe mb-3">Style Note</p>
              <p className="text-sm text-stone leading-relaxed">
                This piece pairs beautifully with structured tailoring. Consider pairing with
                pieces from the same collection for a cohesive look.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          CRAFTSMANSHIP SECTION
          ============================================ */}
      <section className="bg-charcoal-deep">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid lg:grid-cols-2">
            {/* Image Side */}
            <div className="relative aspect-square lg:aspect-auto">
              <Image
                src={product.images[Math.min(1, product.images.length - 1)]?.url || product.images[0]?.url || ''}
                alt={`${product.name} craftsmanship detail`}
                fill
                className="object-cover"
              />
            </div>

            {/* Content Side */}
            <div className="px-8 md:px-16 lg:px-20 py-16 lg:py-24 flex flex-col justify-center">
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/60 block mb-4">
                The Making
              </span>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1.1] tracking-[-0.02em] mb-6">
                Craftsmanship
              </h2>
              <p className="text-taupe mb-12 max-w-md">
                Each piece reflects generations of expertise and an unwavering commitment to excellence.
              </p>

              {/* Craftsmanship Items */}
              <div className="space-y-8">
                {product.craftsmanship.map((craft, index) => (
                  <div key={index} className="border-l-2 border-gold-soft/30 pl-6">
                    <h3 className="font-display text-xl text-ivory-cream mb-2">{craft.title}</h3>
                    <p className="text-taupe text-sm leading-relaxed mb-4">{craft.description}</p>
                    {craft.duration && (
                      <div className="flex items-center gap-4 text-xs text-stone">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gold-soft/60" />
                          <span>{craft.duration}</span>
                        </div>
                        {craft.artisans && (
                          <span>{craft.artisans} artisan{craft.artisans > 1 ? 's' : ''}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          MATERIALS SECTION
          ============================================ */}
      <section className="bg-parchment">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid lg:grid-cols-2">
            {/* Content Side */}
            <div className="px-8 md:px-16 lg:px-20 py-16 lg:py-24 flex flex-col justify-center order-2 lg:order-1">
              <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-4">
                Materials
              </span>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em] mb-6">
                Exceptional Quality
              </h2>
              <p className="text-stone mb-12 max-w-md">
                Sourced from the finest suppliers, each material is selected for its exceptional quality and character.
              </p>

              {/* Materials List */}
              <div className="space-y-6">
                {product.materials.map((material, index) => (
                  <div key={index} className="flex gap-6 items-start">
                    <span className="text-[10px] tracking-[0.3em] text-taupe mt-1.5 w-6">0{index + 1}</span>
                    <div className="flex-1 pb-6 border-b border-sand/50 last:border-0">
                      <h3 className="font-display text-lg text-charcoal-deep mb-1">{material.name}</h3>
                      <p className="text-sm text-stone mb-3">{material.composition}</p>
                      <div className="flex flex-wrap gap-4 text-[10px] tracking-[0.2em] uppercase text-taupe">
                        <span>{material.origin}</span>
                        {material.sustainability && (
                          <span className="text-gold-deep">{material.sustainability}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Side */}
            <div className="relative aspect-square lg:aspect-auto order-1 lg:order-2">
              <Image
                src={product.images[Math.min(2, product.images.length - 1)]?.url || product.images[0]?.url || ''}
                alt={`${product.name} material detail`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          RELATED PRODUCTS
          ============================================ */}
      {relatedProducts.length > 0 && (
        <section className="py-24 lg:py-32 bg-charcoal-deep">
          <div className="max-w-[1800px] mx-auto px-8 md:px-16 lg:px-24">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16">
              <div>
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50 block mb-3">
                  More from the Maison
                </span>
                <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-ivory-cream leading-[1.1] tracking-[-0.02em]">
                  {brand?.name}
                </h2>
              </div>
              <Link
                href={`/brand/${brand?.slug}`}
                className="group inline-flex items-center gap-3 text-sm tracking-[0.15em] uppercase text-ivory-cream/60 hover:text-ivory-cream transition-colors"
              >
                <span>View All</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-10 md:gap-y-16">
              {relatedProducts.map((item, index) => (
                <Link
                  key={item.id}
                  href={`/product/${item.slug}`}
                  className="group"
                  onMouseEnter={() => setActiveHover(index)}
                  onMouseLeave={() => setActiveHover(null)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-ivory-cream/10 mb-5">
                    <Image
                      src={item.images[0]?.url || ''}
                      alt={item.name}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-105"
                    />

                    {/* Hover Action */}
                    <div className="absolute inset-0 flex items-center justify-center bg-noir/0 group-hover:bg-noir/20 transition-all duration-500">
                      <div className={`w-14 h-14 rounded-full bg-ivory-cream flex items-center justify-center transform transition-all duration-500 ${activeHover === index ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                        <ArrowRight size={18} className="text-charcoal-deep" />
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-1.5">
                    <h3 className="font-display text-lg md:text-xl text-ivory-cream leading-tight group-hover:text-gold-soft transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-taupe">
                      {item.currency === 'EUR' ? '€' : '$'}{item.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          CTA - Continue Exploring
          ============================================ */}
      <section className="py-20 lg:py-28 bg-ivory-cream">
        <div className="max-w-3xl mx-auto px-8 md:px-16 text-center">
          <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-6">
            Continue Your Journey
          </span>
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em] mb-8">
            Explore More Pieces
          </h2>
          <p className="text-stone mb-12 max-w-lg mx-auto">
            Discover exceptional pieces from our curated collection of distinguished maisons.
          </p>
          <Link
            href="/discover"
            className="group inline-flex items-center gap-5"
          >
            <span className="text-sm tracking-[0.2em] uppercase text-charcoal-deep">
              View Collection
            </span>
            <span className="w-14 h-14 rounded-full border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-500">
              <ArrowRight size={18} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors duration-500" />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
