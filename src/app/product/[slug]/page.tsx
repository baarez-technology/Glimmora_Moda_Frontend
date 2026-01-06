'use client';

import { use, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Share2, Clock, X, Check, Bell, ArrowRight, ChevronLeft, ChevronRight as ChevronRightIcon, Eye, Sparkles, Globe, User, MessageCircle, Truck, Shield, Leaf, Users, TrendingUp } from 'lucide-react';
import { getProductBySlug, brands, products as allProducts } from '@/data/mock-data';
import { notFound } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import AvailabilityIntelligence from '@/components/product/AvailabilityIntelligence';
import ImmersiveVisualization from '@/components/product/ImmersiveVisualization';
import FitConfidenceCard from '@/components/product/FitConfidenceCard';
import OutfitSuggestions from '@/components/product/OutfitSuggestions';
import type { AvailabilityIntelligence as AvailabilityIntelligenceType, FitConfidence, CompleteOutfit, DigitalBodyTwin, FashionIdentity } from '@/types';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const product = getProductBySlug(slug);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);

    // Load Body Twin from localStorage
    const storedBodyTwin = localStorage.getItem('moda-body-twin');
    if (storedBodyTwin) {
      try {
        setBodyTwin(JSON.parse(storedBodyTwin));
      } catch (e) {
        console.error('Failed to parse body twin:', e);
      }
    }

    // Load Fashion Identity from localStorage
    const storedIdentity = localStorage.getItem('moda-fashion-identity');
    if (storedIdentity) {
      try {
        setFashionIdentity(JSON.parse(storedIdentity));
      } catch (e) {
        console.error('Failed to parse fashion identity:', e);
      }
    }
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
    showToast,
    wardrobe
  } = useApp();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [sizeError, setSizeError] = useState(false);
  const [activeHover, setActiveHover] = useState<number | null>(null);
  const [showIV, setShowIV] = useState(false);
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [bodyTwin, setBodyTwin] = useState<DigitalBodyTwin | null>(null);
  const [fashionIdentity, setFashionIdentity] = useState<FashionIdentity | null>(null);
  const [showConcierge, setShowConcierge] = useState(false);

  const brand = brands.find(b => b.id === product.brandId);
  const sizeVariants = product.variants.filter(v => v.type === 'size');
  const colorVariants = product.variants.filter(v => v.type === 'color');

  // Generate G-SAIL™ Availability Intelligence
  const availabilityIntelligence: AvailabilityIntelligenceType = useMemo(() => ({
    productId: product.id,
    currentStatus: product.availability.status,
    localConfidence: product.availability.regions[0]?.confidence || 85,
    alternatives: [
      ...product.availability.regions
        .filter(r => r.available)
        .map(r => ({
          type: 'geography' as const,
          region: r.region,
          city: r.city,
          availabilityConfidence: r.confidence,
          deliveryDays: r.deliveryDays,
          priceDifference: r.region === 'Americas' ? 150 : r.region === 'Asia' ? 80 : 0,
          reason: `Available at ${product.brandName} ${r.city} boutique with ${r.confidence}% confidence`
        })),
      // Add equivalent alternatives
      ...allProducts
        .filter(p => p.brandId === product.brandId && p.id !== product.id && p.category === product.category)
        .slice(0, 2)
        .map(p => ({
          type: 'equivalent' as const,
          availabilityConfidence: 95,
          reason: `Similar style from ${p.brandName} with comparable craftsmanship`,
          product: p
        }))
    ],
    restockPrediction: product.availability.status === 'unavailable' ? {
      estimatedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      probability: 78
    } : undefined,
    conciergeOption: product.availability.status !== 'available'
  }), [product]);

  // Generate Fit Confidence data
  const fitConfidence: FitConfidence = useMemo(() => {
    const suggestedSize = sizeVariants.find(v => v.available)?.value || 'M';
    return {
      overallScore: 87,
      suggestedSize,
      breakdown: {
        sizeMatch: 92,
        styleMatch: 85,
        proportionMatch: 84
      },
      sizeNotes: [
        'Runs true to size based on brand standards',
        'Structured fit that defines the silhouette',
        product.category === 'clothing' ? 'Consider sizing up for layering' : 'Standard dimensions for this style'
      ],
      returnRisk: 'low',
      recommendation: `Based on the ${product.brandName} fit profile, ${suggestedSize} will provide the intended silhouette. The ${product.materials[0]?.name || 'fabric'} has minimal stretch, so accurate sizing ensures optimal drape and comfort.`
    };
  }, [product, sizeVariants]);

  // Generate Outfit Suggestions
  const outfitSuggestions: CompleteOutfit[] = useMemo(() => {
    const complementaryProducts = allProducts
      .filter(p => p.id !== product.id && p.category !== product.category)
      .slice(0, 8);

    return [
      {
        id: 'outfit-1',
        name: 'Power Evening',
        occasion: 'Gallery Opening',
        description: 'A sophisticated ensemble for cultural events where understated elegance speaks volumes.',
        items: [
          { type: 'suggested', productId: product.id, product, category: product.category, note: 'The focal point' },
          ...(complementaryProducts[0] ? [{ type: 'suggested' as const, productId: complementaryProducts[0].id, product: complementaryProducts[0], category: complementaryProducts[0].category }] : []),
          ...(complementaryProducts[1] ? [{ type: 'suggested' as const, productId: complementaryProducts[1].id, product: complementaryProducts[1], category: complementaryProducts[1].category }] : [])
        ].filter(Boolean),
        compatibilityScore: 94,
        totalPrice: product.price + (complementaryProducts[0]?.price || 0) + (complementaryProducts[1]?.price || 0),
        agiReasoning: `This combination leverages the structural elegance of the ${product.name} as the centerpiece. The proportions create visual harmony while maintaining the sophisticated aesthetic ${product.brandName} is known for.`
      },
      {
        id: 'outfit-2',
        name: 'Refined Professional',
        occasion: 'Business Meeting',
        description: 'Command attention while maintaining impeccable taste in professional settings.',
        items: [
          { type: 'suggested', productId: product.id, product, category: product.category },
          ...(complementaryProducts[2] ? [{ type: 'suggested' as const, productId: complementaryProducts[2].id, product: complementaryProducts[2], category: complementaryProducts[2].category }] : []),
          ...(complementaryProducts[3] ? [{ type: 'suggested' as const, productId: complementaryProducts[3].id, product: complementaryProducts[3], category: complementaryProducts[3].category }] : [])
        ].filter(Boolean),
        compatibilityScore: 89,
        totalPrice: product.price + (complementaryProducts[2]?.price || 0) + (complementaryProducts[3]?.price || 0),
        agiReasoning: `The ${product.name} anchors this professional look with authority. The complementary pieces maintain the refined aesthetic while ensuring versatility across formal settings.`
      }
    ];
  }, [product]);

  // Calculate personalization match score based on Fashion Identity
  const personalizationMatch = useMemo(() => {
    if (!fashionIdentity) return null;

    let score = 0;
    let reasons: string[] = [];

    // Check occasion match
    const productOccasions = product.tags.map(t => t.toLowerCase());
    const userOccasions = fashionIdentity.occasions.map(o => o.toLowerCase());
    const occasionMatch = productOccasions.some(po =>
      userOccasions.some(uo => po.includes(uo) || uo.includes(po))
    );
    if (occasionMatch) {
      score += 30;
      reasons.push('Matches your occasions');
    }

    // Check aesthetic match
    const userAesthetics = fashionIdentity.aesthetics.map(a => a.toLowerCase());
    const aestheticMatch = product.tags.some(t =>
      userAesthetics.some(a => t.toLowerCase().includes(a) || a.includes(t.toLowerCase()))
    );
    if (aestheticMatch) {
      score += 35;
      reasons.push('Aligns with your aesthetic');
    }

    // Check budget alignment
    const budgetRanges: Record<string, [number, number]> = {
      'Accessible Luxury': [500, 2000],
      'Premium': [2000, 5000],
      'High Luxury': [5000, 15000],
      'Ultra Luxury': [15000, Infinity]
    };
    const userBudget = budgetRanges[fashionIdentity.budgetRange] || [0, Infinity];
    if (product.price >= userBudget[0] && product.price <= userBudget[1]) {
      score += 20;
      reasons.push('Within your investment range');
    }

    // Brand affinity bonus
    score += 15; // Base compatibility

    return {
      score: Math.min(score, 100),
      reasons,
      wardrobeItems: wardrobe.filter(w =>
        w.product.brandId === product.brandId ||
        w.product.tags.some(t => product.tags.includes(t))
      ).length
    };
  }, [fashionIdentity, product, wardrobe]);

  // Social proof data (would come from analytics in production)
  const socialProof = useMemo(() => ({
    viewingNow: Math.floor(Math.random() * 8) + 3,
    recentPurchases: [
      { city: 'Paris', timeAgo: '2 hours ago' },
      { city: 'Dubai', timeAgo: '5 hours ago' },
      { city: 'New York', timeAgo: '1 day ago' }
    ].slice(0, Math.floor(Math.random() * 2) + 1),
    considerationCount: Math.floor(Math.random() * 50) + 20
  }), []);

  // Delivery estimation
  const deliveryEstimate = useMemo(() => {
    const today = new Date();
    const standardDays = 5 + Math.floor(Math.random() * 3);
    const expressDays = 2 + Math.floor(Math.random() * 2);

    const standardDate = new Date(today);
    standardDate.setDate(today.getDate() + standardDays);

    const expressDate = new Date(today);
    expressDate.setDate(today.getDate() + expressDays);

    return {
      standard: {
        date: standardDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        label: 'Complimentary Delivery'
      },
      express: {
        date: expressDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        label: 'Express Delivery',
        price: 45
      },
      whiteGlove: {
        label: 'White Glove Service',
        description: 'Personal delivery with fitting consultation',
        price: 150
      }
    };
  }, []);

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

              {/* Social Proof Badge */}
              <div className="absolute top-6 right-6 flex flex-col gap-2">
                <div className="bg-ivory-cream/95 backdrop-blur-sm px-4 py-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] tracking-[0.1em] text-charcoal-deep">
                    {socialProof.viewingNow} viewing now
                  </span>
                </div>
                {socialProof.recentPurchases.length > 0 && (
                  <div className="bg-ivory-cream/95 backdrop-blur-sm px-4 py-2">
                    <span className="text-[10px] tracking-[0.1em] text-stone">
                      Acquired in {socialProof.recentPurchases[0].city} · {socialProof.recentPurchases[0].timeAgo}
                    </span>
                  </div>
                )}
              </div>

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
            <p className="font-display text-2xl text-charcoal-deep mb-4">
              {product.currency === 'EUR' ? '€' : '$'}{product.price.toLocaleString()}
            </p>

            {/* Personalization Badge */}
            {personalizationMatch && personalizationMatch.score >= 50 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-gold-muted/10 to-transparent border-l-2 border-gold-muted">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-gold-muted" />
                    <span className="text-sm font-medium text-charcoal-deep">
                      {personalizationMatch.score}% Match for You
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {personalizationMatch.reasons.map((reason, i) => (
                    <span key={i} className="text-[10px] tracking-[0.1em] text-stone bg-ivory-cream px-2 py-1">
                      {reason}
                    </span>
                  ))}
                  {personalizationMatch.wardrobeItems > 0 && (
                    <span className="text-[10px] tracking-[0.1em] text-gold-deep bg-gold-muted/10 px-2 py-1">
                      Complements {personalizationMatch.wardrobeItems} wardrobe item{personalizationMatch.wardrobeItems > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* No Profile CTA */}
            {!fashionIdentity && (
              <Link
                href="/profile/style"
                className="mb-6 p-4 bg-parchment flex items-center justify-between group hover:bg-champagne/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User size={16} className="text-taupe" />
                  <span className="text-sm text-stone">Set up your Style Profile for personalized matches</span>
                </div>
                <ArrowRight size={14} className="text-taupe group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

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

            {/* IV™ Button - See How It Looks */}
            {product.ivEnabled && (
              <button
                onClick={() => setShowIV(true)}
                className="w-full mb-6 py-4 px-6 border border-gold-muted text-charcoal-deep flex items-center justify-center gap-3 transition-all duration-300 hover:bg-gold-muted/10 group"
              >
                <Eye size={18} className="text-gold-muted" />
                <span className="text-sm tracking-[0.15em] uppercase">See How It Looks</span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-gold-muted ml-2">IV™</span>
              </button>
            )}

            {/* Intelligence Panel Toggle */}
            <button
              onClick={() => setShowIntelligence(!showIntelligence)}
              className="w-full mb-6 py-4 px-6 bg-sapphire-deep/5 border border-sapphire-subtle/20 text-charcoal-deep flex items-center justify-between transition-all duration-300 hover:bg-sapphire-deep/10"
            >
              <div className="flex items-center gap-3">
                <Sparkles size={18} className="text-sapphire-subtle" />
                <span className="text-sm tracking-[0.1em]">Fashion Intelligence</span>
              </div>
              <span className="text-xs text-stone">
                {showIntelligence ? 'Hide' : 'Show Details'}
              </span>
            </button>

            {/* Intelligence Panel - Expandable */}
            {showIntelligence && (
              <div className="mb-8 space-y-4 animate-slide-up">
                {/* G-SAIL™ Availability */}
                <AvailabilityIntelligence
                  availability={availabilityIntelligence}
                  onNotifyRestock={handleNotifyRestock}
                />

                {/* Fit Confidence */}
                {sizeVariants.length > 0 && (
                  <FitConfidenceCard
                    fitConfidence={fitConfidence}
                    bodyTwin={bodyTwin}
                    selectedSize={selectedSize}
                  />
                )}
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

            {/* Quick Concierge */}
            <button
              onClick={() => setShowConcierge(true)}
              className="w-full mt-6 py-4 px-6 border border-dashed border-taupe/30 text-charcoal-deep flex items-center justify-center gap-3 transition-all duration-300 hover:border-charcoal-deep hover:bg-parchment group"
            >
              <MessageCircle size={18} className="text-taupe group-hover:text-charcoal-deep transition-colors" />
              <span className="text-sm tracking-[0.1em]">Questions about this piece?</span>
              <span className="text-[10px] tracking-[0.15em] uppercase text-taupe group-hover:text-charcoal-deep transition-colors">Ask Concierge</span>
            </button>

            {/* Delivery & Services */}
            <div className="mt-10 pt-10 border-t border-sand/50">
              <p className="text-[10px] tracking-[0.4em] uppercase text-taupe mb-6">Delivery & Services</p>

              <div className="space-y-4">
                {/* Standard Delivery */}
                <div className="flex items-start gap-4">
                  <Truck size={18} className="text-stone mt-0.5" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-charcoal-deep">{deliveryEstimate.standard.label}</p>
                      <span className="text-xs text-gold-deep">Free</span>
                    </div>
                    <p className="text-xs text-stone">Arrives by {deliveryEstimate.standard.date}</p>
                  </div>
                </div>

                {/* Express Delivery */}
                <div className="flex items-start gap-4">
                  <Truck size={18} className="text-stone mt-0.5" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-charcoal-deep">{deliveryEstimate.express.label}</p>
                      <span className="text-xs text-stone">+${deliveryEstimate.express.price}</span>
                    </div>
                    <p className="text-xs text-stone">Arrives by {deliveryEstimate.express.date}</p>
                  </div>
                </div>

                {/* White Glove */}
                <div className="flex items-start gap-4 p-3 bg-parchment -mx-3">
                  <Shield size={18} className="text-gold-muted mt-0.5" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-charcoal-deep">{deliveryEstimate.whiteGlove.label}</p>
                      <span className="text-xs text-stone">+${deliveryEstimate.whiteGlove.price}</span>
                    </div>
                    <p className="text-xs text-stone">{deliveryEstimate.whiteGlove.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Care & Longevity */}
            <div className="mt-8 pt-8 border-t border-sand/50">
              <p className="text-[10px] tracking-[0.4em] uppercase text-taupe mb-6">Care & Longevity</p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Leaf size={18} className="text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-charcoal-deep">Designed to Last</p>
                    <p className="text-xs text-stone">With proper care, this piece will maintain its beauty for decades</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Shield size={18} className="text-stone mt-0.5" />
                  <div>
                    <p className="text-sm text-charcoal-deep">Restoration Services</p>
                    <p className="text-xs text-stone">{brand?.name} offers lifetime repair and restoration</p>
                  </div>
                </div>

                <div className="p-4 bg-parchment">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Care Instructions</p>
                  <ul className="text-xs text-stone space-y-1">
                    {product.category === 'bags' ? (
                      <>
                        <li>• Store in provided dust bag when not in use</li>
                        <li>• Avoid prolonged exposure to direct sunlight</li>
                        <li>• Clean with soft, dry cloth</li>
                      </>
                    ) : product.category === 'clothing' ? (
                      <>
                        <li>• Dry clean only recommended</li>
                        <li>• Store on padded hanger</li>
                        <li>• Steam to remove wrinkles, avoid direct iron</li>
                      </>
                    ) : (
                      <>
                        <li>• Store in original packaging</li>
                        <li>• Clean with appropriate materials</li>
                        <li>• Handle with care to preserve finish</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="mt-8 pt-8 border-t border-sand/50">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Shield size={20} className="mx-auto text-taupe mb-2" />
                  <p className="text-[10px] tracking-[0.1em] uppercase text-stone">Authenticated</p>
                </div>
                <div>
                  <TrendingUp size={20} className="mx-auto text-taupe mb-2" />
                  <p className="text-[10px] tracking-[0.1em] uppercase text-stone">Free Returns</p>
                </div>
                <div>
                  <Globe size={20} className="mx-auto text-taupe mb-2" />
                  <p className="text-[10px] tracking-[0.1em] uppercase text-stone">Global Delivery</p>
                </div>
              </div>
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
          COMPLETE THE LOOK - Outfit Suggestions
          ============================================ */}
      <OutfitSuggestions product={product} outfits={outfitSuggestions} />

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

      {/* IV™ Immersive Visualization Modal */}
      <ImmersiveVisualization
        product={product}
        isOpen={showIV}
        onClose={() => setShowIV(false)}
        bodyTwin={bodyTwin}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
      />

      {/* Product Concierge Panel */}
      {showConcierge && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-noir/60 backdrop-blur-sm"
            onClick={() => setShowConcierge(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-lg bg-ivory-cream max-h-[80vh] overflow-hidden animate-slide-up sm:rounded-none">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-sand/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-charcoal-deep rounded-full flex items-center justify-center">
                  <Sparkles size={16} className="text-gold-soft" />
                </div>
                <div>
                  <p className="font-display text-lg text-charcoal-deep">Concierge</p>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe">Product Specialist</p>
                </div>
              </div>
              <button
                onClick={() => setShowConcierge(false)}
                className="w-10 h-10 flex items-center justify-center hover:bg-parchment transition-colors"
              >
                <X size={20} className="text-stone" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-stone text-sm leading-relaxed">
                I&apos;m here to help you with the <span className="font-medium text-charcoal-deep">{product.name}</span> from {brand?.name}.
              </p>

              {/* Quick Questions */}
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-3">Common Questions</p>
                <div className="space-y-2">
                  {[
                    { q: 'Will this fit me?', a: `Based on ${brand?.name}'s sizing, this piece ${sizeVariants.length > 0 ? `runs ${fitConfidence.sizeNotes[0]?.toLowerCase() || 'true to size'}` : 'follows standard luxury sizing'}. ${bodyTwin ? 'With your Body Twin data, I can provide a more precise recommendation.' : 'Set up your Body Twin for personalized fit predictions.'}` },
                    { q: 'How does this compare to similar pieces?', a: `The ${product.name} distinguishes itself through ${product.craftsmanship[0]?.title || 'exceptional craftsmanship'}. ${product.materials[0]?.name ? `The ${product.materials[0].name} from ${product.materials[0].origin} ensures longevity.` : ''}` },
                    { q: 'What occasions is this best for?', a: `This piece excels for ${product.tags.slice(0, 2).join(' and ').toLowerCase() || 'versatile'} occasions. ${personalizationMatch && personalizationMatch.score >= 50 ? `Based on your style profile, it's a ${personalizationMatch.score}% match for your lifestyle.` : ''}` },
                    { q: 'What should I pair this with?', a: `For a cohesive look, consider pieces with similar ${product.tags[0]?.toLowerCase() || 'refined'} aesthetic. ${relatedProducts.length > 0 ? `The ${relatedProducts[0].name} from the same maison would complement beautifully.` : ''}` }
                  ].map((item, i) => (
                    <details key={i} className="group border border-sand/50 hover:border-charcoal-deep/30 transition-colors">
                      <summary className="p-4 cursor-pointer flex items-center justify-between text-sm text-charcoal-deep">
                        <span>{item.q}</span>
                        <ArrowRight size={14} className="text-taupe group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="px-4 pb-4 text-sm text-stone leading-relaxed border-t border-sand/30 pt-3">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              {/* Body Twin Prompt */}
              {!bodyTwin && (
                <Link
                  href="/profile/body-twin"
                  className="block p-4 bg-parchment hover:bg-champagne/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-taupe" />
                    <div className="flex-1">
                      <p className="text-sm text-charcoal-deep">Set up Body Twin</p>
                      <p className="text-xs text-stone">Get personalized fit recommendations</p>
                    </div>
                    <ArrowRight size={14} className="text-taupe" />
                  </div>
                </Link>
              )}

              {/* Request Appointment */}
              <div className="pt-4 border-t border-sand/50">
                <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">Need more help?</p>
                <button className="w-full py-3 px-4 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] hover:bg-charcoal-warm transition-colors">
                  Schedule Virtual Appointment
                </button>
                <p className="text-[10px] text-center text-stone mt-2">
                  Speak with a {brand?.name} specialist
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
