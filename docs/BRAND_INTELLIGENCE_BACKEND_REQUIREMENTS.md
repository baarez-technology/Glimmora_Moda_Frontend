# Brand Portal Intelligence — Backend API Requirements

**Prepared for:** Backend Development Team
**Date:** 2026-03-10
**Frontend Status:** All 11 pages built with mock data, ready for API integration
**Auth:** All endpoints require `Authorization: Bearer <brand-token>`

---

## Quick Reference — All Endpoints

| # | Feature | Method | Endpoint | AI/ML Needed |
|---|---------|--------|----------|-------------|
| B17 | Design-to-Demand | GET | `/api/brand/intelligence/demand-simulations` | Demand forecasting |
| B18 | Intelligence Agent | GET | `/api/brand/intelligence/signals` | Behavior signal detection |
| B19 | Brand Concierge | GET | `/api/brand/intelligence/concierge-config` | Conversational AI (LLM) |
| B20 | Memory Imprint | GET | `/api/brand/intelligence/memory-imprints` | Psychometric scoring |
| B21 | Digital Twin | GET | `/api/brand/intelligence/digital-twin` | Graph analytics |
| B22 | Cultural Authority | GET | `/api/brand/intelligence/cultural-authority` | NLP sentiment analysis |
| B23 | Boutique Performance | GET | `/api/brand/intelligence/boutique-performances` | Multi-dimensional scoring |
| B24 | Counterfeit Detection | GET | `/api/brand/intelligence/counterfeit-alerts` | Image recognition |
| B25 | Drop Simulator | GET | `/api/brand/intelligence/drop-simulations` | Regional demand forecasting |
| B26 | Heritage Preservation | GET | `/api/brand/intelligence/heritage-assets` | 3D scanning pipeline |
| B27 | Client Genome | GET | `/api/brand/intelligence/client-archetypes` | Client segmentation |

---

## B17: Design-to-Demand Simulation

### What It Does
Allows brands to test market demand for a design concept BEFORE manufacturing. The brand uploads a concept (name, category, audience, price), and the AI predicts demand across regions. If demand is high, the brand can take pre-orders before production ("Sell-Before-Make").

### Why It Matters
- Eliminates blind manufacturing (traditional fashion has 30-40% unsold inventory)
- Enables pre-order model — manufacture only what's already sold
- Reduces waste, guarantees revenue

### How AI Works
1. Brand submits concept details (name, category, target audience, price point)
2. AI analyzes: consumer behavior data (browse/wishlist/search patterns), similar product sales history, regional fashion trends, competitor launches, seasonal calendar
3. Outputs: demand score (0-100), regional breakdown with trends, estimated sellable units, sell-before-make recommendation

### Data Inputs Required
- Consumer behavior events (browse, click, wishlist, purchase) aggregated per region
- Historical sales data for similar product categories
- Market trend signals (social media, fashion press)

### API Endpoint
```
GET /api/brand/intelligence/demand-simulations
Authorization: Bearer <brand-token>
```

### Response Shape
```json
[
  {
    "id": "ds-001",
    "concept": "Midnight Silk Blazer",
    "description": "A structured silk blazer with hand-stitched lapels...",
    "targetAudience": "Professional women 30-45",
    "demandScore": 82,
    "category": "Ready-to-Wear",
    "estimatedUnits": 5000,
    "pricePoint": 890,
    "sellBeforeMake": true,
    "createdAt": "2026-03-01T10:00:00Z",
    "regionBreakdown": [
      {
        "region": "Europe",
        "score": 85,
        "population": 12000,
        "trend": "rising"
      },
      {
        "region": "Asia",
        "score": 62,
        "population": 8500,
        "trend": "stable"
      },
      {
        "region": "Americas",
        "score": 45,
        "population": 6000,
        "trend": "declining"
      }
    ]
  }
]
```

