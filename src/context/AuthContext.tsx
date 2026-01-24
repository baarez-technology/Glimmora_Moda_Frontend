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
  setUserRole: (tier: UserTier) => void;
  setBrandMode: (isBrand: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userTier, setUserTier] = useState<UserTier>('standard');
  const [isBrand, setIsBrand] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

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
    setUserTier('standard');
    setIsBrand(false);
    try {
      localStorage.removeItem('moda-user-tier');
      localStorage.removeItem('moda-brand-mode');
      // Clear other user-specific data on logout
      localStorage.removeItem('moda-considerations');
      localStorage.removeItem('moda-wardrobe');
      localStorage.removeItem('moda-wishlist');
      localStorage.removeItem('moda-orders');
    } catch (error) {
      console.error('Failed to clear localStorage on logout:', error);
    }
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
