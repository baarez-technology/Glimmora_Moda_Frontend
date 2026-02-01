'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  ArrowRight,
  Clock,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, SecondaryButton, PrimaryButton } from '@/components/brand/BrandPageHeader';
import type { NegotiationStatus } from '@/types/uhni';

export default function NegotiationDetailPage() {
  const params = useParams();
  const { getNegotiationById, submitCounterOffer, approveNegotiation, declineNegotiation } = useBrand();
  const [counterOfferValue, setCounterOfferValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const negotiationId = params.id as string;
  const negotiation = getNegotiationById(negotiationId);

  if (!negotiation) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone">Negotiation not found</p>
        <Link
          href="/brand/negotiations"
          className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
        >
          <ArrowLeft size={16} /> Back to Negotiations
        </Link>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return `€${value.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const getDiscountPercent = (original: number, proposed: number) => {
    return Math.round(((original - proposed) / original) * 100);
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

  const handleApprove = () => {
    setIsSubmitting(true);
    approveNegotiation(negotiation.id);
    setTimeout(() => setIsSubmitting(false), 500);
  };

  const handleDecline = () => {
    setIsSubmitting(true);
    declineNegotiation(negotiation.id);
    setTimeout(() => setIsSubmitting(false), 500);
  };

  const handleCounterOffer = () => {
    const amount = parseFloat(counterOfferValue);
    if (isNaN(amount) || amount <= 0) return;

    setIsSubmitting(true);
    submitCounterOffer(negotiation.id, amount);
    setCounterOfferValue('');
    setTimeout(() => setIsSubmitting(false), 500);
  };

  const expiringSoon = isExpiringSoon(negotiation.expiresAt);
  const expired = isExpired(negotiation.expiresAt);
  const canRespond = negotiation.status === 'pending' && !expired;

  return (
    <div>
      <BrandPageHeader
        title={`Negotiation for ${negotiation.productName}`}
        breadcrumbs={[
          { label: 'Negotiations', href: '/brand/negotiations' },
          { label: negotiation.id.toUpperCase() }
        ]}
        actions={
          <SecondaryButton href="/brand/negotiations" icon={ArrowLeft}>
            Back to Negotiations
          </SecondaryButton>
        }
      />

      <div className="p-8 space-y-6">
        {/* Status Banner */}
        {expiringSoon && negotiation.status === 'pending' && (
          <div className="p-4 bg-warning/10 text-warning flex items-center gap-3">
            <AlertTriangle size={20} />
            <div>
              <p className="text-sm font-medium">Expires Soon</p>
              <p className="text-xs opacity-80">This negotiation expires on {formatDate(negotiation.expiresAt)}</p>
            </div>
          </div>
        )}

        {expired && negotiation.status === 'pending' && (
          <div className="p-4 bg-error/10 text-error flex items-center gap-3">
            <XCircle size={20} />
            <div>
              <p className="text-sm font-medium">Expired</p>
              <p className="text-xs opacity-80">This negotiation expired on {formatDate(negotiation.expiresAt)}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Card */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Product</h2>
              </div>
              <div className="p-6 flex gap-6">
                <div className="w-32 h-32 bg-parchment flex-shrink-0">
                  <img
                    src={negotiation.productImage}
                    alt={negotiation.productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-lg font-medium text-charcoal-deep">{negotiation.productName}</p>
                  <p className="text-sm text-taupe">{negotiation.brandName}</p>
                  <div className="mt-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge(negotiation.status)}`}>
                      {getStatusLabel(negotiation.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Comparison */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Price Comparison</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  {/* Original Price */}
                  <div className="text-center flex-1">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Original</p>
                    <p className="text-2xl font-display text-charcoal-deep">{formatCurrency(negotiation.originalPrice)}</p>
                  </div>

                  <ArrowRight size={24} className="text-taupe flex-shrink-0" />

                  {/* Proposed Price */}
                  <div className="text-center flex-1">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Proposed</p>
                    <p className="text-2xl font-display text-charcoal-deep">{formatCurrency(negotiation.proposedPrice)}</p>
                    <p className="text-xs text-error mt-1">
                      -{getDiscountPercent(negotiation.originalPrice, negotiation.proposedPrice)}% discount
                    </p>
                  </div>

                  {negotiation.counterOffer && (
                    <>
                      <ArrowRight size={24} className="text-taupe flex-shrink-0" />

                      {/* Counter Offer */}
                      <div className="text-center flex-1">
                        <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Counter Offer</p>
                        <p className="text-2xl font-display text-gold-deep">{formatCurrency(negotiation.counterOffer)}</p>
                        <p className="text-xs text-warning mt-1">
                          -{getDiscountPercent(negotiation.originalPrice, negotiation.counterOffer)}% discount
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Response Actions */}
            {canRespond && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50">
                  <h2 className="font-medium text-charcoal-deep">Your Response</h2>
                </div>
                <div className="p-6 space-y-6">
                  {/* Quick Actions */}
                  <div className="flex gap-4">
                    <button
                      onClick={handleApprove}
                      disabled={isSubmitting}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-success/10 text-success hover:bg-success/20 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={18} />
                      <span className="text-sm tracking-wide">Approve Request</span>
                    </button>
                    <button
                      onClick={handleDecline}
                      disabled={isSubmitting}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-error/10 text-error hover:bg-error/20 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={18} />
                      <span className="text-sm tracking-wide">Decline Request</span>
                    </button>
                  </div>

                  {/* Counter Offer */}
                  <div className="pt-6 border-t border-sand/30">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">
                      Or Submit Counter Offer
                    </p>
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone">€</span>
                        <input
                          type="number"
                          value={counterOfferValue}
                          onChange={(e) => setCounterOfferValue(e.target.value)}
                          placeholder="Enter counter offer amount"
                          className="w-full pl-8 pr-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                        />
                      </div>
                      <button
                        onClick={handleCounterOffer}
                        disabled={isSubmitting || !counterOfferValue}
                        className="px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-wide hover:bg-noir transition-colors disabled:opacity-50"
                      >
                        Submit Counter
                      </button>
                    </div>
                    <p className="text-xs text-taupe mt-2">
                      Suggested range: {formatCurrency(negotiation.proposedPrice)} - {formatCurrency(negotiation.originalPrice)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Concierge Notes */}
            {negotiation.conciergeNotes.length > 0 && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
                  <MessageSquare size={18} className="text-stone" />
                  <h2 className="font-medium text-charcoal-deep">Concierge Notes</h2>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {negotiation.conciergeNotes.map((note, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-gold-muted rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-stone">{note}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Negotiation Details */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Details</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Negotiation ID</span>
                  <span className="text-sm text-charcoal-deep font-mono">{negotiation.id.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Created</span>
                  <span className="text-sm text-charcoal-deep">{formatDate(negotiation.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Expires</span>
                  <span className={`text-sm ${expired ? 'text-error' : expiringSoon ? 'text-warning' : 'text-charcoal-deep'}`}>
                    {formatDate(negotiation.expiresAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge(negotiation.status)}`}>
                    {getStatusLabel(negotiation.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Discount Summary */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Discount Summary</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Requested Discount</span>
                  <span className="text-sm text-error font-medium">
                    -{getDiscountPercent(negotiation.originalPrice, negotiation.proposedPrice)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Requested Amount</span>
                  <span className="text-sm text-charcoal-deep">
                    {formatCurrency(negotiation.originalPrice - negotiation.proposedPrice)} off
                  </span>
                </div>
                {negotiation.counterOffer && (
                  <>
                    <div className="pt-4 border-t border-sand/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-taupe uppercase tracking-wider">Counter Discount</span>
                        <span className="text-sm text-warning font-medium">
                          -{getDiscountPercent(negotiation.originalPrice, negotiation.counterOffer)}%
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
