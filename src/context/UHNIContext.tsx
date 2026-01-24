'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { PersonalConcierge, AutonomousShoppingSettings, SourcingRequest, BespokeOrder, AutonomousActivity } from '@/types';
import { mockConcierge, mockAutonomousSettings, mockSourcingRequests, mockBespokeOrders, mockAutonomousActivity } from '@/data/mock-data';
import { useUI } from './UIContext';
import { useAuth } from './AuthContext';

interface UHNIContextType {
  concierge: PersonalConcierge | null;
  autonomousSettings: AutonomousShoppingSettings | null;
  sourcingRequests: SourcingRequest[];
  bespokeOrders: BespokeOrder[];
  autonomousActivity: AutonomousActivity[];
  updateAutonomousSettings: (settings: Partial<AutonomousShoppingSettings>) => void;
}

const UHNIContext = createContext<UHNIContextType | undefined>(undefined);

export function UHNIProvider({ children }: { children: ReactNode }) {
  const { showToast } = useUI();
  const { isUHNI } = useAuth();

  // UHNI-specific data (only loaded for UHNI users)
  const concierge = isUHNI ? mockConcierge : null;
  const [autonomousSettings, setAutonomousSettings] = useState<AutonomousShoppingSettings | null>(null);
  const [sourcingRequests] = useState<SourcingRequest[]>(isUHNI ? mockSourcingRequests : []);
  const [bespokeOrders] = useState<BespokeOrder[]>(isUHNI ? mockBespokeOrders : []);
  const [autonomousActivity] = useState<AutonomousActivity[]>(isUHNI ? mockAutonomousActivity : []);

  // Update autonomous settings when tier changes to UHNI
  useEffect(() => {
    if (isUHNI) {
      setAutonomousSettings(mockAutonomousSettings);
    } else {
      setAutonomousSettings(null);
    }
  }, [isUHNI]);

  // Update autonomous shopping settings
  const updateAutonomousSettings = useCallback((settings: Partial<AutonomousShoppingSettings>) => {
    if (!isUHNI || !autonomousSettings) return;
    setAutonomousSettings(prev => prev ? { ...prev, ...settings } : null);
    showToast('Settings updated', 'success');
  }, [isUHNI, autonomousSettings, showToast]);

  return (
    <UHNIContext.Provider
      value={{
        concierge,
        autonomousSettings,
        sourcingRequests,
        bespokeOrders,
        autonomousActivity,
        updateAutonomousSettings
      }}
    >
      {children}
    </UHNIContext.Provider>
  );
}

export function useUHNI() {
  const context = useContext(UHNIContext);
  if (context === undefined) {
    throw new Error('useUHNI must be used within a UHNIProvider');
  }
  return context;
}
