'use client';

import { useState, useEffect, useMemo } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  Package,
  BookOpen,
  FolderOpen,
  MessageSquare,
  Star,
  Gift,
} from 'lucide-react';
import { fetchModerationQueue, moderateContent } from '@/services/admin.service';
import type { ModerationItem, ContentType, ModerationStatus } from '@/types/admin';

const contentTypeOptions: { value: ContentType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'product', label: 'Product' },
  { value: 'story', label: 'Story' },
  { value: 'collection', label: 'Collection' },
  { value: 'review', label: 'Review' },
  { value: 'heritage', label: 'Heritage' },
  { value: 'offer', label: 'Offer' },
];

const statusOptions: { value: ModerationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'flagged', label: 'Flagged' },
];

function getContentIcon(type: ContentType) {
  switch (type) {
    case 'product':
      return Package;
    case 'story':
      return BookOpen;
    case 'collection':
      return FolderOpen;
    case 'review':
      return MessageSquare;
    case 'heritage':
      return Star;
    case 'offer':
      return Gift;
    default:
      return Package;
  }
}

function getStatusBadge(status: ModerationStatus) {
  switch (status) {
    case 'pending':
      return { label: 'Pending', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock };
    case 'approved':
      return { label: 'Approved', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle };
    case 'rejected':
      return { label: 'Rejected', bg: 'bg-red-50 text-red-700 border-red-200', icon: XCircle };
    case 'flagged':
      return { label: 'Flagged', bg: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertTriangle };
    default:
      return { label: status, bg: 'bg-stone/10 text-stone', icon: Clock };
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ContentModerationPage() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ModerationStatus | 'all'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      const filters: { contentType?: ContentType; status?: ModerationStatus } = {};
      if (contentTypeFilter !== 'all') filters.contentType = contentTypeFilter;
      if (statusFilter !== 'all') filters.status = statusFilter;
      const res = await fetchModerationQueue(filters);
      if (res.data) setItems(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentTypeFilter, statusFilter]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.brandName.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      pending: items.filter((i) => i.status === 'pending').length,
      approvedToday: items.filter(
        (i) => i.status === 'approved' && i.reviewedAt && new Date(i.reviewedAt).toDateString() === today
      ).length,
      rejectedToday: items.filter(
        (i) => i.status === 'rejected' && i.reviewedAt && new Date(i.reviewedAt).toDateString() === today
      ).length,
      flagged: items.filter((i) => i.status === 'flagged').length,
    };
  }, [items]);

  const handleModerate = async (id: string, action: 'approved' | 'rejected') => {
    setActionLoading(id);
    try {
      await moderateContent(id, action);
      await loadItems();
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-parchment">
      <AdminPageHeader
        title="Content Moderation"
        subtitle="Review and approve brand submissions"
        breadcrumbs={[{ label: 'Moderation' }]}
      />

      <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-sand/50 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-stone/60 uppercase tracking-wider">Pending Review</p>
                <p className="text-2xl font-semibold text-charcoal-deep">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-sand/50 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-stone/60 uppercase tracking-wider">Approved Today</p>
                <p className="text-2xl font-semibold text-charcoal-deep">{stats.approvedToday}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-sand/50 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <XCircle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-xs text-stone/60 uppercase tracking-wider">Rejected Today</p>
                <p className="text-2xl font-semibold text-charcoal-deep">{stats.rejectedToday}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-sand/50 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <AlertTriangle size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-stone/60 uppercase tracking-wider">Flagged Items</p>
                <p className="text-2xl font-semibold text-charcoal-deep">{stats.flagged}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-sand/50 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/40" />
            <input
              type="text"
              placeholder="Search by title or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-sand/50 rounded-lg bg-parchment/50 text-charcoal-deep placeholder:text-stone/40 focus:outline-none focus:ring-1 focus:ring-gold-soft"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-stone/40" />
            <select
              value={contentTypeFilter}
              onChange={(e) => setContentTypeFilter(e.target.value as ContentType | 'all')}
              className="text-sm border border-sand/50 rounded-lg px-3 py-2 bg-parchment/50 text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-gold-soft"
            >
              {contentTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ModerationStatus | 'all')}
              className="text-sm border border-sand/50 rounded-lg px-3 py-2 bg-parchment/50 text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-gold-soft"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Moderation List */}
        {loading ? (
          <div className="text-center py-16 text-stone/60 text-sm">Loading moderation queue...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 text-stone/60 text-sm">No items match your filters.</div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const Icon = getContentIcon(item.contentType);
              const badge = getStatusBadge(item.status);
              const StatusIcon = badge.icon;
              const isPending = item.status === 'pending';
              const isFlagged = item.status === 'flagged';

              return (
                <div
                  key={item.id}
                  className={`bg-white border border-sand/50 rounded-lg p-5 flex flex-col md:flex-row md:items-start gap-4 ${
                    isPending ? 'border-l-4 border-l-gold-soft' : ''
                  } ${isFlagged ? 'border-l-4 border-l-error' : ''}`}
                >
                  {/* Left: Content Type Icon */}
                  <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-parchment flex items-center justify-center">
                    <Icon size={20} className="text-charcoal-deep/70" />
                  </div>

                  {/* Center: Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-charcoal-deep truncate">
                        {item.title}
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider text-stone/50 bg-parchment px-2 py-0.5 rounded">
                        {item.contentType}
                      </span>
                    </div>
                    <p className="text-xs text-stone/60 mt-1">
                      <span className="font-medium text-charcoal-deep/80">{item.brandName}</span>
                      {' \u00B7 '}
                      Submitted {formatDate(item.submittedAt)}
                    </p>
                    {item.preview && (
                      <p className="text-xs text-stone/50 mt-2 line-clamp-2">{item.preview}</p>
                    )}
                    {isFlagged && item.flagReason && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-orange-600 bg-orange-50 rounded px-2 py-1 w-fit">
                        <AlertTriangle size={12} />
                        <span>{item.flagReason}</span>
                      </div>
                    )}
                    {item.reviewedAt && item.reviewerNote && (
                      <div className="mt-2 text-xs text-stone/50 border-t border-sand/30 pt-2">
                        <span className="font-medium text-stone/70">Reviewer note:</span>{' '}
                        {item.reviewerNote}
                        <span className="ml-2 text-stone/40">
                          {'\u00B7'} {formatDate(item.reviewedAt)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Status Badge + Actions */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium border rounded-full px-3 py-1 ${badge.bg}`}
                    >
                      <StatusIcon size={12} />
                      {badge.label}
                    </span>

                    <div className="flex items-center gap-2">
                      {(isPending || isFlagged) && (
                        <>
                          <button
                            onClick={() => handleModerate(item.id, 'approved')}
                            disabled={actionLoading === item.id}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={14} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleModerate(item.id, 'rejected')}
                            disabled={actionLoading === item.id}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        </>
                      )}
                      <button className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-deep/70 bg-parchment hover:bg-sand/30 border border-sand/50 rounded-lg px-3 py-1.5 transition-colors">
                        <Eye size={14} />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
