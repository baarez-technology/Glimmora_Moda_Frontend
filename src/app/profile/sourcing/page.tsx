'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Crown, Search, Plus, Clock, CheckCircle, Package, MessageCircle, ChevronRight, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function SourcingPage() {
  const router = useRouter();
  const { isUHNI, sourcingRequests, concierge } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Redirect non-UHNI users
  useEffect(() => {
    if (!isUHNI) {
      router.push('/profile');
    }
  }, [isUHNI, router]);

  if (!isUHNI) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-taupe" />;
      case 'sourcing':
        return <Search size={16} className="text-gold-muted" />;
      case 'options_found':
        return <CheckCircle size={16} className="text-success" />;
      case 'awaiting_approval':
        return <AlertCircle size={16} className="text-gold-muted" />;
      case 'acquired':
        return <Package size={16} className="text-success" />;
      case 'delivered':
        return <CheckCircle size={16} className="text-success" />;
      default:
        return <Clock size={16} className="text-taupe" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'sourcing':
        return 'Sourcing';
      case 'options_found':
        return 'Options Found';
      case 'awaiting_approval':
        return 'Awaiting Approval';
      case 'acquired':
        return 'Acquired';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-parchment text-stone';
      case 'sourcing':
        return 'bg-gold-muted/10 text-gold-muted';
      case 'options_found':
        return 'bg-success/10 text-success';
      case 'awaiting_approval':
        return 'bg-gold-muted/10 text-gold-muted';
      case 'acquired':
      case 'delivered':
        return 'bg-success/10 text-success';
      case 'cancelled':
        return 'bg-stone/10 text-stone';
      default:
        return 'bg-parchment text-stone';
    }
  };

  const filteredRequests = sourcingRequests.filter(request => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'sourcing', 'options_found', 'awaiting_approval'].includes(request.status);
    if (filter === 'completed') return ['acquired', 'delivered', 'cancelled'].includes(request.status);
    return true;
  });

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1000px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className={`flex items-start justify-between gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gold-soft/20 flex items-center justify-center">
                <Search size={28} className="text-gold-soft" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={12} className="text-gold-soft" />
                  <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                    UHNI Exclusive
                  </span>
                </div>
                <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
                  Private Sourcing
                </h1>
                <p className="text-sand mt-2">
                  {sourcingRequests.length} request{sourcingRequests.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <Link
              href="/profile/sourcing/new"
              className="flex items-center gap-2 px-5 py-3 bg-gold-soft/20 text-gold-soft hover:bg-gold-soft/30 transition-colors"
            >
              <Plus size={18} />
              <span className="text-sm tracking-[0.1em] uppercase hidden sm:inline">New Request</span>
            </Link>
          </div>
        </div>
      </div>

      <div className={`max-w-[1000px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Concierge Note */}
        {concierge && (
          <div className="bg-charcoal-deep p-6 mb-8 flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gold-soft/30">
              <Image
                src={concierge.avatar}
                alt={concierge.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-ivory-cream">
                Your concierge <span className="text-gold-soft">{concierge.name}</span> is handling your sourcing requests.
              </p>
            </div>
            <Link
              href="/profile/concierge"
              className="flex items-center gap-2 text-gold-soft hover:text-gold-soft/80 transition-colors"
            >
              <MessageCircle size={18} />
              <span className="text-sm hidden sm:inline">Message</span>
            </Link>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-8 bg-parchment p-1">
          {(['all', 'active', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-3 text-sm tracking-[0.1em] uppercase transition-colors ${
                filter === tab
                  ? 'bg-white text-charcoal-deep'
                  : 'text-stone hover:text-charcoal-deep'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-20 bg-white">
            <div className="w-16 h-16 mx-auto mb-6 bg-parchment flex items-center justify-center">
              <Search size={32} className="text-stone" />
            </div>
            <h3 className="font-display text-xl text-charcoal-deep mb-3">
              No Sourcing Requests
            </h3>
            <p className="text-stone mb-8 max-w-md mx-auto">
              Looking for something specific? Our concierge team can source rare and exclusive items for you.
            </p>
            <Link
              href="/profile/sourcing/new"
              className="inline-flex items-center gap-3 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-all duration-300"
            >
              <Plus size={18} />
              <span className="text-sm tracking-[0.15em] uppercase">Create Request</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-white overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1.5">{getStatusLabel(request.status)}</span>
                        </span>
                        <span className="text-[10px] tracking-[0.15em] uppercase text-taupe">
                          {request.type.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="font-display text-xl text-charcoal-deep">{request.title}</h3>
                    </div>
                    {request.budget && (
                      <div className="text-right">
                        <p className="text-[10px] tracking-[0.15em] uppercase text-taupe">Budget</p>
                        <p className="font-display text-lg text-charcoal-deep">
                          €{request.budget.min.toLocaleString()} - €{request.budget.max.toLocaleString()}
                          {request.budget.flexible && <span className="text-xs text-stone ml-1">(flexible)</span>}
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="text-stone text-sm mb-4">{request.description}</p>

                  {/* Options Found */}
                  {request.foundOptions.length > 0 && (
                    <div className="mt-4 p-4 bg-success/5 border border-success/20">
                      <p className="text-sm text-success font-medium mb-2">
                        {request.foundOptions.length} option{request.foundOptions.length !== 1 ? 's' : ''} found
                      </p>
                      <div className="flex gap-4 overflow-x-auto">
                        {request.foundOptions.slice(0, 3).map((option) => (
                          <div key={option.id} className="flex-shrink-0 w-24">
                            <div className="relative w-24 h-24 bg-parchment mb-2">
                              {option.images[0] && (
                                <Image
                                  src={option.images[0]}
                                  alt={option.customDescription || 'Option'}
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <p className="text-xs text-charcoal-deep font-medium">€{option.price.toLocaleString()}</p>
                            <p className="text-[10px] text-taupe capitalize">{option.condition}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Latest Note */}
                  {request.conciergeNotes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-sand">
                      <div className="flex items-start gap-3">
                        <MessageCircle size={14} className="text-stone mt-0.5" />
                        <div className="flex-1">
                          <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-1">
                            Latest Update
                          </p>
                          <p className="text-sm text-stone">
                            {request.conciergeNotes[request.conciergeNotes.length - 1].content.substring(0, 150)}
                            {request.conciergeNotes[request.conciergeNotes.length - 1].content.length > 150 ? '...' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-sand flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-taupe">
                      <span>Created {new Date(request.createdAt).toLocaleDateString()}</span>
                      {request.deadline && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Deadline: {new Date(request.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <button className="flex items-center gap-1 text-sm text-charcoal-deep hover:text-gold-muted transition-colors">
                      <span className="tracking-[0.1em] uppercase">View Details</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
