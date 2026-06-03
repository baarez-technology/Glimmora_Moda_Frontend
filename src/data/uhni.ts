import type {
  UserTier,
  PersonalConcierge,
  AutonomousShoppingSettings,
  SourcingRequest,
  BespokeOrder,
  UHNIProfile,
  AutonomousActivity,
  PrivateCollection,
  PriceNegotiation,
  UHNIPriceAlert,
  UHNIPricingSummary,
  UHNIAvailabilitySearch,
  GlobalNetworkStats,
  RestockPrediction,
  ExclusiveEvent,
  PrivateShoppingEvent,
  HeritageArchiveItem,
  IntelligenceInsight,
  ZeroUIConfig,
  InvisibleTransaction,
  ConciergeTask,
  SilentCommerceItem
} from '@/types';
import { products } from './products';

// ============================================
// UHNI (Ultra High Net-worth Individual) DATA
// ============================================

// Current User Tier (toggle this to test UHNI features)
export const mockUserTier: UserTier = 'uhni';

// Personal Concierge
export const mockConcierge: PersonalConcierge = {
  id: 'concierge-1',
  name: 'Isabella Martinez',
  title: 'Senior Fashion Concierge',
  avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
  email: 'isabella.martinez@modaglimmora.com',
  phone: '+33 1 42 86 82 82',
  availability: 'available',
  specialties: ['Haute Couture', 'Rare Vintage', 'Bespoke Tailoring', 'Private Collections'],
  languages: ['English', 'French', 'Italian', 'Spanish'],
  assignedSince: '2024-06-15',
  bio: 'With over 15 years of experience in luxury fashion, Isabella specializes in sourcing rare pieces and coordinating bespoke experiences for discerning clients. Previously with Dior and Hermès private client services.'
};

// Autonomous Shopping Settings
export const mockAutonomousSettings: AutonomousShoppingSettings = {
  enabled: true,
  monthlyBudget: 50000,
  currentMonthSpend: 12400,
  autoApproveThreshold: 5000,
  categories: ['bags', 'accessories', 'jewelry'],
  excludedBrands: [],
  preferredBrands: ['dior', 'hermes', 'bottega-veneta'],
  requireReviewBefore: 'purchase',
  notificationPreference: 'immediate',
  invisibleCommerceMode: false,
  discreetPackaging: true
};

// Sourcing Requests
export const mockSourcingRequests: SourcingRequest[] = [
  {
    id: 'sr-1',
    type: 'specific_item',
    status: 'options_found',
    title: 'Hermès Birkin 25 in Gold Togo',
    description: 'Looking for a Birkin 25 in Gold Togo leather with gold hardware. Prefer new or like-new condition.',
    budget: { min: 15000, max: 25000, flexible: true },
    deadline: '2025-03-01',
    conciergeNotes: [
      {
        id: 'note-1',
        author: 'concierge',
        content: 'I\'ve identified three potential sources for this piece. One from our Paris boutique allocation, one pre-owned in excellent condition from a trusted reseller.',
        timestamp: '2024-12-26T14:30:00Z'
      },
      {
        id: 'note-2',
        author: 'client',
        content: 'I prefer new if possible. What\'s the timeline for the boutique allocation?',
        timestamp: '2024-12-26T16:00:00Z'
      },
      {
        id: 'note-3',
        author: 'concierge',
        content: 'The boutique allocation typically takes 4-8 weeks. I\'ve put you on the priority list. In the meantime, I\'ve added the pre-owned option for your consideration.',
        timestamp: '2024-12-27T09:00:00Z'
      }
    ],
    foundOptions: [
      {
        id: 'opt-1',
        customDescription: 'Hermès Birkin 25 Gold Togo GHW - Boutique Allocation',
        source: 'Hermès Paris - George V',
        condition: 'new',
        price: 21500,
        availableUntil: '2025-02-15',
        conciergeRecommendation: 'Recommended - Direct from boutique with full warranty',
        images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800']
      },
      {
        id: 'opt-2',
        customDescription: 'Hermès Birkin 25 Gold Togo GHW - Pre-owned',
        source: 'Verified Reseller - Rebag',
        condition: 'like_new',
        price: 18900,
        originalPrice: 21500,
        provenance: 'Original owner, purchased 2023, used twice',
        availableUntil: '2025-01-10',
        conciergeRecommendation: 'Excellent value - authenticated with documentation',
        images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800']
      }
    ],
    createdAt: '2024-12-20T10:00:00Z',
    updatedAt: '2024-12-27T09:00:00Z'
  },
  {
    id: 'sr-2',
    type: 'occasion',
    status: 'sourcing',
    title: 'Monaco Grand Prix Weekend Wardrobe',
    description: 'Need complete looks for Monaco GP weekend - yacht party Friday, race day Saturday, gala dinner Sunday.',
    occasion: 'Monaco Grand Prix 2025',
    budget: { min: 30000, max: 60000, flexible: true },
    deadline: '2025-05-15',
    conciergeNotes: [
      {
        id: 'note-4',
        author: 'concierge',
        content: 'I\'m curating options from Dior, Valentino, and Brunello Cucinelli for the yacht party. For race day, considering Loro Piana and Zegna. The gala will feature options from Givenchy and Alexander McQueen.',
        timestamp: '2024-12-28T11:00:00Z'
      }
    ],
    foundOptions: [],
    createdAt: '2024-12-25T14:00:00Z',
    updatedAt: '2024-12-28T11:00:00Z'
  }
];

