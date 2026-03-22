'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  AlertTriangle,
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
  User,
  Mail,
  Hash,
  Calendar,
  MessageSquare,
  CheckCircle,
} from 'lucide-react';
import {
  getAllReports,
  updateReportStatus,
  getBrandWarningLevel,
  REPORT_REASONS,
} from '@/services/reports.service';
import type {
  ProductReport,
  ReportStatus,
  ReportReason,
} from '@/services/reports.service';

// ─── Seed Demo Data ────────────────────────────────────────────────────────────

const SEED_KEY = 'moda-product-reports';
const SEED_FLAG = 'moda-reports-seeded-v2';

function seedDemoReports(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(SEED_FLAG)) return;

  const existing = localStorage.getItem(SEED_KEY);
  if (existing && JSON.parse(existing).length > 0) {
    localStorage.setItem(SEED_FLAG, '1');
    return;
  }

  const demo: ProductReport[] = [
    {
      id: 'rpt-demo-001',
      product_id: 'prod-001',
      product_name: 'Heritage Silk Saree — Midnight Gold',
      product_image: '/images/products/saree-1.jpg',
      product_price: 45000,
      brand_id: 'brand-taneira',
      brand_name: 'Taneira',
      customer_id: 'cust-001',
      customer_name: 'Priya Sharma',
      customer_email: 'priya.sharma@email.com',
      order_id: 'ORD-20260315-001',
      reason: 'not_as_described',
      description:
        'The colour of the saree is completely different from what was shown in the listing. The gold border is more bronze/copper and the base is lighter than midnight blue.',
      status: 'pending',
      reported_at: '2026-03-20T10:30:00Z',
    },
    {
      id: 'rpt-demo-002',
      product_id: 'prod-002',
      product_name: 'Artisan Pashmina Shawl',
      product_image: '/images/products/shawl-1.jpg',
      product_price: 32000,
      brand_id: 'brand-kashmir-loom',
      brand_name: 'Kashmir Loom',
      customer_id: 'cust-002',
      customer_name: 'Ananya Gupta',
      customer_email: 'ananya.g@email.com',
      order_id: 'ORD-20260312-045',
      reason: 'counterfeit',
      description:
        'This does not seem like a genuine Pashmina. The weave is machine-made and the GI tag looks printed, not woven. I have purchased Pashminas before and this quality is nowhere close.',
      status: 'investigating',
      admin_notes: 'Escalated to authenticity team for verification.',
      reported_at: '2026-03-18T14:15:00Z',
    },
    {
      id: 'rpt-demo-003',
      product_id: 'prod-003',
      product_name: 'Banarasi Brocade Lehenga Set',
      product_image: '/images/products/lehenga-1.jpg',
      product_price: 78000,
      brand_id: 'brand-taneira',
      brand_name: 'Taneira',
      customer_id: 'cust-003',
      customer_name: 'Ritu Malhotra',
      customer_email: 'ritu.m@email.com',
      reason: 'poor_quality',
      description:
        'Thread pulling observed on the dupatta after first wear. The zari work is already tarnishing despite being labelled as real gold zari.',
      status: 'warning_sent',
      admin_notes: 'Warning issued regarding quality control processes.',
      action_taken: 'Formal warning sent to Taneira regarding zari quality claims.',
      reported_at: '2026-03-10T09:00:00Z',
      resolved_at: '2026-03-12T16:30:00Z',
    },
    {
      id: 'rpt-demo-004',
      product_id: 'prod-004',
      product_name: 'Chanderi Cotton Kurta',
      product_image: '/images/products/kurta-1.jpg',
      product_price: 8500,
      brand_id: 'brand-fabindia',
      brand_name: 'FabIndia',
      customer_id: 'cust-004',
      customer_name: 'Meera Joshi',
      customer_email: 'meera.j@email.com',
      order_id: 'ORD-20260308-112',
      reason: 'damaged',
      description:
        'Package arrived torn and the kurta had a visible stain near the neckline. Seems like it was already used or a return item.',
      status: 'product_removed',
      admin_notes: 'Product removed from listing pending quality review.',
      action_taken: 'Product listing suspended. Brand required to re-submit with QC certificate.',
      reported_at: '2026-03-05T11:45:00Z',
      resolved_at: '2026-03-07T14:00:00Z',
    },
    {
      id: 'rpt-demo-005',
      product_id: 'prod-005',
      product_name: 'Tussar Silk Dupatta',
      product_image: '/images/products/dupatta-1.jpg',
      product_price: 5200,
      brand_id: 'brand-kashmir-loom',
      brand_name: 'Kashmir Loom',
      customer_id: 'cust-005',
      customer_name: 'Deepa Nair',
      customer_email: 'deepa.n@email.com',
      reason: 'misleading_price',
      description:
        'Listed at 5200 during checkout, but the MRP tag on the product says 3800. Feels like price gouging.',
      status: 'dismissed',
      admin_notes: 'Price difference due to exclusive packaging and shipping. Within platform policy.',
      action_taken: 'No action required. Price explained by platform premium.',
      reported_at: '2026-03-01T08:20:00Z',
      resolved_at: '2026-03-02T10:00:00Z',
    },
    {
      id: 'rpt-demo-006',
      product_id: 'prod-006',
      product_name: 'Kanjeevaram Silk Saree — Temple Border',
      product_image: '/images/products/saree-2.jpg',
      product_price: 125000,
      brand_id: 'brand-nalli',
      brand_name: 'Nalli Silks',
      customer_id: 'cust-006',
      customer_name: 'Kavitha Raman',
      customer_email: 'kavitha.r@email.com',
      order_id: 'ORD-20260319-078',
      reason: 'not_as_described',
      description:
        'The saree pallu design is different from what was shown. Listing showed a full temple border pallu but received has a simpler motif.',
      status: 'pending',
      reported_at: '2026-03-21T16:45:00Z',
    },
    {
      id: 'rpt-demo-007',
      product_id: 'prod-007',
      product_name: 'Handwoven Ikat Stole',
      product_image: '/images/products/stole-1.jpg',
      product_price: 3800,
      brand_id: 'brand-taneira',
      brand_name: 'Taneira',
      customer_id: 'cust-007',
      customer_name: 'Sanya Kapoor',
      customer_email: 'sanya.k@email.com',
      reason: 'poor_quality',
      description:
        'The stole started fraying from the edges within a week. Very poor finishing for the price paid.',
      status: 'pending',
      reported_at: '2026-03-22T08:00:00Z',
    },
  ];

  localStorage.setItem(SEED_KEY, JSON.stringify(demo));
  localStorage.setItem(SEED_FLAG, '1');
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

