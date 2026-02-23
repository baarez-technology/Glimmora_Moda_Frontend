'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Crown,
  EyeOff,
  UserCheck,
  Cpu,
  Clock,
  Shield,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { uhniService } from '@/services';
import type { InvisibleTransaction, InvisibleMethod, DiscretionLevel } from '@/types/uhni';

export default function InvisibleCommercePage() {
  const { showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [transactions, setTransactions] = useState<InvisibleTransaction[]>([]);

  useEffect(() => {
    uhniService.getInvisibleTransactions().then(res => {
      if (res.data) setTransactions(res.data);
      setIsLoaded(true);
    });
  }, []);

  const getMethodBadge = (method: InvisibleMethod) => {
    switch (method) {
      case 'concierge': return 'bg-gold-soft/20 text-gold-deep';
      case 'auto': return 'bg-info/10 text-info';
      case 'scheduled': return 'bg-purple-100 text-purple-700';
    }
  };

  const getMethodIcon = (method: InvisibleMethod) => {
    switch (method) {
      case 'concierge': return UserCheck;
      case 'auto': return Cpu;
      case 'scheduled': return Clock;
    }
  };

  const getDiscretionBadge = (level: DiscretionLevel) => {
    switch (level) {
      case 'standard': return 'bg-stone/10 text-stone';
      case 'high': return 'bg-warning/10 text-warning';
      case 'maximum': return 'bg-error/10 text-error';
    }
  };

  const getDiscretionIcon = (level: DiscretionLevel) => {
    switch (level) {
      case 'standard': return ShieldCheck;
      case 'high': return ShieldAlert;
      case 'maximum': return Shield;
    }
  };

  const getStatusBadge = (status: InvisibleTransaction['status']) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning';
      case 'processing': return 'bg-info/10 text-info';
      case 'completed': return 'bg-success/10 text-success';
      case 'cancelled': return 'bg-stone/10 text-stone';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/uhni"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-3 mb-4">
              <Crown size={16} className="text-gold-soft" />
              <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                UHNI Exclusive
              </span>
            </div>
            <h1 className="font-display text-[clamp(2rem,4vw,3rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
              Invisible Commerce
            </h1>
            <p className="text-sand mt-3">Discreet transactions with complete privacy</p>
          </div>
        </div>
      </div>

      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Transaction Log */}
        <h2 className="text-[10px] tracking-[0.3em] uppercase text-stone mb-6">Transaction Log</h2>
        <div className="space-y-4">
          {transactions.map(transaction => {
            const MethodIcon = getMethodIcon(transaction.method);
            const DiscretionIcon = getDiscretionIcon(transaction.discretionLevel);
            return (
              <div key={transaction.id} className="bg-white border border-sand/30 p-6">
                <div className="flex items-start gap-5">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 bg-parchment overflow-hidden">
                    <Image
                      src={transaction.productImage}
                      alt={transaction.productName}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-display text-lg text-charcoal-deep mb-1">{transaction.productName}</h3>
                        <p className="text-xs text-stone">{formatDate(transaction.date)}</p>
                      </div>
                      <p className="font-display text-xl text-charcoal-deep flex-shrink-0 ml-4">
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>

                    <div className="flex items-center flex-wrap gap-2">
                      {/* Method Badge */}
                      <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase inline-flex items-center gap-1.5 ${getMethodBadge(transaction.method)}`}>
                        <MethodIcon size={12} />
                        {transaction.method}
                      </span>

                      {/* Discretion Level */}
                      <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase inline-flex items-center gap-1.5 ${getDiscretionBadge(transaction.discretionLevel)}`}>
                        <DiscretionIcon size={12} />
                        {transaction.discretionLevel}
                      </span>

                      {/* Status */}
                      <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${getStatusBadge(transaction.status)}`}>
                        {transaction.status}
                      </span>

                      {/* No Digital Trail */}
                      {transaction.noDigitalTrail && (
                        <span className="px-3 py-1 text-[10px] tracking-[0.15em] uppercase bg-charcoal-deep/5 text-charcoal-deep inline-flex items-center gap-1.5">
                          <EyeOff size={12} />
                          No Trail
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {transactions.length === 0 && isLoaded && (
          <div className="text-center py-16">
            <EyeOff size={40} className="text-stone/40 mx-auto mb-4" />
            <p className="text-stone">No invisible transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
