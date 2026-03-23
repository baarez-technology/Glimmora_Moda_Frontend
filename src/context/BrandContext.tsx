'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import type {
  BrandPartner,
  BrandProduct,
  BrandCollection,
  GlobalInventoryOverview,
  BrandAnalytics,
  BrandOrder,
  OrderStatus,
  RecentActivity,
  HeritageEvent,
  BrandStory,
  StylingSession,
  CommerceSettings,
  TaxRule,
  ShippingMethod
} from '@/types/brand-portal';
import type {
  BespokeOrder,
  BespokeOrderStatus,
  BespokeMessage,
  BespokeTimelineEvent,
  PriceNegotiation,
  NegotiationStatus,
  PrivateCollection,
  SourcingRequest,
  SourcingRequestStatus,
  SourcingOption,
  SourcingMessage,
  UHNIPriceOffer
} from '@/types/uhni';
import * as brandPortalService from '@/services/brand-portal.service';
import * as bespokeService from '@/services/bespoke.service';
import * as privateCollectionService from '@/services/private-collection.service';
import { addSharedOffer } from '@/lib/shared-store';
import { getSharedSessions, addSharedSession as addSessionToStore, updateSharedSessionStatus, subscribeToSessions } from '@/lib/shared-sessions-store';
import { getUhniSourcingRequests, subscribeToSourcingChanges, writeBrandOptionToUhni, writeBrandNegotiationResponse, writeBrandMessage, writeBrandStatusUpdate } from '@/lib/shared-sourcing-store';
import type { BrandLoginResponse } from '@/services/auth.service';
import { brandLogout as clearBrandTokens } from '@/services/auth.service';

// Map API brand response (snake_case) to frontend BrandPartner (camelCase)
function mapApiBrandToPartner(apiBrand: BrandLoginResponse['brand']): BrandPartner {
  return {
    id: apiBrand.brand_id,
    brandId: apiBrand.brand_id,
    brandName: apiBrand.brand_name,
    brandLogo: apiBrand.brand_logo || undefined,
    brandCategory: apiBrand.brand_category || undefined,
    tier: 'standard',
    status: apiBrand.is_active ? 'active' : 'suspended',
    partnerSince: apiBrand.created_at,
    teamMembers: [
      {
        id: apiBrand.brand_id,
        name: `${apiBrand.first_name} ${apiBrand.last_name}`,
        email: apiBrand.email,
        role: (apiBrand.role as 'admin' | 'manager' | 'analyst' | 'viewer') || 'admin',
        avatar: apiBrand.profile_picture || undefined,
        lastActive: new Date().toISOString(),
      },
    ],
    apiKeys: [],
    settings: {
      notifications: {
        lowStockAlerts: apiBrand.email_notification.inventory_alerts,
        orderUpdates: apiBrand.email_notification.order_updates,
        demandSignals: false,
        weeklyReports: apiBrand.email_notification.weekly_reports,
      },
      integration: {
        syncFrequency: 'daily',
      },
      display: {
        currency: 'USD',
        timezone: 'UTC',
        language: 'en',
      },
    },
  };
}

interface BrandContextType {
  // Brand Partner
  partner: BrandPartner | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;

  // Products
  products: BrandProduct[];
  getProductById: (id: string) => BrandProduct | undefined;
  updateProduct: (id: string, updates: Partial<BrandProduct>) => void;
  createProduct: (product: Omit<BrandProduct, 'id' | 'createdAt' | 'updatedAt'>) => BrandProduct;
  deleteProduct: (id: string) => void;

  // Collections
  collections: BrandCollection[];
  getCollectionById: (id: string) => BrandCollection | undefined;
  createCollection: (collection: Omit<BrandCollection, 'id'>) => BrandCollection;
  updateCollection: (id: string, updates: Partial<BrandCollection>) => void;
  deleteCollection: (id: string) => void;

  // Orders
  orders: BrandOrder[];
  getOrderById: (id: string) => BrandOrder | undefined;
  updateOrderStatus: (id: string, status: OrderStatus) => void;

  // Inventory
  inventory: GlobalInventoryOverview | null;
  resolveAlert: (alertId: string) => void;

  // Analytics
  analytics: BrandAnalytics | null;

  // Recent Activity
  recentActivity: RecentActivity[];

  // UHNI Features
  bespokeOrders: BespokeOrder[];
  getBespokeOrderById: (id: string) => BespokeOrder | undefined;
  updateBespokeOrderStatus: (id: string, status: BespokeOrderStatus) => void;
  updateBespokeStatus: (orderId: string, newStatus: BespokeOrderStatus, note: string) => void;
  sendBespokeMessage: (orderId: string, content: string) => void;
  updateBespokePrice: (orderId: string, price: number, depositPercentage: number) => void;
  updateBespokeTimelineDates: (orderId: string, stepDates: Record<string, string>, estimatedCompletion?: string) => void;

  priceNegotiations: PriceNegotiation[];
  getNegotiationById: (id: string) => PriceNegotiation | undefined;
  submitCounterOffer: (id: string, amount: number, brandMessage?: string) => void;
  approveNegotiation: (id: string, brandMessage?: string) => void;
  declineNegotiation: (id: string, brandMessage?: string) => void;

