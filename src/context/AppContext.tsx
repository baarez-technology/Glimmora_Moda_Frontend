'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Product, ConsiderationItem, WardrobeItem, CalendarEvent, UserTier, PersonalConcierge, AutonomousShoppingSettings, SourcingRequest, BespokeOrder, AutonomousActivity } from '@/types';
import { products, mockCalendarEvents, mockUserTier, mockConcierge, mockAutonomousSettings, mockSourcingRequests, mockBespokeOrders, mockAutonomousActivity } from '@/data/mock-data';

// Toast types
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

// Saved outfit type
export interface SavedOutfit {
  id: string;
  name: string;
  eventId?: string;
  items: string[]; // product IDs
  savedAt: string;
}

// Restock alert type
export interface RestockAlert {
  id: string;
  productId: string;
  product: Product;
  preferredSize?: string;
  preferredColor?: string;
  status: 'watching' | 'available' | 'notified';
  createdAt: string;
  notifiedAt?: string;
}

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
  concierge: PersonalConcierge | null;
  autonomousSettings: AutonomousShoppingSettings | null;
  sourcingRequests: SourcingRequest[];
  bespokeOrders: BespokeOrder[];
  autonomousActivity: AutonomousActivity[];
  updateAutonomousSettings: (settings: Partial<AutonomousShoppingSettings>) => void;
  setUserRole: (tier: UserTier) => void;
}

