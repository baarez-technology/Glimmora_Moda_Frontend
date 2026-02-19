'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, ChevronRight, Package, Loader2 } from 'lucide-react';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';
import { fetchCollections } from '@/services/brand-collection.service';
import type { CollectionResponse } from '@/services/brand-collection.service';

type FilterTab = 'all' | 'published' | 'draft' | 'deleted';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('all');

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

  const activeCollections = useMemo(() => collections.filter(c => c.is_active), [collections]);
  const deletedCollections = useMemo(() => collections.filter(c => !c.is_active), [collections]);

  const filteredCollections = useMemo(() => {
    if (filter === 'deleted') return deletedCollections;
    return activeCollections.filter(c => {
      if (filter === 'all') return true;
      return c.status === filter;
    });
  }, [activeCollections, deletedCollections, filter]);

  const filterTabs: { value: FilterTab; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: activeCollections.length },
    { value: 'published', label: 'Published', count: activeCollections.filter(c => c.status === 'published').length },
    { value: 'draft', label: 'Draft', count: activeCollections.filter(c => c.status === 'draft').length },
    { value: 'deleted', label: 'Deleted', count: deletedCollections.length },
  ];

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) return 'bg-red-100 text-red-600';
    switch (status) {
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

  if (isLoading) {
    return (
      <div>
        <BrandPageHeader
          title="Collections"
          subtitle="Loading..."
          actions={
            <PrimaryButton href="/brand/collections/new" icon={Plus}>
              Create Collection
            </PrimaryButton>
          }
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
          actions={
            <PrimaryButton href="/brand/collections/new" icon={Plus}>
              Create Collection
            </PrimaryButton>
          }
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
        actions={
          <PrimaryButton href="/brand/collections/new" icon={Plus}>
            Create Collection
          </PrimaryButton>
        }
      />

      <div className="p-8 space-y-6">
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
              <span className={`text-[10px] ${filter === tab.value ? 'text-taupe' : 'text-taupe/60'}`}>
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
    </div>
  );
}
