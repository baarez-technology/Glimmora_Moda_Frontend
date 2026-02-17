'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Share2, Bookmark, BookmarkCheck, ArrowRight } from 'lucide-react';
import { getStoryBySlug, brands, products, brandStories as allStories } from '@/data/mock-data';
import { notFound } from 'next/navigation';
import { useApp } from '@/context/AppContext';

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

export default function StoryPage({ params }: StoryPageProps) {
  const { slug } = use(params);
  const story = getStoryBySlug(slug);
  const { showToast } = useApp();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeHover, setActiveHover] = useState<number | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!story) {
    notFound();
  }

  const brand = brands.find(b => b.id === story.brandId);
  const relatedProducts = story.relatedProducts
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

  // Get more stories from same brand or other brands
  const moreStories = allStories
    .filter(s => s.id !== story.id)
    .slice(0, 3);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (!isBookmarked) {
      showToast('Story saved to your reading list', 'success');
    } else {
      showToast('Story removed from reading list', 'info');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: story.title,
      text: story.excerpt,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied to clipboard', 'success');
  };

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* ============================================
          HERO - Full Screen Editorial
          ============================================ */}
      <section className="relative h-[85vh] min-h-[600px] max-h-[900px] w-full overflow-hidden">
        <Image
          src={story.heroImage}
          alt={story.title}
          fill
          className={`object-cover transition-all duration-[2s] ease-out ${isLoaded ? 'scale-100' : 'scale-110'}`}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-noir/90 via-noir/40 to-noir/10" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-[1400px] mx-auto px-8 md:px-16 lg:px-24 pb-16 lg:pb-24 w-full">
            <div className={`max-w-3xl transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              {/* Meta */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] tracking-[0.3em] uppercase text-ivory-cream/60 px-3 py-1.5 border border-ivory-cream/30">
                  {story.type}
                </span>
                <span className="w-8 h-px bg-ivory-cream/30" />
                <Link
                  href={`/brand/${brand?.slug || ''}`}
                  className="text-[10px] tracking-[0.3em] uppercase text-gold-soft hover:text-ivory-cream transition-colors"
                >
                  {brand?.name}
                </Link>
              </div>

              {/* Title */}
              <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em] mb-8">
                {story.title}
              </h1>

              {/* Excerpt */}
              <p className="text-lg text-ivory-cream/70 max-w-2xl mb-8 leading-relaxed">
                {story.excerpt}
              </p>

              {/* Read Time & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-ivory-cream/50">
                  <Clock size={14} />
                  <span>{story.readTime} min read</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBookmark}
                    className={`w-10 h-10 flex items-center justify-center border transition-all duration-300 ${
                      isBookmarked
                        ? 'border-gold-soft bg-gold-soft text-noir'
                        : 'border-ivory-cream/30 text-ivory-cream/60 hover:border-ivory-cream hover:text-ivory-cream'
                    }`}
                    aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
                  >
                    {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 flex items-center justify-center border border-ivory-cream/30 text-ivory-cream/60 hover:border-ivory-cream hover:text-ivory-cream transition-all duration-300"
                    aria-label="Share story"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          ARTICLE CONTENT
          ============================================ */}
      <article className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-8 md:px-16">
          {/* Story Content */}
          <div className="space-y-8">
            {story.content.map((section, index) => {
              switch (section.type) {
                case 'text':
                  return (
                    <p key={index} className="text-stone text-lg leading-[1.9]">
                      {section.content}
                    </p>
                  );
                case 'image':
                  return (
                    <figure key={index} className="my-16 -mx-8 md:-mx-16 lg:-mx-32">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={section.mediaUrl || ''}
                          alt={section.content}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {section.content && (
                        <figcaption className="text-center text-xs tracking-[0.2em] uppercase text-taupe mt-6 px-8">
                          {section.content}
                        </figcaption>
                      )}
                    </figure>
                  );
                case 'quote':
                  return (
                    <blockquote key={index} className="my-16 py-12 border-y border-sand/50">
                      <p className="font-display text-[clamp(1.5rem,3vw,2rem)] text-charcoal-deep leading-[1.4] mb-6">
                        "{section.content}"
                      </p>
                      {section.caption && (
                        <cite className="text-[10px] tracking-[0.3em] uppercase text-taupe not-italic">
                          — {section.caption}
                        </cite>
                      )}
                    </blockquote>
                  );
                default:
                  return null;
              }
            })}
          </div>
        </div>
      </article>

      {/* ============================================
          FEATURED PRODUCTS
          ============================================ */}
      {relatedProducts.length > 0 && (
        <section className="py-20 lg:py-28 bg-parchment">
          <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
              <div>
                <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-3">
                  From This Story
                </span>
                <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em]">
                  Featured Pieces
                </h2>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-10">
              {relatedProducts.map((product, index) => product && (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="group"
                  onMouseEnter={() => setActiveHover(index)}
                  onMouseLeave={() => setActiveHover(null)}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-ivory-cream mb-5">
                    <Image
                      src={product.images[0]?.url || ''}
                      alt={product.name}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-105"
                    />

                    {/* Hover Action */}
                    <div className="absolute inset-0 flex items-center justify-center bg-noir/0 group-hover:bg-noir/20 transition-all duration-500">
                      <div className={`w-14 h-14 rounded-full bg-ivory-cream flex items-center justify-center transform transition-all duration-500 ${activeHover === index ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                        <ArrowRight size={18} className="text-charcoal-deep" />
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] tracking-[0.25em] uppercase text-taupe">
                      {product.brandName}
                    </p>
                    <h3 className="font-display text-lg text-charcoal-deep leading-tight group-hover:text-charcoal-warm transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-stone">
                      €{product.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          MORE STORIES
          ============================================ */}
      {moreStories.length > 0 && (
        <section className="py-20 lg:py-28 bg-charcoal-deep">
          <div className="max-w-[1600px] mx-auto px-8 md:px-16 lg:px-24">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
              <div>
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/50 block mb-3">
                  Continue Reading
                </span>
                <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-ivory-cream leading-[1.1] tracking-[-0.02em]">
                  More Stories
                </h2>
              </div>
              <Link
                href="/discover"
                className="group inline-flex items-center gap-3 text-sm tracking-[0.15em] uppercase text-ivory-cream/60 hover:text-ivory-cream transition-colors"
              >
                <span>All Stories</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Stories Grid */}
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {moreStories.map((storyItem) => {
                const storyBrand = brands.find(b => b.id === storyItem.brandId);
                return (
                  <Link
                    key={storyItem.id}
                    href={`/story/${storyItem.slug}`}
                    className="group"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden mb-5">
                      <Image
                        src={storyItem.heroImage}
                        alt={storyItem.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-noir/30 group-hover:bg-noir/10 transition-colors duration-500" />
                      <div className="absolute top-5 left-5">
                        <span className="text-[9px] tracking-[0.2em] uppercase text-ivory-cream bg-noir/50 backdrop-blur-sm px-3 py-1.5">
                          {storyItem.type}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-2">
                      {storyBrand?.name}
                    </p>
                    <h3 className="font-display text-xl text-ivory-cream leading-tight group-hover:text-gold-soft transition-colors mb-2">
                      {storyItem.title}
                    </h3>
                    <p className="text-sm text-taupe line-clamp-2">{storyItem.excerpt}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          CTA - Explore Brand
          ============================================ */}
      <section className="py-20 lg:py-28 bg-ivory-cream">
        <div className="max-w-3xl mx-auto px-8 md:px-16 text-center">
          <span className="text-[10px] tracking-[0.5em] uppercase text-taupe block mb-6">
            Continue Your Journey
          </span>
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-charcoal-deep leading-[1.1] tracking-[-0.02em] mb-8">
            Explore {brand?.name}
          </h2>
          <p className="text-stone mb-12 max-w-lg mx-auto">
            Discover the complete collection and heritage of this distinguished maison.
          </p>
          <Link
            href={`/brand/${brand?.slug || ''}`}
            className="group inline-flex items-center gap-5"
          >
            <span className="text-sm tracking-[0.2em] uppercase text-charcoal-deep">
              Enter the Maison
            </span>
            <span className="w-14 h-14 rounded-full border border-charcoal-deep flex items-center justify-center group-hover:bg-charcoal-deep transition-all duration-500">
              <ArrowRight size={18} className="text-charcoal-deep group-hover:text-ivory-cream transition-colors duration-500" />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
