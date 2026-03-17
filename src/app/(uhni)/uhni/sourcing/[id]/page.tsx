'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Search,
  Clock,
  CheckCircle,
  Package,
  MessageCircle,
  AlertCircle,
  MapPin,
  Send,
  Star,
  Truck,
  User,
  Check,
  Shield,
  ArrowRight,
  Tag,
  XCircle,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  getSourcingRequests,
  getSourcingRequestById,
  enrichSourcingRequestWithLocal,
  saveSourcingState,
  selectSourcingOption,
  sendConsumerMessage,
  addConsumerNegotiation,
  type EnrichedSourcingRequest,
  type SourcingChatMessage,
  type SourcingOptionItem,
  type NegotiationStatus,
} from '@/services/sourcing.service';

// ── Helpers ───────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function conditionLabel(c: string) {
  const map: Record<string, string> = { new: 'New', like_new: 'Like New', excellent: 'Excellent', good: 'Good' };
  return map[c] || c;
}

function conditionColor(c: string) {
  const map: Record<string, string> = {
    new: 'bg-success/10 text-success',
    like_new: 'bg-info/10 text-info',
    excellent: 'bg-gold-muted/10 text-gold-muted',
    good: 'bg-parchment text-stone',
  };
  return map[c] || 'bg-parchment text-stone';
}

function getStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: 'Pending', sourcing: 'Sourcing', options_found: 'Options Found',
    awaiting_approval: 'Awaiting Approval', acquired: 'Acquired', delivered: 'Delivered', cancelled: 'Cancelled',
  };
  return map[status] || status;
}

function getStatusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-parchment text-stone', sourcing: 'bg-gold-muted/10 text-gold-muted',
    options_found: 'bg-success/10 text-success', awaiting_approval: 'bg-gold-muted/10 text-gold-muted',
    acquired: 'bg-success/10 text-success', delivered: 'bg-success/10 text-success', cancelled: 'bg-stone/10 text-stone',
  };
  return map[status] || 'bg-parchment text-stone';
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'pending': return <Clock size={14} className="text-taupe" />;
    case 'sourcing': return <Search size={14} className="text-gold-muted" />;
    case 'options_found': return <CheckCircle size={14} className="text-success" />;
    case 'awaiting_approval': return <AlertCircle size={14} className="text-gold-muted" />;
    case 'acquired': return <Package size={14} className="text-success" />;
    case 'delivered': return <CheckCircle size={14} className="text-success" />;
    default: return <Clock size={14} className="text-taupe" />;
  }
}

function getNegotiationBadge(status?: NegotiationStatus) {
  switch (status) {
    case 'negotiating':
      return { label: 'Negotiation Pending', className: 'bg-gold-muted/10 text-gold-muted animate-pulse', icon: Tag };
    case 'counter_offered':
      return { label: 'Counter Offer', className: 'bg-gold-soft/15 text-gold-muted', icon: ArrowRight };
    case 'accepted':
      return { label: 'Price Agreed', className: 'bg-success/10 text-success', icon: CheckCircle };
    case 'declined':
      return { label: 'Negotiation Declined', className: 'bg-stone/10 text-stone', icon: XCircle };
    default:
      return null;
  }
}

// ── Status Timeline ───────────────────────────────────────────────────

