import type { TierDefinition, TierBenefit, PricingTier } from '@/types/pricing-tiers'

export const TIER_DEFINITIONS: TierDefinition[] = [
  {
    tier: 'standard',
    label: 'Standard',
    tagline: 'Access to the platform',
    color: 'bg-parchment',
    textColor: 'text-charcoal-deep',
    borderColor: 'border-sand',
    requirements: [
      'Open to all registered members',
      'No minimum spend required'
    ],
    benefits: [
      {
        id: 'std-1',
        title: 'Full Product Catalogue',
        description: 'Browse and purchase from all available products',
        icon: 'ShoppingBag',
        tier: 'standard',
        category: 'access'
      },
      {
        id: 'std-2',
        title: 'Order Tracking',
        description: 'Real-time order and delivery tracking',
        icon: 'Package',
        tier: 'standard',
        category: 'service'
      },
      {
        id: 'std-3',
        title: 'Styling Sessions',
        description: 'Book styling sessions with brand stylists',
        icon: 'Sparkles',
        tier: 'standard',
        category: 'service'
      },
      {
        id: 'std-4',
        title: 'Standard Pricing',
        description: 'Access to all publicly listed prices',
        icon: 'Tag',
        tier: 'standard',
        category: 'pricing'
      }
    ]
  },
  {
    tier: 'preferred',
    label: 'Preferred Member',
    tagline: 'Member pricing and early access',
    color: 'bg-champagne/30',
    textColor: 'text-gold-muted',
    borderColor: 'border-gold-soft/40',
    requirements: [
      'Cumulative spend of €10,000 or more',
      'Or invitation from a brand partner',
      'Account in good standing'
    ],
    benefits: [
      {
        id: 'prf-1',
        title: 'Member Pricing',
        description: 'Exclusive member rates — typically 5-10% below standard',
        icon: 'Percent',
        tier: 'preferred',
        category: 'pricing'
      },
      {
        id: 'prf-2',
        title: 'Early Access',
        description: 'Shop new collections 24 hours before public release',
        icon: 'Clock',
        tier: 'preferred',
        category: 'access'
      },
      {
        id: 'prf-3',
        title: 'Price Alerts',
        description: 'Set alerts for price reductions on wishlist items',
        icon: 'Bell',
        tier: 'preferred',
        category: 'pricing'
      },
      {
        id: 'prf-4',
        title: 'Priority Customer Service',
        description: 'Dedicated support with faster response times',
        icon: 'HeadphonesIcon',
        tier: 'preferred',
        category: 'service'
      },
      {
        id: 'prf-5',
        title: 'Exclusive Brand Events',
        description: 'Invitations to brand preview events and launches',
        icon: 'Calendar',
        tier: 'preferred',
        category: 'exclusive'
      }
    ]
  },
  {
    tier: 'uhni',
    label: 'UHNI',
    tagline: 'Ultra-high-net-worth individual access',
    color: 'bg-charcoal-deep',
    textColor: 'text-ivory-cream',
    borderColor: 'border-charcoal-deep',
    requirements: [
      'By invitation only — not publicly available',
      'Verified ultra-high-net-worth status',
      'Minimum annual spend threshold',
      'Or direct brand relationship'
    ],
    benefits: [
      {
        id: 'uhni-1',
        title: 'Price Negotiation',
        description: 'Submit private price proposals directly to brands',
        icon: 'Handshake',
        tier: 'uhni',
        category: 'pricing'
      },
      {
        id: 'uhni-2',
        title: 'Bespoke Commissions',
        description: 'Commission made-to-measure and custom design pieces',
        icon: 'Scissors',
        tier: 'uhni',
        category: 'exclusive'
      },
      {
        id: 'uhni-3',
        title: 'AI Personal Concierge',
        description: 'Isabella — your dedicated AI concierge available 24/7',
        icon: 'Crown',
        tier: 'uhni',
        category: 'service'
      },
      {
        id: 'uhni-4',
        title: 'Global Sourcing',
        description: 'Access our global network to source any item worldwide',
        icon: 'Globe',
        tier: 'uhni',
        category: 'service'
      },
      {
        id: 'uhni-5',
        title: 'Private Collections',
        description: 'View invitation-only brand collections',
        icon: 'Lock',
        tier: 'uhni',
        category: 'exclusive'
      },
      {
        id: 'uhni-6',
        title: 'Exclusive Offers',
        description: 'Access to private brand offers and discounts',
        icon: 'Gift',
        tier: 'uhni',
        category: 'pricing'
      },
      {
        id: 'uhni-7',
        title: 'Zero-UI Commerce',
        description: 'Autonomous purchasing within your pre-set preferences',
        icon: 'Zap',
        tier: 'uhni',
        category: 'exclusive'
      },
      {
        id: 'uhni-8',
        title: 'Body Twin Technology',
        description: 'Digital body model for perfect fit every time',
        icon: 'User',
        tier: 'uhni',
        category: 'service'
      }
    ]
  }
]

export function getTierDefinition(tier: PricingTier): TierDefinition {
  return TIER_DEFINITIONS.find(t => t.tier === tier) || TIER_DEFINITIONS[0]
}

export function getTierRank(tier: PricingTier): number {
  const ranks: Record<PricingTier, number> = {
    standard: 0,
    preferred: 1,
    uhni: 2
  }
  return ranks[tier]
}

export function canUpgradeTo(
  currentTier: PricingTier,
  targetTier: PricingTier
): boolean {
  return getTierRank(targetTier) > getTierRank(currentTier)
}

export function getBenefitsForTier(tier: PricingTier): TierBenefit[] {
  const rank = getTierRank(tier)
  return TIER_DEFINITIONS
    .filter(t => getTierRank(t.tier) <= rank)
    .flatMap(t => t.benefits)
}
