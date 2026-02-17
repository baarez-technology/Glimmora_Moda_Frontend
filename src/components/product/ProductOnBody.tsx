'use client';

import { motion } from 'framer-motion';
import { Product, DigitalBodyTwin, ProductCategory } from '@/types';
import Image from 'next/image';

interface ProductOnBodyProps {
  product: Product;
  silhouette: DigitalBodyTwin['silhouette'];
  viewAngle: 'front' | 'side' | 'back';
  className?: string;
}

// Product positioning based on category and body type
const productPositioning: Record<ProductCategory, Record<DigitalBodyTwin['silhouette'], {
  top: string;
  left: string;
  width: string;
  height: string;
  rotation?: number;
}>> = {
  clothing: {
    petite: { top: '18%', left: '25%', width: '50%', height: '45%' },
    average: { top: '17%', left: '23%', width: '54%', height: '48%' },
    tall: { top: '16%', left: '20%', width: '60%', height: '50%' },
    curvy: { top: '17%', left: '20%', width: '60%', height: '48%' },
    athletic: { top: '17%', left: '22%', width: '56%', height: '48%' }
  },
  accessories: {
    petite: { top: '5%', left: '35%', width: '30%', height: '15%' },
    average: { top: '4%', left: '33%', width: '34%', height: '16%' },
    tall: { top: '3%', left: '30%', width: '40%', height: '17%' },
    curvy: { top: '4%', left: '30%', width: '40%', height: '16%' },
    athletic: { top: '4%', left: '32%', width: '36%', height: '16%' }
  },
  bags: {
    petite: { top: '35%', left: '60%', width: '25%', height: '20%' },
    average: { top: '38%', left: '62%', width: '28%', height: '22%' },
    tall: { top: '40%', left: '65%', width: '30%', height: '24%' },
    curvy: { top: '38%', left: '65%', width: '30%', height: '22%' },
    athletic: { top: '38%', left: '63%', width: '28%', height: '22%' }
  },
  shoes: {
    petite: { top: '82%', left: '30%', width: '40%', height: '15%' },
    average: { top: '84%', left: '28%', width: '44%', height: '14%' },
    tall: { top: '86%', left: '25%', width: '50%', height: '12%' },
    curvy: { top: '84%', left: '28%', width: '44%', height: '14%' },
    athletic: { top: '84%', left: '28%', width: '44%', height: '14%' }
  },
  jewelry: {
    petite: { top: '15%', left: '40%', width: '20%', height: '8%' },
    average: { top: '14%', left: '38%', width: '24%', height: '10%' },
    tall: { top: '13%', left: '36%', width: '28%', height: '11%' },
    curvy: { top: '14%', left: '36%', width: '28%', height: '10%' },
    athletic: { top: '14%', left: '38%', width: '24%', height: '10%' }
  },
  watches: {
    petite: { top: '45%', left: '10%', width: '15%', height: '8%', rotation: -15 },
    average: { top: '48%', left: '8%', width: '18%', height: '10%', rotation: -15 },
    tall: { top: '50%', left: '5%', width: '20%', height: '11%', rotation: -15 },
    curvy: { top: '48%', left: '5%', width: '20%', height: '10%', rotation: -15 },
    athletic: { top: '48%', left: '8%', width: '18%', height: '10%', rotation: -15 }
  }
};

export default function ProductOnBody({
  product,
  silhouette,
  viewAngle,
  className = ''
}: ProductOnBodyProps) {
  const category = product.category as ProductCategory;
  const positioning = productPositioning[category]?.[silhouette] || productPositioning.clothing[silhouette];

  // Adjust for side/back views
  const adjustedPositioning = { ...positioning };
  if (viewAngle === 'side') {
    adjustedPositioning.left = `${parseInt(positioning.left) + 5}%`;
  } else if (viewAngle === 'back') {
    // Mirror positioning for back view
    const leftValue = parseInt(positioning.left);
    const widthValue = parseInt(positioning.width);
    adjustedPositioning.left = `${100 - leftValue - widthValue}%`;
  }

  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      style={{
        top: adjustedPositioning.top,
        left: adjustedPositioning.left,
        width: adjustedPositioning.width,
        height: adjustedPositioning.height,
        transform: adjustedPositioning.rotation ? `rotate(${adjustedPositioning.rotation}deg)` : undefined
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Product image with blend mode for realistic overlay */}
      <div className="relative w-full h-full">
        <Image
          src={product.images[0]?.url || ''}
          alt={product.name}
          fill
          className="object-contain mix-blend-multiply"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
        />

        {/* Subtle highlight overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-lg"
          style={{ mixBlendMode: 'soft-light' }}
        />
      </div>

      {/* Size indicator */}
      {product.variants && product.variants.filter(v => v.type === 'size').length > 0 && (
        <motion.div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-ivory-cream/90 backdrop-blur-sm px-2 py-0.5 rounded-full"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-[9px] tracking-wider uppercase text-charcoal-deep/70">
            Size: {product.variants.filter(v => v.type === 'size')[0]?.value || 'M'}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
