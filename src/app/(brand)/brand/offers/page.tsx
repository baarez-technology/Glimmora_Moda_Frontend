'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Gift, Tag, Percent, Calendar, Package, FolderOpen, Building, Users } from 'lucide-react';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';
import { fetchUhniOffers, type ApiOffer } from '@/services/uhni-offers.service';
import { fetchProducts, type BackendProduct } from '@/services/brand-product.service';
import { fetchCollections, type CollectionResponse } from '@/services/brand-collection.service';
import { useApp } from '@/context/AppContext';
import { formatPrice } from '@/lib/currency';

type FilterTab = 'all' | 'active' | 'upcoming' | 'expired';

function getOfferStatus(offer: ApiOffer): 'active' | 'upcoming' | 'expired' {
  const now = new Date();
  const from = new Date(offer.valid_from);
  const until = new Date(offer.valid_until);
  if (now < from) return 'upcoming';
  if (now > until || offer.is_expired) return 'expired';
  return 'active';
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function getOfferLabel(
  offer: ApiOffer,
  products: BackendProduct[],
  collections: CollectionResponse[],
): string {
  if (offer.offer_type === 'products' && offer.offer_products.length > 0) {
    return offer.offer_products
      .map(id => products.find(p => p.product_id === id)?.product_name ?? id)
      .join(', ');
  }
  if (offer.offer_type === 'collections' && offer.offer_collections.length > 0) {
    return offer.offer_collections
      .map(id => collections.find(c => c.collection_id === id)?.collection_name ?? id)
      .join(', ');
  }
  return 'Brand-wide';
}

const STATUS_BADGE: Record<'active' | 'upcoming' | 'expired', string> = {
  active: 'bg-success/10 text-success',
  upcoming: 'bg-info/10 text-info',
  expired: 'bg-taupe/20 text-stone',
};

const TYPE_INFO: Record<string, { bg: string; icon: React.ElementType }> = {
  products: { bg: 'bg-gold-soft/20 text-gold-deep', icon: Package },
  collections: { bg: 'bg-champagne/30 text-gold-muted', icon: FolderOpen },
  brand: { bg: 'bg-parchment text-charcoal-deep', icon: Building },
};

const filterTabs: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'expired', label: 'Expired' },
];

export default function UHNIOffersPage() {
  const { showToast } = useApp();
  const [offers, setOffers] = useState<ApiOffer[]>([]);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [collections, setCollections] = useState<CollectionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');

  useEffect(() => {
    Promise.all([
      fetchUhniOffers(),
      fetchProducts().catch(() => []),
      fetchCollections().catch(() => []),
    ]).then(([offersData, prods, cols]) => {
      setOffers(offersData);
      setProducts(prods);
      setCollections(cols);
    }).catch(() => showToast('Failed to load offers', 'error'))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredOffers = offers.filter(offer => {
    if (filter === 'all') return true;
    return getOfferStatus(offer) === filter;
  });

  const statusCounts = {
    all: offers.length,
    active: offers.filter(o => getOfferStatus(o) === 'active').length,
    upcoming: offers.filter(o => getOfferStatus(o) === 'upcoming').length,
    expired: offers.filter(o => getOfferStatus(o) === 'expired').length,
  };

  return (
    <div>
      <BrandPageHeader
        title="UHNI Offers"
        subtitle={`${filteredOffers.length} offer${filteredOffers.length !== 1 ? 's' : ''}`}
        actions={
          <PrimaryButton href="/brand/offers/new" icon={Plus}>
            Create Offer
          </PrimaryButton>
        }
      />

      <div className="p-8 space-y-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-parchment p-1 w-fit overflow-x-auto">
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 text-xs tracking-[0.1em] uppercase transition-colors flex items-center gap-2 whitespace-nowrap ${
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

        {/* Offers Grid */}
        {isLoading ? (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <p className="text-stone">Loading offers...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <Gift size={48} className="mx-auto text-taupe/40 mb-4" />
            <p className="text-stone">No offers found</p>
            <Link
              href="/brand/offers/new"
              className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
            >
              <Plus size={16} /> Create your first offer
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map(offer => {
              const status = getOfferStatus(offer);
              const typeKey = offer.offer_type in TYPE_INFO ? offer.offer_type : 'brand';
              const typeInfo = TYPE_INFO[typeKey];
              const TypeIcon = typeInfo.icon;
              const label = getOfferLabel(offer, products, collections);

              return (
                <Link
                  key={offer.offer_id}
                  href={`/brand/offers/${offer.offer_id}`}
                  className="bg-white border border-sand/50 hover:border-sand transition-colors block"
                >
                  {/* Header */}
                  <div className="aspect-[16/9] bg-parchment relative overflow-hidden flex items-center justify-center">
                    <TypeIcon size={48} className="text-taupe/30" />
                    {/* Discount badge */}
                    <div className="absolute top-3 right-3 bg-gold-deep text-ivory-cream px-3 py-1.5 flex items-center gap-1.5">
                      {offer.discount_type === 'percentage' ? (
                        <>
                          <Percent size={14} />
                          <span className="text-sm font-medium">{offer.discount_value}% OFF</span>
                        </>
                      ) : (
                        <>
                          <Tag size={14} />
                          <span className="text-sm font-medium">{formatPrice(offer.discount_value)} OFF</span>
                        </>
                      )}
                    </div>
                    {/* Status badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 text-[9px] tracking-[0.1em] uppercase ${STATUS_BADGE[status]}`}>
                        {status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${typeInfo.bg}`}>
                        <TypeIcon size={10} />
                        {offer.offer_type}
                      </span>
                    </div>
                    <h3 className="font-medium text-charcoal-deep truncate">{label}</h3>

                    {/* Validity Period */}
                    <div className="mt-4 pt-4 border-t border-sand/30 space-y-2">
                      <div className="flex items-center gap-1 text-xs text-taupe">
                        <Calendar size={12} />
                        <span>Valid Period</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-stone">
                        <span>{formatDate(offer.valid_from)}</span>
                        <span className="text-taupe">to</span>
                        <span>{formatDate(offer.valid_until)}</span>
                      </div>
                    </div>

                    {/* Conditions count */}
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-stone">
                      <Users size={14} />
                      {offer.conditions.length > 0 ? (
                        <span>{offer.conditions.length} condition{offer.conditions.length !== 1 ? 's' : ''}</span>
                      ) : (
                        <span>No conditions</span>
                      )}
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
