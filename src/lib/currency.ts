/**
 * Shared Currency Utility
 * Single source of truth for currency formatting across the entire app.
 */

import { getDefaultCurrency } from '@/lib/platform-config';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  KRW: '₩',
  CHF: 'CHF ',
  CAD: 'C$',
  AUD: 'A$',
  SGD: 'S$',
  HKD: 'HK$',
  SEK: 'kr ',
  NOK: 'kr ',
  DKK: 'kr ',
  NZD: 'NZ$',
  MXN: 'MX$',
  BRL: 'R$',
  ZAR: 'R ',
  AED: 'AED ',
  SAR: 'SAR ',
  THB: '฿',
  TWD: 'NT$',
  PLN: 'zł',
  TRY: '₺',
  RUB: '₽',
  CZK: 'Kč ',
  HUF: 'Ft ',
  ILS: '₪',
  PHP: '₱',
  MYR: 'RM ',
  IDR: 'Rp ',
  QAR: 'QAR ',
  KWD: 'KD ',
  BHD: 'BD ',
};

const CURRENCY_KEY = 'moda-currency';
const HARDCODED_FALLBACK = 'EUR';

/**
 * Get the user's selected currency code from localStorage.
 * Falls back to the admin-configured default currency, then to EUR.
 */
export function getUserCurrency(): string {
  if (typeof window === 'undefined') return HARDCODED_FALLBACK;
  try {
    const userPref = localStorage.getItem(CURRENCY_KEY);
    if (userPref) return userPref;
    // No user preference — use admin-configured platform default
    return getDefaultCurrency() || HARDCODED_FALLBACK;
  } catch {
    return HARDCODED_FALLBACK;
  }
}

/**
 * Set the user's currency preference.
 */
export function setUserCurrency(currency: string): void {
  try {
    localStorage.setItem(CURRENCY_KEY, currency);
    // Dispatch storage event so other components can react
    window.dispatchEvent(new Event('currency-change'));
  } catch { /* ignore */ }
}

/**
 * Get the symbol for a currency code.
 */
export function getCurrencySymbol(currency?: string): string {
  const code = currency || getUserCurrency();
  return CURRENCY_SYMBOLS[code] || code + ' ';
}

/**
 * Format a numeric amount with the correct currency symbol.
 * Uses the user's preferred currency if none specified.
 *
 * @param amount - The numeric value
 * @param currency - Optional currency code override (e.g., from order data)
 * @param compact - If true, uses K/M suffixes for large numbers
 */
export function formatPrice(
  amount: number | undefined | null,
  currency?: string,
  compact?: boolean,
): string {
  if (amount == null || isNaN(amount)) return `${getCurrencySymbol(currency)}0`;

  const symbol = getCurrencySymbol(currency);

  if (compact) {
    if (Math.abs(amount) >= 1_000_000) {
      return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(amount) >= 1_000) {
      return `${symbol}${(amount / 1_000).toFixed(0)}K`;
    }
  }

  return `${symbol}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * List of supported currencies for UI selectors.
 */
export const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_SYMBOLS);
