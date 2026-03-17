'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Search, X, Plus, ExternalLink } from 'lucide-react';
import { brandIntelligenceService } from '@/services';
import { updateCounterfeitAlert, reportCounterfeitAlert } from '@/services/brand-intelligence.service';
import type { CounterfeitAlert, CounterfeitRiskLevel, CounterfeitStatus } from '@/types/brand-intelligence';
import IntelligencePageWrapper from '@/components/brand/IntelligencePageWrapper';

const emptyReport = {
  product_id: '',
  similarity: 50,
  source: '',
  source_url: '',
  region: '',
  risk_level: '' as string,
};

export default function CounterfeitPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<CounterfeitAlert[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState(emptyReport);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    brandIntelligenceService.getCounterfeitAlerts().then(res => {
      if (res.data) setAlerts(Array.isArray(res.data) ? res.data : []);
      setIsLoading(false);
    });
  }, []);

  const totalAlerts = alerts.length;
  const criticalCount = alerts.filter(a => a.riskLevel === 'critical').length;
  const investigatingCount = alerts.filter(a => a.status === 'investigating').length;

  const getRiskBadge = (level: CounterfeitRiskLevel) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getStatusBadge = (status: CounterfeitStatus) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'investigating': return 'bg-amber-100 text-amber-700';
      case 'confirmed': return 'bg-red-100 text-red-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'dismissed': return 'bg-stone/10 text-stone';
    }
  };

  const handleInvestigate = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'investigating' as CounterfeitStatus } : a));
    updateCounterfeitAlert(id, 'investigating').catch(() => {});
  };

  const handleDismiss = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'dismissed' as CounterfeitStatus } : a));
    updateCounterfeitAlert(id, 'dismissed').catch(() => {});
  };

  const handleReport = async () => {
    if (!reportForm.product_id || !reportForm.source) {
      setSubmitError('Product ID and Source are required');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const result = await reportCounterfeitAlert({
      product_id: reportForm.product_id,
      similarity: reportForm.similarity,
      source: reportForm.source,
      source_url: reportForm.source_url || undefined,
      region: reportForm.region || undefined,
      risk_level: reportForm.risk_level || undefined,
    });
    if (result) {
      // Reload alerts to get the new one
      brandIntelligenceService.getCounterfeitAlerts().then(res => {
        if (res.data) setAlerts(Array.isArray(res.data) ? res.data : []);
      });
      setReportForm(emptyReport);
      setShowReportForm(false);
    } else {
      setSubmitError('Failed to submit report. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <IntelligencePageWrapper
      title="Counterfeit Digital Detection"
      subtitle="Monitor and respond to counterfeit product alerts across digital channels"
      acronym="CDDI™"
      isLoading={isLoading}
    >
      <div className="p-8 space-y-8">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Total Alerts</p>
            <p className="font-display text-2xl text-charcoal-deep">{totalAlerts}</p>
          </div>
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Critical Alerts</p>
            <p className="font-display text-2xl text-red-600">{criticalCount}</p>
          </div>
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Investigating</p>
            <p className="font-display text-2xl text-charcoal-deep">{investigatingCount}</p>
          </div>
        </div>

        {/* Report Counterfeit Form */}
        <div className="bg-white border border-sand/50">
          <button
            onClick={() => { setShowReportForm(!showReportForm); setSubmitError(null); }}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-parchment/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Plus size={16} className="text-charcoal-deep" />
              <span className="text-sm font-medium text-charcoal-deep">Report a Counterfeit</span>
            </div>
            {showReportForm && <X size={16} className="text-stone" />}
          </button>
          {showReportForm && (
            <div className="px-6 pb-6 border-t border-sand/30 pt-4 space-y-4">
              <p className="text-xs text-stone">
                Manually report a suspected counterfeit product you&apos;ve found online. Provide the product details and source listing.
              </p>
              {submitError && (
                <div className="p-3 bg-error/5 border border-error/20 text-sm text-error">{submitError}</div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Product ID *</label>
                  <input
                    type="text" value={reportForm.product_id}
                    onChange={e => setReportForm(prev => ({ ...prev, product_id: e.target.value }))}
                    placeholder="ID of your authentic product being copied"
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Source Platform *</label>
                  <input
                    type="text" value={reportForm.source}
                    onChange={e => setReportForm(prev => ({ ...prev, source: e.target.value }))}
                    placeholder="e.g., AliExpress, DHgate, eBay"
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">
                    Visual Similarity ({reportForm.similarity}%)
                  </label>
                  <input
                    type="range" min={0} max={100} value={reportForm.similarity}
                    onChange={e => setReportForm(prev => ({ ...prev, similarity: parseInt(e.target.value) }))}
                    className="w-full accent-charcoal-deep"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Risk Level</label>
                  <select
                    value={reportForm.risk_level}
                    onChange={e => setReportForm(prev => ({ ...prev, risk_level: e.target.value }))}
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep"
                  >
                    <option value="">Auto-detect</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Source URL</label>
                  <input
                    type="url" value={reportForm.source_url}
                    onChange={e => setReportForm(prev => ({ ...prev, source_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Region</label>
                  <input
                    type="text" value={reportForm.region}
                    onChange={e => setReportForm(prev => ({ ...prev, region: e.target.value }))}
                    placeholder="e.g., China, Southeast Asia"
                    className="w-full px-4 py-3 border border-sand text-sm focus:outline-none focus:border-charcoal-deep placeholder:text-taupe"
                  />
                </div>
              </div>
              <button
                onClick={handleReport}
                disabled={submitting || !reportForm.product_id || !reportForm.source}
                className="px-6 py-3 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.15em] uppercase hover:bg-noir transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          )}
        </div>

        {/* Alert Cards */}
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <ShieldAlert size={48} className="mx-auto text-taupe/40 mb-4" />
            <p className="text-stone">No counterfeit alerts detected</p>
            <p className="text-xs text-taupe mt-1">Alerts will appear here when potential counterfeits are found or reported</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map(alert => (
              <div key={alert.id} className="bg-white border border-sand/50 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldAlert size={18} className="text-stone" />
                      <h3 className="font-display text-lg text-charcoal-deep">{alert.productName}</h3>
                      <span className={`px-3 py-0.5 text-[10px] tracking-[0.15em] uppercase border ${getRiskBadge(alert.riskLevel)}`}>
                        {alert.riskLevel}
                      </span>
                      <span className={`px-3 py-0.5 text-[10px] tracking-[0.15em] uppercase ${getStatusBadge(alert.status)}`}>
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone">
                      Product ID: {alert.productId} &middot; Detected: {new Date(alert.detectedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {alert.status !== 'investigating' && alert.status !== 'resolved' && alert.status !== 'dismissed' && (
                      <button
                        onClick={() => handleInvestigate(alert.id)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-wider uppercase hover:bg-noir transition-colors"
                      >
                        <Search size={12} />
                        Investigate
                      </button>
                    )}
                    {alert.status !== 'resolved' && alert.status !== 'dismissed' && (
                      <button
                        onClick={() => handleDismiss(alert.id)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-parchment text-stone text-xs tracking-wider uppercase hover:bg-sand/50 transition-colors"
                      >
                        <X size={12} />
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Similarity</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-parchment overflow-hidden">
                        <div className="h-full bg-red-500 transition-all" style={{ width: `${alert.similarity}%` }} />
                      </div>
                      <span className="text-sm font-medium text-charcoal-deep">{alert.similarity}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Source</p>
                    <p className="text-sm text-charcoal-deep">{alert.source}</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Region</p>
                    <p className="text-sm text-charcoal-deep">{alert.region}</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Source URL</p>
                    {alert.sourceUrl ? (
                      <a
                        href={alert.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-charcoal-deep hover:text-gold-deep transition-colors"
                      >
                        View Source <ExternalLink size={12} />
                      </a>
                    ) : (
                      <p className="text-sm text-stone">N/A</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </IntelligencePageWrapper>
  );
}
