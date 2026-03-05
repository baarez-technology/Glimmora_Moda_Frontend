/**
 * Pricing Tiers Types
 *
 * Types for pricing tiers, benefits, and price alerts.
 */

export type PricingTier = 'standard' | 'preferred' | 'uhni'

export interface TierBenefit {
  id: string
  title: string
  description: string
  icon: string          // icon name from lucide-react
  tier: PricingTier     // minimum tier required
  category: 'pricing' | 'access' | 'service' | 'exclusive'
}

export interface TierDefinition {
  tier: PricingTier
  label: string
  tagline: string
  color: string         // tailwind bg class
  textColor: string     // tailwind text class
  borderColor: string   // tailwind border class
  requirements: string[]
  benefits: TierBenefit[]
}

export interface PriceAlert {
  id: string
  productId: string
  productName: string
  productSlug: string
  productImage?: string
  brandName: string
  currentPrice: number
  targetPrice: number
  currency: string
  isActive: boolean
  createdAt: string
  triggeredAt?: string
  triggeredPrice?: number
}

export interface TierUpgradeRequest {
  id: string
  fromTier: PricingTier
  toTier: PricingTier
  status: 'pending' | 'approved' | 'denied'
  requestedAt: string
  reviewedAt?: string
  reviewNote?: string
}
