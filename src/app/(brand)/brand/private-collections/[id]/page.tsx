'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Sparkles, Users, Calendar, Package, Edit, Send, Check, Crown, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useBrand } from '@/context/BrandContext';
import { BrandPageHeader, SecondaryButton, PrimaryButton } from '@/components/brand/BrandPageHeader';
import type { PrivateCollectionAccess, CollectionAccessRequest } from '@/types/uhni';

const mockUHNIClients = [
  { id: 'uhni-001', name: 'Arabella Montclair', tier: 'uhni', email: 'arabella@example.com' },
  { id: 'uhni-002', name: 'Viktor Harrington', tier: 'uhni', email: 'viktor@example.com' },
  { id: 'uhni-003', name: 'Celestine DuPont', tier: 'uhni', email: 'celestine@example.com' },
  { id: 'uhni-004', name: 'Magnus Beaumont', tier: 'uhni', email: 'magnus@example.com' },
  { id: 'uhni-005', name: 'Isadora Chen-Whitfield', tier: 'preferred', email: 'isadora@example.com' },
];

function AccessRequestActions({ request, onApprove, onDeny }: {
  request: CollectionAccessRequest;
  onApprove: (requestId: string, note?: string) => void;
  onDeny: (requestId: string, note?: string) => void;
}) {
  const [note, setNote] = useState('');

  if (request.status !== 'pending') {
    return (
      <span className={`text-xs px-2 py-0.5 tracking-[0.1em] uppercase ${
        request.status === 'approved' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
      }`}>
        {request.status === 'approved' ? 'Approved' : 'Denied'}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note..."
        className="w-full text-xs border border-sand/50 px-2 py-1.5 focus:outline-none focus:border-charcoal-deep/30"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onApprove(request.id, note || undefined)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-success/10 text-success text-xs tracking-[0.1em] uppercase hover:bg-success/20 transition-colors"
        >
          <CheckCircle size={12} />
          Approve
        </button>
        <button
          onClick={() => onDeny(request.id, note || undefined)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-error/10 text-error text-xs tracking-[0.1em] uppercase hover:bg-error/20 transition-colors"
        >
          <XCircle size={12} />
          Deny
        </button>
      </div>
    </div>
  );
}

export default function PrivateCollectionDetailPage() {
  const params = useParams();
  const {
    getPrivateCollectionById,
    products,
    sendCollectionInvitation,
    approveAccessRequest,
    denyAccessRequest
  } = useBrand();

  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  const collectionId = params.id as string;
  const collection = getPrivateCollectionById(collectionId);

  if (!collection) {
    return (
      <div className="p-8 text-center">
        <p className="text-stone">Collection not found</p>
        <Link
          href="/brand/private-collections"
          className="mt-4 inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted"
        >
          <ArrowLeft size={16} /> Back to Private Collections
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const now = new Date();
  const previewDate = new Date(collection.previewDate);
  const releaseDate = new Date(collection.releaseDate);

  const getStatus = () => {
    if (now >= releaseDate) return { label: 'Active', class: 'bg-success/10 text-success' };
    if (now >= previewDate) return { label: 'Preview', class: 'bg-warning/10 text-warning' };
    return { label: 'Upcoming', class: 'bg-info/10 text-info' };
  };

  const getAccessBadge = (access: PrivateCollectionAccess) => {
    switch (access) {
      case 'uhni_only':
        return { label: 'UHNI Only', class: 'bg-gold-soft/20 text-gold-deep', icon: Sparkles };
      case 'invitation':
        return { label: 'Invitation Only', class: 'bg-champagne/30 text-gold-muted', icon: Lock };
      case 'request':
        return { label: 'Request Access', class: 'bg-info/10 text-info', icon: Users };
      default:
        return { label: access, class: 'bg-taupe/20 text-stone', icon: Lock };
    }
  };

  const status = getStatus();
  const accessBadge = getAccessBadge(collection.accessLevel);
  const AccessIcon = accessBadge.icon;

  const pendingRequests = (collection.accessRequests || []).filter(r => r.status === 'pending');
  const resolvedRequests = (collection.accessRequests || []).filter(r => r.status !== 'pending');

  const handleToggleClient = (clientId: string) => {
    setSelectedClients(prev =>
      prev.includes(clientId) ? prev.filter(id => id !== clientId) : [...prev, clientId]
    );
  };

  const handleSendInvitations = () => {
    if (selectedClients.length === 0) return;
    sendCollectionInvitation(collection.id, selectedClients, inviteMessage || undefined);
    setSelectedClients([]);
    setInviteMessage('');
    setShowInvitePanel(false);
  };

  const handleApproveRequest = (requestId: string, note?: string) => {
    approveAccessRequest(collection.id, requestId, note);
  };

  const handleDenyRequest = (requestId: string, note?: string) => {
    denyAccessRequest(collection.id, requestId, note);
  };

  return (
    <div>
      <BrandPageHeader
        title={collection.name}
        breadcrumbs={[
          { label: 'Private Collections', href: '/brand/private-collections' },
          { label: collection.name }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <SecondaryButton href="/brand/private-collections" icon={ArrowLeft}>
              Back
            </SecondaryButton>
            <PrimaryButton href={`/brand/private-collections/${collection.id}/edit`} icon={Edit}>
              Edit Collection
            </PrimaryButton>
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {/* Hero Section */}
        <div className="relative aspect-[21/9] bg-parchment overflow-hidden">
          <img
            src={collection.heroImage}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-noir/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl text-ivory-cream">{collection.name}</h2>
              <p className="text-ivory-cream/80 mt-2 max-w-2xl">{collection.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 text-xs tracking-[0.1em] uppercase ${status.class}`}>
                {status.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-[0.1em] uppercase ${accessBadge.class}`}>
                <AccessIcon size={12} />
                {accessBadge.label}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
                <h2 className="font-medium text-charcoal-deep">Collection Products</h2>
                <span className="text-sm text-taupe">{collection.products.length} products</span>
              </div>
              {collection.products.length === 0 ? (
                <div className="p-12 text-center">
                  <Package size={48} className="mx-auto text-taupe/40 mb-4" />
                  <p className="text-stone">No products in this collection yet</p>
                  <p className="text-xs text-taupe mt-1">Edit the collection to add products</p>
                </div>
              ) : (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {collection.products.map(product => (
                    <div key={product.id} className="flex items-center gap-4 p-4 border border-sand/50">
                      <div className="w-16 h-16 bg-parchment flex-shrink-0">
                        {product.images[0] && (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal-deep truncate">{product.name}</p>
                        <p className="text-xs text-taupe">{product.category}</p>
                        <p className="text-sm text-charcoal-deep mt-1">€{product.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section A: Send Invitations */}
            {(collection.accessLevel === 'invitation' || collection.accessLevel === 'uhni_only') && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Send size={18} className="text-stone" />
                    <h2 className="font-medium text-charcoal-deep">Send Invitations</h2>
                  </div>
                  <button
                    onClick={() => setShowInvitePanel(!showInvitePanel)}
                    className="text-xs tracking-[0.1em] uppercase text-charcoal-deep hover:text-gold-muted transition-colors"
                  >
                    {showInvitePanel ? 'Cancel' : 'Invite Clients'}
                  </button>
                </div>

                {showInvitePanel && (
                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">Select Clients</p>
                      <div className="space-y-2">
                        {mockUHNIClients.map(client => {
                          const alreadyInvited = (collection.invitedClients || []).includes(client.id);
                          return (
                            <label
                              key={client.id}
                              className={`flex items-center gap-3 p-3 border transition-colors cursor-pointer ${
                                alreadyInvited
                                  ? 'border-sand/30 bg-parchment/50 opacity-60 cursor-not-allowed'
                                  : selectedClients.includes(client.id)
                                    ? 'border-charcoal-deep bg-parchment'
                                    : 'border-sand/50 hover:border-charcoal-deep/30'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedClients.includes(client.id)}
                                onChange={() => !alreadyInvited && handleToggleClient(client.id)}
                                disabled={alreadyInvited}
                                className="accent-charcoal-deep"
                              />
                              <div className="flex items-center gap-2 flex-1">
                                <Crown size={14} className={client.tier === 'uhni' ? 'text-gold-soft' : 'text-taupe'} />
                                <span className="text-sm text-charcoal-deep">{client.name}</span>
                                <span className="text-[10px] tracking-[0.1em] uppercase text-taupe ml-auto">
                                  {alreadyInvited ? 'Already Invited' : client.tier}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Message (Optional)</p>
                      <textarea
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        rows={3}
                        placeholder="Add a personal invitation message..."
                        className="w-full border border-sand/50 px-3 py-2 text-sm focus:outline-none focus:border-charcoal-deep/30 resize-none"
                      />
                    </div>

                    <button
                      onClick={handleSendInvitations}
                      disabled={selectedClients.length === 0}
                      className="flex items-center gap-2 px-5 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.15em] uppercase hover:bg-noir transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Send size={14} />
                      Send {selectedClients.length > 0 ? `${selectedClients.length} Invitation${selectedClients.length > 1 ? 's' : ''}` : 'Invitations'}
                    </button>
                  </div>
                )}

                {/* Invited Clients Summary (when panel closed) */}
                {!showInvitePanel && (collection.invitedClients || []).length > 0 && (
                  <div className="p-6">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">
                      Invited Clients ({(collection.invitedClients || []).length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(collection.invitedClients || []).map(clientId => {
                        const client = mockUHNIClients.find(c => c.id === clientId);
                        return (
                          <span key={clientId} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-parchment text-xs text-charcoal-deep">
                            <Check size={12} className="text-success" />
                            {client?.name || clientId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section B: Access Requests */}
            {(collection.accessLevel === 'request' || (collection.accessRequests || []).length > 0) && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users size={18} className="text-stone" />
                    <h2 className="font-medium text-charcoal-deep">Access Requests</h2>
                  </div>
                  {pendingRequests.length > 0 && (
                    <span className="px-2.5 py-1 bg-warning/10 text-warning text-xs tracking-[0.1em] uppercase">
                      {pendingRequests.length} Pending
                    </span>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  {/* Pending Requests */}
                  {pendingRequests.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-taupe">Pending Requests</p>
                      {pendingRequests.map(request => (
                        <div key={request.id} className="flex items-start gap-4 p-4 border border-warning/20 bg-warning/5">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Crown size={14} className={request.clientTier === 'uhni' ? 'text-gold-soft' : 'text-taupe'} />
                              <span className="text-sm font-medium text-charcoal-deep">{request.clientName}</span>
                              <span className="text-[10px] tracking-[0.1em] uppercase text-taupe">{request.clientTier}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Clock size={12} className="text-taupe" />
                              <span className="text-xs text-taupe">
                                Requested {formatDate(request.requestedAt)}
                              </span>
                            </div>
                          </div>
                          <div className="w-48">
                            <AccessRequestActions
                              request={request}
                              onApprove={handleApproveRequest}
                              onDeny={handleDenyRequest}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Resolved Requests */}
                  {resolvedRequests.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mt-4">Resolved</p>
                      {resolvedRequests.map(request => (
                        <div key={request.id} className="flex items-center gap-4 p-4 border border-sand/30 bg-parchment/30">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-charcoal-deep">{request.clientName}</span>
                              <span className="text-[10px] tracking-[0.1em] uppercase text-taupe">{request.clientTier}</span>
                            </div>
                            {request.reviewNote && (
                              <p className="text-xs text-taupe mt-1 italic">"{request.reviewNote}"</p>
                            )}
                          </div>
                          <AccessRequestActions
                            request={request}
                            onApprove={handleApproveRequest}
                            onDeny={handleDenyRequest}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {(collection.accessRequests || []).length === 0 && (
                    <div className="py-8 text-center">
                      <Users size={32} className="mx-auto text-taupe/40 mb-3" />
                      <p className="text-sm text-stone">No access requests yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Schedule */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
                <Calendar size={18} className="text-stone" />
                <h2 className="font-medium text-charcoal-deep">Schedule</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe">Preview Date</p>
                  <p className="text-sm text-charcoal-deep mt-1">{formatDate(collection.previewDate)}</p>
                  <p className="text-xs text-taupe mt-0.5">
                    {now >= previewDate ? 'Started' : `In ${Math.ceil((previewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days`}
                  </p>
                </div>
                <div className="pt-4 border-t border-sand/30">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe">Release Date</p>
                  <p className="text-sm text-charcoal-deep mt-1">{formatDate(collection.releaseDate)}</p>
                  <p className="text-xs text-taupe mt-0.5">
                    {now >= releaseDate ? 'Released' : `In ${Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} days`}
                  </p>
                </div>
              </div>
            </div>

            {/* Access Details */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
                <AccessIcon size={18} className="text-stone" />
                <h2 className="font-medium text-charcoal-deep">Access Settings</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Access Level</span>
                  <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${accessBadge.class}`}>
                    {accessBadge.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Invitation Required</span>
                  <span className="text-sm text-charcoal-deep">
                    {collection.invitationRequired ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Invited</span>
                  <span className="text-sm text-charcoal-deep">{(collection.invitedClients || []).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Access Requests</span>
                  <span className="text-sm text-charcoal-deep">{(collection.accessRequests || []).length}</span>
                </div>
              </div>
            </div>

            {/* Collection Info */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Collection Info</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">ID</span>
                  <span className="text-sm text-charcoal-deep font-mono">{collection.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Brand</span>
                  <span className="text-sm text-charcoal-deep">{collection.brandName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Products</span>
                  <span className="text-sm text-charcoal-deep">{collection.products.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
