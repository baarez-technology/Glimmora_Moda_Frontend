'use client';

import { useState, useEffect } from 'react';
import { brandIntelligenceService } from '@/services';
import type { BrandConciergeConfig } from '@/types/brand-intelligence';
import IntelligencePageWrapper from '@/components/brand/IntelligencePageWrapper';

export default function BrandConciergePage() {
  const [config, setConfig] = useState<BrandConciergeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    brandIntelligenceService.getBrandConciergeConfig().then(res => {
      if (res.data) setConfig(res.data);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const activeConversations = config?.conversations.filter(c => c.status === 'active').length ?? 0;
  const totalConversations = config?.conversations.length ?? 0;
  const culturalAnchorsCount = config?.culturalAnchors.length ?? 0;

  const statusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600';
      case 'resolved':
        return 'bg-blue-500/10 text-blue-600';
      case 'escalated':
        return 'bg-red-500/10 text-red-600';
      default:
        return 'bg-taupe/10 text-stone';
    }
  };

  const sentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500/10 text-green-600';
      case 'neutral':
        return 'bg-amber-500/10 text-amber-600';
      case 'negative':
        return 'bg-red-500/10 text-red-600';
      default:
        return 'bg-taupe/10 text-stone';
    }
  };

  return (
    <IntelligencePageWrapper
      title="Brand Concierge Configuration"
      subtitle="Configure and monitor your AI-powered brand concierge experience"
      phase={1}
      status="live"
      backendNote="Requires WebSocket or SSE for real-time chat. Endpoints: GET/PUT /api/intelligence/concierge"
      isLoading={isLoading}
    >
      {!config ? (
        <div className="p-8 text-center">
          <p className="text-stone">No concierge configuration found.</p>
        </div>
      ) : (
        <div className="p-8 space-y-8">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Active Visitors</p>
              <p className="font-display text-2xl text-charcoal-deep">{config.activeVisitors}</p>
            </div>
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Total Conversations</p>
              <p className="font-display text-2xl text-charcoal-deep">{totalConversations}</p>
            </div>
            <div className="bg-white border border-sand/50 p-6">
              <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Cultural Anchors</p>
              <p className="font-display text-2xl text-charcoal-deep">{culturalAnchorsCount}</p>
            </div>
          </div>

          {/* Config Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Personality &amp; Tone</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Personality</p>
                  <p className="text-sm text-charcoal-deep">{config.personality}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Tone</p>
                  <span className="px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-purple-500/10 text-purple-600 capitalize">
                    {config.tone}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-2">Cultural Anchors</p>
                  <div className="flex flex-wrap gap-2">
                    {config.culturalAnchors.map(anchor => (
                      <span key={anchor} className="px-2 py-1 text-[10px] tracking-[0.1em] uppercase bg-amber-500/10 text-amber-600">
                        {anchor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Response Languages */}
            <div className="bg-white border border-sand/50">
              <div className="px-6 py-4 border-b border-sand/50">
                <h2 className="font-medium text-charcoal-deep">Response Languages</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {config.responseLanguages.map(lang => (
                    <div key={lang} className="bg-parchment px-3 py-2 text-center">
                      <p className="text-sm text-charcoal-deep">{lang}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Active Conversations */}
          <div className="bg-white border border-sand/50">
            <div className="px-6 py-4 border-b border-sand/50 flex items-center justify-between">
              <h2 className="font-medium text-charcoal-deep">Conversations</h2>
              <span className="text-xs text-stone">{activeConversations} active</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sand/30">
                    <th className="text-left px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Visitor</th>
                    <th className="text-left px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Topic</th>
                    <th className="text-left px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Status</th>
                    <th className="text-left px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Sentiment</th>
                    <th className="text-left px-6 py-3 text-[10px] tracking-[0.1em] uppercase text-stone font-medium">Started</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/30">
                  {config.conversations.map(conv => (
                    <tr key={conv.id} className="hover:bg-parchment/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-charcoal-deep">{conv.visitorId}</td>
                      <td className="px-6 py-4 text-sm text-stone">{conv.topic}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${statusColor(conv.status)}`}>
                          {conv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${sentimentColor(conv.sentiment)}`}>
                          {conv.sentiment}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-taupe">{conv.startedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </IntelligencePageWrapper>
  );
}
