'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import type { BrandProduct } from '@/types/brand-portal';
import { computeTotalUnits, type BackendProduct } from '@/services/brand-product.service';
import { formatPrice } from '@/lib/currency';

function computeDemandScore(product: BackendProduct): number {
  return product.performance_metrics?.demand_score ?? 0;
}

// ─── Cards for BackendProduct (real API data) ────────────────────────────────

interface ApiProductCardProps {
  product: BackendProduct;
  showMetrics?: boolean;
}

export function ApiProductCard({ product, showMetrics = true }: ApiProductCardProps) {
  const totalUnits = computeTotalUnits(product);
  const isLowStock = product.is_low_stock || (totalUnits > 0 && totalUnits <= 10);
  const isOutOfStock = totalUnits === 0;
  const demandScore = computeDemandScore(product);

  const getStatusBadge = () => {
    if (!product.is_active) {
      return (
        <span className="px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-red-100 text-red-600">
          Deleted
        </span>
      );
    }
    switch (product.status) {
      case 'published':
        return (
          <span className="px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-success/10 text-success">
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-taupe/20 text-stone">
            Draft
          </span>
        );
      case 'archived':
        return (
          <span className="px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-stone/10 text-stone">
            Archived
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-taupe/20 text-stone">
            {product.status}
          </span>
        );
    }
  };

  return (
    <Link
      href={`/brand/products/${product.product_id}`}
      className="block bg-white border border-sand/50 hover:border-sand transition-colors group"
    >
      <div className="flex items-stretch">
        {/* Product Image */}
        <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-parchment relative overflow-hidden">
          {product.product_image ? (
            <Image
              src={product.product_image}
              alt={product.product_name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-taupe text-sm">
              No image
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-charcoal-deep truncate group-hover:text-gold-muted transition-colors">
                {product.product_name}
              </h3>
              <p className="text-xs text-taupe mt-0.5">{product.collection_name}</p>
            </div>
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-stone">
            <span className="font-medium text-charcoal-deep">
              {formatPrice(product.price)}
            </span>
            <span className="text-taupe">|</span>
            <span>SKU: {product.sku}</span>
          </div>

          {/* Stock & Metrics Row */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-1.5 text-xs ${
                isOutOfStock ? 'text-error' :
                isLowStock ? 'text-warning' :
                'text-stone'
              }`}>
                {(isOutOfStock || isLowStock) && <AlertTriangle size={12} />}
                <span>
                  {isOutOfStock ? 'Out of stock' : `${totalUnits} units`}
                </span>
              </div>

              {showMetrics && (
                <>
                  <span className="text-taupe">|</span>
                  <div className="flex items-center gap-1 text-xs">
                    {demandScore >= 80 ? (
                      <TrendingUp size={12} className="text-success" />
                    ) : demandScore <= 40 ? (
                      <TrendingDown size={12} className="text-error" />
                    ) : null}
                    <span className="text-stone">Demand: {demandScore}</span>
                  </div>
                </>
              )}
            </div>

            <ChevronRight
              size={16}
              className="text-taupe group-hover:text-charcoal-deep transition-colors"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ApiProductGridCard({ product }: { product: BackendProduct }) {
  const totalUnits = computeTotalUnits(product);
  const demandScore = computeDemandScore(product);

  const getStatusBadge = () => {
    if (!product.is_active) return 'bg-red-100 text-red-600';
    switch (product.status) {
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
    <Link
      href={`/brand/products/${product.product_id}`}
      className="block bg-white border border-sand/50 hover:border-sand transition-all group"
    >
      {/* Image */}
      <div className="aspect-square bg-parchment relative overflow-hidden">
        {product.product_image ? (
          <Image
            src={product.product_image}
            alt={product.product_name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-taupe text-sm">
            No image
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge()}`}>
            {!product.is_active ? 'Deleted' : product.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-charcoal-deep truncate">
          {product.product_name}
        </h3>
        <p className="text-xs text-taupe mt-1">{product.sku}</p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-sm font-medium text-charcoal-deep">
            {formatPrice(product.price)}
          </span>
          <span className={`text-xs ${totalUnits === 0 ? 'text-error' : totalUnits <= 10 ? 'text-warning' : 'text-stone'}`}>
            {totalUnits === 0 ? 'Out of stock' : `${totalUnits} units`}
          </span>
        </div>

        <div className="flex items-center gap-1 mt-2 text-xs">
          {demandScore >= 80 ? (
            <TrendingUp size={12} className="text-success" />
          ) : demandScore <= 40 ? (
            <TrendingDown size={12} className="text-error" />
          ) : null}
          <span className="text-stone">Demand: {demandScore}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Legacy Cards for BrandProduct (mock data / BrandContext) ────────────────

interface ProductCardProps {
  product: BrandProduct;
  showMetrics?: boolean;
}

export function ProductCard({ product, showMetrics = true }: ProductCardProps) {
  const getStatusBadge = () => {
    if (product.isDeleted) {
      return (
        <span className="px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-red-100 text-red-600">
          Deleted
        </span>
      );
    }
    switch (product.status) {
      case 'published':
        return (
          <span className="px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-success/10 text-success">
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-taupe/20 text-stone">
            Draft
          </span>
        );
      case 'archived':
        return (
          <span className="px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-stone/10 text-stone">
            Archived
          </span>
        );
    }
  };

  const isLowStock = product.totalStock > 0 && product.totalStock <= 10;
  const isOutOfStock = product.totalStock === 0;

  const formatCurrency = (value: number) => {
    return formatPrice(value);
  };

  return (
    <Link
      href={`/brand/products/${product.id}`}
      className="block bg-white border border-sand/50 hover:border-sand transition-colors group"
    >
      <div className="flex items-stretch">
        {/* Product Image */}
        <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-parchment relative overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-taupe text-sm">
              No image
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-charcoal-deep truncate group-hover:text-gold-muted transition-colors">
                {product.name}
              </h3>
              <p className="text-xs text-taupe mt-0.5">{product.category}</p>
            </div>
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-stone">
            <span className="font-medium text-charcoal-deep">
              {formatCurrency(product.price)}
            </span>
            <span className="text-taupe">|</span>
            <span>SKU: {product.sku}</span>
          </div>

          {/* Stock & Metrics Row */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4">
              {/* Stock Indicator */}
              <div className={`flex items-center gap-1.5 text-xs ${
                isOutOfStock ? 'text-error' :
                isLowStock ? 'text-warning' :
                'text-stone'
              }`}>
                {(isOutOfStock || isLowStock) && (
                  <AlertTriangle size={12} />
                )}
                <span>
                  {isOutOfStock ? 'Out of stock' : `${product.totalStock} units`}
                </span>
              </div>

              {/* Demand Score */}
              {showMetrics && product.demandScore > 0 && (
                <>
                  <span className="text-taupe">|</span>
                  <div className="flex items-center gap-1 text-xs">
                    {product.demandScore >= 80 ? (
                      <TrendingUp size={12} className="text-success" />
                    ) : product.demandScore <= 40 ? (
                      <TrendingDown size={12} className="text-error" />
                    ) : null}
                    <span className="text-stone">
                      Demand: {product.demandScore}
                    </span>
                  </div>
                </>
              )}
            </div>

            <ChevronRight
              size={16}
              className="text-taupe group-hover:text-charcoal-deep transition-colors"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

// Compact list item version
export function ProductListItem({ product }: { product: BrandProduct }) {
  const getStatusColor = () => {
    switch (product.status) {
      case 'published': return 'bg-success';
      case 'draft': return 'bg-taupe';
      case 'archived': return 'bg-stone';
    }
  };

  const isLowStock = product.totalStock > 0 && product.totalStock <= 10;

  return (
    <Link
      href={`/brand/products/${product.id}`}
      className="flex items-center gap-4 px-4 py-3 hover:bg-parchment/50 transition-colors border-b border-sand/30 last:border-b-0"
    >
      {/* Status Indicator */}
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />

      {/* Image */}
      <div className="w-10 h-10 bg-parchment relative overflow-hidden flex-shrink-0">
        {product.images[0] ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].alt}
            fill
            className="object-cover"
          />
        ) : null}
      </div>

      {/* Name & SKU */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-charcoal-deep truncate">{product.name}</p>
        <p className="text-xs text-taupe">{product.sku}</p>
      </div>

      {/* Stock */}
      <div className={`text-xs ${isLowStock ? 'text-warning' : 'text-stone'}`}>
        {product.totalStock} units
      </div>

      {/* Price */}
      <div className="text-sm text-charcoal-deep w-20 text-right">
        {formatPrice(product.price)}
      </div>

      <ChevronRight size={14} className="text-taupe" />
    </Link>
  );
}

// Grid card version
export function ProductGridCard({ product }: { product: BrandProduct }) {
  const getStatusBadge = () => {
    if (product.isDeleted) return 'bg-red-100 text-red-600';
    switch (product.status) {
      case 'published':
        return 'bg-success/10 text-success';
      case 'draft':
        return 'bg-taupe/20 text-stone';
      case 'archived':
        return 'bg-stone/10 text-stone';
    }
  };

  return (
    <Link
      href={`/brand/products/${product.id}`}
      className="block bg-white border border-sand/50 hover:border-sand transition-all group"
    >
      {/* Image */}
      <div className="aspect-square bg-parchment relative overflow-hidden">
        {product.images[0] ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-taupe text-sm">
            No image
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge()}`}>
            {product.isDeleted ? 'Deleted' : product.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-charcoal-deep truncate">
          {product.name}
        </h3>
        <p className="text-xs text-taupe mt-1">{product.sku}</p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-sm font-medium text-charcoal-deep">
            {formatPrice(product.price)}
          </span>
          <span className="text-xs text-stone">
            {product.totalStock} units
          </span>
        </div>
      </div>
    </Link>
  );
}
