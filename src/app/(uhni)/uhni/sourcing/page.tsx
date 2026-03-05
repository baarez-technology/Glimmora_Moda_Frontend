'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Crown, Search, Plus, Clock, CheckCircle, Package, MessageCircle, ChevronRight, AlertCircle, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';

function SourcingMessageInput({ onSend }: { onSend: (msg: string) => void }) {
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
        placeholder="Message the sourcing team..."
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
        Send
      </button>
    </div>
  );
}

export default function SourcingPage() {
  const { sourcingRequests, concierge, selectSourcingOption, addSourcingMessage } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-error/10 text-error';
      case 'when_available':
        return 'bg-parchment text-stone';
      default:
        return 'bg-info/10 text-info';
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
            href="/uhni"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className={`flex items-start justify-between gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gold-soft/20 flex items-center justify-center">
                <Search size={28} className="text-gold-soft" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Search size={12} className="text-gold-soft" />
                  <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                    Global Network
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
              href="/uhni/sourcing/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-charcoal-deep border border-gold-soft/30 text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.1em] uppercase"
            >
              <Plus size={15} />
              New Request
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
              href="/uhni/concierge"
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
              href="/uhni/sourcing/new"
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
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span>{getStatusLabel(request.status)}</span>
                        </span>
                        <span className="text-[10px] tracking-[0.15em] uppercase text-taupe">
                          {request.type.replace('_', ' ')}
                        </span>
                        {request.priority && request.priority !== 'standard' && (
                          <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${getPriorityBadge(request.priority)}`}>
                            {request.priority === 'when_available' ? 'When Available' : request.priority}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-xl text-charcoal-deep">{request.title}</h3>
                    </div>
                    {request.budget && (
                      <div className="text-right">
                        <p className="text-[10px] tracking-[0.15em] uppercase text-taupe">Budget</p>
                        <p className="font-display text-lg text-charcoal-deep">
                          €{request.budget.max.toLocaleString()}
                          {request.budget.flexible && <span className="text-xs text-stone ml-1">(flexible)</span>}
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="text-stone text-sm mb-4">{request.description}</p>

                  {/* Options Found Summary */}
                  {request.foundOptions.length > 0 && expandedRequest !== request.id && (
                    <div className="mt-4 p-4 bg-success/5 border border-success/20">
                      <p className="text-sm text-success font-medium">
                        {request.foundOptions.length} option{request.foundOptions.length !== 1 ? 's' : ''} found
                      </p>
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
                    <button
                      onClick={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                      className="flex items-center gap-1 text-sm text-charcoal-deep hover:text-gold-muted transition-colors"
                    >
                      <span className="tracking-[0.1em] uppercase">
                        {expandedRequest === request.id ? 'Hide Details' : 'View Details'}
                      </span>
                      <ChevronRight size={14} className={`transition-transform ${expandedRequest === request.id ? 'rotate-90' : ''}`} />
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {expandedRequest === request.id && (
                    <div className="mt-4 pt-4 border-t border-sand space-y-4">
                      {/* Request Metadata */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-parchment/30">
                        <div>
                          <p className="text-[10px] tracking-[0.15em] uppercase text-taupe">Type</p>
                          <p className="text-sm text-charcoal-deep capitalize">{request.type.replace('_', ' ')}</p>
                        </div>
                        {request.category && (
                          <div>
                            <p className="text-[10px] tracking-[0.15em] uppercase text-taupe">Category</p>
                            <p className="text-sm text-charcoal-deep">{request.category}</p>
                          </div>
                        )}
                        {request.specifications && (
                          <div>
                            <p className="text-[10px] tracking-[0.15em] uppercase text-taupe">Specifications</p>
                            <p className="text-sm text-charcoal-deep">{request.specifications}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] tracking-[0.15em] uppercase text-taupe">Last Updated</p>
                          <p className="text-sm text-charcoal-deep">{new Date(request.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Timeline */}
                      {request.timeline && request.timeline.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-sand">
                          <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">Progress</p>
                          <div className="space-y-2">
                            {request.timeline.map(event => (
                              <div key={event.id} className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-gold-soft mt-1.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm text-charcoal-deep font-medium">
                                    {getStatusLabel(event.status)}
                                  </p>
                                  <p className="text-xs text-stone">{event.note}</p>
                                  <p className="text-xs text-taupe">
                                    {new Date(event.createdAt).toLocaleDateString('en-US', {
                                      month: 'short', day: 'numeric',
                                      hour: '2-digit', minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Options Found */}
                      {request.foundOptions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-sand">
                          <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">
                            Options Found — Select Your Preferred Item
                          </p>
                          <div className="space-y-3">
                            {request.foundOptions.map(option => (
                              <div
                                key={option.id}
                                className={`p-4 border transition-colors ${
                                  request.selectedOptionId === option.id
                                    ? 'border-charcoal-deep bg-parchment'
                                    : 'border-sand hover:border-charcoal-deep/50'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <p className="font-medium text-charcoal-deep text-sm">
                                      {option.title || option.customDescription || option.product?.name || 'Untitled Option'}
                                    </p>
                                    {option.brandName && (
                                      <p className="text-xs text-gold-muted tracking-[0.1em] uppercase mt-0.5">
                                        {option.brandName}
                                      </p>
                                    )}
                                    {(option.description || option.conciergeRecommendation) && (
                                      <p className="text-xs text-stone mt-1">
                                        {option.description || option.conciergeRecommendation}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-3 mt-2">
                                      <p className="font-display text-lg text-charcoal-deep">
                                        €{option.price.toLocaleString()}
                                      </p>
                                      <span className="text-xs text-stone">
                                        {option.sourceLocation || option.source}
                                      </span>
                                      {option.estimatedDelivery && (
                                        <span className="text-xs text-stone">
                                          Est. delivery: {option.estimatedDelivery}
                                        </span>
                                      )}
                                    </div>
                                    {option.notes && (
                                      <p className="text-xs text-stone italic mt-1">{option.notes}</p>
                                    )}
                                  </div>
                                  {request.selectedOptionId !== option.id &&
                                   request.status !== 'acquired' &&
                                   request.status !== 'delivered' && (
                                    <button
                                      onClick={() => selectSourcingOption(request.id, option.id)}
                                      className="flex-shrink-0 px-4 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.1em] uppercase hover:bg-noir transition-colors"
                                    >
                                      Select This
                                    </button>
                                  )}
                                  {request.selectedOptionId === option.id && (
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <Check size={16} className="text-success" />
                                      <span className="text-xs text-success font-medium">Selected</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Concierge Notes (legacy) */}
                      {request.conciergeNotes.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-sand">
                          <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">Concierge Notes</p>
                          <div className="space-y-3">
                            {request.conciergeNotes.map((note) => (
                              <div key={note.id} className={`p-3 text-sm ${note.author === 'concierge' ? 'bg-parchment text-charcoal-deep' : 'bg-charcoal-deep/5 text-stone'}`}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] tracking-[0.15em] uppercase font-medium">
                                    {note.author === 'concierge' ? concierge?.name || 'Concierge' : 'You'}
                                  </span>
                                  <span className="text-[10px] text-taupe">
                                    {new Date(note.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                                <p>{note.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Messages */}
                      <div className="mt-4 pt-4 border-t border-sand">
                        <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">Messages</p>
                        {(!request.messages || request.messages.length === 0) ? (
                          <p className="text-sm text-stone italic mb-3">
                            No messages yet. Your sourcing team will be in touch soon.
                          </p>
                        ) : (
                          <div className="space-y-3 max-h-48 overflow-y-auto mb-3">
                            {request.messages.map(msg => (
                              <div
                                key={msg.id}
                                className={`p-3 max-w-sm text-sm ${
                                  msg.senderRole === 'client'
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
                        <SourcingMessageInput
                          onSend={(content) => addSourcingMessage(request.id, content)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
