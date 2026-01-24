/**
 * IV Immersive Visualization Types (SOW V10.2)
 *
 * Body visualization, fabric simulation, and context simulation types.
 */

import type { Product, ProductCategory } from './product';
import type { DigitalBodyTwin } from './intelligence';

// ============================================
// Body Visualization - "View on Me"
// ============================================

export interface BodyVisualizationConfig {
  productId: string;
  silhouette: DigitalBodyTwin['silhouette'];
  viewAngle: 'front' | 'side' | 'back';
  productCategory: ProductCategory;
  selectedSize?: string;
  selectedColor?: string;
}

export interface VisualizationLayer {
  id: string;
  productId: string;
  product: Product;
  zIndex: number;
  position: { x: number; y: number };
  scale: number;
  category: ProductCategory;
}

export interface OutfitVisualization {
  id: string;
  name?: string;
  layers: VisualizationLayer[];
  silhouette: DigitalBodyTwin['silhouette'];
  occasion?: string;
  savedAt?: string;
}

// ============================================
// Fabric Simulation
// ============================================

export type FabricType = 'silk' | 'wool' | 'cotton' | 'leather' | 'cashmere' | 'linen' | 'canvas' | 'tweed' | 'velvet' | 'denim';

export interface FabricSimulation {
  productId: string;
  fabricType: FabricType;
  drapeLevel: 1 | 2 | 3 | 4 | 5; // 1=stiff, 5=flowing
  structureLevel: 1 | 2 | 3 | 4 | 5; // 1=soft, 5=rigid
  weight: 'ultralight' | 'light' | 'medium' | 'heavy';
  movement: 'minimal' | 'moderate' | 'flowing';
  breathability: 'low' | 'medium' | 'high';
  texture: string; // Descriptive text
  careComplexity: 'easy' | 'moderate' | 'delicate';
}

// ============================================
// Context Simulation
// ============================================

export type ContextType = 'occasion' | 'climate' | 'travel' | 'setting';

export interface ContextSimulation {
  id: string;
  name: string;
  type: ContextType;
  background: string;
  lighting: 'warm' | 'cool' | 'natural' | 'evening' | 'dramatic';
  description: string;
  tags: string[];
}

export interface ProductContextFit {
  productId: string;
  contextId: string;
  suitabilityScore: number; // 0-100
  reasoning: string;
  tips: string[];
  warnings?: string[];
}
