'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Heart, Share2, Sparkles, Eye, ChevronDown, MapPin, Clock, Check, X } from 'lucide-react';
import { getProductBySlug, brands, products as allProducts, getMockAvailabilityIntelligence, getMockOutfits, mockFitConfidence, mockBodyTwin } from '@/data/mock-data';
import { notFound } from 'next/navigation';
import AvailabilityIntelligence from '@/components/product/AvailabilityIntelligence';
import OutfitSuggestions from '@/components/product/OutfitSuggestions';
import FitConfidenceCard from '@/components/product/FitConfidenceCard';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showIV, setShowIV] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const brand = brands.find(b => b.id === product.brandId);
  const sizeVariants = product.variants.filter(v => v.type === 'size');
  const colorVariants = product.variants.filter(v => v.type === 'color');

  const relatedProducts = allProducts
    .filter(p => p.brandId === product.brandId && p.id !== product.id)
    .slice(0, 3);

  // Get mock data for intelligent components
  const availabilityIntelligence = getMockAvailabilityIntelligence(product.id);
  const outfitSuggestions = getMockOutfits(product);

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Back Navigation */}
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12 py-6">
        <Link
          href={`/brand/${brand?.slug || ''}`}
          className="inline-flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep transition-colors"
        >
          <ArrowLeft size={16} />
          Back to {brand?.name}
        </Link>
      </div>

      {/* Main Product Section */}
      <section className="max-w-[1800px] mx-auto px-6 lg:px-12 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-parchment">
              <Image
                src={product.images[activeImage]?.url || ''}
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.availability.status === 'limited' && (
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-2 bg-gold-muted text-noir text-sm tracking-wider uppercase rounded-full">
                    Limited Availability
                  </span>
                </div>
              )}
              {/* IV Button */}
              {product.ivEnabled && (
                <button
                  onClick={() => setShowIV(true)}
                  className="absolute bottom-6 right-6 px-6 py-3 bg-ivory-cream/95 backdrop-blur-sm rounded-full flex items-center gap-2 text-sm font-medium text-charcoal-deep hover:bg-white transition-colors shadow-lg"
                >
                  <Eye size={18} />
                  See How I Look
                </button>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setActiveImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden ${
                      activeImage === index ? 'ring-2 ring-gold-muted' : ''
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
          <div className="lg:py-8">
            {/* Breadcrumb */}
            <p className="text-xs tracking-[0.15em] uppercase text-greige mb-4">
              {brand?.name} / {product.collection || product.category}
            </p>

            <h1 className="font-display text-3xl md:text-4xl text-charcoal-deep mb-2">
              {product.name}
            </h1>
            <p className="text-lg text-stone mb-6">{product.tagline}</p>

            {/* Price */}
            <p className="font-display text-2xl text-charcoal-deep mb-8">
              {product.currency === 'EUR' ? '€' : '$'}{product.price.toLocaleString()}
            </p>

            {/* Narrative */}
            <div className="prose prose-stone mb-10">
              <p className="text-stone leading-relaxed">{product.narrative}</p>
            </div>

            {/* Size Selection */}
            {sizeVariants.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium text-charcoal-deep">Select Size</p>
                  <button className="text-sm text-gold-muted hover:text-gold-deep">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizeVariants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedSize(variant.value)}
                      disabled={!variant.available}
                      className={`px-4 py-2 border rounded-lg text-sm transition-all ${
                        selectedSize === variant.value
                          ? 'border-charcoal-deep bg-charcoal-deep text-ivory-cream'
                          : variant.available
                            ? 'border-sand hover:border-charcoal-deep text-charcoal-deep'
                            : 'border-sand/50 text-greige cursor-not-allowed'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {colorVariants.length > 0 && (
              <div className="mb-8">
                <p className="text-sm font-medium text-charcoal-deep mb-3">Select Color</p>
                <div className="flex flex-wrap gap-3">
                  {colorVariants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedColor(variant.value)}
                      disabled={!variant.available}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === variant.value
                          ? 'border-charcoal-deep ring-2 ring-offset-2 ring-gold-muted'
                          : 'border-transparent hover:border-sand'
                      } ${!variant.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ backgroundColor: variant.value }}
                      title={variant.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Fit Confidence Card */}
            <div className="mb-8">
              <FitConfidenceCard
                fitConfidence={mockFitConfidence}
                bodyTwin={mockBodyTwin}
                selectedSize={selectedSize}
              />
            </div>

            {/* G-SAIL™ Availability Intelligence */}
            <div className="mb-8">
              <AvailabilityIntelligence
                availability={availabilityIntelligence}
                onNotifyRestock={() => alert('You will be notified when this item is back in stock.')}
              />
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button className="btn-primary w-full justify-center">
                Add to Considerations
                <Heart size={18} />
              </button>

              <button className="btn-secondary w-full justify-center">
                <Share2 size={18} />
                Share
              </button>
            </div>

            {/* AGI Note */}
            <div className="mt-8 p-4 bg-sapphire-deep/5 rounded-xl border border-sapphire-subtle/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-sapphire-subtle mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-charcoal-deep mb-1">Fashion Intelligence Note</p>
                  <p className="text-sm text-stone">
                    This piece pairs beautifully with structured tailoring. Based on your style preferences,
                    consider the Bar Jacket for a complete look.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section className="bg-parchment py-20 lg:py-32">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-gold-muted mb-4">The Making</p>
            <h2 className="font-display text-3xl md:text-4xl text-charcoal-deep">
              Craftsmanship
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {product.craftsmanship.map((craft, index) => (
              <div key={index} className="bg-white p-8 rounded-xl">
                <h3 className="font-display text-xl text-charcoal-deep mb-3">{craft.title}</h3>
                <p className="text-stone text-sm mb-4">{craft.description}</p>
                {craft.duration && (
                  <div className="flex items-center gap-2 text-sm text-greige">
                    <Clock size={14} />
                    <span>{craft.duration}</span>
                    {craft.artisans && <span>• {craft.artisans} artisan{craft.artisans > 1 ? 's' : ''}</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <section className="py-20 lg:py-32 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-gold-muted mb-4">Materials</p>
              <h2 className="font-display text-3xl md:text-4xl text-charcoal-deep mb-8">
                Exceptional Quality
              </h2>

              <div className="space-y-6">
                {product.materials.map((material, index) => (
                  <div key={index} className="border-b border-sand pb-6">
                    <h3 className="font-display text-lg text-charcoal-deep mb-2">{material.name}</h3>
                    <p className="text-sm text-stone mb-2">{material.composition}</p>
                    <div className="flex gap-4 text-xs text-greige">
                      <span>Origin: {material.origin}</span>
                      {material.sustainability && <span>{material.sustainability}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-square rounded-xl overflow-hidden">
              <Image
                src={product.images[1]?.url || product.images[0]?.url || ''}
                alt="Material detail"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Outfit Suggestions - Complete the Look */}
      <OutfitSuggestions product={product} outfits={outfitSuggestions} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-20 bg-parchment px-6 lg:px-12">
          <div className="max-w-[1800px] mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs tracking-[0.3em] uppercase text-gold-muted mb-4">Complete the Look</p>
              <h2 className="font-display text-3xl text-charcoal-deep">
                From {brand?.name}
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.slug}`}
                  className="group"
                >
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4 bg-white">
                    <Image
                      src={item.images[0]?.url || ''}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="font-display text-lg text-charcoal-deep group-hover:text-gold-deep transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-stone">
                    {item.currency === 'EUR' ? '€' : '$'}{item.price.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* IV Modal */}
      {showIV && (
        <div className="fixed inset-0 z-[100] bg-noir/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-sand">
              <div>
                <h3 className="font-display text-xl text-charcoal-deep">Immersive Visualization</h3>
                <p className="text-sm text-greige">See how this piece looks on you</p>
              </div>
              <button
                onClick={() => setShowIV(false)}
                className="p-2 hover:bg-parchment rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Visualization Options */}
                <div>
                  <p className="text-sm font-medium text-charcoal-deep mb-4">Choose visualization style</p>
                  <div className="space-y-3">
                    {[
                      { title: 'Style Archetype', desc: 'Visualize on a similar silhouette' },
                      { title: 'My Body Twin', desc: 'Use your saved measurements' },
                      { title: 'Context Simulation', desc: 'See in different settings' }
                    ].map((option, index) => (
                      <button
                        key={index}
                        className="w-full p-4 text-left border border-sand rounded-xl hover:border-gold-muted transition-colors"
                      >
                        <p className="font-medium text-charcoal-deep">{option.title}</p>
                        <p className="text-sm text-stone">{option.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-parchment rounded-xl p-8 flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <div className="w-32 h-48 bg-sand/50 rounded-lg mx-auto mb-6 flex items-center justify-center">
                      <Eye size={32} className="text-greige" />
                    </div>
                    <p className="text-sm text-stone">Select a visualization option to begin</p>
                  </div>
                </div>
              </div>

              {/* AGI Assessment */}
              <div className="mt-8 p-4 bg-sapphire-deep/5 rounded-xl">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-sapphire-subtle mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-charcoal-deep mb-1">AGI Assessment</p>
                    <p className="text-sm text-stone">
                      Based on your style profile, this piece would complement your existing wardrobe.
                      The {selectedSize || 'selected'} size appears optimal for your proportions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-4 p-6 border-t border-sand">
              <button
                onClick={() => setShowIV(false)}
                className="btn-secondary flex-1 justify-center"
              >
                Continue Exploring
              </button>
              <button
                onClick={() => {
                  setShowIV(false);
                  // Add to considerations
                }}
                className="btn-primary flex-1 justify-center"
              >
                Add to Considerations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