### Field Definitions
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique simulation ID |
| `concept` | string | Design concept name |
| `description` | string | Concept description |
| `targetAudience` | string | Who the product is for |
| `demandScore` | number (0-100) | Overall predicted market demand |
| `category` | string | Product category (e.g. Ready-to-Wear, Accessories) |
| `estimatedUnits` | number | Predicted sellable units across all regions |
| `pricePoint` | number | Target retail price (EUR) |
| `sellBeforeMake` | boolean | Whether AI recommends pre-order before production |
| `createdAt` | string (ISO date) | When simulation was run |
| `regionBreakdown[].region` | string | Region name |
| `regionBreakdown[].score` | number (0-100) | Demand score for that region |
| `regionBreakdown[].population` | number | Estimated addressable consumers in region |
| `regionBreakdown[].trend` | "rising" \| "stable" \| "declining" | Demand direction |

### Future: May also need POST endpoint for brands to submit new simulation requests.

---

## B18: Brand Intelligence Agent

### What It Does
A real-time intelligence feed that detects market signals relevant to the brand. Think of it as an AI-powered radar that monitors consumer behavior, competition, sentiment, and market timing — then surfaces actionable insights with confidence scores.

### Why It Matters
- Brands get real-time awareness of market shifts without manual research
- Each signal comes with a confidence score so brands know what to trust
- Recommendations are actionable (e.g. "Increase inventory of leather goods in Milan region")

### How AI Works
1. Monitors multiple data streams: platform user behavior (browse, click, wishlist, purchase), social media mentions, competitor product launches, regional demand fluctuations
2. Classifies signals into 5 types: demand, validation, timing, competition, sentiment
3. Assigns confidence score (0-100%) based on data strength
4. Determines trend direction (up/down/stable)
5. Generates a human-readable recommendation per signal

### Data Inputs Required
- Real-time user behavior event stream (browse, click, wishlist, add-to-cart)
- Social media/press mention feed (for sentiment signals)
- Competitor product catalog changes (for competition signals)
- Regional sales velocity data (for timing signals)

### API Endpoint
```
GET /api/brand/intelligence/signals
Authorization: Bearer <brand-token>
```

### Response Shape
```json
[
  {
    "id": "sig-001",
    "type": "demand",
    "title": "Rising demand for silk accessories in Milan",
    "region": "Europe — Milan",
    "metric": "Search Volume",
    "value": 340,
    "trend": "up",
    "recommendation": "Consider increasing silk accessory inventory in Milan boutique by 20%",
    "confidence": 87,
    "date": "2026-03-09T14:30:00Z"
  }
]
```

### Field Definitions
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique signal ID |
| `type` | "demand" \| "validation" \| "timing" \| "competition" \| "sentiment" | Signal category |
| `title` | string | Human-readable signal headline |
| `region` | string | Geographic region the signal applies to |
| `metric` | string | What was measured (e.g. "Search Volume", "Wishlist Adds") |
| `value` | number | Metric value |
| `trend` | "up" \| "down" \| "stable" | Direction of change |
| `recommendation` | string | AI-generated actionable recommendation |
| `confidence` | number (0-100) | How reliable this signal is |
| `date` | string (ISO date) | When the signal was detected |

### Signal Types Explained
- **demand**: Consumer interest rising/falling for a category/product
- **validation**: Confirms a brand decision is working (e.g. new collection performing well)
- **timing**: Optimal windows for launches, restocks, or campaigns
- **competition**: Competitor activity that affects the brand
- **sentiment**: Brand/product perception shifts on social/press

---

## B19: Brand AGI Concierge Configuration

### What It Does
An AI-powered digital concierge that represents the brand on the platform. It's NOT a generic chatbot — it's a cultural guide trained on the brand's heritage, values, and tone. This page lets the brand configure the concierge personality and monitor live conversations.

### Why It Matters
- Gives every consumer a personalized, brand-aligned experience 24/7
- Handles product questions, heritage storytelling, styling advice
- Escalates complex requests (e.g. UHNI client asking for bespoke) to human team
- Multi-language support for global brands

### How AI Works
1. LLM (GPT/Claude) fine-tuned or prompted with brand-specific knowledge base
2. Cultural anchors define what the AI emphasizes (e.g. "Heritage", "Italian Craftsmanship")
3. Tone setting controls communication style (formal/approachable/playful/authoritative)
4. Sentiment analysis runs on each conversation to detect satisfaction/frustration
5. Auto-escalation when sentiment drops or conversation hits complexity threshold

### Data Inputs Required
- Brand knowledge base content (heritage stories, product catalog, FAQs, styling guides)
- Cultural anchors and tone preferences (brand-configurable)
- Real-time conversation transcripts (for monitoring dashboard)
- WebSocket or SSE for live conversation updates

