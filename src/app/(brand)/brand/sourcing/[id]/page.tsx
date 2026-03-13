'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { writeBrandNegotiationResponse } from '@/lib/shared-sourcing-store';
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
  Image as ImageIcon,
  Trash2,
  Plus,
  Check,
  Send,
  Tag,
  ArrowRight,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, SecondaryButton } from '@/components/brand/BrandPageHeader';
import type { SourcingRequestStatus, SourcingRequestType } from '@/types/uhni';

function MessageInput({ onSend }: { onSend: (msg: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && value.trim()) {
            onSend(value.trim());
            setValue('');
          }
        }}
        placeholder="Message the client..."
        className="flex-1 border border-sand px-3 py-2 text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
      />
      <button
        onClick={() => {
          if (value.trim()) {
            onSend(value.trim());
            setValue('');
          }
        }}
        className="px-4 py-2 bg-charcoal-deep text-ivory-cream text-sm hover:bg-noir transition-colors"
      >
        <Send size={14} />
      </button>
    </div>
  );
}

const statusFlow: Record<string, string[]> = {
  pending: ['sourcing'],
  sourcing: ['options_found'],
  options_found: ['awaiting_approval'],
  awaiting_approval: ['acquired'],
  acquired: ['delivered'],
  delivered: [],
  cancelled: [],
};

