'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { brands, products as allProducts } from '@/data/mock-data';
import type {
  Product,
  DigitalBodyTwin,
  FashionIdentity,
  AvailabilityIntelligence,
  FitConfidence,
  CompleteOutfit,
  FabricSimulation,
  ClimateSuitability,
  SustainabilityScore,
  MaterialFeel
} from '@/types';

interface UseProductPageStateProps {
  product: Product;
}

interface PersonalizationMatch {
  score: number;
  reasons: string[];
  wardrobeItems: number;
}

interface DeliveryEstimate {
  standard: { date: string; label: string };
  express: { date: string; label: string; price: number };
  whiteGlove: { label: string; description: string; price: number };
}

export function useProductPageState({ product }: UseProductPageStateProps) {
  const {
    addToConsiderations,
    isInConsiderations,
    removeFromConsiderations,
    considerations,
    addRestockAlert,
    hasRestockAlert,
    showToast,
    wardrobe
  } = useApp();

  // UI State
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [sizeError, setSizeError] = useState(false);

  // Modal State
  const [showIV, setShowIV] = useState(false);
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [showConcierge, setShowConcierge] = useState(false);
  const [showViewOnMe, setShowViewOnMe] = useState(false);

  // User Data
  const [bodyTwin, setBodyTwin] = useState<DigitalBodyTwin | undefined>(undefined);
  const [fashionIdentity, setFashionIdentity] = useState<FashionIdentity | null>(null);

  // Derived Data
  const brand = useMemo(() => brands.find(b => b.id === product.brandId), [product.brandId]);
  const sizeVariants = useMemo(() => product.variants.filter(v => v.type === 'size'), [product.variants]);
  const colorVariants = useMemo(() => product.variants.filter(v => v.type === 'color'), [product.variants]);
  const inConsiderations = isInConsiderations(product.id);
  const considerationItem = considerations.find(c => c.productId === product.id);
  const watchingRestock = hasRestockAlert(product.id);

  // Load user data from localStorage
  useEffect(() => {
    setIsLoaded(true);

    try {
      const storedBodyTwin = localStorage.getItem('moda-body-twin');
      if (storedBodyTwin) {
        setBodyTwin(JSON.parse(storedBodyTwin));
      }
    } catch (error) {
      console.error('Failed to load body twin:', error);
      showToast('Could not load your Body Twin data', 'error');
    }

    try {
      const storedIdentity = localStorage.getItem('moda-fashion-identity');
      if (storedIdentity) {
        setFashionIdentity(JSON.parse(storedIdentity));
      }
    } catch (error) {
      console.error('Failed to load fashion identity:', error);
      showToast('Could not load your style profile', 'error');
    }
  }, [showToast]);

  // ESC key handler for modals
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showIV) setShowIV(false);
        else if (showConcierge) setShowConcierge(false);
        else if (showViewOnMe) setShowViewOnMe(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [showIV, showConcierge, showViewOnMe]);

  // Image navigation
  const nextImage = useCallback(() => {
    setActiveImage((prev) => (prev + 1) % product.images.length);
  }, [product.images.length]);

  const prevImage = useCallback(() => {
    setActiveImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  }, [product.images.length]);

  // Actions
  const handleAddToConsiderations = useCallback(() => {
    if (sizeVariants.length > 0 && !selectedSize) {
      setSizeError(true);
      showToast('Please select a size', 'error');
      return;
    }
    setSizeError(false);

    const agiNote = "This piece pairs beautifully with structured tailoring. Based on your style preferences, it would complement your existing wardrobe.";

    addToConsiderations(
      product,
      { size: selectedSize || undefined, color: selectedColor || undefined },
      agiNote
    );
  }, [sizeVariants.length, selectedSize, selectedColor, product, addToConsiderations, showToast]);

  const handleRemoveFromConsiderations = useCallback(() => {
    if (considerationItem) {
      removeFromConsiderations(considerationItem.id);
    }
  }, [considerationItem, removeFromConsiderations]);

  const handleNotifyRestock = useCallback(() => {
    addRestockAlert(product, selectedSize || undefined, selectedColor || undefined);
  }, [product, selectedSize, selectedColor, addRestockAlert]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.brandName} - ${product.name}`,
          text: product.tagline,
          url: window.location.href
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard', 'success');
    }
  }, [product, showToast]);

  const handleSizeSelect = useCallback((size: string) => {
    setSelectedSize(size);
    setSizeError(false);
  }, []);

  // Related products
  const relatedProducts = useMemo(() => {
    return allProducts
      .filter(p => p.brandId === product.brandId && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  return {
    // State
    isLoaded,
    selectedSize,
    selectedColor,
    activeImage,
    sizeError,
    showIV,
    showIntelligence,
    showConcierge,
    showViewOnMe,
    bodyTwin,
    fashionIdentity,

    // Derived
    brand,
    sizeVariants,
    colorVariants,
    inConsiderations,
    watchingRestock,
    relatedProducts,

    // Setters
    setSelectedSize: handleSizeSelect,
    setSelectedColor,
    setActiveImage,
    setShowIV,
    setShowIntelligence,
    setShowConcierge,
    setShowViewOnMe,

    // Actions
    nextImage,
    prevImage,
    handleAddToConsiderations,
    handleRemoveFromConsiderations,
    handleNotifyRestock,
    handleShare,
    showToast,
    wardrobe
  };
}

// Separate hook for computed intelligence data
export function useProductIntelligence({ product, sizeVariants, fashionIdentity, wardrobe, brand }: {
  product: Product;
  sizeVariants: Product['variants'];
  fashionIdentity: FashionIdentity | null;
  wardrobe: { product: Product }[];
  brand?: { name: string } | null;
}) {
  // G-SAIL™ Availability Intelligence
  const availabilityIntelligence: AvailabilityIntelligence = useMemo(() => ({
    productId: product.id,
    currentStatus: product.availability.status,
    localConfidence: product.availability.regions[0]?.confidence || 85,
    alternatives: [
      ...product.availability.regions
        .filter(r => r.available)
        .map(r => ({
          type: 'geography' as const,
          region: r.region,
          city: r.city,
          availabilityConfidence: r.confidence,
          deliveryDays: r.deliveryDays,
          priceDifference: r.region === 'Americas' ? 150 : r.region === 'Asia' ? 80 : 0,
          reason: `Available at ${product.brandName} ${r.city} boutique with ${r.confidence}% confidence`
        })),
      ...allProducts
        .filter(p => p.brandId === product.brandId && p.id !== product.id && p.category === product.category)
        .slice(0, 2)
        .map(p => ({
          type: 'equivalent' as const,
          availabilityConfidence: 95,
          reason: `Similar style from ${p.brandName} with comparable craftsmanship`,
          product: p
        }))
    ],
    restockPrediction: product.availability.status === 'unavailable' ? {
      estimatedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      probability: 78
    } : undefined,
    conciergeOption: product.availability.status !== 'available'
  }), [product]);

  // Fit Confidence
  const fitConfidence: FitConfidence = useMemo(() => {
    const suggestedSize = sizeVariants.find(v => v.available)?.value || 'M';
    return {
      overallScore: 87,
      suggestedSize,
      breakdown: {
        sizeMatch: 92,
        styleMatch: 85,
        proportionMatch: 84
      },
      sizeNotes: [
        'Runs true to size based on brand standards',
        'Structured fit that defines the silhouette',
        product.category === 'clothing' ? 'Consider sizing up for layering' : 'Standard dimensions for this style'
      ],
      returnRisk: 'low',
      recommendation: `Based on the ${product.brandName} fit profile, ${suggestedSize} will provide the intended silhouette. The ${product.materials[0]?.name || 'fabric'} has minimal stretch, so accurate sizing ensures optimal drape and comfort.`
    };
  }, [product, sizeVariants]);

  // Outfit Suggestions
  const outfitSuggestions: CompleteOutfit[] = useMemo(() => {
    const complementaryProducts = allProducts
      .filter(p => p.id !== product.id && p.category !== product.category)
      .slice(0, 8);

    return [
      {
        id: 'outfit-1',
        name: 'Power Evening',
        occasion: 'Gallery Opening',
        description: 'A sophisticated ensemble for cultural events where understated elegance speaks volumes.',
        items: [
          { type: 'suggested' as const, productId: product.id, product, category: product.category, note: 'The focal point' },
          ...(complementaryProducts[0] ? [{ type: 'suggested' as const, productId: complementaryProducts[0].id, product: complementaryProducts[0], category: complementaryProducts[0].category }] : []),
          ...(complementaryProducts[1] ? [{ type: 'suggested' as const, productId: complementaryProducts[1].id, product: complementaryProducts[1], category: complementaryProducts[1].category }] : [])
        ].filter(Boolean),
        compatibilityScore: 94,
        totalPrice: product.price + (complementaryProducts[0]?.price || 0) + (complementaryProducts[1]?.price || 0),
        agiReasoning: `This combination leverages the structural elegance of the ${product.name} as the centerpiece.`
      },
      {
        id: 'outfit-2',
        name: 'Refined Professional',
        occasion: 'Business Meeting',
        description: 'Command attention while maintaining impeccable taste in professional settings.',
        items: [
          { type: 'suggested' as const, productId: product.id, product, category: product.category },
          ...(complementaryProducts[2] ? [{ type: 'suggested' as const, productId: complementaryProducts[2].id, product: complementaryProducts[2], category: complementaryProducts[2].category }] : []),
          ...(complementaryProducts[3] ? [{ type: 'suggested' as const, productId: complementaryProducts[3].id, product: complementaryProducts[3], category: complementaryProducts[3].category }] : [])
        ].filter(Boolean),
        compatibilityScore: 89,
        totalPrice: product.price + (complementaryProducts[2]?.price || 0) + (complementaryProducts[3]?.price || 0),
        agiReasoning: `The ${product.name} anchors this professional look with authority.`
      }
    ];
  }, [product]);

  // Personalization Match
  const personalizationMatch: PersonalizationMatch | null = useMemo(() => {
    if (!fashionIdentity) return null;

    let score = 0;
    const reasons: string[] = [];

    const productOccasions = product.tags.map(t => t.toLowerCase());
    const userOccasions = fashionIdentity.occasions.map(o => o.toLowerCase());
    const occasionMatch = productOccasions.some(po =>
      userOccasions.some(uo => po.includes(uo) || uo.includes(po))
    );
    if (occasionMatch) {
      score += 30;
      reasons.push('Matches your occasions');
    }

    const userAesthetics = fashionIdentity.aesthetics.map(a => a.toLowerCase());
    const aestheticMatch = product.tags.some(t =>
      userAesthetics.some(a => t.toLowerCase().includes(a) || a.includes(t.toLowerCase()))
    );
    if (aestheticMatch) {
      score += 35;
      reasons.push('Aligns with your aesthetic');
    }

    if (fashionIdentity.budgetRange) {
      const { min, max } = fashionIdentity.budgetRange;
      if (product.price >= min && product.price <= max) {
        score += 20;
        reasons.push('Within your investment range');
      }
    } else {
      score += 10;
    }

    score += 15;

    return {
      score: Math.min(score, 100),
      reasons,
      wardrobeItems: wardrobe.filter(w =>
        w.product.brandId === product.brandId ||
        w.product.tags.some(t => product.tags.includes(t))
      ).length
    };
  }, [fashionIdentity, product, wardrobe]);

  // Delivery Estimate
  const deliveryEstimate: DeliveryEstimate = useMemo(() => {
    const today = new Date();
    const standardDays = 5 + Math.floor(Math.random() * 3);
    const expressDays = 2 + Math.floor(Math.random() * 2);

    const standardDate = new Date(today);
    standardDate.setDate(today.getDate() + standardDays);

    const expressDate = new Date(today);
    expressDate.setDate(today.getDate() + expressDays);

    return {
      standard: {
        date: standardDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        label: 'Complimentary Delivery'
      },
      express: {
        date: expressDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        label: 'Express Delivery',
        price: 45
      },
      whiteGlove: {
        label: 'White Glove Service',
        description: 'Personal delivery with fitting consultation',
        price: 150
      }
    };
  }, []);

  // Fabric Simulation
  const fabricSimulation: FabricSimulation | undefined = useMemo(() => {
    if (!product.materials.length) return undefined;
    const materialName = product.materials[0]?.name?.toLowerCase() || '';
    const fabricType: FabricSimulation['fabricType'] =
      materialName.includes('silk') ? 'silk' :
      materialName.includes('wool') ? 'wool' :
      materialName.includes('leather') ? 'leather' :
      materialName.includes('cashmere') ? 'cashmere' :
      materialName.includes('linen') ? 'linen' :
      materialName.includes('canvas') ? 'canvas' :
      materialName.includes('tweed') ? 'tweed' :
      materialName.includes('velvet') ? 'velvet' :
      materialName.includes('denim') ? 'denim' : 'cotton';
    return {
      productId: product.id,
      fabricType,
      drapeLevel: 4 as const,
      structureLevel: 3 as const,
      weight: 'medium',
      movement: 'moderate',
      breathability: 'medium',
      texture: `The ${product.materials[0]?.name || 'fabric'} provides an elegant drape that moves naturally with the body while maintaining its structure.`,
      careComplexity: 'moderate'
    };
  }, [product]);

  // Climate Suitability
  const climateSuitability: ClimateSuitability = useMemo(() => ({
    productId: product.id,
    temperatureRange: { min: 15, max: 28 },
    humidity: 'medium',
    weather: ['sunny', 'cloudy'],
    seasons: ['spring', 'autumn'],
    climates: ['temperate', 'continental'],
    indoorOutdoor: 'both',
    activityLevel: 'moderate'
  }), [product.id]);

  // Sustainability Score
  const sustainabilityScore: SustainabilityScore = useMemo(() => ({
    productId: product.id,
    overallScore: Math.floor(Math.random() * 25) + 70,
    breakdown: {
      materials: Math.floor(Math.random() * 20) + 75,
      production: Math.floor(Math.random() * 20) + 70,
      packaging: Math.floor(Math.random() * 20) + 65,
      transport: Math.floor(Math.random() * 20) + 60,
      longevity: Math.floor(Math.random() * 20) + 80,
      endOfLife: Math.floor(Math.random() * 20) + 55
    },
    certifications: ['GOTS Certified', 'Fair Trade'],
    carbonFootprint: `${(Math.random() * 5 + 2).toFixed(1)} kg CO2e`,
    waterUsage: `${Math.floor(Math.random() * 50) + 30}L`,
    recyclability: 'medium',
    repairability: 'high',
    biodegradable: false,
    veganFriendly: true,
    highlights: ['Responsibly sourced materials', 'Low water consumption'],
    improvements: ['Working on carbon-neutral shipping']
  }), [product.id]);

  // Material Feel
  const materialFeel: MaterialFeel | undefined = useMemo(() => {
    if (!product.materials.length) return undefined;
    return {
      productId: product.id,
      texture: 'Buttery soft with a subtle grain that speaks to artisanal quality',
      weight: 'Substantial without being heavy—a presence you feel without effort',
      temperature: 'Naturally cool to the touch, warming gently with your body',
      comfort: 'Moves with you gracefully, never restricts or binds',
      sound: 'Whisper-quiet movement, no rustling',
      aging: `With proper care, this piece will develop a beautiful patina over time, becoming more personal and distinctive with each wear.`,
      sensoryHighlights: [
        'Soft hand feel',
        'Temperature-regulating',
        'Flexible yet structured'
      ],
      agiDescription: `This ${product.materials[0]?.name || 'piece'} offers a luxurious sensory experience against the skin, with a refined texture that exemplifies ${brand?.name}'s commitment to quality.`
    };
  }, [product, brand]);

  return {
    availabilityIntelligence,
    fitConfidence,
    outfitSuggestions,
    personalizationMatch,
    deliveryEstimate,
    fabricSimulation,
    climateSuitability,
    sustainabilityScore,
    materialFeel
  };
}
