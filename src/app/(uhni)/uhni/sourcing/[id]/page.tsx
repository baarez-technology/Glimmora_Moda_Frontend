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
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  getSourcingRequests,
  enrichSourcingRequest,
  type EnrichedSourcingRequest,
  type SourcingChatMessage,
  type SourcingOptionItem,
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

function OptionCard({ option, onSelect, canSelect }: { option: SourcingOptionItem; onSelect?: () => void; canSelect: boolean }) {
  return (
    <div className={`border p-5 transition-all ${option.selected ? 'border-gold-soft bg-gold-soft/5' : 'border-sand/50 bg-white hover:border-sand'}`}>
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
          {canSelect && !option.selected && (
            <button onClick={onSelect} className="mt-3 px-4 py-2 bg-charcoal-deep text-ivory-cream text-[10px] tracking-[0.15em] uppercase hover:bg-noir transition-colors">
              Select Option
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Message Thread ────────────────────────────────────────────────────

function MessageThread({ messages, onSend }: { messages: SourcingChatMessage[]; onSend: (content: string) => void }) {
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

  useEffect(() => {
    getSourcingRequests()
      .then((raw) => {
        const found = raw.find((r) => r.sourcing_id === id);
        if (found) setRequest(enrichSourcingRequest(found));
      })
      .catch(() => {})
      .finally(() => setIsLoaded(true));
  }, [id]);

  const handleSendMessage = (content: string) => {
    if (!request) return;
    const newMsg: SourcingChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'client',
      senderName: 'You',
      content,
      timestamp: new Date().toISOString(),
    };
    setRequest({ ...request, messages: [...request.messages, newMsg] });
  };

  const handleSelectOption = (optionId: string) => {
    if (!request) return;
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
                  />
                ))}
              </div>
            </div>

            {/* Price comparison summary */}
            {request.options.length > 1 && (
              <div className="bg-white border border-sand/50 p-6">
                <h2 className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-4">Price Comparison</h2>
                <div className="space-y-2">
                  {request.options.map((opt) => (
                    <div key={opt.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {opt.selected && <Star size={12} className="text-gold-muted" />}
                        <span className={opt.selected ? 'text-charcoal-deep font-medium' : 'text-stone'}>
                          {opt.source}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 ${conditionColor(opt.condition)}`}>
                          {conditionLabel(opt.condition)}
                        </span>
                      </div>
                      <span className="font-display text-charcoal-deep">&euro;{opt.price.toLocaleString()}</span>
                    </div>
                  ))}
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
            <MessageThread messages={request.messages} onSend={handleSendMessage} />
          </div>
        )}
      </div>
    </div>
  );
}
