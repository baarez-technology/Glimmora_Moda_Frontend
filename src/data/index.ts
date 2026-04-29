/**
 * Data Module - Barrel Exports
 *
 * This file provides backwards-compatible exports for all mock data.
 * The original mock-data.ts has been refactored into modular files:
 *
 * - brands.ts       - Brand data and helpers
 * - products.ts     - Product data and helpers
 * - collections.ts  - Collection data and helpers
 * - stories.ts      - Brand story data and helpers
 * - users.ts        - User, preferences, and cart data
 * - calendar.ts     - Calendar events and connections
 * - wardrobe.ts     - Body twin, fit, wardrobe analysis, outfits
 * - uhni.ts         - UHNI-specific features
 * - intelligence.ts - Availability, fashion passport, heritage, journeys
 * - product-features.ts - Fabric, context, climate, sustainability, materials
 * - travel.ts       - Trips, packing, weather
 * - discovery.ts    - Boards, explore mode, visual search
 */

// ============================================
// BRANDS
// ============================================
export { brands, getBrandBySlug, getBrandById } from './brands';

// ============================================
// PRODUCTS
// ============================================
export {
  products,
  getProductBySlug,
  getProductById,
  getProductsByBrand,
  getProductsByCategory,
  getFeaturedProducts
} from './products';

// ============================================
// COLLECTIONS
// ============================================
export {
  collections,
  getCollectionBySlug,
  getCollectionById,
  getCollectionsByBrand
} from './collections';

// ============================================
// STORIES
// ============================================
export {
  brandStories,
  getStoryBySlug,
  getStoryById,
  getStoriesByBrand,
  getFeaturedStories
} from './stories';

// ============================================
// USERS
// ============================================
export {
  mockUser,
  mockConsiderations,
  mockUserPreferences,
  mockRestockNotifications,
  mockSilentCart
} from './users';

// ============================================
// CALENDAR
// ============================================
export {
  mockCalendarConnections,
  mockCalendarEvents,
  getUpcomingEvents,
  getEventById,
  getEventsByType
} from './calendar';

// ============================================
// WARDROBE
// ============================================
export {
  mockFitConfidence,
  mockBodyTwin,
  mockWardrobeAnalysis,
  getMockOutfits
} from './wardrobe';

// ============================================
// UHNI
// ============================================
export {
  mockUserTier,
  mockConcierge,
  mockAutonomousSettings,
  mockSourcingRequests,
  mockBespokeOrders,
  mockAutonomousActivity,
  mockUHNIProfile,
  getUHNIProfile,
  // Private Collections
  mockPrivateCollections,
  // UHNI Pricing
  mockPriceNegotiations,
  mockPriceAlerts,
  mockPricingSummary,
  // Enhanced G-SAIL
  mockUHNIAvailabilitySearches,
  mockGlobalNetworkStats,
  mockRestockPredictions
} from './uhni';

// ============================================
// INTELLIGENCE
// ============================================
export {
  getMockAvailabilityIntelligence,
  getMockFashionPassport,
  heritageEvents,
  getHeritageEventsByBrand,
  culturalJourneys,
  getCulturalJourneyById,
  getCulturalJourneysByType
} from './intelligence';

// ============================================
// PRODUCT FEATURES
// ============================================
export {
  fabricSimulations,
  getFabricSimulation,
  contextSimulations,
  getContextSimulations,
  getContextSimulationById,
  climateSuitability,
  getClimateSuitability,
  sustainabilityScores,
  getSustainabilityScore,
  materialFeels,
  getMaterialFeel,
  getProductContextSimulations,
  type ProductContextWithScore
} from './product-features';

// ============================================
// TRAVEL
// ============================================
export {
  mockWeatherData,
  getMockWeather,
  mockTrips,
  getTripById,
  getAllTrips,
  getPackingRecommendations
} from './travel';

// ============================================
// DISCOVERY
// ============================================
export {
  mockInspirationBoards,
  getInspirationBoards,
  getInspirationBoardById,
  performVisualSearch,
  performVisualSearchByImage,
  bodyVisualizationPresets,
  getVisualizationPreset
} from './discovery';

