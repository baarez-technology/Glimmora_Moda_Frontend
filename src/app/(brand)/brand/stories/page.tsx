'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, BookOpen, Clock, CheckCircle, FileText, Trash2, Pencil } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';
import type { BrandStoryType, BrandStoryStatus } from '@/types/brand-portal';

type FilterTab = 'all' | 'deleted' | BrandStoryType;

export default function BrandStoriesPage() {
  const { brandStories, deleteBrandStory } = useBrand();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const activeStories = brandStories.filter(s => !s.isDeleted);
  const deletedStories = brandStories.filter(s => s.isDeleted);

  const filteredStories = filter === 'deleted'
    ? deletedStories
    : activeStories.filter(story => {
        return filter === 'all' || story.type === filter;
      });

  const deleteTarget = deleteTargetId ? brandStories.find(s => s.id === deleteTargetId) : null;

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
    all: activeStories.length,
    heritage: activeStories.filter(s => s.type === 'heritage').length,
    craftsmanship: activeStories.filter(s => s.type === 'craftsmanship').length,
    collection: activeStories.filter(s => s.type === 'collection').length,
    artisan: activeStories.filter(s => s.type === 'artisan').length,
    deleted: deletedStories.length
  };

  const filterTabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'heritage', label: 'Heritage' },
    { value: 'craftsmanship', label: 'Craftsmanship' },
    { value: 'collection', label: 'Collection' },
    { value: 'artisan', label: 'Artisan' },
    { value: 'deleted', label: 'Deleted' }
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
            {filteredStories.map(story => {
              const isDeleted = story.isDeleted;
              return (
                <div
                  key={story.id}
                  className={`bg-white border border-sand/50 transition-colors group ${isDeleted ? 'opacity-60' : 'hover:border-sand'}`}
                >
                  {/* Hero Image */}
                  <Link href={`/brand/stories/${story.id}`}>
                    <div className="aspect-[16/9] bg-parchment relative overflow-hidden">
                      <Image
                        src={story.heroImage}
                        alt={story.title}
                    fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`px-2 py-1 text-[9px] tracking-[0.1em] uppercase ${isDeleted ? 'bg-red-100 text-red-600' : getTypeBadge(story.type)}`}>
                          {isDeleted ? 'Deleted' : story.type}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 text-[9px] tracking-[0.1em] uppercase ${getStatusBadge(story.status)}`}>
                          {story.status}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-5">
                    <Link href={`/brand/stories/${story.id}`}>
                      <h3 className={`font-medium transition-colors ${isDeleted ? 'text-stone line-through' : 'text-charcoal-deep group-hover:text-gold-muted'}`}>
                        {story.title}
                      </h3>
                      <p className="text-sm text-stone mt-1 line-clamp-2">{story.excerpt}</p>
                    </Link>

                    <div className="mt-4 pt-4 border-t border-sand/30 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-taupe">
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

                      {!isDeleted && (
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/brand/stories/${story.id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wide border border-sand text-stone hover:text-charcoal-deep hover:border-charcoal-deep/50 transition-colors"
                          >
                            <Pencil size={12} />
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteTargetId(story.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wide border border-sand text-stone hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-colors"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-noir/40">
          <div className="bg-white p-8 max-w-md w-full mx-4 border border-sand">
            <h3 className="font-display text-lg text-charcoal-deep mb-3">Delete Story</h3>
            <p className="text-sm text-stone mb-2">
              Are you sure you want to delete <span className="font-medium text-charcoal-deep">{deleteTarget.title}</span>?
            </p>
            <p className="text-xs text-taupe mb-6">
              This story will be removed from your dashboard. This action can be restored by an administrator.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-6 py-3 text-sm text-stone hover:text-charcoal-deep transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteBrandStory(deleteTarget.id);
                  setDeleteTargetId(null);
                }}
                className="px-6 py-3 bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
