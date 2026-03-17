'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Pencil, Percent, Tag, Calendar, Package, FolderOpen, Building, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';
import { BrandPageHeader, SecondaryButton } from '@/components/brand/BrandPageHeader';
import { fetchUhniOffer, type ApiOffer } from '@/services/uhni-offers.service';
import { fetchProducts, type BackendProduct } from '@/services/brand-product.service';
import { fetchCollections, type CollectionResponse } from '@/services/brand-collection.service';
import { useApp } from '@/context/AppContext';

function getOfferStatus(offer: ApiOffer): 'active' | 'upcoming' | 'expired' {
  const now = new Date();
  const from = new Date(offer.valid_from);
  const until = new Date(offer.valid_until);
  if (now < from) return 'upcoming';
  if (now > until || offer.is_expired) return 'expired';
  return 'active';
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

const STATUS_CONFIG = {
  active: { label: 'Active', icon: CheckCircle, badge: 'bg-success/10 text-success' },
  upcoming: { label: 'Upcoming', icon: Clock, badge: 'bg-info/10 text-info' },
  expired: { label: 'Expired', icon: XCircle, badge: 'bg-taupe/20 text-stone' },
};

const TYPE_INFO: Record<string, { label: string; icon: React.ElementType; bg: string }> = {
  products: { label: 'Products', icon: Package, bg: 'bg-gold-soft/20 text-gold-deep' },
  collections: { label: 'Collections', icon: FolderOpen, bg: 'bg-champagne/30 text-gold-muted' },
  brand: { label: 'Brand-wide', icon: Building, bg: 'bg-parchment text-charcoal-deep' },
};

export default function ViewOfferPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useApp();
  const [offer, setOffer] = useState<ApiOffer | null>(null);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [collections, setCollections] = useState<CollectionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchUhniOffer(id),
      fetchProducts().catch(() => []),
      fetchCollections().catch(() => []),
    ]).then(([offerData, prods, cols]) => {
      setOffer(offerData);
      setProducts(prods);
      setCollections(cols);
    }).catch(() => showToast('Failed to load offer', 'error'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div>
        <BrandPageHeader title="Offer Details" breadcrumbs={[{ label: 'UHNI Offers', href: '/brand/offers' }, { label: 'Loading...' }]} />
        <div className="p-8 text-center text-stone">Loading...</div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div>
        <BrandPageHeader title="Offer Details" breadcrumbs={[{ label: 'UHNI Offers', href: '/brand/offers' }, { label: 'Not Found' }]} />
        <div className="p-8 text-center text-stone">Offer not found.</div>
      </div>
    );
  }

  const status = getOfferStatus(offer);
  const statusConfig = STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;
  const typeKey = offer.offer_type in TYPE_INFO ? offer.offer_type : 'brand';
  const typeInfo = TYPE_INFO[typeKey];
  const TypeIcon = typeInfo.icon;

  const matchedProducts = offer.offer_type === 'products'
    ? offer.offer_products.map(id => products.find(p => p.product_id === id)).filter(Boolean) as BackendProduct[]
    : [];

  const matchedCollections = offer.offer_type === 'collections'
    ? offer.offer_collections.map(id => collections.find(c => c.collection_id === id)).filter(Boolean) as CollectionResponse[]
    : [];

  return (
    <div>
      <BrandPageHeader
        title="Offer Details"
        breadcrumbs={[
          { label: 'UHNI Offers', href: '/brand/offers' },
          { label: offer.offer_id.slice(-8) },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <SecondaryButton href="/brand/offers" icon={ArrowLeft}>
              Back
            </SecondaryButton>
            <Link
              href={`/brand/offers/${id}/edit`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-wide hover:bg-noir transition-colors"
            >
              <Pencil size={16} />
              Edit
            </Link>
          </div>
        }
      />

      <div className="p-8 space-y-6 max-w-3xl">
        {/* Status & Type Banner */}
        <div className="bg-white border border-sand/50 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 ${typeInfo.bg}`}>
              <TypeIcon size={24} />
            </div>
            <div>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${typeInfo.bg} mb-1`}>
                <TypeIcon size={10} />
                {typeInfo.label}
              </span>
              <p className="text-xs text-taupe">Offer ID: {offer.offer_id}</p>
            </div>
          </div>
          <span className={`flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-[0.1em] uppercase ${statusConfig.badge}`}>
            <StatusIcon size={13} />
            {statusConfig.label}
          </span>
        </div>

        {/* Discount */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50">
            <h2 className="font-medium text-charcoal-deep">Discount</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gold-deep text-ivory-cream">
                {offer.discount_type === 'percentage' ? <Percent size={20} /> : <Tag size={20} />}
              </div>
              <div>
                <p className="text-2xl font-display text-charcoal-deep">
                  {offer.discount_type === 'percentage'
                    ? `${offer.discount_value}% OFF`
                    : `$${offer.discount_value.toLocaleString()} OFF`}
                </p>
                <p className="text-xs text-taupe capitalize">{offer.discount_type} discount</p>
              </div>
            </div>
          </div>
        </div>

        {/* Validity */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50">
            <h2 className="font-medium text-charcoal-deep">Validity Period</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 text-taupe mb-1">
                <Calendar size={14} />
                <span className="text-[10px] tracking-[0.2em] uppercase">Valid From</span>
              </div>
              <p className="text-sm text-charcoal-deep">{formatDateTime(offer.valid_from)}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-taupe mb-1">
                <Calendar size={14} />
                <span className="text-[10px] tracking-[0.2em] uppercase">Valid Until</span>
              </div>
              <p className="text-sm text-charcoal-deep">{formatDateTime(offer.valid_until)}</p>
            </div>
          </div>
        </div>

        {/* Products */}
        {offer.offer_type === 'products' && offer.offer_products.length > 0 && (
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
              <h2 className="font-medium text-charcoal-deep">Products</h2>
              <span className="text-xs text-taupe">{offer.offer_products.length} product{offer.offer_products.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {offer.offer_products.map(pid => {
                  const product = matchedProducts.find(p => p.product_id === pid);
                  return (
                    <div key={pid} className="flex items-center gap-4 p-3 border border-sand/50">
                      <div className="w-14 h-14 bg-parchment flex-shrink-0 overflow-hidden">
                        {product?.product_image ? (
                          <img src={product.product_image} alt={product.product_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={20} className="text-taupe/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal-deep truncate">
                          {product?.product_name ?? pid}
                        </p>
                        {product && (
                          <p className="text-xs text-taupe mt-0.5">SKU: {product.sku}</p>
                        )}
                      </div>
                      {product && (
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-medium text-charcoal-deep">
                            ${product.price.toLocaleString()}
                          </p>
                          {offer.discount_type === 'percentage' ? (
                            <p className="text-xs text-success">
                              → ${(product.price * (1 - offer.discount_value / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </p>
                          ) : (
                            <p className="text-xs text-success">
                              → ${Math.max(0, product.price - offer.discount_value).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Collections */}
        {offer.offer_type === 'collections' && offer.offer_collections.length > 0 && (
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
              <h2 className="font-medium text-charcoal-deep">Collections</h2>
              <span className="text-xs text-taupe">{offer.offer_collections.length} collection{offer.offer_collections.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {offer.offer_collections.map(cid => {
                  const collection = matchedCollections.find(c => c.collection_id === cid);
                  return (
                    <div key={cid} className="flex items-center gap-4 p-3 border border-sand/50">
                      <div className="w-14 h-14 bg-parchment flex-shrink-0 overflow-hidden">
                        {collection?.collection_image ? (
                          <img src={collection.collection_image} alt={collection.collection_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FolderOpen size={20} className="text-taupe/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal-deep truncate">
                          {collection?.collection_name ?? cid}
                        </p>
                        {collection && (
                          <p className="text-xs text-taupe mt-0.5 capitalize">
                            {collection.season} {collection.year}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Conditions */}
        {offer.conditions.length > 0 && (
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50">
              <h2 className="font-medium text-charcoal-deep">Conditions</h2>
            </div>
            <div className="p-6 space-y-2">
              {offer.conditions.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-parchment/50">
                  <span className="text-taupe text-xs mt-0.5">{i + 1}.</span>
                  <p className="text-sm text-charcoal-deep">{c}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meta */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50">
            <h2 className="font-medium text-charcoal-deep">Details</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-taupe uppercase tracking-wider mb-1">Status (API)</p>
              <p className="text-charcoal-deep capitalize">{offer.status}</p>
            </div>
            <div>
              <p className="text-taupe uppercase tracking-wider mb-1">Created</p>
              <p className="text-charcoal-deep">{new Date(offer.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-taupe uppercase tracking-wider mb-1">Last Updated</p>
              <p className="text-charcoal-deep">{new Date(offer.updated_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-taupe uppercase tracking-wider mb-1">Expired</p>
              <p className={offer.is_expired ? 'text-error' : 'text-success'}>{offer.is_expired ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
