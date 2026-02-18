'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import * as collectionService from '@/services/collection.service';
import type { Collection } from '@/types';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    collectionService.getAllCollections().then(response => {
      if (response.success) {
        setCollections(response.data);
      }
    }).catch(console.error).finally(() => setIsLoaded(true));
  }, []);

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 text-center">
          <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70 block mb-4">
            Curated Selections
          </span>
          <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
            Collections
          </h1>
          <p className="text-sand mt-4 max-w-xl mx-auto">
            Explore our thoughtfully curated collections, each telling a unique story of style, craftsmanship, and timeless elegance.
          </p>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        {!isLoaded ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-stone text-sm">Loading collections...</p>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone">No collections available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection, index) => (
              <Link
                key={collection.id}
                href={`/collection/${collection.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] bg-parchment overflow-hidden mb-4">
                  <Image
                    src={collection.heroImage}
                    alt={collection.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="inline-flex items-center gap-2 text-ivory-cream text-sm">
                      Explore <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.3em] uppercase text-stone mb-1">
                    {collection.season} {collection.year}
                  </p>
                  <h2 className="font-display text-xl text-charcoal-deep group-hover:text-gold-deep transition-colors">
                    {collection.name}
                  </h2>
                  <p className="text-sm text-stone mt-1 line-clamp-2">
                    {collection.description}
                  </p>
                  <p className="text-xs text-taupe mt-2">
                    {collection.products.length} piece{collection.products.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