### API Endpoints
```
GET /api/brand/intelligence/concierge-config
Authorization: Bearer <brand-token>

(Future: PUT for updating config, WebSocket for live conversations)
```

### Response Shape
```json
{
  "personality": "A knowledgeable cultural guide who speaks with authority about Italian craftsmanship and heritage. Never pushy, always educational.",
  "tone": "authoritative",
  "culturalAnchors": ["Heritage", "Italian Craftsmanship", "Sustainability", "Artisan Methods"],
  "responseLanguages": ["English", "French", "Italian", "Japanese", "Mandarin", "Arabic"],
  "knowledgeBase": ["Brand Heritage Archive", "Product Catalog 2026", "Styling Guide"],
  "activeVisitors": 42,
  "conversations": [
    {
      "id": "conv-001",
      "visitorId": "visitor-abc123",
      "topic": "Heritage of silk weaving techniques",
      "status": "active",
      "sentiment": "positive",
      "startedAt": "2026-03-09T15:20:00Z"
    }
  ]
}
```

### Field Definitions
| Field | Type | Description |
|-------|------|-------------|
| `personality` | string | Free-text personality description for the AI |
| `tone` | "formal" \| "approachable" \| "playful" \| "authoritative" | Communication style |
| `culturalAnchors` | string[] | Key themes the AI should emphasize |
| `responseLanguages` | string[] | Languages the concierge can respond in |
| `knowledgeBase` | string[] | Names of knowledge sources loaded into AI |
| `activeVisitors` | number | Current live visitors being served |
| `conversations[].id` | string | Conversation ID |
| `conversations[].visitorId` | string | Anonymous visitor identifier |
| `conversations[].topic` | string | Detected conversation topic |
| `conversations[].status` | "active" \| "resolved" \| "escalated" | Current state |
| `conversations[].sentiment` | "positive" \| "neutral" \| "negative" | Detected mood |
| `conversations[].startedAt` | string (ISO date) | When conversation began |

---

## B20: Brand Memory Imprint (BMI)

### What It Does
Measures how strongly consumers remember different brand touchpoints. After each interaction (store visit, online browse, purchase, event, social media, customer service), AI predicts how memorable it was and whether the consumer will return.

### Why It Matters
- Brands learn which touchpoints create lasting impressions vs. forgettable moments
- Helps allocate budget: invest more in high-recall touchpoints, improve weak ones
- Predicts repeat business probability per touchpoint type
- Backed by psychometric research on brand memory formation

### How AI Works
1. Collects post-experience survey data + behavioral signals (did user return?)
2. For each touchpoint type, calculates three scores:
   - **Recall Score**: How well do consumers remember this touchpoint?
   - **Emotional Resonance**: How deeply did it affect them emotionally?
   - **Return Probability**: How likely are they to come back because of this touchpoint?
3. Aggregates by touchpoint type across sample sizes and time periods

### Data Inputs Required
- Post-experience survey responses (optional but ideal)
- Return visit/purchase behavior data per touchpoint
- Customer interaction logs (store visits, online sessions, events, support tickets)

### API Endpoint
```
GET /api/brand/intelligence/memory-imprints
Authorization: Bearer <brand-token>
```

### Response Shape
```json
[
  {
    "id": "mi-001",
    "touchpoint": "store_visit",
    "label": "In-Store Experience",
    "recallScore": 89,
    "emotionalResonance": 78,
    "returnProbability": 72,
    "sampleSize": 1250,
    "period": "Q1 2026"
  }
]
```

### Field Definitions
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique imprint ID |
| `touchpoint` | "store_visit" \| "online_browse" \| "purchase" \| "event" \| "social_media" \| "customer_service" | Interaction type |
| `label` | string | Human-readable name for this touchpoint |
| `recallScore` | number (0-100) | How memorable this touchpoint is |
| `emotionalResonance` | number (0-100) | Emotional depth of impression |
| `returnProbability` | number (0-100) | Likelihood consumer returns due to this touchpoint |
| `sampleSize` | number | How many consumers this is based on |
| `period` | string | Time period measured (e.g. "Q1 2026") |

---

## B21: Brand Digital Twin