// Bespoke Orders
// ────────────────────────────────────────────────────────────
// 6 orders covering EVERY status in the flow, with aligned IDs
// shared with brand-portal.ts. Each order shows a different stage
// so the team can see the full lifecycle.
//
// STATUS FLOW:  consultation → design_approval → production → fitting → final_adjustments → complete
// TYPICAL TIMELINE:  ~2 weeks consultation, ~1 week design approval, ~4-6 weeks production,
//                    ~1 week fitting, ~1-2 weeks adjustments, then delivery
// ────────────────────────────────────────────────────────────
export const mockBespokeOrders: BespokeOrder[] = [

  // ── 1. CONSULTATION — just submitted, initial stage ────────────────
  {
    id: 'bespoke-001',
    brandId: 'dior',
    brandName: 'Dior',
    selectedBrands: [{ id: 'dior', name: 'Dior' }],
    type: 'made_to_measure',
    title: 'Custom Bar Jacket — Midnight Navy',
    description: 'Made-to-measure Bar Jacket in midnight navy Super 150s wool with personalized gold buttons bearing initials. Inspired by the 1947 New Look silhouette with modern proportions.',
    specifications: [],
    detailedSpec: {
      measurements: { chest: 88, waist: 68, hips: 94, shoulders: 38, sleeveLength: 60, height: 172, notes: 'Slightly asymmetric shoulders — right 0.5cm higher' },
      fabricPreferences: 'Super 150s wool from Loro Piana mill. Navy or midnight blue. Silk jacquard lining with Dior oblique pattern.',
      colorPreferences: 'Midnight navy exterior, ivory silk lining',
      referenceImages: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800'],
      specialInstructions: 'Monogram "S.C." on interior label. Gold buttons engraved with initials. Nipped waist silhouette per classic Bar Jacket proportions.',
      occasionContext: 'Business formal — board meetings, client dinners, galas',
      deliveryDeadline: '2026-06-15',
    },
    measurements: { chest: 88, waist: 68, hips: 94, shoulders: 38, sleeveLength: 60 },
    status: 'consultation',
    timeline: [
      { id: 'bs1-step-1', stage: 'consultation', title: 'Initial Consultation', description: 'Meeting with atelier to discuss vision, fabric selection, and take precise measurements', status: 'current', estimatedDate: '2026-03-20T14:00:00Z', notes: 'Appointment confirmed at 30 Avenue Montaigne, Paris — 2:00 PM' },
      { id: 'bs1-step-2', stage: 'design_approval', title: 'Design Approval', description: 'Review sketches, fabric swatches, and approve final design', status: 'upcoming', estimatedDate: '2026-04-03T00:00:00Z' },
      { id: 'bs1-step-3', stage: 'production', title: 'Atelier Production', description: 'Master tailors craft the piece at the Dior Paris atelier (4-6 weeks)', status: 'upcoming', estimatedDate: '2026-05-15T00:00:00Z' },
      { id: 'bs1-step-4', stage: 'fitting', title: 'First Fitting', description: 'In-person fitting at Dior Paris to check silhouette and proportions', status: 'upcoming', estimatedDate: '2026-05-22T00:00:00Z' },
      { id: 'bs1-step-5', stage: 'final_adjustments', title: 'Final Adjustments', description: 'Fine-tuning after fitting — button placement, hem length, shoulder alignment', status: 'upcoming', estimatedDate: '2026-06-01T00:00:00Z' },
      { id: 'bs1-step-6', stage: 'complete', title: 'Delivery', description: 'White-glove delivery with garment bag and care documentation', status: 'upcoming', estimatedDate: '2026-06-15T00:00:00Z' },
    ],
    estimatedCompletion: '2026-06-15',
    price: 8500,
    depositPaid: 0,
    depositPercentage: 50,
    atelierContact: 'atelier.paris@dior.com',
    progressImages: [],
    messages: [
      { id: 'bs1-msg-1', senderId: 'uhni-user', senderName: 'You', senderRole: 'client', content: 'I\'d like to commission a custom Bar Jacket in midnight navy. Inspired by the 1947 original but with modern proportions. I have a board dinner in June.', createdAt: '2026-03-11T09:00:00Z' },
      { id: 'bs1-msg-2', senderId: 'brand-user', senderName: 'Dior Atelier', senderRole: 'brand', content: 'Welcome! We\'d be delighted to create this for you. I\'ve reviewed your measurements and fabric preferences. Let\'s schedule your consultation at our Avenue Montaigne atelier — would March 20th at 2 PM work?', createdAt: '2026-03-12T11:00:00Z' },
      { id: 'bs1-msg-3', senderId: 'uhni-user', senderName: 'You', senderRole: 'client', content: 'Perfect, March 20th works. Should I bring any reference photos or inspiration?', createdAt: '2026-03-12T14:00:00Z' },
      { id: 'bs1-msg-4', senderId: 'brand-user', senderName: 'Dior Atelier', senderRole: 'brand', content: 'Please bring any images you love. We\'ll have fabric swatches from our Loro Piana selection ready, plus our archive sketches of the classic Bar silhouette for reference.', createdAt: '2026-03-12T16:00:00Z' },
    ],
    timelineEvents: [
      { id: 'bs1-tl-1', status: 'consultation', note: 'Bespoke commission submitted — initial consultation to be scheduled', updatedBy: 'system', createdAt: '2026-03-11T09:00:00Z' },
    ],
    clientApprovalRequired: false,
    clientApproved: false,
    createdAt: '2026-03-11T09:00:00Z',
    updatedAt: '2026-03-12T16:00:00Z',
  },

  // ── 2. DESIGN APPROVAL — sketches ready, waiting for client to approve ──
  {
    id: 'bespoke-002',
    brandId: 'dior',
    brandName: 'Dior',
    selectedBrands: [{ id: 'dior', name: 'Dior' }],
    type: 'custom_design',
    title: 'Bespoke Evening Gown — Monaco Gala',
    description: 'One-of-a-kind evening gown for the Monaco Spring Gala, inspired by vintage Dior archives. A-line ball gown in midnight blue silk duchess satin with hand-embroidered French lace overlay and crystal beading.',
    specifications: [
      { category: 'Design', label: 'Silhouette', value: 'A-Line Ball Gown', notes: 'Inspired by 1953 Vivante line' },
      { category: 'Fabric', label: 'Primary', value: 'Silk Duchess Satin', notes: 'Midnight blue — custom dyed' },
      { category: 'Fabric', label: 'Overlay', value: 'French Chantilly Lace', notes: 'Hand-embroidered floral motif' },
      { category: 'Detail', label: 'Embellishment', value: 'Swarovski Crystal Beading', notes: 'Cascading from bodice to hip' },
      { category: 'Detail', label: 'Train', value: 'Cathedral Length (2m)', notes: 'Detachable for reception' },
    ],
    detailedSpec: {
      measurements: { chest: 86, waist: 66, hips: 90, height: 170, notes: 'Will wear 10cm heels — adjust hem accordingly' },
      fabricPreferences: 'Silk duchess satin in deep midnight blue. French lace for overlay — not machine-made. Crystal embellishment should be subtle, not overpowering.',
      colorPreferences: 'Midnight blue to navy spectrum. No black, no bright blue.',
      specialInstructions: 'Cathedral-length train must be detachable via hidden hooks for the reception. Built-in corset for support. Concealed pockets on both sides.',
      occasionContext: 'Monaco Spring Gala — May 5th black-tie event, 200 guests, outdoor terrace followed by indoor ballroom',
      deliveryDeadline: '2026-04-28',
    },
    measurements: { bust: 86, waist: 66, hips: 90 },
    status: 'design_approval',
    timeline: [
      { id: 'bs2-step-1', stage: 'consultation', title: 'Initial Consultation', description: 'Vision discussion — silhouette, fabric, and occasion requirements', status: 'completed', completedAt: '2026-02-10T11:00:00Z', notes: 'Client brought mood board with 1950s Dior archive references' },
      { id: 'bs2-step-2', stage: 'design_approval', title: 'Design Approval', description: 'Reviewing final sketches and fabric swatches — client approval needed to proceed', status: 'current', estimatedDate: '2026-03-15T00:00:00Z', notes: '3 design variations sent to client on Mar 5 — awaiting selection' },
      { id: 'bs2-step-3', stage: 'production', title: 'Haute Couture Production', description: 'Hand-sewn by master seamstresses at the Dior Haute Couture atelier (5-6 weeks)', status: 'upcoming', estimatedDate: '2026-04-10T00:00:00Z' },
      { id: 'bs2-step-4', stage: 'fitting', title: 'Fittings (2 Sessions)', description: 'Two fitting sessions — muslin toile first, then in final fabric', status: 'upcoming', estimatedDate: '2026-04-17T00:00:00Z' },
      { id: 'bs2-step-5', stage: 'final_adjustments', title: 'Final Adjustments & Beading', description: 'Crystal application, hem finishing, and final press', status: 'upcoming', estimatedDate: '2026-04-24T00:00:00Z' },
      { id: 'bs2-step-6', stage: 'complete', title: 'Delivery', description: 'Delivered in custom Dior garment case with care instructions', status: 'upcoming', estimatedDate: '2026-04-28T00:00:00Z' },
    ],
    estimatedCompletion: '2026-04-28',
    price: 45000,
    depositPaid: 22500,
    depositPercentage: 50,
    atelierContact: 'haute.couture@dior.com',
    progressImages: [],
    messages: [
      { id: 'bs2-msg-1', senderId: 'uhni-user', senderName: 'You', senderRole: 'client', content: 'I need a show-stopping gown for the Monaco Spring Gala on May 5th. Thinking vintage Dior — the 1950s silhouettes.', createdAt: '2026-02-08T10:00:00Z' },
      { id: 'bs2-msg-2', senderId: 'brand-user', senderName: 'Dior Haute Couture', senderRole: 'brand', content: 'What a beautiful vision. We\'ve pulled references from the 1953 Vivante line and the 1957 Fuseau collection. Shall we meet Feb 10 to discuss in person?', createdAt: '2026-02-09T14:00:00Z' },
      { id: 'bs2-msg-3', senderId: 'brand-user', senderName: 'Dior Haute Couture', senderRole: 'brand', content: 'Following our lovely consultation, we\'ve prepared 3 design variations. All feature the A-line silhouette you loved, but with different lace and beading options. Sketches attached — please let us know your preference so we can begin.', createdAt: '2026-03-05T16:00:00Z' },
      { id: 'bs2-msg-4', senderId: 'uhni-user', senderName: 'You', senderRole: 'client', content: 'These are stunning! I\'m leaning towards Variation B with the cascading crystals. Can we add the detachable train from Variation C?', createdAt: '2026-03-06T09:00:00Z' },
      { id: 'bs2-msg-5', senderId: 'brand-user', senderName: 'Dior Haute Couture', senderRole: 'brand', content: 'Absolutely — Variation B with the cathedral train is a wonderful combination. I\'ll update the final sketch. Once you give the green light, we\'ll begin sourcing the fabric immediately.', createdAt: '2026-03-06T15:00:00Z' },
    ],
    timelineEvents: [
      { id: 'bs2-tl-1', status: 'consultation', note: 'Commission submitted — haute couture evening gown for Monaco Gala', updatedBy: 'system', createdAt: '2026-02-08T10:00:00Z' },
      { id: 'bs2-tl-2', status: 'consultation', note: 'In-person consultation completed at Avenue Montaigne — silhouette and fabric direction confirmed', updatedBy: 'brand', createdAt: '2026-02-10T17:00:00Z' },
      { id: 'bs2-tl-3', status: 'design_approval', note: '3 design variations sent to client for review — awaiting selection', updatedBy: 'brand', createdAt: '2026-03-05T16:00:00Z' },
    ],
    clientApprovalRequired: true,
    clientApproved: false,
    createdAt: '2026-02-08T10:00:00Z',
    updatedAt: '2026-03-06T15:00:00Z',
  },

  // ── 3. PRODUCTION — approved and being crafted ────────────────────
  {
    id: 'bespoke-003',
    brandId: 'hermes',
    brandName: 'Hermès',
    selectedBrands: [{ id: 'hermes', name: 'Hermès' }],
    type: 'modification',
    title: 'Custom Kelly 28 — Rose Sakura with Gold Hardware',
    description: 'Personalized Hermès Kelly 28 Sellier in Rose Sakura Epsom leather with champagne gold hardware. Custom interior hot-stamping and a hand-painted strap.',
    specifications: [
      { category: 'Base', label: 'Model', value: 'Kelly 28 Sellier' },
      { category: 'Material', label: 'Leather', value: 'Epsom', notes: 'Rose Sakura — spring 2026 exclusive color' },
      { category: 'Hardware', label: 'Metal', value: 'Champagne Gold', notes: 'Brushed finish, not polished' },
      { category: 'Personalization', label: 'Hot Stamp', value: '"A.S." in gold foil', notes: 'Interior flap — 1cm height' },
      { category: 'Personalization', label: 'Strap', value: 'Hand-painted cherry blossom motif', notes: 'By the Hermès leather painting atelier' },
    ],
    measurements: {},
    status: 'production',
    timeline: [
      { id: 'bs3-step-1', stage: 'consultation', title: 'Consultation', description: 'Discussed customization options with Hermès private client team', status: 'completed', completedAt: '2026-01-20T10:00:00Z', notes: 'Client selected Rose Sakura from new seasonal palette' },
      { id: 'bs3-step-2', stage: 'design_approval', title: 'Design Confirmation', description: 'Approved final specifications — leather, hardware, hot-stamp placement', status: 'completed', completedAt: '2026-01-28T14:00:00Z', notes: 'Client approved hand-painted strap design on Jan 28' },
      { id: 'bs3-step-3', stage: 'production', title: 'Artisan Production', description: 'Single artisan crafting the Kelly over 18-25 hours at the Hermès atelier in Pantin', status: 'current', estimatedDate: '2026-04-01T00:00:00Z', notes: 'Assigned to master saddler — leather cutting completed, stitching in progress' },
      { id: 'bs3-step-4', stage: 'fitting', title: 'Quality Inspection', description: 'Final quality check, hardware fitting, and hand-painted strap application', status: 'upcoming', estimatedDate: '2026-04-08T00:00:00Z' },
      { id: 'bs3-step-5', stage: 'final_adjustments', title: 'Final Touches', description: 'Hot-stamping, final conditioning, and presentation packaging', status: 'upcoming', estimatedDate: '2026-04-12T00:00:00Z' },
      { id: 'bs3-step-6', stage: 'complete', title: 'Delivery', description: 'Presented in signature orange box with documentation of provenance', status: 'upcoming', estimatedDate: '2026-04-18T00:00:00Z' },
    ],
    estimatedCompletion: '2026-04-18',
    price: 32000,
    depositPaid: 16000,
    depositPercentage: 50,
    atelierContact: 'private.clients@hermes.com',
    progressImages: [
      'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&q=80',
    ],
    messages: [
      { id: 'bs3-msg-1', senderId: 'uhni-user', senderName: 'You', senderRole: 'client', content: 'I\'d love a Kelly 28 in the new Rose Sakura color. Can we add custom gold hardware and a hand-painted strap?', createdAt: '2026-01-18T09:00:00Z' },
      { id: 'bs3-msg-2', senderId: 'brand-user', senderName: 'Hermès Private Client', senderRole: 'brand', content: 'Rose Sakura is an excellent choice — it\'s exclusive to spring 2026. We can offer champagne gold hardware with a brushed finish. The hand-painted strap will be done by our leather painting atelier. Shall we discuss in person on Jan 20?', createdAt: '2026-01-19T11:00:00Z' },
      { id: 'bs3-msg-3', senderId: 'brand-user', senderName: 'Hermès Private Client', senderRole: 'brand', content: 'Production update: your Kelly has been assigned to one of our most experienced saddlers. The leather has been cut and hand-stitching with saddle stitch is underway. Estimated 3 more weeks for the main construction.', createdAt: '2026-03-10T14:00:00Z' },
      { id: 'bs3-msg-4', senderId: 'uhni-user', senderName: 'You', senderRole: 'client', content: 'Wonderful, thank you for the update! Can\'t wait to see the finished piece.', createdAt: '2026-03-10T16:00:00Z' },
    ],
    timelineEvents: [
      { id: 'bs3-tl-1', status: 'consultation', note: 'Custom Kelly request submitted — Rose Sakura with gold hardware', updatedBy: 'system', createdAt: '2026-01-18T09:00:00Z' },
      { id: 'bs3-tl-2', status: 'consultation', note: 'In-person consultation at Hermès Faubourg — customization options finalized', updatedBy: 'brand', createdAt: '2026-01-20T17:00:00Z' },
      { id: 'bs3-tl-3', status: 'design_approval', note: 'Design approved — leather, hardware, hot-stamp placement, and strap painting confirmed', updatedBy: 'brand', createdAt: '2026-01-28T14:00:00Z' },
      { id: 'bs3-tl-4', status: 'production', note: 'Production started — assigned to master saddler at Pantin atelier', updatedBy: 'brand', createdAt: '2026-02-15T10:00:00Z' },
      { id: 'bs3-tl-5', status: 'production', note: 'Leather cutting complete, hand-stitching in progress', updatedBy: 'brand', createdAt: '2026-03-10T14:00:00Z' },
    ],
    clientApprovalRequired: false,
    clientApproved: true,
    createdAt: '2026-01-18T09:00:00Z',
    updatedAt: '2026-03-10T14:00:00Z',
  },

  // ── 4. FITTING — first fitting completed, adjustments being made ───
  {
    id: 'bespoke-004',
    brandId: 'bottega-veneta',
    brandName: 'Bottega Veneta',
    selectedBrands: [{ id: 'bottega-veneta', name: 'Bottega Veneta' }],
    type: 'made_to_measure',
    title: 'Custom Intrecciato Blazer — Cashmere',
    description: 'Made-to-measure blazer in Bottega Veneta\'s signature intrecciato-weave cashmere. Relaxed silhouette with custom mother-of-pearl buttons and silk lining.',
    specifications: [
      { category: 'Fabric', label: 'Material', value: 'Cashmere-Wool Blend', notes: 'Woven in intrecciato pattern — Vicenza atelier' },
      { category: 'Fabric', label: 'Color', value: 'Parakeet Green', notes: 'Bottega SS26 signature color' },
      { category: 'Fabric', label: 'Lining', value: 'Mulberry Silk', notes: 'Tonal contrast — deep forest green' },
      { category: 'Details', label: 'Buttons', value: 'Mother of Pearl', notes: 'Custom-cut, 2.5cm diameter' },
      { category: 'Fit', label: 'Silhouette', value: 'Relaxed Single-Breasted', notes: 'Slightly oversized through the shoulders' },
    ],
    detailedSpec: {
      measurements: { chest: 92, waist: 72, shoulders: 40, sleeveLength: 62, height: 175 },
      fabricPreferences: 'Intrecciato-weave cashmere. No synthetics. Mulberry silk lining.',
      colorPreferences: 'Parakeet green (SS26 color). Deep forest green lining.',
      specialInstructions: 'Relaxed but not oversized. Interior pocket large enough for a phone. No brand labels on exterior.',
      occasionContext: 'Smart casual — gallery openings, private dinners, weekend travel',
    },
    measurements: { chest: 92, waist: 72, shoulders: 40, sleeveLength: 62 },
    status: 'fitting',
    timeline: [
      { id: 'bs4-step-1', stage: 'consultation', title: 'Consultation', description: 'Met with Bottega Veneta\'s MTM team in Milan', status: 'completed', completedAt: '2026-01-08T14:00:00Z', notes: 'Selected intrecciato cashmere and parakeet green from seasonal palette' },
      { id: 'bs4-step-2', stage: 'design_approval', title: 'Design Approval', description: 'Approved final design with fabric swatch and button selection', status: 'completed', completedAt: '2026-01-15T10:00:00Z', notes: 'Client approved after reviewing muslin prototype photos' },
      { id: 'bs4-step-3', stage: 'production', title: 'Production', description: 'Intrecciato weaving and blazer construction at the Vicenza atelier', status: 'completed', completedAt: '2026-02-28T16:00:00Z', notes: 'Weaving took 2 weeks longer than standard due to cashmere delicacy' },
      { id: 'bs4-step-4', stage: 'fitting', title: 'First Fitting', description: 'In-person fitting at the Milan showroom — checking fit and proportions', status: 'current', estimatedDate: '2026-03-12T00:00:00Z', notes: 'Fitting completed Mar 12 — sleeve length needs +1cm, shoulder seam slightly forward' },
      { id: 'bs4-step-5', stage: 'final_adjustments', title: 'Final Adjustments', description: 'Adjusting sleeve length and shoulder placement per fitting notes', status: 'upcoming', estimatedDate: '2026-03-22T00:00:00Z' },
      { id: 'bs4-step-6', stage: 'complete', title: 'Delivery', description: 'Shipped in Bottega Veneta signature packaging', status: 'upcoming', estimatedDate: '2026-03-28T00:00:00Z' },
    ],
    estimatedCompletion: '2026-03-28',
    price: 6800,
    depositPaid: 3400,
    depositPercentage: 50,
    atelierContact: 'mtm.milan@bottegaveneta.com',
    progressImages: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80',
    ],
    messages: [
      { id: 'bs4-msg-1', senderId: 'brand-user', senderName: 'Bottega Veneta MTM', senderRole: 'brand', content: 'Your blazer is ready for the first fitting! We\'ve reserved the Milan showroom for you on March 12 at 11 AM. The intrecciato weave turned out beautifully.', createdAt: '2026-03-05T10:00:00Z' },
      { id: 'bs4-msg-2', senderId: 'uhni-user', senderName: 'You', senderRole: 'client', content: 'Can\'t wait! I\'ll be there at 11.', createdAt: '2026-03-05T12:00:00Z' },
      { id: 'bs4-msg-3', senderId: 'brand-user', senderName: 'Bottega Veneta MTM', senderRole: 'brand', content: 'Thank you for coming to the fitting today! The blazer sits beautifully on you. We noted two small adjustments: +1cm on sleeve length and a slight forward shift of the shoulder seam. These will be completed within 10 days.', createdAt: '2026-03-12T15:00:00Z' },
      { id: 'bs4-msg-4', senderId: 'uhni-user', senderName: 'You', senderRole: 'client', content: 'Agreed on both adjustments. The fabric feels incredible — the intrecciato texture is even more beautiful in person. Thank you!', createdAt: '2026-03-12T17:00:00Z' },
    ],
    timelineEvents: [
      { id: 'bs4-tl-1', status: 'consultation', note: 'Commission submitted — intrecciato cashmere blazer', updatedBy: 'system', createdAt: '2026-01-06T09:00:00Z' },
      { id: 'bs4-tl-2', status: 'consultation', note: 'In-person consultation at Milan showroom — fabric and design finalized', updatedBy: 'brand', createdAt: '2026-01-08T17:00:00Z' },
      { id: 'bs4-tl-3', status: 'design_approval', note: 'Design approved by client — muslin prototype confirmed', updatedBy: 'brand', createdAt: '2026-01-15T10:00:00Z' },
      { id: 'bs4-tl-4', status: 'production', note: 'Intrecciato weaving started at Vicenza atelier', updatedBy: 'brand', createdAt: '2026-01-22T10:00:00Z' },
      { id: 'bs4-tl-5', status: 'production', note: 'Construction complete — ready for fitting', updatedBy: 'brand', createdAt: '2026-02-28T16:00:00Z' },
      { id: 'bs4-tl-6', status: 'fitting', note: 'First fitting completed — minor adjustments needed: +1cm sleeves, shoulder seam shift', updatedBy: 'brand', createdAt: '2026-03-12T15:00:00Z' },
    ],
    clientApprovalRequired: false,
    clientApproved: true,
    createdAt: '2026-01-06T09:00:00Z',
    updatedAt: '2026-03-12T17:00:00Z',
  },

  // ── 5. FINAL ADJUSTMENTS — post-fitting, almost done ──────────────
  {
    id: 'bespoke-005',
    brandId: 'gucci',
    brandName: 'Gucci',
    selectedBrands: [{ id: 'gucci', name: 'Gucci' }],
    type: 'custom_design',
    title: 'Custom Bamboo Handle Clutch — Evening Edition',
    description: 'Bespoke evening clutch featuring Gucci\'s iconic bamboo handle with custom python-print leather and hand-applied gold leaf interior.',
    specifications: [
      { category: 'Design', label: 'Shape', value: 'Envelope Clutch with Bamboo Clasp' },
      { category: 'Material', label: 'Exterior', value: 'Python-Print Calfskin', notes: 'Emerald green base with gold accent' },
      { category: 'Material', label: 'Interior', value: 'Suede with Gold Leaf Lining', notes: 'Hand-applied gold leaf — Florentine technique' },
      { category: 'Hardware', label: 'Clasp', value: 'Bamboo + 18k Gold Plated' },
      { category: 'Personalization', label: 'Initials', value: '"A.S." — blind embossed on interior flap' },
    ],
    measurements: {},
    status: 'final_adjustments',
    timeline: [
      { id: 'bs5-step-1', stage: 'consultation', title: 'Consultation', description: 'Discussed design at Gucci Garden, Florence', status: 'completed', completedAt: '2025-12-10T11:00:00Z', notes: 'Client wanted a modern take on the iconic bamboo handle' },
      { id: 'bs5-step-2', stage: 'design_approval', title: 'Design Approval', description: 'Approved final design with leather and bamboo samples', status: 'completed', completedAt: '2025-12-20T14:00:00Z', notes: 'Selected emerald python-print after seeing 5 samples' },
      { id: 'bs5-step-3', stage: 'production', title: 'Production', description: 'Handcrafted at the Gucci ArtLab in Florence', status: 'completed', completedAt: '2026-02-14T16:00:00Z', notes: 'Gold leaf application took 3 additional days for precision' },
      { id: 'bs5-step-4', stage: 'fitting', title: 'Quality Review', description: 'Final quality inspection and bamboo clasp fitting', status: 'completed', completedAt: '2026-02-20T10:00:00Z', notes: 'Bamboo clasp realigned for smoother opening — 2mm adjustment' },
      { id: 'bs5-step-5', stage: 'final_adjustments', title: 'Final Touches', description: 'Blind embossing initials, final conditioning, and presentation prep', status: 'current', estimatedDate: '2026-03-18T00:00:00Z', notes: 'Embossing completed — leather conditioning and packaging in progress' },
      { id: 'bs5-step-6', stage: 'complete', title: 'Delivery', description: 'Delivered in Gucci signature box with artisan certificate', status: 'upcoming', estimatedDate: '2026-03-22T00:00:00Z' },
    ],
    estimatedCompletion: '2026-03-22',
    price: 4200,
    depositPaid: 4200,
    depositPercentage: 100,
    atelierContact: 'artlab.florence@gucci.com',
    progressImages: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&q=80',
    ],
    messages: [
      { id: 'bs5-msg-1', senderId: 'brand-user', senderName: 'Gucci ArtLab', senderRole: 'brand', content: 'Great news — production is complete! The gold leaf lining came out exquisitely. We\'re proceeding with the quality review and bamboo clasp fitting this week.', createdAt: '2026-02-14T16:00:00Z' },
      { id: 'bs5-msg-2', senderId: 'uhni-user', senderName: 'You', senderRole: 'client', content: 'That\'s wonderful! Any photos of the gold leaf interior?', createdAt: '2026-02-15T09:00:00Z' },
      { id: 'bs5-msg-3', senderId: 'brand-user', senderName: 'Gucci ArtLab', senderRole: 'brand', content: 'Photos attached! The Florentine technique creates a beautiful organic pattern — each piece is unique. We also made a minor 2mm adjustment to the bamboo clasp for a smoother opening.', createdAt: '2026-02-20T10:00:00Z' },
      { id: 'bs5-msg-4', senderId: 'brand-user', senderName: 'Gucci ArtLab', senderRole: 'brand', content: 'Final update: initials have been blind-embossed on the interior flap. We\'re now doing final leather conditioning and preparing the presentation packaging. Expected delivery by March 22.', createdAt: '2026-03-14T11:00:00Z' },
    ],
    timelineEvents: [
      { id: 'bs5-tl-1', status: 'consultation', note: 'Bespoke clutch commission — bamboo handle with custom materials', updatedBy: 'system', createdAt: '2025-12-08T09:00:00Z' },
      { id: 'bs5-tl-2', status: 'design_approval', note: 'Design approved — emerald python-print with gold leaf interior', updatedBy: 'brand', createdAt: '2025-12-20T14:00:00Z' },
      { id: 'bs5-tl-3', status: 'production', note: 'Production started at Gucci ArtLab, Florence', updatedBy: 'brand', createdAt: '2026-01-10T10:00:00Z' },
      { id: 'bs5-tl-4', status: 'production', note: 'Gold leaf application complete — main construction finished', updatedBy: 'brand', createdAt: '2026-02-14T16:00:00Z' },
      { id: 'bs5-tl-5', status: 'fitting', note: 'Quality review complete — bamboo clasp realigned', updatedBy: 'brand', createdAt: '2026-02-20T10:00:00Z' },
      { id: 'bs5-tl-6', status: 'final_adjustments', note: 'Blind embossing done — conditioning and packaging in progress', updatedBy: 'brand', createdAt: '2026-03-14T11:00:00Z' },
    ],
    clientApprovalRequired: false,
    clientApproved: true,
    createdAt: '2025-12-08T09:00:00Z',
    updatedAt: '2026-03-14T11:00:00Z',
  },

  // ── 6. COMPLETE — fully delivered ─────────────────────────────────
  {
    id: 'bespoke-006',
    brandId: 'dior',
    brandName: 'Dior',
    selectedBrands: [{ id: 'dior', name: 'Dior' }],
    type: 'modification',
    title: 'Lady Dior My ABCDior — Powder Pink Customization',
    description: 'Personalized Lady Dior in powder pink lambskin with custom champagne gold D.I.O.R. charms and hand-painted "S" initial charm. My ABCDior personalization program.',
    specifications: [
      { category: 'Base', label: 'Model', value: 'Lady Dior Medium' },
      { category: 'Material', label: 'Leather', value: 'Cannage Lambskin', notes: 'Powder pink' },
      { category: 'Hardware', label: 'Metal', value: 'Champagne Gold', notes: 'Light gold finish' },
      { category: 'Personalization', label: 'Charms', value: 'D.I.O.R. + Custom "S" Initial', notes: 'Hand-painted enamel "S" charm in navy blue' },
      { category: 'Personalization', label: 'Interior', value: 'Hot-stamped "For S.C. with love"', notes: 'Inside flap — gold foil' },
    ],
    measurements: {},
    status: 'complete',
    timeline: [
      { id: 'bs6-step-1', stage: 'consultation', title: 'Consultation', description: 'Discussed My ABCDior options at the boutique', status: 'completed', completedAt: '2025-11-15T14:00:00Z', notes: 'Selected powder pink with champagne gold from the customization palette' },
      { id: 'bs6-step-2', stage: 'design_approval', title: 'Design Confirmation', description: 'Approved charm selection and hot-stamp text', status: 'completed', completedAt: '2025-11-20T10:00:00Z', notes: 'Custom "S" charm to be hand-painted in navy enamel' },
      { id: 'bs6-step-3', stage: 'production', title: 'Production', description: 'Bag assembly and charm creation at the Dior atelier', status: 'completed', completedAt: '2026-01-10T16:00:00Z', notes: 'Hand-painting the initial charm took extra care — beautiful result' },
      { id: 'bs6-step-4', stage: 'fitting', title: 'Quality Inspection', description: 'Final review of leather quality, hardware, and personalization', status: 'completed', completedAt: '2026-01-15T10:00:00Z', notes: 'Passed QC — all charms securely attached, hot-stamp crisp and centered' },
      { id: 'bs6-step-5', stage: 'final_adjustments', title: 'Final Preparation', description: 'Conditioning, packaging in Dior gift box with ribbon', status: 'completed', completedAt: '2026-01-18T14:00:00Z', notes: 'Packaged with care card, dust bag, and charm maintenance guide' },
      { id: 'bs6-step-6', stage: 'complete', title: 'Delivered', description: 'White-glove delivery to client residence', status: 'completed', completedAt: '2026-01-22T11:00:00Z', notes: 'Delivered by Dior private client courier — client delighted' },
    ],
    estimatedCompletion: '2026-01-22',
    price: 6200,
    depositPaid: 6200,
    depositPercentage: 100,
    atelierContact: 'my.abcdior@dior.com',
    progressImages: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
    ],
    messages: [
      { id: 'bs6-msg-1', senderId: 'uhni-user', senderName: 'You', senderRole: 'client', content: 'I\'d like to customize a Lady Dior as a gift for myself — powder pink with a personal initial charm.', createdAt: '2025-11-14T10:00:00Z' },
      { id: 'bs6-msg-2', senderId: 'brand-user', senderName: 'Dior My ABCDior', senderRole: 'brand', content: 'Lovely choice! We offer the My ABCDior personalization program. You can select your charms, hardware color, and even add a hand-painted initial. Shall we meet at the boutique?', createdAt: '2025-11-14T14:00:00Z' },
      { id: 'bs6-msg-3', senderId: 'brand-user', senderName: 'Dior My ABCDior', senderRole: 'brand', content: 'Your Lady Dior has passed quality inspection! The hand-painted "S" charm is gorgeous — the navy enamel against powder pink is a stunning contrast. We\'re preparing the packaging now.', createdAt: '2026-01-15T10:00:00Z' },
      { id: 'bs6-msg-4', senderId: 'uhni-user', senderName: 'You', senderRole: 'client', content: 'It\'s absolutely perfect! Thank you so much — the hand-painted charm is even more beautiful than I imagined.', createdAt: '2026-01-22T14:00:00Z' },
      { id: 'bs6-msg-5', senderId: 'brand-user', senderName: 'Dior My ABCDior', senderRole: 'brand', content: 'We\'re so glad you love it! Remember, the charm maintenance guide is in your box. If you ever want to add new charms, we\'re here for you.', createdAt: '2026-01-22T16:00:00Z' },
    ],
    timelineEvents: [
      { id: 'bs6-tl-1', status: 'consultation', note: 'My ABCDior customization request submitted', updatedBy: 'system', createdAt: '2025-11-14T10:00:00Z' },
      { id: 'bs6-tl-2', status: 'consultation', note: 'Consultation at boutique — powder pink, champagne gold, custom S charm selected', updatedBy: 'brand', createdAt: '2025-11-15T17:00:00Z' },
      { id: 'bs6-tl-3', status: 'design_approval', note: 'Design confirmed — charm layout and hot-stamp text approved', updatedBy: 'brand', createdAt: '2025-11-20T10:00:00Z' },
      { id: 'bs6-tl-4', status: 'production', note: 'Production started — bag assembly and custom charm painting', updatedBy: 'brand', createdAt: '2025-12-01T10:00:00Z' },
      { id: 'bs6-tl-5', status: 'production', note: 'Hand-painted initial charm completed — assembly in progress', updatedBy: 'brand', createdAt: '2025-12-20T14:00:00Z' },
      { id: 'bs6-tl-6', status: 'fitting', note: 'Quality inspection passed — all personalization verified', updatedBy: 'brand', createdAt: '2026-01-15T10:00:00Z' },
      { id: 'bs6-tl-7', status: 'final_adjustments', note: 'Final conditioning and gift packaging prepared', updatedBy: 'brand', createdAt: '2026-01-18T14:00:00Z' },
      { id: 'bs6-tl-8', status: 'complete', note: 'Delivered via white-glove courier — client confirmed receipt and satisfaction', updatedBy: 'brand', createdAt: '2026-01-22T11:00:00Z' },
    ],
    clientApprovalRequired: false,
    clientApproved: true,
    createdAt: '2025-11-14T10:00:00Z',
    updatedAt: '2026-01-22T16:00:00Z',
  },
];

