'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Edit2, Eye, ShoppingBag, TrendingUp } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, SecondaryButton } from '@/components/brand/BrandPageHeader';
import { ProductListItem } from '@/components/brand/ProductCard';

export default function CollectionDetailPage() {
  const params = useParams();
  const { getCollectionById, products } = useBrand();

  const collectionId = params.id as string;
  const collection = getCollectionById(collectionId);

  if (!collection) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone">Collection not found</p>
        <Link
          href="/brand/collections"
          className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
        >
          <ArrowLeft size={16} /> Back to Collections
        </Link>
      </div>
    );
  }

  // Get products in this collection
  const collectionProducts = products.filter(p => collection.productIds.includes(p.id));

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}K`;
    }
    return `€${value.toLocaleString()}`;
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

  return (
    <div>
      <BrandPageHeader
        title={collection.name}
        breadcrumbs={[
          { label: 'Collections', href: '/brand/collections' },
          { label: collection.name }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <SecondaryButton href="/brand/collections" icon={ArrowLeft}>
              Back
            </SecondaryButton>
            <SecondaryButton href={`/brand/collections/${collectionId}/edit`} icon={Edit2}>
              Edit Collection
            </SecondaryButton>
          </div>
        }
      />

      <div className="p-8 space-y-8">
        {/* Hero Section */}
        <div className="bg-white border border-sand/50 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image */}
            <div className="aspect-[16/9] lg:aspect-auto lg:h-80 bg-parchment relative">
              {collection.heroImage ? (
                <Image
                  src={collection.heroImage}
                  alt={collection.name}
                  fill
                  className="object-cover"
                />
              ) : null}
            </div>

            {/* Info */}
            <div className="p-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge(collection.status)}`}>
                  {collection.status}
                </span>
                <span className="text-sm text-taupe">
                  {collection.season} {collection.year}
                </span>
              </div>

              <h2 className="font-display text-3xl text-charcoal-deep mb-3">
                {collection.name}
              </h2>

              <p className="text-stone leading-relaxed mb-6">
                {collection.description}
              </p>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-taupe uppercase tracking-wider">Products</p>
                  <p className="text-2xl font-display text-charcoal-deep mt-1">
                    {collection.productCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-taupe uppercase tracking-wider">Revenue</p>
                  <p className="text-2xl font-display text-charcoal-deep mt-1">
                    {formatCurrency(collection.totalRevenue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-taupe uppercase tracking-wider">Views</p>
                  <p className="text-2xl font-display text-charcoal-deep mt-1">
                    {collection.viewCount.toLocaleString()}
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
                  {formatCurrency(collection.totalRevenue)}
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
                  {collection.viewCount.toLocaleString()}
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
                  {formatCurrency(
                    collectionProducts.reduce((sum, p) => sum + p.price, 0) / (collectionProducts.length || 1)
                  )}
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
                  {collectionProducts.reduce((sum, p) => sum + p.totalStock, 0)} units
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products in Collection */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
            <h3 className="font-medium text-charcoal-deep">Products in Collection</h3>
            <span className="text-sm text-stone">{collectionProducts.length} items</span>
          </div>

          {collectionProducts.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-stone">No products in this collection</p>
            </div>
          ) : (
            <div>
              {collectionProducts.map(product => (
                <ProductListItem key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