### What It Does
Creates a virtual graph-based replica of the brand's entire identity. Every element — collections, heritage stories, cultural moments, key products — becomes a "node" in a connected network. The system tracks how strongly each element contributes to overall brand health.

### Why It Matters
- Visualizes brand identity as a living, connected system
- Shows which elements (heritage, product lines, cultural moments) are strongest/weakest
- Tracks 5 key brand health metrics over time
- Helps brands understand how different elements of their identity interconnect

### How AI Works
1. Maps brand elements into a graph structure (nodes = elements, edges = relationships)
2. Calculates connection strength between nodes (how related are they?)
3. Computes 5 aggregate brand health metrics from node data
4. Requires a graph database (Neo4j or similar) for relationship mapping

### Data Inputs Required
- Brand catalog data (collections, products, heritage items)
- Content relationships (which collection relates to which heritage story)
- Consumer engagement data per node (which elements get most interaction)
- Brand perception surveys (for equity/loyalty metrics)

### API Endpoint
```
GET /api/brand/intelligence/digital-twin
Authorization: Bearer <brand-token>
```

### Response Shape
```json
{
  "id": "dt-001",
  "brandName": "Maison Lumière",
  "metrics": {
    "brandEquity": 85,
    "culturalRelevance": 78,
    "heritageStrength": 92,
    "innovationIndex": 71,
    "customerLoyalty": 88
  },
  "nodes": [
    {
      "id": "node-001",
      "type": "collection",
      "label": "Spring/Summer 2026",
      "connections": ["node-005", "node-012", "node-008"],
      "strength": 85
    },
    {
      "id": "node-005",
      "type": "heritage",
      "label": "Silk Weaving Tradition",
      "connections": ["node-001", "node-003"],
      "strength": 92
    }
  ],
  "lastUpdated": "2026-03-08T10:00:00Z"
}
```

### Field Definitions
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Digital twin ID |
| `brandName` | string | Brand name |
| `metrics.brandEquity` | number (0-100) | Overall brand value perception |
| `metrics.culturalRelevance` | number (0-100) | How culturally relevant the brand is today |
| `metrics.heritageStrength` | number (0-100) | Strength of heritage/history narrative |
| `metrics.innovationIndex` | number (0-100) | Perceived innovation capability |
| `metrics.customerLoyalty` | number (0-100) | Customer loyalty/retention strength |
| `nodes[].id` | string | Node ID |
| `nodes[].type` | "collection" \| "heritage" \| "cultural" \| "product" | Element category |
| `nodes[].label` | string | Element name |
| `nodes[].connections` | string[] | IDs of connected nodes |
| `nodes[].strength` | number (0-100) | How strong this element is in the brand graph |
| `lastUpdated` | string (ISO date) | Last computation time |

---

## B22: Cultural Brand Capital Engine (CBCE)

### What It Does
Measures the brand's cultural authority across multiple dimensions — heritage authenticity, design innovation, social impact, media presence, etc. For each dimension, AI assesses the current score, detects whether it's improving/declining, identifies risks, and generates recommendations.

### Why It Matters
- Luxury brands live and die by cultural perception — this quantifies it
- Early warning system for cultural missteps or declining relevance
- Actionable recommendations per dimension to strengthen weak areas
- Tracks improvement/decline trends over time

### How AI Works
1. NLP sentiment analysis on social media mentions, press articles, influencer content
2. Compares brand mentions against competitor brands in same dimensions
3. Identifies risk factors (e.g. "Negative press about sustainability practices")
4. Generates recommendations (e.g. "Partner with local artisans to strengthen heritage narrative")
5. Tracks trend direction per dimension over assessment periods

### Data Inputs Required
- Social media mention feed (Twitter/X, Instagram, TikTok, Weibo)
- Press/media article feed (fashion press, newspapers)
- Influencer content mentioning the brand
- Competitor brand mention data (for relative scoring)

### API Endpoint
```
GET /api/brand/intelligence/cultural-authority
Authorization: Bearer <brand-token>
```