// Autonomous Activity Feed
export const mockAutonomousActivity: AutonomousActivity[] = [
  {
    id: 'activity-1',
    type: 'prepared',
    product: products.find(p => p.id === 'gucci-jackie-1961')!,
    price: 2900,
    reason: 'Matches your style preferences and complements 3 items in your wardrobe',
    timestamp: '2024-12-28T08:00:00Z',
    autoApproveDeadline: '2024-12-30T08:00:00Z',
    status: 'pending'
  },
  {
    id: 'activity-2',
    type: 'auto_purchased',
    product: products.find(p => p.id === 'hermes-silk-scarf')!,
    price: 450,
    reason: 'Within auto-approve threshold, perfect for your upcoming business meetings',
    timestamp: '2024-12-27T14:30:00Z',
    status: 'completed'
  },
  {
    id: 'activity-3',
    type: 'awaiting_approval',
    product: products.find(p => p.id === 'bottega-cassette')!,
    price: 3200,
    reason: 'Last one available in your preferred color, above auto-approve threshold',
    timestamp: '2024-12-26T10:00:00Z',
    autoApproveDeadline: '2024-12-28T10:00:00Z',
    status: 'pending'
  }
];

// Complete UHNI Profile
export const mockUHNIProfile: UHNIProfile = {
  userId: 'user-1',
  tier: 'uhni',
  memberSince: '2024-06-15',
  concierge: mockConcierge,
  autonomousSettings: mockAutonomousSettings,
  sourcingRequests: mockSourcingRequests,
  bespokeOrders: mockBespokeOrders,
  privateCollectionAccess: ['dior-private-2025', 'hermes-invitation'],
  lifetimeValue: 287500,
  preferences: {
    communicationPreference: 'all',
    preferredContactTimes: ['10:00-12:00', '15:00-18:00'],
    specialRequests: ['Prefer European sizes', 'Allergic to nickel - gold hardware only']
  }
};

