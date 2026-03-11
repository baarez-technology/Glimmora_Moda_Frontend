'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import type { AdminUser } from '@/types/admin';
import { getAdminUser } from '@/data/admin';

// ─── Context Shape ───────────────────────────────────────────────────────────

interface AdminContextValue {
  isAuthenticated: boolean;
  isHydrated: boolean;
  admin: AdminUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

// ─── Storage Keys ────────────────────────────────────────────────────────────

const AUTH_KEY = 'moda-admin-auth';
const DATA_KEY = 'moda-admin-data';

// ─── Provider ────────────────────────────────────────────────────────────────

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_KEY);
      const storedData = localStorage.getItem(DATA_KEY);

      if (storedAuth === 'true' && storedData) {
        const parsed: AdminUser = JSON.parse(storedData);
        setAdmin(parsed);
        setIsAuthenticated(true);
      }
    } catch {
      // Corrupted storage — clear it
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(DATA_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    // Basic validation: accept any non-empty credentials
    // (prefer emails containing "admin" with password "admin123", but accept any non-empty)
    if (!email || !password) return false;

    const adminUser = getAdminUser();
    // Override with the provided email
    adminUser.email = email;
    adminUser.lastActive = new Date().toISOString();

    setAdmin(adminUser);
    setIsAuthenticated(true);

    localStorage.setItem(AUTH_KEY, 'true');
    localStorage.setItem(DATA_KEY, JSON.stringify(adminUser));

    return true;
  }, []);

  const logout = useCallback(() => {
    setAdmin(null);
    setIsAuthenticated(false);

    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(DATA_KEY);
  }, []);

  const value = useMemo<AdminContextValue>(
    () => ({ isAuthenticated, isHydrated, admin, login, logout }),
    [isAuthenticated, isHydrated, admin, login, logout],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('useAdmin must be used within an <AdminProvider>');
  }
  return ctx;
}
