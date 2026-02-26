/**
 * Customer Collection Service (Cart & Wishlist)
 * Endpoints: /api/v1/customer/*
 *
 * Works for both consumer and UHNI users — the backend resolves
 * the customer from the Bearer token automatically.
 */

// ─── Slug Helper ────────────────────────────────────────────────────────────

/** Generate a URL-safe slug from a product name, e.g. "Puma Galaxis Pro" → "puma-galaxis-pro" */
export function toProductSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Build the canonical product href used by the [slug] page: /product/<slug>?productId=<id> */
export function productHref(productId: string, productName: string): string {
  return `/product/${toProductSlug(productName)}?productId=${productId}`;
}

// ─── Auth Helper ────────────────────────────────────────────────────────────

function getUserToken(): string | null {
  try {
    return localStorage.getItem('moda-user-token');
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getUserToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ─── Response Types (matching backend Pydantic models) ──────────────────────

export interface CartItem {
  cart_id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  color: string;
  size: string;
  price: number;
  image_urls: string[];
  product_name: string;
  created_at: string;
}

export interface WishlistItem {
  wishlist_id: string;
  customer_id: string;
  product_id: string;
  color: string;
  size: string;
  price: number;
  image_urls: string[];
  product_name: string;
  created_at: string;
}

// ─── Request Types ──────────────────────────────────────────────────────────

export interface CartAddRequest {
  product_id: string;
  color: string;
  size: string;
  quantity?: number;
}

export interface WishlistAddRequest {
  product_id: string;
  color: string;
  size: string;
}

// ─── Cart APIs ──────────────────────────────────────────────────────────────

export async function getCart(): Promise<CartItem[]> {
  const res = await fetch('/api/v1/customer/cart', {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch cart' }));
    throw new Error(err.detail || `Failed to fetch cart (${res.status})`);
  }

  return res.json();
}

export async function addToCart(payload: CartAddRequest): Promise<CartItem> {
  const res = await fetch('/api/v1/customer/cart', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      product_id: payload.product_id,
      color: payload.color,
      size: payload.size,
      quantity: payload.quantity ?? 1,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to add to cart' }));
    throw new Error(err.detail || `Failed to add to cart (${res.status})`);
  }

  return res.json();
}

export async function removeFromCart(cartId: string): Promise<void> {
  const res = await fetch(`/api/v1/customer/cart/${cartId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to remove from cart' }));
    throw new Error(err.detail || `Failed to remove from cart (${res.status})`);
  }
}

// ─── Wishlist APIs ──────────────────────────────────────────────────────────

export async function getWishlist(): Promise<WishlistItem[]> {
  const res = await fetch('/api/v1/customer/wishlist', {
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to fetch wishlist' }));
    throw new Error(err.detail || `Failed to fetch wishlist (${res.status})`);
  }

  return res.json();
}

export async function addToWishlist(payload: WishlistAddRequest): Promise<WishlistItem> {
  const res = await fetch('/api/v1/customer/wishlist', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      product_id: payload.product_id,
      color: payload.color,
      size: payload.size,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to add to wishlist' }));
    throw new Error(err.detail || `Failed to add to wishlist (${res.status})`);
  }

  return res.json();
}

export async function removeFromWishlist(wishlistId: string): Promise<void> {
  const res = await fetch(`/api/v1/customer/wishlist/${wishlistId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to remove from wishlist' }));
    throw new Error(err.detail || `Failed to remove from wishlist (${res.status})`);
  }
}

// ─── Cart Quantity Update ──────────────────────────────────────────────────
// Backend has no PATCH endpoint, so we delete the old item and re-add with
// the new quantity to achieve an "update".

export async function updateCartQuantity(cartId: string, quantity: number, currentItem: CartItem): Promise<CartItem> {
  // Remove old entry
  await removeFromCart(cartId);

  // Re-add with updated quantity
  return addToCart({
    product_id: currentItem.product_id,
    color: currentItem.color,
    size: currentItem.size,
    quantity,
  });
}

// ─── Clear All Cart ────────────────────────────────────────────────────────

export async function clearAllCart(): Promise<void> {
  const res = await fetch('/api/v1/customer/cart', {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to clear cart' }));
    throw new Error(err.detail || `Failed to clear cart (${res.status})`);
  }
}

// ─── Clear All Wishlist ────────────────────────────────────────────────────

export async function clearAllWishlist(): Promise<void> {
  const res = await fetch('/api/v1/customer/wishlist', {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to clear wishlist' }));
    throw new Error(err.detail || `Failed to clear wishlist (${res.status})`);
  }
}

// ─── Move Wishlist Item to Cart ────────────────────────────────────────────

export async function moveWishlistToCart(wishlistItem: WishlistItem, quantity = 1): Promise<CartItem> {
  const cartItem = await addToCart({
    product_id: wishlistItem.product_id,
    color: wishlistItem.color,
    size: wishlistItem.size,
    quantity,
  });

  await removeFromWishlist(wishlistItem.wishlist_id);

  return cartItem;
}
