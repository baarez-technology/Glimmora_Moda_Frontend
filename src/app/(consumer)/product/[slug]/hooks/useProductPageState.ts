'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import * as productService from '@/services/product.service';
import * as brandService from '@/services/brand.service';
import * as intelligenceService from '@/services/intelligence.service';
import * as wardrobeService from '@/services/wardrobe.service';
import type {
  Product,
  Brand,
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
    wardrobe,
    addToWardrobe,
    removeFromWardrobe,
    isInWardrobe
  } = useApp();

  // UI State
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [sizeError, setSizeError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Modal State
  const [showIV, setShowIV] = useState(false);
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [showConcierge, setShowConcierge] = useState(false);
  const [showViewOnMe, setShowViewOnMe] = useState(false);

  // User Data
  const [bodyTwin, setBodyTwin] = useState<DigitalBodyTwin | undefined>(undefined);
  const [fashionIdentity, setFashionIdentity] = useState<FashionIdentity | null>(null);

  // Service Data
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Derived Data
  const brand = useMemo(() => allBrands.find(b => b.id === product.brandId), [product.brandId, allBrands]);
  const sizeVariants = useMemo(() => product.variants.filter(v => v.type === 'size'), [product.variants]);
  const colorVariants = useMemo(() => product.variants.filter(v => v.type === 'color'), [product.variants]);
  const inConsiderations = isInConsiderations(product.id);
  const considerationItem = considerations.find(c => c.productId === product.id);
  const watchingRestock = hasRestockAlert(product.id);
  const inWardrobe = isInWardrobe(product.id);

  // Load service data and user data
  useEffect(() => {
    async function loadServiceData() {
      try {
        const [brandsRes, productsRes] = await Promise.all([
          brandService.getAllBrands(),
          productService.getAllProducts(),
        ]);
        setAllBrands(brandsRes.data ?? []);
        setAllProducts(productsRes.data ?? []);
      } catch (error) {
        console.error('Failed to load product page service data:', error);
      }
    }
    loadServiceData();
  }, []);

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

  const handleAddToWardrobe = useCallback(() => {
    const sizeVars = product.variants.filter(v => v.type === 'size');
    const colorVars = product.variants.filter(v => v.type === 'color');
    if (sizeVars.length > 0 && !selectedSize) {
      showToast('Please select a size', 'error');
      return;
    }
    if (colorVars.length > 0 && !selectedColor) {
      showToast('Please select a color', 'error');
      return;
    }
    addToWardrobe(product, { color: selectedColor || undefined, size: selectedSize || undefined, quantity });
  }, [product, addToWardrobe, selectedSize, selectedColor, quantity, showToast]);

  const handleRemoveFromWardrobe = useCallback(() => {
    const wardrobeItem = wardrobe.find(w => w.product.id === product.id);
    if (wardrobeItem) {
      removeFromWardrobe(wardrobeItem.id);
    }
  }, [product.id, wardrobe, removeFromWardrobe]);

  // Related products
  const relatedProducts = useMemo(() => {
    return allProducts
      .filter(p => p.brandId === product.brandId && p.id !== product.id)
      .slice(0, 4);
  }, [product, allProducts]);

  return {
    // State
    isLoaded,
    selectedSize,
    selectedColor,
    activeImage,
    sizeError,
    quantity,
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
    inWardrobe,
    watchingRestock,
    relatedProducts,
    allProducts,

    // Setters
    setSelectedSize: handleSizeSelect,
    setSelectedColor,
    setActiveImage,
    setQuantity,
    setShowIV,
    setShowIntelligence,
    setShowConcierge,
    setShowViewOnMe,

    // Actions
    nextImage,
    prevImage,
    handleAddToConsiderations,
    handleRemoveFromConsiderations,
    handleAddToWardrobe,
    handleRemoveFromWardrobe,
    handleNotifyRestock,
    handleShare,
    showToast,
    wardrobe
  };
}