// Helper function to get UHNI data
export function getUHNIProfile(): UHNIProfile | null {
  if (mockUserTier === 'uhni') {
    return mockUHNIProfile;
  }
  return null;
}

// ============================================
// PRIVATE COLLECTIONS
// ============================================

export const mockPrivateCollections: PrivateCollection[] = [
  {
    id: 'dior-private-2025',
    name: 'Dior Haute Couture Preview Spring 2025',
    brandId: 'dior',
    brandName: 'Dior',
    description: 'An exclusive first look at the upcoming Haute Couture collection, featuring revolutionary silhouettes inspired by the architecture of Tadao Ando.',
    heroImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    accessLevel: 'uhni_only',
    products: products.filter(p => p.brandId === 'dior').slice(0, 3),
    previewDate: '2025-01-20',
    releaseDate: '2025-03-15',
    invitationRequired: false,
    hasAccess: true,
    customer_ids: [],
    requested_customers: [],
  },
  {
    id: 'hermes-invitation',
    name: 'Hermès Les Métiers d\'Art',
    brandId: 'hermes',
    brandName: 'Hermès',
    description: 'A celebration of the exceptional craftsmanship from the Hermès ateliers. Limited edition pieces showcasing rare leathers and techniques.',
    heroImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800',
    accessLevel: 'invitation',
    products: products.filter(p => p.brandId === 'hermes').slice(0, 4),
    previewDate: '2025-02-01',
    releaseDate: '2025-04-01',
    invitationRequired: true,
    hasAccess: true,
    customer_ids: [],
    requested_customers: [],
  },
  {
    id: 'chanel-limited',
    name: 'Chanel N°5 Centenary Collection',
    brandId: 'chanel',
    brandName: 'Chanel',
    description: 'A limited capsule collection commemorating 100 years of the iconic N°5 fragrance, featuring jewelry and accessories with subtle fragrance bottle motifs.',
    heroImage: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800',
    accessLevel: 'request',
    products: [],
    previewDate: '2025-02-15',
    releaseDate: '2025-05-05',
    invitationRequired: false,
    hasAccess: false,
    customer_ids: [],
    requested_customers: [],
  },
  {
    id: 'bottega-archive',
    name: 'Bottega Veneta Archive Revival',
    brandId: 'bottega-veneta',
    brandName: 'Bottega Veneta',
    description: 'Rare archive pieces reissued in limited quantities. Each piece comes with a certificate of authenticity and archival documentation.',
    heroImage: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800',
    accessLevel: 'uhni_only',
    products: products.filter(p => p.brandId === 'bottega-veneta').slice(0, 2),
    previewDate: '2025-01-10',
    releaseDate: '2025-02-28',
    invitationRequired: false,
    hasAccess: true,
    customer_ids: [],
    requested_customers: [],
  }
];

