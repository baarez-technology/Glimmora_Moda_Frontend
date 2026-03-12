'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Lock, Sparkles, Users, Calendar, Package, Edit,
  Send, Check, Crown, Clock, CheckCircle, XCircle, Trash2,
  Loader2, Mail, UserCheck, UserX, MessageSquare,
} from 'lucide-react';
import { BrandPageHeader, SecondaryButton, PrimaryButton } from '@/components/brand/BrandPageHeader';
import type { PrivateCollectionAccess, RequestedCustomer, UhniCustomer } from '@/types/uhni';
import {
  fetchPrivateCollection,
  deletePrivateCollection,
  fetchBrandProducts,
  fetchUhniCustomers,
  appendCustomerIds,
  updateRequestedCustomerStatus,
  type mapApiProduct,
} from '@/services/private-collection.service';
import type { PrivateCollection } from '@/types/uhni';

type ApiProductItem = ReturnType<typeof mapApiProduct>;

// ─── Sub-components ───────────────────────────────────────────────────────────

function RequestRow({
  rc,
  collectionId,
  onUpdated,
}: {
  rc: RequestedCustomer;
  collectionId: string;
  onUpdated: () => void;
}) {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fullName = [rc.first_name, rc.last_name].filter(Boolean).join(' ') || rc.customer_id;

  const act = async (status: 'accepted' | 'rejected') => {
    setSaving(true);
    try {
      await updateRequestedCustomerStatus(collectionId, {
        customer_id: rc.customer_id,
        status,
        notes: note || undefined,
      });
      onUpdated();
    } finally {
      setSaving(false);
    }
  };

  if (rc.status !== 'pending') {
    return (
      <div className="flex items-center gap-4 p-4 border border-sand/30 bg-parchment/30">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-charcoal-deep">{fullName}</p>
          {rc.notes && <p className="text-xs text-taupe mt-0.5 italic">"{rc.notes}"</p>}
        </div>
        <span className={`text-xs px-2 py-0.5 tracking-[0.1em] uppercase ${
          rc.status === 'accepted' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
        }`}>
          {rc.status === 'accepted' ? 'Approved' : 'Rejected'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 p-4 border border-warning/20 bg-warning/5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Crown size={13} className="text-gold-soft" />
          <span className="text-sm font-medium text-charcoal-deep">{fullName}</span>
        </div>
        <p className="text-xs text-taupe font-mono">{rc.customer_id}</p>
      </div>
      <div className="flex flex-col gap-2 w-52">
        <div className="flex items-center gap-1.5">
          <MessageSquare size={12} className="text-taupe shrink-0" />
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Optional message..."
            className="flex-1 text-xs border border-sand/50 px-2 py-1 focus:outline-none focus:border-charcoal-deep/30"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => act('accepted')}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-success/10 text-success text-xs tracking-[0.1em] uppercase hover:bg-success/20 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
            Approve
          </button>
          <button
            onClick={() => act('rejected')}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-error/10 text-error text-xs tracking-[0.1em] uppercase hover:bg-error/20 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PrivateCollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<PrivateCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [resolvedProducts, setResolvedProducts] = useState<Map<string, ApiProductItem>>(new Map());
  const [uhniCustomers, setUhniCustomers] = useState<UhniCustomer[]>([]);

  // Invite panel state (invitation access level)
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [selectedToInvite, setSelectedToInvite] = useState<string[]>([]);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviting, setInviting] = useState(false);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [col, productsRes, uhniRes] = await Promise.all([
        fetchPrivateCollection(collectionId),
        fetchBrandProducts({ page_size: 100 }),
        fetchUhniCustomers(),
      ]);
      setCollection(col);
      const map = new Map<string, ApiProductItem>();
      productsRes.items.forEach(p => map.set(p.id, p));
      setResolvedProducts(map);
      setUhniCustomers(uhniRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collection');
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!collection) return;
    setIsDeleting(true);
    try {
      await deletePrivateCollection(collection.id);
    } catch {
      // proceed anyway
    } finally {
      router.push('/brand/private-collections');
    }
  };

  const handleSendInvitations = async () => {
    if (!collection || selectedToInvite.length === 0) return;
    setInviting(true);
    try {
      await appendCustomerIds(collection.id, {
        customer_ids: selectedToInvite,
        notes: inviteMessage || undefined,
      });
      setSelectedToInvite([]);
      setInviteMessage('');
      setShowInvitePanel(false);
      await load();
    } finally {
      setInviting(false);
    }
  };

  // ─── Loading / Error states ───────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <BrandPageHeader title="Private Collection" subtitle="Loading..." />
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin text-taupe" />
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="p-8 text-center">
        <p className="text-error mb-4">{error || 'Collection not found'}</p>
        <Link href="/brand/private-collections" className="inline-flex items-center gap-2 text-sm text-charcoal-deep hover:text-gold-muted">
          <ArrowLeft size={16} /> Back to Private Collections
        </Link>
      </div>
    );
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
      case 'uhni_only': return { label: 'UHNI Only', class: 'bg-gold-soft/20 text-gold-deep', icon: Sparkles };
      case 'invitation': return { label: 'Invitation Only', class: 'bg-champagne/30 text-gold-muted', icon: Lock };
      case 'request': return { label: 'Request Access', class: 'bg-info/10 text-info', icon: Users };
      default: return { label: access, class: 'bg-taupe/20 text-stone', icon: Lock };
    }
  };

  const collectionStatus = getStatus();
  const accessBadge = getAccessBadge(collection.accessLevel);
  const AccessIcon = accessBadge.icon;

  const pendingRequests = collection.requested_customers.filter(r => r.status === 'pending');
  const resolvedRequests = collection.requested_customers.filter(r => r.status !== 'pending');

  // UHNI customers not yet in the invited list
  const uninvitedUhni = uhniCustomers.filter(c => !collection.customer_ids.includes(c.customer_id));
  const invitedUhni = uhniCustomers.filter(c => collection.customer_ids.includes(c.customer_id));

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
            <SecondaryButton href="/brand/private-collections" icon={ArrowLeft}>Back</SecondaryButton>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 border border-red-200 text-red-600 text-sm tracking-wide hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} /> Delete
            </button>
            <PrimaryButton href={`/brand/private-collections/${collection.id}/edit`} icon={Edit}>
              Edit Collection
            </PrimaryButton>
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {/* Hero */}
        <div className="relative aspect-[21/9] bg-parchment overflow-hidden">
          {collection.heroImage ? (
            <img src={collection.heroImage} alt={collection.name} className="w-full h-full object-cover"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-noir/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl text-ivory-cream">{collection.name}</h2>
              <p className="text-ivory-cream/80 mt-2 max-w-2xl">{collection.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 text-xs tracking-[0.1em] uppercase ${collectionStatus.class}`}>
                {collectionStatus.label}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs tracking-[0.1em] uppercase ${accessBadge.class}`}>
                <AccessIcon size={12} /> {accessBadge.label}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
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
                  {collection.products.map(product => {
                    const resolved = resolvedProducts.get(product.id);
                    const name = resolved?.name || product.id;
                    const imageUrl = resolved?.imageUrl || '';
                    const category = resolved?.category || '';
                    return (
                      <div key={product.id} className="flex items-center gap-4 p-4 border border-sand/50">
                        <div className="w-16 h-16 bg-parchment flex-shrink-0">
                          {imageUrl ? (
                            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={20} className="text-taupe/40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-charcoal-deep truncate">{name}</p>
                          {category && <p className="text-xs text-taupe">{category}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── UHNI ONLY: read-only customer list ── */}
            {collection.accessLevel === 'uhni_only' && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50 flex items-center gap-3">
                  <Sparkles size={18} className="text-gold-muted" />
                  <div>
                    <h2 className="font-medium text-charcoal-deep">UHNI Members</h2>
                    <p className="text-xs text-taupe">All UHNI members automatically have access to this collection</p>
                  </div>
                </div>
                {uhniCustomers.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users size={32} className="mx-auto text-taupe/40 mb-3" />
                    <p className="text-sm text-stone">No UHNI customers found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-sand/30">
                    {uhniCustomers.map(c => (
                      <div key={c.customer_id} className="flex items-center gap-4 px-6 py-3">
                        {c.profile_picture ? (
                          <img src={c.profile_picture} alt={c.first_name} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gold-soft/20 flex items-center justify-center">
                            <Crown size={15} className="text-gold-muted" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-charcoal-deep">
                            {[c.first_name, c.last_name].filter(Boolean).join(' ') || c.customer_id}
                          </p>
                          <p className="text-xs text-taupe">{c.email}</p>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] tracking-[0.1em] uppercase text-success">
                          <Check size={10} /> Access
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── INVITATION: invited list + invite more panel ── */}
            {collection.accessLevel === 'invitation' && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-stone" />
                    <div>
                      <h2 className="font-medium text-charcoal-deep">Invited Clients</h2>
                      <p className="text-xs text-taupe">{collection.customer_ids.length} customer{collection.customer_ids.length !== 1 ? 's' : ''} invited</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInvitePanel(v => !v)}
                    className="flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-charcoal-deep hover:text-gold-muted transition-colors"
                  >
                    <Send size={13} />
                    {showInvitePanel ? 'Cancel' : 'Invite More'}
                  </button>
                </div>

                {/* Currently invited */}
                {invitedUhni.length > 0 && !showInvitePanel && (
                  <div className="divide-y divide-sand/30">
                    {invitedUhni.map(c => (
                      <div key={c.customer_id} className="flex items-center gap-4 px-6 py-3">
                        {c.profile_picture ? (
                          <img src={c.profile_picture} alt={c.first_name} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-parchment flex items-center justify-center">
                            <Crown size={15} className="text-taupe" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-charcoal-deep">
                            {[c.first_name, c.last_name].filter(Boolean).join(' ') || c.customer_id}
                          </p>
                          <p className="text-xs text-taupe">{c.email}</p>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] tracking-[0.1em] uppercase text-success">
                          <UserCheck size={12} /> Invited
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Show non-UHNI invited IDs */}
                {collection.customer_ids.filter(id => !uhniCustomers.find(c => c.customer_id === id)).length > 0 && !showInvitePanel && (
                  <div className="px-6 py-3 border-t border-sand/30">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">Other invited IDs</p>
                    <div className="flex flex-wrap gap-2">
                      {collection.customer_ids
                        .filter(id => !uhniCustomers.find(c => c.customer_id === id))
                        .map(id => (
                          <span key={id} className="px-2 py-1 bg-parchment text-xs text-stone font-mono">{id}</span>
                        ))}
                    </div>
                  </div>
                )}

                {collection.customer_ids.length === 0 && !showInvitePanel && (
                  <div className="p-8 text-center">
                    <Mail size={32} className="mx-auto text-taupe/40 mb-3" />
                    <p className="text-sm text-stone">No clients invited yet</p>
                  </div>
                )}

                {/* Invite panel */}
                {showInvitePanel && (
                  <div className="p-6 space-y-5">
                    {uninvitedUhni.length === 0 ? (
                      <p className="text-sm text-stone text-center py-4">All UHNI customers have already been invited.</p>
                    ) : (
                      <>
                        <div>
                          <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">
                            Select Clients to Invite
                          </p>
                          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {uninvitedUhni.map(c => {
                              const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || c.customer_id;
                              const checked = selectedToInvite.includes(c.customer_id);
                              return (
                                <label
                                  key={c.customer_id}
                                  className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                                    checked ? 'border-charcoal-deep bg-parchment' : 'border-sand/50 hover:border-charcoal-deep/30'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => setSelectedToInvite(prev =>
                                      prev.includes(c.customer_id)
                                        ? prev.filter(id => id !== c.customer_id)
                                        : [...prev, c.customer_id]
                                    )}
                                    className="accent-charcoal-deep"
                                  />
                                  {c.profile_picture ? (
                                    <img src={c.profile_picture} alt={name} className="w-8 h-8 rounded-full object-cover" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-parchment flex items-center justify-center">
                                      <Crown size={13} className="text-taupe" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-charcoal-deep">{name}</p>
                                    <p className="text-xs text-taupe">{c.email}</p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-2">
                            Invitation Message (Optional)
                          </p>
                          <textarea
                            value={inviteMessage}
                            onChange={e => setInviteMessage(e.target.value)}
                            rows={3}
                            placeholder="Add a personal invitation message for your records..."
                            className="w-full border border-sand/50 px-3 py-2 text-sm focus:outline-none focus:border-charcoal-deep/30 resize-none"
                          />
                        </div>

                        <button
                          onClick={handleSendInvitations}
                          disabled={selectedToInvite.length === 0 || inviting}
                          className="flex items-center gap-2 px-5 py-2.5 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.15em] uppercase hover:bg-noir transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {inviting
                            ? <><Loader2 size={13} className="animate-spin" /> Inviting…</>
                            : <><Send size={13} /> Invite {selectedToInvite.length > 0 ? `${selectedToInvite.length} Client${selectedToInvite.length > 1 ? 's' : ''}` : 'Clients'}</>
                          }
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── REQUEST ACCESS: approve / reject ── */}
            {collection.accessLevel === 'request' && (
              <div className="bg-white border border-sand/50">
                <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users size={18} className="text-stone" />
                    <div>
                      <h2 className="font-medium text-charcoal-deep">Access Requests</h2>
                      <p className="text-xs text-taupe">
                        {collection.requested_customers.length} total · {pendingRequests.length} pending
                      </p>
                    </div>
                  </div>
                  {pendingRequests.length > 0 && (
                    <span className="px-2.5 py-1 bg-warning/10 text-warning text-xs tracking-[0.1em] uppercase">
                      {pendingRequests.length} Pending
                    </span>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  {pendingRequests.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-taupe">Pending</p>
                      {pendingRequests.map(rc => (
                        <RequestRow key={rc.customer_id} rc={rc} collectionId={collection.id} onUpdated={load} />
                      ))}
                    </div>
                  )}

                  {resolvedRequests.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mt-4">Resolved</p>
                      {resolvedRequests.map(rc => (
                        <RequestRow key={rc.customer_id} rc={rc} collectionId={collection.id} onUpdated={load} />
                      ))}
                    </div>
                  )}

                  {collection.requested_customers.length === 0 && (
                    <div className="py-8 text-center">
                      <Users size={32} className="mx-auto text-taupe/40 mb-3" />
                      <p className="text-sm text-stone">No access requests yet</p>
                      <p className="text-xs text-taupe mt-1">Customers can request access to this collection</p>
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
                    {now >= previewDate ? 'Started' : `In ${Math.ceil((previewDate.getTime() - now.getTime()) / 86400000)} days`}
                  </p>
                </div>
                <div className="pt-4 border-t border-sand/30">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-taupe">Release Date</p>
                  <p className="text-sm text-charcoal-deep mt-1">{formatDate(collection.releaseDate)}</p>
                  <p className="text-xs text-taupe mt-0.5">
                    {now >= releaseDate ? 'Released' : `In ${Math.ceil((releaseDate.getTime() - now.getTime()) / 86400000)} days`}
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
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Access Level</span>
                  <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${accessBadge.class}`}>
                    {accessBadge.label}
                  </span>
                </div>
                {collection.accessLevel === 'uhni_only' && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-taupe uppercase tracking-wider">UHNI Members</span>
                    <span className="text-sm text-charcoal-deep">{uhniCustomers.length}</span>
                  </div>
                )}
                {collection.accessLevel === 'invitation' && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-taupe uppercase tracking-wider">Invited</span>
                    <span className="text-sm text-charcoal-deep">{collection.customer_ids.length}</span>
                  </div>
                )}
                {collection.accessLevel === 'request' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-taupe uppercase tracking-wider">Total Requests</span>
                      <span className="text-sm text-charcoal-deep">{collection.requested_customers.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-taupe uppercase tracking-wider">Approved</span>
                      <span className="text-sm text-success">{collection.requested_customers.filter(r => r.status === 'accepted').length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-taupe uppercase tracking-wider">Pending</span>
                      <span className="text-sm text-warning">{pendingRequests.length}</span>
                    </div>
                  </>
                )}
                {collection.notes && (
                  <div className="pt-2 border-t border-sand/30">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-1">Notes</p>
                    <p className="text-xs text-stone leading-relaxed">{collection.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Collection Info */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Collection Info</h2>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-taupe uppercase tracking-wider shrink-0">ID</span>
                  <span className="text-xs text-charcoal-deep font-mono break-all text-right">{collection.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Products</span>
                  <span className="text-sm text-charcoal-deep">{collection.products.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-taupe uppercase tracking-wider">Status</span>
                  <span className={`px-2 py-0.5 text-[10px] tracking-[0.1em] uppercase ${collectionStatus.class}`}>
                    {collectionStatus.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white border border-sand p-8 max-w-md w-full mx-4">
            <h3 className="font-display text-xl text-charcoal-deep mb-3">Delete Collection</h3>
            <p className="text-stone text-sm leading-relaxed mb-2">
              Are you sure you want to delete <span className="font-medium text-charcoal-deep">{collection.name}</span>?
            </p>
            <p className="text-taupe text-xs mb-6">This collection will be permanently deleted.</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-5 py-2.5 text-sm text-stone hover:text-charcoal-deep transition-colors"
              >Cancel</button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 text-sm bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Collection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
