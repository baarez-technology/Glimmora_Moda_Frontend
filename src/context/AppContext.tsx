'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import type { Product, ConsiderationItem, WardrobeItem, CalendarEvent, UserTier, PersonalConcierge, AutonomousShoppingSettings, SourcingRequest, BespokeOrder, AutonomousActivity, FashionIdentity, BespokeDetailedSpec, PriceNegotiation, CollectionInvitation, ConciergeAppointment, ConciergeTask, ConciergeTaskInput, ClaimedOffer } from '@/types';
import type { UHNIPriceOffer } from '@/types/uhni';
import type { PricingTier, PriceAlert, TierUpgradeRequest } from '@/types/pricing-tiers';
import type { StylingSession, StylingSessionRequest } from '@/types/brand-portal';
import { generateOutfitSuggestions } from '@/lib/outfit-intelligence';
import * as calendarService from '@/services/calendar.service';
import * as productService from '@/services/product.service';
import { useAuth } from './AuthContext';
import { getSharedOffers, subscribeToOffers, updateSharedOfferClaimCount } from '@/lib/shared-store';
import { getSharedSessions, addSharedSession, updateSharedSessionStatus, subscribeToSessions } from '@/lib/shared-sessions-store';

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
  useCart,
  type Toast,
  type SavedOutfit,
  type RestockAlert,
  type OrderRecord
} from './hooks';
import type { CartItem, WishlistItem } from '@/services/customer-collection.service';

// Re-export types for backwards compatibility
export type { Toast, SavedOutfit, RestockAlert, OrderRecord };

interface AppContextType {
  // Currency
  currency: string;
  setCurrency: (currency: string) => void;

  // Fashion Identity (Style Profile)
  fashionIdentity: FashionIdentity | null;
  updateFashionIdentity: (identity: FashionIdentity) => void;

  // Considerations (Cart)
  considerations: ConsiderationItem[];
  addToConsiderations: (product: Product, variants?: { size?: string; color?: string }, agiNote?: string) => void;
  removeFromConsiderations: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearConsiderations: () => void;
  isInConsiderations: (productId: string) => boolean;

  // Wardrobe
  wardrobe: WardrobeItem[];
  addToWardrobe: (product: Product, options?: { color?: string; size?: string; quantity?: number }) => void;
  removeFromWardrobe: (id: string) => void;
  clearAllWardrobe: () => void;
  isInWardrobe: (productId: string) => boolean;

  // Cart (API-backed, session-cached)
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (payload: { product_id: string; color: string; size: string; quantity?: number }) => Promise<CartItem>;
  removeFromCart: (cartId: string) => Promise<void>;
  updateCartQuantity: (cartId: string, quantity: number) => Promise<CartItem | undefined>;
  clearAllCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
  refreshCart: () => Promise<void>;

  // Wishlist (API-backed, session-cached)
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  removeFromWishlistApi: (wishlistId: string) => Promise<void>;
  clearAllWishlist: () => Promise<void>;
  moveWishlistToCart: (wishlistItem: WishlistItem) => Promise<CartItem | undefined>;
  refreshWishlist: () => Promise<void>;

