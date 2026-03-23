'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Gem, Plus, Clock, CheckCircle, Calendar, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { BespokeOrderStatus } from '@/types';

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

export default function BespokeOrdersPage() {
  const { bespokeOrders, concierge } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
              href="/uhni/bespoke/new"
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
              href="/uhni/bespoke/new"
              className="inline-flex items-center gap-3 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-all duration-300"
            >
              <span className="text-sm tracking-[0.15em] uppercase">Start New Commission</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bespokeOrders.map((order) => (
              <Link
                key={order.id}
                href={`/uhni/bespoke/${order.id}`}
                className="block bg-white border border-sand/50 hover:border-charcoal-deep/30 hover:shadow-sm transition-all group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
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
                      <p className="text-sm text-taupe mt-1">
                        {order.selectedBrands && order.selectedBrands.length > 0
                          ? order.selectedBrands.map(b => b.name || b.id).filter(Boolean).join(' · ')
                          : order.brandName || 'Bespoke Commission'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {order.price > 0 ? (
                        <p className="font-display text-2xl text-charcoal-deep">&euro;{order.price.toLocaleString()}</p>
                      ) : (
                        <p className="text-sm text-taupe italic">Price pending</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-taupe">
                      <Calendar size={14} />
                      <span>Est. completion: {order.estimatedCompletion
                        ? new Date(order.estimatedCompletion).toLocaleDateString()
                        : 'To be determined'}</span>
                    </div>
                    <ArrowRight size={16} className="text-taupe group-hover:text-charcoal-deep group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
