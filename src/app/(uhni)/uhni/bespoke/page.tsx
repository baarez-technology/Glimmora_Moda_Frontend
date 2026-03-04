'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Crown, Gem, Plus, Clock, CheckCircle, Ruler, Palette, Scissors, Eye, ChevronDown, ChevronUp, Calendar, FileText, Printer, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { BespokeOrderStatus } from '@/types';
import InvoiceDocument, { generateInvoiceNumber, printInvoice } from '@/components/shared/InvoiceDocument';

export default function BespokeOrdersPage() {
  const { bespokeOrders, concierge } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [invoiceOrderId, setInvoiceOrderId] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const getStatusIcon = (status: BespokeOrderStatus) => {
    switch (status) {
      case 'consultation':
        return <Eye size={16} />;
      case 'design_approval':
        return <Palette size={16} />;
      case 'production':
        return <Scissors size={16} />;
      case 'fitting':
        return <Ruler size={16} />;
      case 'final_adjustments':
        return <Scissors size={16} />;
      case 'complete':
        return <CheckCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusLabel = (status: BespokeOrderStatus) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: BespokeOrderStatus) => {
    switch (status) {
      case 'complete':
        return 'bg-success/10 text-success';
      case 'production':
      case 'fitting':
      case 'final_adjustments':
        return 'bg-gold-muted/10 text-gold-muted';
      default:
        return 'bg-parchment text-stone';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'made_to_measure':
        return 'Made to Measure';
      case 'custom_design':
        return 'Custom Design';
      case 'modification':
        return 'Modification';
      default:
        return type;
    }
  };

  const activeInvoiceOrder = bespokeOrders.find(o => o.id === invoiceOrderId);

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1000px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/uhni"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className={`flex items-start justify-between gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gold-soft/20 flex items-center justify-center">
                <Gem size={28} className="text-gold-soft" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Gem size={12} className="text-gold-soft" />
                  <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                    Custom Commissions
                  </span>
                </div>
                <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
                  Bespoke Orders
                </h1>
                <p className="text-sand mt-2">
                  {bespokeOrders.length} commission{bespokeOrders.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <Link
              href="/uhni/concierge"
              className="flex items-center gap-2 px-5 py-3 bg-gold-soft/20 text-gold-soft hover:bg-gold-soft/30 transition-colors"
            >
              <Plus size={18} />
              <span className="text-sm tracking-[0.1em] uppercase hidden sm:inline">New Commission</span>
            </Link>
          </div>
        </div>
      </div>

      <div className={`max-w-[1000px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Info Box */}
        <div className="bg-parchment p-6 border border-sand mb-10">
          <p className="text-sm text-stone">
            <span className="font-medium text-charcoal-deep">Bespoke commissions</span> are crafted exclusively for you.
            Each piece is created by master artisans following your exact specifications. Contact your concierge
            {concierge && <span className="text-gold-muted"> {concierge.name}</span>} to begin a new commission.
          </p>
        </div>

        {/* Orders List */}
        {bespokeOrders.length === 0 ? (
          <div className="text-center py-20 bg-white">
            <div className="w-16 h-16 mx-auto mb-6 bg-parchment flex items-center justify-center">
              <Gem size={32} className="text-stone" />
            </div>
            <h3 className="font-display text-xl text-charcoal-deep mb-3">
              No Bespoke Orders
            </h3>
            <p className="text-stone mb-8 max-w-md mx-auto">
              Commission a custom piece crafted exclusively for you. Contact your concierge to begin.
            </p>
            <Link
              href="/uhni/concierge"
              className="inline-flex items-center gap-3 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-all duration-300"
            >
              <span className="text-sm tracking-[0.15em] uppercase">Contact Concierge</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bespokeOrders.map((order) => (
              <div key={order.id} className="bg-white overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-sand">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`flex items-center gap-1.5 px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </span>
                        <span className="text-[10px] tracking-[0.15em] uppercase text-taupe">
                          {getTypeLabel(order.type)}
                        </span>
                      </div>
                      <h3 className="font-display text-xl text-charcoal-deep">{order.title}</h3>
                      <p className="text-sm text-taupe mt-1">{order.brandName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl text-charcoal-deep">€{order.price.toLocaleString()}</p>
                      <p className="text-xs text-taupe mt-1">
                        Deposit: €{order.depositPaid.toLocaleString()} ({order.depositPercentage}%)
                      </p>
                    </div>
                  </div>

                  <p className="text-stone text-sm">{order.description}</p>

                  <div className="flex items-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2 text-taupe">
                      <Calendar size={14} />
                      <span>Est. completion: {new Date(order.estimatedCompletion).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="p-6 bg-parchment/30">
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    aria-expanded={expandedOrder === order.id}
                    className="w-full flex items-center justify-between"
                  >
                    <span className="text-[10px] tracking-[0.3em] uppercase text-taupe">Production Timeline</span>
                    {expandedOrder === order.id ? (
                      <ChevronUp size={18} className="text-stone" />
                    ) : (
                      <ChevronDown size={18} className="text-stone" />
                    )}
                  </button>

                  {expandedOrder === order.id && (
                    <div className="mt-6 space-y-0">
                      {order.timeline.map((step, index) => (
                        <div key={step.id} className="flex gap-4">
                          {/* Timeline Line */}
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

                          {/* Step Content */}
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
                  )}
                </div>

                {/* Specifications */}
                {order.specifications.length > 0 && (
                  <div className="p-6 border-t border-sand">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-4">Specifications</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {order.specifications.map((spec, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-parchment flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] text-stone">{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-xs text-taupe">{spec.category} / {spec.label}</p>
                            <p className="text-sm text-charcoal-deep">{spec.value}</p>
                            {spec.notes && (
                              <p className="text-xs text-taupe mt-1">{spec.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress Images */}
                {order.progressImages.length > 0 && (
                  <div className="p-6 border-t border-sand">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-taupe mb-4">Progress Photos</p>
                    <div className="flex gap-2 overflow-x-auto">
                      {order.progressImages.map((img, index) => (
                        <div key={index} className="w-20 h-20 bg-parchment flex-shrink-0 relative overflow-hidden">
                          <Image src={img} alt={`Progress ${index + 1}`} fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="p-6 border-t border-sand bg-parchment/50 flex items-center justify-between">
                  <div className="text-xs text-taupe">
                    Order #{order.id.toUpperCase()} • Created {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setInvoiceOrderId(order.id)}
                      className="inline-flex items-center gap-2 text-xs text-stone hover:text-charcoal-deep transition-colors"
                    >
                      <FileText size={14} />
                      View Invoice
                    </button>
                    {order.atelierContact && (
                      <p className="text-xs text-stone">
                        Atelier: <span className="text-charcoal-deep">{order.atelierContact}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {activeInvoiceOrder && (
        <div className="fixed inset-0 bg-charcoal-deep/60 flex items-center justify-center z-50 p-4" onClick={() => setInvoiceOrderId(null)}>
          <div className="bg-white max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl text-charcoal-deep">Bespoke Invoice</h3>
              <button onClick={() => setInvoiceOrderId(null)} className="p-2 hover:bg-sand/20 transition-colors">
                <X size={18} />
              </button>
            </div>
            <InvoiceDocument
              invoiceNumber={generateInvoiceNumber(activeInvoiceOrder.id, activeInvoiceOrder.createdAt)}
              invoiceDate={activeInvoiceOrder.createdAt}
              orderType="bespoke"
              brandName={activeInvoiceOrder.brandName || 'ModaGlimmora Bespoke'}
              buyerName="Valued Client"
              buyerEmail=""
              items={[{
                description: activeInvoiceOrder.title,
                detail: activeInvoiceOrder.description,
                quantity: 1,
                unitPrice: activeInvoiceOrder.price,
                currency: 'EUR',
              }]}
              subtotal={activeInvoiceOrder.price}
              shippingAmount={0}
              taxRate={0.20}
              taxAmount={Math.round(activeInvoiceOrder.price * 0.20 / 1.20)}
              total={activeInvoiceOrder.price}
              currency="EUR"
              depositPaid={activeInvoiceOrder.depositPaid}
              balanceDue={activeInvoiceOrder.price - activeInvoiceOrder.depositPaid}
              paymentStatus={activeInvoiceOrder.status === 'complete' ? 'paid' : 'deposit_paid'}
              notes={`Estimated completion: ${new Date(activeInvoiceOrder.estimatedCompletion).toLocaleDateString()}`}
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
