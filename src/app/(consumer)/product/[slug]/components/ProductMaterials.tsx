'use client';

import Image from 'next/image';
import MaterialFeel from '@/components/product/MaterialFeel';
import type { Product, MaterialFeel as MaterialFeelType } from '@/types';

interface ProductMaterialsProps {
  product: Product;
  materialFeel?: MaterialFeelType;
}

export default function ProductMaterials({ product, materialFeel }: ProductMaterialsProps) {
  return (
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

            {/* Material Feel Experience */}
            {materialFeel && (
              <div className="mt-8">
                <MaterialFeel material={materialFeel} />
              </div>
            )}
          </div>

          {/* Image Side */}
          <div className="relative aspect-square lg:aspect-auto order-1 lg:order-2">
            <Image
              src={product.images[Math.min(2, product.images.length - 1)]?.url || product.images[0]?.url || ''}
              alt={`${product.name} material detail`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
