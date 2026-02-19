'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Plus, Sparkles, X, Sun, Briefcase, Moon } from 'lucide-react';
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

const occasionIcons: Record<string, React.ReactNode> = {
  morning: <Sun className="w-3 h-3" />,
  work: <Briefcase className="w-3 h-3" />,
  evening: <Moon className="w-3 h-3" />,
  special: <Sparkles className="w-3 h-3" />,
};

const occasions = [
  { id: 'morning', label: 'Morning' },
  { id: 'work', label: 'Work' },
  { id: 'evening', label: 'Evening' },
  { id: 'special', label: 'Special Event' }
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
  const plannerPickerCloseRef = useRef<HTMLButtonElement>(null);

  // ESC key handler for product picker modal
  useEffect(() => {
    if (!showProductPicker) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowProductPicker(null);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showProductPicker]);

  // Auto-focus close button when picker opens
  useEffect(() => {
    if (showProductPicker) plannerPickerCloseRef.current?.focus();
  }, [showProductPicker]);

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
                            {occasion && occasionIcons[occasion.id]}
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
              <h3 className="font-display text-lg text-charcoal-deep mb-2">AI Styling Tips</h3>
              {(() => {
                // Gather all products currently planned in the week
                const plannedProducts = weekPlan.flatMap(day =>
                  day.outfits.flatMap(outfit => outfit.products)
                );

                if (plannedProducts.length === 0) {
                  return (
                    <p className="text-sm text-stone/70">
                      Add items to your planner for personalized styling tips.
                    </p>
                  );
                }

                // Analyze planned products
                const brands = Array.from(new Set(plannedProducts.map(p => p.brandName)));
                const categories = Array.from(new Set(plannedProducts.map(p => p.category)));
                const allTags = plannedProducts.flatMap(p => p.tags.map(t => t.toLowerCase()));
                const tagSet = new Set(allTags);

                const tips: string[] = [];

                // Brand-based tips
                if (brands.length === 1) {
                  tips.push(`Your week features an all-${brands[0]} lineup \u2014 consider mixing in another maison for visual contrast.`);
                } else if (brands.length >= 3) {
                  tips.push(`Great variety with ${brands.length} different brands across your week for a dynamic, eclectic style.`);
                }

                // Category-based tips
                const hasClothing = categories.includes('clothing');
                const hasBags = categories.includes('bags');
                const hasShoes = categories.includes('shoes');
                const hasAccessories = categories.includes('accessories') || categories.includes('jewelry') || categories.includes('watches');

                if (hasClothing && !hasAccessories) {
                  tips.push('Consider complementing your clothing selections with accessories or jewelry for a finished look.');
                }
                if (hasClothing && !hasShoes) {
                  tips.push('Complete your planned outfits with footwear choices to round out each day.');
                }
                if (!hasBags && plannedProducts.length >= 3) {
                  tips.push('Adding a bag to your planned outfits ties the look together for on-the-go days.');
                }

                // Tag/style-based tips
                if (tagSet.has('formal') || tagSet.has('evening') || tagSet.has('black-tie')) {
                  tips.push('Formal pieces in your plan work beautifully with structured accessories and refined clutches.');
                }
                if (tagSet.has('casual') || tagSet.has('everyday') || tagSet.has('relaxed')) {
                  tips.push('Casual selections pair well with minimalist jewelry and comfortable footwear.');
                }
                if (tagSet.has('silk') || tagSet.has('satin') || tagSet.has('velvet')) {
                  tips.push('Luxe fabrics in your plan deserve careful layering \u2014 keep other pieces clean and simple.');
                }

                // Repetition tip
                const dayCount = weekPlan.filter(d => d.outfits.some(o => o.products.length > 0)).length;
                const emptyDays = 7 - dayCount;
                if (emptyDays > 0 && dayCount > 0) {
                  tips.push(`You still have ${emptyDays} day${emptyDays > 1 ? 's' : ''} unplanned \u2014 fill them in for a fully styled week.`);
                }

                // Fallback tip
                if (tips.length === 0) {
                  tips.push(`You have ${plannedProducts.length} item${plannedProducts.length > 1 ? 's' : ''} planned \u2014 try mixing textures and silhouettes for variety.`);
                }

                return (
                  <div className="space-y-3">
                    <p className="text-sm text-stone/70 mb-2">
                      Based on the {plannedProducts.length} item{plannedProducts.length !== 1 ? 's' : ''} in your weekly plan:
                    </p>
                    <ul className="space-y-2">
                      {tips.slice(0, 4).map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-stone/80">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-gold-soft flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Product Picker Modal */}
      {showProductPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="planner-picker-title">
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
              <h2 id="planner-picker-title" className="text-xl font-display text-charcoal-deep">Add to Outfit</h2>
              <button
                ref={plannerPickerCloseRef}
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
