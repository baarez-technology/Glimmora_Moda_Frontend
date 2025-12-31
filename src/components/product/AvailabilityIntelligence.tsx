'use client';

import { useState } from 'react';
import { MapPin, Globe, RefreshCw, Bell, ChevronDown, Check, X, Clock, Sparkles, Truck } from 'lucide-react';
import type { AvailabilityIntelligence as AvailabilityIntelligenceType } from '@/types';

interface AvailabilityIntelligenceProps {
  availability: AvailabilityIntelligenceType;
  onNotifyRestock?: () => void;
}

export default function AvailabilityIntelligence({ availability, onNotifyRestock }: AvailabilityIntelligenceProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-success bg-success/10';
      case 'limited': return 'text-gold-deep bg-gold-muted/20';
      case 'unavailable': return 'text-error bg-error/10';
      default: return 'text-stone bg-sand';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'In Stock';
      case 'limited': return 'Limited Stock';
      case 'unavailable': return 'Currently Unavailable';
      default: return status;
    }
  };

  const geographyAlternatives = availability.alternatives.filter(a => a.type === 'geography');
  const equivalentAlternatives = availability.alternatives.filter(a => a.type === 'equivalent');
  const restockAlternatives = availability.alternatives.filter(a => a.type === 'restock');

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-parchment/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold-muted/20 rounded-full flex items-center justify-center">
            <Globe size={20} className="text-gold-deep" />
          </div>
          <div className="text-left">
            <p className="font-medium text-charcoal-deep">G-SAIL™ Intelligence</p>
            <p className="text-sm text-stone">Global availability & alternatives</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(availability.currentStatus)}`}>
            {getStatusLabel(availability.currentStatus)}
          </span>
          <ChevronDown
            size={20}
            className={`text-greige transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-sand pt-4">
          {/* Local Confidence */}
          <div className="flex items-center justify-between p-3 bg-parchment rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-stone" />
              <span className="text-sm text-stone">Local Availability Confidence</span>
            </div>
            <span className={`font-medium ${availability.localConfidence >= 80 ? 'text-success' : 'text-gold-deep'}`}>
              {availability.localConfidence}%
            </span>
          </div>

          {/* Geography Alternatives */}
          {geographyAlternatives.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={16} className="text-stone" />
                <p className="text-sm font-medium text-charcoal-deep">Available in Other Regions</p>
              </div>
              <div className="space-y-2">
                {geographyAlternatives.map((alt, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedAlternative === `geo-${index}`
                        ? 'border-gold-muted bg-gold-muted/10'
                        : 'border-sand hover:border-gold-muted/50'
                    }`}
                    onClick={() => setSelectedAlternative(selectedAlternative === `geo-${index}` ? null : `geo-${index}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-charcoal-deep">{alt.city}, {alt.region}</p>
                        <p className="text-sm text-stone">{alt.availabilityConfidence}% confidence</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-stone">
                          <Truck size={14} />
                          {alt.deliveryDays} days delivery
                        </div>
                        {alt.priceDifference && alt.priceDifference !== 0 && (
                          <p className={`text-sm ${alt.priceDifference > 0 ? 'text-error-soft' : 'text-success'}`}>
                            {alt.priceDifference > 0 ? '+' : ''}€{alt.priceDifference}
                          </p>
                        )}
                      </div>
                    </div>
                    {selectedAlternative === `geo-${index}` && (
                      <p className="text-sm text-stone mt-2 pt-2 border-t border-sand">{alt.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Equivalent Alternatives */}
          {equivalentAlternatives.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw size={16} className="text-stone" />
                <p className="text-sm font-medium text-charcoal-deep">Similar Alternatives</p>
              </div>
              <div className="space-y-2">
                {equivalentAlternatives.map((alt, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedAlternative === `equiv-${index}`
                        ? 'border-sapphire-subtle bg-sapphire-deep/5'
                        : 'border-sand hover:border-sapphire-subtle/50'
                    }`}
                    onClick={() => setSelectedAlternative(selectedAlternative === `equiv-${index}` ? null : `equiv-${index}`)}
                  >
                    {alt.product && (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-charcoal-deep">{alt.product.name}</p>
                          <p className="text-sm text-stone">{alt.product.brandName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-charcoal-deep">€{alt.product.price.toLocaleString()}</p>
                          <p className="text-sm text-success">{alt.availabilityConfidence}% available</p>
                        </div>
                      </div>
                    )}
                    {selectedAlternative === `equiv-${index}` && (
                      <p className="text-sm text-stone mt-2 pt-2 border-t border-sand">{alt.reason}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Restock Prediction */}
          {availability.restockPrediction && (
            <div className="mb-4 p-3 bg-parchment rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-stone" />
                  <span className="text-sm text-stone">Restock Prediction</span>
                </div>
                <span className="text-sm font-medium text-charcoal-deep">
                  ~{new Date(availability.restockPrediction.estimatedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-xs text-greige mt-1">
                {availability.restockPrediction.probability}% probability based on historical data
              </p>
            </div>
          )}

          {/* Concierge Option */}
          {availability.conciergeOption && (
            <div className="p-3 bg-sapphire-deep/5 rounded-lg border border-sapphire-subtle/20 mb-4">
              <div className="flex items-start gap-2">
                <Sparkles size={16} className="text-sapphire-subtle mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-charcoal-deep">Concierge Available</p>
                  <p className="text-sm text-stone">
                    Our team can personally source this item for you. Additional handling time may apply.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notify Button */}
          {availability.currentStatus === 'unavailable' && (
            <button
              onClick={onNotifyRestock}
              className="w-full py-3 px-4 bg-charcoal-deep text-ivory-cream rounded-lg flex items-center justify-center gap-2 hover:bg-noir transition-colors"
            >
              <Bell size={16} />
              Notify Me When Available
            </button>
          )}
        </div>
      )}
    </div>
  );
}
