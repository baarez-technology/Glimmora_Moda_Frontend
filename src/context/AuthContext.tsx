'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserTier } from '@/types';
import * as authService from '@/services/auth.service';

interface AuthContextType {
  userTier: UserTier;
  userRole: UserTier; // Alias for consistency
  isUHNI: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean; // Indicates if auth state loaded from localStorage
  isLoggingOut: boolean; // Flag to prevent auth redirects during logout
  setUserRole: (tier: UserTier) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userTier, setUserTier] = useState<UserTier>('standard');
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Computed values
  const isUHNI = userTier === 'uhni';
  const isAuthenticated = userTier !== 'standard';

  // Load session on mount via service
  useEffect(() => {
    authService.getCurrentSession().then(response => {
      if (response.success && response.data && response.data.userTier !== 'standard') {
        setUserTier(response.data.userTier);
      }
    }).catch(() => {
      // Failed to load session, stay as standard
    }).finally(() => {
      setIsHydrated(true);
    });
  }, []);

  // Persist tier changes to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('moda-user-tier', userTier);
    }
  }, [userTier, isHydrated]);

  const setUserRole = (tier: UserTier) => {
    setUserTier(tier);
  };

  const logout = () => {
    setIsLoggingOut(true);
    setUserTier('standard');
    authService.logout().catch(console.error);
    setTimeout(() => setIsLoggingOut(false), 500);
  };

  return (
    <AuthContext.Provider
      value={{
        userTier,
        userRole: userTier,
        isUHNI,
        isAuthenticated,
        isHydrated,
        isLoggingOut,
        setUserRole,
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