  privateCollections: PrivateCollection[];
  getPrivateCollectionById: (id: string) => PrivateCollection | undefined;
  createPrivateCollection: (collection: Omit<PrivateCollection, 'id'>) => PrivateCollection;
  updatePrivateCollection: (id: string, updates: Partial<PrivateCollection>) => void;
  deletePrivateCollection: (collectionId: string) => void;
  sendCollectionInvitation: (collectionId: string, clientIds: string[], message?: string) => void;
  approveAccessRequest: (collectionId: string, requestId: string, reviewNote?: string) => void;
  denyAccessRequest: (collectionId: string, requestId: string, reviewNote?: string) => void;

  sourcingRequests: SourcingRequest[];
  getSourcingRequestById: (id: string) => SourcingRequest | undefined;
  submitSourcingOption: (requestId: string, option: {
    customDescription: string;
    price: number;
    condition: 'new' | 'like_new' | 'excellent' | 'good';
    source?: string;
    conciergeRecommendation?: string;
  }) => void;
  updateSourcingStatus: (requestId: string, newStatus: SourcingRequestStatus, note: string) => void;
  addSourcingOption: (requestId: string, option: Omit<SourcingOption, 'id' | 'addedAt' | 'source' | 'condition' | 'images'>) => void;
  updateSourcingOption: (requestId: string, optionId: string, updates: Partial<SourcingOption>) => void;
  removeSourcingOption: (requestId: string, optionId: string) => void;
  sendSourcingMessage: (requestId: string, content: string) => void;

  heritageEvents: HeritageEvent[];
  getHeritageEventById: (id: string) => HeritageEvent | undefined;
  createHeritageEvent: (event: Omit<HeritageEvent, 'id' | 'createdAt' | 'updatedAt'>) => HeritageEvent;
  updateHeritageEvent: (id: string, updates: Partial<HeritageEvent>) => void;
  deleteHeritageEvent: (id: string) => void;

  brandStories: BrandStory[];
  getBrandStoryById: (id: string) => BrandStory | undefined;
  createBrandStory: (story: Omit<BrandStory, 'id' | 'createdAt' | 'updatedAt'>) => BrandStory;
  updateBrandStory: (id: string, updates: Partial<BrandStory>) => void;
  deleteBrandStory: (id: string) => void;

  uhniOffers: UHNIPriceOffer[];
  getUHNIOfferById: (id: string) => UHNIPriceOffer | undefined;
  createUHNIOffer: (offer: Omit<UHNIPriceOffer, 'id'>) => UHNIPriceOffer;

  stylingSessions: StylingSession[];
  getStylingSessionById: (id: string) => StylingSession | undefined;
  updateStylingSessionStatus: (id: string, status: StylingSession['status'], extras?: Partial<StylingSession>) => void;
  createStylingSession: (session: Omit<StylingSession, 'id'>) => void;

  // Commerce Settings
  commerceSettings: CommerceSettings;
  updateTaxRule: (ruleId: string, updates: Partial<TaxRule>) => void;
  updateShippingMethod: (methodId: string, updates: Partial<ShippingMethod>) => void;
  addShippingMethod: (method: Omit<ShippingMethod, 'id'>) => void;
  removeShippingMethod: (methodId: string) => void;
  updateCommerceConfig: (updates: Partial<CommerceSettings>) => void;

  // Auth
  loginAsBrand: (data: BrandLoginResponse) => void;
  logout: () => void;
  getAccessToken: () => string | null;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [partner, setPartner] = useState<BrandPartner | null>(null);
  const [products, setProducts] = useState<BrandProduct[]>([]);
  const [collections, setCollections] = useState<BrandCollection[]>([]);
  const [orders, setOrders] = useState<BrandOrder[]>([]);
  const [inventory, setInventory] = useState<GlobalInventoryOverview | null>(null);
  const [analytics, setAnalytics] = useState<BrandAnalytics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // UHNI Feature State
  const [bespokeOrders, setBespokeOrders] = useState<BespokeOrder[]>([]);
  const [priceNegotiations, setPriceNegotiations] = useState<PriceNegotiation[]>([]);
  const [privateCollections, setPrivateCollections] = useState<PrivateCollection[]>([]);
  const [sourcingRequests, setSourcingRequests] = useState<SourcingRequest[]>([]);
  const [heritageEvents, setHeritageEvents] = useState<HeritageEvent[]>([]);
  const [brandStories, setBrandStories] = useState<BrandStory[]>([]);
  const [uhniOffers, setUhniOffers] = useState<UHNIPriceOffer[]>([]);
  const [stylingSessions, setStylingSessions] = useState<StylingSession[]>([]);
  const [sharedSessionsList, setSharedSessionsList] = useState<StylingSession[]>(getSharedSessions());

  useEffect(() => {
    const unsubscribe = subscribeToSessions(sessions => {
      setSharedSessionsList(sessions);
    });
    return unsubscribe;
  }, []);

  // Merge API-loaded sessions with shared store sessions (deduplicated by id)
  const mergedStylingSessions = useMemo(() => {
    const ids = new Set(stylingSessions.map(s => s.id));
    const merged = [...stylingSessions];
    for (const s of sharedSessionsList) {
      if (!ids.has(s.id)) merged.push(s);
    }
    return merged;
  }, [stylingSessions, sharedSessionsList]);

