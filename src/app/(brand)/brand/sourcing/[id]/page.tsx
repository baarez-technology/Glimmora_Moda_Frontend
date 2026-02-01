'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Target,
  Clock,
  DollarSign,
  Calendar,
  MessageSquare,
  Package,
  CheckCircle,
  Star,
  Image as ImageIcon
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, SecondaryButton } from '@/components/brand/BrandPageHeader';
import type { SourcingRequestStatus, SourcingRequestType } from '@/types/uhni';

export default function SourcingRequestDetailPage() {
  const params = useParams();
  const { getSourcingRequestById, products } = useBrand();
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  const requestId = params.id as string;
  const request = getSourcingRequestById(requestId);

  if (!request) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone">Sourcing request not found</p>
        <Link
          href="/brand/sourcing"
          className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
        >
          <ArrowLeft size={16} /> Back to Sourcing Requests
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

  const getDaysUntilDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const days = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getStatusBadge = (status: SourcingRequestStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'sourcing':
        return 'bg-info/10 text-info';
      case 'options_found':
        return 'bg-gold-soft/20 text-gold-deep';
      case 'awaiting_approval':
        return 'bg-champagne/30 text-gold-muted';
      case 'acquired':
      case 'delivered':
        return 'bg-success/10 text-success';
      case 'cancelled':
        return 'bg-error/10 text-error';
      default:
        return 'bg-taupe/20 text-stone';
    }
  };

  const getStatusLabel = (status: SourcingRequestStatus) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getTypeLabel = (type: SourcingRequestType) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'bg-success/10 text-success';
      case 'like_new':
        return 'bg-info/10 text-info';
      case 'excellent':
        return 'bg-gold-soft/20 text-gold-deep';
      case 'good':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-taupe/20 text-stone';
    }
  };

  const daysUntilDeadline = getDaysUntilDeadline(request.deadline);
  const canSubmit = request.status === 'pending' || request.status === 'sourcing';

  return (
    <div>
      <BrandPageHeader
        title={request.title}
        breadcrumbs={[
          { label: 'Sourcing Requests', href: '/brand/sourcing' },
          { label: request.id.toUpperCase() }
        ]}
        actions={
          <SecondaryButton href="/brand/sourcing" icon={ArrowLeft}>
            Back to Requests
          </SecondaryButton>
        }
      />

      <div className="p-8 space-y-6">
        {/* Status Banner */}
        <div className={`p-4 flex items-center justify-between ${getStatusBadge(request.status)}`}>
          <div className="flex items-center gap-3">
            <Target size={20} />
            <div>
              <p className="text-sm font-medium">{getTypeLabel(request.type)} Request</p>
              <p className="text-xs opacity-80">Status: {getStatusLabel(request.status)}</p>
            </div>
          </div>
          {request.deadline && daysUntilDeadline !== null && (
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span className="text-sm">
                {daysUntilDeadline > 0 ? `${daysUntilDeadline} days until deadline` : 'Deadline passed'}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Request Details</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Description</p>
                  <p className="text-sm text-charcoal-deep leading-relaxed">{request.description}</p>
                </div>

                {request.occasion && (
                  <div className="pt-4 border-t border-sand/30">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Occasion</p>
                    <p className="text-sm text-charcoal-deep">{request.occasion}</p>
                  </div>
                )}

                {request.referenceImages && request.referenceImages.length > 0 && (
                  <div className="pt-4 border-t border-sand/30">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Reference Images</p>
                    <div className="flex gap-3">
                      {request.referenceImages.map((img, index) => (
                        <div key={index} className="w-24 h-24 bg-parchment">
                          <img src={img} alt={`Reference ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Found Options */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
                <h2 className="font-medium text-charcoal-deep">Found Options</h2>
                <span className="text-sm text-taupe">{request.foundOptions.length} option{request.foundOptions.length !== 1 ? 's' : ''}</span>
              </div>
              {request.foundOptions.length === 0 ? (
                <div className="p-12 text-center">
                  <Package size={48} className="mx-auto text-taupe/40 mb-4" />
                  <p className="text-stone">No options submitted yet</p>
                  {canSubmit && (
                    <button
                      onClick={() => setShowSubmitForm(true)}
                      className="mt-4 text-sm text-charcoal-deep hover:text-gold-muted transition-colors"
                    >
                      Submit your first option
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-sand/30">
                  {request.foundOptions.map(option => (
                    <div key={option.id} className="p-6">
                      <div className="flex gap-4">
                        {option.images && option.images.length > 0 ? (
                          <div className="w-24 h-24 bg-parchment flex-shrink-0">
                            <img src={option.images[0]} alt="Option" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-24 h-24 bg-parchment flex-shrink-0 flex items-center justify-center">
                            <ImageIcon size={24} className="text-taupe/40" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm font-medium text-charcoal-deep">
                                {option.product?.name || option.customDescription}
                              </p>
                              <p className="text-xs text-taupe">{option.source}</p>
                            </div>
                            <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${getConditionBadge(option.condition)}`}>
                              {option.condition.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-4">
                            <p className="text-lg font-medium text-charcoal-deep">{formatCurrency(option.price)}</p>
                            {option.originalPrice && option.originalPrice !== option.price && (
                              <p className="text-sm text-taupe line-through">{formatCurrency(option.originalPrice)}</p>
                            )}
                          </div>
                          {option.conciergeRecommendation && (
                            <div className="mt-3 p-3 bg-gold-soft/10 flex items-start gap-2">
                              <Star size={14} className="text-gold-deep flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-gold-deep">{option.conciergeRecommendation}</p>
                            </div>
                          )}
                          {option.availableUntil && (
                            <p className="text-xs text-taupe mt-2">
                              Available until {formatDate(option.availableUntil)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Option Form */}
            {canSubmit && showSubmitForm && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
                  <h2 className="font-medium text-charcoal-deep">Submit Option</h2>
                  <button
                    onClick={() => setShowSubmitForm(false)}
                    className="text-xs text-taupe hover:text-charcoal-deep"
                  >
                    Cancel
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                      Description *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe the item you can source..."
                      className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                        Price *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone">€</span>
                        <input
                          type="number"
                          placeholder="0"
                          className="w-full pl-8 pr-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                        Condition *
                      </label>
                      <select className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors">
                        <option value="new">New</option>
                        <option value="like_new">Like New</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                      Source Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Paris Flagship Boutique"
                      className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                      Recommendation Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Why is this option a good match?"
                      className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button className="px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-wide hover:bg-noir transition-colors">
                      Submit Option
                    </button>
                  </div>
                </div>
              </div>
            )}

            {canSubmit && !showSubmitForm && (
              <button
                onClick={() => setShowSubmitForm(true)}
                className="w-full py-4 border-2 border-dashed border-sand text-sm text-stone hover:text-charcoal-deep hover:border-charcoal-deep transition-colors"
              >
                + Submit an Option
              </button>
            )}

            {/* Concierge Notes */}
            {request.conciergeNotes.length > 0 && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
                  <MessageSquare size={18} className="text-stone" />
                  <h2 className="font-medium text-charcoal-deep">Concierge Notes</h2>
                </div>
                <div className="p-6 space-y-4">
                  {request.conciergeNotes.map(note => (
                    <div key={note.id} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        note.author === 'concierge' ? 'bg-gold-soft/20 text-gold-deep' : 'bg-parchment text-stone'
                      }`}>
                        {note.author === 'concierge' ? 'C' : 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-taupe mb-1">
                          {note.author === 'concierge' ? 'Concierge' : 'Client'} · {formatDate(note.timestamp)}
                        </p>
                        <p className="text-sm text-charcoal-deep">{note.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Budget */}
            {request.budget && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
                  <DollarSign size={18} className="text-stone" />
                  <h2 className="font-medium text-charcoal-deep">Budget</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-display text-charcoal-deep">
                      {formatCurrency(request.budget.min)} - {formatCurrency(request.budget.max)}
                    </p>
                    {request.budget.flexible && (
                      <p className="text-xs text-gold-muted mt-1">Budget is flexible</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Deadline */}
            {request.deadline && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
                  <Calendar size={18} className="text-stone" />
                  <h2 className="font-medium text-charcoal-deep">Deadline</h2>
                </div>
                <div className="p-6 text-center">
                  <p className="text-lg font-medium text-charcoal-deep">{formatDate(request.deadline)}</p>
                  {daysUntilDeadline !== null && daysUntilDeadline > 0 && (
                    <p className={`text-sm mt-1 ${daysUntilDeadline <= 7 ? 'text-warning' : 'text-taupe'}`}>
                      {daysUntilDeadline} day{daysUntilDeadline !== 1 ? 's' : ''} remaining
                    </p>
                  )}
                  {daysUntilDeadline !== null && daysUntilDeadline <= 0 && (
                    <p className="text-sm text-error mt-1">Deadline has passed</p>
                  )}
                </div>
              </div>
            )}

            {/* Request Info */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Request Info</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">ID</span>
                  <span className="text-sm text-charcoal-deep font-mono">{request.id.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Type</span>
                  <span className="text-sm text-charcoal-deep">{getTypeLabel(request.type)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Created</span>
                  <span className="text-sm text-charcoal-deep">{formatDate(request.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Status</span>
                  <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge(request.status)}`}>
                    {getStatusLabel(request.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
