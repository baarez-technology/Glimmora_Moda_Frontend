'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { UserTier } from '@/types';
import * as authService from '@/services/auth.service';
import type { UserData } from '@/services/auth.service';
import { clearCache } from '@/lib/api-cache';

interface AuthContextType {
  userTier: UserTier;
  userRole: UserTier; // Alias for consistency
  isUHNI: boolean;
  isAuthenticated: boolean;
  isHydrated: boolean; // Indicates if auth state loaded from localStorage
  isLoggingOut: boolean; // Flag to prevent auth redirects during logout
  userData: UserData | null; // Real user data from backend
  setUserRole: (tier: UserTier) => void;
  setUserData: (data: UserData | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapRoleToTier(role: string): UserTier {
  if (role === 'uhni') return 'uhni';
  return 'preferred'; // consumer maps to preferred
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userTier, setUserTier] = useState<UserTier>('standard');
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Computed values
  const isUHNI = userTier === 'uhni';
  const isAuthenticated = userTier !== 'standard';

  // Load session on mount
  useEffect(() => {
    // First check for real user data (API-based auth)
    const storedUser = authService.getStoredUserData();
    const storedToken = authService.getStoredUserToken();

    if (storedUser && storedToken) {
      setUserDataState(storedUser);
      setUserTier(mapRoleToTier(storedUser.role));
    } else {
      // Fallback to legacy tier from localStorage (demo mode)
      authService.getCurrentSession().then(response => {
        if (response.success && response.data && response.data.userTier !== 'standard') {
          setUserTier(response.data.userTier);
        }
      }).catch(() => {
        // Failed to load session, stay as standard
      });
    }

    setIsHydrated(true);
  }, []);

  // Persist tier changes to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('moda-user-tier', userTier);
    }
  }, [userTier, isHydrated]);

  const setUserRole = useCallback((tier: UserTier) => {
    setUserTier(tier);
  }, []);

  const setUserData = useCallback((data: UserData | null) => {
    setUserDataState(data);
    if (data) {
      setUserTier(mapRoleToTier(data.role));
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoggingOut(true);
    setUserTier('standard');
    setUserDataState(null);
    clearCache(); // Purge all cached API data to prevent user data leaking to next session
    authService.userLogout();
    authService.logout().catch(console.error);
    // Clear all session storage to prevent stale cart/wishlist/wardrobe data
    try { sessionStorage.clear(); } catch { /* SSR safety */ }
    setTimeout(() => setIsLoggingOut(false), 500);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userTier,
        userRole: userTier,
        isUHNI,
        isAuthenticated,
        isHydrated,
        isLoggingOut,
        userData,
        setUserRole,
        setUserData,
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
