'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import {
  Activity,
  Server,
  Database,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  fetchServiceHealth,
  fetchSystemMetrics,
  fetchErrorLog,
} from '@/services/admin.service';
import type {
  ServiceHealthItem as ServiceHealth,
  SystemMetrics,
  ErrorLogEntry,
} from '@/services/admin.service';
type ServiceStatus = 'healthy' | 'degraded' | 'down';

// ─── Helpers ────────────────────────────────────────────────────────────────

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'API Gateway': <Server size={18} />,
  Database: <Database size={18} />,
  'Cache Layer': <HardDrive size={18} />,
  CDN: <Wifi size={18} />,
  'Search Engine': <Activity size={18} />,
};

function statusDotColor(status: ServiceStatus): string {
  switch (status) {
    case 'healthy':
      return 'bg-emerald-500';
    case 'degraded':
      return 'bg-amber-500';
    case 'down':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
}

function statusLabel(status: ServiceStatus): string {
  switch (status) {
    case 'healthy':
      return 'Healthy';
    case 'degraded':
      return 'Degraded';
    case 'down':
      return 'Down';
    default:
      return String(status);
  }
}

function uptimeColor(uptime: number): string {
  if (uptime >= 99.5) return 'text-emerald-600';
  if (uptime >= 99) return 'text-amber-600';
  return 'text-red-600';
}

function progressBarColor(value: number): string {
  if (value < 70) return 'bg-emerald-500';
  if (value < 90) return 'bg-amber-500';
  return 'bg-red-500';
}

function levelBadge(level: ErrorLogEntry['level']): string {
  switch (level) {
    case 'critical':
      return 'bg-red-900 text-red-100';
    case 'error':
      return 'bg-red-100 text-red-800';
    case 'warning':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function SystemHealthPage() {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [errors, setErrors] = useState<ErrorLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [reindexing, setReindexing] = useState(false);
  const [reindexStatus, setReindexStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleReindex = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('moda-brand-token') : null;
    if (!token) return;
    setReindexing(true);
    setReindexStatus('idle');
    try {
      const res = await fetch('/api/v1/products/index', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ incremental: false }),
      });
      setReindexStatus(res.ok ? 'success' : 'error');
    } catch {
      setReindexStatus('error');
    } finally {
      setReindexing(false);
      setTimeout(() => setReindexStatus('idle'), 4000);
    }
  };

  async function loadAllData() {
    setLoading(true);
    const [sData, mData, eData] = await Promise.all([
      fetchServiceHealth(),
      fetchSystemMetrics(),
      fetchErrorLog(),
    ]);
    setServices(sData);
    if (mData) setMetrics(mData);
    setErrors([...eData].sort((a, b) => b.count - a.count));
    setLastRefresh(new Date());
    setLoading(false);
  }

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-parchment/30">
      {/* Header */}
      <AdminPageHeader
        title="System Health"
        subtitle="Service monitoring, performance metrics, and error tracking"
        breadcrumbs={[{ label: 'System Health' }]}
        actions={
          <div className="flex items-center gap-3">
            {/* Auto-refresh indicator */}
            <span className="flex items-center gap-1.5 text-xs text-stone/50">
              <Clock size={12} />
              Last refresh: {lastRefresh.toLocaleTimeString()}
            </span>
            <button
              onClick={handleReindex}
              disabled={reindexing}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                reindexStatus === 'success' ? 'bg-emerald-100 text-emerald-800' :
                reindexStatus === 'error' ? 'bg-red-100 text-red-800' :
                'bg-charcoal-deep text-ivory-cream hover:bg-noir'
              }`}
            >
              <Search size={14} className={reindexing ? 'animate-pulse' : ''} />
              {reindexing ? 'Reindexing…' : reindexStatus === 'success' ? 'Reindexed ✓' : reindexStatus === 'error' ? 'Failed — retry' : 'Reindex Search'}
            </button>
            <button
              onClick={loadAllData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-gold-soft text-charcoal-deep rounded-lg hover:bg-gold-soft/80 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        }
      />

      <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-8">
        {loading ? (
          <div className="text-center py-20 text-stone/60">Loading system health data...</div>
        ) : (
          <>
            {/* ── Service Status Grid ──────────────────────────────────── */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Activity size={20} className="text-gold-soft" />
                <h2 className="text-lg font-display tracking-wide text-charcoal-deep">
                  Service Status
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((svc) => (
                  <div
                    key={svc.name}
                    className="bg-white border border-sand/50 rounded-xl p-5 hover:shadow-sm transition-shadow"
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-stone/50">
                          {SERVICE_ICONS[svc.name] || <Server size={18} />}
                        </span>
                        <h3 className="text-sm font-semibold text-charcoal-deep">{svc.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${statusDotColor(svc.status as ServiceStatus)}`}
                        />
                        <span className="text-xs text-stone/60">{statusLabel(svc.status as ServiceStatus)}</span>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-[10px] text-stone/50 uppercase tracking-wider">
                          Uptime
                        </p>
                        <p className={`text-sm font-semibold mt-0.5 ${uptimeColor(svc.uptime)}`}>
                          {svc.uptime.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-stone/50 uppercase tracking-wider">
                          Response
                        </p>
                        <p className="text-sm font-semibold text-charcoal-deep mt-0.5">
                          {svc.responseTime}ms
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-stone/50 uppercase tracking-wider">
                          Errors
                        </p>
                        <p className="text-sm font-semibold text-charcoal-deep mt-0.5">
                          {svc.errorRate.toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    {/* Last checked */}
                    <div className="mt-3 pt-3 border-t border-sand/30 flex items-center gap-1.5 text-[10px] text-stone/40">
                      <Clock size={10} />
                      Last checked: {formatDateTime(svc.lastCheck)}
                    </div>
                  </div>
                ))}

                {services.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-stone/60 text-sm">
                    No service data available.
                  </div>
                )}
              </div>
            </section>

            {/* ── System Metrics ───────────────────────────────────────── */}
            {metrics && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Cpu size={20} className="text-gold-soft" />
                  <h2 className="text-lg font-display tracking-wide text-charcoal-deep">
                    System Metrics
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CPU Usage */}
                  <div className="bg-white border border-sand/50 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Cpu size={16} className="text-stone/50" />
                        <p className="text-xs text-stone/60 uppercase tracking-wider font-medium">
                          CPU Usage
                        </p>
                      </div>
                      <span className="text-lg font-semibold text-charcoal-deep">
                        {metrics.cpuUsage != null ? `${metrics.cpuUsage}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-parchment/60 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progressBarColor(metrics.cpuUsage ?? 0)}`}
                        style={{ width: `${metrics.cpuUsage ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Memory Usage */}
                  <div className="bg-white border border-sand/50 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MemoryStick size={16} className="text-stone/50" />
                        <p className="text-xs text-stone/60 uppercase tracking-wider font-medium">
                          Memory Usage
                        </p>
                      </div>
                      <span className="text-lg font-semibold text-charcoal-deep">
                        {metrics.memoryUsage != null ? `${metrics.memoryUsage}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-parchment/60 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progressBarColor(metrics.memoryUsage ?? 0)}`}
                        style={{ width: `${metrics.memoryUsage ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Disk Usage */}
                  <div className="bg-white border border-sand/50 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <HardDrive size={16} className="text-stone/50" />
                        <p className="text-xs text-stone/60 uppercase tracking-wider font-medium">
                          Disk Usage
                        </p>
                      </div>
                      <span className="text-lg font-semibold text-charcoal-deep">
                        {metrics.diskUsage != null ? `${metrics.diskUsage}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-parchment/60 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progressBarColor(metrics.diskUsage ?? 0)}`}
                        style={{ width: `${metrics.diskUsage ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Active Connections */}
                  <div className="bg-white border border-sand/50 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wifi size={16} className="text-stone/50" />
                        <p className="text-xs text-stone/60 uppercase tracking-wider font-medium">
                          Active Connections
                        </p>
                      </div>
                      <span className="text-lg font-semibold text-charcoal-deep">
                        {metrics.activeConnections != null ? metrics.activeConnections.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Requests/sec */}
                  <div className="bg-white border border-sand/50 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-stone/50" />
                        <p className="text-xs text-stone/60 uppercase tracking-wider font-medium">
                          Requests / sec
                        </p>
                      </div>
                      <span className="text-lg font-semibold text-charcoal-deep">
                        {metrics.requestsPerSecond != null ? metrics.requestsPerSecond.toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Avg Response Time */}
                  <div className="bg-white border border-sand/50 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-stone/50" />
                        <p className="text-xs text-stone/60 uppercase tracking-wider font-medium">
                          Avg Response Time
                        </p>
                      </div>
                      <span className="text-lg font-semibold text-charcoal-deep">
                        {metrics.avgResponseTime != null ? `${metrics.avgResponseTime}ms` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Error Rate */}
                  <div className="bg-white border border-sand/50 rounded-xl p-5 md:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-stone/50" />
                        <p className="text-xs text-stone/60 uppercase tracking-wider font-medium">
                          Error Rate
                        </p>
                      </div>
                      <span className="text-lg font-semibold text-charcoal-deep">
                        {metrics.errorRate != null ? `${metrics.errorRate}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="w-full bg-parchment/60 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progressBarColor((metrics.errorRate ?? 0) * 10)}`}
                        style={{ width: `${Math.min((metrics.errorRate ?? 0) * 20, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── Error Log ────────────────────────────────────────────── */}
            <section className="bg-white border border-sand/50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <AlertTriangle size={20} className="text-gold-soft" />
                <h2 className="text-lg font-display tracking-wide text-charcoal-deep">
                  Error Log
                </h2>
                <span className="ml-auto text-xs text-stone/50">
                  Sorted by occurrences (descending)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sand/50 text-left">
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium">
                        Level
                      </th>
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium">
                        Message
                      </th>
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium">
                        Source
                      </th>
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium text-right">
                        Occurrences
                      </th>
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium">
                        First Seen
                      </th>
                      <th className="pb-3 pr-4 text-xs text-stone/60 uppercase tracking-wider font-medium">
                        Last Seen
                      </th>
                      <th className="pb-3 text-xs text-stone/60 uppercase tracking-wider font-medium text-center">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {errors.map((entry) => (
                      <tr
                        key={entry.id}
                        className={`border-b border-sand/20 last:border-0 transition-colors ${
                          !entry.resolved
                            ? 'bg-red-50/40 hover:bg-red-50/60'
                            : 'hover:bg-parchment/20'
                        }`}
                      >
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full ${levelBadge(entry.level)}`}
                          >
                            {entry.level}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-charcoal-deep max-w-xs truncate">
                          {entry.message}
                        </td>
                        <td className="py-3 pr-4 text-stone/60 font-mono text-xs">
                          {entry.source}
                        </td>
                        <td className="py-3 pr-4 text-right font-semibold text-charcoal-deep">
                          {entry.count.toLocaleString()}
                        </td>
                        <td className="py-3 pr-4 text-xs text-stone/60">
                          {formatDateTime(entry.firstSeen)}
                        </td>
                        <td className="py-3 pr-4 text-xs text-stone/60">
                          {formatDateTime(entry.lastSeen)}
                        </td>
                        <td className="py-3 text-center">
                          {entry.resolved ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                              <CheckCircle size={14} />
                              Resolved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                              <AlertTriangle size={14} />
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {errors.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-stone/60">
                          No errors logged.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
