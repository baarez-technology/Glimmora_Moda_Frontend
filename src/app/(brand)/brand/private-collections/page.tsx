'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Lock, Sparkles, Users, Calendar, ChevronRight } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';
import type { PrivateCollectionAccess } from '@/types/uhni';

type FilterTab = 'all' | 'active' | 'upcoming' | 'archived';

export default function PrivateCollectionsPage() {
  const { privateCollections } = useBrand();
  const [filter, setFilter] = useState<FilterTab>('all');

  const now = new Date();

  const getCollectionStatus = (previewDate: string, releaseDate: string) => {
    const preview = new Date(previewDate);
    const release = new Date(releaseDate);

    if (now >= release) {
      return 'active';
    } else if (now >= preview) {
      return 'preview';
    } else {
      return 'upcoming';
    }
  };

  const filteredCollections = privateCollections.filter(collection => {
    if (filter === 'all') return true;
    const status = getCollectionStatus(collection.previewDate, collection.releaseDate);
    if (filter === 'active') return status === 'active';
    if (filter === 'upcoming') return status === 'upcoming' || status === 'preview';
    return false;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAccessBadge = (access: PrivateCollectionAccess) => {
    switch (access) {
      case 'uhni_only':
        return { label: 'UHNI Only', class: 'bg-gold-soft/20 text-gold-deep' };
      case 'invitation':
        return { label: 'Invitation', class: 'bg-champagne/30 text-gold-muted' };
      case 'request':
        return { label: 'Request Access', class: 'bg-info/10 text-info' };
      default:
        return { label: access, class: 'bg-taupe/20 text-stone' };
    }
  };

  const getStatusBadge = (previewDate: string, releaseDate: string) => {
    const status = getCollectionStatus(previewDate, releaseDate);
    switch (status) {
      case 'active':
        return { label: 'Active', class: 'bg-success/10 text-success' };
      case 'preview':
        return { label: 'Preview', class: 'bg-warning/10 text-warning' };
      case 'upcoming':
        return { label: 'Upcoming', class: 'bg-info/10 text-info' };
      default:
        return { label: status, class: 'bg-taupe/20 text-stone' };
    }
  };

  const statusCounts = {
    all: privateCollections.length,
    active: privateCollections.filter(c => getCollectionStatus(c.previewDate, c.releaseDate) === 'active').length,
    upcoming: privateCollections.filter(c => {
      const status = getCollectionStatus(c.previewDate, c.releaseDate);
      return status === 'upcoming' || status === 'preview';
    }).length,
    archived: 0
  };

  const filterTabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'upcoming', label: 'Upcoming' }
  ];

  return (
    <div>
      <BrandPageHeader
        title="Private Collections"
        subtitle={`${filteredCollections.length} exclusive collection${filteredCollections.length !== 1 ? 's' : ''}`}
        actions={
          <PrimaryButton href="/brand/private-collections/new" icon={Plus}>
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
                {statusCounts[tab.value]}
              </span>
            </button>
          ))}
        </div>

        {/* Collections Grid */}
        {filteredCollections.length === 0 ? (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <Lock size={48} className="mx-auto text-taupe/40 mb-4" />
            <p className="text-stone">No private collections found</p>
            <Link
              href="/brand/private-collections/new"
              className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
            >
              <Plus size={16} /> Create your first collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map(collection => {
              const accessBadge = getAccessBadge(collection.accessLevel);
              const statusBadge = getStatusBadge(collection.previewDate, collection.releaseDate);
              return (
                <Link
                  key={collection.id}
                  href={`/brand/private-collections/${collection.id}`}
                  className="bg-white border border-sand/50 hover:border-sand transition-colors group"
                >
                  {/* Hero Image */}
                  <div className="aspect-[16/9] bg-parchment relative overflow-hidden">
                    <img
                      src={collection.heroImage}
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`px-2 py-1 text-[9px] tracking-[0.1em] uppercase ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 text-[9px] tracking-[0.1em] uppercase ${accessBadge.class}`}>
                        {accessBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-medium text-charcoal-deep group-hover:text-gold-muted transition-colors">
                      {collection.name}
                    </h3>
                    <p className="text-sm text-stone mt-1 line-clamp-2">{collection.description}</p>

                    <div className="mt-4 pt-4 border-t border-sand/30 flex items-center justify-between text-xs text-taupe">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>Release: {formatDate(collection.releaseDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={12} />
                        <span>{collection.products.length} products</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