// ============================================
// UHNI PRICING & NEGOTIATION
// ============================================

export const mockPriceNegotiations: PriceNegotiation[] = [
  // ────────────────────────────────────────────────────────────
  // IDs are shared with Brand side (src/data/brand-portal.ts) so both
  // portals show the SAME negotiations from different perspectives.
  //
  // FLOW: client proposes → brand responds (approve / counter / decline)
  //       if counter → client responds (accept / reject)
  // ────────────────────────────────────────────────────────────

  // STATE 1: PENDING — you proposed a price, waiting for brand response
  {
    id: 'neg-001',
    productId: 'dior-lady-dior-small',
    productName: 'Lady Dior Small — Cannage Lambskin',
    productImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
    brandName: 'Dior',
    originalPrice: 4900,
    proposedPrice: 4200,
    status: 'pending',
    clientMessage: 'I\'m purchasing 3 pieces this month for a personal wardrobe refresh. Would €4,200 work for the Lady Dior? Happy to commit to all 3 today.',
    conciergeNotes: [
      'Your proposal has been submitted to Dior — expected response within 48 hours.',
      'Leveraging your bulk purchase of 3 items to strengthen the negotiation.',
      'Isabella is in direct contact with the Dior VIP pricing team.'
    ],
    createdAt: '2026-03-11T10:00:00Z',
    expiresAt: '2026-03-25T10:00:00Z'
  },

  // STATE 2: PENDING (urgent) — proposed price, expiring soon
  {
    id: 'neg-002',
    productId: 'hermes-birkin-30',
    productName: 'Birkin 30 Togo Leather — Gold Hardware',
    productImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&q=80',
    brandName: 'Hermès',
    originalPrice: 21500,
    proposedPrice: 19500,
    status: 'pending',
    clientMessage: 'I\'ve been on the waitlist for 8 months. As a loyal client with 4 prior Hermès purchases, would €19,500 be possible?',
    conciergeNotes: [
      'Your proposal is being reviewed by Hermès — this is time-sensitive.',
      'Your 4 prior purchases (€68,000 total) strengthen the case.',
      'Isabella is following up urgently — offer window closing soon.'
    ],
    createdAt: '2026-03-01T14:00:00Z',
    expiresAt: '2026-03-15T14:00:00Z'
  },

  // STATE 3: COUNTER_OFFERED — brand sent a counter price, you need to accept or reject
  {
    id: 'neg-003',
    productId: 'dior-book-tote',
    productName: 'Book Tote Large — Toile de Jouy',
    productImage: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80',
    brandName: 'Dior',
    originalPrice: 3100,
    proposedPrice: 2600,
    counterOffer: 2850,
    status: 'counter_offered',
    clientMessage: 'First time purchasing Dior — would €2,600 be possible as a new client?',
    brandMessage: 'Welcome to the Dior family! We can offer €2,850 as a first-purchase courtesy, which includes complimentary gift wrapping and our signature Dior care kit.',
    respondedAt: '2026-03-10T15:00:00Z',
    conciergeNotes: [
      'Dior counter-offered at €2,850 — that\'s an 8% discount from listed price.',
      'The offer includes a welcome gift package (care kit + premium wrapping).',
      'Recommendation: Accept — this is a strong first-purchase discount from Dior.'
    ],
    createdAt: '2026-03-08T14:00:00Z',
    expiresAt: '2026-03-22T14:00:00Z'
  },

  // STATE 4: COUNTER_OFFERED — another counter, higher-value item
  {
    id: 'neg-004',
    productId: 'bottega-cassette',
    productName: 'Cassette Bag — Padded Intrecciato Nappa',
    productImage: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&q=80',
    brandName: 'Bottega Veneta',
    originalPrice: 3800,
    proposedPrice: 3000,
    counterOffer: 3500,
    status: 'counter_offered',
    clientMessage: 'I love the Cassette — could we do €3,000? I\'m also eyeing the Pouch for next month.',
    brandMessage: 'We appreciate your interest in multiple pieces. We can offer €3,500 for the Cassette, with a priority reservation on the Pouch and 10% loyalty discount on your next purchase.',
    respondedAt: '2026-03-09T11:00:00Z',
    conciergeNotes: [
      'Bottega countered at €3,500 — that\'s €300 off (7.9% discount).',
      'They\'re also offering priority reservation on the Pouch + 10% loyalty discount for next purchase.',
      'Recommendation: Strong deal considering the bundled perks.'
    ],
    createdAt: '2026-03-07T10:00:00Z',
    expiresAt: '2026-03-21T10:00:00Z'
  },

  // STATE 5: APPROVED — brand accepted your proposed price directly
  {
    id: 'neg-005',
    productId: 'gucci-jackie-1961',
    productName: 'Jackie 1961 Medium Shoulder Bag',
    productImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
    brandName: 'Gucci',
    originalPrice: 3200,
    proposedPrice: 2800,
    status: 'approved',
    clientMessage: 'I\'m buying multiple items this season — would €2,800 be possible for the Jackie 1961?',
    brandMessage: 'Approved! As a valued multi-purchase client, we\'re delighted to honour this price. Your 12.5% discount reflects your loyalty.',
    respondedAt: '2026-03-09T15:30:00Z',
    conciergeNotes: [
      'Gucci approved your price — €400 saved (12.5% off listed).',
      'Your 6 prior Gucci purchases this year secured immediate approval.',
      'You can now proceed to purchase at the agreed price of €2,800.'
    ],
    createdAt: '2026-03-07T09:00:00Z',
    expiresAt: '2026-03-21T09:00:00Z'
  },

  // STATE 6: ACCEPTED — full cycle complete (you proposed → brand countered → you accepted)
  {
    id: 'neg-006',
    productId: 'dior-j-adore-set',
    productName: "J'Adore Gift Set — Eau de Parfum + Travel Spray",
    productImage: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80',
    brandName: 'Dior',
    originalPrice: 420,
    proposedPrice: 350,
    counterOffer: 380,
    status: 'accepted',
    clientMessage: 'Buying as an anniversary gift — could we do €350?',
    brandMessage: 'We can offer €380 which includes complimentary engraving on the travel spray — a lovely personal touch for an anniversary.',
    respondedAt: '2026-03-06T09:00:00Z',
    conciergeNotes: [
      'You accepted the counter offer of €380 on Mar 7.',
      'Engraving arranged: "With Love, A." on the travel spray.',
      'Final price: €380 — saved €40 (9.5% off listed price).'
    ],
    createdAt: '2026-03-04T10:00:00Z',
    expiresAt: '2026-03-18T10:00:00Z'
  },

  // STATE 7: DECLINED — brand rejected (discount too steep for core product)
  {
    id: 'neg-007',
    productId: 'lv-capucines-mm',
    productName: 'Capucines MM — Taurillon Leather',
    productImage: 'https://images.unsplash.com/photo-1575032617751-6ddec2089882?w=400&q=80',
    brandName: 'Louis Vuitton',
    originalPrice: 8900,
    proposedPrice: 6500,
    status: 'declined',
    clientMessage: 'Would €6,500 be possible for the Capucines? I saw a similar price at a competitor.',
    brandMessage: 'Thank you for your interest. The Capucines MM is a signature piece with fixed global pricing — we are unable to accommodate discounts on this item. We\'d be happy to suggest seasonal pieces with more flexibility.',
    respondedAt: '2026-03-05T16:00:00Z',
    conciergeNotes: [
      'Louis Vuitton declined — they maintain strict no-discount policy on core leather goods.',
      'The requested 27% discount was too steep for the Capucines line.',
      'Suggestion: explore LV seasonal items or pre-loved for better pricing.'
    ],
    createdAt: '2026-03-03T11:00:00Z',
    expiresAt: '2026-03-17T11:00:00Z'
  },
];

