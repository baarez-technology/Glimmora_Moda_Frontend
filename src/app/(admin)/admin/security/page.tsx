'use client';

import { useState, useEffect, useMemo } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  Shield,
  AlertTriangle,
  FileText,
  Lock,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Search,
  Filter,
} from 'lucide-react';
import {
  fetchAuditLog,
  fetchSecurityAlerts,
  resolveSecurityAlert,
  fetchGDPRRequests,
  processGDPRRequest,
  fetchSecuritySummary,
  type SecuritySummary,
} from '@/services/admin.service';
import type {
  AuditLogEntry,
  SecurityAlert,
  GDPRRequest,
  AlertSeverity,
  AuditAction,
} from '@/types/admin';

type Tab = 'alerts' | 'audit' | 'gdpr';

const tabs: { value: Tab; label: string; icon: typeof Shield }[] = [
  { value: 'alerts', label: 'Security Alerts', icon: AlertTriangle },
  { value: 'audit', label: 'Audit Log', icon: FileText },
  { value: 'gdpr', label: 'GDPR Requests', icon: Lock },
];

const auditActionOptions: { value: AuditAction | 'all'; label: string }[] = [
  { value: 'all', label: 'All Actions' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'export', label: 'Export' },
  { value: 'impersonate', label: 'Impersonate' },
  { value: 'config_change', label: 'Config Change' },
];