  // UHNI sourcing requests from localStorage (cross-portal sync)
  const [uhniSourcingRequests, setUhniSourcingRequests] = useState<SourcingRequest[]>(getUhniSourcingRequests());

  useEffect(() => {
    // Same-tab listener (in-memory)
    const unsubscribe = subscribeToSourcingChanges(() => {
      setUhniSourcingRequests(getUhniSourcingRequests());
    });
    // Cross-tab listener (localStorage storage event)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'moda-sourcing-created' || e.key === 'moda-sourcing-enrichment') {
        setUhniSourcingRequests(getUhniSourcingRequests());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Merge mock sourcing requests with UHNI-created requests
  const mergedSourcingRequests = useMemo(() => {
    const ids = new Set(sourcingRequests.map(s => s.id));
    const merged = [...sourcingRequests];
    for (const s of uhniSourcingRequests) {
      if (!ids.has(s.id)) merged.push(s);
    }
    return merged;
  }, [sourcingRequests, uhniSourcingRequests]);

  // Commerce Settings
  const [commerceSettings, setCommerceSettings] = useState<CommerceSettings>({
    taxRules: [
      {
        id: 'tax-eu',
        regionName: 'European Union',
        countryCode: 'EU',
        taxRate: 20,
        taxLabel: 'VAT',
        isEnabled: true,
        includeInPrice: true
      },
      {
        id: 'tax-us',
        regionName: 'United States',
        countryCode: 'US',
        taxRate: 0,
        taxLabel: 'Sales Tax',
        isEnabled: false,
        includeInPrice: false
      },
      {
        id: 'tax-ae',
        regionName: 'UAE',
        countryCode: 'AE',
        taxRate: 5,
        taxLabel: 'VAT',
        isEnabled: false,
        includeInPrice: false
      },
      {
        id: 'tax-uk',
        regionName: 'United Kingdom',
        countryCode: 'UK',
        taxRate: 20,
        taxLabel: 'VAT',
        isEnabled: false,
        includeInPrice: true
      }
    ],
    shippingMethods: [
      {
        id: 'ship-complimentary',
        name: 'Complimentary Delivery',
        carrier: 'Private Courier',
        estimatedDays: '5-7 business days',
        baseRate: 0,
        freeAbove: 0,
        isEnabled: true,
        regions: []
      },
      {
        id: 'ship-express',
        name: 'Express Delivery',
        carrier: 'DHL Express',
        estimatedDays: '1-2 business days',
        baseRate: 45,
        freeAbove: 5000,
        isEnabled: true,
        regions: []
      },
      {
        id: 'ship-white-glove',
        name: 'White Glove Delivery',
        carrier: 'Private Concierge',
        estimatedDays: 'Scheduled',
        baseRate: 150,
        freeAbove: 0,
        isEnabled: false,
        regions: []
      }
    ],
    freeShippingThreshold: 1000,
    returnWindowDays: 30,
    returnPolicy: 'Items may be returned within 30 days of delivery in original condition with tags attached. Bespoke orders are non-refundable.',
    defaultCurrency: 'EUR'
  });

  // Load all brand data from service
  const loadBrandData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await brandPortalService.getBrandDashboardData();
      if (response.success) {
        const d = response.data;
        // Don't overwrite partner — it comes from the real login response
        setProducts(d.products);
        setCollections(d.collections);
        setOrders(d.orders);
        setInventory(d.inventory);
        setAnalytics(d.analytics);
        setRecentActivity(d.recentActivity);
        // Load bespoke orders from real API
        try {
          const realBespoke = await bespokeService.fetchBrandBespokeOrders();
          console.log('[BrandContext] Loaded bespoke orders:', realBespoke.length);
          setBespokeOrders(realBespoke);
        } catch (err) {
          console.error('[BrandContext] Failed to load bespoke orders:', err instanceof Error ? err.message : err);
        }
        // No mock data for negotiations — no backend API yet
        setPriceNegotiations([]);
        // Load private collections from real API
        try {
          const realCollections = await privateCollectionService.fetchPrivateCollections();
          console.log('[BrandContext] Loaded private collections:', realCollections.length);
          setPrivateCollections(realCollections);
        } catch (err) {
          console.error('[BrandContext] Failed to load private collections:', err instanceof Error ? err.message : err);
        }
        // Sourcing requests are loaded directly by the sourcing page via brand-sourcing.service
        // Heritage events, brand stories, offers, styling sessions — loaded by their own pages
        // These are loaded by their own pages via real API — don't load mock here
        setSourcingRequests([]);
        setHeritageEvents([]);
        setBrandStories([]);
        setUhniOffers([]);
        setStylingSessions([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brand data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load from localStorage on mount (persistent login)
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('moda-brand-token');
      const storedBrand = localStorage.getItem('moda-brand-data');
      if (storedToken && storedBrand) {
        const apiBrand = JSON.parse(storedBrand);
        setIsAuthenticated(true);
        setPartner(mapApiBrandToPartner(apiBrand));
        // Set brand currency for formatPrice()
        if (apiBrand.currency) {
          localStorage.setItem('moda-currency', apiBrand.currency);
          window.dispatchEvent(new Event('currency-change'));
        }
        loadBrandData();
      }
    } catch (err) {
      console.error('Failed to restore brand session:', err);
      // Clear corrupted data
      clearBrandTokens();
    }
    setIsHydrated(true);
  }, [loadBrandData]);

  const loginAsBrand = useCallback((data: BrandLoginResponse) => {
    try {
      localStorage.setItem('moda-brand-token', data.access_token);
      localStorage.setItem('moda-brand-refresh-token', data.refresh_token);
      localStorage.setItem('moda-brand-data', JSON.stringify(data.brand));
      // Set brand currency so formatPrice() picks it up
      if (data.brand?.currency) {
        localStorage.setItem('moda-currency', data.brand.currency);
        window.dispatchEvent(new Event('currency-change'));
      }
    } catch (err) {
      console.error('Failed to store brand auth data:', err);
    }
    setIsAuthenticated(true);
    setPartner(mapApiBrandToPartner(data.brand));
    loadBrandData();
  }, [loadBrandData]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setPartner(null);
    setProducts([]);
    setCollections([]);
    setOrders([]);
    setInventory(null);
    setAnalytics(null);
    setRecentActivity([]);
    setBespokeOrders([]);
    setPriceNegotiations([]);
    setPrivateCollections([]);
    setSourcingRequests([]);
    setHeritageEvents([]);
    setBrandStories([]);
    setUhniOffers([]);
    setStylingSessions([]);
    clearBrandTokens();
  }, []);

  const getAccessToken = useCallback((): string | null => {
    try {
      return localStorage.getItem('moda-brand-token');
    } catch {
      return null;
    }
  }, []);

  // ============================================
  // Products
  // ============================================

  const getProductById = useCallback((id: string): BrandProduct | undefined => {
    return products.find(p => p.id === id);
  }, [products]);

  const updateProduct = useCallback((id: string, updates: Partial<BrandProduct>) => {
    setProducts(prev => prev.map(p =>
      p.id === id
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ));
    brandPortalService.updateBrandProduct(id, updates).catch(console.error);
  }, []);

  const createProduct = useCallback((productData: Omit<BrandProduct, 'id' | 'createdAt' | 'updatedAt'>): BrandProduct => {
    const newProduct: BrandProduct = {
      ...productData,
      id: `bp-product-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProducts(prev => [newProduct, ...prev]);
    brandPortalService.createBrandProduct(productData).catch(console.error);
    return newProduct;
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.map(p =>
      p.id === id ? { ...p, isDeleted: true, updatedAt: new Date().toISOString() } : p
    ));
    brandPortalService.deleteBrandProduct(id).catch(console.error);
  }, []);

  // ============================================
  // Collections
  // ============================================

  const getCollectionById = useCallback((id: string): BrandCollection | undefined => {
    return collections.find(c => c.id === id);
  }, [collections]);

  const createCollection = useCallback((collectionData: Omit<BrandCollection, 'id'>): BrandCollection => {
    const newCollection: BrandCollection = {
      ...collectionData,
      id: `bp-collection-${Date.now()}`,
    };
    setCollections(prev => [newCollection, ...prev]);
    brandPortalService.createBrandCollection(collectionData).catch(console.error);
    return newCollection;
  }, []);

  const updateCollection = useCallback((id: string, updates: Partial<BrandCollection>) => {
    setCollections(prev => prev.map(c =>
      c.id === id ? { ...c, ...updates } : c
    ));
    brandPortalService.updateBrandCollection(id, updates).catch(console.error);
  }, []);

  // ============================================
  // Orders
  // ============================================

  const deleteCollection = useCallback((id: string) => {
    setCollections(prev => prev.map(c =>
      c.id === id ? { ...c, isDeleted: true, updatedAt: new Date().toISOString() } : c
    ));
  }, []);

  const getOrderById = useCallback((id: string): BrandOrder | undefined => {
    return orders.find(o => o.id === id);
  }, [orders]);

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o =>
      o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
    ));
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    setInventory(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        alerts: prev.alerts.map(a =>
          a.id === alertId ? { ...a, resolvedAt: new Date().toISOString() } : a
        ),
      };
    });
  }, []);

  // ============================================
  // UHNI Features
  // ============================================

  const getBespokeOrderById = useCallback((id: string): BespokeOrder | undefined => {
    return bespokeOrders.find(o => o.id === id);
  }, [bespokeOrders]);

  const updateBespokeOrderStatus = useCallback((id: string, status: BespokeOrderStatus) => {
    // Optimistic local update
    setBespokeOrders(prev => prev.map(order => {
      if (order.id !== id) return order;
      const updatedTimeline = order.timeline.map(step => {
        if (step.stage === status) {
          return { ...step, status: 'current' as const };
        }
        const statusOrder = ['consultation', 'design_approval', 'production', 'fitting', 'final_adjustments', 'complete'];
        const newStatusIndex = statusOrder.indexOf(status);
        const stepIndex = statusOrder.indexOf(step.stage);
        if (stepIndex < newStatusIndex) {
          return { ...step, status: 'completed' as const, completedAt: new Date().toISOString() };
        }
        return { ...step, status: 'upcoming' as const };
      });
      return { ...order, status, timeline: updatedTimeline, updatedAt: new Date().toISOString() };
    }));
    // Real API call
    bespokeService.updateBrandBespokeStatus(id, status)
      .then(updatedOrder => {
        setBespokeOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
      })
      .catch(console.error);
  }, []);

  const updateBespokeStatus = useCallback((orderId: string, newStatus: BespokeOrderStatus, note: string) => {
    // Optimistic local update
    setBespokeOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const timelineEvent: BespokeTimelineEvent = {
          id: `tl-${Date.now()}`,
          status: newStatus,
          note,
          updatedBy: 'brand',
          createdAt: new Date().toISOString(),
        };
        const statusOrder: BespokeOrderStatus[] = ['consultation', 'design_approval', 'production', 'fitting', 'final_adjustments', 'complete'];
        const newStatusIndex = statusOrder.indexOf(newStatus);
        const updatedTimeline = order.timeline.map(step => {
          const stepIndex = statusOrder.indexOf(step.stage);
          if (stepIndex < newStatusIndex) {
            return { ...step, status: 'completed' as const, completedAt: step.completedAt || new Date().toISOString() };
          }
          if (step.stage === newStatus) {
            return { ...step, status: 'current' as const };
          }
          return { ...step, status: 'upcoming' as const };
        });
        return {
          ...order,
          status: newStatus,
          timeline: updatedTimeline,
          timelineEvents: [...(order.timelineEvents || []), timelineEvent],
          clientApprovalRequired: newStatus === 'design_approval',
          updatedAt: new Date().toISOString(),
        };
      })
    );
    // Real API call
    bespokeService.updateBrandBespokeStatus(orderId, newStatus, note)
      .then(updatedOrder => {
        setBespokeOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      })
      .catch(console.error);
  }, []);

  const sendBespokeMessage = useCallback((orderId: string, content: string) => {
    // Optimistic local update
    const newMessage: BespokeMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'brand-user',
      senderName: 'Brand Atelier',
      senderRole: 'brand',
      content,
      createdAt: new Date().toISOString(),
    };
    setBespokeOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, messages: [...(order.messages || []), newMessage] }
          : order
      )
    );
    // Real API call
    bespokeService.addBrandMessage(orderId, content)
      .then(updatedOrder => {
        setBespokeOrders(prev =>
          prev.map(o => o.id === orderId ? { ...o, messages: updatedOrder.messages } : o)
        );
      })
      .catch(console.error);
  }, []);

  const updateBespokePrice = useCallback((orderId: string, price: number, deposit: number) => {
    // Optimistic local update
    const depositPercentage = price > 0 ? Math.round((deposit / price) * 100) : 0;
    setBespokeOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, price, depositPaid: deposit, depositPercentage, updatedAt: new Date().toISOString() }
          : order
      )
    );
    // Real API call — PATCH /api/v1/brand/bespoke-orders/{id}
    bespokeService.updateBrandBespokeOrder(orderId, {
      price,
      deposite: deposit,
    })
      .then(updatedOrder => {
        setBespokeOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      })
      .catch(console.error);
  }, []);

  const updateBespokeTimelineDates = useCallback((orderId: string, stepDates: Record<string, string>, estimatedCompletion?: string) => {
    // Optimistic local update
    setBespokeOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const updatedTimeline = order.timeline.map(step => {
          if (stepDates[step.id]) {
            return { ...step, estimatedDate: stepDates[step.id] };
          }
          return step;
        });
        const lastStep = updatedTimeline[updatedTimeline.length - 1];
        const newCompletion = estimatedCompletion || lastStep?.estimatedDate || lastStep?.completedAt || order.estimatedCompletion;
        return { ...order, timeline: updatedTimeline, estimatedCompletion: newCompletion, updatedAt: new Date().toISOString() };
      })
    );
    // Real API call — convert step IDs to stage statuses for the backend
    const order = bespokeOrders.find(o => o.id === orderId);
    if (order) {
      const timelinePayload = order.timeline
        .filter(step => stepDates[step.id])
        .map(step => ({ status: step.stage, estimated_date: stepDates[step.id] }));
      if (timelinePayload.length > 0) {
        bespokeService.updateBrandBespokeTimelineDates(orderId, timelinePayload)
          .then(updatedOrder => {
            setBespokeOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
          })
          .catch(console.error);
      }
    }
    // Also update estimated completion if provided
    if (estimatedCompletion) {
      bespokeService.updateBrandBespokeOrder(orderId, {
        estimate_completation: estimatedCompletion,
      }).catch(console.error);
    }
  }, [bespokeOrders]);

  const getNegotiationById = useCallback((id: string): PriceNegotiation | undefined => {
    return priceNegotiations.find(n => n.id === id);
  }, [priceNegotiations]);

  const submitCounterOffer = useCallback((id: string, amount: number, brandMessage?: string) => {
    setPriceNegotiations(prev => prev.map(n =>
      n.id === id ? { ...n, counterOffer: amount, status: 'counter_offered' as NegotiationStatus, brandMessage: brandMessage || n.brandMessage, respondedAt: new Date().toISOString() } : n
    ));
    brandPortalService.submitCounterOffer(id, amount).catch(console.error);
  }, []);

  const approveNegotiation = useCallback((id: string, brandMessage?: string) => {
    setPriceNegotiations(prev => prev.map(n =>
      n.id === id ? { ...n, status: 'approved' as NegotiationStatus, brandMessage: brandMessage || n.brandMessage, respondedAt: new Date().toISOString() } : n
    ));
    brandPortalService.approveNegotiation(id).catch(console.error);
  }, []);

  const declineNegotiation = useCallback((id: string, brandMessage?: string) => {
    setPriceNegotiations(prev => prev.map(n =>
      n.id === id ? { ...n, status: 'declined' as NegotiationStatus, brandMessage: brandMessage || n.brandMessage, respondedAt: new Date().toISOString() } : n
    ));
    brandPortalService.declineNegotiation(id).catch(console.error);
  }, []);

  const getPrivateCollectionById = useCallback((id: string): PrivateCollection | undefined => {
    return privateCollections.find(c => c.id === id);
  }, [privateCollections]);

  const createPrivateCollection = useCallback((collection: Omit<PrivateCollection, 'id'>): PrivateCollection => {
    const optimistic: PrivateCollection = {
      ...collection,
      id: `priv-col-${Date.now()}`
    };
    setPrivateCollections(prev => [optimistic, ...prev]);

    // Call real API; on success replace the optimistic entry with the real one
    privateCollectionService.createPrivateCollection({
      private_collection_name: collection.name,
      description: collection.description,
      image_url: collection.heroImage,
      access_level: collection.accessLevel,
      preview_date: collection.previewDate || null,
      release_date: collection.releaseDate || null,
      products: collection.products.map(p => p.id),
    }).then(real => {
      setPrivateCollections(prev => [real, ...prev.filter(c => c.id !== optimistic.id)]);
    }).catch(() => {
      // keep optimistic entry on failure
    });

    return optimistic;
  }, []);

  const updatePrivateCollection = useCallback((id: string, updates: Partial<PrivateCollection>) => {
    setPrivateCollections(prev => prev.map(c =>
      c.id === id ? { ...c, ...updates } : c
    ));
    const apiPayload: Parameters<typeof privateCollectionService.updatePrivateCollection>[1] = {};
    if (updates.name !== undefined) apiPayload.private_collection_name = updates.name;
    if (updates.description !== undefined) apiPayload.description = updates.description;
    if (updates.heroImage !== undefined) apiPayload.image_url = updates.heroImage;
    if (updates.accessLevel !== undefined) apiPayload.access_level = updates.accessLevel;
    if (updates.previewDate !== undefined) apiPayload.preview_date = updates.previewDate;
    if (updates.releaseDate !== undefined) apiPayload.release_date = updates.releaseDate;
    if (updates.products !== undefined) apiPayload.products = updates.products.map(p => p.id);
    privateCollectionService.updatePrivateCollection(id, apiPayload).catch(console.error);
  }, []);

  const deletePrivateCollection = useCallback((collectionId: string) => {
    // Remove from local state only — soft-delete (PATCH is_active=false) is handled by the caller
    setPrivateCollections(prev => prev.filter(col => col.id !== collectionId));
  }, []);

  const sendCollectionInvitation = useCallback((collectionId: string, clientIds: string[], _message?: string) => {
    setPrivateCollections(prev =>
      prev.map(col =>
        col.id === collectionId
          ? {
              ...col,
              invitedClients: [
                ...(col.invitedClients || []),
                ...clientIds.filter(id => !(col.invitedClients || []).includes(id))
              ]
            }
          : col
      )
    );
  }, []);

  const approveAccessRequest = useCallback((collectionId: string, requestId: string, reviewNote?: string) => {
    setPrivateCollections(prev =>
      prev.map(col =>
        col.id === collectionId
          ? {
              ...col,
              accessRequests: (col.accessRequests || []).map(req =>
                req.id === requestId
                  ? { ...req, status: 'approved' as const, reviewedAt: new Date().toISOString(), reviewNote: reviewNote || '' }
                  : req
              )
            }
          : col
      )
    );
  }, []);

  const denyAccessRequest = useCallback((collectionId: string, requestId: string, reviewNote?: string) => {
    setPrivateCollections(prev =>
      prev.map(col =>
        col.id === collectionId
          ? {
              ...col,
              accessRequests: (col.accessRequests || []).map(req =>
                req.id === requestId
                  ? { ...req, status: 'denied' as const, reviewedAt: new Date().toISOString(), reviewNote: reviewNote || '' }
                  : req
              )
            }
          : col
      )
    );
  }, []);

  const getSourcingRequestById = useCallback((id: string): SourcingRequest | undefined => {
    return mergedSourcingRequests.find(r => r.id === id);
  }, [mergedSourcingRequests]);

  const submitSourcingOption = useCallback((requestId: string, option: {
    customDescription: string;
    price: number;
    condition: 'new' | 'like_new' | 'excellent' | 'good';
    source?: string;
    conciergeRecommendation?: string;
  }) => {
    setSourcingRequests(prev => prev.map(request => {
      if (request.id !== requestId) return request;
      const newOption = {
        id: `option-${Date.now()}`,
        customDescription: option.customDescription,
        source: option.source || 'Brand Inventory',
        condition: option.condition,
        price: option.price,
        conciergeRecommendation: option.conciergeRecommendation,
        images: []
      };
      return {
        ...request,
        foundOptions: [...request.foundOptions, newOption],
        status: request.status === 'pending' ? 'sourcing' : request.status,
        updatedAt: new Date().toISOString()
      };
    }));
    brandPortalService.submitSourcingOption(requestId, {
      description: option.customDescription,
      price: option.price,
      condition: option.condition,
      source: option.source,
    }).catch(console.error);
  }, []);

  const updateSourcingStatus = useCallback((requestId: string, newStatus: SourcingRequestStatus, note: string) => {
    setSourcingRequests(prev =>
      prev.map(req => {
        if (req.id !== requestId) return req;
        return {
          ...req,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          timeline: [
            ...(req.timeline || []),
            {
              id: `tl-${Date.now()}`,
              status: newStatus,
              note,
              updatedBy: 'brand' as const,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      })
    );
    // Persist to shared localStorage so UHNI side can see it
    writeBrandStatusUpdate(requestId, newStatus);
  }, []);

  const addSourcingOption = useCallback((requestId: string, option: Omit<SourcingOption, 'id' | 'addedAt' | 'source' | 'condition' | 'images'>) => {
    const newOption: SourcingOption = {
      ...option,
      id: `opt-${Date.now()}`,
      addedAt: new Date().toISOString(),
      customDescription: option.title || option.customDescription || '',
      source: option.sourceLocation || 'Brand Inventory',
      condition: 'new',
      images: option.imageUrl ? [option.imageUrl] : [],
    };
    setSourcingRequests(prev =>
      prev.map(req => {
        if (req.id !== requestId) return req;
        return {
          ...req,
          foundOptions: [...req.foundOptions, newOption],
          status: 'options_found' as SourcingRequestStatus,
          updatedAt: new Date().toISOString(),
          timeline: [
            ...(req.timeline || []),
            {
              id: `tl-${Date.now()}`,
              status: 'options_found' as SourcingRequestStatus,
              note: `Option added: ${option.title || option.customDescription || 'New option'}`,
              updatedBy: 'brand' as const,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      })
    );
    // Persist to shared localStorage so UHNI side can see it
    writeBrandOptionToUhni(requestId, newOption);
  }, []);

  const updateSourcingOption = useCallback((requestId: string, optionId: string, updates: Partial<SourcingOption>) => {
    setSourcingRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, foundOptions: req.foundOptions.map(o => o.id === optionId ? { ...o, ...updates } : o), updatedAt: new Date().toISOString() }
          : req
      )
    );
  }, []);

  const removeSourcingOption = useCallback((requestId: string, optionId: string) => {
    setSourcingRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, foundOptions: req.foundOptions.filter(o => o.id !== optionId) }
          : req
      )
    );
  }, []);

  const sendSourcingMessage = useCallback((requestId: string, content: string) => {
    const newMessage: SourcingMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'brand-user',
      senderName: 'Sourcing Team',
      senderRole: 'brand',
      content,
      createdAt: new Date().toISOString(),
    };
    setSourcingRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, messages: [...(req.messages || []), newMessage] }
          : req
      )
    );
    // Persist to shared localStorage so UHNI side can see it
    writeBrandMessage(requestId, content);
  }, []);

  const getHeritageEventById = useCallback((id: string): HeritageEvent | undefined => {
    return heritageEvents.find(e => e.id === id);
  }, [heritageEvents]);

  const createHeritageEvent = useCallback((event: Omit<HeritageEvent, 'id' | 'createdAt' | 'updatedAt'>): HeritageEvent => {
    const newEvent: HeritageEvent = {
      ...event,
      id: `heritage-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setHeritageEvents(prev => [...prev, newEvent].sort((a, b) => b.year - a.year));
    brandPortalService.createHeritageEvent(event).catch(console.error);
    return newEvent;
  }, []);

  const updateHeritageEvent = useCallback((id: string, updates: Partial<HeritageEvent>) => {
    setHeritageEvents(prev => prev.map(e =>
      e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
    ));
    brandPortalService.updateHeritageEvent(id, updates).catch(console.error);
  }, []);

  const deleteHeritageEvent = useCallback((id: string) => {
    setHeritageEvents(prev => prev.map(e =>
      e.id === id ? { ...e, isDeleted: true, updatedAt: new Date().toISOString() } : e
    ));
  }, []);

  const getBrandStoryById = useCallback((id: string): BrandStory | undefined => {
    return brandStories.find(s => s.id === id);
  }, [brandStories]);

  const createBrandStory = useCallback((story: Omit<BrandStory, 'id' | 'createdAt' | 'updatedAt'>): BrandStory => {
    const newStory: BrandStory = {
      ...story,
      id: `story-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setBrandStories(prev => [newStory, ...prev]);
    brandPortalService.createBrandStory(story).catch(console.error);
    return newStory;
  }, []);

  const updateBrandStory = useCallback((id: string, updates: Partial<BrandStory>) => {
    setBrandStories(prev => prev.map(s =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    ));
    brandPortalService.updateBrandStory(id, updates).catch(console.error);
  }, []);

  const deleteBrandStory = useCallback((id: string) => {
    setBrandStories(prev => prev.map(s =>
      s.id === id ? { ...s, isDeleted: true, updatedAt: new Date().toISOString() } : s
    ));
    brandPortalService.deleteBrandStory(id).catch(console.error);
  }, []);

  const getUHNIOfferById = useCallback((id: string): UHNIPriceOffer | undefined => {
    return uhniOffers.find(o => o.id === id);
  }, [uhniOffers]);

  const createUHNIOffer = useCallback((offer: Omit<UHNIPriceOffer, 'id'>): UHNIPriceOffer => {
    const newOffer: UHNIPriceOffer = {
      ...offer,
      id: `offer-${Date.now()}`
    };
    setUhniOffers(prev => [newOffer, ...prev]);
    addSharedOffer(newOffer);
    brandPortalService.createUHNIOffer(offer).catch(console.error);
    return newOffer;
  }, []);

  const getStylingSessionById = useCallback((id: string): StylingSession | undefined => {
    return stylingSessions.find(s => s.id === id);
  }, [stylingSessions]);

  const updateStylingSessionStatus = useCallback((id: string, status: StylingSession['status'], extras?: Partial<StylingSession>) => {
    setStylingSessions(prev => prev.map(s =>
      s.id === id ? { ...s, ...extras, status, updatedAt: new Date().toISOString() } : s
    ));
    updateSharedSessionStatus(id, status, extras);
    brandPortalService.updateStylingSessionStatus(id, status).catch(console.error);
  }, []);

  const createStylingSession = useCallback((session: Omit<StylingSession, 'id'>) => {
    const newSession: StylingSession = {
      ...session,
      id: `styling-${Date.now()}`
    };
    setStylingSessions(prev => [newSession, ...prev]);
    addSessionToStore(newSession);
    brandPortalService.createStylingSession(session).catch(console.error);
  }, []);

  // ============================================
  // Commerce Settings
  // ============================================

  const updateTaxRule = useCallback((ruleId: string, updates: Partial<TaxRule>) => {
    setCommerceSettings(prev => ({
      ...prev,
      taxRules: prev.taxRules.map(rule =>
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    }));
  }, []);

  const updateShippingMethod = useCallback((methodId: string, updates: Partial<ShippingMethod>) => {
    setCommerceSettings(prev => ({
      ...prev,
      shippingMethods: prev.shippingMethods.map(method =>
        method.id === methodId ? { ...method, ...updates } : method
      )
    }));
  }, []);

  const addShippingMethod = useCallback((method: Omit<ShippingMethod, 'id'>) => {
    setCommerceSettings(prev => ({
      ...prev,
      shippingMethods: [
        ...prev.shippingMethods,
        { ...method, id: `ship-${Date.now()}` }
      ]
    }));
  }, []);

  const removeShippingMethod = useCallback((methodId: string) => {
    setCommerceSettings(prev => ({
      ...prev,
      shippingMethods: prev.shippingMethods.filter(m => m.id !== methodId)
    }));
  }, []);

  const updateCommerceConfig = useCallback((updates: Partial<CommerceSettings>) => {
    setCommerceSettings(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <BrandContext.Provider
      value={{
        partner,
        isAuthenticated,
        isHydrated,
        isLoading,
        error,
        products,
        getProductById,
        updateProduct,
        createProduct,
        deleteProduct,
        collections,
        getCollectionById,
        createCollection,
        updateCollection,
        deleteCollection,
        orders,
        getOrderById,
        updateOrderStatus,
        inventory,
        resolveAlert,
        analytics,
        recentActivity,
        // UHNI Features
        bespokeOrders,
        getBespokeOrderById,
        updateBespokeOrderStatus,
        updateBespokeStatus,
        sendBespokeMessage,
        updateBespokePrice,
        updateBespokeTimelineDates,
        priceNegotiations,
        getNegotiationById,
        submitCounterOffer,
        approveNegotiation,
        declineNegotiation,
        privateCollections,
        getPrivateCollectionById,
        createPrivateCollection,
        updatePrivateCollection,
        deletePrivateCollection,
        sendCollectionInvitation,
        approveAccessRequest,
        denyAccessRequest,
        sourcingRequests: mergedSourcingRequests,
        getSourcingRequestById,
        submitSourcingOption,
        updateSourcingStatus,
        addSourcingOption,
        updateSourcingOption,
        removeSourcingOption,
        sendSourcingMessage,
        heritageEvents,
        getHeritageEventById,
        createHeritageEvent,
        updateHeritageEvent,
        deleteHeritageEvent,
        brandStories,
        getBrandStoryById,
        createBrandStory,
        updateBrandStory,
        deleteBrandStory,
        uhniOffers,
        getUHNIOfferById,
        createUHNIOffer,
        stylingSessions: mergedStylingSessions,
        getStylingSessionById,
        updateStylingSessionStatus,
        createStylingSession,
        // Commerce Settings
        commerceSettings,
        updateTaxRule,
        updateShippingMethod,
        addShippingMethod,
        removeShippingMethod,
        updateCommerceConfig,
        // Auth
        loginAsBrand,
        logout,
        getAccessToken
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
}
