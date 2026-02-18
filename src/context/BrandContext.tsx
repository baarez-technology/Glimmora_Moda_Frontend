'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type {
  BrandPartner,
  BrandProduct,
  BrandCollection,
  GlobalInventoryOverview,
  BrandAnalytics,
  BrandOrder,
  RecentActivity,
  HeritageEvent,
  BrandStory,
  StylingSession
} from '@/types/brand-portal';
import type {
  BespokeOrder,
  BespokeOrderStatus,
  PriceNegotiation,
  NegotiationStatus,
  PrivateCollection,
  SourcingRequest,
  UHNIPriceOffer
} from '@/types/uhni';
import * as brandPortalService from '@/services/brand-portal.service';

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

  // Orders
  orders: BrandOrder[];
  getOrderById: (id: string) => BrandOrder | undefined;

  // Inventory
  inventory: GlobalInventoryOverview | null;

  // Analytics
  analytics: BrandAnalytics | null;

  // Recent Activity
  recentActivity: RecentActivity[];

  // UHNI Features
  bespokeOrders: BespokeOrder[];
  getBespokeOrderById: (id: string) => BespokeOrder | undefined;
  updateBespokeOrderStatus: (id: string, status: BespokeOrderStatus) => void;

  priceNegotiations: PriceNegotiation[];
  getNegotiationById: (id: string) => PriceNegotiation | undefined;
  submitCounterOffer: (id: string, amount: number) => void;
  approveNegotiation: (id: string) => void;
  declineNegotiation: (id: string) => void;

  privateCollections: PrivateCollection[];
  getPrivateCollectionById: (id: string) => PrivateCollection | undefined;
  createPrivateCollection: (collection: Omit<PrivateCollection, 'id'>) => PrivateCollection;
  updatePrivateCollection: (id: string, updates: Partial<PrivateCollection>) => void;

  sourcingRequests: SourcingRequest[];
  getSourcingRequestById: (id: string) => SourcingRequest | undefined;
  submitSourcingOption: (requestId: string, option: {
    customDescription: string;
    price: number;
    condition: 'new' | 'like_new' | 'excellent' | 'good';
    source?: string;
    conciergeRecommendation?: string;
  }) => void;

  heritageEvents: HeritageEvent[];
  getHeritageEventById: (id: string) => HeritageEvent | undefined;
  createHeritageEvent: (event: Omit<HeritageEvent, 'id' | 'createdAt' | 'updatedAt'>) => HeritageEvent;

  brandStories: BrandStory[];
  getBrandStoryById: (id: string) => BrandStory | undefined;
  createBrandStory: (story: Omit<BrandStory, 'id' | 'createdAt' | 'updatedAt'>) => BrandStory;
  updateBrandStory: (id: string, updates: Partial<BrandStory>) => void;

  uhniOffers: UHNIPriceOffer[];
  getUHNIOfferById: (id: string) => UHNIPriceOffer | undefined;
  createUHNIOffer: (offer: Omit<UHNIPriceOffer, 'id'>) => UHNIPriceOffer;

  stylingSessions: StylingSession[];
  getStylingSessionById: (id: string) => StylingSession | undefined;
  updateStylingSessionStatus: (id: string, status: StylingSession['status']) => void;
  createStylingSession: (session: Omit<StylingSession, 'id'>) => void;

  // Auth
  loginAsBrand: () => void;
  logout: () => void;
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

  // Load all brand data from service
  const loadBrandData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await brandPortalService.getBrandDashboardData();
      if (response.success) {
        const d = response.data;
        setPartner(d.partner);
        setProducts(d.products);
        setCollections(d.collections);
        setOrders(d.orders);
        setInventory(d.inventory);
        setAnalytics(d.analytics);
        setRecentActivity(d.recentActivity);
        setBespokeOrders(d.bespokeOrders);
        setPriceNegotiations(d.priceNegotiations);
        setPrivateCollections(d.privateCollections);
        setSourcingRequests(d.sourcingRequests);
        setHeritageEvents(d.heritageEvents);
        setBrandStories(d.brandStories);
        setUhniOffers(d.uhniOffers);
        setStylingSessions(d.stylingSessions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brand data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('moda-brand-auth');
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
        loadBrandData();
      }
    } catch (err) {
      console.error('Failed to load brand auth state:', err);
    }
    setIsHydrated(true);
  }, [loadBrandData]);

  // Save auth state to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('moda-brand-auth', isAuthenticated.toString());
      } catch (err) {
        console.error('Failed to save brand auth state:', err);
      }
    }
  }, [isAuthenticated, isHydrated]);

  const loginAsBrand = useCallback(() => {
    setIsAuthenticated(true);
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
    try {
      localStorage.removeItem('moda-brand-auth');
    } catch (err) {
      console.error('Failed to clear brand auth:', err);
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
    setProducts(prev => prev.filter(p => p.id !== id));
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

  const getOrderById = useCallback((id: string): BrandOrder | undefined => {
    return orders.find(o => o.id === id);
  }, [orders]);

  // ============================================
  // UHNI Features
  // ============================================

  const getBespokeOrderById = useCallback((id: string): BespokeOrder | undefined => {
    return bespokeOrders.find(o => o.id === id);
  }, [bespokeOrders]);

  const updateBespokeOrderStatus = useCallback((id: string, status: BespokeOrderStatus) => {
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
    brandPortalService.updateBespokeOrderStatus(id, status).catch(console.error);
  }, []);

  const getNegotiationById = useCallback((id: string): PriceNegotiation | undefined => {
    return priceNegotiations.find(n => n.id === id);
  }, [priceNegotiations]);

  const submitCounterOffer = useCallback((id: string, amount: number) => {
    setPriceNegotiations(prev => prev.map(n =>
      n.id === id ? { ...n, counterOffer: amount, status: 'counter_offered' as NegotiationStatus } : n
    ));
    brandPortalService.submitCounterOffer(id, amount).catch(console.error);
  }, []);

  const approveNegotiation = useCallback((id: string) => {
    setPriceNegotiations(prev => prev.map(n =>
      n.id === id ? { ...n, status: 'approved' as NegotiationStatus } : n
    ));
    brandPortalService.approveNegotiation(id).catch(console.error);
  }, []);

  const declineNegotiation = useCallback((id: string) => {
    setPriceNegotiations(prev => prev.map(n =>
      n.id === id ? { ...n, status: 'declined' as NegotiationStatus } : n
    ));
    brandPortalService.declineNegotiation(id).catch(console.error);
  }, []);

  const getPrivateCollectionById = useCallback((id: string): PrivateCollection | undefined => {
    return privateCollections.find(c => c.id === id);
  }, [privateCollections]);

  const createPrivateCollection = useCallback((collection: Omit<PrivateCollection, 'id'>): PrivateCollection => {
    const newCollection: PrivateCollection = {
      ...collection,
      id: `priv-col-${Date.now()}`
    };
    setPrivateCollections(prev => [newCollection, ...prev]);
    brandPortalService.createPrivateCollection(collection).catch(console.error);
    return newCollection;
  }, []);

  const updatePrivateCollection = useCallback((id: string, updates: Partial<PrivateCollection>) => {
    setPrivateCollections(prev => prev.map(c =>
      c.id === id ? { ...c, ...updates } : c
    ));
    brandPortalService.updatePrivateCollection(id, updates).catch(console.error);
  }, []);

  const getSourcingRequestById = useCallback((id: string): SourcingRequest | undefined => {
    return sourcingRequests.find(r => r.id === id);
  }, [sourcingRequests]);

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

  const getUHNIOfferById = useCallback((id: string): UHNIPriceOffer | undefined => {
    return uhniOffers.find(o => o.id === id);
  }, [uhniOffers]);

  const createUHNIOffer = useCallback((offer: Omit<UHNIPriceOffer, 'id'>): UHNIPriceOffer => {
    const newOffer: UHNIPriceOffer = {
      ...offer,
      id: `offer-${Date.now()}`
    };
    setUhniOffers(prev => [newOffer, ...prev]);
    brandPortalService.createUHNIOffer(offer).catch(console.error);
    return newOffer;
  }, []);

  const getStylingSessionById = useCallback((id: string): StylingSession | undefined => {
    return stylingSessions.find(s => s.id === id);
  }, [stylingSessions]);

  const updateStylingSessionStatus = useCallback((id: string, status: StylingSession['status']) => {
    setStylingSessions(prev => prev.map(s =>
      s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s
    ));
    brandPortalService.updateStylingSessionStatus(id, status).catch(console.error);
  }, []);

  const createStylingSession = useCallback((session: Omit<StylingSession, 'id'>) => {
    const newSession: StylingSession = {
      ...session,
      id: `styling-${Date.now()}`
    };
    setStylingSessions(prev => [newSession, ...prev]);
    brandPortalService.createStylingSession(session).catch(console.error);
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
        orders,
        getOrderById,
        inventory,
        analytics,
        recentActivity,
        // UHNI Features
        bespokeOrders,
        getBespokeOrderById,
        updateBespokeOrderStatus,
        priceNegotiations,
        getNegotiationById,
        submitCounterOffer,
        approveNegotiation,
        declineNegotiation,
        privateCollections,
        getPrivateCollectionById,
        createPrivateCollection,
        updatePrivateCollection,
        sourcingRequests,
        getSourcingRequestById,
        submitSourcingOption,
        heritageEvents,
        getHeritageEventById,
        createHeritageEvent,
        brandStories,
        getBrandStoryById,
        createBrandStory,
        updateBrandStory,
        uhniOffers,
        getUHNIOfferById,
        createUHNIOffer,
        stylingSessions,
        getStylingSessionById,
        updateStylingSessionStatus,
        createStylingSession,
        // Auth
        loginAsBrand,
        logout
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