export default function SourcingRequestDetailPage() {
  const params = useParams();
  const {
    getSourcingRequestById,
    submitSourcingOption,
    updateSourcingStatus,
    addSourcingOption,
    updateSourcingOption,
    removeSourcingOption,
    sendSourcingMessage,
  } = useBrand();

  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showAddOptionForm, setShowAddOptionForm] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [counterFormId, setCounterFormId] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterMessage, setCounterMessage] = useState('');

  // Legacy submit form
  const [legacyForm, setLegacyForm] = useState({
    description: '',
    price: '',
    condition: 'new' as 'new' | 'like_new' | 'excellent' | 'good',
    source: '',
    recommendation: ''
  });

  // New option form
  const [optionForm, setOptionForm] = useState({
    title: '',
    brandName: '',
    description: '',
    price: '',
    sourceLocation: '',
    estimatedDelivery: '',
    imageUrl: '',
    notes: '',
  });

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

  const formatCurrency = (value: number) => `€${value.toLocaleString()}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const getDaysUntilDeadline = (deadline?: string) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getStatusBadge = (status: SourcingRequestStatus) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning';
      case 'sourcing': return 'bg-info/10 text-info';
      case 'options_found': return 'bg-gold-soft/20 text-gold-deep';
      case 'awaiting_approval': return 'bg-champagne/30 text-gold-muted';
      case 'acquired': case 'delivered': return 'bg-success/10 text-success';
      case 'cancelled': return 'bg-error/10 text-error';
      default: return 'bg-taupe/20 text-stone';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getTypeLabel = (type: SourcingRequestType) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'urgent': return 'bg-error/10 text-error';
      case 'when_available': return 'bg-parchment text-stone';
      default: return 'bg-info/10 text-info';
    }
  };

  const daysUntilDeadline = getDaysUntilDeadline(request.deadline);
  const canSubmitLegacy = request.status === 'pending' || request.status === 'sourcing';
  const canAddOptions = request.status === 'sourcing' || request.status === 'options_found';
  const nextStatuses = statusFlow[request.status] || [];
  const selectedOption = request.foundOptions.find(o => o.id === request.selectedOptionId);

  const handleLegacySubmit = () => {
    if (!legacyForm.description || !legacyForm.price) return;
    submitSourcingOption(requestId, {
      customDescription: legacyForm.description,
      price: parseFloat(legacyForm.price),
      condition: legacyForm.condition,
      source: legacyForm.source || undefined,
      conciergeRecommendation: legacyForm.recommendation || undefined
    });
    setLegacyForm({ description: '', price: '', condition: 'new', source: '', recommendation: '' });
    setShowSubmitForm(false);
  };

  const handleAddOption = () => {
    if (!optionForm.title || !optionForm.price) return;
    addSourcingOption(requestId, {
      title: optionForm.title,
      brandName: optionForm.brandName || undefined,
      description: optionForm.description || undefined,
      price: parseFloat(optionForm.price),
      sourceLocation: optionForm.sourceLocation || undefined,
      estimatedDelivery: optionForm.estimatedDelivery || undefined,
      imageUrl: optionForm.imageUrl || undefined,
      notes: optionForm.notes || undefined,
    });
    setOptionForm({ title: '', brandName: '', description: '', price: '', sourceLocation: '', estimatedDelivery: '', imageUrl: '', notes: '' });
    setShowAddOptionForm(false);
  };

  const handleStatusUpdate = (newStatus: string) => {
    updateSourcingStatus(requestId, newStatus as SourcingRequestStatus, statusNote || `Status updated to ${getStatusLabel(newStatus)}`);
    setStatusNote('');
  };

  const handleAcceptNegotiation = (optionId: string) => {
    const option = request.foundOptions.find(o => o.id === optionId);
    if (!option) return;
    updateSourcingOption(requestId, optionId, {
      negotiationStatus: 'accepted',
      counterNote: 'We accept your proposed price. A pleasure doing business.',
    });
    sendSourcingMessage(requestId, `Negotiation accepted for "${option.title || option.customDescription}" at €${option.proposedPrice?.toLocaleString()}.`);
    writeBrandNegotiationResponse(requestId, optionId, 'accept');
  };

  const handleSubmitCounter = (optionId: string) => {
    const price = Number(counterPrice);
    if (!price || price <= 0) return;
    const option = request.foundOptions.find(o => o.id === optionId);
    if (!option) return;
    updateSourcingOption(requestId, optionId, {
      negotiationStatus: 'counter_offered',
      counterPrice: price,
      counterNote: counterMessage || undefined,
    });
    sendSourcingMessage(requestId, `Counter offer of €${price.toLocaleString()} submitted for "${option.title || option.customDescription}".`);
    writeBrandNegotiationResponse(requestId, optionId, 'counter', price, counterMessage || undefined);
    setCounterFormId(null);
    setCounterPrice('');
    setCounterMessage('');
  };

  const handleDeclineNegotiation = (optionId: string) => {
    const option = request.foundOptions.find(o => o.id === optionId);
    if (!option) return;
    updateSourcingOption(requestId, optionId, {
      negotiationStatus: 'declined',
    });
    sendSourcingMessage(requestId, `Negotiation declined for "${option.title || option.customDescription}".`);
    writeBrandNegotiationResponse(requestId, optionId, 'decline');
  };

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
          <div className="flex items-center gap-3">
            {request.priority && (
              <span className={`px-2.5 py-1 text-[10px] tracking-[0.1em] uppercase ${getPriorityBadge(request.priority)}`}>
                {request.priority === 'when_available' ? 'When Available' : request.priority}
              </span>
            )}
            {request.deadline && daysUntilDeadline !== null && (
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span className="text-sm">
                  {daysUntilDeadline > 0 ? `${daysUntilDeadline} days until deadline` : 'Deadline passed'}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* SECTION A: Request Details */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Request Details</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Description</p>
                  <p className="text-sm text-charcoal-deep leading-relaxed">{request.description}</p>
                </div>

                {request.category && (
                  <div className="pt-4 border-t border-sand/30">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Category</p>
                    <p className="text-sm text-charcoal-deep">{request.category}</p>
                  </div>
                )}

                {request.specifications && (
                  <div className="pt-4 border-t border-sand/30">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Specifications</p>
                    <p className="text-sm text-charcoal-deep">{request.specifications}</p>
                  </div>
                )}

                {request.occasion && (
                  <div className="pt-4 border-t border-sand/30">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Occasion</p>
                    <p className="text-sm text-charcoal-deep">{request.occasion}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-sand/30 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Client</p>
                    <p className="text-sm text-charcoal-deep">UHNI Client</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Submitted</p>
                    <p className="text-sm text-charcoal-deep">{formatDate(request.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION B: Status Update Panel */}
            {nextStatuses.length > 0 && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50">
                  <h2 className="font-medium text-charcoal-deep">Update Status</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Status Note (Optional)</p>
                    <input
                      type="text"
                      value={statusNote}
                      onChange={e => setStatusNote(e.target.value)}
                      placeholder="Add a note about this status change..."
                      className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                    />
                  </div>
                  <div className="flex gap-3">
                    {nextStatuses.map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(status)}
                        className="px-5 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.15em] uppercase hover:bg-noir transition-colors"
                      >
                        Move to {getStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SECTION C: Add Options Panel */}
            {canAddOptions && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
                  <h2 className="font-medium text-charcoal-deep">Add Found Options</h2>
                  <button
                    onClick={() => setShowAddOptionForm(!showAddOptionForm)}
                    className="flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-charcoal-deep hover:text-gold-muted transition-colors"
                  >
                    <Plus size={14} />
                    {showAddOptionForm ? 'Cancel' : 'Add Option'}
                  </button>
                </div>

                {showAddOptionForm && (
                  <div className="p-6 space-y-4 border-b border-sand/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                          Option Title *
                        </label>
                        <input
                          type="text"
                          value={optionForm.title}
                          onChange={e => setOptionForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Hermès Birkin 25 Gold Togo"
                          className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                          Brand / Source Name
                        </label>
                        <input
                          type="text"
                          value={optionForm.brandName}
                          onChange={e => setOptionForm(prev => ({ ...prev, brandName: e.target.value }))}
                          placeholder="e.g., Hermès"
                          className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={optionForm.description}
                        onChange={e => setOptionForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the item..."
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
                            value={optionForm.price}
                            onChange={e => setOptionForm(prev => ({ ...prev, price: e.target.value }))}
                            placeholder="0"
                            className="w-full pl-8 pr-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                          Source Location
                        </label>
                        <input
                          type="text"
                          value={optionForm.sourceLocation}
                          onChange={e => setOptionForm(prev => ({ ...prev, sourceLocation: e.target.value }))}
                          placeholder="e.g., Milan Boutique"
                          className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                          Estimated Delivery
                        </label>
                        <input
                          type="text"
                          value={optionForm.estimatedDelivery}
                          onChange={e => setOptionForm(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                          placeholder="e.g., 2-3 weeks"
                          className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                          Image URL (Optional)
                        </label>
                        <input
                          type="text"
                          value={optionForm.imageUrl}
                          onChange={e => setOptionForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                          placeholder="https://..."
                          className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                        Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={optionForm.notes}
                        onChange={e => setOptionForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Additional notes..."
                        className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleAddOption}
                        disabled={!optionForm.title || !optionForm.price}
                        className="px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-wide hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Option
                      </button>
                    </div>
                  </div>
                )}

                {/* Existing options */}
                {request.foundOptions.length > 0 && (
                  <div className="divide-y divide-sand/30">
                    {request.foundOptions.map(option => (
                      <div key={option.id}>
                        <div className="p-6 flex items-start gap-4">
                          {(option.imageUrl || (option.images && option.images.length > 0)) ? (
                            <div className="w-20 h-20 bg-parchment flex-shrink-0">
                              <img
                                src={option.imageUrl || option.images[0]}
                                alt={option.title || option.customDescription || 'Option'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-parchment flex-shrink-0 flex items-center justify-center">
                              <ImageIcon size={24} className="text-taupe/40" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <p className="text-sm font-medium text-charcoal-deep">
                                    {option.title || option.customDescription || option.product?.name}
                                  </p>
                                  {option.negotiationStatus === 'negotiating' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-muted/10 text-gold-muted text-[10px] tracking-[0.1em] uppercase animate-pulse">
                                      <Tag size={10} /> Negotiation Pending
                                    </span>
                                  )}
                                  {option.negotiationStatus === 'counter_offered' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-soft/15 text-gold-muted text-[10px] tracking-[0.1em] uppercase">
                                      <ArrowRight size={10} /> Counter Sent
                                    </span>
                                  )}
                                  {option.negotiationStatus === 'accepted' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-success/10 text-success text-[10px] tracking-[0.1em] uppercase">
                                      <CheckCircle size={10} /> Price Agreed
                                    </span>
                                  )}
                                  {option.negotiationStatus === 'declined' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone/10 text-stone text-[10px] tracking-[0.1em] uppercase">
                                      <XCircle size={10} /> Declined
                                    </span>
                                  )}
                                </div>
                                {option.brandName && (
                                  <p className="text-xs text-gold-muted tracking-[0.1em] uppercase">{option.brandName}</p>
                                )}
                                {(option.description || option.conciergeRecommendation) && (
                                  <p className="text-xs text-stone mt-1">{option.description || option.conciergeRecommendation}</p>
                                )}
                              </div>
                              {request.selectedOptionId === option.id ? (
                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-success/10 text-success text-[10px] tracking-[0.1em] uppercase">
                                  <Check size={12} />
                                  Client Selected
                                </span>
                              ) : (
                                <button
                                  onClick={() => removeSourcingOption(requestId, option.id)}
                                  className="text-taupe hover:text-error transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                              <p className="text-lg font-medium text-charcoal-deep">{formatCurrency(option.price)}</p>
                              {option.negotiationStatus === 'accepted' && option.proposedPrice && (
                                <span className="text-xs text-success">Agreed: {formatCurrency(option.proposedPrice)}</span>
                              )}
                              <span className="text-xs text-stone">{option.sourceLocation || option.source}</span>
                              {option.estimatedDelivery && (
                                <span className="text-xs text-stone">Est: {option.estimatedDelivery}</span>
                              )}
                            </div>
                            {option.notes && (
                              <p className="text-xs text-stone italic mt-1">{option.notes}</p>
                            )}
                          </div>
                        </div>

                        {/* Negotiation Response Panel */}
                        {option.negotiationStatus === 'negotiating' && (
                          <div className="mx-6 mb-6 border border-gold-muted/30 bg-gold-muted/5 p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <AlertCircle size={14} className="text-gold-muted" />
                              <p className="text-[10px] tracking-[0.2em] uppercase text-gold-muted">Client Price Negotiation</p>
                            </div>
                            <div className="flex items-center gap-4 mb-3">
                              <div className="text-center">
                                <p className="text-[9px] tracking-[0.1em] uppercase text-taupe mb-1">Listed</p>
                                <p className="font-display text-sm text-charcoal-deep">{formatCurrency(option.price)}</p>
                              </div>
                              <ArrowRight size={16} className="text-taupe" />
                              <div className="text-center">
                                <p className="text-[9px] tracking-[0.1em] uppercase text-gold-muted mb-1">Client Offer</p>
                                <p className="font-display text-sm text-gold-muted">{formatCurrency(option.proposedPrice || 0)}</p>
                              </div>
                              {option.proposedPrice && (
                                <span className="text-[10px] text-stone">({Math.round((1 - option.proposedPrice / option.price) * 100)}% off)</span>
                              )}
                            </div>
                            {option.negotiationNote && (
                              <div className="bg-parchment/50 border-l-2 border-gold-soft/40 px-3 py-2 mb-4">
                                <p className="text-xs text-stone italic">&ldquo;{option.negotiationNote}&rdquo;</p>
                                <p className="text-[9px] text-taupe mt-1">— Client</p>
                              </div>
                            )}
                            <div className="flex items-center gap-3 flex-wrap">
                              <button
                                onClick={() => handleAcceptNegotiation(option.id)}
                                className="px-4 py-2 bg-success/10 text-success text-[10px] tracking-[0.15em] uppercase hover:bg-success/20 transition-colors"
                              >
                                <span className="inline-flex items-center gap-1.5"><CheckCircle size={12} /> Accept {formatCurrency(option.proposedPrice || 0)}</span>
                              </button>
                              <button
                                onClick={() => setCounterFormId(counterFormId === option.id ? null : option.id)}
                                className="px-4 py-2 bg-gold-muted/10 text-gold-muted text-[10px] tracking-[0.15em] uppercase hover:bg-gold-muted/20 transition-colors"
                              >
                                <span className="inline-flex items-center gap-1.5"><Tag size={12} /> Counter Offer</span>
                              </button>
                              <button
                                onClick={() => handleDeclineNegotiation(option.id)}
                                className="px-4 py-2 bg-error/10 text-error text-[10px] tracking-[0.15em] uppercase hover:bg-error/20 transition-colors"
                              >
                                <span className="inline-flex items-center gap-1.5"><XCircle size={12} /> Decline</span>
                              </button>
                            </div>

                            {/* Counter offer form */}
                            {counterFormId === option.id && (
                              <div className="mt-4 pt-4 border-t border-gold-muted/20 space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Counter Price *</label>
                                    <div className="relative">
                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone">€</span>
                                      <input
                                        type="number"
                                        value={counterPrice}
                                        onChange={e => setCounterPrice(e.target.value)}
                                        placeholder="0"
                                        className="w-full pl-8 pr-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                                      />
                                    </div>
                                    {counterPrice && Number(counterPrice) > 0 && option.proposedPrice && (
                                      <p className="text-[10px] text-taupe mt-1">
                                        Between client&apos;s {formatCurrency(option.proposedPrice)} and listed {formatCurrency(option.price)}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Message (optional)</label>
                                    <input
                                      type="text"
                                      value={counterMessage}
                                      onChange={e => setCounterMessage(e.target.value)}
                                      placeholder="Explain your counter..."
                                      className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                                    />
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleSubmitCounter(option.id)}
                                  disabled={!counterPrice || Number(counterPrice) <= 0}
                                  className="px-5 py-2.5 bg-charcoal-deep text-ivory-cream text-[10px] tracking-[0.15em] uppercase hover:bg-noir transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  Submit Counter Offer
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Counter sent confirmation */}
                        {option.negotiationStatus === 'counter_offered' && (
                          <div className="mx-6 mb-6 bg-parchment/30 p-4 flex items-center gap-3">
                            <ArrowRight size={14} className="text-gold-muted" />
                            <div>
                              <p className="text-xs text-charcoal-deep">
                                Counter offer of <span className="font-medium">{formatCurrency(option.counterPrice || 0)}</span> sent to client.
                              </p>
                              {option.counterNote && <p className="text-[10px] text-stone italic mt-0.5">&ldquo;{option.counterNote}&rdquo;</p>}
                              <p className="text-[10px] text-taupe mt-1">Awaiting client response...</p>
                            </div>
                          </div>
                        )}

                        {/* Accepted negotiation summary */}
                        {option.negotiationStatus === 'accepted' && option.proposedPrice && (
                          <div className="mx-6 mb-6 bg-success/5 border border-success/20 p-4 flex items-center gap-3">
                            <CheckCircle size={14} className="text-success" />
                            <p className="text-xs text-charcoal-deep">
                              Price agreed at <span className="font-medium">{formatCurrency(option.proposedPrice)}</span>
                              <span className="text-taupe ml-1">(listed: {formatCurrency(option.price)})</span>
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {request.foundOptions.length === 0 && !showAddOptionForm && (
                  <div className="p-8 text-center">
                    <Package size={32} className="mx-auto text-taupe/40 mb-3" />
                    <p className="text-sm text-stone">No options added yet</p>
                  </div>
                )}
              </div>
            )}

            {/* SECTION D: Client Options Review Status */}
            {request.selectedOptionId && selectedOption && (
              <div className="bg-white border border-success/30">
                <div className="px-6 py-4 border-b border-success/20 flex items-center gap-3">
                  <CheckCircle size={18} className="text-success" />
                  <h2 className="font-medium text-charcoal-deep">Client Has Selected an Option</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-charcoal-deep">
                        {selectedOption.title || selectedOption.customDescription || 'Selected Option'}
                      </p>
                      {selectedOption.brandName && (
                        <p className="text-xs text-gold-muted tracking-[0.1em] uppercase mt-0.5">{selectedOption.brandName}</p>
                      )}
                      <p className="font-display text-xl text-charcoal-deep mt-2">
                        {formatCurrency(selectedOption.price)}
                      </p>
                    </div>
                    <span className="px-3 py-1.5 bg-success/10 text-success text-xs tracking-[0.1em] uppercase">
                      Selected
                    </span>
                  </div>
                  {request.status === 'awaiting_approval' && (
                    <button
                      onClick={() => updateSourcingStatus(requestId, 'acquired', 'Item acquired and being prepared for delivery')}
                      className="px-5 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.15em] uppercase hover:bg-noir transition-colors"
                    >
                      Confirm Acquisition
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Legacy Submit Option Form */}
            {canSubmitLegacy && showSubmitForm && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
                  <h2 className="font-medium text-charcoal-deep">Submit Option (Legacy)</h2>
                  <button onClick={() => setShowSubmitForm(false)} className="text-xs text-taupe hover:text-charcoal-deep">Cancel</button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Description *</label>
                    <textarea
                      rows={3}
                      value={legacyForm.description}
                      onChange={e => setLegacyForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the item you can source..."
                      className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Price *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone">€</span>
                        <input
                          type="number"
                          value={legacyForm.price}
                          onChange={e => setLegacyForm(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="0"
                          className="w-full pl-8 pr-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Condition *</label>
                      <select
                        value={legacyForm.condition}
                        onChange={e => setLegacyForm(prev => ({ ...prev, condition: e.target.value as typeof legacyForm.condition }))}
                        className="w-full px-4 py-3 border border-sand text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                      >
                        <option value="new">New</option>
                        <option value="like_new">Like New</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Source Location</label>
                    <input
                      type="text"
                      value={legacyForm.source}
                      onChange={e => setLegacyForm(prev => ({ ...prev, source: e.target.value }))}
                      placeholder="e.g., Paris Flagship Boutique"
                      className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleLegacySubmit}
                      disabled={!legacyForm.description || !legacyForm.price}
                      className="px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-wide hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Option
                    </button>
                  </div>
                </div>
              </div>
            )}

            {canSubmitLegacy && !showSubmitForm && !canAddOptions && (
              <button
                onClick={() => setShowSubmitForm(true)}
                className="w-full py-4 border-2 border-dashed border-sand text-sm text-stone hover:text-charcoal-deep hover:border-charcoal-deep transition-colors"
              >
                + Submit an Option
              </button>
            )}

            {/* SECTION E: Messaging Panel */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
                <MessageSquare size={18} className="text-stone" />
                <h2 className="font-medium text-charcoal-deep">Messages</h2>
              </div>
              <div className="p-6 space-y-4">
                {(!request.messages || request.messages.length === 0) && request.conciergeNotes.length === 0 ? (
                  <p className="text-sm text-stone italic">No messages yet.</p>
                ) : (
                  <>
                    {/* Legacy concierge notes */}
                    {request.conciergeNotes.length > 0 && (
                      <div className="space-y-3 mb-4">
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
                    )}

                    {/* New messages */}
                    {request.messages && request.messages.length > 0 && (
                      <div className="space-y-3 max-h-64 overflow-y-auto mb-3">
                        {request.messages.map(msg => (
                          <div
                            key={msg.id}
                            className={`p-3 max-w-sm text-sm ${
                              msg.senderRole === 'brand'
                                ? 'ml-auto bg-charcoal-deep text-ivory-cream'
                                : 'bg-parchment text-charcoal-deep'
                            }`}
                          >
                            <p className="text-xs font-medium mb-1 opacity-60">{msg.senderName}</p>
                            <p>{msg.content}</p>
                            <p className="text-xs opacity-40 mt-1">
                              {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                <MessageInput onSend={(content) => sendSourcingMessage(requestId, content)} />
              </div>
            </div>

            {/* SECTION F: Timeline */}
            {request.timeline && request.timeline.length > 0 && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50">
                  <h2 className="font-medium text-charcoal-deep">Timeline</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-0">
                    {request.timeline.map((event, index) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-gold-soft flex-shrink-0" />
                          {index < request.timeline!.length - 1 && (
                            <div className="w-px h-full bg-sand min-h-[40px]" />
                          )}
                        </div>
                        <div className="pb-6">
                          <p className="text-sm font-medium text-charcoal-deep">
                            {getStatusLabel(event.status)}
                          </p>
                          <p className="text-xs text-stone mt-0.5">{event.note}</p>
                          <p className="text-xs text-taupe mt-1">
                            {new Date(event.createdAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                            <span className="ml-2 text-taupe/60">by {event.updatedBy}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
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
                      {request.budget.min > 0
                        ? `${formatCurrency(request.budget.min)} - ${formatCurrency(request.budget.max)}`
                        : formatCurrency(request.budget.max)
                      }
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
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Options</span>
                  <span className="text-sm text-charcoal-deep">{request.foundOptions.length}</span>
                </div>
                {request.selectedOptionId && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-taupe uppercase tracking-wider">Client Selection</span>
                    <span className="px-2 py-0.5 bg-success/10 text-success text-[10px] tracking-[0.1em] uppercase">
                      Option Selected
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
