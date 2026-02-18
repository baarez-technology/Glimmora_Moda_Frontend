'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Gift,
  Plus,
  Calendar,
  ArrowLeft,
  Share2,
  Trash2,
  Edit2,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface RegistryItem {
  id: string;
  productId: string;
  product: {
    name: string;
    brandName: string;
    price: number;
    images: { url: string }[];
  };
  priority: 'high' | 'medium' | 'low';
  quantity: number;
  purchased: number;
  purchasedBy?: string;
  notes?: string;
}

interface GiftRegistry {
  id: string;
  name: string;
  eventType: 'wedding' | 'birthday' | 'anniversary' | 'baby-shower' | 'other';
  eventDate: string;
  description?: string;
  items: RegistryItem[];
  shareLink?: string;
}

const STORAGE_KEY = 'moda-gift-registries';

function loadRegistries(): GiftRegistry[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRegistries(registries: GiftRegistry[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registries));
}

export default function GiftRegistryPage() {
  const { showToast } = useApp();
  const [giftRegistries, setGiftRegistries] = useState<GiftRegistry[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setGiftRegistries(loadRegistries());
    setIsHydrated(true);
  }, []);

  // Persist on every change (after hydration)
  useEffect(() => {
    if (isHydrated) {
      saveRegistries(giftRegistries);
    }
  }, [giftRegistries, isHydrated]);

  const createGiftRegistry = useCallback((name: string, eventType: string, eventDate: string, description?: string) => {
    const newRegistry: GiftRegistry = {
      id: `reg-${Date.now()}`,
      name,
      eventType: eventType as GiftRegistry['eventType'],
      eventDate,
      description,
      items: [],
      shareLink: `${typeof window !== 'undefined' ? window.location.origin : ''}/gift-registry/reg-${Date.now()}`
    };
    setGiftRegistries(prev => [...prev, newRegistry]);
    showToast('Gift registry created', 'success');
  }, [showToast]);

  const deleteRegistry = useCallback((registryId: string) => {
    setGiftRegistries(prev => prev.filter(r => r.id !== registryId));
    showToast('Registry deleted', 'success');
  }, [showToast]);

  const removeFromRegistry = useCallback((registryId: string, itemId: string) => {
    setGiftRegistries(prev => prev.map(r => {
      if (r.id !== registryId) return r;
      return { ...r, items: r.items.filter(i => i.id !== itemId) };
    }));
    showToast('Item removed from registry', 'success');
  }, [showToast]);

  const updateRegistryItem = useCallback((registryId: string, itemId: string, updates: Partial<RegistryItem>) => {
    setGiftRegistries(prev => prev.map(r => {
      if (r.id !== registryId) return r;
      return {
        ...r,
        items: r.items.map(i => {
          if (i.id !== itemId) return i;
          return { ...i, ...updates };
        })
      };
    }));
  }, []);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRegistry, setSelectedRegistry] = useState<GiftRegistry | null>(null);

  // Keep selectedRegistry in sync with state
  useEffect(() => {
    if (selectedRegistry) {
      const updated = giftRegistries.find(r => r.id === selectedRegistry.id);
      if (updated) {
        setSelectedRegistry(updated);
      } else {
        setSelectedRegistry(null);
      }
    }
  }, [giftRegistries, selectedRegistry?.id]);

  // Form state for creating registry
  const [formData, setFormData] = useState({
    name: '',
    eventType: 'wedding' as GiftRegistry['eventType'],
    eventDate: '',
    description: ''
  });

  const handleCreateRegistry = () => {
    if (!formData.name || !formData.eventDate) {
      return;
    }

    createGiftRegistry(
      formData.name,
      formData.eventType,
      formData.eventDate,
      formData.description || undefined
    );

    setFormData({ name: '', eventType: 'wedding', eventDate: '', description: '' });
    setShowCreateModal(false);
  };

  const handleShare = async (registry: GiftRegistry) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: registry.name,
          text: `Check out my gift registry for ${registry.name}`,
          url: registry.shareLink || ''
        });
      } catch {
        // Share cancelled
      }
    } else {
      // Fallback: copy to clipboard
      if (registry.shareLink) {
        navigator.clipboard.writeText(registry.shareLink);
        showToast('Link copied to clipboard', 'success');
      }
    }
  };

  const eventTypeLabels = {
    wedding: 'Wedding',
    birthday: 'Birthday',
    anniversary: 'Anniversary',
    'baby-shower': 'Baby Shower',
    other: 'Other'
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700'
  };

  return (
    <div className="min-h-screen bg-parchment">
      {/* Header */}
      <div className="bg-ivory-cream border-b border-sand/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-stone hover:text-charcoal-deep mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-4xl md:text-5xl text-charcoal-deep mb-2">
                Gift Registries
              </h1>
              <p className="text-stone">
                {giftRegistries.length} {giftRegistries.length === 1 ? 'registry' : 'registries'}
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-3 px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors"
            >
              <Plus size={18} />
              <span className="text-sm tracking-wider uppercase">Create Registry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        {giftRegistries.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-sand/20 rounded-full mb-6">
              <Gift size={32} className="text-stone" />
            </div>
            <h2 className="font-display text-2xl text-charcoal-deep mb-3">
              No registries yet
            </h2>
            <p className="text-stone mb-8 max-w-md mx-auto">
              Create a gift registry for your special event and share it with friends and family
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors"
            >
              <Plus size={18} />
              <span className="text-sm tracking-wider uppercase">Create First Registry</span>
            </button>
          </div>
        ) : (
          /* Registry List */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {giftRegistries.map((registry) => {
              const totalItems = registry.items.length;
              const purchasedItems = registry.items.filter(i => i.purchased > 0).length;
              const completionPercent = totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0;

              return (
                <div
                  key={registry.id}
                  className="bg-white border border-sand/30 p-6 hover:border-sand/60 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-sand/20 text-xs tracking-wider uppercase text-charcoal-deep">
                          {eventTypeLabels[registry.eventType]}
                        </span>
                      </div>
                      <h3 className="font-display text-xl text-charcoal-deep mb-1">
                        {registry.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-stone">
                        <Calendar size={14} />
                        {new Date(registry.eventDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteRegistry(registry.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded"
                      title="Delete registry"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>

                  {registry.description && (
                    <p className="text-sm text-stone mb-4 line-clamp-2">
                      {registry.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-stone mb-2">
                      <span>{purchasedItems} of {totalItems} items purchased</span>
                      <span>{Math.round(completionPercent)}%</span>
                    </div>
                    <div className="h-2 bg-sand/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 transition-all duration-500"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-sand/20">
                    <button
                      onClick={() => setSelectedRegistry(registry)}
                      className="flex-1 px-4 py-2 text-xs tracking-wider uppercase text-charcoal-deep border border-sand hover:border-charcoal-deep transition-colors"
                    >
                      <Edit2 size={12} className="inline mr-2" />
                      Manage
                    </button>
                    <button
                      onClick={() => handleShare(registry)}
                      className="px-4 py-2 text-xs tracking-wider uppercase text-charcoal-deep border border-sand hover:border-charcoal-deep transition-colors"
                      title="Share registry"
                    >
                      <Share2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Registry Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-sand/30 px-8 py-6 flex items-center justify-between">
              <h2 className="font-display text-2xl text-charcoal-deep">Create Gift Registry</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-sand/20 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Registry Name */}
              <div>
                <label className="block text-sm tracking-wider uppercase text-stone mb-2">
                  Registry Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarah & John's Wedding"
                  className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm tracking-wider uppercase text-stone mb-2">
                  Event Type
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value as GiftRegistry['eventType'] })}
                  className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                >
                  <option value="wedding">Wedding</option>
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="baby-shower">Baby Shower</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-sm tracking-wider uppercase text-stone mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm tracking-wider uppercase text-stone mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add details about your event..."
                  rows={4}
                  className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors"
                >
                  <span className="text-sm tracking-wider uppercase">Cancel</span>
                </button>
                <button
                  onClick={handleCreateRegistry}
                  disabled={!formData.name || !formData.eventDate}
                  className="flex-1 px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir disabled:bg-sand disabled:text-stone transition-colors"
                >
                  <span className="text-sm tracking-wider uppercase">Create Registry</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Registry Modal */}
      {selectedRegistry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-sand/30 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl text-charcoal-deep">{selectedRegistry.name}</h2>
                <p className="text-sm text-stone mt-1">{selectedRegistry.items.length} items</p>
              </div>
              <button
                onClick={() => setSelectedRegistry(null)}
                className="p-2 hover:bg-sand/20 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {selectedRegistry.items.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle size={40} className="text-stone mx-auto mb-4" />
                  <p className="text-stone mb-4">No items in this registry yet</p>
                  <Link
                    href="/discover"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors"
                  >
                    <span className="text-sm tracking-wider uppercase">Browse Products</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedRegistry.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 bg-ivory-cream p-4 border border-sand/30"
                    >
                      <div className="relative w-24 h-32 bg-sand-light flex-shrink-0">
                        <Image
                          src={item.product.images[0]?.url || ''}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-xs text-stone tracking-wider uppercase">
                              {item.product.brandName}
                            </p>
                            <h3 className="font-display text-lg text-charcoal-deep">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-stone">
                              &euro;{item.product.price.toLocaleString()} &times; {item.quantity}
                            </p>
                          </div>

                          <button
                            onClick={() => removeFromRegistry(selectedRegistry.id, item.id)}
                            className="p-2 hover:bg-red-50 rounded transition-colors"
                            title="Remove from registry"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3 mt-3">
                          <span className={`px-2 py-1 text-xs tracking-wider uppercase ${priorityColors[item.priority]}`}>
                            {item.priority} priority
                          </span>

                          {item.purchased > 0 ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs tracking-wider uppercase flex items-center gap-1">
                              <Check size={12} />
                              Purchased
                              {item.purchasedBy && ` by ${item.purchasedBy}`}
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                updateRegistryItem(selectedRegistry.id, item.id, {
                                  purchased: 1,
                                  purchasedBy: 'Guest'
                                })
                              }
                              className="px-3 py-1 text-xs tracking-wider uppercase border border-green-600 text-green-600 hover:bg-green-50 transition-colors"
                            >
                              Mark as Purchased
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