### Response Shape
```json
[
  {
    "id": "ca-001",
    "dimension": "Heritage Authenticity",
    "score": 88,
    "maxScore": 100,
    "trend": "improving",
    "lastAssessed": "2026-03-05T10:00:00Z",
    "risks": [
      "Over-commercialization of heritage narrative in recent campaigns"
    ],
    "recommendations": [
      "Feature artisan interviews in next collection launch",
      "Archive exhibition partnership with Milan Design Museum"
    ]
  }
]
```

### Field Definitions
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Dimension ID |
| `dimension` | string | What's being measured (e.g. "Heritage Authenticity", "Design Innovation") |
| `score` | number | Current score |
| `maxScore` | number | Maximum possible score (always 100) |
| `trend` | "improving" \| "stable" \| "declining" | Direction of change |
| `lastAssessed` | string (ISO date) | When this was last analyzed |
| `risks` | string[] | Identified risk factors |
| `recommendations` | string[] | AI-generated action items |

---

## B23: Boutique Performance Index (BPI)

### What It Does
Ranks and scores every physical boutique in the brand's global network across 4 dimensions: experience quality, sales conversion, service quality, and ambiance. Think of it as a performance report card for each store.

### Why It Matters
- Identifies top-performing and underperforming boutiques at a glance
- 4-dimensional scoring reveals specific strengths/weaknesses per store
- Revenue + footfall data ties experience quality to business outcomes
- Audit tracking ensures regular quality assessment

### How AI Works
1. Aggregates POS data (conversion rates, revenue, basket size)
2. Processes footfall counter data (visitor volume, dwell time)
3. Incorporates audit scores (from physical store audits)
4. Weights 4 dimensions into a composite score for ranking
5. Ranks all boutiques relative to each other

### Data Inputs Required
- POS (Point of Sale) integration per boutique — sales, conversion, revenue
- Footfall counter API — visitor counts, dwell time
- Store audit system — experience, service, ambiance scores from auditors
- Geographic data — city, region per boutique

### API Endpoint
```
GET /api/brand/intelligence/boutique-performances
Authorization: Bearer <brand-token>
```

### Response Shape
```json
[
  {
    "boutiqueId": "bout-001",
    "name": "Maison Lumière — Via Montenapoleone",
    "city": "Milan",
    "region": "Europe",
    "rank": 1,
    "totalBoutiques": 24,
    "scores": {
      "experience": 94,
      "conversion": 78,
      "service": 91,
      "ambiance": 96
    },
    "revenue": 2450000,
    "footfall": 18500,
    "lastAudit": "2026-02-15T00:00:00Z"
  }
]
```

### Field Definitions
| Field | Type | Description |
|-------|------|-------------|
| `boutiqueId` | string | Unique boutique ID |
| `name` | string | Boutique name |
| `city` | string | City location |
| `region` | string | Geographic region |
| `rank` | number | Position in brand's global ranking (1 = best) |
| `totalBoutiques` | number | Total boutiques being ranked |
| `scores.experience` | number (0-100) | Customer experience quality |
| `scores.conversion` | number (0-100) | Browse-to-purchase conversion |
| `scores.service` | number (0-100) | Staff service quality |
| `scores.ambiance` | number (0-100) | Physical environment quality |
| `revenue` | number | Total revenue (EUR) in period |
| `footfall` | number | Total visitor count in period |
| `lastAudit` | string (ISO date) | When the boutique was last audited |

---

## B24: Counterfeit & Digital Doppelganger Intelligence (CDDI)

### What It Does
Monitors online marketplaces and digital channels for counterfeit products. Uses image recognition to find fake products that visually resemble the brand's authentic items, assigns a risk level, and allows the brand to investigate or dismiss alerts.

### Why It Matters
- Protects brand integrity and revenue from counterfeits
- Image-based detection catches fakes that text-based search misses
- Risk scoring prioritizes which fakes to act on first
- Status workflow (new → investigating → confirmed → resolved) tracks enforcement

### How AI Works
1. Web scraping crawls marketplaces (Amazon, eBay, Alibaba, social commerce, etc.)
2. Computer vision compares product images against authentic product catalog
3. Calculates visual similarity percentage (0-100%)
4. Assigns risk level based on: similarity %, platform reach, seller volume, price deviation
5. Generates alerts with source URLs for brand's legal team

### Data Inputs Required
- Authentic product image catalog (reference database)
- Web scraping infrastructure for major marketplaces
- Image recognition/comparison ML model
- Marketplace API access where available

