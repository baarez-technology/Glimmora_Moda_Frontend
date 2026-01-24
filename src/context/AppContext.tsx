'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Product, ConsiderationItem, WardrobeItem, CalendarEvent, UserTier, PersonalConcierge, AutonomousShoppingSettings, SourcingRequest, BespokeOrder, AutonomousActivity } from '@/types';
import { mockCalendarEvents } from '@/data/mock-data';

// Import focused hooks
import {
  useToasts,
  useConsiderations,
  useWardrobeState,
  useSavedOutfits,
  useRestockAlerts,
  useOrders,
  useUHNIFeatures,
  type Toast,
  type SavedOutfit,
  type RestockAlert,
  type OrderRecord
} from './hooks';

// Re-export types for backwards compatibility
export type { Toast, SavedOutfit, RestockAlert, OrderRecord };

interface AppContextType {
  // Considerations (Cart)
  considerations: ConsiderationItem[];
  addToConsiderations: (product: Product, variants?: { size?: string; color?: string }, agiNote?: string) => void;
  removeFromConsiderations: (id: string) => void;
  clearConsiderations: () => void;
  isInConsiderations: (productId: string) => boolean;

  // Wardrobe
  wardrobe: WardrobeItem[];
  addToWardrobe: (product: Product) => void;
  removeFromWardrobe: (id: string) => void;
  isInWardrobe: (productId: string) => boolean;

  // Wishlist (TODO: Implement full wishlist functionality)
  wishlist: WardrobeItem[];
  removeFromWishlist: (id: string) => void;

  // Saved Outfits
  savedOutfits: SavedOutfit[];
  saveOutfit: (name: string, productIds: string[], eventId?: string) => void;
  removeOutfit: (id: string) => void;

  // Restock Alerts
  restockAlerts: RestockAlert[];
  addRestockAlert: (product: Product, size?: string, color?: string) => void;
  removeRestockAlert: (id: string) => void;
  hasRestockAlert: (productId: string) => boolean;

  // Calendar Events
  calendarEvents: CalendarEvent[];

  // Toast Notifications
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  // Order History
  orders: OrderRecord[];
  addOrder: (items: ConsiderationItem[], total: number) => string;

  // UHNI Features
  userTier: UserTier;
  isUHNI: boolean;
  isHydrated: boolean;
  concierge: PersonalConcierge | null;
  autonomousSettings: AutonomousShoppingSettings | null;
  sourcingRequests: SourcingRequest[];
  bespokeOrders: BespokeOrder[];
  autonomousActivity: AutonomousActivity[];
  updateAutonomousSettings: (settings: Partial<AutonomousShoppingSettings>) => void;
  setUserRole: (tier: UserTier) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [calendarEvents] = useState<CalendarEvent[]>(mockCalendarEvents);

  // Wishlist state (TODO: Move to dedicated hook)
  const [wishlist, setWishlist] = useState<WardrobeItem[]>([]);

  // Toast notifications
  const { toasts, showToast, dismissToast } = useToasts();

  // Safe localStorage save helper
  const safeLocalStorageSave = useCallback((key: string, value: unknown) => {
    if (!isHydrated) return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);

      if (error instanceof Error && error.name === 'QuotaExceededError') {
        showToast('Storage limit reached. Please clear some data.', 'error');
      } else {
        showToast('Failed to save data. Please try again.', 'error');
      }
    }
  }, [isHydrated, showToast]);

  // Domain-specific hooks
  const {
    considerations,
    setConsiderations,
    addToConsiderations,
    removeFromConsiderations,
    clearConsiderations,
    isInConsiderations,
    persistConsiderations
  } = useConsiderations({ showToast, safeLocalStorageSave });

  const {
    wardrobe,
    setWardrobe,
    initializeWardrobe,
    addToWardrobe,
    removeFromWardrobe,
    isInWardrobe,
    persistWardrobe
  } = useWardrobeState({ showToast, safeLocalStorageSave });

  const {
    savedOutfits,
    setSavedOutfits,
    saveOutfit,
    removeOutfit,
    persistOutfits
  } = useSavedOutfits({ showToast, safeLocalStorageSave });

  const {
    restockAlerts,
    setRestockAlerts,
    addRestockAlert,
    removeRestockAlert,
    hasRestockAlert,
    persistAlerts
  } = useRestockAlerts({ showToast, safeLocalStorageSave });

  const {
    orders,
    setOrders,
    addOrder,
    persistOrders
  } = useOrders({ safeLocalStorageSave });

  const {
    userTier,
    isUHNI,
    concierge,
    autonomousSettings,
    sourcingRequests,
    bespokeOrders,
    autonomousActivity,
    setUserRole,
    updateAutonomousSettings,
    logout
  } = useUHNIFeatures({ showToast });

  // Wishlist functions (TODO: Move to dedicated hook)
  const removeFromWishlist = useCallback((id: string) => {
    setWishlist(prev => prev.filter(w => w.id !== id));
    showToast('Removed from wishlist', 'info');
  }, [showToast]);

  // Load from localStorage on mount
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const storedConsiderations = localStorage.getItem('moda-considerations');
        const storedWardrobe = localStorage.getItem('moda-wardrobe');
        const storedOutfits = localStorage.getItem('moda-outfits');
        const storedAlerts = localStorage.getItem('moda-restock-alerts');
        const storedOrders = localStorage.getItem('moda-orders');

        if (storedConsiderations) {
          setConsiderations(JSON.parse(storedConsiderations));
        }

        initializeWardrobe(storedWardrobe);

        if (storedOutfits) {
          setSavedOutfits(JSON.parse(storedOutfits));
        }
        if (storedAlerts) {
          setRestockAlerts(JSON.parse(storedAlerts));
        }
        if (storedOrders) {
          setOrders(JSON.parse(storedOrders));
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
      setIsHydrated(true);
    };

    loadFromStorage();
  }, [setConsiderations, initializeWardrobe, setSavedOutfits, setRestockAlerts, setOrders]);

  // Persist state changes to localStorage
  useEffect(() => {
    persistConsiderations(considerations);
  }, [considerations, persistConsiderations]);

  useEffect(() => {
    persistWardrobe(wardrobe);
  }, [wardrobe, persistWardrobe]);

  useEffect(() => {
    persistOutfits(savedOutfits);
  }, [savedOutfits, persistOutfits]);

  useEffect(() => {
    persistAlerts(restockAlerts);
  }, [restockAlerts, persistAlerts]);

  useEffect(() => {
    persistOrders(orders);
  }, [orders, persistOrders]);

  return (
    <AppContext.Provider value={{
      // Considerations
      considerations,
      addToConsiderations,
      removeFromConsiderations,
      clearConsiderations,
      isInConsiderations,

      // Wardrobe
      wardrobe,
      addToWardrobe,
      removeFromWardrobe,
      isInWardrobe,

      // Wishlist
      wishlist,
      removeFromWishlist,

      // Outfits
      savedOutfits,
      saveOutfit,
      removeOutfit,

      // Alerts
      restockAlerts,
      addRestockAlert,
      removeRestockAlert,
      hasRestockAlert,

      // Calendar
      calendarEvents,

      // Toasts
      toasts,
      showToast,
      dismissToast,

      // Orders
      orders,
      addOrder,

      // UHNI
      userTier,
      isUHNI,
      isHydrated,
      concierge,
      autonomousSettings,
      sourcingRequests,
      bespokeOrders,
      autonomousActivity,
      updateAutonomousSettings,
      setUserRole,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
