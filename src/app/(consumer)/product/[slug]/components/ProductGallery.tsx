'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product, ProductImage } from '@/types';

const PLACEHOLDER_IMAGE = 'https://placehold.co/800x1000/F5F0EB/8B8680?text=No+Image';

interface ProductGalleryProps {
  product: Product;
  images?: ProductImage[];
  activeImage: number;
  setActiveImage: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  isLoaded: boolean;
}

export default function ProductGallery({
  product,
  images,
  activeImage,
  setActiveImage,
  onPrev,
  onNext,
  isLoaded
}: ProductGalleryProps) {
  const displayImages = images || product.images;

  return (
    <div className={`space-y-4 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Main Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-parchment group">
        <Image
          src={displayImages[activeImage]?.url || PLACEHOLDER_IMAGE}
          alt={product.name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
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
        {displayImages.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-ivory-cream/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} className="text-charcoal-deep" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-ivory-cream/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-label="Next image"
            >
              <ChevronRight size={20} className="text-charcoal-deep" />
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <span className="text-[10px] tracking-[0.3em] uppercase text-charcoal-deep bg-ivory-cream/90 px-4 py-2">
            {activeImage + 1} / {displayImages.length}
          </span>
        </div>
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setActiveImage(index)}
              className={`relative w-[calc(25%-9px)] min-w-[80px] flex-shrink-0 aspect-square overflow-hidden transition-all duration-300 ${
                activeImage === index
                  ? 'ring-1 ring-charcoal-deep'
                  : 'opacity-60 hover:opacity-100'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.url || PLACEHOLDER_IMAGE}
                alt={image.alt}
                fill
                sizes="(max-width: 1024px) 25vw, 12vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
