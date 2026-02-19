'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Edit2, Eye, ShoppingBag, TrendingUp, Trash2, Loader2, Package } from 'lucide-react';
import { BrandPageHeader, SecondaryButton } from '@/components/brand/BrandPageHeader';
import { fetchCollectionDetail, fetchCollectionBasicInfo, softDeleteCollection } from '@/services/brand-collection.service';
import type { CollectionDetailResponse } from '@/services/brand-collection.service';

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<CollectionDetailResponse | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadCollection();
  }, [collectionId]);

  const loadCollection = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [detail, basicInfo] = await Promise.all([
        fetchCollectionDetail(collectionId),
        fetchCollectionBasicInfo(collectionId),
      ]);
      setCollection(detail);
      setIsActive(basicInfo?.is_active ?? false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collection');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await softDeleteCollection(collectionId);
      router.push('/brand/collections');
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
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
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-taupe" />
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone">{error || 'Collection not found'}</p>
        <Link
          href="/brand/collections"
          className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
        >
          <ArrowLeft size={16} /> Back to Collections
        </Link>
      </div>
    );
  }

  return (
    <div>
      <BrandPageHeader
        title={collection.collection_name}
        breadcrumbs={[
          { label: 'Collections', href: '/brand/collections' },
          { label: collection.collection_name }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <SecondaryButton href="/brand/collections" icon={ArrowLeft}>
              Back
            </SecondaryButton>
            {isActive && (
              <>
                <SecondaryButton href={`/brand/collections/${collectionId}/edit`} icon={Edit2}>
                  Edit Collection
                </SecondaryButton>
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

      <div className="p-8 space-y-8">
        {/* Hero Section */}
        <div className="bg-white border border-sand/50 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image */}
            <div className="aspect-[16/9] lg:aspect-auto lg:h-80 bg-parchment relative">
              {collection.collection_image ? (
                <Image
                  src={collection.collection_image}
                  alt={collection.collection_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-taupe">
                  <Package size={48} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge(collection.collection_status)}`}>
                  {collection.collection_status}
                </span>
                <span className="text-sm text-taupe">
                  {collection.season} {collection.year}
                </span>
              </div>

              <h2 className="font-display text-3xl text-charcoal-deep mb-3">
                {collection.collection_name}
              </h2>

              <p className="text-stone leading-relaxed mb-6">
                {collection.collection_description}
              </p>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-taupe uppercase tracking-wider">Products</p>
                  <p className="text-2xl font-display text-charcoal-deep mt-1">
                    {collection.number_of_products}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-taupe uppercase tracking-wider">Revenue</p>
                  <p className="text-2xl font-display text-charcoal-deep mt-1">
                    {formatCurrency(collection.revenue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-taupe uppercase tracking-wider">Views</p>
                  <p className="text-2xl font-display text-charcoal-deep mt-1">
                    {collection.views.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-sand/50 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-parchment flex items-center justify-center text-stone">
                <ShoppingBag size={18} />
              </div>
              <div>
                <p className="text-xs text-taupe">Total Revenue</p>
                <p className="text-lg font-display text-charcoal-deep">
                  {formatCurrency(collection.revenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-sand/50 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-parchment flex items-center justify-center text-stone">
                <Eye size={18} />
              </div>
              <div>
                <p className="text-xs text-taupe">Page Views</p>
                <p className="text-lg font-display text-charcoal-deep">
                  {collection.views.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-sand/50 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-parchment flex items-center justify-center text-stone">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-xs text-taupe">Avg. Product Price</p>
                <p className="text-lg font-display text-charcoal-deep">
                  {formatCurrency(collection.average_product_price)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-sand/50 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-parchment flex items-center justify-center text-stone">
                <ShoppingBag size={18} />
              </div>
              <div>
                <p className="text-xs text-taupe">Total Stock</p>
                <p className="text-lg font-display text-charcoal-deep">
                  {collection.total_stocks} units
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products in Collection */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
            <h3 className="font-medium text-charcoal-deep">Products in Collection</h3>
            <span className="text-sm text-stone">{collection.products.length} items</span>
          </div>

          {collection.products.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-stone">No products in this collection</p>
            </div>
          ) : (
            <div>
              {collection.products.map((product, idx) => (
                <div
                  key={`${product.sku}-${idx}`}
                  className="flex items-center gap-4 px-6 py-3 border-b border-sand/30 last:border-b-0"
                >
                  <div className="w-10 h-10 bg-parchment relative overflow-hidden flex-shrink-0">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.product_name}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-charcoal-deep truncate">{product.product_name}</p>
                    <p className="text-xs text-taupe">{product.sku}</p>
                  </div>

                  <div className="text-xs text-stone">
                    {product.units} units
                  </div>

                  <div className="text-sm text-charcoal-deep w-20 text-right">
                    ${product.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-white border border-sand p-8 max-w-md w-full mx-4">
            <h3 className="font-display text-xl text-charcoal-deep mb-3">Delete Collection</h3>
            <p className="text-stone text-sm leading-relaxed mb-2">
              Are you sure you want to delete <span className="font-medium text-charcoal-deep">{collection.collection_name}</span>?
            </p>
            <p className="text-taupe text-xs mb-6">
              This collection will be soft-deleted and set as inactive.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 text-sm text-stone hover:text-charcoal-deep transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete Collection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
