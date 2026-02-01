'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle, FileText, Edit, Package, Quote } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, SecondaryButton, PrimaryButton } from '@/components/brand/BrandPageHeader';
import type { BrandStoryType, BrandStoryStatus } from '@/types/brand-portal';

export default function StoryDetailPage() {
  const params = useParams();
  const { getBrandStoryById, getProductById, updateBrandStory } = useBrand();

  const storyId = params.id as string;
  const story = getBrandStoryById(storyId);

  if (!story) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone">Story not found</p>
        <Link
          href="/brand/stories"
          className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
        >
          <ArrowLeft size={16} /> Back to Stories
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTypeBadge = (type: BrandStoryType) => {
    switch (type) {
      case 'heritage':
        return 'bg-gold-soft/20 text-gold-deep';
      case 'craftsmanship':
        return 'bg-champagne/30 text-gold-muted';
      case 'collection':
        return 'bg-info/10 text-info';
      case 'artisan':
        return 'bg-parchment text-charcoal-deep';
      default:
        return 'bg-taupe/20 text-stone';
    }
  };

  const getStatusBadge = (status: BrandStoryStatus) => {
    switch (status) {
      case 'published':
        return 'bg-success/10 text-success';
      case 'draft':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-taupe/20 text-stone';
    }
  };

  const handlePublish = () => {
    updateBrandStory(story.id, {
      status: 'published',
      publishedAt: new Date().toISOString()
    });
  };

  const handleUnpublish = () => {
    updateBrandStory(story.id, {
      status: 'draft',
      publishedAt: undefined
    });
  };

  return (
    <div>
      <BrandPageHeader
        title={story.title}
        breadcrumbs={[
          { label: 'Stories', href: '/brand/stories' },
          { label: story.title }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <SecondaryButton href="/brand/stories" icon={ArrowLeft}>
              Back
            </SecondaryButton>
            {story.status === 'draft' ? (
              <PrimaryButton onClick={handlePublish}>
                Publish
              </PrimaryButton>
            ) : (
              <SecondaryButton onClick={handleUnpublish}>
                Unpublish
              </SecondaryButton>
            )}
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {/* Hero Section */}
        <div className="relative aspect-[21/9] bg-parchment overflow-hidden">
          <img
            src={story.heroImage}
            alt={story.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-noir/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 text-xs tracking-[0.1em] uppercase ${getTypeBadge(story.type)}`}>
                {story.type}
              </span>
              <span className={`px-3 py-1 text-xs tracking-[0.1em] uppercase ${getStatusBadge(story.status)}`}>
                {story.status}
              </span>
            </div>
            <h2 className="font-display text-3xl text-ivory-cream">{story.title}</h2>
            <p className="text-ivory-cream/80 mt-2 max-w-2xl">{story.excerpt}</p>
            <div className="flex items-center gap-4 mt-4 text-ivory-cream/60 text-sm">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{story.readTime} min read</span>
              </div>
              {story.publishedAt && (
                <div className="flex items-center gap-1">
                  <CheckCircle size={14} />
                  <span>Published {formatDate(story.publishedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Content Preview */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Content Preview</h2>
              </div>
              <div className="p-6 space-y-6">
                {story.content.length === 0 ? (
                  <p className="text-sm text-taupe text-center py-8">No content sections yet</p>
                ) : (
                  story.content.map((section, index) => (
                    <div key={section.id || index} className="prose prose-sm max-w-none">
                      {section.type === 'text' && (
                        <p className="text-charcoal-deep leading-relaxed">{section.content}</p>
                      )}
                      {section.type === 'image' && (
                        <div>
                          {section.mediaUrl && (
                            <img
                              src={section.mediaUrl}
                              alt={section.caption || ''}
                              className="w-full h-auto"
                            />
                          )}
                          {section.caption && (
                            <p className="text-xs text-taupe text-center mt-2 italic">{section.caption}</p>
                          )}
                        </div>
                      )}
                      {section.type === 'quote' && (
                        <blockquote className="border-l-2 border-gold-muted pl-4 py-2">
                          <p className="text-charcoal-deep italic">{section.content}</p>
                          {section.caption && (
                            <cite className="text-xs text-taupe block mt-2">— {section.caption}</cite>
                          )}
                        </blockquote>
                      )}
                      {section.type === 'timeline' && (
                        <div className="border border-sand p-4 bg-parchment/30">
                          <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Timeline</p>
                          <div className="space-y-2">
                            {section.content.split('|').map((item, i) => (
                              <p key={i} className="text-sm text-charcoal-deep">{item.trim()}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Story Info */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Story Info</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">ID</span>
                  <span className="text-sm text-charcoal-deep font-mono">{story.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Type</span>
                  <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${getTypeBadge(story.type)}`}>
                    {story.type}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Status</span>
                  <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge(story.status)}`}>
                    {story.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Read Time</span>
                  <span className="text-sm text-charcoal-deep">{story.readTime} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Sections</span>
                  <span className="text-sm text-charcoal-deep">{story.content.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Created</span>
                  <span className="text-sm text-charcoal-deep">{formatDate(story.createdAt)}</span>
                </div>
                {story.publishedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-taupe uppercase tracking-wider">Published</span>
                    <span className="text-sm text-charcoal-deep">{formatDate(story.publishedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Related Products */}
            {story.relatedProducts.length > 0 && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
                  <Package size={18} className="text-stone" />
                  <h2 className="font-medium text-charcoal-deep">Related Products</h2>
                </div>
                <div className="p-6 space-y-3">
                  {story.relatedProducts.map(productId => {
                    const product = getProductById(productId);
                    if (!product) return null;
                    return (
                      <Link
                        key={productId}
                        href={`/brand/products/${productId}`}
                        className="flex items-center gap-3 p-2 hover:bg-parchment transition-colors"
                      >
                        <div className="w-10 h-10 bg-parchment flex-shrink-0">
                          {product.images[0] && (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-charcoal-deep truncate">{product.name}</p>
                          <p className="text-xs text-taupe">€{product.price.toLocaleString()}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
