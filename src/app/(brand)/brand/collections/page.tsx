'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, ChevronRight, Package, Loader2, Download, Upload, ChevronDown, FileJson, FileText, FileSpreadsheet } from 'lucide-react';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';
import { BrandHero } from '@/components/brand/BrandHero';
import { BrandKpiCard } from '@/components/brand/BrandKpiCard';
import { fetchCollections, exportCollectionsFromBackend } from '@/services/brand-collection.service';
import type { CollectionResponse } from '@/services/brand-collection.service';
import CollectionBulkUploadModal from '@/components/brand/CollectionBulkUploadModal';

type FilterTab = 'all' | 'published' | 'draft' | 'deleted';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<'json' | 'csv' | 'excel' | null>(null);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCollections();
      setCollections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv' | 'excel') => {
    setShowExportMenu(false);
    setExportingFormat(format);
    try {
      const result = await exportCollectionsFromBackend(format);
      setExportToast(`Exported${result.record_count !== undefined ? ` ${result.record_count}` : ''} collection${result.record_count !== 1 ? 's' : ''} as ${format.toUpperCase()}`);
      setTimeout(() => setExportToast(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExportingFormat(null);
    }
  };

  const activeCollections = useMemo(() => collections.filter(c => c.is_active), [collections]);
  const deletedCollections = useMemo(() => collections.filter(c => !c.is_active), [collections]);

  const normalizeStatus = (s: string) => s?.toLowerCase();

  const filteredCollections = useMemo(() => {
    if (filter === 'deleted') return deletedCollections;
    return activeCollections.filter(c => {
      if (filter === 'all') return true;
      return normalizeStatus(c.status) === filter;
    });
  }, [activeCollections, deletedCollections, filter]);

  const filterTabs: { value: FilterTab; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: activeCollections.length },
    { value: 'published', label: 'Published', count: activeCollections.filter(c => normalizeStatus(c.status) === 'published').length },
    { value: 'draft', label: 'Draft', count: activeCollections.filter(c => normalizeStatus(c.status) === 'draft').length },
    { value: 'deleted', label: 'Deleted', count: deletedCollections.length },
  ];

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) return 'bg-red-100 text-red-600';
    switch (status?.toLowerCase()) {
      case 'published':
        return 'bg-success/10 text-success';
      case 'draft':
        return 'bg-taupe/20 text-stone';
      case 'archived':
        return 'bg-stone/10 text-stone';
      default:
        return 'bg-taupe/20 text-stone';
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
          {exportingFormat ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          {exportingFormat ? 'Exporting…' : 'Export'}
          {!exportingFormat && <ChevronDown size={13} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />}
        </button>
        {showExportMenu && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-sand shadow-lg z-30">
            <div className="px-4 py-2 border-b border-sand/40">
              <p className="text-[10px] tracking-[0.1em] uppercase text-taupe">Via backend · S3</p>
            </div>
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

      <button
        onClick={() => setShowUploadModal(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 border border-sand text-sm text-stone hover:text-charcoal-deep hover:border-charcoal-deep/40 transition-colors tracking-wide"
      >
        <Upload size={15} />
        Import Collections
      </button>

      <PrimaryButton href="/brand/collections/new" icon={Plus}>
        Create Collection
      </PrimaryButton>
    </div>
  );

  if (isLoading) {
    return (
      <div>
        <BrandPageHeader
          title="Collections"
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
          title="Collections"
          subtitle="Error"
          actions={headerActions}
        />
        <div className="p-8 text-center">
          <p className="text-error mb-4">{error}</p>
          <button
            onClick={loadCollections}
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
        title="Collections"
        subtitle={`${filteredCollections.length} collection${filteredCollections.length !== 1 ? 's' : ''}`}
        actions={headerActions}
      />

      <div className="p-6 md:p-8 lg:p-10 space-y-10">
        {/* Luxury Hero */}
        <BrandHero
          title="Collections"
          emphasis="curated narratives"
          description="A collection is more than pieces — it is a season, a mood, a story you tell. Group, publish, and share."
        />

        {/* KPI Strip */}
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-display text-xl text-charcoal-deep tracking-[-0.01em]">Library</h2>
            <span className="text-[10px] tracking-[0.3em] uppercase text-taupe">Curatorial overview</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <BrandKpiCard
              label="Active Collections"
              value={activeCollections.length}
              hint="all narratives"
              accent="gold"
            />
            <BrandKpiCard
              label="Published"
              value={activeCollections.filter(c => normalizeStatus(c.status) === 'published').length}
              hint="visible to customers"
              accent="success"
            />
            <BrandKpiCard
              label="Drafts"
              value={activeCollections.filter(c => normalizeStatus(c.status) === 'draft').length}
              hint="awaiting curation"
              accent="warning"
            />
            <BrandKpiCard
              label="Archived"
              value={deletedCollections.length}
              hint="retired but preserved"
              accent="neutral"
            />
          </div>
        </section>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-parchment p-1 w-fit">
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 text-xs tracking-[0.1em] uppercase transition-colors flex items-center gap-2 ${
                filter === tab.value
                  ? 'bg-white text-charcoal-deep'
                  : 'text-stone hover:text-charcoal-deep'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] font-medium ${filter === tab.value ? 'text-charcoal-deep' : 'text-taupe'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Collections Grid */}
        {filteredCollections.length === 0 ? (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <p className="text-stone">No collections found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map(collection => (
              <Link
                key={collection.collection_id}
                href={`/brand/collections/${collection.collection_id}`}
                className="bg-white border border-sand/50 hover:border-sand transition-all group"
              >
                {/* Hero Image */}
                <div className="aspect-[16/9] bg-parchment relative overflow-hidden">
                  {collection.collection_image ? (
                    <Image
                      src={collection.collection_image}
                      alt={collection.collection_name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-taupe">
                      <Package size={32} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge(collection.status, collection.is_active)}`}>
                      {!collection.is_active ? 'Deleted' : collection.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-charcoal-deep group-hover:text-gold-muted transition-colors">
                        {collection.collection_name}
                      </h3>
                      <p className="text-xs text-taupe">{collection.season} {collection.year}</p>
                    </div>
                    <ChevronRight size={16} className="text-taupe group-hover:text-charcoal-deep transition-colors mt-1" />
                  </div>

                  <p className="text-sm text-stone line-clamp-2">
                    {collection.collection_description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Export success toast */}
      {exportToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 bg-success/10 border border-success/30 text-success shadow-lg">
          <span>{exportToast}</span>
          <button onClick={() => setExportToast(null)} className="text-success/60 hover:text-success transition-colors text-lg leading-none">×</button>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <CollectionBulkUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => { setShowUploadModal(false); loadCollections(); }}
        />
      )}
    </div>
  );
}
