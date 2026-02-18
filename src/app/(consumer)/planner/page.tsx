'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Plus, Sparkles, X } from 'lucide-react';
import Image from 'next/image';
import * as productService from '@/services/product.service';
import { Product } from '@/types';

interface DayPlan {
  date: string;
  outfits: {
    occasion: string;
    products: Product[];
  }[];
}

const occasions = [
  { id: 'morning', label: 'Morning', icon: '☀️' },
  { id: 'work', label: 'Work', icon: '💼' },
  { id: 'evening', label: 'Evening', icon: '🌙' },
  { id: 'special', label: 'Special Event', icon: '✨' }
];

const STORAGE_KEY = 'moda-weekly-planner';

// Serialize plan for storage (store product IDs only to save space)
interface StoredDayPlan {
  date: string;
  outfits: {
    occasion: string;
    productIds: string[];
  }[];
}

function savePlanToStorage(weekPlan: DayPlan[]) {
  if (typeof window === 'undefined') return;
  const storable: StoredDayPlan[] = weekPlan.map(day => ({
    date: day.date,
    outfits: day.outfits.map(outfit => ({
      occasion: outfit.occasion,
      productIds: outfit.products.map(p => p.id)
    }))
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storable));
}

function loadPlanFromStorage(): StoredDayPlan[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export default function PlannerPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(today.setDate(diff));
  });

  const [weekPlan, setWeekPlan] = useState<DayPlan[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showProductPicker, setShowProductPicker] = useState<{ dayIndex: number; occasionIndex: number } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load products from service
  useEffect(() => {
    productService.getAllProducts().then(response => {
      if (response.success) {
        setAllProducts(response.data);
      }
    }).catch(console.error);
  }, []);

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  // Initialize week plan — try to restore from storage first
  useEffect(() => {
    const weekKey = currentWeekStart.toISOString();
    const stored = loadPlanFromStorage();

    if (stored && stored.length > 0 && stored[0].date) {
      // Check if stored plan matches current week
      const storedFirstDate = new Date(stored[0].date).toDateString();
      const currentFirstDate = weekDays[0].toDateString();

      if (storedFirstDate === currentFirstDate && allProducts.length > 0) {
        // Restore plan with full product objects
        const restoredPlan: DayPlan[] = stored.map(storedDay => ({
          date: storedDay.date,
          outfits: storedDay.outfits.map(outfit => ({
            occasion: outfit.occasion,
            products: outfit.productIds
              .map(id => allProducts.find(p => p.id === id))
              .filter((p): p is Product => p !== undefined)
          }))
        }));
        setWeekPlan(restoredPlan);
        setIsHydrated(true);
        return;
      }
    }

    // Initialize fresh plan
    const plan = weekDays.map(date => ({
      date: date.toISOString(),
      outfits: occasions.slice(0, 2).map(occ => ({
        occasion: occ.id,
        products: []
      }))
    }));
    setWeekPlan(plan);
    setIsHydrated(true);
  }, [currentWeekStart, allProducts.length]);

  // Persist plan changes to localStorage
  useEffect(() => {
    if (isHydrated && weekPlan.length > 0) {
      savePlanToStorage(weekPlan);
    }
  }, [weekPlan, isHydrated]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newStart);
  };

  const addProductToSlot = (dayIndex: number, occasionIndex: number, product: Product) => {
    setWeekPlan(prev => {
      const updated = prev.map((day, di) => {
        if (di !== dayIndex) return day;
        return {
          ...day,
          outfits: day.outfits.map((outfit, oi) => {
            if (oi !== occasionIndex) return outfit;
            if (outfit.products.find(p => p.id === product.id)) return outfit;
            return { ...outfit, products: [...outfit.products, product] };
          })
        };
      });
      return updated;
    });
    setShowProductPicker(null);
  };

  const removeProductFromSlot = (dayIndex: number, occasionIndex: number, productId: string) => {
    setWeekPlan(prev => {
      const updated = prev.map((day, di) => {
        if (di !== dayIndex) return day;
        return {
          ...day,
          outfits: day.outfits.map((outfit, oi) => {
            if (oi !== occasionIndex) return outfit;
            return { ...outfit, products: outfit.products.filter(p => p.id !== productId) };
          })
        };
      });
      return updated;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatWeekRange = () => {
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return `${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="min-h-screen bg-ivory-cream">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-stone/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold-soft/10 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gold-soft" />
              </div>
              <div>
                <h1 className="font-display text-xl text-charcoal-deep">Multi-Day Planner</h1>
                <p className="text-xs text-stone/60">Plan outfits for your week</p>
              </div>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 hover:bg-stone/10 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-charcoal-deep" />
              </button>
              <span className="text-sm font-medium text-charcoal-deep min-w-[200px] text-center">
                {formatWeekRange()}
              </span>
              <button
                onClick={() => navigateWeek('next')}
                className="p-2 hover:bg-stone/10 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-charcoal-deep" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Week Grid */}
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-7 gap-4 min-w-[900px]">
            {weekDays.map((date, dayIndex) => {
              const dayPlan = weekPlan[dayIndex];
              return (
                <motion.div
                  key={date.toISOString()}
                  className={`bg-white rounded-xl border ${isToday(date) ? 'border-gold-soft shadow-lg' : 'border-stone/20'} overflow-hidden`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: dayIndex * 0.05 }}
                >
                  {/* Day Header */}
                  <div className={`px-3 py-2 text-center ${isToday(date) ? 'bg-gold-soft/10' : 'bg-stone/5'}`}>
                    <p className="text-xs text-stone/60">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className={`text-lg font-display ${isToday(date) ? 'text-gold-soft' : 'text-charcoal-deep'}`}>
                      {date.getDate()}
                    </p>
                  </div>

                  {/* Outfit Slots */}
                  <div className="p-2 space-y-2">
                    {dayPlan?.outfits.map((outfit, occasionIndex) => {
                      const occasion = occasions.find(o => o.id === outfit.occasion);
                      return (
                        <div
                          key={occasion?.id}
                          className="min-h-[100px] bg-stone/5 rounded-lg p-2"
                        >
                          <p className="text-[10px] text-stone/50 mb-2 flex items-center gap-1">
                            <span>{occasion?.icon}</span>
                            {occasion?.label}
                          </p>

                          {/* Products in slot */}
                          <div className="space-y-1">
                            {outfit.products.map((product) => (
                              <div
                                key={product.id}
                                className="flex items-center gap-2 bg-white rounded p-1.5 group"
                              >
                                <div className="w-8 h-8 rounded overflow-hidden relative flex-shrink-0">
                                  <Image
                                    src={product.images[0]?.url || ''}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <p className="text-[10px] text-charcoal-deep line-clamp-1 flex-1">
                                  {product.name}
                                </p>
                                <button
                                  onClick={() => removeProductFromSlot(dayIndex, occasionIndex, product.id)}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-50 rounded transition-all"
                                >
                                  <X className="w-3 h-3 text-red-500" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Add Product Button */}
                          <button
                            onClick={() => setShowProductPicker({ dayIndex, occasionIndex })}
                            className="w-full mt-2 py-1.5 border border-dashed border-stone/30 rounded text-xs text-stone/50 hover:border-gold-soft hover:text-gold-soft transition-colors flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Add
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* AI Suggestions */}
        <motion.div
          className="mt-8 bg-gradient-to-r from-sapphire-deep/5 to-gold-soft/5 rounded-xl p-6 border border-stone/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-sapphire-deep to-gold-soft rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg text-charcoal-deep mb-2">AI Style Suggestions</h3>
              <p className="text-sm text-stone/70 mb-4">
                Based on your wardrobe and upcoming events, here are some outfit combinations that would work well for your week.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {allProducts.slice(0, 4).map((product) => (
                  <div key={product.id} className="bg-white rounded-lg p-3 border border-stone/10">
                    <div className="aspect-square bg-stone/5 rounded overflow-hidden relative mb-2">
                      <Image
                        src={product.images[0]?.url || ''}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-xs text-charcoal-deep line-clamp-1">{product.name}</p>
                    <p className="text-[10px] text-stone/50">{product.brandName}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Product Picker Modal */}
      {showProductPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-charcoal-deep/50 backdrop-blur-sm"
            onClick={() => setShowProductPicker(null)}
          />
          <motion.div
            className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="sticky top-0 bg-white border-b border-stone/10 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-display text-charcoal-deep">Add to Outfit</h2>
              <button
                onClick={() => setShowProductPicker(null)}
                className="p-2 hover:bg-stone/10 rounded-full"
              >
                <X className="w-5 h-5 text-stone/60" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="grid grid-cols-3 gap-4">
                {allProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addProductToSlot(showProductPicker.dayIndex, showProductPicker.occasionIndex, product)}
                    className="text-left group"
                  >
                    <div className="aspect-square bg-stone/5 rounded-lg overflow-hidden relative mb-2 group-hover:ring-2 ring-gold-soft transition-all">
                      <Image
                        src={product.images[0]?.url || ''}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-charcoal-deep line-clamp-1">{product.name}</p>
                    <p className="text-xs text-stone/50">{product.brandName}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
