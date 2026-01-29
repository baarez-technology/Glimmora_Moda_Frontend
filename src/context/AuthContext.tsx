'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserTier } from '@/types';

interface AuthContextType {
  userTier: UserTier;
  userRole: UserTier; // Alias for consistency
  isUHNI: boolean;
  isBrand: boolean; // For brand partner portal access
  isAuthenticated: boolean;
  isHydrated: boolean; // Indicates if auth state loaded from localStorage
  isLoggingOut: boolean; // Flag to prevent auth redirects during logout
  setUserRole: (tier: UserTier) => void;
  setBrandMode: (isBrand: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userTier, setUserTier] = useState<UserTier>('standard');
  const [isBrand, setIsBrand] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Computed values
  const isUHNI = userTier === 'uhni';
  const isAuthenticated = userTier !== 'standard' || isBrand;

  // Load user tier from localStorage on mount with error handling
  useEffect(() => {
    try {
      const storedTier = localStorage.getItem('moda-user-tier') as UserTier | null;
      if (storedTier && ['standard', 'preferred', 'uhni'].includes(storedTier)) {
        setUserTier(storedTier);
      }
      const storedBrandMode = localStorage.getItem('moda-brand-mode');
      if (storedBrandMode === 'true') {
        setIsBrand(true);
      }
    } catch (error) {
      console.error('Failed to load user tier from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('moda-user-tier');
      localStorage.removeItem('moda-brand-mode');
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save user tier to localStorage when it changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem('moda-user-tier', userTier);
      } catch (error) {
        console.error('Failed to save user tier to localStorage:', error);
      }
    }
  }, [userTier, isHydrated]);

  const setUserRole = (tier: UserTier) => {
    setUserTier(tier);
  };

  const setBrandMode = (brandMode: boolean) => {
    setIsBrand(brandMode);
    try {
      if (brandMode) {
        localStorage.setItem('moda-brand-mode', 'true');
      } else {
        localStorage.removeItem('moda-brand-mode');
      }
    } catch (error) {
      console.error('Failed to save brand mode to localStorage:', error);
    }
  };

  const logout = () => {
    // Set logging out flag first to prevent auth redirects
    setIsLoggingOut(true);
    setUserTier('standard');
    setIsBrand(false);
    try {
      // Clear authentication data
      localStorage.removeItem('moda-user-tier');
      localStorage.removeItem('moda-brand-mode');

      // Clear sensitive account-specific data
      localStorage.removeItem('moda-wardrobe');
      localStorage.removeItem('moda-orders');

      // NOTE: We intentionally KEEP these for better UX:
      // - moda-considerations: Users' curated wishlist persists for aspirational browsing
      // - moda-wishlist: Same reason - don't lose their saved items
    } catch (error) {
      console.error('Failed to clear localStorage on logout:', error);
    }

    // Reset logging out flag after a brief delay
    setTimeout(() => setIsLoggingOut(false), 500);
  };

  return (
    <AuthContext.Provider
      value={{
        userTier,
        userRole: userTier,
        isUHNI,
        isBrand,
        isAuthenticated,
        isHydrated,
        isLoggingOut,
        setUserRole,
        setBrandMode,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
