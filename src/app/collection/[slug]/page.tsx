'use client';

import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Sparkles, Filter } from 'lucide-react';
import { getCollectionBySlug, products as allProducts, brands } from '@/data/mock-data';
import { notFound } from 'next/navigation';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export default function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = use(params);
  const collection = getCollectionBySlug(slug);

  // If no specific collection found, show all products
  const isAllProducts = slug === 'all';
  const displayProducts = isAllProducts ? allProducts : collection?.products || [];

  if (!collection && !isAllProducts) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px]">
        <div className="absolute inset-0">
          <Image
            src={collection?.heroImage || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80'}
            alt={collection?.name || 'All Products'}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-noir/70 via-noir/30 to-noir/10" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-[1800px] mx-auto px-6 lg:px-12 pb-12 w-full">
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-6"
            >
              <ArrowLeft size={16} />
              Back to Discover
            </Link>

            {collection && (
              <p className="text-sm tracking-[0.2em] uppercase text-gold-soft mb-2">
                {collection.season} {collection.year}
              </p>
            )}

            <h1 className="font-display text-4xl md:text-5xl text-ivory-cream mb-4">
              {collection?.name || 'All Products'}
            </h1>

            {collection && (
              <p className="text-lg text-sand max-w-2xl">
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="max-w-[1800px] mx-auto px-6 lg:px-12 py-12">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b border-sand">
          <div className="flex items-center gap-2 text-sm text-stone">
            <Sparkles size={16} className="text-gold-muted" />
            <span>{displayProducts.length} exceptional pieces</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-sand rounded-full text-sm text-charcoal-warm hover:border-charcoal-deep transition-colors">
              <Filter size={14} />
              Filter
            </button>
            {['All', 'Bags', 'Clothing', 'Shoes', 'Accessories'].map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  category === 'All'
                    ? 'bg-charcoal-deep text-ivory-cream'
                    : 'border border-sand text-charcoal-warm hover:border-charcoal-deep'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {displayProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group"
              >
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-parchment mb-4">
                  <Image
                    src={product.images[0]?.url || ''}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {product.availability.status === 'limited' && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-gold-muted text-noir text-xs tracking-wider uppercase rounded-full">
                        Limited
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs tracking-[0.15em] uppercase text-greige mb-1">
                  {product.brandName}
                </p>
                <h3 className="font-display text-lg text-charcoal-deep group-hover:text-gold-deep transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-greige mb-1">{product.tagline}</p>
                <p className="text-sm text-stone">
                  {product.currency === 'EUR' ? '€' : '$'}{product.price.toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-stone">No products found in this collection.</p>
          </div>
        )}
      </section>

      {/* Related Collections */}
      <section className="py-16 bg-parchment px-6 lg:px-12">
        <div className="max-w-[1800px] mx-auto">
          <h2 className="font-display text-2xl text-charcoal-deep mb-8 text-center">
            Explore More
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {brands.slice(0, 4).map((brand) => (
              <Link
                key={brand.id}
                href={`/brand/${brand.slug}`}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden"
              >
                <Image
                  src={brand.heroImage}
                  alt={brand.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-noir/40 group-hover:bg-noir/30 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="font-display text-xl text-ivory-cream">{brand.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