### API Endpoints
```
GET /api/brand/intelligence/counterfeit-alerts
Authorization: Bearer <brand-token>

(Future: PATCH /api/brand/intelligence/counterfeit-alerts/:id — update status to investigating/dismissed)
```

### Response Shape
```json
[
  {
    "id": "cf-001",
    "productId": "prod-123",
    "productName": "Heritage Silk Scarf — Midnight",
    "riskLevel": "critical",
    "status": "new",
    "similarity": 94,
    "source": "AliExpress",
    "sourceUrl": "https://example.com/fake-listing",
    "region": "Asia — China",
    "detectedAt": "2026-03-08T09:15:00Z"
  }
]
```

### Field Definitions
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Alert ID |
| `productId` | string | ID of the authentic product being copied |
| `productName` | string | Name of the authentic product |
| `riskLevel` | "critical" \| "high" \| "medium" \| "low" | Threat severity |
| `status` | "new" \| "investigating" \| "confirmed" \| "resolved" \| "dismissed" | Workflow state |
| `similarity` | number (0-100) | Visual similarity to authentic product |
| `source` | string | Platform name where fake was found |
| `sourceUrl` | string (optional) | Direct URL to the fake listing |
| `region` | string | Geographic region of the seller |
| `detectedAt` | string (ISO date) | When the fake was detected |

---

## B25: Global Drop Strategy Simulator (GDSS)

### What It Does
Simulates the optimal strategy for a product "drop" (limited release) across multiple regions. For each region, it predicts demand, suggests the optimal launch date, estimates sell-through rate, and warns about competitor activity.

### Why It Matters
- Product drops are high-stakes events — wrong timing = lost revenue
- Regional optimization: launch in high-demand regions first
- Competitor awareness: avoid launching when competitors have major drops
- Risk identification before committing to launch

### How AI Works
1. Analyzes historical drop performance data (past launches, sell-through rates)
2. Monitors competitor launch calendars and activity levels
3. Forecasts regional demand based on current signals + seasonal patterns
4. Calculates optimal launch date per region
5. Identifies risk factors (e.g. "Major competitor launch scheduled same week")
6. Generates strategic recommendation

### Data Inputs Required
- Historical drop/launch data (past performance, sell-through, regional results)
- Competitor product launch calendar
- Regional market signals (from B18 intelligence feed)
- Seasonal and cultural event calendars per region

### API Endpoint
```
GET /api/brand/intelligence/drop-simulations
Authorization: Bearer <brand-token>

(Future: POST for submitting new simulation requests)
```

### Response Shape
```json
[
  {
    "id": "drop-001",
    "dropName": "Midnight Collection — Limited Release",
    "collection": "Midnight Collection",
    "launchDate": "2026-04-15T00:00:00Z",
    "status": "simulated",
    "overallDemandForecast": 78,
    "regions": [
      {
        "region": "Europe",
        "demandScore": 85,
        "optimalDate": "2026-04-15T00:00:00Z",
        "estimatedSellThrough": 72,
        "competitorActivity": "low"
      },
      {
        "region": "Asia",
        "demandScore": 68,
        "optimalDate": "2026-04-22T00:00:00Z",
        "estimatedSellThrough": 58,
        "competitorActivity": "high"
      }
    ],
    "riskFactors": [
      "Competitor Maison X launching similar collection April 18",
      "Ramadan period may affect Middle East demand"
    ],
    "recommendation": "Stagger launch: Europe first (Apr 15), delay Asia by one week to avoid competitor overlap.",
    "createdAt": "2026-03-05T10:00:00Z"
  }
]
```

### Field Definitions
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Simulation ID |
| `dropName` | string | Drop campaign name |
| `collection` | string | Collection this drop belongs to |
| `launchDate` | string (ISO date) | Planned launch date |
| `status` | "draft" \| "simulated" \| "approved" \| "launched" | Current state |
| `overallDemandForecast` | number (0-100) | Average demand across all regions |
| `regions[].region` | string | Region name |
| `regions[].demandScore` | number (0-100) | Predicted demand in that region |
| `regions[].optimalDate` | string (ISO date) | AI-recommended launch date for this region |
| `regions[].estimatedSellThrough` | number (0-100%) | Predicted % of stock that will sell |
| `regions[].competitorActivity` | "low" \| "medium" \| "high" | How active competitors are in that region/timeframe |
| `riskFactors` | string[] | Identified risks |
| `recommendation` | string | AI-generated strategic recommendation |
| `createdAt` | string (ISO date) | When simulation was run |

