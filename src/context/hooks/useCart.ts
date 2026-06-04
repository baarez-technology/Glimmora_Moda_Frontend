'use client';

import { useState, useCallback } from 'react';
import {
  getCart,
  addToCart as apiAddToCart,
  removeFromCart as apiRemoveFromCart,
  updateCartQuantity as apiUpdateCartQuantity,
  clearAllCart as apiClearAllCart,
  getWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
  clearAllWishlist as apiClearAllWishlist,
  moveWishlistToCart as apiMoveWishlistToCart,
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

  /**
   * Add an item to the cart.
   *
   * When the backend rejects the product_id format (mock/demo products, or
   * any 400/422 validation error), we fall back to a local-only cart entry
   * so demos and offline-cached sessions keep working. Real products with
   * valid IDs continue to hit the backend normally.
   */
  const addToCart = useCallback(async (
    payload: { product_id: string; color: string; size: string; quantity?: number },
    fallback?: { name: string; price: number; image_urls: string[] },
  ) => {
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
      const message = err instanceof Error ? err.message : '';
      const isValidationError = /invalid\s*product_id|400|422|validation/i.test(message);

      if (fallback && isValidationError) {
        const localItem: CartItem = {
          cart_id: `local-${crypto.randomUUID()}`,
          customer_id: 'local',
          product_id: payload.product_id,
          quantity: payload.quantity ?? 1,
          color: payload.color,
          size: payload.size,
          price: fallback.price,
          image_urls: fallback.image_urls,
          product_name: fallback.name,
          created_at: new Date().toISOString(),
        };
        setCartItems(prev => {
          const updated = [...prev, localItem];
          writeSessionCache(CART_CACHE_KEY, updated);
          return updated;
        });
        showToast('Added to bag', 'success');
        return localItem;
      }

      showToast('Failed to add to cart. Please try again.', 'error');
      throw err;
    }
  }, [showToast]);

  const removeFromCart = useCallback(async (cartId: string) => {
    // Locally-stored items (added when the backend rejected the product_id)
    // never existed server-side, so skip the API call.
    const isLocal = cartId.startsWith('local-');
    try {
      if (!isLocal) {
        await apiRemoveFromCart(cartId);
      }
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

  const updateCartQuantity = useCallback(async (cartId: string, quantity: number) => {
    try {
      const currentItem = cartItems.find(i => i.cart_id === cartId);
      if (!currentItem) throw new Error('Item not found');

      // Locally-stored items have no server record — update in place.
      if (cartId.startsWith('local-')) {
        const updated = { ...currentItem, quantity };
        setCartItems(prev => {
          const next = prev.map(i => i.cart_id === cartId ? updated : i);
          writeSessionCache(CART_CACHE_KEY, next);
          return next;
        });
        return updated;
      }

      const updated = await apiUpdateCartQuantity(cartId, quantity, currentItem);
      setCartItems(prev => {
        const next = prev.map(i => i.cart_id === cartId ? updated : i);
        writeSessionCache(CART_CACHE_KEY, next);
        return next;
      });
      return updated;
    } catch {
      showToast('Failed to update quantity', 'error');
    }
  }, [showToast, cartItems]);

  const clearAllCart = useCallback(async () => {
    try {
      await apiClearAllCart();
      setCartItems([]);
      writeSessionCache(CART_CACHE_KEY, []);
      showToast('Cart cleared', 'info');
    } catch {
      showToast('Failed to clear cart', 'error');
    }
  }, [showToast]);

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

  const removeFromWishlist = useCallback(async (wishlistId: string) => {
    try {
      await apiRemoveFromWishlist(wishlistId);
      setWishlistItems(prev => {
        const updated = prev.filter(i => i.wishlist_id !== wishlistId);
        writeSessionCache(WISHLIST_CACHE_KEY, updated);
        return updated;
      });
      showToast('Removed from wishlist', 'info');
    } catch {
      showToast('Failed to remove from wishlist', 'error');
    }
  }, [showToast]);

  const clearAllWishlist = useCallback(async () => {
    try {
      await apiClearAllWishlist();
      setWishlistItems([]);
      writeSessionCache(WISHLIST_CACHE_KEY, []);
      showToast('Wishlist cleared', 'info');
    } catch {
      showToast('Failed to clear wishlist', 'error');
    }
  }, [showToast]);

  const moveWishlistToCart = useCallback(async (wishlistItem: WishlistItem) => {
    try {
      const cartItem = await apiMoveWishlistToCart(wishlistItem);
      setWishlistItems(prev => {
        const updated = prev.filter(i => i.wishlist_id !== wishlistItem.wishlist_id);
        writeSessionCache(WISHLIST_CACHE_KEY, updated);
        return updated;
      });
      setCartItems(prev => {
        const updated = [...prev, cartItem];
        writeSessionCache(CART_CACHE_KEY, updated);
        return updated;
      });
      showToast('Moved to cart', 'success');
      return cartItem;
    } catch {
      showToast('Failed to move to cart', 'error');
    }
  }, [showToast]);

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
    updateCartQuantity,
    clearAllCart,
    isInCart,
    loadCart,
    refreshCart,

    // Wishlist
    wishlistItems,
    wishlistCount: wishlistItems.length,
    removeFromWishlist,
    clearAllWishlist,
    moveWishlistToCart,
    loadWishlist,
    refreshWishlist,

    // Cache control
    clearCartCache,
  };
}
