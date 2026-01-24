'use client';

import { useState, useEffect, useCallback } from 'react';
import type { UserTier, PersonalConcierge, AutonomousShoppingSettings, SourcingRequest, BespokeOrder, AutonomousActivity } from '@/types';
import { mockConcierge, mockAutonomousSettings, mockSourcingRequests, mockBespokeOrders, mockAutonomousActivity } from '@/data/mock-data';

interface UseUHNIFeaturesProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function useUHNIFeatures({ showToast }: UseUHNIFeaturesProps) {
  const [userTier, setUserTier] = useState<UserTier>('standard');
  const isUHNI = userTier === 'uhni';

  // UHNI-specific data (only loaded for UHNI users)
  const concierge: PersonalConcierge | null = isUHNI ? mockConcierge : null;
  const [autonomousSettings, setAutonomousSettings] = useState<AutonomousShoppingSettings | null>(null);
  const [sourcingRequests] = useState<SourcingRequest[]>(mockSourcingRequests);
  const [bespokeOrders] = useState<BespokeOrder[]>(mockBespokeOrders);
  const [autonomousActivity] = useState<AutonomousActivity[]>(mockAutonomousActivity);

  // Load user tier from localStorage on mount
  useEffect(() => {
    try {
      const storedTier = localStorage.getItem('moda-user-tier') as UserTier | null;
      if (storedTier && ['standard', 'preferred', 'uhni'].includes(storedTier)) {
        setUserTier(storedTier);
      }
    } catch (error) {
      console.error('Failed to load user tier:', error);
    }
  }, []);

  // Update autonomous settings when tier changes
  useEffect(() => {
    if (isUHNI) {
      setAutonomousSettings(mockAutonomousSettings);
    } else {
      setAutonomousSettings(null);
    }
  }, [isUHNI]);

  // Set user tier (called from login)
  const setUserRole = useCallback((tier: UserTier) => {
    setUserTier(tier);
    try {
      localStorage.setItem('moda-user-tier', tier);
    } catch (error) {
      console.error('Failed to save user tier:', error);
      showToast('Failed to save user role', 'error');
    }
  }, [showToast]);

  // Update autonomous shopping settings
  const updateAutonomousSettings = useCallback((settings: Partial<AutonomousShoppingSettings>) => {
    if (!isUHNI || !autonomousSettings) return;
    setAutonomousSettings(prev => prev ? { ...prev, ...settings } : null);
    showToast('Settings updated', 'success');
  }, [isUHNI, autonomousSettings, showToast]);

  // Logout function
  const logout = useCallback(() => {
    setUserTier('standard');
    try {
      localStorage.removeItem('moda-user-tier');
      localStorage.removeItem('moda-considerations');
      localStorage.removeItem('moda-wardrobe');
      localStorage.removeItem('moda-wishlist');
      localStorage.removeItem('moda-orders');
      showToast('Logged out successfully', 'info');
    } catch (error) {
      console.error('Failed to clear localStorage on logout:', error);
      showToast('Logout completed with errors', 'error');
    }
  }, [showToast]);

  return {
    userTier,
    isUHNI,
    concierge,
    autonomousSettings,
    sourcingRequests,
    bespokeOrders,
    autonomousActivity,
    setUserRole,
    updateAutonomousSettings,
    logout
  };
}
