'use client';

import { useState, useCallback } from 'react';
import {
  getCart,
  addToCart as apiAddToCart,
  removeFromCart as apiRemoveFromCart,
  getWishlist,
  type CartItem,
  type WishlistItem,
} from '@/services/customer-collection.service';

interface UseCartProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

// Session-level cache keys
const CART_CACHE_KEY = 'moda-cart-cache';
const WISHLIST_CACHE_KEY = 'moda-wishlist-cache';

/**
 * Read from sessionStorage (survives page refreshes within the same tab,
 * clears when the tab/browser is closed).
 */
function readSessionCache<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSessionCache(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded — ignore */
  }
}

function clearSessionCache(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function useCart({ showToast }: UseCartProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => readSessionCache<CartItem[]>(CART_CACHE_KEY) ?? []);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() => readSessionCache<WishlistItem[]>(WISHLIST_CACHE_KEY) ?? []);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [wishlistLoaded, setWishlistLoaded] = useState(false);

  // ── Cart ──────────────────────────────────────────────────────────────────

  /** Fetch cart from API only if not already cached in this session */
  const loadCart = useCallback(async (force = false) => {
    if (cartLoaded && !force) return;
    try {
      const items = await getCart();
      setCartItems(items);
      writeSessionCache(CART_CACHE_KEY, items);
      setCartLoaded(true);
    } catch {
      // API unavailable — keep whatever we have from sessionStorage
      setCartLoaded(true);
    }
  }, [cartLoaded]);

  const addToCart = useCallback(async (payload: { product_id: string; color: string; size: string; quantity?: number }) => {
    try {
      const item = await apiAddToCart(payload);
      setCartItems(prev => {
        const updated = [...prev, item];
        writeSessionCache(CART_CACHE_KEY, updated);
        return updated;
      });
      showToast('Added to cart', 'success');
      return item;
    } catch (err) {
      showToast('Failed to add to cart. Please try again.', 'error');
      throw err;
    }
  }, [showToast]);

  const removeFromCart = useCallback(async (cartId: string) => {
    try {
      await apiRemoveFromCart(cartId);
      setCartItems(prev => {
        const updated = prev.filter(i => i.cart_id !== cartId);
        writeSessionCache(CART_CACHE_KEY, updated);
        return updated;
      });
      showToast('Removed from cart', 'info');
    } catch {
      showToast('Failed to remove from cart', 'error');
    }
  }, [showToast]);

  /** Force-refresh cart from API (e.g. after an update) */
  const refreshCart = useCallback(async () => {
    try {
      const items = await getCart();
      setCartItems(items);
      writeSessionCache(CART_CACHE_KEY, items);
      setCartLoaded(true);
    } catch {
      /* silent */
    }
  }, []);

  const isInCart = useCallback((productId: string) => {
    return cartItems.some(i => i.product_id === productId);
  }, [cartItems]);

  // ── Wishlist ──────────────────────────────────────────────────────────────

  /** Fetch wishlist from API only if not already cached in this session */
  const loadWishlist = useCallback(async (force = false) => {
    if (wishlistLoaded && !force) return;
    try {
      const items = await getWishlist();
      setWishlistItems(items);
      writeSessionCache(WISHLIST_CACHE_KEY, items);
      setWishlistLoaded(true);
    } catch {
      setWishlistLoaded(true);
    }
  }, [wishlistLoaded]);

  /** Force-refresh wishlist from API */
  const refreshWishlist = useCallback(async () => {
    try {
      const items = await getWishlist();
      setWishlistItems(items);
      writeSessionCache(WISHLIST_CACHE_KEY, items);
      setWishlistLoaded(true);
    } catch {
      /* silent */
    }
  }, []);

  /** Invalidate both caches (call on logout) */
  const clearCartCache = useCallback(() => {
    clearSessionCache(CART_CACHE_KEY);
    clearSessionCache(WISHLIST_CACHE_KEY);
    setCartItems([]);
    setWishlistItems([]);
    setCartLoaded(false);
    setWishlistLoaded(false);
  }, []);

  return {
    // Cart
    cartItems,
    cartCount: cartItems.length,
    addToCart,
    removeFromCart,
    isInCart,
    loadCart,
    refreshCart,

    // Wishlist
    wishlistItems,
    wishlistCount: wishlistItems.length,
    loadWishlist,
    refreshWishlist,

    // Cache control
    clearCartCache,
  };
}
