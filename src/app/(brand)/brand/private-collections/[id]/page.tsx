'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Sparkles, Users, Calendar, Package, Edit } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, SecondaryButton, PrimaryButton } from '@/components/brand/BrandPageHeader';
import type { PrivateCollectionAccess } from '@/types/uhni';

export default function PrivateCollectionDetailPage() {
  const params = useParams();
  const { getPrivateCollectionById, products } = useBrand();

  const collectionId = params.id as string;
  const collection = getPrivateCollectionById(collectionId);

  if (!collection) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone">Collection not found</p>
        <Link
          href="/brand/private-collections"
          className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
        >
          <ArrowLeft size={16} /> Back to Private Collections
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

  const now = new Date();
  const previewDate = new Date(collection.previewDate);
  const releaseDate = new Date(collection.releaseDate);

  const getStatus = () => {
    if (now >= releaseDate) return { label: 'Active', class: 'bg-success/10 text-success' };
    if (now >= previewDate) return { label: 'Preview', class: 'bg-warning/10 text-warning' };
    return { label: 'Upcoming', class: 'bg-info/10 text-info' };
  };

  const getAccessBadge = (access: PrivateCollectionAccess) => {
    switch (access) {
      case 'uhni_only':
        return { label: 'UHNI Only', class: 'bg-gold-soft/20 text-gold-deep', icon: Sparkles };
      case 'invitation':
        return { label: 'Invitation Only', class: 'bg-champagne/30 text-gold-muted', icon: Lock };
      case 'request':
        return { label: 'Request Access', class: 'bg-info/10 text-info', icon: Users };
      default:
        return { label: access, class: 'bg-taupe/20 text-stone', icon: Lock };
    }
  };

  const status = getStatus();
  const accessBadge = getAccessBadge(collection.accessLevel);
  const AccessIcon = accessBadge.icon;

  return (
    <div>
      <BrandPageHeader
        title={collection.name}
        breadcrumbs={[
          { label: 'Private Collections', href: '/brand/private-collections' },
          { label: collection.name }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <SecondaryButton href="/brand/private-collections" icon={ArrowLeft}>
              Back
            </SecondaryButton>
            <PrimaryButton href={`/brand/private-collections/${collection.id}/edit`} icon={Edit}>
              Edit Collection
            </PrimaryButton>
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {/* Hero Section */}
        <div className="relative aspect-[21/9] bg-parchment overflow-hidden">
          <img
            src={collection.heroImage}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-noir/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl text-ivory-cream">{collection.name}</h2>
              <p className="text-ivory-cream/80 mt-2 max-w-2xl">{collection.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 text-xs tracking-[0.1em] uppercase ${status.class}`}>
                {status.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-[0.1em] uppercase ${accessBadge.class}`}>
                <AccessIcon size={12} />
                {accessBadge.label}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
                <h2 className="font-medium text-charcoal-deep">Collection Products</h2>
                <span className="text-sm text-taupe">{collection.products.length} products</span>
              </div>
              {collection.products.length === 0 ? (
                <div className="p-12 text-center">
                  <Package size={48} className="mx-auto text-taupe/40 mb-4" />
                  <p className="text-stone">No products in this collection yet</p>
                  <p className="text-xs text-taupe mt-1">Edit the collection to add products</p>
                </div>
              ) : (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {collection.products.map(product => (
                    <div key={product.id} className="flex items-center gap-4 p-4 border border-sand/50">
                      <div className="w-16 h-16 bg-parchment flex-shrink-0">
                        {product.images[0] && (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal-deep truncate">{product.name}</p>
                        <p className="text-xs text-taupe">{product.category}</p>
                        <p className="text-sm text-charcoal-deep mt-1">€{product.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Schedule */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
                <Calendar size={18} className="text-stone" />
                <h2 className="font-medium text-charcoal-deep">Schedule</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe">Preview Date</p>
                  <p className="text-sm text-charcoal-deep mt-1">{formatDate(collection.previewDate)}</p>
                  <p className="text-xs text-taupe mt-0.5">
                    {now >= previewDate ? 'Started' : `In ${Math.ceil((previewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days`}
                  </p>
                </div>
                <div className="pt-4 border-t border-sand/30">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe">Release Date</p>
                  <p className="text-sm text-charcoal-deep mt-1">{formatDate(collection.releaseDate)}</p>
                  <p className="text-xs text-taupe mt-0.5">
                    {now >= releaseDate ? 'Released' : `In ${Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days`}
                  </p>
                </div>
              </div>
            </div>

            {/* Access Details */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
                <AccessIcon size={18} className="text-stone" />
                <h2 className="font-medium text-charcoal-deep">Access Settings</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Access Level</span>
                  <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${accessBadge.class}`}>
                    {accessBadge.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Invitation Required</span>
                  <span className="text-sm text-charcoal-deep">
                    {collection.invitationRequired ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Collection Info */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Collection Info</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">ID</span>
                  <span className="text-sm text-charcoal-deep font-mono">{collection.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Brand</span>
                  <span className="text-sm text-charcoal-deep">{collection.brandName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Products</span>
                  <span className="text-sm text-charcoal-deep">{collection.products.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
