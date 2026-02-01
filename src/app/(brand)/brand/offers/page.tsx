'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Gift, Tag, Percent, Calendar, CheckCircle, Clock, Package, FolderOpen, Building } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, PrimaryButton } from '@/components/brand/BrandPageHeader';
import type { UHNIPriceOffer } from '@/types/brand-portal';

type FilterTab = 'all' | 'active' | 'upcoming' | 'expired';

export default function UHNIOffersPage() {
  const { uhniOffers } = useBrand();
  const [filter, setFilter] = useState<FilterTab>('all');

  const now = new Date();

  const getOfferStatus = (offer: UHNIPriceOffer): 'active' | 'upcoming' | 'expired' => {
    const validFrom = new Date(offer.validFrom);
    const validUntil = new Date(offer.validUntil);

    if (now < validFrom) return 'upcoming';
    if (now > validUntil) return 'expired';
    return 'active';
  };

  const filteredOffers = uhniOffers.filter(offer => {
    if (filter === 'all') return true;
    return getOfferStatus(offer) === filter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: 'active' | 'upcoming' | 'expired') => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'upcoming':
        return 'bg-info/10 text-info';
      case 'expired':
        return 'bg-taupe/20 text-stone';
      default:
        return 'bg-taupe/20 text-stone';
    }
  };

  const getTypeBadge = (type: UHNIPriceOffer['type']) => {
    switch (type) {
      case 'product':
        return { bg: 'bg-gold-soft/20 text-gold-deep', icon: Package };
      case 'collection':
        return { bg: 'bg-champagne/30 text-gold-muted', icon: FolderOpen };
      case 'brand':
        return { bg: 'bg-parchment text-charcoal-deep', icon: Building };
      default:
        return { bg: 'bg-taupe/20 text-stone', icon: Tag };
    }
  };

  const statusCounts = {
    all: uhniOffers.length,
    active: uhniOffers.filter(o => getOfferStatus(o) === 'active').length,
    upcoming: uhniOffers.filter(o => getOfferStatus(o) === 'upcoming').length,
    expired: uhniOffers.filter(o => getOfferStatus(o) === 'expired').length
  };

  const filterTabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'expired', label: 'Expired' }
  ];

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
        {filteredOffers.length === 0 ? (
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
              const typeInfo = getTypeBadge(offer.type);
              const TypeIcon = typeInfo.icon;

              return (
                <div
                  key={offer.id}
                  className="bg-white border border-sand/50 hover:border-sand transition-colors"
                >
                  {/* Header with image */}
                  <div className="aspect-[16/9] bg-parchment relative overflow-hidden">
                    {offer.targetImage ? (
                      <img
                        src={offer.targetImage}
                        alt={offer.targetName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <TypeIcon size={48} className="text-taupe/30" />
                      </div>
                    )}
                    {/* Discount badge */}
                    <div className="absolute top-3 right-3 bg-gold-deep text-ivory-cream px-3 py-1.5 flex items-center gap-1.5">
                      {offer.discountType === 'percentage' ? (
                        <>
                          <Percent size={14} />
                          <span className="text-sm font-medium">{offer.discountValue}% OFF</span>
                        </>
                      ) : (
                        <>
                          <Tag size={14} />
                          <span className="text-sm font-medium">${offer.discountValue.toLocaleString()} OFF</span>
                        </>
                      )}
                    </div>
                    {/* Status badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 text-[9px] tracking-[0.1em] uppercase ${getStatusBadge(status)}`}>
                        {status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${typeInfo.bg}`}>
                        <TypeIcon size={10} />
                        {offer.type}
                      </span>
                    </div>
                    <h3 className="font-medium text-charcoal-deep">
                      {offer.targetName}
                    </h3>

                    {/* Validity Period */}
                    <div className="mt-4 pt-4 border-t border-sand/30 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-taupe">
                          <Calendar size={12} />
                          <span>Valid Period</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-stone">
                        <span>{formatDate(offer.validFrom)}</span>
                        <span className="text-taupe">to</span>
                        <span>{formatDate(offer.validUntil)}</span>
                      </div>
                    </div>

                    {/* Claimed status */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs">
                        {offer.claimed ? (
                          <>
                            <CheckCircle size={12} className="text-success" />
                            <span className="text-success">Claimed</span>
                          </>
                        ) : (
                          <>
                            <Clock size={12} className="text-taupe" />
                            <span className="text-taupe">Not claimed</span>
                          </>
                        )}
                      </div>
                      {offer.conditions && offer.conditions.length > 0 && (
                        <span className="text-[10px] text-taupe">
                          {offer.conditions.length} condition{offer.conditions.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
