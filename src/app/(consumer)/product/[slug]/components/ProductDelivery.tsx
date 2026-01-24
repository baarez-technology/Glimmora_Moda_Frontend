'use client';

import { Truck, Shield, Leaf, Globe, TrendingUp } from 'lucide-react';
import type { Product, Brand } from '@/types';

interface DeliveryEstimate {
  standard: { date: string; label: string };
  express: { date: string; label: string; price: number };
  whiteGlove: { label: string; description: string; price: number };
}

interface ProductDeliveryProps {
  product: Product;
  brand?: Brand | null;
  deliveryEstimate: DeliveryEstimate;
}

export default function ProductDelivery({
  product,
  brand,
  deliveryEstimate
}: ProductDeliveryProps) {
  return (
    <>
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
    </>
  );
}
