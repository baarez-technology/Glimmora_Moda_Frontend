'use client';

import { useState } from 'react';
import { AlertTriangle, Search, MapPin, DollarSign } from 'lucide-react';
import IntelligencePageWrapper from '@/components/brand/IntelligencePageWrapper';
import { formatPrice } from '@/lib/currency';

interface GreyMarketAlert {
  id: string;
  productName: string;
  marketplace: string;
  region: string;
  originalPrice: number;
  greyMarketPrice: number;
  currency: string;
  riskLevel: 'high' | 'medium' | 'low';
  detectionDate: string;
  productSku: string;
}

const mockAlerts: GreyMarketAlert[] = [
  {
    id: 'gm-001',
    productName: 'Aria Silk Evening Gown',
    marketplace: 'DHgate',
    region: 'Southeast Asia',
    originalPrice: 4200,
    greyMarketPrice: 890,
    currency: 'EUR',
    riskLevel: 'high',
    detectionDate: '2026-03-14',
    productSku: 'ARIA-SLK-001',
  },
  {
    id: 'gm-002',
    productName: 'Heritage Monogram Clutch',
    marketplace: 'AliExpress',
    region: 'Middle East',
    originalPrice: 1850,
    greyMarketPrice: 420,
    currency: 'EUR',
    riskLevel: 'high',
    detectionDate: '2026-03-12',
    productSku: 'HRT-MNG-042',
  },
  {
    id: 'gm-003',
    productName: 'Couture Embroidered Blazer',
    marketplace: 'Wish',
    region: 'Eastern Europe',
    originalPrice: 3600,
    greyMarketPrice: 1100,
    currency: 'EUR',
    riskLevel: 'medium',
    detectionDate: '2026-03-10',
    productSku: 'CTR-EMB-117',
  },
  {
    id: 'gm-004',
    productName: 'Signature Cashmere Scarf',
    marketplace: 'Taobao',
    region: 'China',
    originalPrice: 980,
    greyMarketPrice: 310,
    currency: 'EUR',
    riskLevel: 'medium',
    detectionDate: '2026-03-09',
    productSku: 'SIG-CSH-088',
  },
  {
    id: 'gm-005',
    productName: 'Limited Edition Sunglasses',
    marketplace: 'eBay',
    region: 'North America',
    originalPrice: 720,
    greyMarketPrice: 480,
    currency: 'EUR',
    riskLevel: 'low',
    detectionDate: '2026-03-08',
    productSku: 'LTD-SNG-203',
  },
  {
    id: 'gm-006',
    productName: 'Artisan Leather Tote',
    marketplace: 'Mercado Libre',
    region: 'Latin America',
    originalPrice: 2400,
    greyMarketPrice: 650,
    currency: 'EUR',
    riskLevel: 'high',
    detectionDate: '2026-03-07',
    productSku: 'ART-LTH-055',
  },
];

const getRiskBadge = (level: GreyMarketAlert['riskLevel']) => {
  switch (level) {
    case 'high':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-700 border-green-200';
  }
};

export default function GreyMarketPage() {
  const [alerts] = useState<GreyMarketAlert[]>(mockAlerts);

  const totalMonitored = 284;
  const activeAlerts = alerts.length;
  const marketsScanned = 47;
  const avgRiskScore = 72;

  return (
    <IntelligencePageWrapper
      title="Grey-Market Leakage Detection"
      subtitle="Detect design imitation risk across physical, digital, and AI-generated fashion ecosystems. Identify visual and structural design similarities."
      acronym="GMLD™"
    >
      <div className="p-8 space-y-8">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Total Monitored Products</p>
            <p className="font-display text-2xl text-charcoal-deep">{totalMonitored}</p>
          </div>
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Active Leakage Alerts</p>
            <p className="font-display text-2xl text-red-600">{activeAlerts}</p>
          </div>
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Markets Scanned</p>
            <p className="font-display text-2xl text-charcoal-deep">{marketsScanned}</p>
          </div>
          <div className="bg-white border border-sand/50 p-6">
            <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Avg Risk Score</p>
            <p className="font-display text-2xl text-charcoal-deep">{avgRiskScore}/100</p>
          </div>
        </div>

        {/* Alert Cards */}
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle size={48} className="mx-auto text-taupe/40 mb-4" />
            <p className="text-stone">No grey-market alerts detected</p>
            <p className="text-xs text-taupe mt-1">Alerts will appear here when potential leakage is found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map(alert => (
              <div key={alert.id} className="bg-white border border-sand/50 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle size={18} className="text-stone" />
                      <h3 className="font-display text-lg text-charcoal-deep">{alert.productName}</h3>
                      <span className={`px-3 py-0.5 text-[10px] tracking-[0.15em] uppercase border ${getRiskBadge(alert.riskLevel)}`}>
                        {alert.riskLevel}
                      </span>
                    </div>
                    <p className="text-xs text-stone">
                      SKU: {alert.productSku} &middot; Detected: {new Date(alert.detectionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="inline-flex items-center gap-1 px-4 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-wider uppercase hover:bg-noir transition-colors">
                    <Search size={12} />
                    Investigate
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Found On</p>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-stone" />
                      <p className="text-sm text-charcoal-deep">{alert.marketplace}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Region</p>
                    <p className="text-sm text-charcoal-deep">{alert.region}</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Original Price</p>
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} className="text-stone" />
                      <p className="text-sm text-charcoal-deep">{formatPrice(alert.originalPrice, alert.currency)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-stone mb-1">Grey-Market Price</p>
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} className="text-error" />
                      <p className="text-sm text-error font-medium">{formatPrice(alert.greyMarketPrice, alert.currency)}</p>
                    </div>
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
