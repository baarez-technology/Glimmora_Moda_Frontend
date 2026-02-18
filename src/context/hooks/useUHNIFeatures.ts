'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PersonalConcierge, AutonomousShoppingSettings, SourcingRequest, BespokeOrder, AutonomousActivity } from '@/types';
import * as uhniService from '@/services/uhni.service';

interface UseUHNIFeaturesProps {
  isUHNI: boolean;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

/**
 * Manages UHNI-specific data (concierge, autonomous shopping, sourcing, bespoke).
 * Auth state (userTier, isUHNI, setUserRole, logout) lives in AuthContext — single source of truth.
 */
export function useUHNIFeatures({ isUHNI, showToast }: UseUHNIFeaturesProps) {
  const [concierge, setConcierge] = useState<PersonalConcierge | null>(null);
  const [autonomousSettings, setAutonomousSettings] = useState<AutonomousShoppingSettings | null>(null);
  const [sourcingRequests, setSourcingRequests] = useState<SourcingRequest[]>([]);
  const [bespokeOrders, setBespokeOrders] = useState<BespokeOrder[]>([]);
  const [autonomousActivity, setAutonomousActivity] = useState<AutonomousActivity[]>([]);

  useEffect(() => {
    if (isUHNI) {
      uhniService.getConcierge().then(r => { if (r.success) setConcierge(r.data); });
      uhniService.getAutonomousSettings().then(r => { if (r.success) setAutonomousSettings(r.data); });
      uhniService.getSourcingRequests().then(r => { if (r.success) setSourcingRequests(r.data); });
      uhniService.getBespokeOrders().then(r => { if (r.success) setBespokeOrders(r.data); });
      uhniService.getAutonomousActivity().then(r => { if (r.success) setAutonomousActivity(r.data); });
    } else {
      setConcierge(null);
      setAutonomousSettings(null);
    }
  }, [isUHNI]);

  const updateAutonomousSettings = useCallback((settings: Partial<AutonomousShoppingSettings>) => {
    if (!isUHNI || !autonomousSettings) return;
    setAutonomousSettings(prev => prev ? { ...prev, ...settings } : null);
    showToast('Settings updated', 'success');
  }, [isUHNI, autonomousSettings, showToast]);

  return {
    concierge,
    autonomousSettings,
    sourcingRequests,
    bespokeOrders,
    autonomousActivity,
    updateAutonomousSettings,
  };
}
