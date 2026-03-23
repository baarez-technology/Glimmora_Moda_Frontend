'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import type { UserTier } from '@/types';
import * as authService from '@/services/auth.service';
import type { UserData } from '@/services/auth.service';
import { clearCache } from '@/lib/api-cache';
import { getSessionTimeout } from '@/lib/platform-config';

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

  // ── Session Timeout ───────────────────────────────────────────────────────
  // Auto-logout after the admin-configured session timeout.
  // Resets on user activity (click, keypress, mousemove, scroll).
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutRef = useRef<(() => void) | null>(null);

  // Keep a stable reference to the logout function for the timeout handler
  // (actual `logout` callback is defined below; we update the ref after it's created)
  useEffect(() => {
    if (!isAuthenticated || !isHydrated) return;

    const timeoutSeconds = getSessionTimeout();
    // Guard: don't set a timeout shorter than 60s to avoid accidental instant logout
    if (timeoutSeconds < 60) return;
    const timeoutMs = timeoutSeconds * 1000;

    function resetTimer() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        // Use the ref so we always call the latest logout function
        logoutRef.current?.();
      }, timeoutMs);
    }

    // Activity events that reset the idle timer
    const events: (keyof WindowEventMap)[] = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, resetTimer, { passive: true }));

    // Start the initial timer
    resetTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
    // Re-run when auth state or hydration changes; timeout value is read fresh inside
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isHydrated]);

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

  // Keep logout ref in sync so the session-timeout handler always uses the latest function
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

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
