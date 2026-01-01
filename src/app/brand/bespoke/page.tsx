'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Gem,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  User
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function BrandBespokePage() {
  const router = useRouter();
  const { isBrand, brandPartner, brandBespokeRequests } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isBrand) {
      router.push('/auth/login/brand');
    }
  }, [isBrand, router]);

  if (!isBrand || !brandPartner || !brandBespokeRequests) {
    return (
      <div className="min-h-screen bg-charcoal-deep flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ivory-cream border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gold-soft/10 text-gold-soft';
      case 'reviewing':
        return 'bg-blue-400/10 text-blue-400';
      case 'accepted':
      case 'in_production':
        return 'bg-green-400/10 text-green-400';
      case 'completed':
        return 'bg-ivory-cream/10 text-ivory-cream';
      case 'declined':
        return 'bg-red-400/10 text-red-400';
      default:
        return 'bg-sand/10 text-sand';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={14} />;
      case 'reviewing':
        return <MessageSquare size={14} />;
      case 'accepted':
      case 'in_production':
      case 'completed':
        return <CheckCircle size={14} />;
      case 'declined':
        return <XCircle size={14} />;
      default:
        return <Gem size={14} />;
    }
  };

  const selectedRequestData = brandBespokeRequests.find(r => r.id === selectedRequest);

  return (
    <div className="min-h-screen bg-charcoal-deep">
      {/* Header */}
      <header className="border-b border-sand/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/brand"
              className="w-10 h-10 bg-noir border border-sand/10 flex items-center justify-center hover:border-sand/30 transition-colors"
            >
              <ArrowLeft size={18} className="text-ivory-cream" />
            </Link>
            <div>
              <h1 className="font-display text-2xl text-ivory-cream">Bespoke Requests</h1>
              <p className="text-sm text-taupe">UHNI client commissions</p>
            </div>
          </div>
        </div>
      </header>

      <main className={`max-w-7xl mx-auto px-6 lg:px-12 py-12 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Request List */}
          <div className="lg:col-span-1">
            <h2 className="text-sm text-taupe mb-4">All Requests ({brandBespokeRequests.length})</h2>
            <div className="space-y-3">
              {brandBespokeRequests.map((request) => (
                <button
                  key={request.id}
                  onClick={() => setSelectedRequest(request.id)}
                  className={`w-full text-left p-4 border transition-all ${
                    selectedRequest === request.id
                      ? 'bg-gold-soft/5 border-gold-soft/30'
                      : 'bg-noir border-sand/10 hover:border-sand/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-ivory-cream font-medium text-sm truncate pr-2">{request.title}</h3>
                    <span className={`px-2 py-0.5 text-[9px] tracking-[0.1em] uppercase flex items-center gap-1 ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-taupe capitalize mb-2">{request.type.replace(/_/g, ' ')}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-sand">€{request.budget.min.toLocaleString()} - €{request.budget.max.toLocaleString()}</span>
                    <span className="text-taupe">{new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Request Detail */}
          <div className="lg:col-span-2">
            {selectedRequestData ? (
              <div className="bg-noir border border-sand/10 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="font-display text-xl text-ivory-cream mb-1">{selectedRequestData.title}</h2>
                    <p className="text-sm text-taupe capitalize">{selectedRequestData.type.replace(/_/g, ' ')}</p>
                  </div>
                  <span className={`px-3 py-1 text-[10px] tracking-[0.1em] uppercase flex items-center gap-1.5 ${getStatusColor(selectedRequestData.status)}`}>
                    {getStatusIcon(selectedRequestData.status)}
                    {selectedRequestData.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="flex items-center gap-3 p-4 bg-charcoal-deep/50 border border-sand/5 mb-6">
                  <div className="w-10 h-10 bg-gold-soft/10 flex items-center justify-center">
                    <User size={18} className="text-gold-soft" />
                  </div>
                  <div>
                    <p className="text-ivory-cream">Customer {selectedRequestData.customerId}</p>
                    <p className="text-xs text-gold-soft uppercase tracking-wider">{selectedRequestData.customerTier} Member</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-sm text-taupe mb-2">Description</h3>
                  <p className="text-ivory-cream text-sm leading-relaxed">{selectedRequestData.description}</p>
                </div>

                {/* Specifications */}
                <div className="mb-6">
                  <h3 className="text-sm text-taupe mb-2">Specifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequestData.specifications.map((spec, i) => (
                      <span key={i} className="px-3 py-1 bg-charcoal-deep text-sm text-sand">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Budget & Timeline */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-charcoal-deep/50 border border-sand/5">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-1">Budget Range</span>
                    <p className="text-ivory-cream font-display text-lg">
                      €{selectedRequestData.budget.min.toLocaleString()} - €{selectedRequestData.budget.max.toLocaleString()}
                    </p>
                    {selectedRequestData.budget.flexible && (
                      <span className="text-xs text-green-400">Flexible</span>
                    )}
                  </div>
                  {selectedRequestData.deadline && (
                    <div className="p-4 bg-charcoal-deep/50 border border-sand/5">
                      <span className="text-[10px] tracking-[0.2em] uppercase text-taupe block mb-1">Deadline</span>
                      <p className="text-ivory-cream font-display text-lg">
                        {new Date(selectedRequestData.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Quote & Completion */}
                {(selectedRequestData.quotedPrice || selectedRequestData.estimatedCompletionDate) && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {selectedRequestData.quotedPrice && (
                      <div className="p-4 bg-gold-soft/5 border border-gold-soft/20">
                        <span className="text-[10px] tracking-[0.2em] uppercase text-gold-soft block mb-1">Quoted Price</span>
                        <p className="text-ivory-cream font-display text-lg">€{selectedRequestData.quotedPrice.toLocaleString()}</p>
                      </div>
                    )}
                    {selectedRequestData.estimatedCompletionDate && (
                      <div className="p-4 bg-gold-soft/5 border border-gold-soft/20">
                        <span className="text-[10px] tracking-[0.2em] uppercase text-gold-soft block mb-1">Est. Completion</span>
                        <p className="text-ivory-cream font-display text-lg">
                          {new Date(selectedRequestData.estimatedCompletionDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {selectedRequestData.notes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm text-taupe mb-3">Notes & Communication</h3>
                    <div className="space-y-3">
                      {selectedRequestData.notes.map((note) => (
                        <div
                          key={note.id}
                          className={`p-4 border ${note.isInternal ? 'bg-charcoal-deep/50 border-sand/5' : 'bg-noir border-sand/10'}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-ivory-cream text-sm">{note.author}</span>
                              <span className="text-[10px] text-taupe capitalize">({note.authorRole})</span>
                              {note.isInternal && (
                                <span className="px-2 py-0.5 bg-sand/10 text-[9px] text-sand uppercase">Internal</span>
                              )}
                            </div>
                            <span className="text-xs text-taupe">
                              {new Date(note.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-sand">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {(selectedRequestData.status === 'pending' || selectedRequestData.status === 'reviewing') && (
                  <div className="flex gap-3 pt-6 border-t border-sand/10">
                    <button className="flex-1 py-3 bg-green-400/10 text-green-400 text-sm tracking-wider uppercase hover:bg-green-400/20 transition-colors">
                      Accept Request
                    </button>
                    <button className="flex-1 py-3 bg-red-400/10 text-red-400 text-sm tracking-wider uppercase hover:bg-red-400/20 transition-colors">
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-noir border border-sand/10 min-h-[400px]">
                <div className="text-center">
                  <Gem size={48} className="text-sand/30 mx-auto mb-4" />
                  <p className="text-taupe">Select a request to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