export const _removedOffers = [
  // Active product offer — 15% off Lady Dior
  {
    id: 'offer-001',
    type: 'product',
    targetId: 'dior-lady-dior-small',
    targetName: 'Lady Dior Small — Cannage Lambskin',
    targetImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
    productSlug: 'dior-lady-dior-small',
    brandName: 'Dior',
    discountType: 'percentage',
    discountValue: 15,
    originalPrice: 4900,
    validFrom: '2026-03-10T00:00:00Z',
    validUntil: '2026-03-31T23:59:59Z',
    conditions: ['UHNI clients only', 'One per client', 'Not combinable with other offers'],
    isPrivate: false,
    claimedCount: 3,
    maxClaims: 20,
    claimed: false,
  },
  // Active collection offer — €500 off Dior Spring 2026
  {
    id: 'offer-002',
    type: 'collection',
    targetId: 'dior-spring-2026',
    targetName: 'Dior Spring 2026 Preview',
    targetImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
    brandName: 'Dior',
    discountType: 'fixed',
    discountValue: 500,
    validFrom: '2026-03-08T00:00:00Z',
    validUntil: '2026-04-07T23:59:59Z',
    conditions: ['Valid on first purchase from collection', 'Minimum spend €2,000', 'Cannot combine with other offers'],
    isPrivate: false,
    claimedCount: 8,
    maxClaims: 50,
    claimed: false,
  },
  // Active brand-wide offer — 10% off Gucci
  {
    id: 'offer-003',
    type: 'brand',
    targetId: 'gucci',
    targetName: 'Gucci',
    targetImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
    brandName: 'Gucci',
    discountType: 'percentage',
    discountValue: 10,
    validFrom: '2026-03-06T00:00:00Z',
    validUntil: '2026-04-03T23:59:59Z',
    conditions: ['Valid on full-price items only', 'Minimum purchase €1,500', 'Loyalty tier reward — recurring quarterly'],
    isPrivate: false,
    claimedCount: 12,
    maxClaims: 0,
    claimed: false,
  },
  // Already claimed — Bottega Cassette 12% off
  {
    id: 'offer-004',
    type: 'product',
    targetId: 'bottega-cassette',
    targetName: 'Cassette Bag — Padded Intrecciato',
    targetImage: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&q=80',
    productSlug: 'bottega-cassette',
    brandName: 'Bottega Veneta',
    discountType: 'percentage',
    discountValue: 12,
    originalPrice: 3800,
    validFrom: '2026-03-03T00:00:00Z',
    validUntil: '2026-03-23T23:59:59Z',
    conditions: ['One per client', 'Includes complimentary dust bag'],
    isPrivate: false,
    claimedCount: 7,
    maxClaims: 15,
    claimed: true,
    claimedBy: ['uhni-user'],
  },
  // Private offer — Hermès scarf targeted to this client
  {
    id: 'offer-005',
    type: 'product',
    targetId: 'hermes-silk-scarf',
    targetName: 'Hermès Carré 90 — Grand Manège',
    targetImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&q=80',
    productSlug: 'hermes-silk-scarf',
    brandName: 'Hermès',
    discountType: 'fixed',
    discountValue: 100,
    originalPrice: 450,
    validFrom: '2026-03-12T00:00:00Z',
    validUntil: '2026-03-27T23:59:59Z',
    conditions: ['Private invitation — you were selected based on purchase history', 'One per client', 'Cannot be transferred'],
    isPrivate: true,
    targetClientIds: ['uhni-user'],
    claimedCount: 0,
    maxClaims: 1,
    claimed: false,
  },
  // Expiring very soon — Dior Spring Weekend
  {
    id: 'offer-006',
    type: 'brand',
    targetId: 'dior',
    targetName: 'Dior',
    targetImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
    brandName: 'Dior',
    discountType: 'fixed',
    discountValue: 300,
    validFrom: '2026-03-01T00:00:00Z',
    validUntil: '2026-03-14T23:59:59Z',
    conditions: ['Spring Weekend Special', 'Minimum purchase €2,500', 'Complimentary gift wrapping included'],
    isPrivate: false,
    claimedCount: 18,
    maxClaims: 25,
    claimed: false,
  },
  // Nearly full — only 1 spot left, Gucci Jackie 1961
  {
    id: 'offer-007',
    type: 'product',
    targetId: 'gucci-jackie-1961',
    targetName: 'Jackie 1961 Medium Shoulder Bag',
    targetImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
    productSlug: 'gucci-jackie-1961',
    brandName: 'Gucci',
    discountType: 'percentage',
    discountValue: 20,
    originalPrice: 3200,
    validFrom: '2026-03-07T00:00:00Z',
    validUntil: '2026-03-21T23:59:59Z',
    conditions: ['Flash offer — limited availability', 'One per client', 'While stock lasts'],
    isPrivate: false,
    claimedCount: 4,
    maxClaims: 5,
    claimed: false,
  },
];

