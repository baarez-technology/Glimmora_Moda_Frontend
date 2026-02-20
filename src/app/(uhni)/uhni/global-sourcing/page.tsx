'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Globe, Search, MapPin, Clock, Check, Package, Crown, MessageCircle, Bell, AlertCircle, Plane, Building } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  getAvailabilitySearches,
  getGlobalNetworkStats,
  getRestockPredictions,
  placeHold,
  confirmShipment,
  enableRestockAlert
} from '@/services/uhni.service';
import type { AvailabilitySearchStatus, AvailabilitySearchPriority, UHNIAvailabilitySearch, GlobalNetworkStats, RestockPrediction } from '@/types';

export default function GlobalSourcingPage() {
  const { concierge, showToast } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'searches' | 'predictions'>('searches');
  const [searches, setSearches] = useState<UHNIAvailabilitySearch[]>([]);
  const [networkStats, setNetworkStats] = useState<GlobalNetworkStats | null>(null);
  const [predictions, setPredictions] = useState<RestockPrediction[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsDataLoading(true);
      try {
        const [searchRes, statsRes, predRes] = await Promise.all([
          getAvailabilitySearches(),
          getGlobalNetworkStats(),
          getRestockPredictions(),
        ]);
        setSearches(searchRes.data);
        setNetworkStats(statsRes.data);
        setPredictions(predRes.data);
      } catch {
        showToast('Failed to load sourcing data', 'error');
      } finally {
        setIsDataLoading(false);
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-ivory-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-charcoal-deep border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone text-sm">Loading sourcing data...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: AvailabilitySearchStatus) => {
    switch (status) {
      case 'searching':
        return { text: 'Searching', className: 'bg-gold-muted/10 text-gold-muted', icon: Search };
      case 'found':
        return { text: 'Found', className: 'bg-success/10 text-success', icon: Check };
      case 'secured':
        return { text: 'Secured', className: 'bg-gold-soft/10 text-gold-soft', icon: Package };
      case 'unavailable':
        return { text: 'Unavailable', className: 'bg-error/10 text-error', icon: AlertCircle };
      default:
        return { text: status, className: 'bg-parchment text-stone', icon: Search };
    }
  };

  const getPriorityBadge = (priority: AvailabilitySearchPriority) => {
    switch (priority) {
      case 'urgent':
        return { text: 'Urgent', className: 'bg-error/10 text-error' };
      case 'high':
        return { text: 'High Priority', className: 'bg-gold-soft/10 text-gold-soft' };
      default:
        return { text: 'Standard', className: 'bg-parchment text-stone' };
    }
  };

  const formatCurrency = (amount: number) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount)}`;
  };

  const handlePlaceHold = async (searchId: string, altId: string, city: string) => {
    try {
      await placeHold(searchId, altId);
      showToast(`Hold placed for item in ${city}. Valid for 48 hours.`, 'success');
    } catch {
      showToast('Failed to place hold', 'error');
    }
  };

  const handleConfirmShipment = async (searchId: string) => {
    try {
      await confirmShipment(searchId);
      showToast('Shipment confirmed! Your concierge will arrange delivery.', 'success');
    } catch {
      showToast('Failed to confirm shipment', 'error');
    }
  };

  const handleEnableAlert = async (productId: string, productName: string) => {
    try {
      await enableRestockAlert(productId);
      setPredictions(prev => prev.map(p => p.productId === productId ? { ...p, alertEnabled: true } : p));
      showToast(`Restock alert enabled for ${productName}`, 'success');
    } catch {
      showToast('Failed to enable alert', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep">
        <div className="max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12">
          <Link
            href="/uhni"
            className="inline-flex items-center gap-2 text-sm text-sand hover:text-ivory-cream transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className={`transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gold-soft/20 flex items-center justify-center">
                <Globe size={28} className="text-gold-soft" />
              </div>
              <div>
                <span className="text-[10px] tracking-[0.5em] uppercase text-gold-soft/70">
                  G-SAIL Enhanced
                </span>
                <h1 className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ivory-cream leading-[1] tracking-[-0.02em]">
                  Global Sourcing
                </h1>
              </div>
            </div>
            <p className="text-sand mt-4 max-w-xl">
              Priority access to our worldwide boutique network. Track availability across regions, secure holds, and predict restocks with AI-powered intelligence.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`max-w-[1200px] mx-auto px-8 md:px-16 lg:px-24 py-12 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Network Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          <div className="bg-white p-6">
            <Search size={20} className="text-gold-muted mb-3" />
            <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-1">Active Searches</p>
            <p className="font-display text-2xl text-charcoal-deep">{networkStats?.activeSearches ?? 0}</p>
          </div>
          <div className="bg-white p-6">
            <MapPin size={20} className="text-gold-soft mb-3" />
            <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-1">Regions Connected</p>
            <p className="font-display text-2xl text-charcoal-deep">{networkStats?.regionsConnected ?? 0}</p>
          </div>
          <div className="bg-white p-6">
            <Building size={20} className="text-stone mb-3" />
            <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-1">Boutique Network</p>
            <p className="font-display text-2xl text-charcoal-deep">{(networkStats?.boutiquesNetwork ?? 0).toLocaleString()}</p>
          </div>
          <div className="bg-white p-6">
            <Plane size={20} className="text-success mb-3" />
            <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-1">Avg. Delivery</p>
            <p className="font-display text-2xl text-charcoal-deep">{networkStats?.averageDeliveryDays ?? 0} days</p>
          </div>
          <div className="bg-white p-6">
            <Check size={20} className="text-success mb-3" />
            <p className="text-[10px] tracking-[0.15em] uppercase text-taupe mb-1">Success Rate</p>
            <p className="font-display text-2xl text-charcoal-deep">{networkStats?.successRate ?? 0}%</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-parchment p-1 mb-8">
          <button
            onClick={() => setActiveTab('searches')}
            className={`flex-1 px-4 py-3 text-xs tracking-[0.1em] uppercase transition-colors ${
              activeTab === 'searches'
                ? 'bg-white text-charcoal-deep'
                : 'text-stone hover:text-charcoal-deep'
            }`}
          >
            Availability Searches ({searches.length})
          </button>
          <button
            onClick={() => setActiveTab('predictions')}
            className={`flex-1 px-4 py-3 text-xs tracking-[0.1em] uppercase transition-colors ${
              activeTab === 'predictions'
                ? 'bg-white text-charcoal-deep'
                : 'text-stone hover:text-charcoal-deep'
            }`}
          >
            Restock Predictions ({predictions.length})
          </button>
        </div>

        {/* Searches Tab */}
        {activeTab === 'searches' && (
          <div className="space-y-6">
            {searches.map((search) => {
              const status = getStatusBadge(search.status);
              const priority = getPriorityBadge(search.priority);
              const StatusIcon = status.icon;

              return (
                <div key={search.id} className="bg-white">
                  {/* Search Header */}
                  <div className="p-6 border-b border-sand">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="relative w-full md:w-28 h-28 flex-shrink-0">
                        <Image
                          src={search.productImage}
                          alt={search.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <span className="text-xs text-taupe">{search.brandName}</span>
                            <h3 className="font-display text-lg text-charcoal-deep">{search.productName}</h3>
                          </div>
                          <div className="flex gap-2">
                            <div className={`px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase ${priority.className}`}>
                              {priority.text}
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 ${status.className}`}>
                              <StatusIcon size={12} />
                              <span className="text-[10px] tracking-[0.1em] uppercase">{status.text}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-stone">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} />
                            Started {new Date(search.createdAt).toLocaleDateString()}
                          </div>
                          {search.conciergeAssigned && (
                            <div className="flex items-center gap-1.5 text-gold-soft">
                              <Crown size={12} />
                              Concierge Assigned
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alternatives */}
                  {search.alternatives.length > 0 && (
                    <div className="p-6">
                      <h4 className="text-[10px] tracking-[0.2em] uppercase text-taupe mb-4">
                        Available Options ({search.alternatives.length})
                      </h4>
                      <div className="space-y-4">
                        {search.alternatives.map((alt) => (
                          <div key={alt.id} className="bg-parchment p-4">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <MapPin size={14} className="text-gold-soft" />
                                  <span className="font-medium text-charcoal-deep">
                                    {alt.city}, {alt.region}
                                  </span>
                                  {alt.boutiqueName && (
                                    <span className="text-xs text-stone">• {alt.boutiqueName}</span>
                                  )}
                                </div>
                                <p className="text-sm text-stone mb-3">{alt.reason}</p>

                                <div className="flex flex-wrap gap-4 text-xs">
                                  <div>
                                    <span className="text-taupe">Confidence:</span>
                                    <span className={`ml-1 ${alt.availabilityConfidence >= 90 ? 'text-success' : 'text-gold-muted'}`}>
                                      {alt.availabilityConfidence}%
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-taupe">Delivery:</span>
                                    <span className="ml-1 text-charcoal-deep">{alt.deliveryDays} days</span>
                                  </div>
                                  <div>
                                    <span className="text-taupe">Price Diff:</span>
                                    <span className={`ml-1 ${alt.priceDifference <= 0 ? 'text-success' : 'text-gold-muted'}`}>
                                      {formatCurrency(alt.priceDifference)}
                                    </span>
                                  </div>
                                </div>

                                {alt.conciergeNote && (
                                  <div className="mt-3 pt-3 border-t border-sand/50">
                                    <span className="text-[10px] tracking-[0.1em] uppercase text-gold-soft block mb-1">
                                      Concierge Note
                                    </span>
                                    <p className="text-sm text-charcoal-deep">{alt.conciergeNote}</p>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-2">
                                {alt.holdAvailable && search.status === 'found' && (
                                  <button
                                    onClick={() => handlePlaceHold(search.id, alt.id, alt.city)}
                                    className="px-4 py-2 bg-charcoal-deep text-ivory-cream text-xs tracking-[0.1em] uppercase hover:bg-noir transition-colors"
                                  >
                                    Place Hold
                                  </button>
                                )}
                                {search.status === 'secured' && (
                                  <button
                                    onClick={() => handleConfirmShipment(search.id)}
                                    className="px-4 py-2 bg-gold-soft text-noir text-xs tracking-[0.1em] uppercase hover:bg-gold-muted transition-colors"
                                  >
                                    Confirm Shipment
                                  </button>
                                )}
                                {alt.holdExpiresAt && (
                                  <span className="text-[10px] text-taupe text-center">
                                    Hold until {new Date(alt.holdExpiresAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {search.status === 'searching' && search.alternatives.length === 0 && (
                    <div className="p-6 text-center">
                      <div className="w-8 h-8 border-2 border-gold-muted border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-stone">Searching our global network...</p>
                      <p className="text-xs text-taupe mt-1">Your concierge will notify you when options are found.</p>
                    </div>
                  )}
                </div>
              );
            })}

            {searches.length === 0 && (
              <div className="text-center py-16 bg-white">
                <Search size={32} className="text-taupe mx-auto mb-4" />
                <p className="text-stone mb-4">No active searches.</p>
                <p className="text-xs text-taupe">Contact your concierge to start a global search.</p>
              </div>
            )}
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div key={prediction.productId} className="bg-white p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative w-full md:w-24 h-24 flex-shrink-0">
                    <Image
                      src={prediction.productImage}
                      alt={prediction.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <span className="text-xs text-taupe">{prediction.brandName}</span>
                        <h3 className="font-display text-lg text-charcoal-deep">{prediction.productName}</h3>
                      </div>
                      <div className={`px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase ${
                        prediction.alertEnabled ? 'bg-success/10 text-success' : 'bg-parchment text-stone'
                      }`}>
                        {prediction.alertEnabled ? 'Alert Active' : 'No Alert'}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6 mb-4">
                      <div>
                        <span className="text-[10px] tracking-[0.1em] uppercase text-taupe block">Estimated Restock</span>
                        <span className="text-charcoal-deep font-medium">
                          {new Date(prediction.estimatedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] tracking-[0.1em] uppercase text-taupe block">Probability</span>
                        <span className={`font-medium ${prediction.probability >= 80 ? 'text-success' : 'text-gold-muted'}`}>
                          {prediction.probability}%
                        </span>
                      </div>
                    </div>

                    {!prediction.alertEnabled && (
                      <button
                        onClick={() => handleEnableAlert(prediction.productId, prediction.productName)}
                        className="flex items-center gap-2 px-4 py-2 border border-charcoal-deep text-charcoal-deep text-xs tracking-[0.1em] uppercase hover:bg-charcoal-deep hover:text-ivory-cream transition-colors"
                      >
                        <Bell size={14} />
                        Enable Restock Alert
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {predictions.length === 0 && (
              <div className="text-center py-16 bg-white">
                <Bell size={32} className="text-taupe mx-auto mb-4" />
                <p className="text-stone">No restock predictions available.</p>
              </div>
            )}
          </div>
        )}

        {/* Concierge Escalation CTA */}
        {concierge && (
          <div className="mt-12 bg-charcoal-deep p-8">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-gold-soft/20 flex items-center justify-center flex-shrink-0">
                <Crown size={24} className="text-gold-soft" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl text-ivory-cream mb-2">
                  Concierge Sourcing Escalation
                </h3>
                <p className="text-sand text-sm mb-6">
                  Can't find what you're looking for? {concierge.name} can leverage personal relationships with brand representatives, access private allocations, and arrange boutique-to-boutique transfers for rare items.
                </p>
                <Link
                  href="/uhni/concierge"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-soft/10 text-gold-soft text-xs tracking-[0.15em] uppercase hover:bg-gold-soft/20 transition-colors"
                >
                  <MessageCircle size={14} />
                  Escalate to Concierge
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
