'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Circle,
  Ruler,
  Palette,
  Scissors,
  Mail,
  Camera,
  ChevronDown,
  FileText,
  Printer,
  X,
  Send,
  DollarSign
} from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { useApp } from '@/context/AppContext';
import { BrandPageHeader, SecondaryButton, PrimaryButton } from '@/components/brand/BrandPageHeader';
import type { BespokeOrderStatus, BespokeOrderType } from '@/types/uhni';
import InvoiceDocument, { generateInvoiceNumber, printInvoice } from '@/components/shared/InvoiceDocument';

export default function BespokeOrderDetailPage() {
  const params = useParams();
  const { getBespokeOrderById, updateBespokeOrderStatus, updateBespokeStatus, sendBespokeMessage, updateBespokePrice, partner } = useBrand();
  const { showToast } = useApp();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [selectedNextStatus, setSelectedNextStatus] = useState<BespokeOrderStatus | null>(null);
  const [messageText, setMessageText] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [depositPctInput, setDepositPctInput] = useState('50');
  const [statusSuccess, setStatusSuccess] = useState(false);

  const orderId = params.id as string;
  const order = getBespokeOrderById(orderId);

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone">Bespoke order not found</p>
        <Link
          href="/brand/bespoke"
          className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
        >
          <ArrowLeft size={16} /> Back to Bespoke Orders
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

  const getStatusBadge = (status: BespokeOrderStatus) => {
    switch (status) {
      case 'consultation':
        return 'bg-info/10 text-info';
      case 'design_approval':
        return 'bg-warning/10 text-warning';
      case 'production':
        return 'bg-gold-soft/20 text-gold-deep';
      case 'fitting':
        return 'bg-champagne/30 text-gold-muted';
      case 'final_adjustments':
        return 'bg-info/10 text-info';
      case 'complete':
        return 'bg-success/10 text-success';
      default:
        return 'bg-taupe/20 text-stone';
    }
  };

  const getStatusLabel = (status: BespokeOrderStatus) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getTypeIcon = (type: BespokeOrderType) => {
    switch (type) {
      case 'made_to_measure':
        return Ruler;
      case 'custom_design':
        return Palette;
      case 'modification':
        return Scissors;
      default:
        return Scissors;
    }
  };

  const getTypeLabel = (type: BespokeOrderType) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getStepIcon = (status: 'completed' | 'current' | 'upcoming') => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-success" />;
      case 'current':
        return <Clock size={20} className="text-gold-deep" />;
      case 'upcoming':
        return <Circle size={20} className="text-taupe/40" />;
    }
  };

  const statusOptions: BespokeOrderStatus[] = [
    'consultation',
    'design_approval',
    'production',
    'fitting',
    'final_adjustments',
    'complete'
  ];

  const handleStatusUpdate = (newStatus: BespokeOrderStatus) => {
    setIsUpdating(true);
    updateBespokeOrderStatus(order.id, newStatus);
    setShowStatusDropdown(false);
    setTimeout(() => setIsUpdating(false), 500);
  };

  const statusFlow: Record<BespokeOrderStatus, BespokeOrderStatus[]> = {
    consultation: ['design_approval'],
    design_approval: ['production'],
    production: ['fitting'],
    fitting: ['final_adjustments'],
    final_adjustments: ['complete'],
    complete: [],
  };

  const nextStatuses = statusFlow[order.status] || [];

  const handleAdvancedStatusUpdate = () => {
    if (!selectedNextStatus) return;
    updateBespokeStatus(order.id, selectedNextStatus, statusNote || `Status updated to ${getStatusLabel(selectedNextStatus)}`);
    if (priceInput && Number(priceInput) > 0) {
      updateBespokePrice(order.id, Number(priceInput), Number(depositPctInput) || 50);
    }
    setSelectedNextStatus(null);
    setStatusNote('');
    setPriceInput('');
    setStatusSuccess(true);
    setTimeout(() => setStatusSuccess(false), 3000);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    sendBespokeMessage(order.id, messageText.trim());
    setMessageText('');
    showToast('Message sent', 'success');
  };

  const TypeIcon = getTypeIcon(order.type);

  return (
    <div>
      <BrandPageHeader
        title={order.title}
        breadcrumbs={[
          { label: 'Bespoke Orders', href: '/brand/bespoke' },
          { label: order.id.toUpperCase() }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInvoice(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-sand text-stone text-xs tracking-wide hover:border-charcoal-deep hover:text-charcoal-deep transition-colors"
            >
              <FileText size={14} />
              Generate Invoice
            </button>
            <SecondaryButton href="/brand/bespoke" icon={ArrowLeft}>
              Back to Orders
            </SecondaryButton>
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {/* Status Banner */}
        <div className={`p-4 flex items-center justify-between ${getStatusBadge(order.status)}`}>
          <div className="flex items-center gap-3">
            <TypeIcon size={20} />
            <div>
              <p className="text-sm font-medium">{getTypeLabel(order.type)}</p>
              <p className="text-xs opacity-80">Status: {getStatusLabel(order.status)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm">
              Est. Completion: {formatDate(order.estimatedCompletion)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
                <h2 className="font-medium text-charcoal-deep">Order Timeline</h2>
                {/* Status Update Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    disabled={isUpdating}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-wide hover:bg-noir transition-colors disabled:opacity-50"
                  >
                    Update Status <ChevronDown size={14} />
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-sand shadow-lg z-10">
                      {statusOptions.map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(status)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-parchment transition-colors ${
                            order.status === status ? 'bg-parchment text-charcoal-deep' : 'text-stone'
                          }`}
                        >
                          {getStatusLabel(status)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="relative">
                  {order.timeline.map((step, index) => (
                    <div key={step.id} className="flex gap-4 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        {getStepIcon(step.status)}
                        {index < order.timeline.length - 1 && (
                          <div className={`w-0.5 flex-1 mt-2 ${
                            step.status === 'completed' ? 'bg-success' : 'bg-sand'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 pb-2">
                        <p className={`text-sm font-medium ${
                          step.status === 'current' ? 'text-charcoal-deep' : 'text-stone'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-taupe mt-0.5">{step.description}</p>
                        <p className="text-xs text-taupe mt-1">
                          {step.completedAt
                            ? `Completed: ${formatDate(step.completedAt)}`
                            : step.estimatedDate
                            ? `Estimated: ${formatDate(step.estimatedDate)}`
                            : ''}
                        </p>
                        {step.notes && (
                          <p className="text-xs text-stone mt-1 italic">{step.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Specifications</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.specifications.reduce((groups, spec) => {
                    const existing = groups.find(g => g.category === spec.category);
                    if (existing) {
                      existing.specs.push(spec);
                    } else {
                      groups.push({ category: spec.category, specs: [spec] });
                    }
                    return groups;
                  }, [] as { category: string; specs: typeof order.specifications }[]).map(group => (
                    <div key={group.category}>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                        {group.category}
                      </p>
                      <div className="space-y-2">
                        {group.specs.map((spec, index) => (
                          <div key={index} className="flex items-start justify-between py-2 border-b border-sand/30 last:border-0">
                            <span className="text-sm text-stone">{spec.label}</span>
                            <div className="text-right">
                              <span className="text-sm text-charcoal-deep">{spec.value}</span>
                              {spec.notes && (
                                <p className="text-xs text-taupe">{spec.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Measurements */}
            {order.measurements && Object.keys(order.measurements).length > 0 && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
                  <Ruler size={18} className="text-stone" />
                  <h2 className="font-medium text-charcoal-deep">Measurements</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(order.measurements).map(([key, value]) => (
                      <div key={key} className="text-center p-4 bg-parchment/30">
                        <p className="text-2xl font-display text-charcoal-deep">{value}</p>
                        <p className="text-[10px] tracking-[0.1em] uppercase text-taupe mt-1">
                          {key.charAt(0).toUpperCase() + key.slice(1)} (cm)
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Progress Images */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Camera size={18} className="text-stone" />
                  <h2 className="font-medium text-charcoal-deep">Progress Images</h2>
                </div>
                <button
                  onClick={() => showToast('File upload will be available when backend is connected', 'info')}
                  className="text-xs text-charcoal-deep hover:text-gold-muted transition-colors"
                >
                  + Add Image
                </button>
              </div>
              <div className="p-6">
                {order.progressImages.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-sand">
                    <Camera size={32} className="mx-auto text-taupe/40 mb-2" />
                    <p className="text-sm text-taupe">No progress images yet</p>
                    <p className="text-xs text-taupe/60 mt-1">Upload images to share with the client</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {order.progressImages.map((img, index) => (
                      <div key={index} className="aspect-square bg-parchment">
                        <img
                          src={img}
                          alt={`Progress ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Order Summary</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Order ID</span>
                  <span className="text-sm text-charcoal-deep font-mono">{order.id.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Created</span>
                  <span className="text-sm text-charcoal-deep">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Last Updated</span>
                  <span className="text-sm text-charcoal-deep">{formatDate(order.updatedAt)}</span>
                </div>
                <div className="pt-4 border-t border-sand/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-taupe uppercase tracking-wider">Total Price</span>
                    <span className="text-lg font-medium text-charcoal-deep">{formatCurrency(order.price)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-taupe uppercase tracking-wider">Deposit Paid</span>
                    <span className="text-sm text-success">{formatCurrency(order.depositPaid)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-taupe uppercase tracking-wider">Balance Due</span>
                    <span className="text-sm text-charcoal-deep">{formatCurrency(order.price - order.depositPaid)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Atelier Contact */}
            {order.atelierContact && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
                  <Mail size={18} className="text-stone" />
                  <h2 className="font-medium text-charcoal-deep">Atelier Contact</h2>
                </div>
                <div className="p-6">
                  <a
                    href={`mailto:${order.atelierContact}`}
                    className="text-sm text-charcoal-deep hover:text-gold-muted transition-colors"
                  >
                    {order.atelierContact}
                  </a>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Description</h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-stone leading-relaxed">{order.description}</p>
              </div>
            </div>

            {/* SECTION A — Update Order Status */}
            {nextStatuses.length > 0 && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50">
                  <h2 className="font-medium text-charcoal-deep">Update Order Status</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-xs text-taupe mb-2">Next Status</p>
                    <div className="flex flex-wrap gap-2">
                      {nextStatuses.map(ns => (
                        <button
                          key={ns}
                          onClick={() => setSelectedNextStatus(ns)}
                          className={`px-3 py-1.5 text-xs tracking-[0.1em] uppercase transition-colors ${
                            selectedNextStatus === ns
                              ? 'bg-charcoal-deep text-ivory-cream'
                              : 'border border-sand text-stone hover:border-charcoal-deep'
                          }`}
                        >
                          {getStatusLabel(ns)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-taupe mb-1">Status Note</p>
                    <textarea
                      value={statusNote}
                      onChange={e => setStatusNote(e.target.value)}
                      rows={2}
                      placeholder="Add a note for this status change..."
                      className="w-full border border-sand px-3 py-2 text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                    />
                  </div>
                  {(order.status === 'consultation' || order.status === 'design_approval') && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-taupe mb-1">Final Price (€)</p>
                        <input
                          type="number"
                          min={0}
                          value={priceInput}
                          onChange={e => setPriceInput(e.target.value)}
                          placeholder={String(order.price)}
                          className="w-full border border-sand px-3 py-2 text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-taupe mb-1">Deposit %</p>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={depositPctInput}
                          onChange={e => setDepositPctInput(e.target.value)}
                          className="w-full border border-sand px-3 py-2 text-sm text-charcoal-deep focus:outline-none focus:border-charcoal-deep transition-colors"
                        />
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleAdvancedStatusUpdate}
                    disabled={!selectedNextStatus}
                    className="w-full px-4 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.1em] uppercase hover:bg-noir transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Update Status
                  </button>
                  {statusSuccess && (
                    <p className="text-xs text-success text-center">Status updated successfully</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION B — Client Specifications */}
        {order.detailedSpec && (
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50">
              <h2 className="font-medium text-charcoal-deep">Client Specifications</h2>
            </div>
            <div className="p-6 space-y-4">
              {order.detailedSpec.measurements && (() => {
                const m = order.detailedSpec!.measurements!;
                const entries = Object.entries(m).filter(([k, v]) => k !== 'notes' && v !== undefined);
                if (entries.length === 0) return null;
                return (
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Measurements</p>
                    <div className="grid grid-cols-3 gap-2">
                      {entries.map(([key, val]) => (
                        <div key={key} className="text-center p-2 bg-parchment/30">
                          <p className="text-sm font-medium text-charcoal-deep">{String(val)}</p>
                          <p className="text-[10px] text-taupe capitalize">{key.replace(/([A-Z])/g, ' $1')} cm</p>
                        </div>
                      ))}
                    </div>
                    {m.notes && <p className="text-xs text-stone mt-2 italic">{m.notes}</p>}
                  </div>
                );
              })()}
              {order.detailedSpec.fabricPreferences && (
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Fabric Preferences</p>
                  <p className="text-sm text-stone">{order.detailedSpec.fabricPreferences}</p>
                </div>
              )}
              {order.detailedSpec.colorPreferences && (
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Color Preferences</p>
                  <p className="text-sm text-stone">{order.detailedSpec.colorPreferences}</p>
                </div>
              )}
              {order.detailedSpec.occasionContext && (
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Occasion</p>
                  <p className="text-sm text-stone">{order.detailedSpec.occasionContext}</p>
                </div>
              )}
              {order.detailedSpec.specialInstructions && (
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Special Instructions</p>
                  <p className="text-sm text-stone">{order.detailedSpec.specialInstructions}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!order.detailedSpec && (
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50">
              <h2 className="font-medium text-charcoal-deep">Client Specifications</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-stone italic">No specifications provided — discuss at consultation</p>
            </div>
          </div>
        )}

        {/* SECTION C — Client Communication */}
        <div className="bg-white border border-sand/50">
          <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
            <Mail size={18} className="text-stone" />
            <h2 className="font-medium text-charcoal-deep">Client Communication</h2>
          </div>
          <div className="p-6">
            {(!order.messages || order.messages.length === 0) ? (
              <p className="text-sm text-stone italic mb-4">No messages yet. Send a message to the client below.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {order.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`p-3 max-w-[80%] ${
                      msg.senderRole === 'brand'
                        ? 'ml-auto bg-charcoal-deep text-ivory-cream'
                        : 'bg-parchment text-charcoal-deep'
                    }`}
                  >
                    <p className="text-xs font-medium mb-1 opacity-70">{msg.senderName}</p>
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                rows={2}
                placeholder="Type a message to the client..."
                className="flex-1 border border-sand px-3 py-2 text-sm text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="px-4 py-2 bg-charcoal-deep text-ivory-cream text-sm hover:bg-noir transition-colors self-end disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION D — Timeline Events */}
        {order.timelineEvents && order.timelineEvents.length > 0 && (
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50">
              <h2 className="font-medium text-charcoal-deep">Status History</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.timelineEvents.map(event => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-gold-soft mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-charcoal-deep">
                          {getStatusLabel(event.status)}
                        </p>
                        <span className="px-1.5 py-0.5 text-[9px] tracking-[0.1em] uppercase bg-parchment text-taupe">
                          {event.updatedBy}
                        </span>
                      </div>
                      <p className="text-xs text-stone mt-0.5">{event.note}</p>
                      <p className="text-xs text-taupe mt-0.5">
                        {new Date(event.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
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

      {/* Invoice Modal */}
      {showInvoice && (
        <div className="fixed inset-0 bg-charcoal-deep/60 flex items-center justify-center z-50 p-4" onClick={() => setShowInvoice(false)}>
          <div className="bg-white max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-charcoal-deep">Bespoke Invoice</h3>
              <button onClick={() => setShowInvoice(false)} className="p-2 hover:bg-sand/20 transition-colors">
                <X size={18} />
              </button>
            </div>
            <InvoiceDocument
              invoiceNumber={generateInvoiceNumber(order.id, order.createdAt)}
              invoiceDate={order.createdAt}
              orderType="bespoke"
              brandName={partner?.brandName || 'ModaGlimmora'}
              buyerName="Valued Client"
              buyerEmail=""
              items={[{
                description: order.title,
                detail: order.description,
                quantity: 1,
                unitPrice: order.price,
                currency: 'EUR',
              }]}
              subtotal={order.price}
              shippingAmount={0}
              taxRate={0.20}
              taxAmount={Math.round(order.price * 0.20 / 1.20)}
              total={order.price}
              currency="EUR"
              depositPaid={order.depositPaid}
              balanceDue={order.price - order.depositPaid}
              paymentStatus={order.status === 'complete' ? 'paid' : 'deposit_paid'}
              notes={`Estimated completion: ${new Date(order.estimatedCompletion).toLocaleDateString()}`}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={printInvoice}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream text-sm tracking-[0.1em] uppercase hover:bg-noir transition-colors"
              >
                <Printer size={16} />
                Print Invoice
              </button>
              <button
                onClick={printInvoice}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-sand text-stone text-sm tracking-[0.1em] uppercase hover:border-charcoal-deep hover:text-charcoal-deep transition-colors"
              >
                <FileText size={16} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
