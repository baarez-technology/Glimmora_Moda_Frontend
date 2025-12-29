'use client';

import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, MapPin, Play, Sparkles } from 'lucide-react';
import { getBrandBySlug, getProductsByBrand, getStoriesByBrand } from '@/data/mock-data';
import { notFound } from 'next/navigation';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export default function BrandPage({ params }: BrandPageProps) {
  const { slug } = use(params);
  const brand = getBrandBySlug(slug);

  if (!brand) {
    notFound();
  }

  const products = getProductsByBrand(brand.id);
  const stories = getStoriesByBrand(brand.id);

  const explorationModes = [
    { title: 'Heritage & History', desc: 'Journey through time', icon: Clock },
    { title: 'Craftsmanship', desc: 'Inside the atelier', icon: Sparkles },
    { title: 'Current Collections', desc: 'Today\'s vision', icon: ArrowRight },
    { title: 'Iconic Pieces', desc: 'Timeless creations', icon: Play }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={brand.heroImage}
            alt={brand.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-noir/50 via-noir/30 to-noir/70" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto animate-fade-in-up">
          <p className="text-xs tracking-[0.3em] uppercase text-champagne mb-6">
            Welcome to the Universe of
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-ivory-cream mb-4">
            {brand.name}
          </h1>
          <p className="text-xl text-sand mb-8">{brand.tagline}</p>
          <div className="section-divider mb-8" />
          <p className="text-taupe max-w-2xl mx-auto">
            {brand.description}
          </p>
        </div>
      </section>

      {/* AGI Concierge Welcome */}
      <section className="py-16 bg-charcoal-deep text-ivory-cream">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gold-muted/20 flex items-center justify-center">
              <Sparkles className="text-gold-soft" size={24} />
            </div>
            <span className="text-sm tracking-[0.2em] uppercase text-gold-soft">Brand AGI Concierge</span>
          </div>
          <p className="font-display text-2xl md:text-3xl italic text-sand leading-relaxed">
            "Welcome to the House of {brand.name}. I'm here to guide you through our universe.
            How would you like to explore?"
          </p>
        </div>
      </section>

      {/* Exploration Modes */}
      <section className="py-20 lg:py-24 px-6 lg:px-12 bg-ivory-cream">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {explorationModes.map((mode, index) => (
              <button
                key={index}
                className="group bg-white p-6 lg:p-8 rounded-xl shadow-sm hover:shadow-md transition-all text-left"
              >
                <mode.icon className="w-8 h-8 text-gold-muted mb-4" />
                <h3 className="font-display text-xl text-charcoal-deep mb-2 group-hover:text-gold-deep transition-colors">
                  {mode.title}
                </h3>
                <p className="text-sm text-stone">{mode.desc}</p>
              </button>
            ))}
          </div>

          {/* Or ask anything */}
          <div className="mt-12 text-center">
            <p className="text-sm text-greige mb-4">Or tell me what you're looking for...</p>
            <div className="max-w-xl mx-auto relative">
              <input
                type="text"
                placeholder={`Ask anything about ${brand.name}...`}
                className="input-luxury text-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Heritage Section */}
      <section className="py-20 lg:py-32 bg-parchment">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-gold-muted mb-4">Heritage</p>
              <h2 className="font-display text-3xl md:text-4xl text-charcoal-deep mb-6">
                {brand.heritage.story.split('.')[0]}.
              </h2>
              <div className="space-y-4 text-stone">
                <p>{brand.heritage.story}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-10">
                <div>
                  <p className="font-display text-4xl text-gold-deep">{brand.heritage.founded}</p>
                  <p className="text-sm text-greige uppercase tracking-wider">Founded</p>
                </div>
                <div>
                  <p className="font-display text-lg text-charcoal-deep">{brand.heritage.origin}</p>
                  <p className="text-sm text-greige uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={14} /> Origin
                  </p>
                </div>
              </div>

              <Link
                href={`/story/${stories[0]?.slug || ''}`}
                className="btn-secondary inline-flex mt-10"
              >
                Explore Our Heritage
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
              <Image
                src={brand.heroImage}
                alt={`${brand.name} Heritage`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stories Section */}
      {stories.length > 0 && (
        <section className="py-20 lg:py-32 px-6 lg:px-12">
          <div className="max-w-[1800px] mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs tracking-[0.3em] uppercase text-gold-muted mb-4">Stories & Narratives</p>
              <h2 className="font-display text-3xl md:text-4xl text-charcoal-deep">
                From the House of {brand.name}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/story/${story.slug}`}
                  className="group"
                >
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4">
                    <Image
                      src={story.heroImage}
                      alt={story.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="tag-intelligence">{story.type}</span>
                    </div>
                  </div>
                  <h3 className="font-display text-xl text-charcoal-deep group-hover:text-gold-deep transition-colors mb-2">
                    {story.title}
                  </h3>
                  <p className="text-sm text-stone line-clamp-2">{story.excerpt}</p>
                  <p className="text-xs text-greige mt-3">{story.readTime} min read</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className="py-20 lg:py-32 bg-parchment px-6 lg:px-12">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-6">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-gold-muted mb-4">The Collection</p>
              <h2 className="font-display text-3xl md:text-4xl text-charcoal-deep">
                {brand.name} Pieces
              </h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="text-sm px-4 py-2 bg-charcoal-deep text-ivory-cream rounded-full">
                All
              </button>
              <button className="text-sm px-4 py-2 border border-sand text-charcoal-warm rounded-full hover:border-charcoal-deep transition-colors">
                Bags
              </button>
              <button className="text-sm px-4 py-2 border border-sand text-charcoal-warm rounded-full hover:border-charcoal-deep transition-colors">
                Clothing
              </button>
              <button className="text-sm px-4 py-2 border border-sand text-charcoal-warm rounded-full hover:border-charcoal-deep transition-colors">
                Accessories
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group"
              >
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4 bg-white">
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

          {products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-stone">Explore our collection coming soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-charcoal-deep text-ivory-cream">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-display text-2xl md:text-3xl italic text-sand mb-8">
            "Would you like me to help you find something specific from {brand.name}?"
          </p>
          <button className="btn-gold">
            Start a Conversation
            <Sparkles size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
