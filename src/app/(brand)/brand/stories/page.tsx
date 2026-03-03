'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, BookOpen, Clock, CheckCircle, FileText, Trash2, Pencil, Loader2, Upload, Download, ChevronDown, FileJson, FileSpreadsheet } from 'lucide-react';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';
import { fetchStories, softDeleteStory, exportStoriesFromBackend } from '@/services/brand-story.service';
import type { StoryResponse } from '@/services/brand-story.service';
import BulkUploadModal from '@/components/brand/BulkUploadModal';

type StoryType = 'heritage' | 'craftsmanship' | 'collection' | 'artisan';
type FilterTab = 'all' | 'deleted' | StoryType;

export default function BrandStoriesPage() {
  const [stories, setStories] = useState<StoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<'json' | 'csv' | 'excel' | null>(null);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchStories();
      setStories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stories');
    } finally {
      setIsLoading(false);
    }
  };

  const activeStories = useMemo(() => stories.filter(s => s.is_active), [stories]);
  const deletedStories = useMemo(() => stories.filter(s => !s.is_active), [stories]);

  const filteredStories = useMemo(() => {
    if (filter === 'deleted') return deletedStories;
    return activeStories.filter(story => {
      return filter === 'all' || story.story_type === filter;
    });
  }, [activeStories, deletedStories, filter]);

  const deleteTarget = deleteTargetId ? stories.find(s => s.story_id === deleteTargetId) : null;

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await softDeleteStory(deleteTargetId);
      setDeleteTargetId(null);
      await loadStories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete story');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeBadge = (type: string) => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-success/10 text-success';
      case 'draft':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-taupe/20 text-stone';
    }
  };

  const typeCounts = useMemo(() => ({
    all: activeStories.length,
    heritage: activeStories.filter(s => s.story_type === 'heritage').length,
    craftsmanship: activeStories.filter(s => s.story_type === 'craftsmanship').length,
    collection: activeStories.filter(s => s.story_type === 'collection').length,
    artisan: activeStories.filter(s => s.story_type === 'artisan').length,
    deleted: deletedStories.length
  }), [activeStories, deletedStories]);

  const filterTabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'heritage', label: 'Heritage' },
    { value: 'craftsmanship', label: 'Craftsmanship' },
    { value: 'collection', label: 'Collection' },
    { value: 'artisan', label: 'Artisan' },
    { value: 'deleted', label: 'Deleted' }
  ];

  const handleExport = async (format: 'json' | 'csv' | 'excel') => {
    setShowExportMenu(false);
    setExportingFormat(format);
    setError(null);
    try {
      await exportStoriesFromBackend(format);
      setExportToast(`Export complete — downloading as ${format.toUpperCase()}`);
      setTimeout(() => setExportToast(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExportingFormat(null);
    }
  };

  const headerActions = (
    <div className="flex items-center gap-3">
      {/* Export dropdown */}
      <div className="relative" ref={exportMenuRef}>
        <button
          onClick={() => !exportingFormat && setShowExportMenu(v => !v)}
          disabled={!!exportingFormat}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-sand text-sm text-stone hover:text-charcoal-deep hover:border-charcoal-deep/40 transition-colors tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {exportingFormat
            ? <Loader2 size={15} className="animate-spin" />
            : <Download size={15} />}
          {exportingFormat ? 'Exporting…' : 'Export'}
          {!exportingFormat && <ChevronDown size={13} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />}
        </button>
        {showExportMenu && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-sand shadow-lg z-30">
            <div className="px-4 py-2 border-b border-sand/40">
              <p className="text-[10px] tracking-[0.1em] uppercase text-taupe">Via backend · S3</p>
            </div>
            <button
              onClick={() => handleExport('json')}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone hover:bg-parchment hover:text-charcoal-deep transition-colors text-left"
            >
              <FileJson size={14} className="text-gold-muted" /> Export as JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone hover:bg-parchment hover:text-charcoal-deep transition-colors text-left"
            >
              <FileText size={14} className="text-info" /> Export as CSV
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone hover:bg-parchment hover:text-charcoal-deep transition-colors text-left"
            >
              <FileSpreadsheet size={14} className="text-success" /> Export as Excel
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowUploadModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 border border-sand text-sm text-stone hover:text-charcoal-deep hover:border-charcoal-deep/40 transition-colors tracking-wide"
      >
        <Upload size={15} />
        Import Stories
      </button>
      <PrimaryButton href="/brand/stories/new" icon={Plus}>
        Create Story
      </PrimaryButton>
    </div>
  );

  if (isLoading) {
    return (
      <div>
        <BrandPageHeader
          title="Brand Stories"
          subtitle="Loading..."
          actions={headerActions}
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-taupe" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <BrandPageHeader
          title="Brand Stories"
          subtitle="Error"
          actions={headerActions}
        />
        <div className="p-8 text-center">
          <p className="text-error mb-4">{error}</p>
          <button
            onClick={loadStories}
            className="px-6 py-3 bg-charcoal-deep text-white text-sm tracking-wider uppercase hover:bg-noir transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BrandPageHeader
        title="Brand Stories"
        subtitle={`${filteredStories.length} stor${filteredStories.length !== 1 ? 'ies' : 'y'}`}
        actions={headerActions}
      />

      <div className="p-8 space-y-6">
        {/* Export success toast */}
        {exportToast && (
          <div className="flex items-center justify-between gap-4 px-4 py-3 bg-success/8 border border-success/25 text-success text-sm">
            <div className="flex items-center gap-2">
              <Download size={15} className="shrink-0" />
              <span>{exportToast}</span>
            </div>
            <button onClick={() => setExportToast(null)} className="text-success/60 hover:text-success transition-colors text-lg leading-none">×</button>
          </div>
        )}

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
              const isActive = story.is_active;
              return (
                <div
                  key={story.story_id}
                  className={`bg-white border border-sand/50 transition-colors group ${!isActive ? 'opacity-60' : 'hover:border-sand'}`}
                >
                  {/* Hero Image */}
                  <Link href={`/brand/stories/${story.story_id}`}>
                    <div className="aspect-[16/9] bg-parchment relative overflow-hidden">
                      {story.image_url ? (
                        <Image
                          src={story.image_url}
                          alt={story.title}
                    fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-taupe">
                          <BookOpen size={32} />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`px-2 py-1 text-[9px] tracking-[0.1em] uppercase ${!isActive ? 'bg-red-100 text-red-600' : getTypeBadge(story.story_type)}`}>
                          {!isActive ? 'Deleted' : story.story_type}
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
                    <Link href={`/brand/stories/${story.story_id}`}>
                      <h3 className={`font-medium transition-colors ${!isActive ? 'text-stone line-through' : 'text-charcoal-deep group-hover:text-gold-muted'}`}>
                        {story.title}
                      </h3>
                      <p className="text-sm text-stone mt-1 line-clamp-2">{story.excerpt}</p>
                    </Link>

                    <div className="mt-4 pt-4 border-t border-sand/30 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-taupe">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{story.read_time} min read</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {story.status === 'published' ? (
                            <>
                              <CheckCircle size={12} />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <FileText size={12} />
                              <span>Draft</span>
                            </>
                          )}
                        </div>
                      </div>

                      {isActive && (
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/brand/stories/${story.story_id}/edit`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-wide border border-sand text-stone hover:text-charcoal-deep hover:border-charcoal-deep/50 transition-colors"
                          >
                            <Pencil size={12} />
                            Edit
                          </Link>
                          <button
                            onClick={() => setDeleteTargetId(story.story_id)}
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
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-3 bg-red-600 text-white text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <BulkUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            loadStories();
          }}
        />
      )}
    </div>
  );
}
