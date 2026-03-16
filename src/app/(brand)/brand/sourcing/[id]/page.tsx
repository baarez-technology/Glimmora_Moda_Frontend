'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Image as ImageIcon,
  Trash2,
  Plus,
  Check,
  Send,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { BrandPageHeader, SecondaryButton } from '@/components/brand/BrandPageHeader';
import {
  fetchBrandSourcingRequest,
  updateBrandSourcingStatus,
  addBrandProductOption,
  deleteBrandProductOption,
  sendBrandSourcingMessage,
  type ApiBrandSourcingRequest,
} from '@/services/brand-sourcing.service';

function MessageInput({ onSend, disabled }: { onSend: (msg: string) => void; disabled?: boolean }) {
  const [value, setValue] = useState('');
  const submit = () => {
    if (value.trim()) { onSend(value.trim()); setValue(''); }
  };
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); }}
        placeholder="Message the client..."
        disabled={disabled}
        className="flex-1 border border-sand px-3 py-2 text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe disabled:opacity-50"
      />
      <button
        onClick={submit}
        disabled={disabled || !value.trim()}
        className="px-4 py-2 bg-charcoal-deep text-ivory-cream text-sm hover:bg-noir transition-colors disabled:opacity-50"
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
  const sourcingId = params.id as string;

  const [request, setRequest] = useState<ApiBrandSourcingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [showAddOptionForm, setShowAddOptionForm] = useState(false);
  const [statusNote, setStatusNote] = useState('');

  const [optionForm, setOptionForm] = useState({
    option_title: '',
    source_name: '',
    description: '',
    price: '',
    source_location: '',
    estimate_delivery: '',
    image_url: '',
    notes: '',
  });

  const loadRequest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBrandSourcingRequest(sourcingId);
      setRequest(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sourcing request');
    } finally {
      setLoading(false);
    }
  }, [sourcingId]);

  useEffect(() => { loadRequest(); }, [loadRequest]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 size={32} className="mx-auto text-taupe/40 mb-4 animate-spin" />
        <p className="text-stone text-sm">Loading...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone">{error || 'Sourcing request not found'}</p>
        <Link
          href="/brand/sourcing"
          className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
        >
          <ArrowLeft size={16} /> Back to Sourcing Requests
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  const getDaysUntilDeadline = (deadline?: string | null) => {
    if (!deadline) return null;
    return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status: string) => {
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

  const getStatusLabel = (status: string) =>
    status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const getPriorityBadge = (priority?: string | null) => {
    switch (priority) {
      case 'urgent': return 'bg-error/10 text-error';
      case 'high': return 'bg-warning/10 text-warning';
      case 'medium': return 'bg-info/10 text-info';
      default: return 'bg-parchment text-stone';
    }
  };

  const daysUntilDeadline = getDaysUntilDeadline(request.deadline);
  const nextStatuses = statusFlow[request.status] || [];
  const selectedOption = request.product_options.find(o => o.is_customer_selected);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setSaving(true);
      const updated = await updateBrandSourcingStatus(sourcingId, newStatus, statusNote || undefined);
      setRequest(updated);
      setStatusNote('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const handleAddOption = async () => {
    if (!optionForm.option_title || !optionForm.price) return;
    try {
      setSaving(true);
      const updated = await addBrandProductOption(sourcingId, {
        option_title: optionForm.option_title,
        source_name: optionForm.source_name,
        description: optionForm.description,
        price: parseInt(optionForm.price, 10),
        source_location: optionForm.source_location,
        estimate_delivery: optionForm.estimate_delivery,
        image_url: optionForm.image_url,
        notes: optionForm.notes,
      });
      setRequest(updated);
      setOptionForm({ option_title: '', source_name: '', description: '', price: '', source_location: '', estimate_delivery: '', image_url: '', notes: '' });
      setShowAddOptionForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add option');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    try {
      setSaving(true);
      const updated = await deleteBrandProductOption(sourcingId, optionId);
      setRequest(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete option');
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    try {
      const updated = await sendBrandSourcingMessage(sourcingId, message);
      setRequest(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const canAddOptions = request.status === 'sourcing' || request.status === 'options_found' || request.status === 'pending';

  return (
    <div>
      <BrandPageHeader
        title={request.looking_for}
        breadcrumbs={[
          { label: 'Sourcing Requests', href: '/brand/sourcing' },
          { label: request.sourcing_id.slice(-8).toUpperCase() },
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
              <p className="text-sm font-medium">{request.product_category} Request</p>
              <p className="text-xs opacity-80">Status: {getStatusLabel(request.status)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {request.priority && (
              <span className={`px-2.5 py-1 text-[10px] tracking-[0.1em] uppercase ${getPriorityBadge(request.priority)}`}>
                {request.priority}
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
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Looking For</p>
                  <p className="text-sm text-charcoal-deep font-medium">{request.looking_for}</p>
                </div>
                <div className="pt-4 border-t border-sand/30">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Description</p>
                  <p className="text-sm text-charcoal-deep leading-relaxed">{request.description}</p>
                </div>
                <div className="pt-4 border-t border-sand/30">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Category</p>
                  <p className="text-sm text-charcoal-deep">{request.product_category}</p>
                </div>
                {request.specifications && (
                  <div className="pt-4 border-t border-sand/30">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Specifications</p>
                    <p className="text-sm text-charcoal-deep">{request.specifications}</p>
                  </div>
                )}
                <div className="pt-4 border-t border-sand/30 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Submitted</p>
                    <p className="text-sm text-charcoal-deep">{formatDate(request.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Last Updated</p>
                    <p className="text-sm text-charcoal-deep">{formatDate(request.updated_at)}</p>
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
                        disabled={saving}
                        className="px-5 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.15em] uppercase hover:bg-noir transition-colors disabled:opacity-50"
                      >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : `Move to ${getStatusLabel(status)}`}
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
                          value={optionForm.option_title}
                          onChange={e => setOptionForm(prev => ({ ...prev, option_title: e.target.value }))}
                          placeholder="e.g., Hermès Birkin 25 Gold Togo"
                          className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                          Brand / Source Name *
                        </label>
                        <input
                          type="text"
                          value={optionForm.source_name}
                          onChange={e => setOptionForm(prev => ({ ...prev, source_name: e.target.value }))}
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
                          value={optionForm.source_location}
                          onChange={e => setOptionForm(prev => ({ ...prev, source_location: e.target.value }))}
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
                          value={optionForm.estimate_delivery}
                          onChange={e => setOptionForm(prev => ({ ...prev, estimate_delivery: e.target.value }))}
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
                          value={optionForm.image_url}
                          onChange={e => setOptionForm(prev => ({ ...prev, image_url: e.target.value }))}
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
                        disabled={!optionForm.option_title || !optionForm.price || saving}
                        className="px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-wide hover:bg-noir transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : 'Add Option'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Existing options */}
                {request.product_options.length > 0 && (
                  <div className="divide-y divide-sand/30">
                    {request.product_options.map(option => (
                      <div key={option.option_product_id} className="p-6 flex items-start gap-4">
                        {option.image_url ? (
                          <div className="w-20 h-20 bg-parchment flex-shrink-0">
                            <img
                              src={option.image_url}
                              alt={option.option_title}
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
                              <p className="text-sm font-medium text-charcoal-deep">{option.option_title}</p>
                              {option.source_name && (
                                <p className="text-xs text-gold-muted tracking-[0.1em] uppercase">{option.source_name}</p>
                              )}
                              {option.description && (
                                <p className="text-xs text-stone mt-1">{option.description}</p>
                              )}
                            </div>
                            {option.is_customer_selected ? (
                              <span className="flex items-center gap-1.5 px-2 py-0.5 bg-success/10 text-success text-[10px] tracking-[0.1em] uppercase">
                                <Check size={12} />
                                Client Selected
                              </span>
                            ) : (
                              <button
                                onClick={() => handleDeleteOption(option.option_product_id)}
                                disabled={saving}
                                className="text-taupe hover:text-error transition-colors disabled:opacity-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <p className="text-lg font-medium text-charcoal-deep">€{option.offer_price.toLocaleString()}</p>
                            {option.offer_price !== option.price && (
                              <p className="text-sm text-taupe line-through">€{option.price.toLocaleString()}</p>
                            )}
                            {option.source_location && (
                              <span className="text-xs text-stone">{option.source_location}</span>
                            )}
                            {option.estimate_delivery && (
                              <span className="text-xs text-stone">Est: {option.estimate_delivery}</span>
                            )}
                          </div>
                          {option.notes && (
                            <p className="text-xs text-stone italic mt-1">{option.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {request.product_options.length === 0 && !showAddOptionForm && (
                  <div className="p-8 text-center">
                    <Package size={32} className="mx-auto text-taupe/40 mb-3" />
                    <p className="text-sm text-stone">No options added yet</p>
                  </div>
                )}
              </div>
            )}

            {/* SECTION D: Client Selected Option */}
            {selectedOption && (
              <div className="bg-white border border-success/30">
                <div className="px-6 py-4 border-b border-success/20 flex items-center gap-3">
                  <CheckCircle size={18} className="text-success" />
                  <h2 className="font-medium text-charcoal-deep">Client Has Selected an Option</h2>
                </div>
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-charcoal-deep">{selectedOption.option_title}</p>
                      {selectedOption.source_name && (
                        <p className="text-xs text-gold-muted tracking-[0.1em] uppercase mt-0.5">{selectedOption.source_name}</p>
                      )}
                      <p className="font-display text-xl text-charcoal-deep mt-2">
                        €{selectedOption.offer_price.toLocaleString()}
                      </p>
                    </div>
                    <span className="px-3 py-1.5 bg-success/10 text-success text-xs tracking-[0.1em] uppercase">
                      Selected
                    </span>
                  </div>
                  {request.status === 'awaiting_approval' && (
                    <button
                      onClick={() => handleStatusUpdate('acquired')}
                      disabled={saving}
                      className="px-5 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.15em] uppercase hover:bg-noir transition-colors disabled:opacity-50"
                    >
                      Confirm Acquisition
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* SECTION E: Messaging Panel */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
                <MessageSquare size={18} className="text-stone" />
                <h2 className="font-medium text-charcoal-deep">Messages</h2>
              </div>
              <div className="p-6 space-y-4">
                {request.messages.length === 0 ? (
                  <p className="text-sm text-stone italic">No messages yet.</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto mb-3">
                    {request.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 max-w-sm text-sm ${
                          msg.type === 'brand'
                            ? 'ml-auto bg-charcoal-deep text-ivory-cream'
                            : 'bg-parchment text-charcoal-deep'
                        }`}
                      >
                        <p className="text-xs font-medium mb-1 opacity-60">
                          {msg.type === 'brand' ? 'You (Brand)' : 'Client'}
                        </p>
                        <p>{msg.message}</p>
                        <p className="text-xs opacity-40 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <MessageInput onSend={handleSendMessage} />
              </div>
            </div>

            {/* SECTION F: Timeline */}
            {request.timelines.length > 0 && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50">
                  <h2 className="font-medium text-charcoal-deep">Timeline</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-0">
                    {request.timelines.map((entry, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-gold-soft flex-shrink-0" />
                          {index < request.timelines.length - 1 && (
                            <div className="w-px h-full bg-sand min-h-[40px]" />
                          )}
                        </div>
                        <div className="pb-6">
                          <p className="text-sm font-medium text-charcoal-deep">
                            {getStatusLabel(entry.status)}
                          </p>
                          {entry.notes && (
                            <p className="text-xs text-stone mt-0.5">{entry.notes}</p>
                          )}
                          <p className="text-xs text-taupe mt-1">
                            {new Date(entry.updated_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
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
                <div className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-display text-charcoal-deep">{request.budget}</p>
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
                  <span className="text-sm text-charcoal-deep font-mono">{request.sourcing_id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Category</span>
                  <span className="text-sm text-charcoal-deep">{request.product_category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Created</span>
                  <span className="text-sm text-charcoal-deep">{formatDate(request.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Status</span>
                  <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${getStatusBadge(request.status)}`}>
                    {getStatusLabel(request.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Options</span>
                  <span className="text-sm text-charcoal-deep">{request.product_options.length}</span>
                </div>
                {selectedOption && (
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
