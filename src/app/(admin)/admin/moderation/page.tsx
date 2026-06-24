'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Clock,
  Search,
  X,
  FileWarning,
  Trash2,
  Ban,
  XCircle,
  Eye,
  ChevronDown,
  Package,
  Calendar,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';
import { fetchModerationQueue, moderateContent } from '@/services/admin.service';
import type { ModerationItemResponse } from '@/services/admin.service';

// ─── Status tabs ───────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected' | 'flagged';

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'flagged', label: 'Flagged' },
];

function getStatusBadge(status: string): { label: string; classes: string } {
  switch (status) {
    case 'pending':
      return { label: 'Pending', classes: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'approved':
      return { label: 'Approved', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'rejected':
      return { label: 'Rejected', classes: 'bg-red-50 text-red-700 border-red-200' };
    case 'flagged':
      return { label: 'Flagged', classes: 'bg-orange-50 text-orange-700 border-orange-200' };
    default:
      return { label: status, classes: 'bg-stone/10 text-stone/70 border-stone/20' };
  }
}

function getContentTypeBadge(type: string): { label: string; classes: string } {
  switch (type) {
    case 'product':
      return { label: 'Product', classes: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'story':
      return { label: 'Story', classes: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'collection':
      return { label: 'Collection', classes: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
    case 'review':
      return { label: 'Review', classes: 'bg-pink-50 text-pink-700 border-pink-200' };
    case 'heritage':
      return { label: 'Heritage', classes: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'offer':
      return { label: 'Offer', classes: 'bg-green-50 text-green-700 border-green-200' };
    default:
      return { label: type, classes: 'bg-stone/10 text-stone/70 border-stone/20' };
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ModerationPage() {
  const [items, setItems] = useState<ModerationItemResponse[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modal state for reviewer note
  const [modalItemId, setModalItemId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<'approved' | 'rejected' | null>(null);
  const [modalNote, setModalNote] = useState('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(false);
    const data = await fetchModerationQueue({ page_size: 100 });
    if (data) {
      setItems(data.items);
      setPendingCount(data.pending_count);
    } else {
      setError(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // ── Computed ────────────────────────────────────────────────────────────────

  const stats = useMemo(() => ({
    total: items.length,
    pending: items.filter((r) => r.status === 'pending').length,
    approved: items.filter((r) => r.status === 'approved').length,
    rejected: items.filter((r) => r.status === 'rejected').length,
  }), [items]);

  const filteredItems = useMemo(() => {
    let list = items;
    if (activeTab !== 'all') {
      list = list.filter((r) => r.status === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.brandName.toLowerCase().includes(q) ||
          r.contentType.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, activeTab, searchQuery]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleAction = async (id: string, action: 'approved' | 'rejected', note?: string) => {
    setActionLoading(id);
    await moderateContent(id, action, note);
    await loadItems();
    setActionLoading(null);
    setModalItemId(null);
    setModalAction(null);
    setModalNote('');
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-parchment">
      <AdminPageHeader
        title="Content Moderation"
        subtitle="Review and moderate brand content submissions"
        breadcrumbs={[{ label: 'Moderation' }]}
      />

      <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-6">
        {/* ── Stats Row ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-sand/50 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-deep/5 flex items-center justify-center">
                <FileWarning size={20} className="text-charcoal-deep" />
              </div>
              <div>
                <p className="text-xs text-stone/60 uppercase tracking-wider">Total Items</p>
                <p className="text-2xl font-semibold text-charcoal-deep">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-sand/50 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-stone/60 uppercase tracking-wider">Pending Review</p>
                <p className="text-2xl font-semibold text-charcoal-deep">{pendingCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-sand/50 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <ShieldCheck size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-stone/60 uppercase tracking-wider">Approved</p>
                <p className="text-2xl font-semibold text-charcoal-deep">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-sand/50 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <ShieldX size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-xs text-stone/60 uppercase tracking-wider">Rejected</p>
                <p className="text-2xl font-semibold text-charcoal-deep">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Search Bar ─────────────────────────────────────────────────────── */}
        <div className="bg-white border border-sand/50 rounded-lg p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/40" />
            <input
              type="text"
              placeholder="Search by title, brand name, or content type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-sand/50 rounded-lg bg-parchment/50 text-charcoal-deep placeholder:text-stone/40 focus:outline-none focus:ring-1 focus:ring-gold-soft"
            />
          </div>
        </div>

        {/* ── Filter Tabs ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            const count =
              tab.value === 'all'
                ? items.length
                : items.filter((r) => r.status === tab.value).length;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-charcoal-deep text-ivory-cream'
                    : 'bg-white border border-sand/50 text-stone/70 hover:bg-parchment hover:text-charcoal-deep'
                }`}
              >
                {tab.label}
                <span
                  className={`inline-flex items-center justify-center min-w-[20px] h-5 rounded-full text-[10px] font-semibold px-1.5 ${
                    isActive ? 'bg-ivory-cream/20 text-ivory-cream' : 'bg-parchment text-stone/60'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Content ────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="text-center py-16 text-stone/60 text-sm">Loading moderation queue...</div>
        ) : error ? (
          <div className="text-center py-16 text-stone/60 text-sm">Failed to load moderation queue. Please try again.</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <FileWarning size={40} className="mx-auto text-stone/30 mb-3" />
            <p className="text-stone/60 text-sm">
              {activeTab === 'pending' ? 'No items pending review.' : 'No items match your filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const statusBadge = getStatusBadge(item.status);
              const typeBadge = getContentTypeBadge(item.contentType);
              const isExpanded = expandedId === item.id;
              const isPending = item.status === 'pending';

              return (
                <div
                  key={item.id}
                  className={`bg-white border border-sand/50 rounded-lg overflow-hidden transition-all ${
                    isPending ? 'border-l-4 border-l-amber-400' : ''
                  }`}
                >
                  {/* ── Card Header ─────────────────────────────────────────── */}
                  <div className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-parchment border border-sand/30 flex items-center justify-center">
                        <Package size={24} className="text-stone/30" />
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-semibold text-charcoal-deep truncate">
                                {item.title || 'Untitled'}
                              </h3>
                              <span className={`inline-flex items-center text-[10px] font-medium border rounded-full px-2 py-0.5 ${typeBadge.classes}`}>
                                {typeBadge.label}
                              </span>
                              <span className={`inline-flex items-center text-[10px] font-medium border rounded-full px-2 py-0.5 ${statusBadge.classes}`}>
                                {statusBadge.label}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-charcoal-deep mt-1">
                              {item.brandName || 'N/A'}
                            </p>
                          </div>

                          {/* Expand/Collapse toggle */}
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-parchment transition-colors text-stone/50 hover:text-charcoal-deep"
                          >
                            <ChevronDown
                              size={16}
                              className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>
                        </div>

                        {/* Submitted date */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-stone/60 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Submitted {formatDate(item.submittedAt)}
                          </span>
                          {item.flagReason && (
                            <span className="text-orange-600">Flag: {item.flagReason}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ── Action Buttons ─────────────────────────────────────── */}
                    {isPending && (
                      <div className="mt-4 flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleAction(item.id, 'approved')}
                          disabled={actionLoading === item.id}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                        >
                          <ShieldCheck size={14} />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            setModalItemId(item.id);
                            setModalAction('rejected');
                            setModalNote('');
                          }}
                          disabled={actionLoading === item.id}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          Reject
                        </button>
                      </div>
                    )}

                    {item.status === 'approved' && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600">
                        <CheckCircle size={12} />
                        Approved {item.reviewedAt ? formatDate(item.reviewedAt) : ''}
                      </div>
                    )}
                    {item.status === 'rejected' && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-red-600">
                        <XCircle size={12} />
                        Rejected {item.reviewedAt ? formatDate(item.reviewedAt) : ''}
                      </div>
                    )}
                  </div>

                  {/* ── Expanded Details ─────────────────────────────────────── */}
                  {isExpanded && (
                    <div className="border-t border-sand/50 bg-parchment/30 p-5 space-y-4">
                      {/* Preview */}
                      {item.preview && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-stone/50 mb-1">Preview</p>
                          <p className="text-sm text-charcoal-deep leading-relaxed">{item.preview}</p>
                        </div>
                      )}

                      {/* Metadata grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-stone/50 mb-1">Item ID</p>
                          <p className="text-xs font-mono text-charcoal-deep">{item.id}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-stone/50 mb-1">Brand ID</p>
                          <p className="text-xs font-mono text-charcoal-deep">{item.brandId || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-stone/50 mb-1">Content Type</p>
                          <p className="text-xs text-charcoal-deep capitalize">{item.contentType}</p>
                        </div>
                      </div>

                      {/* Reviewer note */}
                      {item.reviewerNote && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare size={14} className="text-blue-600" />
                            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                              Reviewer Note
                            </p>
                          </div>
                          <p className="text-sm text-blue-800">{item.reviewerNote}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Reject Modal ──────────────────────────────────────────────────────── */}
      {modalItemId && modalAction === 'rejected' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-sand/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                  <ShieldX size={20} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-charcoal-deep">Reject Content</h2>
                  <p className="text-xs text-stone/60">Add an optional note explaining the rejection</p>
                </div>
              </div>
              <button
                onClick={() => { setModalItemId(null); setModalAction(null); setModalNote(''); }}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-parchment transition-colors text-stone/60 hover:text-charcoal-deep"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-stone/60 mb-1.5">Rejection Note (optional)</label>
                <textarea
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  placeholder="Reason for rejecting this content..."
                  rows={4}
                  className="w-full border border-sand/50 rounded-lg px-3 py-2 text-sm bg-parchment/30 text-charcoal-deep placeholder:text-stone/40 focus:outline-none focus:ring-1 focus:ring-gold-soft resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-sand/50">
              <button
                onClick={() => { setModalItemId(null); setModalAction(null); setModalNote(''); }}
                className="text-xs font-medium text-stone/60 hover:text-charcoal-deep px-4 py-2 rounded-lg border border-sand/50 hover:bg-parchment transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(modalItemId, 'rejected', modalNote || undefined)}
                disabled={actionLoading === modalItemId}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 border border-red-600 rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
              >
                <Ban size={14} />
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
