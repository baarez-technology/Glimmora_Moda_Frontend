'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Save, Trash2, Sparkles, Calendar, TrendingUp, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Product } from '@/types';

interface OutfitSlot {
  id: string;
  category: string;
  product: Product | null;
  label: string;
}

export default function OutfitBuilderPage() {
  const { wardrobe, saveOutfit, showToast, calendarEvents } = useApp();
  const [outfitName, setOutfitName] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string | undefined>();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  // Outfit slots for drag-and-drop
  const [outfitSlots, setOutfitSlots] = useState<OutfitSlot[]>([
    { id: 'top', category: 'clothing', product: null, label: 'Top' },
    { id: 'bottom', category: 'clothing', product: null, label: 'Bottom' },
    { id: 'outerwear', category: 'clothing', product: null, label: 'Outerwear' },
    { id: 'bag', category: 'bags', product: null, label: 'Bag' },
    { id: 'shoes', category: 'accessories', product: null, label: 'Shoes' },
    { id: 'accessory', category: 'accessories', product: null, label: 'Accessory' }
  ]);

  const addProductToSlot = (slotId: string, product: Product) => {
    setOutfitSlots(prev => prev.map(slot =>
      slot.id === slotId ? { ...slot, product } : slot
    ));
    setShowProductPicker(false);
    setActiveSlot(null);
  };

  const removeProductFromSlot = (slotId: string) => {
    setOutfitSlots(prev => prev.map(slot =>
      slot.id === slotId ? { ...slot, product: null } : slot
    ));
  };

  const openProductPicker = (slotId: string) => {
    setActiveSlot(slotId);
    setShowProductPicker(true);
  };

  const handleSaveOutfit = () => {
    const products = outfitSlots
      .filter(slot => slot.product)
      .map(slot => slot.product!.id);

    if (products.length === 0) {
      showToast('Please add at least one item to your outfit', 'error');
      return;
    }

    if (!outfitName.trim()) {
      showToast('Please enter an outfit name', 'error');
      return;
    }

    saveOutfit(outfitName, products, selectedEvent);

    // Reset
    setOutfitName('');
    setSelectedEvent(undefined);
    setOutfitSlots(outfitSlots.map(slot => ({ ...slot, product: null })));
    setShowSaveModal(false);
    showToast('Outfit saved successfully!', 'success');
  };

  const getOutfitScore = () => {
    const filledSlots = outfitSlots.filter(slot => slot.product).length;
    const totalSlots = outfitSlots.length;

    // Calculate compatibility score based on brands, colors, styles
    let compatibilityScore = (filledSlots / totalSlots) * 100;

    const products = outfitSlots.filter(slot => slot.product).map(slot => slot.product!);
    if (products.length >= 2) {
      // Bonus for matching brands
      const brands = new Set(products.map(p => p.brandId));
      if (brands.size === 1) compatibilityScore = Math.min(100, compatibilityScore + 15);

      // Bonus for complementary tags
      const allTags = products.flatMap(p => p.tags);
      const uniqueTags = new Set(allTags);
      if (uniqueTags.size < allTags.length) compatibilityScore = Math.min(100, compatibilityScore + 10);
    }

    return Math.round(compatibilityScore);
  };

  const compatibilityScore = getOutfitScore();
  const totalPrice = outfitSlots
    .filter(slot => slot.product)
    .reduce((sum, slot) => sum + slot.product!.price, 0);

  // Filter wardrobe by category for product picker
  const getFilteredProducts = () => {
    if (!activeSlot) return [];
    const slot = outfitSlots.find(s => s.id === activeSlot);
    if (!slot) return [];

    return wardrobe.filter(item => {
      if (slot.category === 'clothing') {
        return item.product.category === 'clothing';
      }
      return item.product.category === slot.category;
    });
  };

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <div className="bg-charcoal-deep border-b border-sand/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <Link
            href="/wardrobe"
            className="inline-flex items-center gap-2 text-sm text-taupe hover:text-ivory-cream mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Wardrobe
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles size={20} className="text-gold-soft" />
                <span className="text-[10px] tracking-[0.4em] uppercase text-gold-soft/60">
                  AI-Powered Styling
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl text-ivory-cream mb-2">
                Outfit Builder
              </h1>
              <p className="text-taupe">
                Create and save complete looks from your wardrobe
              </p>
            </div>

            {outfitSlots.some(slot => slot.product) && (
              <button
                onClick={() => setShowSaveModal(true)}
                className="px-6 py-3 bg-gold-muted text-charcoal-deep hover:bg-gold-deep transition-colors flex items-center gap-2"
              >
                <Save size={18} />
                <span className="text-sm tracking-wider uppercase">Save Outfit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Outfit Canvas */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="font-display text-2xl text-charcoal-deep mb-2">Your Outfit</h2>
              <p className="text-sm text-stone">Drag items from your wardrobe or click to add</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {outfitSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="relative aspect-[3/4] border-2 border-dashed border-sand hover:border-charcoal-deep/30 transition-all group"
                >
                  {slot.product ? (
                    <>
                      <Image
                        src={slot.product.images[0]?.url || ''}
                        alt={slot.product.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-noir/0 group-hover:bg-noir/60 transition-all flex items-center justify-center">
                        <button
                          onClick={() => removeProductFromSlot(slot.id)}
                          className="opacity-0 group-hover:opacity-100 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-error hover:text-white transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-noir/80 to-transparent p-3">
                        <p className="text-xs text-white">{slot.product.brandName}</p>
                        <p className="text-xs text-white/80 line-clamp-1">{slot.product.name}</p>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => openProductPicker(slot.id)}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3 hover:bg-parchment transition-colors"
                    >
                      <Plus size={32} className="text-sand" />
                      <span className="text-sm text-stone">{slot.label}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar - Outfit Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Compatibility Score */}
            <div className="p-6 bg-white border border-sand/30">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp size={20} className="text-emerald-600" />
                <h3 className="font-display text-lg text-charcoal-deep">Compatibility</h3>
              </div>
              <div className="relative h-3 bg-sand/30 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-500 ${
                    compatibilityScore >= 80 ? 'bg-emerald-500' :
                    compatibilityScore >= 50 ? 'bg-amber-500' :
                    'bg-orange-500'
                  }`}
                  style={{ width: `${compatibilityScore}%` }}
                />
              </div>
              <p className="text-sm text-stone">
                {compatibilityScore}% - {
                  compatibilityScore >= 80 ? 'Excellent match!' :
                  compatibilityScore >= 50 ? 'Good combination' :
                  'Add more items for better harmony'
                }
              </p>
            </div>

            {/* Outfit Summary */}
            <div className="p-6 bg-white border border-sand/30">
              <h3 className="font-display text-lg text-charcoal-deep mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-stone">Items</span>
                  <span className="text-charcoal-deep font-medium">
                    {outfitSlots.filter(s => s.product).length} / {outfitSlots.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone">Total Value</span>
                  <span className="text-charcoal-deep font-medium">€{totalPrice.toLocaleString()}</span>
                </div>
                {outfitSlots.some(s => s.product) && (
                  <div className="pt-3 border-t border-sand/30">
                    <p className="text-xs text-stone mb-2">Brands</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(outfitSlots
                        .filter(s => s.product)
                        .map(s => s.product!.brandName)
                      )).map(brand => (
                        <span key={brand} className="px-2 py-1 bg-parchment text-xs text-charcoal-deep">
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Styling Tips */}
            {outfitSlots.filter(s => s.product).length >= 2 && (
              <div className="p-6 bg-gradient-to-br from-sapphire-deep/5 to-gold-muted/5 border border-sapphire-subtle/20">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-sapphire-subtle" />
                  <h3 className="text-sm tracking-wider uppercase text-charcoal-deep">Styling Tips</h3>
                </div>
                <div className="space-y-2 text-sm text-stone">
                  <p>• This combination creates a sophisticated, cohesive look</p>
                  <p>• Consider adding statement accessories for evening occasions</p>
                  <p>• The color palette works beautifully for professional settings</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Picker Modal */}
      {showProductPicker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-sand/30 px-8 py-6 flex items-center justify-between z-10">
              <h3 className="font-display text-2xl text-charcoal-deep">
                Choose from Wardrobe
              </h3>
              <button
                onClick={() => {
                  setShowProductPicker(false);
                  setActiveSlot(null);
                }}
                className="p-2 hover:bg-sand/20 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {getFilteredProducts().length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {getFilteredProducts().map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addProductToSlot(activeSlot!, item.product)}
                      className="group text-left"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-parchment mb-3">
                        <Image
                          src={item.product.images[0]?.url || ''}
                          alt={item.product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <p className="text-xs text-taupe tracking-wider uppercase">{item.product.brandName}</p>
                      <p className="text-sm text-charcoal-deep line-clamp-2">{item.product.name}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-stone mb-4">No items in your wardrobe for this category</p>
                  <Link
                    href="/discover"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors"
                  >
                    <span className="text-sm tracking-wider uppercase">Browse Products</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save Outfit Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white max-w-lg w-full">
            <div className="px-8 py-6 border-b border-sand/30">
              <h3 className="font-display text-2xl text-charcoal-deep">Save Outfit</h3>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm tracking-wider uppercase text-stone mb-2">
                  Outfit Name *
                </label>
                <input
                  type="text"
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                  placeholder="e.g. Gallery Opening Look"
                  className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm tracking-wider uppercase text-stone mb-2">
                  Link to Event (Optional)
                </label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value || undefined)}
                  className="w-full px-4 py-3 border border-sand bg-ivory-cream focus:outline-none focus:border-charcoal-deep transition-colors"
                >
                  <option value="">No event</option>
                  {calendarEvents.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} - {new Date(event.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-6 py-3 border border-sand text-charcoal-deep hover:border-charcoal-deep transition-colors"
                >
                  <span className="text-sm tracking-wider uppercase">Cancel</span>
                </button>
                <button
                  onClick={handleSaveOutfit}
                  className="flex-1 px-6 py-3 bg-charcoal-deep text-ivory-cream hover:bg-noir transition-colors"
                >
                  <span className="text-sm tracking-wider uppercase">Save Outfit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
