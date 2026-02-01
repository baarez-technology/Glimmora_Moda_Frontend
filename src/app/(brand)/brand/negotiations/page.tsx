'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, MessageSquare, Clock, CheckCircle, XCircle, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader } from '@/components/brand/BrandPageHeader';
import type { NegotiationStatus } from '@/types/uhni';

type FilterTab = 'all' | NegotiationStatus;

export default function NegotiationsPage() {
  const { priceNegotiations } = useBrand();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNegotiations = priceNegotiations.filter(neg => {
    const matchesFilter = filter === 'all' || neg.status === filter;
    const matchesSearch = searchQuery === '' ||
      neg.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      neg.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (value: number) => {
    return `€${value.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 2 && daysUntilExpiry > 0;
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const getStatusIcon = (status: NegotiationStatus) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'counter_offered':
        return ArrowRightLeft;
      case 'approved':
      case 'accepted':
        return CheckCircle;
      case 'declined':
        return XCircle;
      default:
        return MessageSquare;
    }
  };

  const getStatusBadge = (status: NegotiationStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'counter_offered':
        return 'bg-info/10 text-info';
      case 'approved':
      case 'accepted':
        return 'bg-success/10 text-success';
      case 'declined':
        return 'bg-error/10 text-error';
      default:
        return 'bg-taupe/20 text-stone';
    }
  };

  const getStatusLabel = (status: NegotiationStatus) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getDiscountPercent = (original: number, proposed: number) => {
    return Math.round(((original - proposed) / original) * 100);
  };

  const statusCounts = {
    all: priceNegotiations.length,
    pending: priceNegotiations.filter(n => n.status === 'pending').length,
    counter_offered: priceNegotiations.filter(n => n.status === 'counter_offered').length,
    approved: priceNegotiations.filter(n => n.status === 'approved').length,
    accepted: priceNegotiations.filter(n => n.status === 'accepted').length,
    declined: priceNegotiations.filter(n => n.status === 'declined').length
  };

  const filterTabs: { value: FilterTab; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'counter_offered', label: 'Counter Offered' },
    { value: 'approved', label: 'Approved' },
    { value: 'declined', label: 'Declined' }
  ];

  return (
    <div>
      <BrandPageHeader
        title="Price Negotiations"
        subtitle={`${filteredNegotiations.length} negotiation${filteredNegotiations.length !== 1 ? 's' : ''}`}
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

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-taupe" />
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
          />
        </div>

        {/* Negotiations List */}
        {filteredNegotiations.length === 0 ? (
          <div className="bg-white border border-sand/50 p-12 text-center">
            <MessageSquare size={48} className="mx-auto text-taupe/40 mb-4" />
            <p className="text-stone">No negotiations found</p>
          </div>
        ) : (
          <div className="bg-white border border-sand/50">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sand/30">
                    <th className="text-left px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Product
                    </th>
                    <th className="text-right px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Original
                    </th>
                    <th className="text-right px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Proposed
                    </th>
                    <th className="text-right px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Counter
                    </th>
                    <th className="text-center px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">
                      Expires
                    </th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/30">
                  {filteredNegotiations.map(neg => {
                    const StatusIcon = getStatusIcon(neg.status);
                    const expiringSoon = isExpiringSoon(neg.expiresAt);
                    const expired = isExpired(neg.expiresAt);
                    return (
                      <tr key={neg.id} className={`hover:bg-parchment/30 transition-colors ${expiringSoon && neg.status === 'pending' ? 'bg-warning/5' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-parchment flex-shrink-0">
                              <img
                                src={neg.productImage}
                                alt={neg.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-charcoal-deep">{neg.productName}</p>
                              <p className="text-xs text-taupe">{neg.brandName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm text-charcoal-deep">{formatCurrency(neg.originalPrice)}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm text-charcoal-deep">{formatCurrency(neg.proposedPrice)}</p>
                          <p className="text-[10px] text-error">
                            -{getDiscountPercent(neg.originalPrice, neg.proposedPrice)}%
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {neg.counterOffer ? (
                            <>
                              <p className="text-sm text-charcoal-deep">{formatCurrency(neg.counterOffer)}</p>
                              <p className="text-[10px] text-warning">
                                -{getDiscountPercent(neg.originalPrice, neg.counterOffer)}%
                              </p>
                            </>
                          ) : (
                            <span className="text-sm text-taupe">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge(neg.status)}`}>
                              <StatusIcon size={12} />
                              {getStatusLabel(neg.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            {expiringSoon && neg.status === 'pending' && (
                              <AlertTriangle size={14} className="text-warning" />
                            )}
                            <span className={`text-sm ${expired ? 'text-error' : expiringSoon ? 'text-warning' : 'text-charcoal-deep'}`}>
                              {formatDate(neg.expiresAt)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/brand/negotiations/${neg.id}`}
                            className="inline-flex items-center gap-1 text-xs text-stone hover:text-charcoal-deep transition-colors"
                          >
                            {neg.status === 'pending' ? 'Respond' : 'View'} <ChevronRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