export interface OrderRecord {
  id: string;
  items: ConsiderationItem[];
  total: number;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  estimatedDelivery: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage or defaults
  const [considerations, setConsiderations] = useState<ConsiderationItem[]>([]);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [restockAlerts, setRestockAlerts] = useState<RestockAlert[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [calendarEvents] = useState<CalendarEvent[]>(mockCalendarEvents);
  const [isHydrated, setIsHydrated] = useState(false);

  // UHNI State - Load from localStorage or default to mock data
  const [userTier, setUserTier] = useState<UserTier>('standard');
  const isUHNI = userTier === 'uhni';

  // Load user tier from localStorage on mount
  useEffect(() => {
    const storedTier = localStorage.getItem('moda-user-tier') as UserTier | null;
    if (storedTier && ['standard', 'preferred', 'uhni'].includes(storedTier)) {
      setUserTier(storedTier);
    }
  }, []);

  // UHNI-specific data (only loaded for UHNI users)
  const concierge = isUHNI ? mockConcierge : null;
  const [autonomousSettings, setAutonomousSettings] = useState<AutonomousShoppingSettings | null>(null);
  const [sourcingRequests] = useState<SourcingRequest[]>(mockSourcingRequests);
  const [bespokeOrders] = useState<BespokeOrder[]>(mockBespokeOrders);
  const [autonomousActivity] = useState<AutonomousActivity[]>(mockAutonomousActivity);

  // Update autonomous settings when tier changes
  useEffect(() => {
    if (isUHNI) {
      setAutonomousSettings(mockAutonomousSettings);
    } else {
      setAutonomousSettings(null);
    }
  }, [isUHNI]);

  // Function to set user tier (called from login)
  const setUserRole = (tier: UserTier) => {
    setUserTier(tier);
    localStorage.setItem('moda-user-tier', tier);
  };

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
        if (storedWardrobe) {
          setWardrobe(JSON.parse(storedWardrobe));
        } else {
          // Initialize with first product from mock data for demo
          const diorProduct = products.find(p => p.brandName === 'Dior');
          if (diorProduct) {
            setWardrobe([{
              id: 'wardrobe-1',
              productId: diorProduct.id,
              product: diorProduct,
              addedAt: new Date().toISOString(),
              wearCount: 5,
              lastWorn: '2024-01-15',
              outfitCompatibility: ['professional', 'evening']
            }]);
          }
        }
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
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('moda-considerations', JSON.stringify(considerations));
    }
  }, [considerations, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('moda-wardrobe', JSON.stringify(wardrobe));
    }
  }, [wardrobe, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('moda-outfits', JSON.stringify(savedOutfits));
    }
  }, [savedOutfits, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('moda-restock-alerts', JSON.stringify(restockAlerts));
    }
  }, [restockAlerts, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('moda-orders', JSON.stringify(orders));
    }
  }, [orders, isHydrated]);

  // Toast notification functions
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Considerations functions
  const addToConsiderations = useCallback((
    product: Product,
    variants?: { size?: string; color?: string },
    agiNote?: string
  ) => {
    const existingIndex = considerations.findIndex(c => c.productId === product.id);

    if (existingIndex >= 0) {
      // Update existing item
      setConsiderations(prev => prev.map((item, index) =>
        index === existingIndex
          ? { ...item, selectedVariants: variants || item.selectedVariants, agiNote: agiNote || item.agiNote }
          : item
      ));
      showToast('Updated in your considerations', 'info');
    } else {
      // Add new item
      const newItem: ConsiderationItem = {
        id: `consideration-${Date.now()}`,
        productId: product.id,
        product,
        addedAt: new Date().toISOString(),
        selectedVariants: variants || {},
        agiNote
      };
      setConsiderations(prev => [...prev, newItem]);
      showToast(`${product.name} added to considerations`, 'success');
    }
  }, [considerations, showToast]);

  const removeFromConsiderations = useCallback((id: string) => {
    setConsiderations(prev => {
      const item = prev.find(c => c.id === id);
      if (item) {
        showToast(`${item.product.name} removed from considerations`, 'info');
      }
      return prev.filter(c => c.id !== id);
    });
  }, [showToast]);

  const clearConsiderations = useCallback(() => {
    setConsiderations([]);
  }, []);

  const isInConsiderations = useCallback((productId: string) => {
    return considerations.some(c => c.productId === productId);
  }, [considerations]);

  // Wardrobe functions
  const addToWardrobe = useCallback((product: Product) => {
    if (wardrobe.some(w => w.productId === product.id)) {
      showToast('Already in your wardrobe', 'info');
      return;
    }

    const newItem: WardrobeItem = {
      id: `wardrobe-${Date.now()}`,
      productId: product.id,
      product,
      addedAt: new Date().toISOString(),
      wearCount: 0,
      outfitCompatibility: []
    };
    setWardrobe(prev => [...prev, newItem]);
    showToast(`${product.name} added to wardrobe`, 'success');
  }, [wardrobe, showToast]);

  const removeFromWardrobe = useCallback((id: string) => {
    setWardrobe(prev => {
      const item = prev.find(w => w.id === id);
      if (item) {
        showToast(`${item.product.name} removed from wardrobe`, 'info');
      }
      return prev.filter(w => w.id !== id);
    });
  }, [showToast]);

  const isInWardrobe = useCallback((productId: string) => {
    return wardrobe.some(w => w.productId === productId);
  }, [wardrobe]);

  // Saved Outfits functions
  const saveOutfit = useCallback((name: string, productIds: string[], eventId?: string) => {
    const newOutfit: SavedOutfit = {
      id: `outfit-${Date.now()}`,
      name,
      eventId,
      items: productIds,
      savedAt: new Date().toISOString()
    };
    setSavedOutfits(prev => [...prev, newOutfit]);
    showToast(`"${name}" outfit saved`, 'success');
  }, [showToast]);

  const removeOutfit = useCallback((id: string) => {
    setSavedOutfits(prev => prev.filter(o => o.id !== id));
    showToast('Outfit removed', 'info');
  }, [showToast]);

  // Restock Alerts functions
  const addRestockAlert = useCallback((product: Product, size?: string, color?: string) => {
    if (restockAlerts.some(a => a.productId === product.id)) {
      showToast('Already watching this item', 'info');
      return;
    }

    const newAlert: RestockAlert = {
      id: `alert-${Date.now()}`,
      productId: product.id,
      product,
      preferredSize: size,
      preferredColor: color,
      status: 'watching',
      createdAt: new Date().toISOString()
    };
    setRestockAlerts(prev => [...prev, newAlert]);
    showToast('You will be notified when available', 'success');
  }, [restockAlerts, showToast]);

  const removeRestockAlert = useCallback((id: string) => {
    setRestockAlerts(prev => prev.filter(a => a.id !== id));
    showToast('Alert removed', 'info');
  }, [showToast]);

  const hasRestockAlert = useCallback((productId: string) => {
    return restockAlerts.some(a => a.productId === productId);
  }, [restockAlerts]);

  // Order functions
  const addOrder = useCallback((items: ConsiderationItem[], total: number) => {
    const orderId = `MG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);

    const newOrder: OrderRecord = {
      id: orderId,
      items,
      total,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      estimatedDelivery: deliveryDate.toISOString()
    };
    setOrders(prev => [newOrder, ...prev]);
    return orderId;
  }, []);

  // UHNI: Update autonomous shopping settings
  const updateAutonomousSettings = useCallback((settings: Partial<AutonomousShoppingSettings>) => {
    if (!isUHNI || !autonomousSettings) return;
    setAutonomousSettings(prev => prev ? { ...prev, ...settings } : null);
    showToast('Settings updated', 'success');
  }, [isUHNI, autonomousSettings, showToast]);

  return (
    <AppContext.Provider value={{
      considerations,
      addToConsiderations,
      removeFromConsiderations,
      clearConsiderations,
      isInConsiderations,
      wardrobe,
      addToWardrobe,
      removeFromWardrobe,
      isInWardrobe,
      savedOutfits,
      saveOutfit,
      removeOutfit,
      restockAlerts,
      addRestockAlert,
      removeRestockAlert,
      hasRestockAlert,
      calendarEvents,
      toasts,
      showToast,
      dismissToast,
      orders,
      addOrder,
      userTier,
      isUHNI,
      concierge,
      autonomousSettings,
      sourcingRequests,
      bespokeOrders,
      autonomousActivity,
      updateAutonomousSettings,
      setUserRole
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
