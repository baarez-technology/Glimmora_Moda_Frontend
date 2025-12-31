'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock, Share2, Bookmark, BookmarkCheck, ArrowRight } from 'lucide-react';
import { getStoryBySlug, brands, products } from '@/data/mock-data';
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

  if (!story) {
    notFound();
  }

  const brand = brands.find(b => b.id === story.brandId);
  const relatedProducts = story.relatedProducts
    .map(id => products.find(p => p.id === id))
    .filter(Boolean);

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
        // User cancelled or share failed - copy to clipboard as fallback
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
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px]">
        <div className="absolute inset-0">
          <Image
            src={story.heroImage}
            alt={story.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-noir/30 to-noir/10" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-4xl mx-auto px-6 lg:px-12 pb-16 w-full">
            <Link
              href={`/brand/${brand?.slug || ''}`}
              className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-6"
            >
              <ArrowLeft size={16} />
              Back to {brand?.name}
            </Link>

            <span className="tag-intelligence mb-4 inline-block">{story.type}</span>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-ivory-cream mb-6">
              {story.title}
            </h1>

            <div className="flex items-center gap-6 text-sand">
              <span className="text-sm">{brand?.name}</span>
              <span className="w-1 h-1 rounded-full bg-sand" />
              <span className="flex items-center gap-1 text-sm">
                <Clock size={14} />
                {story.readTime} min read
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 lg:px-12 py-16">
        {/* Actions */}
        <div className="flex justify-end gap-4 mb-12 pb-8 border-b border-sand">
          <button
            onClick={handleBookmark}
            className={`p-2 transition-colors ${isBookmarked ? 'text-gold-deep' : 'text-stone hover:text-charcoal-deep'}`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
          >
            {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
          <button
            onClick={handleShare}
            className="p-2 text-stone hover:text-charcoal-deep transition-colors"
            aria-label="Share story"
          >
            <Share2 size={20} />
          </button>
        </div>

        {/* Story Content */}
        <div className="prose prose-lg prose-stone max-w-none">
          {story.content.map((section, index) => {
            switch (section.type) {
              case 'text':
                return (
                  <p key={index} className="text-stone leading-relaxed mb-8">
                    {section.content}
                  </p>
                );
              case 'image':
                return (
                  <figure key={index} className="my-12">
                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
                      <Image
                        src={section.mediaUrl || ''}
                        alt={section.content}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {section.content && (
                      <figcaption className="text-center text-sm text-greige mt-4">
                        {section.content}
                      </figcaption>
                    )}
                  </figure>
                );
              case 'quote':
                return (
                  <blockquote key={index} className="my-12 border-l-2 border-gold-muted pl-6">
                    <p className="font-display text-2xl text-charcoal-deep italic mb-4">
                      {section.content}
                    </p>
                    {section.caption && (
                      <cite className="text-sm text-greige not-italic">{section.caption}</cite>
                    )}
                  </blockquote>
                );
              default:
                return null;
            }
          })}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-16 border-t border-sand">
            <h3 className="font-display text-2xl text-charcoal-deep mb-8">From This Story</h3>
            <div className="grid grid-cols-2 gap-6">
              {relatedProducts.map((product) => product && (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="group flex gap-4"
                >
                  <div className="relative w-24 h-32 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={product.images[0]?.url || ''}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <p className="text-xs tracking-[0.15em] uppercase text-greige">{product.brandName}</p>
                    <h4 className="font-display text-lg text-charcoal-deep group-hover:text-gold-deep transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-sm text-stone mt-1">€{product.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* CTA */}
      <section className="py-16 bg-parchment">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <h3 className="font-display text-2xl text-charcoal-deep mb-4">
            Continue Exploring {brand?.name}
          </h3>
          <p className="text-stone mb-8">
            Discover more heritage stories and exceptional pieces from the Maison.
          </p>
          <Link href={`/brand/${brand?.slug || ''}`} className="btn-primary inline-flex">
            Enter Brand Universe
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
