# Shop Locations & Reviews API Specification

## 1. Brand Shop Locations

### POST /api/v1/brand/locations
Create a new shop location.

**Request:**
```json
{
  "shop_name": "Dior Flagship Paris",
  "address_line1": "30 Avenue Montaigne",
  "address_line2": null,
  "city": "Paris",
  "state": "Île-de-France",
  "country": "France",
  "postal_code": "75008",
  "phone": "+33 1 40 73 73 73",
  "email": "paris@dior.com",
  "latitude": 48.8661,
  "longitude": 2.3046,
  "opening_hours": "Mon-Sat 10:00-19:00, Sun Closed",
  "shop_type": "flagship | boutique | outlet | popup | department_store",
  "image_url": "https://...",
  "is_active": true
}
```

### GET /api/v1/brand/locations
Get all shop locations for the authenticated brand.

### GET /api/v1/brand/locations/{location_id}
Get a specific shop location.

### PATCH /api/v1/brand/locations/{location_id}
Update a shop location (partial update).

### DELETE /api/v1/brand/locations/{location_id}
Delete a shop location.

### GET /api/v1/customer/brand-shops
**Public/Consumer endpoint** — Get all active brand shops across all brands.
Query params: `?city=Salem&lat=11.65&lng=78.16&radius_km=50`

**Response:**
```json
[
  {
    "location_id": "string",
    "brand_id": "string",
    "brand_name": "string",
    "brand_logo": "string",
    "shop_name": "string",
    "address_line1": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "postal_code": "string",
    "phone": "string",
    "latitude": 0.0,
    "longitude": 0.0,
    "opening_hours": "string",
    "shop_type": "string",
    "image_url": "string",
    "distance_km": 12.5
  }
]
```

---

## 2. Customer Reviews

### POST /api/v1/customer/reviews
Submit a product review (after order delivery).

**Request:**
```json
{
  "order_id": "string",
  "product_id": "string",
  "rating": 5,
  "title": "Exceptional quality",
  "content": "The craftsmanship is outstanding..."
}
```

### GET /api/v1/customer/reviews
Get all reviews submitted by the authenticated customer.

### GET /api/v1/brand/reviews
Get all reviews for the authenticated brand.

**Response:**
```json
{
  "reviews": [
    {
      "review_id": "string",
      "order_id": "string",
      "product_id": "string",
      "product_name": "string",
      "product_image": "string",
      "customer_name": "string",
      "rating": 5,
      "title": "string",
      "content": "string",
      "created_at": "ISO datetime"
    }
  ],
  "total_reviews": 10,
  "average_rating": 4.5,
  "rating_distribution": {
    "5": 6,
    "4": 2,
    "3": 1,
    "2": 1,
    "1": 0
  }
}
```

### GET /api/v1/customer/reviews/pending
Get delivered orders that haven't been reviewed yet.

**Response:**
```json
[
  {
    "order_id": "string",
    "product_id": "string",
    "product_name": "string",
    "product_image": "string",
    "brand_name": "string",
    "delivered_at": "ISO datetime"
  }
]
```

---

## Notes

1. **Shop locations** are brand-scoped (each brand manages their own shops)
2. **Consumer shop search** should support geolocation filtering (lat/lng + radius)
3. **Reviews** are only allowed after order delivery status = "delivered"
4. **Rating** is 1-5 integer
5. **One review per order-product combination** (prevent duplicates)
