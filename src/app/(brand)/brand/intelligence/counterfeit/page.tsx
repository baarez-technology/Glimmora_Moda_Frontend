'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Search, X } from 'lucide-react';
import { brandIntelligenceService } from '@/services';
import type { CounterfeitAlert, CounterfeitRiskLevel, CounterfeitStatus } from '@/types/brand-intelligence';
import IntelligencePageWrapper from '@/components/brand/IntelligencePageWrapper';

export default function CounterfeitPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<CounterfeitAlert[]>([]);

  useEffect(() => {
    brandIntelligenceService.getCounterfeitAlerts().then(res => {
      if (res.data) setAlerts(res.data);
      setIsLoading(false);
    });
  }, []);

  const totalAlerts = alerts.length;
  const criticalCount = alerts.filter(a => a.riskLevel === 'critical').length;
  const investigatingCount = alerts.filter(a => a.status === 'investigating').length;

  const getRiskBadge = (level: CounterfeitRiskLevel) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getStatusBadge = (status: CounterfeitStatus) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'investigating':
        return 'bg-amber-100 text-amber-700';
      case 'confirmed':
        return 'bg-red-100 text-red-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'dismissed':
        return 'bg-stone/10 text-stone';
    }
  };

  const handleInvestigate = (id: string) => {
    setAlerts(prev =>
      prev.map(a => a.id === id ? { ...a, status: 'investigating' as CounterfeitStatus } : a)
    );
  };

  const handleDismiss = (id: string) => {
    setAlerts(prev =>
      prev.map(a => a.id === id ? { ...a, status: 'dismissed' as CounterfeitStatus } : a)
    );
  };

  return (
    <IntelligencePageWrapper
      title="Counterfeit Digital Detection"
      subtitle="Monitor and respond to counterfeit product alerts across digital channels"
      acronym="CDDI™"
      phase={3}
      status="mock"
      backendNote="Requires image-recognition microservice and marketplace scraping. Endpoint: GET /api/intelligence/counterfeit-alerts"
      isLoading={isLoading}
    >
      {alerts.length === 0 ? (
        <div className="p-8 text-center">
          <ShieldAlert size={48} className="mx-auto text-taupe/40 mb-4" />
          <p className="text-stone">No counterfeit alerts detected</p>
          <p className="text-xs text-taupe mt-1">Alerts will appear here when potential counterfeits are found</p>
        </div>
      ) : (
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

          {/* Alert Cards */}
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
                        <div
                          className="h-full bg-red-500 transition-all"
                          style={{ width: `${alert.similarity}%` }}
                        />
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
                        className="text-sm text-info hover:underline truncate block"
                      >
                        View Source
                      </a>
                    ) : (
                      <p className="text-sm text-stone">N/A</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </IntelligencePageWrapper>
  );
}
