'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, BookOpen, Clock, CheckCircle, FileText, ChevronRight } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';
import type { BrandStoryType, BrandStoryStatus } from '@/types/brand-portal';

type FilterTab = 'all' | BrandStoryType;

export default function BrandStoriesPage() {
  const { brandStories } = useBrand();
  const [filter, setFilter] = useState<FilterTab>('all');

  const filteredStories = brandStories.filter(story => {
    return filter === 'all' || story.type === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  const typeCounts = {
    all: brandStories.length,
    heritage: brandStories.filter(s => s.type === 'heritage').length,
    craftsmanship: brandStories.filter(s => s.type === 'craftsmanship').length,
    collection: brandStories.filter(s => s.type === 'collection').length,
    artisan: brandStories.filter(s => s.type === 'artisan').length
  };

  const filterTabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'heritage', label: 'Heritage' },
    { value: 'craftsmanship', label: 'Craftsmanship' },
    { value: 'collection', label: 'Collection' },
    { value: 'artisan', label: 'Artisan' }
  ];

  return (
    <div>
      <BrandPageHeader
        title="Brand Stories"
        subtitle={`${filteredStories.length} stor${filteredStories.length !== 1 ? 'ies' : 'y'}`}
        actions={
          <PrimaryButton href="/brand/stories/new" icon={Plus}>
            Create Story
          </PrimaryButton>
        }
      />

      <div className="p-8 space-y-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-parchment p-1 w-fit overflow-x-auto">
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 text-xs tracking-[0.1em] uppercase transition-colors flex items-center gap-2 whitespace-nowrap ${
                filter === tab.value
                  ? 'bg-white text-charcoal-deep'
                  : 'text-stone hover:text-charcoal-deep'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] ${filter === tab.value ? 'text-taupe' : 'text-taupe/60'}`}>
                {typeCounts[tab.value]}
              </span>
            </button>
          ))}
        </div>

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <BookOpen size={48} className="mx-auto text-taupe/40 mb-4" />
            <p className="text-stone">No stories found</p>
            <Link
              href="/brand/stories/new"
              className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
            >
              <Plus size={16} /> Create your first story
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map(story => (
              <Link
                key={story.id}
                href={`/brand/stories/${story.id}`}
                className="bg-white border border-sand/50 hover:border-sand transition-colors group"
              >
                {/* Hero Image */}
                <div className="aspect-[16/9] bg-parchment relative overflow-hidden">
                  <Image
                    src={story.heroImage}
                    alt={story.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-2 py-1 text-[9px] tracking-[0.1em] uppercase ${getTypeBadge(story.type)}`}>
                      {story.type}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-[9px] tracking-[0.1em] uppercase ${getStatusBadge(story.status)}`}>
                      {story.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-medium text-charcoal-deep group-hover:text-gold-muted transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-sm text-stone mt-1 line-clamp-2">{story.excerpt}</p>

                  <div className="mt-4 pt-4 border-t border-sand/30 flex items-center justify-between text-xs text-taupe">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{story.readTime} min read</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {story.status === 'published' ? (
                        <>
                          <CheckCircle size={12} />
                          <span>{story.publishedAt ? formatDate(story.publishedAt) : 'Published'}</span>
                        </>
                      ) : (
                        <>
                          <FileText size={12} />
                          <span>Draft</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