// Separate hook for intelligence data — loads from service layer with fallbacks
export function useProductIntelligence({ product, sizeVariants, fashionIdentity, wardrobe, brand, allProducts, showIntelligence }: {
  product: Product;
  sizeVariants: Product['variants'];
  fashionIdentity: FashionIdentity | null;
  wardrobe: { product: Product }[];
  brand?: { name: string } | null;
  allProducts: Product[];
  showIntelligence?: boolean;
}) {
  // Eager service data (outfit suggestions + material feel — always visible on page)
  const [eagerData, setEagerData] = useState<{
    outfitSuggestions: CompleteOutfit[];
    materialFeel: MaterialFeel | null;
  }>({
    outfitSuggestions: [],
    materialFeel: null,
  });

  // Lazy panel data (only loaded when user opens Fashion Intelligence panel)
  const [panelData, setPanelData] = useState<{
    availability: AvailabilityIntelligence | null;
    fitConfidence: FitConfidence | null;
    fabricSimulation: FabricSimulation | null;
    climateSuitability: ClimateSuitability | null;
    sustainabilityScore: SustainabilityScore | null;
  }>({
    availability: null,
    fitConfidence: null,
    fabricSimulation: null,
    climateSuitability: null,
    sustainabilityScore: null,
  });

  const [panelLoaded, setPanelLoaded] = useState(false);

  // Eager load: outfit suggestions + material feel (always visible on page)
  useEffect(() => {
    let cancelled = false;
    async function loadEagerData() {
      try {
        const [outfitRes, materialRes] = await Promise.all([
          wardrobeService.getOutfitSuggestions(product),
          intelligenceService.getMaterialFeel(product.id),
        ]);
        if (!cancelled) {
          setEagerData({
            outfitSuggestions: outfitRes.data ?? [],
            materialFeel: materialRes.data ?? null,
          });
        }
      } catch (error) {
        console.error('Failed to load product page data:', error);
      }
    }
    loadEagerData();
    return () => { cancelled = true; };
  }, [product]);

  // Lazy load: panel intelligence data (only when user opens panel)
  useEffect(() => {
    if (!showIntelligence || panelLoaded) return;
    let cancelled = false;
    async function loadPanelData() {
      try {
        const [availRes, fitRes, fabricRes, climateRes, sustainRes] = await Promise.all([
          intelligenceService.getAvailabilityIntelligence(product.id),
          wardrobeService.getFitConfidence(product.id),
          intelligenceService.getFabricSimulation(product.id),
          intelligenceService.getClimateSuitability(product.id),
          intelligenceService.getSustainabilityScore(product.id),
        ]);
        if (!cancelled) {
          setPanelData({
            availability: availRes.data ?? null,
            fitConfidence: fitRes.data ?? null,
            fabricSimulation: fabricRes.data ?? null,
            climateSuitability: climateRes.data ?? null,
            sustainabilityScore: sustainRes.data ?? null,
          });
          setPanelLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load intelligence panel data:', error);
      }
    }
    loadPanelData();
    return () => { cancelled = true; };
  }, [showIntelligence, panelLoaded, product]);

  // Compat alias so the rest of the hook reads the same
  const serviceData = useMemo(() => ({
    availability: panelData.availability,
    fitConfidence: panelData.fitConfidence,
    outfitSuggestions: eagerData.outfitSuggestions,
    fabricSimulation: panelData.fabricSimulation,
    climateSuitability: panelData.climateSuitability,
    sustainabilityScore: panelData.sustainabilityScore,
    materialFeel: eagerData.materialFeel,
  }), [panelData, eagerData]);

  // G-SAIL™ Availability Intelligence — service data with fallback
  const availabilityIntelligence: AvailabilityIntelligence = useMemo(() => {
    if (serviceData.availability) return serviceData.availability;
    return {
      productId: product.id,
      currentStatus: product.availability.status,
      localConfidence: product.availability.regions[0]?.confidence || 85,
      alternatives: product.availability.regions
        .filter(r => r.available)
        .map(r => ({
          type: 'geography' as const,
          region: r.region,
          city: r.city,
          availabilityConfidence: r.confidence,
          deliveryDays: r.deliveryDays,
          priceDifference: 0,
          reason: `Available at ${product.brandName} ${r.city} boutique with ${r.confidence}% confidence`
        })),
      restockPrediction: product.availability.status === 'unavailable' ? {
        estimatedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        probability: 78
      } : undefined,
      conciergeOption: product.availability.status !== 'available'
    };
  }, [serviceData.availability, product]);

  // Fit Confidence — service data with fallback
  const fitConfidence: FitConfidence = useMemo(() => {
    if (serviceData.fitConfidence) return serviceData.fitConfidence;
    const suggestedSize = sizeVariants.find(v => v.available)?.value || 'M';
    return {
      overallScore: 87,
      suggestedSize,
      breakdown: { sizeMatch: 92, styleMatch: 85, proportionMatch: 84 },
      sizeNotes: [
        'Runs true to size based on brand standards',
        'Structured fit that defines the silhouette',
        product.category === 'clothing' ? 'Consider sizing up for layering' : 'Standard dimensions for this style'
      ],
      returnRisk: 'low',
      recommendation: `Based on the ${product.brandName} fit profile, ${suggestedSize} will provide the intended silhouette. The ${product.materials[0]?.name || 'fabric'} has minimal stretch, so accurate sizing ensures optimal drape and comfort.`
    };
  }, [serviceData.fitConfidence, product, sizeVariants]);

  // Outfit Suggestions — service data with fallback
  const outfitSuggestions: CompleteOutfit[] = useMemo(() => {
    if (serviceData.outfitSuggestions.length > 0) return serviceData.outfitSuggestions;
    const complementaryProducts = allProducts
      .filter(p => p.id !== product.id && p.category !== product.category)
      .slice(0, 4);
    return [
      {
        id: 'outfit-1',
        name: 'Curated Ensemble',
        occasion: 'Evening',
        description: 'A sophisticated ensemble for cultural events where understated elegance speaks volumes.',
        items: [
          { type: 'suggested' as const, productId: product.id, product, category: product.category, note: 'The focal point' },
          ...(complementaryProducts[0] ? [{ type: 'suggested' as const, productId: complementaryProducts[0].id, product: complementaryProducts[0], category: complementaryProducts[0].category }] : []),
          ...(complementaryProducts[1] ? [{ type: 'suggested' as const, productId: complementaryProducts[1].id, product: complementaryProducts[1], category: complementaryProducts[1].category }] : [])
        ].filter(Boolean),
        compatibilityScore: 90,
        totalPrice: product.price + (complementaryProducts[0]?.price || 0) + (complementaryProducts[1]?.price || 0),
        agiReasoning: `This combination highlights the ${product.name} as the centerpiece.`
      }
    ];
  }, [serviceData.outfitSuggestions, product, allProducts]);

  // Personalization Match — computed from user data (no service endpoint)
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

  // Delivery Estimate — computed with deterministic dates (no Math.random)
  const deliveryEstimate: DeliveryEstimate = useMemo(() => {
    const today = new Date();
    const standardDate = new Date(today);
    standardDate.setDate(today.getDate() + 6);
    const expressDate = new Date(today);
    expressDate.setDate(today.getDate() + 3);

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

  // Fabric Simulation — service data with fallback
  const fabricSimulation: FabricSimulation | undefined = useMemo(() => {
    if (serviceData.fabricSimulation) return serviceData.fabricSimulation;
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
  }, [serviceData.fabricSimulation, product]);

  // Climate Suitability — service data with fallback
  const climateSuitability: ClimateSuitability = useMemo(() => {
    if (serviceData.climateSuitability) return serviceData.climateSuitability;
    return {
      productId: product.id,
      temperatureRange: { min: 15, max: 28 },
      humidity: 'medium',
      weather: ['sunny', 'cloudy'],
      seasons: ['spring', 'autumn'],
      climates: ['temperate', 'continental'],
      indoorOutdoor: 'both',
      activityLevel: 'moderate'
    };
  }, [serviceData.climateSuitability, product.id]);

  // Sustainability Score — service data with fallback (NO Math.random)
  const sustainabilityScore: SustainabilityScore = useMemo(() => {
    if (serviceData.sustainabilityScore) return serviceData.sustainabilityScore;
    return {
      productId: product.id,
      overallScore: 75,
      breakdown: {
        materials: 78,
        production: 74,
        packaging: 68,
        transport: 65,
        longevity: 85,
        endOfLife: 60
      },
      certifications: ['Responsibly Sourced'],
      carbonFootprint: '8.5 kg CO2e',
      waterUsage: '55L',
      recyclability: 'medium',
      repairability: 'high',
      biodegradable: false,
      veganFriendly: true,
      highlights: ['Responsibly sourced materials', 'Low water consumption'],
      improvements: ['Working on carbon-neutral shipping']
    };
  }, [serviceData.sustainabilityScore, product.id]);

  // Material Feel — service data with fallback
  const materialFeel: MaterialFeel | undefined = useMemo(() => {
    if (serviceData.materialFeel) return serviceData.materialFeel;
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
      agiDescription: `This ${product.materials[0]?.name || 'piece'} offers a luxurious sensory experience against the skin, with a refined texture that exemplifies ${brand?.name || 'the brand'}'s commitment to quality.`
    };
  }, [serviceData.materialFeel, product, brand]);

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
