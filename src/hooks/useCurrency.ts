/**
 * Currency hook — provides reactive currency formatting.
 * Uses the currency from AppContext (which syncs with localStorage).
 */
import { useApp } from '@/context/AppContext';
import { formatPrice, getCurrencySymbol } from '@/lib/currency';

export function useCurrency() {
  const { currency } = useApp();

  return {
    currency,
    symbol: getCurrencySymbol(currency),
    format: (amount: number | undefined | null, overrideCurrency?: string) =>
      formatPrice(amount, overrideCurrency || currency),
    formatCompact: (amount: number | undefined | null, overrideCurrency?: string) =>
      formatPrice(amount, overrideCurrency || currency, true),
  };
}