---

## B26: Heritage Preservation AI (HPAI)

### What It Does
Catalogs and tracks the brand's heritage assets (historic garments, original sketches, iconic pieces, archive materials). Monitors preservation condition and manages the digitization pipeline (3D scanning → processing → complete digital archive).

### Why It Matters
- Heritage assets are irreplaceable — preserving them is critical for luxury brands
- Digital twins of heritage pieces enable virtual exhibitions, AR experiences, storytelling
- Preservation scoring alerts when assets need conservation attention
- Tracks digitization progress across the archive

### How AI Works
1. Computer vision assesses physical condition from inspection photos
2. 3D scanning pipeline creates digital replicas of physical assets
3. AI classifies significance (iconic/important/notable/standard) based on brand history
4. Preservation score calculated from condition assessment + time since last inspection
5. Status tracking through digitization workflow

### Data Inputs Required
- Heritage asset catalog (manually curated or imported from brand archive)
- Inspection photos and condition reports
- 3D scanning hardware integration (for digitization pipeline)
- Brand history knowledge base (for significance classification)

### API Endpoint
```
GET /api/brand/intelligence/heritage-assets
Authorization: Bearer <brand-token>
```

### Response Shape
```json
[
  {
    "assetId": "ha-001",
    "name": "Original 1947 Silk Evening Gown",
    "era": "Post-War Collection",
    "year": 1947,
    "significance": "iconic",
    "description": "The founding piece that established the maison's reputation for silk craftsmanship.",
    "digitalStatus": "complete",
    "preservationScore": 82,
    "lastInspection": "2026-01-15T00:00:00Z",
    "image": "https://cdn.example.com/heritage/gown-1947.jpg"
  }
]
```

### Field Definitions
| Field | Type | Description |
|-------|------|-------------|
| `assetId` | string | Unique asset ID |
| `name` | string | Asset name |
| `era` | string | Historical era/collection it belongs to |
| `year` | number (optional) | Year of creation |
| `significance` | "iconic" \| "important" \| "notable" \| "standard" | Historical importance |
| `description` | string | Description of the asset and its significance |
| `digitalStatus` | "not_started" \| "scanning" \| "processing" \| "complete" | Digitization pipeline stage |
| `preservationScore` | number (0-100) | Physical condition score |
| `lastInspection` | string (ISO date, optional) | When last physically inspected |
| `image` | string (URL, optional) | Photo of the asset |

---

## B27: Ultra-Premium Client Genome Intelligence (UPCG)

### What It Does
Segments the brand's ultra-premium clients into behavioral archetypes. Each archetype represents a distinct client profile with spending patterns, behavior traits, preferences, and predicted lifetime value. Think of it as "DNA profiling" for luxury consumers.

### Why It Matters
- Luxury brands need to understand their top clients deeply (not just demographics)
- Behavioral archetypes reveal WHY clients buy, not just WHAT
- Lifetime value prediction helps prioritize client relationships
- Spend pattern analysis guides product development and inventory decisions
- Retention rate per archetype identifies at-risk segments

### How AI Works
1. Clustering algorithm groups clients based on purchase behavior, browsing patterns, event attendance, communication preferences
2. For each cluster (archetype), calculates: average lifetime value, retention rate, spend breakdown by category
3. Identifies dominant behavior traits with strength scores
4. Generates preference tags from browsing/wishlist/purchase data
5. Continuous re-evaluation as new behavioral data comes in

### Data Inputs Required
- CRM/customer database with purchase history
- Browsing behavior per client (session data, wishlists, product views)
- Event attendance records (shows, exhibitions, private events)
- Customer service interaction logs
- Loyalty program data (if applicable)

### API Endpoint
```
GET /api/brand/intelligence/client-archetypes
Authorization: Bearer <brand-token>
```