type FilterTab = 'all' | ReportStatus;

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'warning_sent', label: 'Warning Sent' },
  { value: 'product_removed', label: 'Product Removed' },
  { value: 'dismissed', label: 'Dismissed' },
];

function getStatusBadge(status: ReportStatus): { label: string; classes: string } {
  switch (status) {
    case 'pending':
      return { label: 'Pending', classes: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'investigating':
      return { label: 'Investigating', classes: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'warning_sent':
      return { label: 'Warning Sent', classes: 'bg-orange-50 text-orange-700 border-orange-200' };
    case 'product_removed':
      return { label: 'Product Removed', classes: 'bg-red-50 text-red-700 border-red-200' };
    case 'brand_suspended':
      return { label: 'Brand Suspended', classes: 'bg-rose-50 text-rose-800 border-rose-200' };
    case 'dismissed':
      return { label: 'Dismissed', classes: 'bg-stone/10 text-stone/70 border-stone/20' };
    default:
      return { label: status, classes: 'bg-stone/10 text-stone/70 border-stone/20' };
  }
}

function getReasonBadge(reason: ReportReason): { label: string; classes: string } {
  const found = REPORT_REASONS.find((r) => r.value === reason);
  const label = found?.label || reason;

  switch (reason) {
    case 'counterfeit':
      return { label, classes: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'poor_quality':
      return { label, classes: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'not_as_described':
      return { label, classes: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'damaged':
      return { label, classes: 'bg-orange-50 text-orange-700 border-orange-200' };
    case 'misleading_price':
      return { label, classes: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
    case 'inappropriate':
      return { label, classes: 'bg-red-50 text-red-700 border-red-200' };
    default:
      return { label, classes: 'bg-stone/10 text-stone/70 border-stone/20' };
  }
}

function getWarningLevelBadge(level: 'none' | 'low' | 'medium' | 'high'): { label: string; classes: string } {
  switch (level) {
    case 'low':
      return { label: 'Low', classes: 'bg-yellow-50 text-yellow-700 border-yellow-300' };
    case 'medium':
      return { label: 'Medium', classes: 'bg-orange-50 text-orange-700 border-orange-300' };
    case 'high':
      return { label: 'High', classes: 'bg-red-50 text-red-700 border-red-300' };
    default:
      return { label: 'None', classes: 'bg-stone/5 text-stone/50 border-stone/20' };
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Modal Types ───────────────────────────────────────────────────────────────

type ModalType = 'warning' | 'remove' | 'suspend' | null;

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ProductReportsPage() {
  const [reports, setReports] = useState<ProductReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal state
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalReport, setModalReport] = useState<ProductReport | null>(null);
  const [modalMessage, setModalMessage] = useState('');

  // Detail expand
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadReports = useCallback(() => {
    setLoading(true);
    seedDemoReports();
    const data = getAllReports();
    setReports(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // ── Computed ────────────────────────────────────────────────────────────────

  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter((r) => r.status === 'pending').length,
    warning_sent: reports.filter((r) => r.status === 'warning_sent').length,
    product_removed: reports.filter((r) => r.status === 'product_removed').length,
  }), [reports]);

  const filteredReports = useMemo(() => {
    let list = reports;
    if (activeTab !== 'all') {
      list = list.filter((r) => r.status === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.product_name.toLowerCase().includes(q) ||
          r.brand_name.toLowerCase().includes(q) ||
          r.customer_name.toLowerCase().includes(q) ||
          r.customer_email.toLowerCase().includes(q) ||
          (r.order_id && r.order_id.toLowerCase().includes(q))
      );
    }
    return list;
  }, [reports, activeTab, searchQuery]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleQuickAction = (reportId: string, newStatus: ReportStatus) => {
    setActionLoading(reportId);
    updateReportStatus(reportId, newStatus);
    loadReports();
    setActionLoading(null);
  };

  const openActionModal = (report: ProductReport, type: ModalType) => {
    setModalReport(report);
    setModalType(type);
    setModalMessage('');
  };

  const handleModalConfirm = () => {
    if (!modalReport || !modalType) return;
    setActionLoading(modalReport.id);

    let status: ReportStatus;
    let actionTaken: string;

    switch (modalType) {
      case 'warning':
        status = 'warning_sent';
        actionTaken = `Warning sent to brand: ${modalMessage}`;
        break;
      case 'remove':
        status = 'product_removed';
        actionTaken = `Product removed: ${modalMessage}`;
        break;
      case 'suspend':
        status = 'brand_suspended';
        actionTaken = `Brand suspended: ${modalMessage || 'Multiple violations'}`;
        break;
      default:
        return;
    }

    updateReportStatus(modalReport.id, status, modalMessage, actionTaken);
    loadReports();
    setModalType(null);
    setModalReport(null);
    setModalMessage('');
    setActionLoading(null);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-parchment">
      <AdminPageHeader
        title="Product Reports & Complaints"
        subtitle="Review consumer complaints, take action on reported products"
        breadcrumbs={[{ label: 'Reports & Complaints' }]}
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
                <p className="text-xs text-stone/60 uppercase tracking-wider">Total Reports</p>
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
                <p className="text-2xl font-semibold text-charcoal-deep">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-sand/50 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <ShieldAlert size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-stone/60 uppercase tracking-wider">Warnings Sent</p>
                <p className="text-2xl font-semibold text-charcoal-deep">{stats.warning_sent}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-sand/50 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-xs text-stone/60 uppercase tracking-wider">Products Removed</p>
                <p className="text-2xl font-semibold text-charcoal-deep">{stats.product_removed}</p>
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
              placeholder="Search by product, brand, customer, email or order ID..."
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
                ? reports.length
                : reports.filter((r) => r.status === tab.value).length;
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

        {/* ── Report Cards ───────────────────────────────────────────────────── */}
        {loading ? (
          <div className="text-center py-16 text-stone/60 text-sm">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-16">
            <FileWarning size={40} className="mx-auto text-stone/30 mb-3" />
            <p className="text-stone/60 text-sm">No reports match your filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report) => {
              const statusBadge = getStatusBadge(report.status);
              const reasonBadge = getReasonBadge(report.reason);
              const isExpanded = expandedId === report.id;
              const brandWarning = getBrandWarningLevel(report.brand_id);
              const warningBadge = getWarningLevelBadge(brandWarning.level);
              const isPending = report.status === 'pending';
              const isInvestigating = report.status === 'investigating';
              const isResolved = !isPending && !isInvestigating;

              return (
                <div
                  key={report.id}
                  className={`bg-white border border-sand/50 rounded-lg overflow-hidden transition-all ${
                    isPending ? 'border-l-4 border-l-amber-400' : ''
                  } ${isInvestigating ? 'border-l-4 border-l-blue-400' : ''}`}
                >
                  {/* ── Card Header ─────────────────────────────────────────── */}
                  <div className="p-5">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-parchment border border-sand/30 flex items-center justify-center overflow-hidden">
                        {report.product_image ? (
                          <img
                            src={report.product_image}
                            alt={report.product_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.innerHTML =
                                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-stone/30"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>';
                            }}
                          />
                        ) : (
                          <Package size={24} className="text-stone/30" />
                        )}
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-semibold text-charcoal-deep truncate">
                                {report.product_name}
                              </h3>
                              <span
                                className={`inline-flex items-center text-[10px] font-medium border rounded-full px-2 py-0.5 ${reasonBadge.classes}`}
                              >
                                {reasonBadge.label}
                              </span>
                              <span
                                className={`inline-flex items-center text-[10px] font-medium border rounded-full px-2 py-0.5 ${statusBadge.classes}`}
                              >
                                {statusBadge.label}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-charcoal-deep mt-1">
                              {report.brand_name}
                              {brandWarning.level !== 'none' && (
                                <span
                                  className={`ml-2 inline-flex items-center gap-1 text-[10px] font-medium border rounded-full px-2 py-0.5 ${warningBadge.classes}`}
                                >
                                  <AlertTriangle size={10} />
                                  {brandWarning.total} reports &middot; {warningBadge.label} risk
                                </span>
                              )}
                            </p>
                          </div>

                          {/* Expand/Collapse toggle */}
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : report.id)}
                            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-parchment transition-colors text-stone/50 hover:text-charcoal-deep"
                          >
                            <ChevronDown
                              size={16}
                              className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>
                        </div>

                        {/* Reporter + Date row */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-stone/60 flex-wrap">
                          <span className="flex items-center gap-1">
                            <User size={12} />
                            {report.customer_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail size={12} />
                            {report.customer_email}
                          </span>
                          {report.order_id && (
                            <span className="flex items-center gap-1">
                              <Hash size={12} />
                              {report.order_id}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatDate(report.reported_at)}
                          </span>
                        </div>

                        {/* Description preview */}
                        <p className="text-xs text-stone/60 mt-2 line-clamp-2">
                          {report.description}
                        </p>
                      </div>
                    </div>

                    {/* ── Action Buttons ─────────────────────────────────────── */}
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleQuickAction(report.id, 'investigating')}
                            disabled={actionLoading === report.id}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                          >
                            <Eye size={14} />
                            Investigate
                          </button>
                          <button
                            onClick={() => handleQuickAction(report.id, 'dismissed')}
                            disabled={actionLoading === report.id}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone/60 bg-stone/5 hover:bg-stone/10 border border-stone/20 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            Dismiss
                          </button>
                        </>
                      )}

                      {isInvestigating && (
                        <>
                          <button
                            onClick={() => openActionModal(report, 'warning')}
                            disabled={actionLoading === report.id}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                          >
                            <ShieldAlert size={14} />
                            Send Warning to Brand
                          </button>
                          <button
                            onClick={() => openActionModal(report, 'remove')}
                            disabled={actionLoading === report.id}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                            Remove Product
                          </button>
                          <button
                            onClick={() => openActionModal(report, 'suspend')}
                            disabled={actionLoading === report.id}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                          >
                            <Ban size={14} />
                            Suspend Brand
                          </button>
                          <button
                            onClick={() => handleQuickAction(report.id, 'dismissed')}
                            disabled={actionLoading === report.id}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone/60 bg-stone/5 hover:bg-stone/10 border border-stone/20 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            Dismiss
                          </button>
                        </>
                      )}

                      {isResolved && report.action_taken && (
                        <div className="flex items-center gap-1.5 text-xs text-stone/50">
                          <CheckCircle size={12} />
                          Resolved {report.resolved_at ? formatDate(report.resolved_at) : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Expanded Details ─────────────────────────────────────── */}
                  {isExpanded && (
                    <div className="border-t border-sand/50 bg-parchment/30 p-5 space-y-4">
                      {/* Full description */}
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-stone/50 mb-1">
                          Full Description
                        </p>
                        <p className="text-sm text-charcoal-deep leading-relaxed">
                          {report.description}
                        </p>
                      </div>

                      {/* Grid: Report details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-stone/50 mb-1">
                            Report ID
                          </p>
                          <p className="text-xs font-mono text-charcoal-deep">{report.id}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-stone/50 mb-1">
                            Product ID
                          </p>
                          <p className="text-xs font-mono text-charcoal-deep">{report.product_id}</p>
                        </div>
                        {report.product_price && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-stone/50 mb-1">
                              Product Price
                            </p>
                            <p className="text-xs font-medium text-charcoal-deep">
                              &#8377;{report.product_price.toLocaleString()}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-stone/50 mb-1">
                            Reported At
                          </p>
                          <p className="text-xs text-charcoal-deep">
                            {formatDateTime(report.reported_at)}
                          </p>
                        </div>
                      </div>

                      {/* Brand Complaint History */}
                      <div className="bg-white border border-sand/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldAlert size={14} className="text-charcoal-deep/60" />
                          <p className="text-xs font-semibold text-charcoal-deep uppercase tracking-wider">
                            Brand Complaint History &mdash; {report.brand_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-charcoal-deep">
                            <span className="font-semibold">{brandWarning.total}</span>{' '}
                            total complaint{brandWarning.total !== 1 ? 's' : ''}
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium border rounded-full px-2.5 py-0.5 ${warningBadge.classes}`}
                          >
                            {brandWarning.level === 'high' && <ShieldX size={12} />}
                            {brandWarning.level === 'medium' && <ShieldAlert size={12} />}
                            {brandWarning.level === 'low' && <ShieldCheck size={12} />}
                            {warningBadge.label} Warning Level
                          </span>
                          {brandWarning.level === 'high' && (
                            <span className="text-xs text-red-600 font-medium">
                              Immediate review recommended
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Admin notes / action taken (for resolved) */}
                      {report.admin_notes && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare size={14} className="text-blue-600" />
                            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                              Admin Notes
                            </p>
                          </div>
                          <p className="text-sm text-blue-800">{report.admin_notes}</p>
                        </div>
                      )}

                      {report.action_taken && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle size={14} className="text-emerald-600" />
                            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                              Action Taken
                            </p>
                          </div>
                          <p className="text-sm text-emerald-800">{report.action_taken}</p>
                          {report.resolved_at && (
                            <p className="text-xs text-emerald-600 mt-1">
                              Resolved {formatDateTime(report.resolved_at)}
                            </p>
                          )}
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

      {/* ── Action Modals ──────────────────────────────────────────────────────── */}
      {modalType && modalReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-sand/50">
              <div className="flex items-center gap-3">
                {modalType === 'warning' && (
                  <>
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                      <ShieldAlert size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-charcoal-deep">
                        Send Warning to Brand
                      </h2>
                      <p className="text-xs text-stone/60">{modalReport.brand_name}</p>
                    </div>
                  </>
                )}
                {modalType === 'remove' && (
                  <>
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                      <Trash2 size={20} className="text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-charcoal-deep">
                        Remove Product
                      </h2>
                      <p className="text-xs text-stone/60">{modalReport.product_name}</p>
                    </div>
                  </>
                )}
                {modalType === 'suspend' && (
                  <>
                    <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                      <Ban size={20} className="text-rose-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-charcoal-deep">
                        Suspend Brand
                      </h2>
                      <p className="text-xs text-stone/60">{modalReport.brand_name}</p>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  setModalType(null);
                  setModalReport(null);
                }}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-parchment transition-colors text-stone/60 hover:text-charcoal-deep"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Context */}
              <div className="bg-parchment/50 border border-sand/50 rounded-lg p-4">
                <p className="text-xs text-stone/60 mb-1">Report</p>
                <p className="text-sm font-medium text-charcoal-deep">{modalReport.product_name}</p>
                <p className="text-xs text-stone/60 mt-1">
                  Reported by {modalReport.customer_name} &middot;{' '}
                  {formatDate(modalReport.reported_at)}
                </p>
              </div>

              {/* Suspend confirmation */}
              {modalType === 'suspend' && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={14} className="text-rose-600" />
                    <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                      Warning
                    </p>
                  </div>
                  <p className="text-sm text-rose-800">
                    Suspending a brand will immediately hide all their products from the marketplace.
                    This action should only be used for serious or repeated violations.
                  </p>
                </div>
              )}

              {/* Message input */}
              <div>
                <label className="block text-xs text-stone/60 mb-1.5">
                  {modalType === 'warning'
                    ? 'Warning Message'
                    : modalType === 'remove'
                    ? 'Removal Reason'
                    : 'Suspension Reason'}
                </label>
                <textarea
                  value={modalMessage}
                  onChange={(e) => setModalMessage(e.target.value)}
                  placeholder={
                    modalType === 'warning'
                      ? 'Describe the issue and required corrective actions...'
                      : modalType === 'remove'
                      ? 'Reason for removing this product from the marketplace...'
                      : 'Reason for suspending this brand...'
                  }
                  rows={4}
                  className="w-full border border-sand/50 rounded-lg px-3 py-2 text-sm bg-parchment/30 text-charcoal-deep placeholder:text-stone/40 focus:outline-none focus:ring-1 focus:ring-gold-soft resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-sand/50">
              <button
                onClick={() => {
                  setModalType(null);
                  setModalReport(null);
                }}
                className="text-xs font-medium text-stone/60 hover:text-charcoal-deep px-4 py-2 rounded-lg border border-sand/50 hover:bg-parchment transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleModalConfirm}
                disabled={!modalMessage.trim() || actionLoading === modalReport.id}
                className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-lg px-4 py-2 transition-colors disabled:opacity-50 ${
                  modalType === 'warning'
                    ? 'text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200'
                    : modalType === 'remove'
                    ? 'text-white bg-red-600 hover:bg-red-700 border border-red-600'
                    : 'text-white bg-rose-700 hover:bg-rose-800 border border-rose-700'
                }`}
              >
                {modalType === 'warning' && (
                  <>
                    <ShieldAlert size={14} />
                    Send Warning
                  </>
                )}
                {modalType === 'remove' && (
                  <>
                    <Trash2 size={14} />
                    Remove Product
                  </>
                )}
                {modalType === 'suspend' && (
                  <>
                    <Ban size={14} />
                    Suspend Brand
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
