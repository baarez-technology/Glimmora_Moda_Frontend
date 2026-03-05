'use client';

import { useState, useEffect } from 'react';
import { Archive, Clock } from 'lucide-react';
import { brandIntelligenceService } from '@/services';
import type { HeritageAsset, DigitalStatus } from '@/types/brand-intelligence';
import IntelligencePageWrapper from '@/components/brand/IntelligencePageWrapper';

export default function HeritagePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [assets, setAssets] = useState<HeritageAsset[]>([]);

  useEffect(() => {
    brandIntelligenceService.getHeritageAssets().then(res => {
      if (res.data) setAssets(res.data);
      setIsLoading(false);
    });
  }, []);

  const totalAssets = assets.length;
  const iconicCount = assets.filter(a => a.significance === 'iconic').length;
  const avgPreservation = totalAssets > 0
    ? (assets.reduce((sum, a) => sum + a.preservationScore, 0) / totalAssets).toFixed(1)
    : '0';
  const completeDigitization = assets.filter(a => a.digitalStatus === 'complete').length;

  const getSignificanceBadge = (significance: HeritageAsset['significance']) => {
    switch (significance) {
      case 'iconic':
        return 'bg-purple-100 text-purple-700';
      case 'important':
        return 'bg-blue-100 text-blue-700';
      case 'notable':
        return 'bg-amber-100 text-amber-700';
      case 'standard':
        return 'bg-stone/10 text-stone';
    }
  };

  const getDigitalStatusBadge = (status: DigitalStatus) => {
    switch (status) {
      case 'not_started':
        return { className: 'bg-stone/10 text-stone', label: 'Not Started' };
      case 'scanning':
        return { className: 'bg-blue-100 text-blue-700', label: 'Scanning' };
      case 'processing':
        return { className: 'bg-amber-100 text-amber-700', label: 'Processing' };
      case 'complete':
        return { className: 'bg-green-100 text-green-700', label: 'Complete' };
    }
  };

  return (
    <IntelligencePageWrapper
      title="Heritage Preservation AI"
      subtitle="Catalog, preserve, and digitize brand heritage assets with AI assistance"
      acronym="HPAI™"
      phase={2}
      status="mock"
      backendNote="Requires asset management system and 3D scanning pipeline. Endpoint: GET /api/intelligence/heritage-assets"
      isLoading={isLoading}
    >
      {assets.length === 0 ? (
        <div className="p-8 text-center">
          <Archive size={48} className="mx-auto text-taupe/40 mb-4" />
          <p className="text-stone">No heritage assets found</p>
          <p className="text-xs text-taupe mt-1">Heritage assets will appear here once cataloged</p>
        </div>
      ) : (
        <div className="p-8 space-y-8">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Total Assets</p>
              <p className="font-display text-2xl text-charcoal-deep">{totalAssets}</p>
            </div>
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Iconic Assets</p>
              <p className="font-display text-2xl text-charcoal-deep">{iconicCount}</p>
            </div>
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Avg Preservation Score</p>
              <p className="font-display text-2xl text-charcoal-deep">{avgPreservation}</p>
            </div>
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Digitization Complete</p>
              <p className="font-display text-2xl text-charcoal-deep">{completeDigitization}</p>
            </div>
          </div>

          {/* Asset Cards */}
          <div className="space-y-4">
            {assets.map(asset => {
              const digitalStatus = getDigitalStatusBadge(asset.digitalStatus);
              return (
                <div key={asset.assetId} className="bg-white border border-sand/50 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Archive size={18} className="text-stone" />
                        <h3 className="font-display text-lg text-charcoal-deep">{asset.name}</h3>
                        <span className={`px-3 py-0.5 text-[10px] tracking-[0.15em] uppercase ${getSignificanceBadge(asset.significance)}`}>
                          {asset.significance}
                        </span>
                        <span className={`px-3 py-0.5 text-[10px] tracking-[0.15em] uppercase ${digitalStatus.className}`}>
                          {digitalStatus.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-stone">
                        <span>{asset.era}</span>
                        {asset.year && (
                          <>
                            <span>&middot;</span>
                            <span>{asset.year}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {asset.lastInspection && (
                      <div className="flex items-center gap-1 text-xs text-stone">
                        <Clock size={12} />
                        Last inspection: {new Date(asset.lastInspection).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-stone mb-4">{asset.description}</p>

                  {/* Preservation Score Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] tracking-[0.15em] uppercase text-stone">Preservation Score</span>
                      <span className="text-sm font-medium text-charcoal-deep">{asset.preservationScore}%</span>
                    </div>
                    <div className="h-2 bg-parchment overflow-hidden">
                      <div
                        className="h-full bg-charcoal-deep transition-all"
                        style={{ width: `${asset.preservationScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </IntelligencePageWrapper>
  );
}
