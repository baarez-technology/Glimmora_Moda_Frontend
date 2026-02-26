'use client';

import { useState, useCallback } from 'react';
import type { Product, WardrobeItem } from '@/types';
import { getWardrobe, addToWardrobe as apiAddToWardrobe, removeFromWardrobe as apiRemoveFromWardrobe, clearAllWardrobe as apiClearAllWardrobe, type ApiWardrobeItem } from '@/services/recommendation.service';

// Counter to ensure unique IDs even when called multiple times in the same millisecond
let wardrobeCounter = 0;

/** Map an API wardrobe item to the frontend WardrobeItem shape */
function mapApiWardrobeItem(raw: ApiWardrobeItem): WardrobeItem {
  const slug = raw.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return {
    id: raw.wardrobe_id,
    productId: raw.product_id,
    product: {
      id: raw.product_id,
      brandId: '',
      brandName: '',
      name: raw.product_name,
      slug,
      tagline: '',
      description: '',
      narrative: '',
      price: raw.price,
      currency: 'INR',
      images: raw.image_urls.map((url, i) => ({
        id: String(i + 1),
        url,
        alt: raw.product_name,
        type: i === 0 ? 'hero' as const : 'detail' as const,
      })),
      variants: [],
      materials: [],
      craftsmanship: [],
      ivEnabled: false,
      availability: { status: 'available', regions: [] },
      collection: '',
      category: 'clothing',
      tags: [],
      visibility: 'public',
      experienceMode: 'standard',
      pricingVisibility: 'visible',
      commerceAction: 'add_to_considerations',
      commerceEligible: true,
      craftTags: [],
    },
    addedAt: raw.created_at,
    wearCount: raw.how_many_buyed_count,
    outfitCompatibility: [],
  };
}

interface UseWardrobeStateProps {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  safeLocalStorageSave: (key: string, value: unknown) => void;
}

export function useWardrobeState({ showToast, safeLocalStorageSave }: UseWardrobeStateProps) {
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>([]);

  const initializeWardrobe = useCallback((_storedWardrobe: string | null) => {
    // Try real API first, fall back to localStorage
    getWardrobe().then(apiItems => {
      if (apiItems.length > 0) {
        setWardrobe(apiItems.map(mapApiWardrobeItem));
      } else if (_storedWardrobe) {
        setWardrobe(JSON.parse(_storedWardrobe));
      }
    }).catch(() => {
      // API failed — use localStorage
      if (_storedWardrobe) {
        setWardrobe(JSON.parse(_storedWardrobe));
      }
    });
  }, []);

  const addToWardrobe = useCallback((product: Product) => {
    // Check if already in wardrobe before updating state
    const alreadyInWardrobe = wardrobe.some(w => w.productId === product.id);

    if (alreadyInWardrobe) {
      showToast('Already in your wardrobe', 'info');
      return;
    }

    wardrobeCounter += 1;
    const newItem: WardrobeItem = {
      id: `wardrobe-${Date.now()}-${wardrobeCounter}`,
      productId: product.id,
      product,
      addedAt: new Date().toISOString(),
      wearCount: 0,
      outfitCompatibility: []
    };

    setWardrobe(prev => [...prev, newItem]);
    showToast(`${product.name} added to wardrobe`, 'success');

    // Also POST to real API (fire and forget)
    apiAddToWardrobe({
      product_id: product.id,
      color: '',
      size: '',
      how_many_buyed_count: 1,
    }).catch(() => { /* silently fail — localStorage still has it */ });
  }, [showToast, wardrobe]);

  const removeFromWardrobe = useCallback((id: string) => {
    const item = wardrobe.find(w => w.id === id);
    setWardrobe(prev => prev.filter(w => w.id !== id));
    if (item) {
      showToast(`${item.product.name} removed from wardrobe`, 'info');
    }
    // Also DELETE from API (fire and forget)
    apiRemoveFromWardrobe(id).catch(() => { /* silently fail — localStorage still updated */ });
  }, [showToast, wardrobe]);

  const clearAllWardrobe = useCallback(() => {
    setWardrobe([]);
    showToast('Wardrobe cleared', 'info');
    // Also clear via API (fire and forget)
    apiClearAllWardrobe().catch(() => { /* silently fail */ });
  }, [showToast]);

  const isInWardrobe = useCallback((productId: string) => {
    return wardrobe.some(w => w.productId === productId);
  }, [wardrobe]);

  // Persist to localStorage
  const persistWardrobe = useCallback((items: WardrobeItem[]) => {
    safeLocalStorageSave('moda-wardrobe', items);
  }, [safeLocalStorageSave]);

  return {
    wardrobe,
    setWardrobe,
    initializeWardrobe,
    addToWardrobe,
    removeFromWardrobe,
    clearAllWardrobe,
    isInWardrobe,
    persistWardrobe
  };
}