### Response Shape
```json
[
  {
    "archetypeId": "arch-001",
    "label": "The Heritage Connoisseur",
    "description": "Deeply values craftsmanship history. Prefers limited editions and archive-inspired pieces. Attends brand events regularly.",
    "clientCount": 340,
    "averageLifetimeValue": 185000,
    "retentionRate": 92,
    "spendPattern": [
      { "category": "Ready-to-Wear", "percentage": 35, "averageOrderValue": 2800 },
      { "category": "Leather Goods", "percentage": 30, "averageOrderValue": 3500 },
      { "category": "Accessories", "percentage": 20, "averageOrderValue": 1200 },
      { "category": "Fragrances", "percentage": 15, "averageOrderValue": 450 }
    ],
    "behaviorTraits": [
      {
        "trait": "Archive Affinity",
        "strength": 95,
        "description": "Consistently gravitates toward heritage-inspired and archive collection pieces"
      },
      {
        "trait": "Event Loyalty",
        "strength": 88,
        "description": "Attends 80%+ of invited brand events"
      }
    ],
    "preferences": ["Private Viewings", "Archive Access", "Artisan Meet-and-Greets", "Heritage Stories"]
  }
]
```

### Field Definitions
| Field | Type | Description |
|-------|------|-------------|
| `archetypeId` | string | Unique archetype ID |
| `label` | string | Archetype name (e.g. "The Heritage Connoisseur") |
| `description` | string | Profile description |
| `clientCount` | number | How many clients fall into this archetype |
| `averageLifetimeValue` | number | Average total spend over customer lifetime (EUR) |
| `retentionRate` | number (0-100%) | Percentage of clients who remain active |
| `spendPattern[].category` | string | Product category |
| `spendPattern[].percentage` | number (0-100%) | Share of total spend in this category |
| `spendPattern[].averageOrderValue` | number | Average order size in this category (EUR) |
| `behaviorTraits[].trait` | string | Behavior trait name |
| `behaviorTraits[].strength` | number (0-100) | How strongly this trait manifests |
| `behaviorTraits[].description` | string | Description of the behavior |
| `preferences` | string[] | Tags for client preferences |

---

## AI/ML Complexity & Priority Recommendation

### Phase 1 — Start Here (Lower AI complexity, high business value)
| Feature | Why First | AI Complexity |
|---------|-----------|---------------|
| B18 Intelligence Agent | Core intelligence feed, builds on existing event data | Medium |
| B23 Boutique Performance | Mostly data aggregation + weighted scoring | Low-Medium |
| B20 Memory Imprint | Survey-based scoring, relatively straightforward models | Medium |

### Phase 2 — Build Next (Medium AI complexity)
| Feature | Depends On | AI Complexity |
|---------|------------|---------------|
| B17 Design-to-Demand | Needs B18 signals + historical sales data | Medium |
| B25 Drop Simulator | Needs B18 signals + competitor tracking | Medium |
| B22 Cultural Authority | Needs NLP pipeline on social/press feeds | Medium |
| B27 Client Genome | Needs CRM integration + clustering model | Medium |

### Phase 3 — Advanced (Higher AI complexity, specialized infrastructure)
| Feature | Special Requirements | AI Complexity |
|---------|---------------------|---------------|
| B19 Concierge | LLM integration + WebSocket for real-time chat | High |
| B21 Digital Twin | Graph database (Neo4j or similar) | Medium-High |
| B24 Counterfeit | Image recognition model + marketplace scraping | High |
| B26 Heritage | 3D scanning hardware + computer vision | High |

---

## Notes for Backend Team

1. **Auth**: All endpoints use `Authorization: Bearer <brand-token>`. The brand is identified from the token (same pattern as existing product APIs).

2. **Endpoint prefix**: Frontend currently calls `/api/brand/intelligence/*`. This can be adjusted in `src/services/brand-intelligence.service.ts` if backend uses a different prefix.

3. **Response wrapper**: The frontend service uses `apiRequest<T>()` which expects the data directly (not wrapped in `{ data: ... }`). If backend wraps responses, we'll adjust the service layer.

4. **Mock fallback**: All pages currently have mock data fallback. Once real APIs are available, we flip a flag in the service layer to disable mocks.

5. **No POST endpoints yet**: Currently all are GET (read-only dashboards). Future iterations may need POST for creating simulations (B17, B25) and PUT/PATCH for updating config (B19) or alert status (B24).
