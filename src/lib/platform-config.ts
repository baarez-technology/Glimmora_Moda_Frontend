/**
 * Platform Configuration Utility
 *
 * Reads the admin-managed platform config from localStorage.
 * The admin configuration page writes to this key when "Save Configuration" is clicked.
 *
 * Key: moda-platform-config
 */

import type { PlatformConfig } from '@/types/admin';

const STORAGE_KEY = 'moda-platform-config';

/** Default config values (mirrors the mock data defaults). */
const DEFAULTS: PlatformConfig = {
  maintenanceMode: false,
  maintenanceMessage: 'We are performing scheduled maintenance. Please check back shortly.',
  maxUploadSize: 100,
  rateLimitPerMinute: 120,
  enableRegistration: true,
  enableBrandOnboarding: true,
  defaultCurrency: 'USD',
  supportedCurrencies: ['USD', 'EUR', 'GBP', 'INR', 'AED', 'CHF', 'JPY', 'CNY', 'AUD', 'CAD'],
  minimumPasswordLength: 8,
  sessionTimeout: 3600,
};

/**
 * Read the full platform config from localStorage, merged with defaults.
 */
export function getPlatformConfig(): PlatformConfig {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

/**
 * Persist platform config to localStorage.
 */
export function savePlatformConfig(config: PlatformConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    // Dispatch event so open tabs / components can react
    window.dispatchEvent(new Event('platform-config-change'));
  } catch {
    /* SSR / quota safety */
  }
}

/**
 * Quick check: is the platform currently in maintenance mode?
 */
export function isMaintenanceMode(): boolean {
  return getPlatformConfig().maintenanceMode;
}

/**
 * Quick check: is consumer registration enabled?
 */
export function isRegistrationEnabled(): boolean {
  return getPlatformConfig().enableRegistration;
}

/**
 * Quick check: is brand onboarding enabled?
 */
export function isBrandOnboardingEnabled(): boolean {
  return getPlatformConfig().enableBrandOnboarding;
}

/**
 * Get the session timeout in seconds.
 */
export function getSessionTimeout(): number {
  return getPlatformConfig().sessionTimeout;
}

/**
 * Get the platform default currency code.
 */
export function getDefaultCurrency(): string {
  return getPlatformConfig().defaultCurrency;
}
