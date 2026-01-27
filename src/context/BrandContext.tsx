'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Import types from modular type file
import type {
  BrandPartner,
  BrandDashboardStats,
  BrandBespokeRequest,
  BrandAnalytics,
  BrandCollection,
  BrandAGIConfig
} from '@/types/brand-partner';

// Import mock data from modular data file
import {
  mockBrandPartner,
  mockBrandDashboardStats,
  mockBrandBespokeRequests,
  mockBrandAnalytics,
  mockBrandCollections,
  mockBrandAGIConfig
} from '@/data/brand-partner';

// Re-export types for backwards compatibility
export type {
  BrandPartner,
  BrandDashboardStats,
  BrandBespokeRequest,
  BrandAnalytics,
  BrandCollection,
  BrandAGIConfig
} from '@/types/brand-partner';

interface BrandContextType {
  brandPartner: BrandPartner | null;
  brandDashboardStats: BrandDashboardStats | null;
  brandBespokeRequests: BrandBespokeRequest[] | null;
  brandAnalytics: BrandAnalytics | null;
  brandAGIConfig: BrandAGIConfig | null;
  brandCollections: BrandCollection[] | null;
  brandProductInventory: unknown[] | null;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const { isBrand } = useAuth();

  // Brand Partner-specific data (only loaded for Brand users)
  const brandPartner = isBrand ? mockBrandPartner : null;
  const brandDashboardStats = isBrand ? mockBrandDashboardStats : null;
  const brandBespokeRequests = isBrand ? mockBrandBespokeRequests : null;
  const brandAnalytics = isBrand ? mockBrandAnalytics : null;
  const brandAGIConfig = isBrand ? mockBrandAGIConfig : null;
  const brandCollections = isBrand ? mockBrandCollections : null;
  const brandProductInventory = isBrand ? [] : null;

  return (
    <BrandContext.Provider
      value={{
        brandPartner,
        brandDashboardStats,
        brandBespokeRequests,
        brandAnalytics,
        brandAGIConfig,
        brandCollections,
        brandProductInventory
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