  // Wishlist (legacy local)
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
  createSourcingRequest: (data: {
    title: string;
    description: string;
    category: string;
    budget: number;
    currency?: string;
    deadline?: string;
    specifications?: string;
    priority: 'standard' | 'urgent' | 'when_available';
  }) => SourcingRequest;
  selectSourcingOption: (requestId: string, optionId: string) => void;
  addSourcingMessage: (requestId: string, content: string) => void;
  bespokeOrders: BespokeOrder[];
  autonomousActivity: AutonomousActivity[];
  updateAutonomousSettings: (settings: Partial<AutonomousShoppingSettings>) => void;
  createBespokeOrder: (orderData: {
    title: string;
    type: 'made_to_measure' | 'custom_design' | 'modification';
    description: string;
    detailedSpec: BespokeDetailedSpec;
    estimatedBudget: number;
    requestedDeadline?: string;
    selectedBrands?: { id: string; name: string }[];
  }) => BespokeOrder;
  addMessageToBespokeOrder: (orderId: string, content: string, role: 'client' | 'brand') => void;
  approveBespokeDesign: (orderId: string) => void;
  priceNegotiations: PriceNegotiation[];
  createNegotiation: (data: {
    productId: string;
    productName: string;
    productImage: string;
    productSlug: string;
    brandName: string;
    originalPrice: number;
    proposedPrice: number;
    clientMessage: string;
  }) => PriceNegotiation;
  respondToCounterOffer: (negotiationId: string, action: 'accept' | 'reject') => void;
  collectionInvitations: CollectionInvitation[];
  respondToInvitation: (invitationId: string, action: 'accept' | 'decline') => void;
  submitAccessRequest: (collectionId: string, collectionName: string, brandId: string) => void;
  conciergeAppointments: ConciergeAppointment[];
  bookAppointment: (data: {
    type: ConciergeAppointment['type'];
    title: string;
    date: string;
    time: string;
    duration: number;
    notes?: string;
    location?: ConciergeAppointment['location'];
    brand_id?: string;
  }) => ConciergeAppointment;
  cancelAppointment: (appointmentId: string) => void;
  rescheduleAppointment: (appointmentId: string, newDate: string, newTime: string) => void;
  conciergeTasks: ConciergeTask[];
  addConciergeTask: (input: ConciergeTaskInput) => ConciergeTask;
  completeConciergeTask: (taskId: string) => void;
  uhniOffers: UHNIPriceOffer[];
  claimedOffers: ClaimedOffer[];
  claimOffer: (offer: UHNIPriceOffer) => void;
  stylingSessions: StylingSession[];
  bookStylingSession: (request: StylingSessionRequest) => StylingSession;
  cancelStylingSession: (sessionId: string) => void;
  setUserRole: (tier: UserTier) => void;
  logout: () => void;
  // Pricing Tiers
  pricingTier: PricingTier;
  tierSince: string;
  priceAlerts: PriceAlert[];
  tierUpgradeRequest: TierUpgradeRequest | null;
  createPriceAlert: (data: {
    productId: string;
    productName: string;
    productSlug: string;
    productImage?: string;
    brandName: string;
    currentPrice: number;
    targetPrice: number;
    currency?: string;
  }) => PriceAlert | undefined;
  deletePriceAlert: (alertId: string) => void;
  togglePriceAlert: (alertId: string) => void;
  requestTierUpgrade: (targetTier: PricingTier) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Currency state — reactive across app
  const [currency, setCurrencyState] = useState('EUR');
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('moda-currency') : null;
    if (stored) setCurrencyState(stored);
    const handleChange = () => {
      const updated = localStorage.getItem('moda-currency') || 'EUR';
      setCurrencyState(updated);
    };
    window.addEventListener('currency-change', handleChange);
    window.addEventListener('storage', handleChange);
    return () => {
      window.removeEventListener('currency-change', handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, []);
  const setCurrency = useCallback((c: string) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('moda-currency', c);
      window.dispatchEvent(new Event('currency-change'));
    } catch { /* ignore */ }
  }, []);

  // Auth state — single source of truth from AuthContext
  const { userTier, isUHNI, isAuthenticated, setUserRole, logout } = useAuth();

  // Pricing Tiers
  const [pricingTier, setPricingTier] = useState<PricingTier>('standard');
  const [tierSince] = useState<string>(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()); // Mock: 90 days ago
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [tierUpgradeRequest, setTierUpgradeRequest] = useState<TierUpgradeRequest | null>(null);

  // Sync pricing tier with UHNI status
  useEffect(() => {
    if (isUHNI) {
      setPricingTier('uhni');
    } else if (userTier === 'preferred') {
      setPricingTier('preferred');
    } else {
      setPricingTier('standard');
    }
  }, [isUHNI, userTier]);

  // Wishlist state (TODO: Move to dedicated hook)
  const [wishlist, setWishlist] = useState<WardrobeItem[]>([]);

  // Toast notifications
  const { toasts, showToast, dismissToast } = useToasts();

  // Cart & Wishlist (API-backed, session-cached)
  const cart = useCart({ showToast });

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
    updateQuantity,
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
    clearAllWardrobe,
    isInWardrobe,
    persistWardrobe
  } = useWardrobeState({ showToast, safeLocalStorageSave });

  // Calendar events loaded from service — prefer events with outfit suggestions when deduplicating
  const dedupeEvents = (events: CalendarEvent[]) => {
    const map = new Map<string, CalendarEvent>();
    for (const e of events) {
      const existing = map.get(e.id);
      if (!existing || (!existing.backendOutfitSuggestions && e.backendOutfitSuggestions)) {
        map.set(e.id, e);
      }
    }
    return Array.from(map.values());
  };
  const [baseCalendarEvents, setBaseCalendarEvents] = useState<CalendarEvent[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Load cart & wishlist once per session when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      cart.loadCart();
      cart.loadWishlist();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    // Run all independent fetches in parallel instead of sequentially
    if (isAuthenticated) {
      // Load products in parallel with calendar events
      productService.getAllProducts()
        .then(response => { if (response.success) setAllProducts(response.data); })
        .catch(console.error);

      // Calendar: Load DB events first, then try Nylas refresh (sequential to avoid duplicates)
      calendarService.getCalendarEvents(false)
        .then(backendEvents => {
          const mapped = backendEvents.map(calendarService.mapBackendToFrontendEvent);
          setBaseCalendarEvents(dedupeEvents(mapped));
          // After showing DB events, try refreshing from Nylas in background
          return calendarService.refreshCalendarEvents()
            .then(refreshedEvents => {
              const refreshMapped = refreshedEvents.map(calendarService.mapBackendToFrontendEvent);
              setBaseCalendarEvents(dedupeEvents(refreshMapped));
            })
            .catch(() => { /* No calendar connected or refresh failed */ });
        })
        .catch(() => { /* Silently fail — user may not have a calendar connected */ });
    } else {
      // Not authenticated — still load products (mock data)
      productService.getAllProducts()
        .then(response => { if (response.success) setAllProducts(response.data); })
        .catch(console.error);
    }
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
      setBaseCalendarEvents(dedupeEvents(mapped));
    } catch (err) {
      console.error('Failed to refresh calendar events:', err);
    }
  }, []);

  // Reload calendar events from DB (works for manual events too)
  const reloadCalendarEvents = useCallback(async () => {
    try {
      const backendEvents = await calendarService.getCalendarEvents(false);
      const mapped = backendEvents.map(calendarService.mapBackendToFrontendEvent);
      setBaseCalendarEvents(dedupeEvents(mapped));
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
    createSourcingRequest,
    selectSourcingOption,
    addSourcingMessage,
    bespokeOrders,
    autonomousActivity,
    updateAutonomousSettings,
    createBespokeOrder,
    addMessageToBespokeOrder,
    approveBespokeDesign,
    priceNegotiations: uhniNegotiations,
    createNegotiation,
    respondToCounterOffer,
    conciergeAppointments,
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,
    localConciergeTasks,
    addConciergeTask,
    completeConciergeTask,
  } = useUHNIFeatures({ isUHNI, showToast });

  // Collection Invitations (UHNI)
  const [collectionInvitations, setCollectionInvitations] = useState<CollectionInvitation[]>([]);

  useEffect(() => {
    if (isUHNI && collectionInvitations.length === 0) {
      setCollectionInvitations([
        {
          id: 'inv-demo-1',
          collectionId: 'pc-demo-1',
          collectionName: 'Automne Privé 2026',
          brandName: 'Maison Lumière',
          brandId: 'brand-demo-1',
          sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          message: 'You are exclusively invited to preview our autumn private collection before public release.'
        }
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUHNI]);

  const respondToInvitation = useCallback((invitationId: string, action: 'accept' | 'decline') => {
    setCollectionInvitations(prev =>
      prev.map(inv =>
        inv.id === invitationId
          ? { ...inv, status: action === 'accept' ? 'accepted' as const : 'declined' as const }
          : inv
      )
    );
    if (action === 'accept') {
      showToast('Invitation accepted — collection access granted', 'success');
    } else {
      showToast('Invitation declined', 'info');
    }
  }, [showToast]);

  const submitAccessRequest = useCallback((collectionId: string, collectionName: string, _brandId: string) => {
    showToast(`Access request sent for ${collectionName}`, 'success');
  }, [showToast]);

  // UHNI Offers (shared store)
  const [sharedUhniOffers, setSharedUhniOffers] = useState<UHNIPriceOffer[]>(getSharedOffers());
  const [claimedOffers, setClaimedOffers] = useState<ClaimedOffer[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToOffers(offers => {
      setSharedUhniOffers(offers);
    });
    return unsubscribe;
  }, []);

  const visibleOffers = useMemo(() => {
    return sharedUhniOffers.filter(offer => {
      const now = new Date();
      const validFrom = new Date(offer.validFrom);
      const validUntil = new Date(offer.validUntil);
      if (now < validFrom || now > validUntil) return false;
      if (offer.isPrivate && offer.targetClientIds?.length) {
        return offer.targetClientIds.includes('uhni-user');
      }
      return true;
    });
  }, [sharedUhniOffers]);

  const computeDiscountedPrice = (
    originalPrice: number,
    discountType: 'percentage' | 'fixed',
    discountValue: number
  ): number => {
    if (discountType === 'percentage') {
      return Math.round(originalPrice * (1 - discountValue / 100));
    }
    return Math.max(0, originalPrice - discountValue);
  };

  const handleClaimOffer = useCallback((offer: UHNIPriceOffer) => {
    if (claimedOffers.some(c => c.offerId === offer.id)) {
      showToast('You have already claimed this offer', 'info');
      return;
    }
    if (offer.maxClaims && offer.maxClaims > 0) {
      if ((offer.claimedCount || 0) >= offer.maxClaims) {
        showToast('This offer has reached its claim limit', 'error');
        return;
      }
    }

    const discountLabel = offer.discountType === 'percentage'
      ? `${offer.discountValue}% off`
      : `€${offer.discountValue} off`;

    const originalPrice = offer.originalPrice || 0;
    const discountedPrice = computeDiscountedPrice(
      originalPrice, offer.discountType, offer.discountValue
    );

    const claimed: ClaimedOffer = {
      id: `claimed-${Date.now()}`,
      offerId: offer.id,
      offerTitle: `${discountLabel} — ${offer.targetName}`,
      brandName: offer.brandName || '',
      productId: offer.type === 'product' ? offer.targetId : undefined,
      productName: offer.type === 'product' ? offer.targetName : undefined,
      productSlug: offer.productSlug,
      originalPrice,
      discountedPrice,
      discountLabel,
      claimedAt: new Date().toISOString(),
      expiresAt: offer.validUntil,
      status: 'active',
    };

    setClaimedOffers(prev => [claimed, ...prev]);
    updateSharedOfferClaimCount(offer.id);

    if (offer.type === 'product' && offer.targetId && offer.productSlug) {
      addToConsiderations(
        {
          id: offer.targetId,
          name: offer.targetName,
          price: discountedPrice,
          images: offer.productImage
            ? [{ url: offer.productImage, alt: offer.targetName }]
            : [],
          slug: offer.productSlug,
          brandName: offer.brandName || '',
        } as unknown as Product,
        {},
        `${discountLabel} offer applied`
      );
      showToast(
        `Offer claimed — ${offer.targetName} added at ${discountLabel}`,
        'success'
      );
    } else {
      showToast(
        `Offer claimed — ${discountLabel} saved to your offer wallet`,
        'success'
      );
    }
  }, [claimedOffers, showToast, addToConsiderations]);

  // Styling Sessions (shared store)
  const [sharedStylingSessions, setSharedStylingSessions] = useState<StylingSession[]>(getSharedSessions());

  useEffect(() => {
    const unsubscribe = subscribeToSessions(sessions => {
      setSharedStylingSessions(sessions);
    });
    return unsubscribe;
  }, []);

  const mySessions = useMemo(() => {
    return sharedStylingSessions.filter(s => s.customerId === 'uhni-user');
  }, [sharedStylingSessions]);

  const bookStylingSession = useCallback((request: StylingSessionRequest): StylingSession => {
    const newSession: StylingSession = {
      id: `session-${Date.now()}`,
      brandId: request.brandId,
      brandName: request.brandName,
      scheduledAt: request.scheduledAt,
      duration: request.duration,
      type: request.type,
      status: 'pending',
      notes: request.notes,
      contextInfo: request.contextInfo,
      customerId: 'uhni-user',
      customerName: 'Alexandra V.',
      customerEmail: 'alexandra@example.com',
      customerTier: request.customerTier,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addSharedSession(newSession);
    showToast(`Styling session booked with ${request.brandName}`, 'success');
    return newSession;
  }, [showToast]);

  const cancelStylingSession = useCallback((sessionId: string) => {
    updateSharedSessionStatus(sessionId, 'cancelled');
    showToast('Styling session cancelled', 'info');
  }, [showToast]);

  // Wishlist functions (TODO: Move to dedicated hook)
  const removeFromWishlist = useCallback((id: string) => {
    setWishlist(prev => prev.filter(w => w.id !== id));
    showToast('Removed from wishlist', 'info');
  }, [showToast]);

  // Pricing Tier functions
  const createPriceAlert = useCallback((data: {
    productId: string;
    productName: string;
    productSlug: string;
    productImage?: string;
    brandName: string;
    currentPrice: number;
    targetPrice: number;
    currency?: string;
  }): PriceAlert | undefined => {
    // Only available for preferred and uhni tiers
    if (pricingTier === 'standard') {
      showToast('Price alerts are available for Preferred and UHNI members', 'info');
      return undefined;
    }

    // Check if alert already exists for this product
    if (priceAlerts.some(alert => alert.productId === data.productId && alert.isActive)) {
      showToast('You already have an active price alert for this product', 'info');
      return undefined;
    }

    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      productId: data.productId,
      productName: data.productName,
      productSlug: data.productSlug,
      productImage: data.productImage,
      brandName: data.brandName,
      currentPrice: data.currentPrice,
      targetPrice: data.targetPrice,
      currency: data.currency || 'EUR',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setPriceAlerts(prev => [newAlert, ...prev]);
    showToast(`Price alert set for ${data.productName}`, 'success');
    return newAlert;
  }, [pricingTier, priceAlerts, showToast]);

  const deletePriceAlert = useCallback((alertId: string) => {
    setPriceAlerts(prev => prev.filter(alert => alert.id !== alertId));
    showToast('Price alert removed', 'info');
  }, [showToast]);

  const togglePriceAlert = useCallback((alertId: string) => {
    setPriceAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, isActive: !alert.isActive }
        : alert
    ));
  }, []);

  const requestTierUpgrade = useCallback((targetTier: PricingTier) => {
    if (tierUpgradeRequest && tierUpgradeRequest.status === 'pending') {
      showToast('You already have a pending upgrade request', 'info');
      return;
    }

    const request: TierUpgradeRequest = {
      id: `upgrade-${Date.now()}`,
      fromTier: pricingTier,
      toTier: targetTier,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    setTierUpgradeRequest(request);
    showToast(`Upgrade request submitted for ${targetTier === 'preferred' ? 'Preferred Member' : 'UHNI'} tier`, 'success');
  }, [pricingTier, tierUpgradeRequest, showToast]);

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
        const storedPriceAlerts = localStorage.getItem('moda-price-alerts');
        const storedTierUpgradeRequest = localStorage.getItem('moda-tier-upgrade-request');

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

        if (storedPriceAlerts) {
          setPriceAlerts(JSON.parse(storedPriceAlerts));
        }
        if (storedTierUpgradeRequest) {
          setTierUpgradeRequest(JSON.parse(storedTierUpgradeRequest));
        }
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

  useEffect(() => {
    if (isHydrated) {
      safeLocalStorageSave('moda-price-alerts', priceAlerts);
    }
  }, [priceAlerts, isHydrated, safeLocalStorageSave]);

  useEffect(() => {
    if (isHydrated) {
      safeLocalStorageSave('moda-tier-upgrade-request', tierUpgradeRequest);
    }
  }, [tierUpgradeRequest, isHydrated, safeLocalStorageSave]);

  return (
    <AppContext.Provider value={{
      // Currency
      currency,
      setCurrency,

      // Fashion Identity
      fashionIdentity,
      updateFashionIdentity,

      // Considerations
      considerations,
      addToConsiderations,
      removeFromConsiderations,
      updateQuantity,
      clearConsiderations,
      isInConsiderations,

      // Wardrobe
      wardrobe,
      addToWardrobe,
      removeFromWardrobe,
      clearAllWardrobe,
      isInWardrobe,

      // Cart (API-backed)
      cartItems: cart.cartItems,
      cartCount: cart.cartCount,
      addToCart: cart.addToCart,
      removeFromCart: cart.removeFromCart,
      updateCartQuantity: cart.updateCartQuantity,
      clearAllCart: cart.clearAllCart,
      isInCart: cart.isInCart,
      refreshCart: cart.refreshCart,

      // Wishlist (API-backed)
      wishlistItems: cart.wishlistItems,
      wishlistCount: cart.wishlistCount,
      removeFromWishlistApi: cart.removeFromWishlist,
      clearAllWishlist: cart.clearAllWishlist,
      moveWishlistToCart: cart.moveWishlistToCart,
      refreshWishlist: cart.refreshWishlist,

      // Wishlist (legacy local)
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
      createSourcingRequest,
      selectSourcingOption,
      addSourcingMessage,
      bespokeOrders,
      autonomousActivity,
      updateAutonomousSettings,
      createBespokeOrder,
      addMessageToBespokeOrder,
      approveBespokeDesign,
      priceNegotiations: uhniNegotiations,
      createNegotiation,
      respondToCounterOffer,
      collectionInvitations,
      respondToInvitation,
      submitAccessRequest,
      conciergeAppointments,
      bookAppointment,
      cancelAppointment,
      rescheduleAppointment,
      conciergeTasks: localConciergeTasks,
      addConciergeTask,
      completeConciergeTask,
      uhniOffers: visibleOffers,
      claimedOffers,
      claimOffer: handleClaimOffer,
      stylingSessions: mySessions,
      bookStylingSession,
      cancelStylingSession,
      setUserRole,
      logout,
      // Pricing Tiers
      pricingTier,
      tierSince,
      priceAlerts,
      tierUpgradeRequest,
      createPriceAlert,
      deletePriceAlert,
      togglePriceAlert,
      requestTierUpgrade,
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