function getSeverityBadge(severity: AlertSeverity) {
  switch (severity) {
    case 'critical':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'high':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'medium':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'low':
      return 'bg-gray-50 text-gray-600 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

function getActionBadge(action: AuditAction) {
  switch (action) {
    case 'login':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'delete':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'impersonate':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'config_change':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

function getGDPRTypeBadge(type: GDPRRequest['type']) {
  switch (type) {
    case 'data_deletion':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'data_export':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'consent_update':
      return 'bg-gray-50 text-gray-600 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

function getGDPRStatusBadge(status: GDPRRequest['status']) {
  switch (status) {
    case 'pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'processing':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
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

function formatLabel(str: string): string {
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function SecurityCompliancePage() {
  const [activeTab, setActiveTab] = useState<Tab>('alerts');
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [gdprRequests, setGDPRRequests] = useState<GDPRRequest[]>([]);
  const [summary, setSummary] = useState<SecuritySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Audit log filters
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState<AuditAction | 'all'>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [alertsRes, auditRes, gdprRes, summaryRes] = await Promise.all([
        fetchSecurityAlerts(),
        fetchAuditLog(
          auditActionFilter !== 'all' ? { action: auditActionFilter } : undefined
        ),
        fetchGDPRRequests(),
        fetchSecuritySummary(),
      ]);
      if (alertsRes.data) setAlerts(alertsRes.data);
      if (auditRes.data) setAuditLog(auditRes.data);
      if (gdprRes.data) setGDPRRequests(gdprRes.data);
      setSummary(summaryRes);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditActionFilter]);

  // Alert stats
  const alertStats = useMemo(() => {
    return {
      critical: alerts.filter((a) => a.severity === 'critical').length,
      high: alerts.filter((a) => a.severity === 'high').length,
      unresolved: alerts.filter((a) => !a.resolved).length,
    };
  }, [alerts]);

  // Filtered audit log
  const filteredAuditLog = useMemo(() => {
    if (!auditSearch.trim()) return auditLog;
    const q = auditSearch.toLowerCase();
    return auditLog.filter(
      (entry) =>
        entry.userName.toLowerCase().includes(q) ||
        entry.resource.toLowerCase().includes(q) ||
        entry.details.toLowerCase().includes(q) ||
        entry.ipAddress.includes(q)
    );
  }, [auditLog, auditSearch]);

  const handleResolveAlert = async (id: string) => {
    setActionLoading(id);
    try {
      await resolveSecurityAlert(id);
      await loadData();
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  };

  const handleProcessGDPR = async (id: string) => {
    setActionLoading(id);
    try {
      await processGDPRRequest(id);
      await loadData();
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-parchment">
      <AdminPageHeader
        title="Security & Compliance"
        subtitle="Audit logs, security alerts, and GDPR management"
        breadcrumbs={[{ label: 'Security' }]}
      />

      <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-6">
        {/* Live Security Summary (24h) */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-sand/50 rounded-lg p-5">
              <p className="text-xs text-stone/60 uppercase tracking-wider">Failed OTP (24h)</p>
              <p className="text-2xl font-semibold text-charcoal-deep mt-1">{summary.failedOtpAttempts24h}</p>
            </div>
            <div className="bg-white border border-sand/50 rounded-lg p-5">
              <p className="text-xs text-stone/60 uppercase tracking-wider">Failed Logins (24h)</p>
              <p className="text-2xl font-semibold text-charcoal-deep mt-1">{summary.failedLoginAttempts24h}</p>
            </div>
            <div className="bg-white border border-sand/50 rounded-lg p-5">
              <p className="text-xs text-stone/60 uppercase tracking-wider">JWT Blacklist</p>
              <p className="text-2xl font-semibold text-charcoal-deep mt-1">{summary.activeJwtBlacklist}</p>
            </div>
            <div className="bg-white border border-sand/50 rounded-lg p-5">
              <p className="text-xs text-stone/60 uppercase tracking-wider">Suspicious IPs</p>
              <p className="text-2xl font-semibold text-charcoal-deep mt-1">{summary.suspiciousIps.length}</p>
              {summary.suspiciousIps.length > 0 && (
                <p className="text-xs text-stone/50 font-mono mt-1 truncate" title={summary.suspiciousIps.join(', ')}>
                  {summary.suspiciousIps.slice(0, 3).join(', ')}
                  {summary.suspiciousIps.length > 3 ? '…' : ''}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white border border-sand/50 rounded-lg p-1 inline-flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-charcoal-deep text-ivory-cream'
                    : 'text-stone/60 hover:text-charcoal-deep hover:bg-parchment/50'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-16 text-stone/60 text-sm">Loading security data...</div>
        ) : (
          <>
            {/* ─── Security Alerts Tab ──────────────────────────────── */}
            {activeTab === 'alerts' && (
              <div className="space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-sand/50 rounded-lg p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                        <Shield size={20} className="text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs text-stone/60 uppercase tracking-wider">Critical</p>
                        <p className="text-2xl font-semibold text-charcoal-deep">{alertStats.critical}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-sand/50 rounded-lg p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                        <AlertTriangle size={20} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-stone/60 uppercase tracking-wider">High</p>
                        <p className="text-2xl font-semibold text-charcoal-deep">{alertStats.high}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-sand/50 rounded-lg p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                        <Clock size={20} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs text-stone/60 uppercase tracking-wider">Unresolved</p>
                        <p className="text-2xl font-semibold text-charcoal-deep">{alertStats.unresolved}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alert Cards */}
                {alerts.length === 0 ? (
                  <div className="text-center py-16 text-stone/60 text-sm">No security alerts.</div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`bg-white border border-sand/50 rounded-lg p-5 ${
                          !alert.resolved ? 'border-l-4 border-l-gold-soft' : ''
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`inline-flex items-center text-[10px] uppercase tracking-wider font-semibold border rounded-full px-2.5 py-0.5 ${getSeverityBadge(
                                  alert.severity
                                )}`}
                              >
                                {alert.severity}
                              </span>
                              <h3 className="text-sm font-semibold text-charcoal-deep">
                                {alert.title}
                              </h3>
                            </div>
                            <p className="text-xs text-stone/60 mt-1.5">{alert.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-stone/50">
                              <span>Source: {alert.source}</span>
                              <span>{'\u00B7'}</span>
                              <span>{formatDate(alert.timestamp)}</span>
                            </div>
                            {alert.resolved && alert.resolvedBy && alert.resolvedAt && (
                              <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1.5">
                                <CheckCircle size={12} />
                                Resolved by {alert.resolvedBy} on {formatDate(alert.resolvedAt)}
                              </div>
                            )}
                          </div>

                          <div className="flex-shrink-0">
                            {!alert.resolved ? (
                              <button
                                onClick={() => handleResolveAlert(alert.id)}
                                disabled={actionLoading === alert.id}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                              >
                                <CheckCircle size={14} />
                                Resolve
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                                <CheckCircle size={12} />
                                Resolved
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── Audit Log Tab ───────────────────────────────────── */}
            {activeTab === 'audit' && (
              <div className="space-y-6">
                {/* Toolbar */}
                <div className="bg-white border border-sand/50 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="relative flex-1 w-full sm:w-auto">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone/40" />
                    <input
                      type="text"
                      placeholder="Search by user, resource, details, or IP..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-sand/50 rounded-lg bg-parchment/50 text-charcoal-deep placeholder:text-stone/40 focus:outline-none focus:ring-1 focus:ring-gold-soft"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-stone/40" />
                    <select
                      value={auditActionFilter}
                      onChange={(e) =>
                        setAuditActionFilter(e.target.value as AuditAction | 'all')
                      }
                      className="text-sm border border-sand/50 rounded-lg px-3 py-2 bg-parchment/50 text-charcoal-deep focus:outline-none focus:ring-1 focus:ring-gold-soft"
                    >
                      {auditActionOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-sand/50 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-sand/50 bg-parchment/30">
                          <th className="text-left px-4 py-3 text-xs font-medium text-stone/60 uppercase tracking-wider">
                            Timestamp
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-stone/60 uppercase tracking-wider">
                            User
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-stone/60 uppercase tracking-wider">
                            Action
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-stone/60 uppercase tracking-wider">
                            Resource
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-stone/60 uppercase tracking-wider">
                            Details
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-stone/60 uppercase tracking-wider">
                            IP Address
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAuditLog.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-stone/60 text-sm">
                              No audit log entries found.
                            </td>
                          </tr>
                        ) : (
                          filteredAuditLog.map((entry) => (
                            <tr
                              key={entry.id}
                              className="border-b border-sand/30 last:border-b-0 hover:bg-parchment/20 transition-colors"
                            >
                              <td className="px-4 py-3 text-xs text-stone/60 whitespace-nowrap">
                                {formatDate(entry.timestamp)}
                              </td>
                              <td className="px-4 py-3 text-xs font-medium text-charcoal-deep whitespace-nowrap">
                                {entry.userName}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center text-[10px] uppercase tracking-wider font-semibold border rounded-full px-2.5 py-0.5 ${getActionBadge(
                                    entry.action
                                  )}`}
                                >
                                  {formatLabel(entry.action)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-charcoal-deep/80">
                                {entry.resource}
                              </td>
                              <td className="px-4 py-3 text-xs text-stone/60 max-w-[240px] truncate">
                                {entry.details}
                              </td>
                              <td className="px-4 py-3 text-xs text-stone/50 font-mono whitespace-nowrap">
                                {entry.ipAddress}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ─── GDPR Requests Tab ───────────────────────────────── */}
            {activeTab === 'gdpr' && (
              <div className="space-y-6">
                <div className="bg-white border border-sand/50 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-sand/50 bg-parchment/30">
                          <th className="text-left px-4 py-3 text-xs font-medium text-stone/60 uppercase tracking-wider">
                            User
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-stone/60 uppercase tracking-wider">
                            Request Type
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-stone/60 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-stone/60 uppercase tracking-wider">
                            Requested At
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-stone/60 uppercase tracking-wider">
                            Completed At
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-stone/60 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {gdprRequests.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-stone/60 text-sm">
                              No GDPR requests found.
                            </td>
                          </tr>
                        ) : (
                          gdprRequests.map((req) => (
                            <tr
                              key={req.id}
                              className="border-b border-sand/30 last:border-b-0 hover:bg-parchment/20 transition-colors"
                            >
                              <td className="px-4 py-3 text-xs font-medium text-charcoal-deep whitespace-nowrap">
                                {req.userName}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center text-[10px] uppercase tracking-wider font-semibold border rounded-full px-2.5 py-0.5 ${getGDPRTypeBadge(
                                    req.type
                                  )}`}
                                >
                                  {formatLabel(req.type)}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center text-[10px] uppercase tracking-wider font-semibold border rounded-full px-2.5 py-0.5 ${getGDPRStatusBadge(
                                    req.status
                                  )}`}
                                >
                                  {formatLabel(req.status)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-stone/60 whitespace-nowrap">
                                {formatDate(req.requestedAt)}
                              </td>
                              <td className="px-4 py-3 text-xs text-stone/60 whitespace-nowrap">
                                {req.completedAt ? formatDate(req.completedAt) : '\u2014'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {req.status === 'pending' ? (
                                  <button
                                    onClick={() => handleProcessGDPR(req.id)}
                                    disabled={actionLoading === req.id}
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                                  >
                                    <Clock size={14} />
                                    Process
                                  </button>
                                ) : req.status === 'completed' ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
                                    <CheckCircle size={12} />
                                    Done
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-xs text-blue-600">
                                    <Clock size={12} />
                                    Processing
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
