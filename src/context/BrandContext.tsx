'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type {
  BrandPartner,
  BrandProduct,
  BrandCollection,
  GlobalInventoryOverview,
  BrandAnalytics,
  BrandOrder,
  RecentActivity
} from '@/types/brand-portal';
import {
  mockBrandPartner,
  mockBrandProducts,
  mockBrandCollections,
  mockGlobalInventory,
  mockBrandAnalytics,
  mockRecentActivity,
  mockBrandOrders
} from '@/data/brand-portal';

interface BrandContextType {
  // Brand Partner
  partner: BrandPartner | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  // Products
  products: BrandProduct[];
  getProductById: (id: string) => BrandProduct | undefined;
  updateProduct: (id: string, updates: Partial<BrandProduct>) => void;
  createProduct: (product: Omit<BrandProduct, 'id' | 'createdAt' | 'updatedAt'>) => BrandProduct;

  // Collections
  collections: BrandCollection[];
  getCollectionById: (id: string) => BrandCollection | undefined;

  // Orders
  orders: BrandOrder[];
  getOrderById: (id: string) => BrandOrder | undefined;

  // Inventory
  inventory: GlobalInventoryOverview;

  // Analytics
  analytics: BrandAnalytics;

  // Recent Activity
  recentActivity: RecentActivity[];

  // Auth
  loginAsBrand: () => void;
  logout: () => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [partner, setPartner] = useState<BrandPartner | null>(null);
  const [products, setProducts] = useState<BrandProduct[]>([]);
  const [collections, setCollections] = useState<BrandCollection[]>([]);
  const [orders, setOrders] = useState<BrandOrder[]>([]);
  const [inventory, setInventory] = useState<GlobalInventoryOverview>(mockGlobalInventory);
  const [analytics, setAnalytics] = useState<BrandAnalytics>(mockBrandAnalytics);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('moda-brand-auth');
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
        setPartner(mockBrandPartner);
        setProducts(mockBrandProducts);
        setCollections(mockBrandCollections);
        setOrders(mockBrandOrders);
        setInventory(mockGlobalInventory);
        setAnalytics(mockBrandAnalytics);
        setRecentActivity(mockRecentActivity);
      }
    } catch (error) {
      console.error('Failed to load brand auth state:', error);
    }
    setIsHydrated(true);
  }, []);

  // Save auth state to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('moda-brand-auth', isAuthenticated.toString());
      } catch (error) {
        console.error('Failed to save brand auth state:', error);
      }
    }
  }, [isAuthenticated, isHydrated]);

  const loginAsBrand = useCallback(() => {
    setIsAuthenticated(true);
    setPartner(mockBrandPartner);
    setProducts(mockBrandProducts);
    setCollections(mockBrandCollections);
    setOrders(mockBrandOrders);
    setInventory(mockGlobalInventory);
    setAnalytics(mockBrandAnalytics);
    setRecentActivity(mockRecentActivity);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setPartner(null);
    setProducts([]);
    setCollections([]);
    setOrders([]);
    setRecentActivity([]);
    try {
      localStorage.removeItem('moda-brand-auth');
    } catch (error) {
      console.error('Failed to clear brand auth:', error);
    }
  }, []);

  const getProductById = useCallback((id: string): BrandProduct | undefined => {
    return products.find(p => p.id === id);
  }, [products]);

  const updateProduct = useCallback((id: string, updates: Partial<BrandProduct>) => {
    setProducts(prev => prev.map(p =>
      p.id === id
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ));
  }, []);

  const createProduct = useCallback((productData: Omit<BrandProduct, 'id' | 'createdAt' | 'updatedAt'>): BrandProduct => {
    const newProduct: BrandProduct = {
      ...productData,
      id: `dior-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  }, []);

  const getCollectionById = useCallback((id: string): BrandCollection | undefined => {
    return collections.find(c => c.id === id);
  }, [collections]);

  const getOrderById = useCallback((id: string): BrandOrder | undefined => {
    return orders.find(o => o.id === id);
  }, [orders]);

  return (
    <BrandContext.Provider
      value={{
        partner,
        isAuthenticated,
        isHydrated,
        products,
        getProductById,
        updateProduct,
        createProduct,
        collections,
        getCollectionById,
        orders,
        getOrderById,
        inventory,
        analytics,
        recentActivity,
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
