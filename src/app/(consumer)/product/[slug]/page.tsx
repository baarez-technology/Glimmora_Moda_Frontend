'use client';

import { use, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import * as productService from '@/services/product.service';
import { getProductDetail, getRecommendedBrands, getProductAIInsights, type ProductAIInsights } from '@/services/recommendation.service';
import OutfitSuggestions from '@/components/product/OutfitSuggestions';
import FitConfidenceCard from '@/components/product/FitConfidenceCard';
import { useProductPageState, useProductIntelligence } from './hooks/useProductPageState';
import {
  ProductGallery,
  ProductInfo,
  ProductVariants,
  ProductActions,
  ProductDelivery,
  ProductCraftsmanship,
  ProductMaterials,
  ProductRelated,
  ProductConcierge,
  ProductIntelligencePanel,
  PdpIntelligenceHero,
  PdpTryOnPromote,
  PdpCompleteLookCollapsed,
  PdpSilentCartButton,
} from './components';
import type { Product } from '@/types';

// Lazy-load heavy modal components (only loaded when user clicks the button)
const ImmersiveVisualization = dynamic(
  () => import('@/components/product/ImmersiveVisualization'),
  { ssr: false }
);
const BodyVisualization = dynamic(
  () => import('@/components/product/BodyVisualization'),
  { ssr: false }
);
const VirtualTryOnModal = dynamic(
  () => import('./components/VirtualTryOnModal'),
  { ssr: false }
);

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

function ProductPageContent({ product, aiInsights }: { product: Product; aiInsights?: ProductAIInsights | null }) {
  // Use custom hooks for state management
  const state = useProductPageState({ product });

  // Use separate hook for computed intelligence data
  const intelligence = useProductIntelligence({
    product,
    sizeVariants: state.sizeVariants,
    fashionIdentity: state.fashionIdentity,
    wardrobe: state.wardrobe,
    brand: state.brand,
    allProducts: state.allProducts,
    showIntelligence: state.showIntelligence
  });

  // Override materialFeel with AI insights data when available
  const materialFeel = useMemo(() => {
    const mf = aiInsights?.material_feel;
    if (!mf) return intelligence.materialFeel;
    return {
      productId: product.id,
      texture: mf.texture || 'smooth',
      weight: mf.weight || 'medium',
      temperature: mf.temperature || 'neutral',
      comfort: mf.comfort || 'Comfortable',
      aging: mf.aging || 'gracefully',
      sensoryHighlights: mf.sensory_highlights || [],
      agiDescription: mf.agi_description || '',
    };
  }, [aiInsights, intelligence.materialFeel, product.id]);

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Main Product Section */}
      <section className="max-w-[1800px] mx-auto px-8 md:px-16 lg:px-24 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <ProductGallery
            product={product}
            images={state.displayImages}
            activeImage={state.activeImage}
            setActiveImage={state.setActiveImage}
            onPrev={state.prevImage}
            onNext={state.nextImage}
            isLoaded={state.isLoaded}
          />

          {/* Product Details */}
          <div className={`lg:py-8 transition-all duration-1000 delay-200 ${state.isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <ProductInfo
              product={product}
              brand={state.brand}
              personalizationMatch={intelligence.personalizationMatch}
              fashionIdentity={state.fashionIdentity}
            />

            {/* ── P1: Intelligence-led PDP rework ────────────────────────────
                  Promote Body-Twin sizing into the customer's eyeline
                  (above variant selection) so USP 10 stops being hidden. */}
            <PdpIntelligenceHero
              productSlug={product.slug}
              fitConfidence={intelligence.fitConfidence}
              bodyTwin={state.bodyTwin}
              expandedDetail={
                intelligence.fitConfidence ? (
                  <FitConfidenceCard
                    fitConfidence={intelligence.fitConfidence}
                    bodyTwin={state.bodyTwin}
                    selectedSize={state.selectedSize}
                  />
                ) : undefined
              }
            />

            <ProductVariants
              sizeVariants={state.sizeVariants}
              colorVariants={state.colorVariants}
              selectedSize={state.selectedSize}
              selectedColor={state.selectedColor}
              sizeError={state.sizeError}
              colorError={state.colorError}
              quantity={state.quantity}
              onSizeSelect={state.setSelectedSize}
              onColorSelect={state.setSelectedColor}
              onQuantityChange={state.setQuantity}
            />

<<<<<<< HEAD
            {/* ── P1: Prominent Virtual Try-On CTA ──────────────────────────
                  Was buried inside ProductActions; now a high-priority button
                  between variant pick and Add-to-Cart. */}
            <PdpTryOnPromote
              productName={product.name}
              hasUploadedPhoto={Boolean(state.bodyTwin)}
              onLaunch={() => state.setShowViewOnMe(true)}
            />

            {/* ── P1: Add-to-Cart + Silent Cart side-by-side ────────────────
                  ProductActions still owns the main commerce CTAs; Silent Cart
                  becomes a peer-level icon button so USP 7 is one tap away. */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
                <ProductActions
                  product={product}
                  sizeVariants={state.sizeVariants}
                  colorVariants={state.colorVariants}
                  selectedSize={state.selectedSize}
                  selectedColor={state.selectedColor}
                  inConsiderations={state.inConsiderations}
                  inCart={state.inCart}
                  inWardrobe={state.inWardrobe}
                  watchingRestock={state.watchingRestock}
                  showIntelligence={state.showIntelligence}
                  onShowIntelligence={() => state.setShowIntelligence(!state.showIntelligence)}
                  onAddToConsiderations={state.handleAddToConsiderations}
                  onRemoveFromConsiderations={state.handleRemoveFromConsiderations}
                  onAddToCart={state.handleAddToCart}
                  onAddToWardrobe={state.handleAddToWardrobe}
                  onRemoveFromWardrobe={state.handleRemoveFromWardrobe}
                  onShare={state.handleShare}
                  onNotifyRestock={state.handleNotifyRestock}
                  onShowConcierge={() => state.setShowConcierge(true)}
                  onShowIV={() => state.setShowIV(true)}
                  onShowViewOnMe={() => state.setShowViewOnMe(true)}
                  onShowVirtualTryOn={() => state.setShowVirtualTryOn(true)}
                  isUHNI={state.isUHNI}
                  onNegotiatePrice={state.handleNegotiatePrice}
                  pricingTier={state.pricingTier}
                  hasPriceAlert={state.hasPriceAlert}
                  onSetPriceAlert={state.handleSetPriceAlert}
                />
              </div>
              <PdpSilentCartButton
                inConsiderations={state.inConsiderations}
                onAddToConsiderations={state.handleAddToConsiderations}
                onRemoveFromConsiderations={state.handleRemoveFromConsiderations}
              />
            </div>

            {/* ── P1: Complete-the-Look hoisted above the fold ──────────────
                  Was at the very bottom of the page (after Craftsmanship +
                  Materials). Now collapsed-by-default trigger sits right after
                  the action area; expanding renders the existing component inline. */}
            <PdpCompleteLookCollapsed
              productName={product.name}
              outfitsAvailable={intelligence.outfitSuggestions.length}
              outfits={intelligence.outfitSuggestions}
              expandedContent={
                <OutfitSuggestions product={product} outfits={intelligence.outfitSuggestions} />
              }
            />

            <ProductIntelligencePanel
              isVisible={state.showIntelligence}
              availabilityIntelligence={intelligence.availabilityIntelligence}
              fitConfidence={intelligence.fitConfidence}
              climateSuitability={intelligence.climateSuitability}
              sustainabilityScore={intelligence.sustainabilityScore}
              fabricSimulation={intelligence.fabricSimulation}
              bodyTwin={state.bodyTwin}
              selectedSize={state.selectedSize}
              sizeVariants={state.sizeVariants}
              onNotifyRestock={state.handleNotifyRestock}
            />

            <ProductDelivery
              product={product}
              brand={state.brand}
              deliveryEstimate={intelligence.deliveryEstimate}
            />
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <ProductCraftsmanship product={product} />

      {/* Materials Section */}
      <ProductMaterials
        product={product}
        materialFeel={materialFeel}
      />

      {/* Complete the Look — hoisted above the fold into <PdpCompleteLookCollapsed>; removed from here to avoid duplication */}

      {/* Related Products */}
      <ProductRelated products={state.relatedProducts} brand={state.brand} />

      {/* Continue Exploring CTA */}
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
          <Link href="/discover" className="group inline-flex items-center gap-5">
            <span className="text-sm tracking-[0.2em] uppercase text-charcoal-deep">
              View Collection
            </span>
            <span className="w-14 h-14 rounded-full border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-500">
              <ArrowRight size={18} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors duration-500" />
            </span>
          </Link>
        </div>
      </section>

      {/* Modals */}
      <ImmersiveVisualization
        product={product}
        isOpen={state.showIV}
        onClose={() => state.setShowIV(false)}
        bodyTwin={state.bodyTwin || null}
        selectedSize={state.selectedSize}
        selectedColor={state.selectedColor}
      />

      <BodyVisualization
        product={product}
        isOpen={state.showViewOnMe}
        onClose={() => state.setShowViewOnMe(false)}
        initialConfig={state.bodyTwin ? { silhouette: state.bodyTwin.silhouette } : undefined}
      />

      <ProductConcierge
        isOpen={state.showConcierge}
        onClose={() => state.setShowConcierge(false)}
        product={product}
        brand={state.brand}
        bodyTwin={state.bodyTwin}
        fitConfidence={intelligence.fitConfidence}
        personalizationMatch={intelligence.personalizationMatch}
        relatedProducts={state.relatedProducts}
        sizeVariants={state.sizeVariants}
      />

      <VirtualTryOnModal
        product={product}
        isOpen={state.showVirtualTryOn}
        onClose={() => state.setShowVirtualTryOn(false)}
      />
    </div>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const productIdParam = searchParams.get('productId');
  const imageParam = searchParams.get('img');
  const [product, setProduct] = useState<Product | null>(null);
  const [aiInsights, setAIInsights] = useState<ProductAIInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        if (productIdParam) {
          // Real API — fetch brands + product detail + AI insights in parallel
          try {
            const [brands, loaded, aiInsights] = await Promise.all([
              getRecommendedBrands(),
              getProductDetail(productIdParam),
              getProductAIInsights(productIdParam),
            ]);
            const matchBrand = brands.find(b => b.id === loaded.brandId);
            const brandName = matchBrand ? matchBrand.name : '';
            // If API returned no real images, use the image from the recommendation card
            const hasImages = loaded.images.length > 0 &&
              !loaded.images[0].url.includes('placehold.co') &&
              loaded.images[0].url.startsWith('http');
            if (!hasImages && imageParam) {
              loaded.images = [{
                id: '1',
                url: imageParam,
                alt: loaded.name,
                type: 'hero',
              }];
            }

            // Merge AI insights into the product data
            const merged = { ...loaded, brandName };
            if (aiInsights) {
              if (aiInsights.materials && aiInsights.materials.length > 0) {
                merged.materials = aiInsights.materials.map(m => ({
                  name: m.name,
                  composition: m.composition || '',
                  origin: m.origin || '',
                  sustainability: m.sustainability,
                }));
              }
              if (aiInsights.craftsmanship && aiInsights.craftsmanship.length > 0) {
                merged.craftsmanship = aiInsights.craftsmanship;
              }
            }
            setProduct(merged);
            if (aiInsights) setAIInsights(aiInsights);
          } catch {
            // Fall back to mock if real API fails
            const res = await productService.getProductBySlug(slug);
            setProduct(res.data ?? null);
          }
        } else {
          // No productId — fall back to mock data
          const res = await productService.getProductBySlug(slug);
          setProduct(res.data ?? null);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug, productIdParam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-stone tracking-wider">Loading</p>
        </div>
      </div>
    );
  }

  if (!product) {
    // Show a friendly in-app message instead of the jarring Next.js 404 page.
    // Helps when a card was rendered from stale/partial data on Discover or the
    // home grid and the detail fetch fails — user can recover without losing
    // context of where they were.
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center px-8">
        <div className="text-center max-w-md">
          <span className="text-[10px] tracking-[0.4em] uppercase text-gold-deep block mb-4">
            Piece Unavailable
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-charcoal-deep leading-tight mb-4">
            We couldn&rsquo;t find this piece.
          </h1>
          <p className="text-sm text-stone leading-relaxed mb-10">
            It may have been retired, reassigned to a private collection, or
            momentarily unavailable. The maison still awaits — explore more
            pieces from the collection.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/discover"
              className="inline-flex items-center justify-center gap-3 py-4 px-8 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors duration-300 text-sm tracking-[0.15em] uppercase"
            >
              Back to Discover
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-3 py-4 px-8 border border-charcoal-deep text-charcoal-deep hover:bg-charcoal-deep hover:text-ivory-cream transition-colors duration-300 text-sm tracking-[0.15em] uppercase"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ProductPageContent product={product} aiInsights={aiInsights} />;
}
