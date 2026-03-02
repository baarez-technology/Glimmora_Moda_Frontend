'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Crown } from 'lucide-react';
import * as collectionService from '@/services/collection.service';
import { getCollections } from '@/services/recommendation.service';
import type { Collection } from '@/types';

export default function UHNICollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isRealApi, setIsRealApi] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getCollections().then(apiCollections => {
      if (apiCollections.length > 0) {
        setCollections(apiCollections);
        setIsRealApi(true);
      } else {
        return collectionService.getAllCollections().then(response => {
          if (response.success) setCollections(response.data);
        });
      }
    }).catch(() => {
      return collectionService.getAllCollections().then(response => {
        if (response.success) setCollections(response.data);
      }).catch(console.error);
    }).finally(() => setIsLoaded(true));
  }, []);

  return (
    <div className="min-h-screen bg-noir">
      {/* Header */}
      <section className="border-b border-gold-soft/10">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 py-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown size={14} className="text-gold-soft" />
            <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50">
              Curated Selections
            </span>
          </div>
          <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
            Collections
          </h1>
          <p className="text-sand mt-4 max-w-xl mx-auto">
            Explore thoughtfully curated collections, each telling a unique story of style, craftsmanship, and timeless elegance.
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-16">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24">
          {!isLoaded ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-gold-soft border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sand text-sm">Loading collections...</p>
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sand">No collections available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collection/${collection.slug}${isRealApi ? `?collectionId=${collection.id}${collection.brandId ? `&brandId=${collection.brandId}` : ''}` : ''}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] bg-charcoal-deep overflow-hidden mb-4">
                    {collection.heroImage ? (
                      <Image
                        src={collection.heroImage}
                        alt={collection.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-2xl text-sand/30">{collection.name}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-noir/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <span className="inline-flex items-center gap-2 text-gold-soft text-sm">
                        Explore <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-sand/50 mb-1">
                      {collection.season} {collection.year}
                    </p>
                    <h2 className="font-display text-xl text-ivory-cream group-hover:text-gold-soft transition-colors">
                      {collection.name}
                    </h2>
                    <p className="text-sm text-sand mt-1 line-clamp-2">
                      {collection.description}
                    </p>
                    <p className="text-xs text-sand/50 mt-2">
                      {(collection.productCount ?? collection.products.length)} piece{(collection.productCount ?? collection.products.length) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
