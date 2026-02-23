/**
 * Types Module - Barrel Exports
 *
 * This file provides backwards-compatible exports for all types.
 * The original monolithic types/index.ts has been refactored into modular files:
 *
 * - product.ts       - Product, Material, Variant, Availability types
 * - brand.ts         - Brand, Collection, BrandStory types
 * - user.ts          - User, FashionIdentity, BodyTwin, WardrobeItem types
 * - order.ts         - Order, OrderItem, Address types
 * - agi.ts           - AGIMessage, AGISuggestion, NavItem types
 * - calendar.ts      - CalendarEvent, OutfitSuggestion, UserPreferences types
 * - intelligence.ts  - Availability Intelligence, FitConfidence, FashionPassport types
 * - uhni.ts          - UHNI-specific types (Concierge, Bespoke, Sourcing)
 * - visualization.ts - IV types (Body, Fabric, Context simulation)
 * - heritage.ts      - HeritageEvent, CulturalJourney types
 * - discovery.ts     - VisualSearch, ExploreMode, InspirationBoard types
 * - voice.ts         - VoiceInput, VoiceCommand types
 * - sustainability.ts- ClimateSuitability, SustainabilityScore types
 * - weather.ts       - WeatherData, CalendarProviderConfig types
 * - travel.ts        - Trip, PackingItem, MultiDayPlan types
 * - wardrobe.ts      - OutfitFeedback, Seasonal, Declutter, WardrobeValue types
 * - sharing.ts       - ShareableItem, ShareSettings types
 *
 * For new code, prefer importing from specific modules for better tree-shaking.
 */

// ============================================
// PRODUCT TYPES
// ============================================
export {
  type ProductCategory,
  type ProductImage,
  type ProductVariant,
  type Material,
  type CraftsmanshipDetail,
  type RegionAvailability,
  type Availability,
  type Product
} from './product';

// ============================================
// BRAND TYPES
// ============================================
export {
  type StorySection,
  type BrandStory,
  type Collection,
  type Brand
} from './brand';

// ============================================
// USER TYPES
// ============================================
export {
  type BodyTwin,
  type FashionIdentity,
  type WardrobeItem,
  type ConsiderationItem,
  type User
} from './user';

// ============================================
// ORDER TYPES
// ============================================
export {
  type OrderStatus,
  type Address,
  type OrderItem,
  type Order
} from './order';

// ============================================
// AGI TYPES
// ============================================
export {
  type AGISuggestion,
  type AGIMessage,
  type NavItem
} from './agi';

// ============================================
// CALENDAR TYPES
// ============================================
export {
  type CalendarProvider,
  type EventType,
  type OutfitItem,
  type OutfitSuggestion,
  type CalendarEvent,
  type CalendarConnection,
  type UserPreferences,
  type BackendCalendarEvent,
  type CalendarConnectionStatus
} from './calendar';

// ============================================
// INTELLIGENCE TYPES
// ============================================
export {
  type AvailabilityAlternative,
  type AvailabilityIntelligence,
  type CompleteOutfit,
  type FitConfidence,
  type DigitalBodyTwin,
  type WardrobeGap,
  type WardrobeAnalysis,
  type PassportMaterial,
  type FashionPassport
} from './intelligence';

// ============================================
// UHNI TYPES
// ============================================
export {
  type UserTier,
  type PersonalConcierge,
  type AutonomousShoppingSettings,
  type SourcingRequestType,
  type SourcingRequestStatus,
  type SourcingNote,
  type SourcingOption,
  type SourcingRequest,
  type BespokeOrderType,
  type BespokeOrderStatus,
  type BespokeSpecification,
  type BespokeTimelineStep,
  type BespokeOrder,
  type PrivateCollectionAccess,
  type PrivateCollection,
  type AutonomousActivityType,
  type AutonomousActivity,
  type UHNIProfile,
  // Pricing & Negotiation
  type NegotiationStatus,
  type PriceNegotiation,
  type UHNIPriceOffer,
  type UHNIPriceAlert,
  type UHNIPricingTier,
  type UHNIPricingSummary,
  // Enhanced G-SAIL
  type AvailabilitySearchStatus,
  type AvailabilitySearchPriority,
  type UHNIAvailabilitySearch,
  type EnhancedAlternative,
  type GlobalNetworkStats,
  type RestockPrediction
} from './uhni';

// ============================================
// VISUALIZATION TYPES (IV)
// ============================================
export {
  type BodyVisualizationConfig,
  type VisualizationLayer,
  type OutfitVisualization,
  type FabricType,
  type FabricSimulation,
  type ContextType,
  type ContextSimulation,
  type ProductContextFit
} from './visualization';

// ============================================
// HERITAGE TYPES
// ============================================
export {
  type HeritageEventSignificance,
  type HeritageEvent,
  type JourneyType,
  type JourneyStop,
  type CulturalJourney
} from './heritage';

// ============================================
// DISCOVERY TYPES
// ============================================
export {
  type VisualSearchQuery,
  type VisualSearchResult,
  type BoardItemType,
  type BoardItem,
  type InspirationBoard
} from './discovery';

// ============================================
// VOICE TYPES
// ============================================
export {
  type VoiceInput,
  type VoiceCommand
} from './voice';

// ============================================
// SUSTAINABILITY TYPES
// ============================================
export {
  type ClimateSuitability,
  type SustainabilityScore
} from './sustainability';

// ============================================
// WEATHER TYPES
// ============================================
export {
  type CalendarProviderConfig,
  type CalendarSyncConfig,
  type WeatherForecast,
  type WeatherData
} from './weather';

// ============================================
// TRAVEL TYPES
// ============================================
export {
  type TripActivity,
  type PackingItem,
  type Trip,
  type PlannedOutfit,
  type PlanDay,
  type MultiDayPlan
} from './travel';

// ============================================
// WARDROBE MANAGEMENT TYPES
// ============================================
export {
  type OutfitFeedback,
  type Season,
  type SeasonalSuggestion,
  type DeclutterSuggestion,
  type MaterialFeel,
  type WardrobeItemValue,
  type WardrobeValueMetrics
} from './wardrobe';

// ============================================
// SHARING TYPES
// ============================================
export {
  type ShareableType,
  type ShareableItem,
  type ShareSettings
} from './sharing';

