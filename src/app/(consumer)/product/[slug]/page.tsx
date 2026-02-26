'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import * as productService from '@/services/product.service';
import { getProductDetail, getRecommendedBrands } from '@/services/recommendation.service';
import { notFound } from 'next/navigation';
import ImmersiveVisualization from '@/components/product/ImmersiveVisualization';
import OutfitSuggestions from '@/components/product/OutfitSuggestions';
import BodyVisualization from '@/components/product/BodyVisualization';
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
  ProductIntelligencePanel
} from './components';
import type { Product } from '@/types';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

function ProductPageContent({ product }: { product: Product }) {
  // Use custom hooks for state management
  const state = useProductPageState({ product });

  // Use separate hook for computed intelligence data
  const intelligence = useProductIntelligence({
    product,
    sizeVariants: state.sizeVariants,
    fashionIdentity: state.fashionIdentity,
    wardrobe: state.wardrobe,
    brand: state.brand,
    allProducts: state.allProducts
  });

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Main Product Section */}
      <section className="max-w-[1800px] mx-auto px-8 md:px-16 lg:px-24 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <ProductGallery
            product={product}
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

            <ProductVariants
              sizeVariants={state.sizeVariants}
              colorVariants={state.colorVariants}
              selectedSize={state.selectedSize}
              selectedColor={state.selectedColor}
              sizeError={state.sizeError}
              onSizeSelect={state.setSelectedSize}
              onColorSelect={state.setSelectedColor}
            />

            <ProductActions
              product={product}
              sizeVariants={state.sizeVariants}
              selectedSize={state.selectedSize}
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
        materialFeel={intelligence.materialFeel}
      />

      {/* Complete the Look - Outfit Suggestions */}
      <OutfitSuggestions product={product} outfits={intelligence.outfitSuggestions} />

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
    </div>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const productIdParam = searchParams.get('productId');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        if (productIdParam) {
          // Real API — fetch product detail, resolve brand name
          let brandName = '';
          try {
            const brands = await getRecommendedBrands();
            const loaded = await getProductDetail(productIdParam);
            const matchBrand = brands.find(b => b.id === loaded.brandId);
            if (matchBrand) brandName = matchBrand.name;
            setProduct({ ...loaded, brandName });
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
    notFound();
  }

  return <ProductPageContent product={product} />;
}
