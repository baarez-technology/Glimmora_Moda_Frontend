'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, ChevronRight, Package } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';

export default function CollectionsPage() {
  const { collections, products } = useBrand();
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'deleted'>('all');

  const activeCollections = collections.filter(c => !c.isDeleted);
  const deletedCollections = collections.filter(c => c.isDeleted);

  const filteredCollections = filter === 'deleted'
    ? deletedCollections
    : activeCollections.filter(c => {
        if (filter === 'all') return true;
        return c.status === filter;
      });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}K`;
    }
    return `€${value.toLocaleString()}`;
  };

  const getStatusBadge = (status: string, isDeleted?: boolean) => {
    if (isDeleted) return 'bg-red-100 text-red-600';
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
          {[
            { value: 'all' as const, label: 'All', count: activeCollections.length },
            { value: 'published' as const, label: 'Published', count: activeCollections.filter(c => c.status === 'published').length },
            { value: 'draft' as const, label: 'Draft', count: activeCollections.filter(c => c.status === 'draft').length },
            { value: 'deleted' as const, label: 'Deleted', count: deletedCollections.length }
          ].map(tab => (
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
                key={collection.id}
                href={`/brand/collections/${collection.id}`}
                className={`bg-white border border-sand/50 hover:border-sand transition-all group `}
              >
                {/* Hero Image */}
                <div className="aspect-[16/9] bg-parchment relative overflow-hidden">
                  {collection.heroImage ? (
                    <Image
                      src={collection.heroImage}
                      alt={collection.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-taupe">
                      <Package size={32} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge(collection.status, collection.isDeleted)}`}>
                      {collection.isDeleted ? 'Deleted' : collection.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-charcoal-deep group-hover:text-gold-muted transition-colors">
                        {collection.name}
                      </h3>
                      <p className="text-xs text-taupe">{collection.season} {collection.year}</p>
                    </div>
                    <ChevronRight size={16} className="text-taupe group-hover:text-charcoal-deep transition-colors mt-1" />
                  </div>

                  <p className="text-sm text-stone line-clamp-2 mb-4">
                    {collection.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-sand/50">
                    <div>
                      <p className="text-xs text-taupe">Products</p>
                      <p className="text-sm font-medium text-charcoal-deep">{collection.productCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-taupe">Revenue</p>
                      <p className="text-sm font-medium text-charcoal-deep">
                        {formatCurrency(collection.totalRevenue)}
                      </p>
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
