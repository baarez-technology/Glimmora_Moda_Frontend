'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Clock, CheckCircle, FileText, Edit, Package,
  Trash2, Loader2, BookOpen, Download, ChevronDown, FileJson,
  FileSpreadsheet, Plus, X, Check, Loader2 as Spinner,
} from 'lucide-react';
import { BrandPageHeader, SecondaryButton, PrimaryButton } from '@/components/brand/BrandPageHeader';
import { fetchStory, updateStory, softDeleteStory, fetchProductsList } from '@/services/brand-story.service';
import type { StoryResponse, ProductListItem } from '@/services/brand-story.service';
import { exportStoriesToJSON, exportStoriesToCSV, exportStoriesToExcel } from '@/lib/story-export';
import StoryProductPicker from '@/components/brand/StoryProductPicker';

// Small helper — handles broken image URLs gracefully
function ProductSidebarItem({ product }: { product: ProductListItem }) {
  const [imgFailed, setImgFailed] = useState(false);
  const hasImage = !!product.image_url && !imgFailed;
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-parchment/30 transition-colors">
      <div className="w-10 h-10 bg-parchment flex-shrink-0 overflow-hidden">
        {hasImage ? (
          <img
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={14} className="text-taupe/40" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-charcoal-deep truncate">{product.product_name}</p>
        <p className="text-xs font-medium text-charcoal-deep/70">
          {product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;

  const [story, setStory] = useState<StoryResponse | null>(null);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [pendingProductList, setPendingProductList] = useState<string[]>([]);
  const [isSavingProducts, setIsSavingProducts] = useState(false);

  useEffect(() => {
    loadStory();
  }, [storyId]);

  const loadStory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [storyData, productData] = await Promise.all([
        fetchStory(storyId),
        fetchProductsList(),
      ]);
      setStory(storyData);
      setProducts(productData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load story');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'heritage': return 'bg-gold-soft/20 text-gold-deep';
      case 'craftsmanship': return 'bg-champagne/30 text-gold-muted';
      case 'collection': return 'bg-info/10 text-info';
      case 'artisan': return 'bg-parchment text-charcoal-deep';
      default: return 'bg-taupe/20 text-stone';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return 'bg-success/10 text-success';
      case 'draft': return 'bg-warning/10 text-warning';
      default: return 'bg-taupe/20 text-stone';
    }
  };

  const handlePublish = async () => {
    if (!story) return;
    setIsUpdating(true);
    try {
      await updateStory(storyId, { status: 'published' });
      await loadStory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish story');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnpublish = async () => {
    if (!story) return;
    setIsUpdating(true);
    try {
      await updateStory(storyId, { status: 'draft' });
      await loadStory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unpublish story');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await softDeleteStory(storyId);
      router.push('/brand/stories');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete story');
      setIsDeleting(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv' | 'excel') => {
    if (!story) return;
    setShowExportMenu(false);
    if (format === 'json') exportStoriesToJSON([story], `story-${story.story_id}.json`);
    else if (format === 'csv') exportStoriesToCSV([story], `story-${story.story_id}.csv`);
    else await exportStoriesToExcel([story], `story-${story.story_id}.xlsx`);
  };

  const openProductModal = () => {
    if (!story) return;
    setPendingProductList([...(story.product_list || [])]);
    setShowProductModal(true);
  };

  const togglePending = (pid: string) => {
    setPendingProductList(prev =>
      prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
    );
  };

  const saveProducts = async () => {
    if (!story) return;
    setIsSavingProducts(true);
    try {
      await updateStory(storyId, { product_list: pendingProductList });
      setShowProductModal(false);
      await loadStory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update products');
    } finally {
      setIsSavingProducts(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <BrandPageHeader
          title="Story"
          subtitle="Loading..."
          actions={
            <SecondaryButton href="/brand/stories" icon={ArrowLeft}>
              Back
            </SecondaryButton>
          }
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-taupe" />
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="p-8 text-center">
        <BookOpen size={48} className="mx-auto text-taupe/40 mb-4" />
        <p className="text-stone">{error || 'Story not found'}</p>
        <Link
          href="/brand/stories"
          className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
        >
          <ArrowLeft size={16} /> Back to Stories
        </Link>
      </div>
    );
  }

  const contentSections = Array.isArray(story.content) ? story.content : [];

  const relatedProductItems = (story.product_list || []).map(pid => {
    const product = products.find(p => String(p.product_id) === String(pid));
    return product || null;
  }).filter(Boolean) as ProductListItem[];

  return (
    <div>
      <BrandPageHeader
        title={story.title}
        breadcrumbs={[
          { label: 'Stories', href: '/brand/stories' },
          { label: story.title },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <SecondaryButton href="/brand/stories" icon={ArrowLeft}>
              Back
            </SecondaryButton>

            {/* Export dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(v => !v)}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-sand text-sm text-stone hover:text-charcoal-deep hover:border-charcoal-deep/40 transition-colors"
              >
                <Download size={15} />
                Export
                <ChevronDown size={12} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-sand shadow-lg z-30">
                  <button onClick={() => handleExport('json')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone hover:bg-parchment hover:text-charcoal-deep transition-colors text-left">
                    <FileJson size={14} className="text-gold-muted" /> Export as JSON
                  </button>
                  <button onClick={() => handleExport('csv')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone hover:bg-parchment hover:text-charcoal-deep transition-colors text-left">
                    <FileText size={14} className="text-info" /> Export as CSV
                  </button>
                  <button onClick={() => handleExport('excel')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone hover:bg-parchment hover:text-charcoal-deep transition-colors text-left">
                    <FileSpreadsheet size={14} className="text-success" /> Export as Excel
                  </button>
                </div>
              )}
            </div>

            {story.is_active === true && (
              <>
                <PrimaryButton href={`/brand/stories/${story.story_id}/edit`} icon={Edit}>
                  Edit
                </PrimaryButton>
                {story.status === 'draft' ? (
                  <PrimaryButton onClick={handlePublish} disabled={isUpdating}>
                    {isUpdating ? 'Publishing...' : 'Publish'}
                  </PrimaryButton>
                ) : (
                  <SecondaryButton onClick={handleUnpublish} disabled={isUpdating}>
                    {isUpdating ? 'Updating...' : 'Unpublish'}
                  </SecondaryButton>
                )}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-red-200 text-red-600 text-sm tracking-wide hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </>
            )}
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>
        )}

        {/* Hero Section */}
        <div className="relative aspect-[21/9] bg-parchment overflow-hidden">
          {story.image_url ? (
            <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-taupe">
              <BookOpen size={48} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-noir/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 text-xs tracking-[0.1em] uppercase ${!story.is_active ? 'bg-red-100 text-red-600' : getTypeBadge(story.story_type)}`}>
                {!story.is_active ? 'Deleted' : story.story_type}
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
                <span>{story.read_time} min read</span>
              </div>
              {story.status === 'published' && (
                <div className="flex items-center gap-1">
                  <CheckCircle size={14} />
                  <span>Published</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Content Preview</h2>
              </div>
              <div className="p-6 space-y-6">
                {contentSections.length === 0 ? (
                  <p className="text-sm text-taupe text-center py-8">No content sections yet</p>
                ) : (
                  contentSections.map((section: Record<string, unknown>, index: number) => {
                    const sType = section.type as string;
                    const sContent = (section.content as string) || '';
                    const sCaption = (section.caption as string) || '';
                    const sMediaUrl = (section.mediaUrl as string) || '';
                    return (
                      <div key={index} className="prose prose-sm max-w-none">
                        {sType === 'text' && (
                          <p className="text-charcoal-deep leading-relaxed">{sContent}</p>
                        )}
                        {sType === 'image' && (
                          <div>
                            {sMediaUrl && <img src={sMediaUrl} alt={sCaption} className="w-full h-auto" />}
                            {sCaption && <p className="text-xs text-taupe text-center mt-2 italic">{sCaption}</p>}
                          </div>
                        )}
                        {sType === 'quote' && (
                          <blockquote className="border-l-2 border-gold-muted pl-4 py-2">
                            <p className="text-charcoal-deep italic">{sContent}</p>
                            {sCaption && <cite className="text-xs text-taupe block mt-2">— {sCaption}</cite>}
                          </blockquote>
                        )}
                        {sType === 'timeline' && (
                          <div className="border border-sand p-4 bg-parchment/30">
                            <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Timeline</p>
                            <div className="space-y-2">
                              {sContent.split('|').map((item: string, i: number) => (
                                <p key={i} className="text-sm text-charcoal-deep">{item.trim()}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
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
                  <span className="text-sm text-charcoal-deep font-mono">{story.story_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Type</span>
                  <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${getTypeBadge(story.story_type)}`}>
                    {story.story_type}
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
                  <span className="text-sm text-charcoal-deep">{story.read_time} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Sections</span>
                  <span className="text-sm text-charcoal-deep">{story.sections}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Created</span>
                  <span className="text-sm text-charcoal-deep">{formatDate(story.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Related Products — always shown */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-stone" />
                  <h2 className="font-medium text-charcoal-deep">Related Products</h2>
                  {relatedProductItems.length > 0 && (
                    <span className="text-[10px] bg-parchment px-1.5 py-0.5 text-taupe">
                      {relatedProductItems.length}
                    </span>
                  )}
                </div>
                {story.is_active && (
                  <button
                    onClick={openProductModal}
                    className="inline-flex items-center gap-1 text-xs text-stone hover:text-charcoal-deep transition-colors border border-sand px-2.5 py-1 hover:border-charcoal-deep/40"
                  >
                    <Plus size={11} />
                    {relatedProductItems.length > 0 ? 'Manage' : 'Add Products'}
                  </button>
                )}
              </div>

              {relatedProductItems.length === 0 ? (
                <div className="p-6 text-center">
                  <Package size={28} className="mx-auto text-taupe/30 mb-2" />
                  <p className="text-xs text-stone font-medium">No products attached</p>
                  <p className="text-[11px] text-taupe mt-1">Link products to this story for discovery.</p>
                  {story.is_active && (
                    <button
                      onClick={openProductModal}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-charcoal-deep border border-sand px-3 py-1.5 hover:bg-parchment transition-colors"
                    >
                      <Plus size={11} /> Add Products
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {relatedProductItems.map(product => (
                    <ProductSidebarItem key={product.product_id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-noir/40">
          <div className="bg-white p-8 max-w-md w-full mx-4 border border-sand">
            <h3 className="font-display text-lg text-charcoal-deep mb-3">Delete Story</h3>
            <p className="text-sm text-stone mb-2">
              Are you sure you want to delete <span className="font-medium text-charcoal-deep">{story.title}</span>?
            </p>
            <p className="text-xs text-taupe mb-6">
              This story will be removed from your dashboard. This action can be restored by an administrator.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-6 py-3 text-sm text-stone hover:text-charcoal-deep transition-colors">
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

      {/* Product Management Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-noir/50 p-4">
          <div className="bg-white w-full max-w-2xl border border-sand shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-sand/50">
              <div>
                <h2 className="font-display text-base text-charcoal-deep tracking-wide">Manage Products</h2>
                <p className="text-xs text-stone mt-0.5">Search, filter and attach products to this story</p>
              </div>
              <button onClick={() => setShowProductModal(false)} className="p-1.5 text-taupe hover:text-charcoal-deep transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <StoryProductPicker
                selectedIds={pendingProductList}
                onToggle={togglePending}
              />
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-sand/50">
              <button
                onClick={() => setShowProductModal(false)}
                className="px-6 py-2.5 text-sm text-stone hover:text-charcoal-deep transition-colors border border-sand hover:border-charcoal-deep/40"
              >
                Cancel
              </button>
              <button
                onClick={saveProducts}
                disabled={isSavingProducts}
                className="px-6 py-2.5 bg-charcoal-deep text-white text-sm hover:bg-noir transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSavingProducts ? <><Spinner size={14} className="animate-spin" /> Saving…</> : <><Check size={14} /> Save Products</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
