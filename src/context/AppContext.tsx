'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import type { Product, ConsiderationItem, WardrobeItem, CalendarEvent, UserTier, PersonalConcierge, AutonomousShoppingSettings, SourcingRequest, BespokeOrder, AutonomousActivity, FashionIdentity } from '@/types';
import { generateOutfitSuggestions } from '@/lib/outfit-intelligence';
import * as calendarService from '@/services/calendar.service';
import * as productService from '@/services/product.service';
import { useAuth } from './AuthContext';

// Import focused hooks
import {
  useToasts,
  useConsiderations,
  useWardrobeState,
  useSavedOutfits,
  useRestockAlerts,
  useOrders,
  useUHNIFeatures,
  useFashionIdentity,
  type Toast,
  type SavedOutfit,
  type RestockAlert,
  type OrderRecord
} from './hooks';

// Re-export types for backwards compatibility
export type { Toast, SavedOutfit, RestockAlert, OrderRecord };

interface AppContextType {
  // Fashion Identity (Style Profile)
  fashionIdentity: FashionIdentity | null;
  updateFashionIdentity: (identity: FashionIdentity) => void;

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
  refreshCalendarEvents: () => Promise<void>;
  reloadCalendarEvents: () => Promise<void>;

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

  // Auth state — single source of truth from AuthContext
  const { userTier, isUHNI, isAuthenticated, setUserRole, logout } = useAuth();

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

  // Calendar events loaded from service
  const [baseCalendarEvents, setBaseCalendarEvents] = useState<CalendarEvent[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Only load calendar events when user is authenticated
    if (isAuthenticated) {
      calendarService.getCalendarEvents(false).then(backendEvents => {
        const mapped = backendEvents.map(calendarService.mapBackendToFrontendEvent);
        setBaseCalendarEvents(mapped);
      }).catch(() => {
        // Silently fail — user may not have a calendar connected
      });
    }
    productService.getAllProducts().then(response => {
      if (response.success) setAllProducts(response.data);
    }).catch(console.error);
  }, [isAuthenticated]);

  // Generate dynamic calendar events with outfit suggestions based on wardrobe
  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    return baseCalendarEvents.map(event => ({
      ...event,
      outfitSuggestions: generateOutfitSuggestions(event as CalendarEvent, wardrobe, allProducts)
    }));
  }, [baseCalendarEvents, wardrobe, allProducts]);

  // Refresh calendar events from Nylas backend (requires calendar connection)
  const refreshCalendarEvents = useCallback(async () => {
    try {
      const backendEvents = await calendarService.refreshCalendarEvents();
      const mapped = backendEvents.map(calendarService.mapBackendToFrontendEvent);
      setBaseCalendarEvents(mapped);
    } catch (err) {
      console.error('Failed to refresh calendar events:', err);
    }
  }, []);

  // Reload calendar events from DB (works for manual events too)
  const reloadCalendarEvents = useCallback(async () => {
    try {
      const backendEvents = await calendarService.getCalendarEvents(false);
      const mapped = backendEvents.map(calendarService.mapBackendToFrontendEvent);
      setBaseCalendarEvents(mapped);
    } catch (err) {
      console.error('Failed to reload calendar events:', err);
    }
  }, []);

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
    fashionIdentity,
    setFashionIdentity,
    updateFashionIdentity,
    persistFashionIdentity,
    initializeFashionIdentity
  } = useFashionIdentity({ showToast, safeLocalStorageSave });

  const {
    concierge,
    autonomousSettings,
    sourcingRequests,
    bespokeOrders,
    autonomousActivity,
    updateAutonomousSettings,
  } = useUHNIFeatures({ isUHNI, showToast });

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
        const storedFashionIdentity = localStorage.getItem('moda-fashion-identity');

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

        initializeFashionIdentity(storedFashionIdentity);
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
      setIsHydrated(true);
    };

    loadFromStorage();
  }, [setConsiderations, initializeWardrobe, setSavedOutfits, setRestockAlerts, setOrders, initializeFashionIdentity]);

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

  useEffect(() => {
    persistFashionIdentity(fashionIdentity);
  }, [fashionIdentity, persistFashionIdentity]);

  return (
    <AppContext.Provider value={{
      // Fashion Identity
      fashionIdentity,
      updateFashionIdentity,

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
      refreshCalendarEvents,
      reloadCalendarEvents,

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
