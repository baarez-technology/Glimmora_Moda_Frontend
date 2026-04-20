'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft, Crown, Gem, Clock, CheckCircle, Calendar, FileText,
  Printer, X, Send, Download, User
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { BespokeOrderStatus } from '@/types';
import type { BespokeOrder } from '@/types/uhni';
import InvoiceDocument, { generateInvoiceNumber, printInvoice, downloadInvoice } from '@/components/shared/InvoiceDocument';
import { formatPrice } from '@/lib/currency';

function formatMsgTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatMsgDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function BespokeChat({ order, onSend }: { order: BespokeOrder; onSend: (content: string) => void }) {
  const [value, setValue] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const messages = order.messages || [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <div className="bg-white border border-sand/50">
      {/* Chat header */}
      <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold-soft/20 flex items-center justify-center">
            <Gem size={14} className="text-gold-soft" />
          </div>
          <div>
            <p className="text-sm font-medium text-charcoal-deep">Atelier Conversation</p>
            <p className="text-[10px] text-taupe">
              {order.atelierContact ? `Atelier: ${order.atelierContact}` : 'Your bespoke team'}
            </p>
          </div>
        </div>
        <span className="text-[10px] tracking-[0.1em] uppercase text-taupe">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Messages area */}
      <div className="max-h-[420px] overflow-y-auto px-6 py-4 space-y-4 bg-parchment/20">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Send size={24} className="mx-auto text-taupe/40 mb-3" />
            <p className="text-sm text-stone">No messages yet</p>
            <p className="text-xs text-taupe mt-1">Start a conversation with the atelier team</p>
          </div>
        ) : (
          messages.map(msg => {
            const isClient = msg.senderRole === 'client';
            return (
              <div key={msg.id} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[75%]">
                  {/* Sender info */}
                  <div className={`flex items-center gap-2 mb-1 ${isClient ? 'justify-end' : ''}`}>
                    {!isClient && (
                      <div className="w-5 h-5 rounded-full bg-gold-soft/20 flex items-center justify-center">
                        <User size={10} className="text-gold-muted" />
                      </div>
                    )}
                    <span className={`text-[10px] tracking-[0.1em] uppercase ${isClient ? 'text-charcoal-deep' : 'text-gold-muted'}`}>
                      {msg.senderName}
                    </span>
                    <span className="text-[9px] text-taupe">
                      {formatMsgDate(msg.createdAt)} {formatMsgTime(msg.createdAt)}
                    </span>
                  </div>
                  {/* Bubble */}
                  <div className={`px-4 py-3 text-sm leading-relaxed ${
                    isClient
                      ? 'bg-charcoal-deep text-ivory-cream'
                      : 'bg-white text-charcoal-deep border border-sand/30'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-sand/50 flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Message the atelier..."
          className="flex-1 border border-sand px-4 py-3 text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim()}
          className="px-4 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

const getStatusIcon = (status: BespokeOrderStatus) => {
  switch (status) {
    case 'consultation': return <Clock size={12} />;
    case 'design_approval': return <Gem size={12} />;
    case 'production': return <Gem size={12} />;
    case 'fitting': return <Gem size={12} />;
    case 'complete': return <CheckCircle size={12} />;
    default: return <Clock size={12} />;
  }
};

const getStatusLabel = (status: BespokeOrderStatus) => {
  switch (status) {
    case 'consultation': return 'Consultation';
    case 'design_approval': return 'Design Approval';
    case 'production': return 'In Production';
    case 'fitting': return 'Fitting';
    case 'final_adjustments': return 'Final Adjustments';
    case 'complete': return 'Complete';
    default: return status;
  }
};

const getStatusColor = (status: BespokeOrderStatus) => {
  switch (status) {
    case 'consultation': return 'bg-gold-soft/10 text-gold-deep';
    case 'design_approval': return 'bg-gold-soft/10 text-gold-deep';
    case 'production': return 'bg-charcoal-deep/10 text-charcoal-deep';
    case 'fitting': return 'bg-gold-soft/10 text-gold-deep';
    case 'final_adjustments': return 'bg-gold-soft/10 text-gold-deep';
    case 'complete': return 'bg-success/10 text-success';
    default: return 'bg-parchment text-stone';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'made_to_measure': return 'Made to Measure';
    case 'custom_design': return 'Custom Design';
    case 'modification': return 'Modification';
    default: return type;
  }
};

export default function BespokeOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { bespokeOrders, addMessageToBespokeOrder, approveBespokeDesign } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => { setIsLoaded(true); }, []);

  const order = bespokeOrders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center p-8">
        <div className="text-center">
          <Gem size={48} className="mx-auto text-taupe mb-4" />
          <p className="text-stone mb-4">Order not found</p>
          <Link href="/uhni/bespoke" className="text-sm text-gold-muted hover:text-gold-deep transition-colors">
            Back to Bespoke Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/uhni/bespoke"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Bespoke Orders
          </Link>

          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-2 mb-4">
              <Gem size={12} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                Bespoke Commission
              </span>
            </div>
            <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              {order.title}
            </h1>
            <p className="text-sand mt-3">
              {order.selectedBrands && order.selectedBrands.length > 0
                ? order.selectedBrands.map(b => b.name || b.id).filter(Boolean).join(' · ')
                : order.brandName || 'Bespoke Commission'}
            </p>
          </div>
        </div>
      </div>

      <div className={`max-w-[800px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Status & Price */}
        <div className="bg-white p-6 border border-sand/50 mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                {getStatusLabel(order.status)}
              </span>
              <span className="text-[10px] tracking-[0.15em] uppercase text-taupe">
                {getTypeLabel(order.type)}
              </span>
            </div>
            <div className="text-right">
              {order.price > 0 ? (
                <>
                  <p className="font-display text-2xl text-charcoal-deep">{formatPrice(order.price)}</p>
                  <p className="text-xs text-taupe mt-1">
                    {order.depositPaid > 0
                      ? `Deposit: ${formatPrice(order.depositPaid)} (${order.depositPercentage}%)`
                      : 'Deposit pending'}
                  </p>
                </>
              ) : (
                <p className="text-sm text-taupe italic">Price pending</p>
              )}
            </div>
          </div>

          {order.description && (
            <p className="text-stone text-sm mb-4">{order.description}</p>
          )}

          <div className="flex items-center gap-6 text-sm text-taupe">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>Est. completion: {order.estimatedCompletion
                ? new Date(order.estimatedCompletion).toLocaleDateString()
                : 'To be determined'}</span>
            </div>
            <span className="text-xs">Order #{order.id.toUpperCase()}</span>
          </div>
        </div>

        {/* Production Timeline */}
        <div className="mb-8">
          <h2 className="text-[10px] tracking-[0.3em] uppercase text-charcoal-deep mb-6">Production Timeline</h2>
          <div className="space-y-0">
            {order.timeline.map((step, index) => (
              <div key={step.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                    step.status === 'completed' ? 'bg-success text-ivory-cream' :
                    step.status === 'current' ? 'bg-charcoal-deep text-ivory-cream' :
                    'bg-sand text-stone'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle size={14} />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  {index < order.timeline.length - 1 && (
                    <div className={`w-0.5 h-16 ${
                      step.status === 'completed' ? 'bg-success' : 'bg-sand'
                    }`} />
                  )}
                </div>

                <div className="pb-8 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-medium ${
                        step.status === 'current' ? 'text-charcoal-deep' :
                        step.status === 'completed' ? 'text-success' : 'text-taupe'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-sm text-stone mt-1">{step.description}</p>
                      {step.notes && (
                        <p className="text-xs text-taupe mt-2 italic">{step.notes}</p>
                      )}
                    </div>
                    <div className="text-right text-xs text-taupe">
                      {step.completedAt ? (
                        <span className="text-success">
                          {new Date(step.completedAt).toLocaleDateString()}
                        </span>
                      ) : step.estimatedDate ? (
                        <span>Est. {new Date(step.estimatedDate).toLocaleDateString()}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Design Approval */}
        {order.clientApprovalRequired && !order.clientApproved && (
          <div className="bg-gold-soft/10 border border-gold-soft/30 p-6 mb-8">
            <p className="text-sm font-medium text-gold-deep mb-2">
              Design Approval Required
            </p>
            <p className="text-xs text-stone mb-4">
              The brand has shared a design for your approval. Please review and confirm to proceed to production.
            </p>
            <button
              onClick={() => approveBespokeDesign(order.id)}
              className="px-5 py-3 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.1em] uppercase hover:bg-noir transition-colors"
            >
              Approve Design &amp; Proceed to Production
            </button>
          </div>
        )}

        {/* Progress Timeline Events */}
        {order.timelineEvents && order.timelineEvents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-charcoal-deep mb-4">Progress Updates</h2>
            <div className="space-y-3">
              {order.timelineEvents.map(event => (
                <div key={event.id} className="flex items-start gap-3 bg-white p-4 border border-sand/50">
                  <div className="w-2 h-2 rounded-full bg-gold-soft mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-charcoal-deep font-medium">{getStatusLabel(event.status)}</p>
                    <p className="text-xs text-stone">{event.note}</p>
                    <p className="text-xs text-taupe mt-1">
                      {new Date(event.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specifications */}
        {order.specifications.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-charcoal-deep mb-4">Specifications</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {order.specifications.map((spec, index) => (
                <div key={index} className="bg-white p-4 border border-sand/50 flex items-start gap-3">
                  <div className="w-6 h-6 bg-parchment flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] text-stone">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-xs text-taupe">{spec.category} / {spec.label}</p>
                    <p className="text-sm text-charcoal-deep">{spec.value}</p>
                    {spec.notes && <p className="text-xs text-taupe mt-1">{spec.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Photos */}
        {order.progressImages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-charcoal-deep mb-4">Progress Photos</h2>
            <div className="flex gap-3 overflow-x-auto">
              {order.progressImages.map((img, index) => (
                <div key={index} className="w-28 h-28 bg-parchment flex-shrink-0 relative overflow-hidden">
                  <Image src={img} alt={`Progress ${index + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversation */}
        <div className="mb-8">
          <h2 className="text-[10px] tracking-[0.3em] uppercase text-charcoal-deep mb-4">Conversation</h2>
          <BespokeChat
            order={order}
            onSend={(content) => addMessageToBespokeOrder(order.id, content, 'client')}
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-8 border-t border-sand flex items-center justify-between">
          <p className="text-xs text-taupe">
            Created {new Date(order.createdAt).toLocaleDateString()}
            {order.atelierContact && <> &middot; Atelier: <span className="text-charcoal-deep">{order.atelierContact}</span></>}
          </p>
          <button
            onClick={() => setShowInvoice(true)}
            className="inline-flex items-center gap-2 px-5 py-3 border border-sand text-stone text-xs tracking-[0.1em] uppercase hover:border-charcoal-deep hover:text-charcoal-deep transition-colors"
          >
            <FileText size={14} />
            View Invoice
          </button>
        </div>
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
              brandName={order.brandName || 'ModaGlimmora Bespoke'}
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
              notes={`Estimated completion: ${order.estimatedCompletion ? new Date(order.estimatedCompletion).toLocaleDateString() : 'TBD'}`}
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
                onClick={() => downloadInvoice(`order-${order.id}.pdf`)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-sand text-stone text-sm tracking-[0.1em] uppercase hover:border-charcoal-deep hover:text-charcoal-deep transition-colors"
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