function StatusTimeline({ timeline }: { timeline: EnrichedSourcingRequest['timeline'] }) {
  const lastActive = timeline.reduce((acc, s, i) => (s.completed || s.active ? i : acc), 0);
  const pct = timeline.length > 1 ? (lastActive / (timeline.length - 1)) * 100 : 0;

  return (
    <div className="py-2">
      {/* Desktop horizontal */}
      <div className="hidden md:flex items-start justify-between relative">
        <div className="absolute top-[14px] left-[28px] right-[28px] h-[2px] bg-sand/60" />
        <div
          className="absolute top-[14px] left-[28px] h-[2px] bg-gold-soft transition-all duration-500"
          style={{ width: `calc(${pct}% - ${pct > 0 ? 0 : 28}px)`, maxWidth: 'calc(100% - 56px)' }}
        />
        {timeline.map((step) => (
          <div key={step.status} className="flex flex-col items-center relative z-10" style={{ width: `${100 / timeline.length}%` }}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
              step.completed ? 'bg-gold-soft border-gold-soft' : step.active ? 'bg-charcoal-deep border-gold-soft' : 'bg-ivory-cream border-sand'
            }`}>
              {step.completed ? <Check size={14} className="text-charcoal-deep" /> : step.active ? <div className="w-2 h-2 rounded-full bg-gold-soft animate-pulse" /> : <div className="w-2 h-2 rounded-full bg-sand" />}
            </div>
            <p className={`text-[10px] tracking-[0.1em] uppercase mt-2 text-center leading-tight ${step.completed || step.active ? 'text-charcoal-deep font-medium' : 'text-taupe'}`}>
              {step.label}
            </p>
            {step.date && <p className="text-[9px] text-taupe mt-0.5">{formatDate(step.date)}</p>}
          </div>
        ))}
      </div>

      {/* Mobile vertical */}
      <div className="md:hidden space-y-0">
        {timeline.map((step, i) => (
          <div key={step.status} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                step.completed ? 'bg-gold-soft border-gold-soft' : step.active ? 'bg-charcoal-deep border-gold-soft' : 'bg-ivory-cream border-sand'
              }`}>
                {step.completed ? <Check size={12} className="text-charcoal-deep" /> : step.active ? <div className="w-1.5 h-1.5 rounded-full bg-gold-soft animate-pulse" /> : <div className="w-1.5 h-1.5 rounded-full bg-sand" />}
              </div>
              {i < timeline.length - 1 && <div className={`w-[2px] h-8 ${step.completed ? 'bg-gold-soft' : 'bg-sand/60'}`} />}
            </div>
            <div className="pb-6">
              <p className={`text-xs ${step.completed || step.active ? 'text-charcoal-deep font-medium' : 'text-taupe'}`}>{step.label}</p>
              {step.date && <p className="text-[10px] text-taupe">{formatDate(step.date)}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Option Card ───────────────────────────────────────────────────────

function OptionCard({
  option,
  onSelect,
  canSelect,
  onNegotiate,
  onAcceptCounter,
  onDeclineCounter,
  negotiatingId,
  setNegotiatingId,
}: {
  option: SourcingOptionItem;
  onSelect?: () => void;
  canSelect: boolean;
  onNegotiate?: (proposedPrice: number, note: string) => void;
  onAcceptCounter?: () => void;
  onDeclineCounter?: () => void;
  negotiatingId: string | null;
  setNegotiatingId: (id: string | null) => void;
}) {
  const [proposedPrice, setProposedPrice] = useState('');
  const [negotiationNote, setNegotiationNote] = useState('');
  const showForm = negotiatingId === option.id;
  const negBadge = getNegotiationBadge(option.negotiationStatus);
  const hasActiveNegotiation = option.negotiationStatus === 'negotiating' || option.negotiationStatus === 'counter_offered';
  const discount = proposedPrice ? Math.round((1 - Number(proposedPrice) / option.price) * 100) : 0;

  const handleSubmitNegotiation = () => {
    const price = Number(proposedPrice);
    if (price > 0 && price < option.price && onNegotiate) {
      onNegotiate(price, negotiationNote);
      setProposedPrice('');
      setNegotiationNote('');
      setNegotiatingId(null);
    }
  };

  return (
    <div className={`border transition-all ${
      option.selected ? 'border-gold-soft bg-gold-soft/5' :
      option.negotiationStatus === 'counter_offered' ? 'border-gold-soft/60 bg-gold-soft/5' :
      'border-sand/50 bg-white hover:border-sand'
    }`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {option.selected && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-soft/20 text-gold-muted text-[10px] tracking-[0.1em] uppercase">
                  <Star size={10} /> Selected
                </span>
              )}
              <span className={`inline-flex items-center px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${conditionColor(option.condition)}`}>
                {conditionLabel(option.condition)}
              </span>
              {negBadge && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${negBadge.className}`}>
                  <negBadge.icon size={10} /> {negBadge.label}
                </span>
              )}
            </div>
            <h4 className="font-medium text-charcoal-deep text-sm mb-1">{option.title}</h4>
            <div className="flex items-center gap-3 text-xs text-stone mb-3 flex-wrap">
              {option.brandName && (
                <>
                  <span className="text-[10px] tracking-[0.1em] uppercase px-2 py-0.5 bg-charcoal-deep/5 text-charcoal-deep font-medium">{option.brandName}</span>
                  <span className="text-taupe">|</span>
                </>
              )}
              <span className="flex items-center gap-1"><MapPin size={11} />{option.source}</span>
              <span className="text-taupe">|</span>
              <span>{option.sourceLocation}</span>
            </div>
            {option.conciergeNote && (
              <div className="bg-parchment/50 border-l-2 border-gold-soft/40 px-3 py-2 mb-3">
                <p className="text-xs text-stone italic">&ldquo;{option.conciergeNote}&rdquo;</p>
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-taupe">
              <span className="flex items-center gap-1"><Truck size={11} />{option.estimatedDelivery}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-display text-lg text-charcoal-deep">&euro;{option.price.toLocaleString()}</p>
            {option.originalPrice && option.originalPrice > option.price && (
              <p className="text-xs text-taupe line-through">&euro;{option.originalPrice.toLocaleString()}</p>
            )}
            {/* Show agreed price for accepted negotiations */}
            {option.negotiationStatus === 'accepted' && option.proposedPrice && (
              <p className="text-xs text-success mt-1">Agreed: &euro;{option.proposedPrice.toLocaleString()}</p>
            )}
            {/* Action buttons */}
            {canSelect && !option.selected && !hasActiveNegotiation && (
              <div className="mt-3 space-y-2">
                <button onClick={onSelect} className="w-full px-4 py-2 bg-charcoal-deep text-ivory-cream text-[10px] tracking-[0.15em] uppercase hover:bg-noir transition-colors">
                  Select Option
                </button>
                {option.negotiationStatus !== 'declined' && (
                  <button
                    onClick={() => setNegotiatingId(showForm ? null : option.id)}
                    className="w-full px-4 py-2 border border-gold-soft/40 text-gold-muted text-[10px] tracking-[0.15em] uppercase hover:bg-gold-soft/5 transition-colors"
                  >
                    <span className="inline-flex items-center gap-1.5"><DollarSign size={11} /> Negotiate Price</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Negotiation Pending Note (client's own proposal, waiting for brand) ── */}
      {option.negotiationStatus === 'negotiating' && option.proposedPrice && (
        <div className="px-5 pb-5 border-t border-sand/30 pt-4">
          <div className="bg-gold-muted/5 border border-gold-muted/20 p-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-gold-muted mb-3">Your Negotiation</p>
            <div className="flex items-center gap-4 mb-3">
              <div className="text-center">
                <p className="text-[9px] tracking-[0.1em] uppercase text-taupe mb-1">Listed</p>
                <p className="font-display text-sm text-charcoal-deep">&euro;{option.price.toLocaleString()}</p>
              </div>
              <ArrowRight size={16} className="text-taupe" />
              <div className="text-center">
                <p className="text-[9px] tracking-[0.1em] uppercase text-gold-muted mb-1">Your Offer</p>
                <p className="font-display text-sm text-gold-muted">&euro;{option.proposedPrice.toLocaleString()}</p>
              </div>
              <span className="text-[10px] text-taupe">({Math.round((1 - option.proposedPrice / option.price) * 100)}% off)</span>
            </div>
            {option.negotiationNote && (
              <p className="text-xs text-stone italic">&ldquo;{option.negotiationNote}&rdquo;</p>
            )}
            <p className="text-[10px] text-taupe mt-2">Awaiting response from {option.brandName || 'brand partner'}...</p>
          </div>
        </div>
      )}

      {/* ── Counter Offer Received ── */}
      {option.negotiationStatus === 'counter_offered' && option.counterPrice && (
        <div className="px-5 pb-5 border-t border-gold-soft/30 pt-4">
          <div className="bg-gold-soft/5 border border-gold-soft/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={14} className="text-gold-muted" />
              <p className="text-[10px] tracking-[0.2em] uppercase text-gold-muted">Counter Offer Received</p>
            </div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="text-center">
                <p className="text-[9px] tracking-[0.1em] uppercase text-taupe mb-1">Listed</p>
                <p className="font-display text-sm text-stone">&euro;{option.price.toLocaleString()}</p>
              </div>
              <ArrowRight size={14} className="text-taupe" />
              <div className="text-center">
                <p className="text-[9px] tracking-[0.1em] uppercase text-taupe mb-1">Your Offer</p>
                <p className="font-display text-sm text-stone line-through">&euro;{option.proposedPrice?.toLocaleString()}</p>
              </div>
              <ArrowRight size={14} className="text-gold-muted" />
              <div className="text-center">
                <p className="text-[9px] tracking-[0.1em] uppercase text-gold-muted mb-1">Counter</p>
                <p className="font-display text-lg text-gold-muted">&euro;{option.counterPrice.toLocaleString()}</p>
              </div>
              <span className="text-[10px] text-success">({Math.round((1 - option.counterPrice / option.price) * 100)}% off listed)</span>
            </div>
            {option.counterNote && (
              <div className="bg-parchment/50 border-l-2 border-gold-soft/40 px-3 py-2 mb-4">
                <p className="text-xs text-stone italic">&ldquo;{option.counterNote}&rdquo;</p>
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={onAcceptCounter}
                className="px-5 py-2.5 bg-charcoal-deep text-ivory-cream text-[10px] tracking-[0.15em] uppercase hover:bg-noir transition-colors"
              >
                <span className="inline-flex items-center gap-1.5"><CheckCircle size={12} /> Accept &euro;{option.counterPrice.toLocaleString()}</span>
              </button>
              <button
                onClick={onDeclineCounter}
                className="px-5 py-2.5 border border-sand text-stone text-[10px] tracking-[0.15em] uppercase hover:bg-parchment/50 transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Accepted Negotiation Summary ── */}
      {option.negotiationStatus === 'accepted' && option.proposedPrice && (
        <div className="px-5 pb-5 border-t border-success/20 pt-4">
          <div className="bg-success/5 border border-success/20 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-success" />
              <div>
                <p className="text-xs text-charcoal-deep font-medium">
                  Price agreed at &euro;{option.proposedPrice.toLocaleString()}
                  <span className="text-taupe font-normal ml-2">(was &euro;{option.price.toLocaleString()} — {Math.round((1 - option.proposedPrice / option.price) * 100)}% savings)</span>
                </p>
                {option.counterNote && <p className="text-[10px] text-stone italic mt-1">&ldquo;{option.counterNote}&rdquo;</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Declined Negotiation Note ── */}
      {option.negotiationStatus === 'declined' && (
        <div className="px-5 pb-5 border-t border-sand/30 pt-4">
          <div className="bg-parchment/30 p-3 flex items-center gap-2">
            <XCircle size={14} className="text-stone" />
            <p className="text-xs text-stone">Previous negotiation was declined. You may select at listed price or try a new offer.</p>
          </div>
        </div>
      )}

      {/* ── Negotiate Form (inline, expands below) ── */}
      {showForm && (
        <div className="px-5 pb-5 border-t border-gold-soft/30 pt-4">
          <div className="bg-parchment/30 p-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-charcoal-deep mb-4">Propose Your Price</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Your Offer *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone">&euro;</span>
                  <input
                    type="number"
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                    placeholder={`Max ${option.price.toLocaleString()}`}
                    className="w-full pl-8 pr-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors"
                  />
                </div>
                {proposedPrice && Number(proposedPrice) > 0 && Number(proposedPrice) < option.price && (
                  <p className="text-[10px] text-gold-muted mt-1">{discount}% below listed price</p>
                )}
                {proposedPrice && Number(proposedPrice) >= option.price && (
                  <p className="text-[10px] text-error mt-1">Must be below listed price</p>
                )}
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Listed Price</label>
                <p className="py-3 text-charcoal-deep font-display">&euro;{option.price.toLocaleString()}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Message (optional)</label>
              <textarea
                rows={2}
                value={negotiationNote}
                onChange={(e) => setNegotiationNote(e.target.value)}
                placeholder="Explain your offer to the brand partner..."
                className="w-full px-4 py-3 border border-sand text-charcoal-deep placeholder:text-taupe focus:outline-none focus:border-charcoal-deep transition-colors resize-none text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmitNegotiation}
                disabled={!proposedPrice || Number(proposedPrice) <= 0 || Number(proposedPrice) >= option.price}
                className="px-5 py-2.5 bg-charcoal-deep text-ivory-cream text-[10px] tracking-[0.15em] uppercase hover:bg-noir transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit Offer
              </button>
              <button
                onClick={() => { setNegotiatingId(null); setProposedPrice(''); setNegotiationNote(''); }}
                className="px-5 py-2.5 text-stone text-[10px] tracking-[0.15em] uppercase hover:text-charcoal-deep transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Message Thread ────────────────────────────────────────────────────

function MessageThread({ messages, onSend, onRefresh, refreshing }: {
  messages: SourcingChatMessage[];
  onSend: (content: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const [value, setValue] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <div>
      {onRefresh && (
        <div className="flex justify-end mb-2">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-[11px] tracking-[0.08em] uppercase text-taupe hover:text-charcoal-deep transition-colors disabled:opacity-40"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Fetching…' : 'Fetch new messages'}
          </button>
        </div>
      )}
      <div className="max-h-[500px] overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.map((msg) => {
          if (msg.sender === 'system') {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="bg-parchment/60 px-4 py-1.5 text-[10px] tracking-[0.1em] uppercase text-taupe text-center">
                  {msg.content}
                  <span className="ml-2 opacity-70">{formatDate(msg.timestamp)}</span>
                </div>
              </div>
            );
          }
          const isClient = msg.sender === 'client';
          return (
            <div key={msg.id} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[80%]">
                <div className="flex items-center gap-2 mb-1">
                  {!isClient && (
                    <div className="w-5 h-5 rounded-full bg-gold-soft/20 flex items-center justify-center">
                      <User size={10} className="text-gold-muted" />
                    </div>
                  )}
                  <span className={`text-[10px] tracking-[0.1em] uppercase ${isClient ? 'text-charcoal-deep' : 'text-gold-muted'}`}>
                    {msg.senderName}
                  </span>
                  <span className="text-[9px] text-taupe">{formatDate(msg.timestamp)} {formatTime(msg.timestamp)}</span>
                </div>
                <div className={`px-4 py-3 text-sm leading-relaxed ${isClient ? 'bg-charcoal-deep text-ivory-cream' : 'bg-parchment/50 text-charcoal-deep border border-sand/30'}`}>
                  {msg.content.split('\n').map((line, i) => (
                    <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      {/* Input */}
      <div className="flex gap-2 border-t border-sand/50 pt-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Message the sourcing team..."
          className="flex-1 border border-sand px-4 py-2.5 text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!value.trim()}
          className="px-4 py-2.5 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Main Detail Page ──────────────────────────────────────────────────

export default function SourcingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { concierge } = useApp();

  const [isLoaded, setIsLoaded] = useState(false);
  const [request, setRequest] = useState<EnrichedSourcingRequest | null>(null);
  const [activeSection, setActiveSection] = useState<'timeline' | 'options' | 'messages'>('timeline');
  const [negotiatingId, setNegotiatingId] = useState<string | null>(null);
  const [refreshingMessages, setRefreshingMessages] = useState(false);

  useEffect(() => {
    // Try direct API fetch first, fall back to list search (covers mock IDs)
    getSourcingRequestById(id)
      .then((found) => {
        if (found) { setRequest(enrichSourcingRequestWithLocal(found)); return; }
        return getSourcingRequests().then((raw) => {
          const f = raw.find((r) => r.sourcing_id === id);
          if (f) setRequest(enrichSourcingRequestWithLocal(f));
        });
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, [id]);

  // Persist all state changes to localStorage for demo flow
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (request) saveSourcingState(request);
  }, [request]);

  // Listen for brand-side localStorage changes (cross-tab sync)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'moda-sourcing-enrichment' && id) {
        // Re-load from localStorage to pick up brand-side changes (options, negotiations, messages)
        getSourcingRequests().then((raw) => {
          const found = raw.find((r) => r.sourcing_id === id);
          if (found) {
            isFirstRender.current = true; // prevent save loop
            setRequest(enrichSourcingRequestWithLocal(found));
          }
        });
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [id]);

  const handleSendMessage = (content: string) => {
    if (!request) return;
    // Optimistic update
    const newMsg: SourcingChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'client',
      senderName: 'You',
      content,
      timestamp: new Date().toISOString(),
    };
    setRequest({ ...request, messages: [...request.messages, newMsg] });
    // Fire-and-forget API call
    sendConsumerMessage(request.sourcing_id, content).catch(() => {});
  };

  const handleRefreshMessages = () => {
    if (!request || refreshingMessages) return;
    setRefreshingMessages(true);
    getSourcingRequestById(request.sourcing_id)
      .then((fresh) => {
        if (fresh) {
          const enriched = enrichSourcingRequestWithLocal(fresh);
          setRequest((prev) => prev ? { ...prev, messages: enriched.messages } : prev);
        }
      })
      .catch(() => {})
      .finally(() => setRefreshingMessages(false));
  };

  const handleSelectOption = (optionId: string) => {
    if (!request) return;
    // Optimistic update
    setRequest({
      ...request,
      status: 'awaiting_approval',
      options: request.options.map((o) => ({ ...o, selected: o.id === optionId })),
      timeline: request.timeline.map((s) => {
        if (s.status === 'awaiting_approval') return { ...s, active: true, completed: false, date: new Date().toISOString().split('T')[0] };
        if (s.status === 'options_found') return { ...s, completed: true, active: false };
        return s;
      }),
      messages: [
        ...request.messages,
        { id: `msg-${Date.now()}`, sender: 'system' as const, senderName: 'System', content: 'Option selected — awaiting final confirmation from sourcing team.', timestamp: new Date().toISOString() },
      ],
    });
    setActiveSection('messages');
    // API call
    selectSourcingOption(request.sourcing_id, optionId).catch(() => {});
  };

  const handleNegotiate = (optionId: string, proposedPrice: number, note: string) => {
    if (!request) return;
    // Optimistic update
    setRequest({
      ...request,
      options: request.options.map((o) =>
        o.id === optionId
          ? { ...o, negotiationStatus: 'negotiating' as const, proposedPrice, negotiationNote: note }
          : o,
      ),
      messages: [
        ...request.messages,
        {
          id: `msg-${Date.now()}`,
          sender: 'system' as const,
          senderName: 'System',
          content: `Price negotiation submitted for "${request.options.find((o) => o.id === optionId)?.title}" — proposed €${proposedPrice.toLocaleString()}.`,
          timestamp: new Date().toISOString(),
        },
      ],
    });
    // API call
    addConsumerNegotiation(request.sourcing_id, optionId, proposedPrice, note).catch(() => {});
  };

  const handleAcceptCounter = (optionId: string) => {
    if (!request) return;
    const option = request.options.find((o) => o.id === optionId);
    if (!option?.counterPrice) return;
    setRequest({
      ...request,
      status: 'awaiting_approval',
      options: request.options.map((o) =>
        o.id === optionId
          ? { ...o, negotiationStatus: 'accepted' as const, selected: true, proposedPrice: o.counterPrice }
          : { ...o, selected: false },
      ),
      timeline: request.timeline.map((s) => {
        if (s.status === 'awaiting_approval') return { ...s, active: true, completed: false, date: new Date().toISOString().split('T')[0] };
        if (s.status === 'options_found') return { ...s, completed: true, active: false };
        return s;
      }),
      messages: [
        ...request.messages,
        {
          id: `msg-${Date.now()}`,
          sender: 'system' as const,
          senderName: 'System',
          content: `Counter offer of €${option.counterPrice.toLocaleString()} accepted for "${option.title}". Awaiting final confirmation.`,
          timestamp: new Date().toISOString(),
        },
      ],
    });
    setActiveSection('messages');
  };

  const handleDeclineCounter = (optionId: string) => {
    if (!request) return;
    setRequest({
      ...request,
      options: request.options.map((o) =>
        o.id === optionId
          ? { ...o, negotiationStatus: 'declined' as const, proposedPrice: undefined, counterPrice: undefined, negotiationNote: undefined, counterNote: undefined }
          : o,
      ),
      messages: [
        ...request.messages,
        {
          id: `msg-${Date.now()}`,
          sender: 'system' as const,
          senderName: 'System',
          content: `Counter offer declined for "${request.options.find((o) => o.id === optionId)?.title}".`,
          timestamp: new Date().toISOString(),
        },
      ],
    });
  };

  // ── Simulate lifecycle progression (demo only) ──────────────────────
  const simulateNext = () => {
    if (!request) return;
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    if (request.status === 'pending') {
      setRequest({
        ...request,
        status: 'sourcing',
        updated_at: now,
        timeline: request.timeline.map((s) => {
          if (s.status === 'pending') return { ...s, completed: true, active: false, date: s.date || today };
          if (s.status === 'sourcing') return { ...s, active: true, date: today };
          return s;
        }),
        messages: [
          ...request.messages,
          { id: `sim-${Date.now()}`, sender: 'system' as const, senderName: 'System', content: 'Brand partners are now actively sourcing your request.', timestamp: now },
          { id: `sim-${Date.now() + 1}`, sender: 'concierge' as const, senderName: 'Isabella Martinez', content: "I've contacted our brand partners and they've begun searching. I'll keep you updated on their progress.", timestamp: new Date(Date.now() + 2000).toISOString() },
        ],
      });
    } else if (request.status === 'sourcing') {
      const brandNames = request.brand_names || ['Partner'];
      setRequest({
        ...request,
        status: 'options_found',
        updated_at: now,
        timeline: request.timeline.map((s) => {
          if (s.status === 'sourcing') return { ...s, completed: true, active: false, date: s.date || today };
          if (s.status === 'options_found') return { ...s, active: true, date: today };
          return s;
        }),
        options: [
          {
            id: `opt-new-1`,
            title: `${request.looking_for} — Option A`,
            brandName: brandNames[0],
            source: `${brandNames[0]} Boutique`,
            sourceLocation: 'Paris, France',
            condition: 'new' as const,
            price: Math.round(Number(request.budget) * 0.9),
            currency: 'EUR',
            estimatedDelivery: '5-7 business days',
            conciergeNote: 'Excellent condition, direct from boutique. Our top recommendation.',
          },
          {
            id: `opt-new-2`,
            title: `${request.looking_for} — Option B`,
            brandName: brandNames[brandNames.length > 1 ? 1 : 0],
            source: 'Verified Pre-owned',
            sourceLocation: 'London, UK',
            condition: 'like_new' as const,
            price: Math.round(Number(request.budget) * 0.75),
            originalPrice: Math.round(Number(request.budget) * 0.9),
            currency: 'EUR',
            estimatedDelivery: '3-5 business days',
            conciergeNote: 'Pre-owned in excellent condition. Great value option.',
          },
        ],
        messages: [
          ...request.messages,
          { id: `sim-${Date.now()}`, sender: 'concierge' as const, senderName: 'Isabella Martinez', content: `Great news! Our brand partners have found 2 options for "${request.looking_for}". Please review them in the Options tab.`, timestamp: now },
          { id: `sim-${Date.now() + 1}`, sender: 'system' as const, senderName: 'System', content: '2 sourcing options are now available for review.', timestamp: now },
        ],
      });
      setActiveSection('options');
    } else if (request.status === 'awaiting_approval') {
      setRequest({
        ...request,
        status: 'acquired',
        updated_at: now,
        timeline: request.timeline.map((s) => {
          if (s.status === 'awaiting_approval') return { ...s, completed: true, active: false, date: s.date || today };
          if (s.status === 'acquired') return { ...s, active: true, date: today };
          return s;
        }),
        messages: [
          ...request.messages,
          { id: `sim-${Date.now()}`, sender: 'system' as const, senderName: 'System', content: 'Item has been acquired! Preparing for delivery.', timestamp: now },
          { id: `sim-${Date.now() + 1}`, sender: 'concierge' as const, senderName: 'Isabella Martinez', content: "Your item has been secured and is being prepared for white-glove delivery. I'll notify you with tracking details shortly.", timestamp: new Date(Date.now() + 2000).toISOString() },
        ],
      });
      setActiveSection('messages');
    } else if (request.status === 'acquired') {
      setRequest({
        ...request,
        status: 'delivered',
        updated_at: now,
        timeline: request.timeline.map((s) => {
          if (s.status === 'acquired') return { ...s, completed: true, active: false, date: s.date || today };
          if (s.status === 'delivered') return { ...s, active: true, date: today };
          return s;
        }),
        messages: [
          ...request.messages,
          { id: `sim-${Date.now()}`, sender: 'system' as const, senderName: 'System', content: 'Item delivered successfully. Sourcing request completed.', timestamp: now },
          { id: `sim-${Date.now() + 1}`, sender: 'concierge' as const, senderName: 'Isabella Martinez', content: "Your item has been delivered! I hope you're delighted with it. Please don't hesitate to reach out if you need anything else.", timestamp: new Date(Date.now() + 2000).toISOString() },
        ],
      });
      setActiveSection('messages');
    }
  };

  const SIMULATE_LABELS: Record<string, string> = {
    pending: 'Simulate: Brands Start Sourcing',
    sourcing: 'Simulate: Options Found',
    options_found: '',
    awaiting_approval: 'Simulate: Item Acquired',
    acquired: 'Simulate: Item Delivered',
    delivered: '',
    cancelled: '',
  };

  // Loading / Not found
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="animate-pulse text-taupe text-sm tracking-[0.2em] uppercase">Loading...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-ivory-cream">
        <div className="bg-charcoal-deep">
          <div className="max-w-[1000px] mx-auto px-8 md:px-16 lg:px-24 py-12">
            <Link href="/uhni/sourcing" className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors">
              <ArrowLeft size={16} /> Back to Sourcing
            </Link>
          </div>
        </div>
        <div className="max-w-[1000px] mx-auto px-8 md:px-16 lg:px-24 py-20 text-center">
          <Search size={48} className="text-sand mx-auto mb-4" />
          <h2 className="font-display text-2xl text-charcoal-deep mb-2">Request Not Found</h2>
          <p className="text-stone mb-8">The sourcing request you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/uhni/sourcing" className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors text-sm tracking-[0.1em] uppercase">
            <ArrowLeft size={14} /> Back to All Requests
          </Link>
        </div>
      </div>
    );
  }

  const hasOptions = request.options.length > 0;
  const canSelectOption = request.status === 'options_found' && !request.options.some((o) => o.selected);

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1000px] mx-auto px-8 md:px-16 lg:px-24 py-10">
          <Link href="/uhni/sourcing" className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8">
            <ArrowLeft size={16} /> Back to Sourcing
          </Link>

          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] tracking-[0.15em] uppercase ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span>{getStatusLabel(request.status)}</span>
                </span>
                {request.product_category && (
                  <span className="text-[10px] tracking-[0.15em] uppercase text-sand/60">{request.product_category}</span>
                )}
                {request.priority && request.priority !== 'standard' && (
                  <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${
                    request.priority === 'urgent' ? 'bg-error/20 text-red-300' : 'bg-sand/20 text-sand'
                  }`}>
                    {request.priority === 'when_available' ? 'When Available' : request.priority}
                  </span>
                )}
              </div>
              <h1 className="font-display text-[clamp(1.3rem,2.5vw,2rem)] text-ivory-cream leading-tight">
                {request.looking_for}
              </h1>
              <p className="text-sand/80 text-sm mt-2 max-w-2xl">{request.description}</p>
            </div>

            {request.budget && (
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] tracking-[0.15em] uppercase text-sand/60 mb-1">Budget</p>
                <p className="font-display text-2xl text-ivory-cream">&euro;{Number(request.budget).toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-6 mt-6 pt-5 border-t border-ivory-cream/10 text-xs text-sand/60 flex-wrap">
            <span>Created {formatDate(request.created_at)}</span>
            {request.deadline && (
              <span className="flex items-center gap-1"><Clock size={12} /> Deadline: {formatDate(request.deadline)}</span>
            )}
            {request.brand_names && request.brand_names.length > 0 && (
              <span className="flex items-center gap-1.5">
                Sent to: {request.brand_names.map((name) => (
                  <span key={name} className="px-2 py-0.5 bg-ivory-cream/10 text-sand text-[10px] tracking-[0.05em]">{name}</span>
                ))}
              </span>
            )}
            {request.conciergeAssigned && (
              <span className="flex items-center gap-1"><Shield size={12} className="text-gold-soft/60" /> {request.conciergeAssigned}</span>
            )}
            <span className="flex items-center gap-1"><MessageCircle size={12} /> {request.messages.length} messages</span>
            {hasOptions && (
              <span className="flex items-center gap-1"><Package size={12} /> {request.options.length} options</span>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="max-w-[1000px] mx-auto px-8 md:px-16 lg:px-24 py-10">

        {/* Section Nav */}
        <div className="flex gap-1 mb-8 bg-parchment p-1">
          {(
            [
              { key: 'timeline' as const, label: 'Timeline & Details', icon: Clock },
              ...(hasOptions ? [{ key: 'options' as const, label: `Sourcing Options (${request.options.length})`, icon: Package }] : []),
              { key: 'messages' as const, label: `Messages (${request.messages.length})`, icon: MessageCircle },
            ] as { key: 'timeline' | 'options' | 'messages'; label: string; icon: typeof Clock }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs tracking-[0.1em] uppercase transition-colors ${
                activeSection === tab.key ? 'bg-white text-charcoal-deep' : 'text-stone hover:text-charcoal-deep'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Timeline & Details Section ─────────────────────── */}
        {activeSection === 'timeline' && (
          <div className="space-y-8">
            {/* Progress Timeline */}
            <section className="bg-white border border-sand/50 p-6">
              <h2 className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-5">Status Progress</h2>
              <StatusTimeline timeline={request.timeline} />
            </section>

            {/* Specifications */}
            <section className="bg-white border border-sand/50 p-6">
              <h2 className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-5">Request Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {request.product_category && (
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-1">Category</p>
                    <p className="text-sm text-charcoal-deep">{request.product_category}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-1">Priority</p>
                  <p className="text-sm text-charcoal-deep capitalize">{(request.priority || 'standard').replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-1">Last Updated</p>
                  <p className="text-sm text-charcoal-deep">{formatDate(request.updated_at)}</p>
                </div>
                {request.conciergeAssigned && (
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-1">Concierge</p>
                    <p className="text-sm text-charcoal-deep">{request.conciergeAssigned}</p>
                  </div>
                )}
              </div>
              {request.specifications && (
                <div className="mt-6 pt-5 border-t border-sand/30">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-2">Specifications</p>
                  <p className="text-sm text-charcoal-deep leading-relaxed">{request.specifications}</p>
                </div>
              )}
            </section>

            {/* Action Hint — options ready */}
            {canSelectOption && (
              <div className="p-5 bg-gold-soft/10 border border-gold-soft/30 flex items-center gap-4">
                <AlertCircle size={20} className="text-gold-muted flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-charcoal-deep font-medium">Options are ready for your review</p>
                  <p className="text-xs text-stone mt-0.5">
                    Your sourcing team has found {request.options.length} option{request.options.length !== 1 ? 's' : ''}. Review and select your preferred choice.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection('options')}
                  className="px-5 py-2.5 bg-charcoal-deep text-ivory-cream text-[10px] tracking-[0.15em] uppercase hover:bg-noir transition-colors flex-shrink-0"
                >
                  View Options
                </button>
              </div>
            )}

            {/* Concierge card */}
            {concierge && request.conciergeAssigned && (
              <section className="bg-charcoal-deep p-6 flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gold-soft/30">
                  <Image src={concierge.avatar} alt={concierge.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-ivory-cream">
                    Managed by <span className="text-gold-soft">{request.conciergeAssigned}</span>
                  </p>
                  <p className="text-xs text-sand/60 mt-0.5">Senior Fashion Concierge</p>
                </div>
                <button
                  onClick={() => setActiveSection('messages')}
                  className="flex items-center gap-2 text-gold-soft hover:text-gold-soft/80 transition-colors text-sm"
                >
                  <MessageCircle size={16} />
                  <span className="hidden sm:inline">Send Message</span>
                </button>
              </section>
            )}

            {/* Demo: Simulate Lifecycle Progression */}
            {SIMULATE_LABELS[request.status] && (
              <section className="border-2 border-dashed border-gold-soft/30 p-5 bg-gold-soft/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-gold-muted mb-1">Demo Controls</p>
                    <p className="text-xs text-stone">Simulate the next step in the sourcing lifecycle to walk through the full flow.</p>
                  </div>
                  <button
                    onClick={simulateNext}
                    className="px-5 py-2.5 bg-gold-soft/20 border border-gold-soft/40 text-gold-muted text-[10px] tracking-[0.15em] uppercase hover:bg-gold-soft/30 transition-colors flex-shrink-0"
                  >
                    {SIMULATE_LABELS[request.status]}
                  </button>
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── Options Section ───────────────────────────────── */}
        {activeSection === 'options' && hasOptions && (
          <div className="space-y-6">
            <div className="bg-white border border-sand/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Sourced Options</h2>
                  <p className="text-xs text-stone">
                    {request.options.some((o) => o.selected)
                      ? 'You have selected an option. The sourcing team is processing your request.'
                      : 'Review the options below and select the one you prefer.'}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                {request.options.map((option) => (
                  <OptionCard
                    key={option.id}
                    option={option}
                    canSelect={canSelectOption}
                    onSelect={() => handleSelectOption(option.id)}
                    onNegotiate={(price, note) => handleNegotiate(option.id, price, note)}
                    onAcceptCounter={() => handleAcceptCounter(option.id)}
                    onDeclineCounter={() => handleDeclineCounter(option.id)}
                    negotiatingId={negotiatingId}
                    setNegotiatingId={setNegotiatingId}
                  />
                ))}
              </div>
            </div>

            {/* Price comparison summary */}
            {request.options.length > 1 && (
              <div className="bg-white border border-sand/50 p-6">
                <h2 className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-4">Price Comparison</h2>
                <div className="space-y-2">
                  {request.options.map((opt) => {
                    const negBadge = getNegotiationBadge(opt.negotiationStatus);
                    const effectivePrice = opt.negotiationStatus === 'accepted' && opt.proposedPrice ? opt.proposedPrice : opt.price;
                    return (
                      <div key={opt.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {opt.selected && <Star size={12} className="text-gold-muted" />}
                          <span className={opt.selected ? 'text-charcoal-deep font-medium' : 'text-stone'}>
                            {opt.source}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 ${conditionColor(opt.condition)}`}>
                            {conditionLabel(opt.condition)}
                          </span>
                          {negBadge && (
                            <span className={`text-[9px] px-1.5 py-0.5 ${negBadge.className}`}>
                              {negBadge.label}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {opt.negotiationStatus === 'accepted' && opt.proposedPrice && opt.proposedPrice < opt.price && (
                            <span className="text-xs text-taupe line-through">&euro;{opt.price.toLocaleString()}</span>
                          )}
                          <span className="font-display text-charcoal-deep">&euro;{effectivePrice.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Messages Section ──────────────────────────────── */}
        {activeSection === 'messages' && (
          <div className="bg-white border border-sand/50 p-6">
            <h2 className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-5">Conversation</h2>
            {request.messages.length === 0 ? (
              <div className="text-center py-10 mb-4">
                <MessageCircle size={36} className="text-sand mx-auto mb-3" />
                <p className="text-sm text-stone mb-1">No messages yet</p>
                <p className="text-xs text-taupe">Your sourcing team will be in touch soon. You can also send the first message below.</p>
              </div>
            ) : null}
            <MessageThread messages={request.messages} onSend={handleSendMessage} onRefresh={handleRefreshMessages} refreshing={refreshingMessages} />
          </div>
        )}
      </div>
    </div>
  );
}
