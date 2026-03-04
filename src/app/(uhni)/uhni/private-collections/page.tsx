'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Lock, Sparkles, Calendar, Eye, Crown, MessageCircle, Check, XCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getPrivateCollections, requestCollectionAccess } from '@/services/uhni.service';
import type { PrivateCollection } from '@/types';

type FilterType = 'all' | 'available' | 'upcoming' | 'invitation';

export default function PrivateCollectionsPage() {
  const {
    concierge,
    showToast,
    collectionInvitations,
    respondToInvitation,
    submitAccessRequest
  } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [collections, setCollections] = useState<PrivateCollection[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsDataLoading(true);
      try {
        const res = await getPrivateCollections();
        setCollections(res.data);
      } catch {
        showToast('Failed to load collections', 'error');
      } finally {
        setIsDataLoading(false);
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading collections...</p>
        </div>
      </div>
    );
  }

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All Collections' },
    { value: 'available', label: 'Available Now' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'invitation', label: 'Invitation Required' },
  ];

  const pendingInvitations = collectionInvitations.filter(inv => inv.status === 'pending');
  const acceptedInvitations = collectionInvitations.filter(inv => inv.status === 'accepted');

  const filteredCollections = collections.filter(collection => {
    if (filter === 'all') return true;
    if (filter === 'available') return collection.hasAccess && new Date(collection.previewDate) <= new Date();
    if (filter === 'upcoming') return new Date(collection.previewDate) > new Date();
    if (filter === 'invitation') return collection.invitationRequired;
    return true;
  });

  const getAccessBadge = (collection: PrivateCollection) => {
    if (collection.hasAccess && new Date(collection.previewDate) <= new Date()) {
      return { text: 'Access Granted', className: 'bg-success/10 text-success' };
    }
    if (collection.invitationRequired && !collection.hasAccess) {
      return { text: 'Invitation Required', className: 'bg-gold-soft/10 text-gold-soft' };
    }
    if (!collection.hasAccess) {
      return { text: 'Request Access', className: 'bg-parchment text-stone' };
    }
    return { text: 'Preview Available', className: 'bg-gold-muted/10 text-gold-muted' };
  };

  const handleRequestAccess = (collection: PrivateCollection) => {
    submitAccessRequest(collection.id, collection.name, collection.brandId);
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
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gold-soft/20 flex items-center justify-center">
                <Sparkles size={28} className="text-gold-soft" />
              </div>
              <div>
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                  UHNI Exclusive
                </span>
                <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
                  Private Collections
                </h1>
              </div>
            </div>
            <p className="text-sand mt-4 max-w-xl">
              Exclusive access to pre-release collections, limited editions, and invitation-only offerings from the world's most prestigious maisons.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-gold-soft font-medium">
              Pending Invitations ({pendingInvitations.length})
            </h2>
            {pendingInvitations.map(invitation => (
              <div key={invitation.id} className="bg-gold-soft/10 border border-gold-soft/20 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-gold-soft" />
                      <span className="text-sm font-medium text-charcoal-deep">{invitation.collectionName}</span>
                    </div>
                    <p className="text-xs text-stone mt-1">
                      From {invitation.brandName}
                    </p>
                    {invitation.message && (
                      <p className="text-xs text-taupe mt-2 italic">"{invitation.message}"</p>
                    )}
                    <p className="text-[10px] text-taupe mt-2">
                      Expires {new Date(invitation.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => respondToInvitation(invitation.id, 'accept')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.1em] uppercase hover:bg-noir transition-colors"
                    >
                      <Check size={12} />
                      Accept
                    </button>
                    <button
                      onClick={() => respondToInvitation(invitation.id, 'decline')}
                      className="flex items-center gap-1.5 px-4 py-2 border border-stone/30 text-stone text-xs tracking-[0.1em] uppercase hover:border-charcoal-deep hover:text-charcoal-deep transition-colors"
                    >
                      <XCircle size={12} />
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Accepted Invitations */}
        {acceptedInvitations.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-success font-medium">
              Accepted Invitations
            </h2>
            {acceptedInvitations.map(invitation => (
              <div key={invitation.id} className="bg-success/5 border border-success/20 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check size={16} className="text-success" />
                  <div>
                    <span className="text-sm text-charcoal-deep">{invitation.collectionName}</span>
                    <span className="text-xs text-taupe ml-2">by {invitation.brandName}</span>
                  </div>
                </div>
                <span className="text-[10px] tracking-[0.1em] uppercase text-success">Access Granted</span>
              </div>
            ))}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-parchment p-1 mb-8 overflow-x-auto">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 text-xs tracking-[0.1em] uppercase whitespace-nowrap transition-colors ${
                filter === f.value
                  ? 'bg-white text-charcoal-deep'
                  : 'text-stone hover:text-charcoal-deep'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Collection Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {filteredCollections.map((collection) => {
            const badge = getAccessBadge(collection);
            const isAvailable = collection.hasAccess && new Date(collection.previewDate) <= new Date();

            return (
              <div key={collection.id} className="bg-white overflow-hidden group">
                {/* Hero Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={collection.heroImage}
                    alt={collection.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir/60 via-transparent to-transparent" />

                  {/* Access Badge */}
                  <div className={`absolute top-4 left-4 px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase ${badge.className}`}>
                    {badge.text}
                  </div>

                  {/* Brand Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 text-[10px] tracking-[0.15em] uppercase text-charcoal-deep">
                    {collection.brandName}
                  </div>

                  {/* Collection Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-display text-xl text-ivory-cream mb-2">
                      {collection.name}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-ivory-cream/70">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>Preview: {new Date(collection.previewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Eye size={12} />
                        <span>{collection.products.length} pieces</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <p className="text-sm text-stone leading-relaxed mb-6">
                    {collection.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-taupe">
                      <span className="block">Release Date</span>
                      <span className="text-charcoal-deep font-medium">
                        {new Date(collection.releaseDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {isAvailable ? (
                      <Link
                        href={`/discover?collection=${collection.id}`}
                        className="px-5 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.15em] uppercase hover:bg-noir transition-colors"
                      >
                        Preview Collection
                      </Link>
                    ) : collection.hasAccess ? (
                      <button
                        disabled
                        className="px-5 py-2.5 bg-parchment text-stone text-xs tracking-[0.15em] uppercase cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRequestAccess(collection)}
                        className="px-5 py-2.5 border border-charcoal-deep text-charcoal-deep text-xs tracking-[0.15em] uppercase hover:bg-charcoal-deep hover:text-ivory-cream transition-colors"
                      >
                        {collection.invitationRequired ? 'Request Invitation' : 'Request Access'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCollections.length === 0 && (
          <div className="text-center py-16 bg-parchment">
            <Lock size={32} className="text-taupe mx-auto mb-4" />
            <p className="text-stone">No collections match your filter criteria.</p>
          </div>
        )}

        {/* Concierge CTA */}
        {concierge && (
          <div className="mt-12 bg-charcoal-deep p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-gold-soft/20 flex items-center justify-center flex-shrink-0">
                <Crown size={24} className="text-gold-soft" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl text-ivory-cream mb-2">
                  Seeking Something Specific?
                </h3>
                <p className="text-sand text-sm mb-6">
                  Your concierge {concierge.name} can arrange private viewings, secure early access, and connect you with brand representatives for exclusive offerings.
                </p>
                <Link
                  href="/uhni/concierge"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-soft/10 text-gold-soft text-xs tracking-[0.15em] uppercase hover:bg-gold-soft/20 transition-colors"
                >
                  <MessageCircle size={14} />
                  Contact Concierge
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