// ============================================
// UHNI PRICE ALERTS
// ============================================
// 4 alerts covering: triggered, close-to-target, monitoring, paused

export const mockPriceAlerts: UHNIPriceAlert[] = [
  // TRIGGERED — price dropped to target
  {
    id: 'alert-001',
    productId: 'lv-speedy-25',
    productName: 'Speedy Bandoulière 25',
    productImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
    brandName: 'Louis Vuitton',
    targetPrice: 1400,
    currentPrice: 1390,
    triggered: true,
    createdAt: '2026-02-15T09:00:00Z'
  },
  // CLOSE TO TARGET — 5% gap remaining
  {
    id: 'alert-002',
    productId: 'gucci-horsebit-loafer',
    productName: 'Horsebit Loafer',
    productImage: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&q=80',
    brandName: 'Gucci',
    targetPrice: 800,
    currentPrice: 840,
    triggered: false,
    createdAt: '2026-02-20T11:30:00Z'
  },
  // MONITORING — larger gap, watching
  {
    id: 'alert-003',
    productId: 'dior-book-tote',
    productName: 'Book Tote Large — Toile de Jouy',
    productImage: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&q=80',
    brandName: 'Dior',
    targetPrice: 2500,
    currentPrice: 3100,
    triggered: false,
    createdAt: '2026-03-01T14:00:00Z'
  },
  // MONITORING — high-value item
  {
    id: 'alert-004',
    productId: 'hermes-kelly-28',
    productName: 'Kelly 28 Sellier — Noir',
    productImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&q=80',
    brandName: 'Hermès',
    targetPrice: 18000,
    currentPrice: 21500,
    triggered: false,
    createdAt: '2026-01-28T08:00:00Z'
  },
];

export const mockPricingSummary: UHNIPricingSummary = {
  lifetimeSavings: 47850,
  activeNegotiations: 4,
  priceAlertsSet: 4,
};

// ============================================
// ENHANCED G-SAIL (GLOBAL SOURCING)
// ============================================

export const mockUHNIAvailabilitySearches: UHNIAvailabilitySearch[] = [
  {
    id: 'search-1',
    productId: 'hermes-kelly-28',
    productName: 'Kelly 28 Sellier Noir',
    productImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800',
    brandName: 'Hermès',
    status: 'found',
    priority: 'high',
    createdAt: '2025-01-20T08:00:00Z',
    conciergeAssigned: true,
    alternatives: [
      {
        id: 'alt-1',
        type: 'geography',
        region: 'Europe',
        city: 'Paris',
        boutiqueName: 'Hermès Faubourg Saint-Honoré',
        availabilityConfidence: 94,
        deliveryDays: 3,
        priceDifference: 0,
        reason: 'Available at flagship store. Priority allocation secured.',
        holdAvailable: true,
        holdExpiresAt: '2025-02-01T18:00:00Z',
        conciergeNote: 'Highly recommended - pristine condition, verified in person.',
        verifiedAt: '2025-01-28T10:00:00Z'
      },
      {
        id: 'alt-2',
        type: 'geography',
        region: 'Asia',
        city: 'Tokyo',
        boutiqueName: 'Hermès Ginza',
        availabilityConfidence: 87,
        deliveryDays: 5,
        priceDifference: 150,
        reason: 'In stock at Ginza boutique. Regional pricing applies.',
        holdAvailable: true,
        holdExpiresAt: '2025-02-02T12:00:00Z',
        verifiedAt: '2025-01-27T14:00:00Z'
      }
    ]
  },
  {
    id: 'search-2',
    productId: 'dior-saddle-vintage',
    productName: 'Saddle Bag Vintage 2000',
    productImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    brandName: 'Dior',
    status: 'searching',
    priority: 'standard',
    createdAt: '2025-01-25T11:00:00Z',
    conciergeAssigned: true,
    alternatives: []
  },
  {
    id: 'search-3',
    productId: 'bottega-pouch-large',
    productName: 'The Pouch Large',
    productImage: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800',
    brandName: 'Bottega Veneta',
    status: 'secured',
    priority: 'urgent',
    createdAt: '2025-01-18T09:00:00Z',
    conciergeAssigned: true,
    alternatives: [
      {
        id: 'alt-3',
        type: 'geography',
        region: 'Europe',
        city: 'Milan',
        boutiqueName: 'Bottega Veneta Via Montenapoleone',
        availabilityConfidence: 100,
        deliveryDays: 4,
        priceDifference: -80,
        reason: 'Secured and held for you. Ready for shipment.',
        holdAvailable: false,
        conciergeNote: 'Item secured on Jan 26. Awaiting your confirmation to ship.',
        verifiedAt: '2025-01-26T16:00:00Z'
      }
    ]
  }
];

export const mockGlobalNetworkStats: GlobalNetworkStats = {
  activeSearches: 3,
  regionsConnected: 47,
  boutiquesNetwork: 1250,
  averageDeliveryDays: 4.2,
  successRate: 94.7
};

export const mockRestockPredictions: RestockPrediction[] = [
  {
    productId: 'hermes-constance-mini',
    productName: 'Constance Mini 18',
    productImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800',
    brandName: 'Hermès',
    estimatedDate: '2025-02-15',
    probability: 78,
    alertEnabled: true
  },
  {
    productId: 'dior-book-tote',
    productName: 'Book Tote Medium',
    productImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    brandName: 'Dior',
    estimatedDate: '2025-02-08',
    probability: 85,
    alertEnabled: false
  }
];

// ============================================
// EXCLUSIVE EVENTS
// ============================================

export const mockExclusiveEvents: ExclusiveEvent[] = [
  {
    id: 'evt-001',
    title: 'Art of Haute Couture: Behind the Atelier',
    type: 'exhibition',
    host: 'Maison Valentino',
    venue: 'Palazzo Mignanelli',
    city: 'Rome',
    country: 'Italy',
    date: '2026-03-20',
    time: '17:00',
    description: 'A rare glimpse into the Valentino atelier. Witness master artisans at work, explore archive pieces spanning six decades, and enjoy a private dinner in the palazzo gardens.',
    highlights: ['Atelier tour', 'Archive viewing', 'Private dinner', 'Meet the artisans'],
    registrationStatus: 'open',
    maxAttendees: 25,
    spotsLeft: 8
  },
  {
    id: 'evt-002',
    title: 'Watchmaking Masterclass with Patek Philippe',
    type: 'masterclass',
    host: 'Patek Philippe',
    venue: 'Patek Philippe Salon',
    city: 'Geneva',
    country: 'Switzerland',
    date: '2026-04-10',
    time: '10:00',
    description: 'An immersive full-day masterclass in the art of haute horlogerie. Learn from master watchmakers, handle rare complications, and receive a certificate of completion.',
    highlights: ['Hands-on workshop', 'Rare piece handling', 'Certificate', 'Lunch with CEO'],
    registrationStatus: 'registered',
    maxAttendees: 12,
    spotsLeft: 0
  },
  {
    id: 'evt-003',
    title: 'Spring Gala: Fashion Forward Foundation',
    type: 'gala',
    host: 'Fashion Forward Foundation',
    venue: 'The Met',
    city: 'New York',
    country: 'United States',
    date: '2026-05-05',
    time: '19:30',
    description: 'Annual charity gala celebrating the intersection of fashion and sustainability. Black-tie event with live performances, silent auction, and networking with industry leaders.',
    highlights: ['Black-tie dinner', 'Silent auction', 'Live performances', 'Sustainability showcase'],
    registrationStatus: 'open',
    maxAttendees: 200,
    spotsLeft: 45
  }
];

// ============================================
// PRIVATE SHOPPING EVENTS
// ============================================

export const mockPrivateShoppingEvents: PrivateShoppingEvent[] = [
  {
    id: 'pse-001',
    title: 'Chanel Haute Couture Preview',
    designer: 'Chanel',
    venue: 'Palais de Tokyo',
    city: 'Paris',
    date: '2026-03-15',
    time: '18:00',
    duration: '3 hours',
    description: 'An exclusive preview of the upcoming Chanel Haute Couture collection. Private viewing with creative director, champagne reception, and first-access ordering.',
    status: 'upcoming',
    maxGuests: 30,
    guestsConfirmed: 18,
    dressCode: 'Black Tie Optional',
    perks: ['First access to order', 'Meet the designer', 'Champagne reception', 'Personal styling']
  },
  {
    id: 'pse-002',
    title: 'Brunello Cucinelli Private Trunk Show',
    designer: 'Brunello Cucinelli',
    venue: 'The Dorchester',
    city: 'London',
    date: '2026-04-02',
    time: '14:00',
    duration: '4 hours',
    description: 'Private trunk show featuring the complete SS26 collection. Personal consultation with Italian artisans and made-to-measure services.',
    status: 'rsvp_confirmed',
    maxGuests: 20,
    guestsConfirmed: 15,
    dressCode: 'Smart Casual',
    perks: ['Made-to-measure consultation', 'Artisan meet & greet', 'Afternoon tea', 'Exclusive pricing']
  },
  {
    id: 'pse-003',
    title: 'Loro Piana Winter Collection Preview',
    designer: 'Loro Piana',
    venue: 'Mandarin Oriental',
    city: 'Milan',
    date: '2026-02-28',
    time: '19:00',
    duration: '2.5 hours',
    description: 'An intimate evening showcasing Loro Piana\'s finest cashmere and vicuña pieces. Limited edition items available exclusively at this event.',
    status: 'invite_only',
    maxGuests: 15,
    guestsConfirmed: 12,
    dressCode: 'Cocktail',
    perks: ['Limited edition access', 'Fabric workshop', 'Wine tasting', 'Custom monogramming']
  }
];

// ============================================
// HERITAGE ARCHIVE
// ============================================

export const mockHeritageArchiveItems: HeritageArchiveItem[] = [
  {
    id: 'ha-001',
    title: 'The Original Bar Jacket',
    brand: 'Dior',
    era: '1947',
    description: 'The iconic Bar Jacket from Christian Dior\'s revolutionary "New Look" collection that transformed post-war fashion. Featuring nipped waist and full skirt silhouette.',
    significance: 'Defined the post-war feminine silhouette and established Dior as a global fashion house.',
    image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800',
    relatedProducts: ['dior-bar-jacket']
  },
  {
    id: 'ha-002',
    title: 'Kelly Bag Prototype',
    brand: 'Hermès',
    era: '1956',
    description: 'One of the earliest versions of the Kelly bag, renamed after Grace Kelly was photographed shielding her pregnancy with it. Hand-stitched saddle leather with palladium hardware.',
    significance: 'Transformed from a functional saddle bag to the most coveted luxury accessory in history.',
    image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800',
    relatedProducts: ['hermes-kelly-28']
  },
  {
    id: 'ha-003',
    title: 'Intrecciato Weave Sample',
    brand: 'Bottega Veneta',
    era: '1966',
    description: 'An original sample of the signature intrecciato weave technique developed in the Bottega Veneta workshop in Vicenza. This weaving method became the house\'s defining motif.',
    significance: 'The intrecciato weave became synonymous with understated luxury and "when your own initials are enough."',
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800',
    relatedProducts: ['bottega-cassette']
  }
];

// ============================================
// INTELLIGENCE INSIGHTS
// ============================================

export const mockIntelligenceInsights: IntelligenceInsight[] = [
  {
    id: 'ins-001',
    title: 'Quiet Luxury Continues to Rise',
    category: 'style_trend',
    summary: 'Demand for understated, logo-free luxury items has increased 34% this quarter. Brands like Loro Piana, Brunello Cucinelli, and The Row are seeing record engagement.',
    impact: 'high',
    trend: 'rising',
    confidence: 92,
    date: '2026-02-15'
  },
  {
    id: 'ins-002',
    title: 'Vintage Hermès Investment Value',
    category: 'investment_piece',
    summary: 'Pre-owned Hermès bags have appreciated 14.2% year-over-year, outperforming the S&P 500. Birkin 25 in exotic leathers showing highest appreciation.',
    impact: 'high',
    trend: 'rising',
    confidence: 88,
    date: '2026-02-10'
  },
  {
    id: 'ins-003',
    title: 'Wardrobe Gap: Evening Wear',
    category: 'wardrobe_gap',
    summary: 'Based on your upcoming calendar events and current wardrobe analysis, you may want to consider adding a formal evening gown. Three events in the next 60 days require black-tie attire.',
    impact: 'medium',
    trend: 'stable',
    confidence: 85,
    date: '2026-02-08'
  },
  {
    id: 'ins-004',
    title: 'Asian Market Luxury Rebound',
    category: 'market_signal',
    summary: 'Chinese luxury spending is rebounding strongly with a 22% increase in Q1 projections. Japanese market continues its steady growth at 8% YoY.',
    impact: 'medium',
    trend: 'rising',
    confidence: 79,
    date: '2026-02-05'
  }
];

// ============================================
// U13: ZERO-UI COMMERCE CONFIG
// ============================================

export const mockZeroUIConfig: ZeroUIConfig = {
  autoReplenish: true,
  invisibleCheckout: false,
  wardrobePreparation: true,
  triggers: [
    {
      id: 'trigger-1',
      type: 'restock',
      description: 'Auto-restock signature fragrances when supply drops below 30 days',
      enabled: true,
      lastTriggered: '2026-01-28T10:00:00Z'
    },
    {
      id: 'trigger-2',
      type: 'seasonal',
      description: 'Prepare seasonal wardrobe transition pieces 4 weeks before equinox',
      enabled: true,
      lastTriggered: '2025-12-15T08:00:00Z'
    },
    {
      id: 'trigger-3',
      type: 'event',
      description: 'Source outfit options 2 weeks before calendar events',
      enabled: false
    },
    {
      id: 'trigger-4',
      type: 'travel',
      description: 'Prepare travel wardrobe based on destination weather and itinerary',
      enabled: true,
      lastTriggered: '2026-02-01T14:00:00Z'
    }
  ],
  preferences: {
    maxAutoSpend: 5000,
    preferredBrands: ['Hermès', 'Dior', 'Loro Piana', 'Brunello Cucinelli'],
    excludedCategories: ['swimwear', 'sportswear'],
    notifyBefore: true,
    notifyAfter: true
  }
};

// ============================================
// U14: INVISIBLE TRANSACTIONS
// ============================================

export const mockInvisibleTransactions: InvisibleTransaction[] = [
  {
    id: 'inv-001',
    productId: 'hermes-silk-scarf',
    productName: 'Hermès Silk Carré 90',
    productImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800',
    method: 'auto',
    status: 'completed',
    discretionLevel: 'standard',
    noDigitalTrail: false,
    amount: 450,
    date: '2026-02-10T09:30:00Z'
  },
  {
    id: 'inv-002',
    productId: 'dior-sauvage-refill',
    productName: 'Dior Sauvage Parfum Refill',
    productImage: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800',
    method: 'scheduled',
    status: 'processing',
    discretionLevel: 'high',
    noDigitalTrail: false,
    amount: 180,
    date: '2026-02-14T08:00:00Z'
  },
  {
    id: 'inv-003',
    productId: 'cartier-love-bracelet',
    productName: 'Cartier Love Bracelet Rose Gold',
    productImage: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
    method: 'concierge',
    status: 'pending',
    discretionLevel: 'maximum',
    noDigitalTrail: true,
    amount: 7650,
    date: '2026-02-16T11:00:00Z'
  }
];

// ============================================
// U15: CONCIERGE TASKS
// ============================================

export const mockConciergeTasks: ConciergeTask[] = [
  {
    id: 'task-001',
    type: 'styling',
    title: 'Monaco GP Weekend Styling',
    description: 'Prepare complete looks for three Monaco GP events: yacht party, race day, and gala dinner.',
    status: 'in_progress',
    assignedTo: 'Isabella Martinez',
    priority: 'high',
    dueDate: '2026-05-10',
    notes: ['Client prefers European designers', 'No repeat brands across events', 'Jewelry coordination needed'],
    clientInstructions: 'Please ensure all outfits are comfortable for warm weather. I prefer minimal accessories.',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-15T14:30:00Z'
  },
  {
    id: 'task-002',
    type: 'sourcing',
    title: 'Vintage Chanel Jacket Search',
    description: 'Locate a vintage Chanel tweed jacket from the 1990s Karl Lagerfeld era, size 38.',
    status: 'pending',
    assignedTo: 'Isabella Martinez',
    priority: 'medium',
    dueDate: '2026-03-30',
    notes: ['Checking Paris vintage dealers', 'Vestiaire Collective monitoring active'],
    createdAt: '2026-02-10T09:00:00Z',
    updatedAt: '2026-02-10T09:00:00Z'
  },
  {
    id: 'task-003',
    type: 'reservation',
    title: 'Dior Private Viewing Reservation',
    description: 'Reserve private viewing appointment at Dior 30 Montaigne for client visit to Paris.',
    status: 'completed',
    assignedTo: 'Isabella Martinez',
    priority: 'medium',
    dueDate: '2026-02-20',
    notes: ['Confirmed for Feb 22 at 14:00', 'VIP salon reserved', 'Champagne service arranged'],
    createdAt: '2026-02-05T11:00:00Z',
    updatedAt: '2026-02-12T16:00:00Z'
  },
  {
    id: 'task-004',
    type: 'alteration',
    title: 'Bar Jacket Final Fitting',
    description: 'Coordinate final fitting for bespoke Dior Bar Jacket at Paris atelier.',
    status: 'pending',
    assignedTo: 'Isabella Martinez',
    priority: 'urgent',
    dueDate: '2026-02-25',
    notes: ['Atelier confirmed availability', 'Transport arranged from hotel'],
    clientInstructions: 'I will be in Paris Feb 23-26. Morning appointments preferred.',
    createdAt: '2026-02-08T08:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z'
  }
];

// ============================================
// U16: SILENT COMMERCE ITEMS
// ============================================

export const mockSilentCommerceItems: SilentCommerceItem[] = [
  {
    id: 'sc-001',
    productId: 'loro-piana-cashmere-throw',
    productName: 'Loro Piana Baby Cashmere Throw',
    productImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    brandName: 'Loro Piana',
    price: 2850,
    awareness: 'passive',
    context: 'Based on your home decor preferences and upcoming winter travel to Aspen.',
    displayMode: 'ambient',
    relevanceScore: 78
  },
  {
    id: 'sc-002',
    productId: 'brunello-cucinelli-blazer',
    productName: 'Brunello Cucinelli Linen Blazer',
    productImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
    brandName: 'Brunello Cucinelli',
    price: 3200,
    awareness: 'active',
    context: 'Complements 4 items in your wardrobe. Last one in your size at Milan boutique.',
    displayMode: 'card',
    relevanceScore: 92
  },
  {
    id: 'sc-003',
    productId: 'hermes-garden-party',
    productName: 'Hermès Garden Party 36',
    productImage: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800',
    brandName: 'Hermès',
    price: 3400,
    awareness: 'urgent',
    context: 'Rare color just became available. Only 2 units globally. Your concierge can secure it.',
    displayMode: 'notification',
    relevanceScore: 97
  }
];
