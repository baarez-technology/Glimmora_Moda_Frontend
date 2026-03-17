# ModaGlimmora Admin API Specification

**Purpose:** Backend API endpoints needed to make the Admin Portal functional.
**Auth:** All endpoints require admin JWT token via `Authorization: Bearer <token>`
**Base URL:** `/api/v1/admin/`

---

## 1. Admin Authentication

### POST /api/v1/admin/auth/login
Login as platform administrator.

**Request:**
```json
{
  "email": "admin@glimmora.com",
  "password": "string"
}
```

**Response (200):**
```json
{
  "access_token": "jwt-token",
  "refresh_token": "jwt-token",
  "admin": {
    "admin_id": "string",
    "email": "string",
    "name": "string",
    "role": "super_admin | admin | moderator | analyst",
    "avatar": "string (url, optional)",
    "last_active": "ISO datetime"
  }
}
```

---

## 2. Dashboard (SOW 1.1)

### GET /api/v1/admin/dashboard
Returns platform-wide metrics and recent activity.

**Response (200):**
```json
{
  "metrics": {
    "total_users": 48234,
    "active_users": 12847,
    "total_brands": 156,
    "active_brands": 142,
    "total_orders": 8934,
    "total_revenue": 284700000,
    "monthly_revenue": 12400000,
    "pending_moderation": 23,
    "active_sessions": 3421,
    "system_uptime": 99.97
  },
  "recent_activity": [
    {
      "id": "string",
      "type": "user_registered | brand_onboarded | order_placed | content_flagged | system_alert",
      "description": "string",
      "timestamp": "ISO datetime",
      "metadata": {}
    }
  ]
}
```

---

## 3. User Management (SOW 1.2)

### GET /api/v1/admin/users
List all platform users with filtering and pagination.

**Query params:** `?page=1&page_size=20&role=consumer|uhni|brand&status=active|suspended|banned&search=string`

**Response (200):**
```json
{
  "users": [
    {
      "user_id": "string",
      "name": "string",
      "email": "string",
      "role": "consumer | uhni | brand",
      "status": "active | suspended | banned | pending",
      "joined_at": "ISO datetime",
      "last_active": "ISO datetime",
      "total_orders": 0,
      "total_spent": 0
    }
  ],
  "total": 0,
  "page": 1,
  "page_size": 20
}
```

### GET /api/v1/admin/users/{user_id}
Get detailed user profile.

### PATCH /api/v1/admin/users/{user_id}/status
Update user account status.

**Request:**
```json
{
  "status": "active | suspended | banned",
  "reason": "string (optional)"
}
```

---

## 4. Brand Management (SOW 1.3)

### GET /api/v1/admin/brands
List all brand partners with filtering.

**Query params:** `?page=1&page_size=20&status=active|pending|suspended&tier=standard|premium|enterprise&search=string`

**Response (200):**
```json
{
  "brands": [
    {
      "brand_id": "string",
      "name": "string",
      "email": "string",
      "status": "active | pending | suspended | rejected",
      "tier": "standard | premium | enterprise",
      "joined_at": "ISO datetime",
      "total_products": 0,
      "total_revenue": 0,
      "commission_rate": 15.0
    }
  ],
  "total": 0,
  "page": 1,
  "page_size": 20
}
```

### PATCH /api/v1/admin/brands/{brand_id}/status
Update brand status.

**Request:**
```json
{
  "status": "active | pending | suspended | rejected",
  "reason": "string (optional)"
}
```

### PATCH /api/v1/admin/brands/{brand_id}/tier
Update brand tier.

**Request:**
```json
{
  "tier": "standard | premium | enterprise"
}
```

---

## 5. Content Moderation (SOW 1.4)

### GET /api/v1/admin/moderation
Get moderation queue.

**Query params:** `?status=pending|approved|rejected&content_type=product|story|review|brand_profile&page=1&page_size=20`

**Response (200):**
```json
{
  "items": [
    {
      "moderation_id": "string",
      "content_type": "product | story | review | brand_profile",
      "content_id": "string",
      "title": "string",
      "description": "string",
      "submitted_by": "string (brand name or user name)",
      "submitted_at": "ISO datetime",
      "status": "pending | approved | rejected",
      "priority": "low | medium | high | critical",
      "flags": ["inappropriate", "misleading", "copyright"],
      "reviewer_notes": "string (optional)"
    }
  ],
  "total": 0,
  "page": 1,
  "page_size": 20
}
```

### PATCH /api/v1/admin/moderation/{moderation_id}
Approve or reject content.

**Request:**
```json
{
  "status": "approved | rejected",
  "notes": "string (optional)"
}
```

---

## 6. Platform Configuration (SOW 1.5)

### GET /api/v1/admin/feature-flags
Get all feature flags.

**Response (200):**
```json
{
  "flags": [
    {
      "flag_id": "string",
      "name": "string",
      "description": "string",
      "enabled": true,
      "environments": ["production", "staging", "development"],
      "updated_at": "ISO datetime",
      "updated_by": "string"
    }
  ]
}
```

### PATCH /api/v1/admin/feature-flags/{flag_id}
Toggle a feature flag.

**Request:**
```json
{
  "enabled": true
}
```

### GET /api/v1/admin/config
Get platform configuration settings.

**Response (200):**
```json
{
  "settings": [
    {
      "config_id": "string",
      "key": "string",
      "value": "string | number | boolean | string[]",
      "type": "string | number | boolean | array",
      "label": "string",
      "description": "string",
      "category": "general | security | commerce | notifications"
    }
  ]
}
```

### PATCH /api/v1/admin/config/{config_id}
Update a configuration setting.

**Request:**
```json
{
  "value": "string | number | boolean | string[]"
}
```

---

## 7. Analytics & Reporting (SOW 1.6)

### GET /api/v1/admin/analytics/revenue
Revenue analytics.

**Query params:** `?period=7d|30d|90d|1y`

**Response (200):**
```json
{
  "total_revenue": 284700000,
  "period_revenue": 12400000,
  "growth_percentage": 12.5,
  "currency": "EUR",
  "daily_breakdown": [
    {
      "date": "2026-03-01",
      "revenue": 450000,
      "orders": 156
    }
  ]
}
```

### GET /api/v1/admin/analytics/users
User growth analytics.

**Query params:** `?period=7d|30d|90d|1y`

**Response (200):**
```json
{
  "total_users": 48234,
  "new_users_period": 2341,
  "growth_percentage": 8.3,
  "by_role": {
    "consumer": 42000,
    "uhni": 1234,
    "brand": 156
  },
  "daily_breakdown": [
    {
      "date": "2026-03-01",
      "new_users": 87,
      "active_users": 12400
    }
  ]
}
```

### GET /api/v1/admin/analytics/brands
Top performing brands.

**Query params:** `?period=7d|30d|90d|1y&limit=20`

**Response (200):**
```json
{
  "brands": [
    {
      "brand_id": "string",
      "name": "string",
      "revenue": 45000000,
      "orders": 1234,
      "products": 89,
      "growth_percentage": 15.2
    }
  ]
}
```

---

## 8. Financial Management (SOW 1.7)

### GET /api/v1/admin/finance/revenue
Revenue breakdown by category.

**Response (200):**
```json
{
  "total_revenue": 284700000,
  "platform_commission": 42705000,
  "brand_payouts": 241995000,
  "by_category": [
    {
      "category": "Bags",
      "revenue": 98000000,
      "percentage": 34.4
    }
  ]
}
```

### GET /api/v1/admin/finance/commissions
Get commission rules.

**Response (200):**
```json
{
  "rules": [
    {
      "rule_id": "string",
      "tier": "standard | premium | enterprise",
      "category": "string (optional, for category-specific rates)",
      "rate": 15.0,
      "min_rate": 5.0,
      "max_rate": 25.0,
      "effective_from": "ISO datetime"
    }
  ]
}
```

### PATCH /api/v1/admin/finance/commissions/{rule_id}
Update commission rate.

**Request:**
```json
{
  "rate": 15.0
}
```

### GET /api/v1/admin/finance/payouts
Get payout history.

**Query params:** `?status=pending|processing|completed|failed&page=1&page_size=20`

**Response (200):**
```json
{
  "payouts": [
    {
      "payout_id": "string",
      "brand_id": "string",
      "brand_name": "string",
      "amount": 45000,
      "currency": "EUR",
      "status": "pending | processing | completed | failed",
      "period_start": "ISO datetime",
      "period_end": "ISO datetime",
      "processed_at": "ISO datetime (optional)"
    }
  ],
  "total": 0,
  "page": 1,
  "page_size": 20
}
```

### POST /api/v1/admin/finance/payouts/{payout_id}/process
Process a pending payout.

---

## 9. Security & Compliance (SOW 1.8)

### GET /api/v1/admin/security/alerts
Get security alerts.

**Query params:** `?severity=critical|high|medium|low&status=active|resolved|dismissed&page=1&page_size=20`

**Response (200):**
```json
{
  "alerts": [
    {
      "alert_id": "string",
      "type": "login_anomaly | brute_force | data_breach | suspicious_activity | rate_limit",
      "severity": "critical | high | medium | low",
      "title": "string",
      "description": "string",
      "status": "active | resolved | dismissed",
      "detected_at": "ISO datetime",
      "source_ip": "string (optional)",
      "affected_user": "string (optional)"
    }
  ],
  "total": 0
}
```

### PATCH /api/v1/admin/security/alerts/{alert_id}
Resolve or dismiss an alert.

**Request:**
```json
{
  "status": "resolved | dismissed",
  "notes": "string (optional)"
}
```

### GET /api/v1/admin/security/audit-log
Get audit log entries.

**Query params:** `?action_type=login|status_change|config_update|data_export&page=1&page_size=50`

**Response (200):**
```json
{
  "entries": [
    {
      "log_id": "string",
      "action": "string",
      "action_type": "login | status_change | config_update | data_export | moderation | permission_change",
      "performed_by": "string (admin name)",
      "target": "string (optional, affected entity)",
      "details": "string",
      "ip_address": "string",
      "timestamp": "ISO datetime"
    }
  ],
  "total": 0
}
```

### GET /api/v1/admin/security/gdpr
Get GDPR data requests.

**Query params:** `?status=pending|processing|completed&type=export|deletion`

**Response (200):**
```json
{
  "requests": [
    {
      "request_id": "string",
      "user_id": "string",
      "user_email": "string",
      "type": "export | deletion",
      "status": "pending | processing | completed",
      "requested_at": "ISO datetime",
      "completed_at": "ISO datetime (optional)"
    }
  ],
  "total": 0
}
```

### POST /api/v1/admin/security/gdpr/{request_id}/process
Process a GDPR request.

---

## 10. System Health (SOW 1.9)

### GET /api/v1/admin/system/health
Get service health status.

**Response (200):**
```json
{
  "services": [
    {
      "service_id": "string",
      "name": "API Server | Database | Search Engine | Cache | Storage",
      "status": "healthy | degraded | down",
      "uptime_percentage": 99.97,
      "response_time_ms": 45,
      "last_checked": "ISO datetime"
    }
  ]
}
```

### GET /api/v1/admin/system/metrics
Get system performance metrics.

**Response (200):**
```json
{
  "cpu_usage": 34.2,
  "memory_usage": 67.8,
  "disk_usage": 45.1,
  "active_connections": 3421,
  "requests_per_minute": 8934,
  "average_response_time_ms": 120,
  "error_rate": 0.02
}
```

### GET /api/v1/admin/system/errors
Get recent error log.

**Query params:** `?severity=error|warning|info&page=1&page_size=50`

**Response (200):**
```json
{
  "errors": [
    {
      "error_id": "string",
      "severity": "error | warning | info",
      "message": "string",
      "service": "string",
      "stack_trace": "string (optional)",
      "occurred_at": "ISO datetime",
      "count": 1
    }
  ],
  "total": 0
}
```

---

## Notes for Backend Developer

1. **Auth:** All endpoints need admin JWT validation. Admin tokens are separate from brand/consumer tokens.
2. **Roles:** `super_admin` has full access. `moderator` should only access moderation. `analyst` should only access analytics. Implement role-based middleware.
3. **Pagination:** All list endpoints should support `page` and `page_size` params. Return `total` count for frontend pagination.
4. **Audit:** Every write operation (PATCH/POST/DELETE) should create an audit log entry automatically.
5. **Response format:** Return consistent JSON. Arrays should be wrapped in a named key (e.g., `users`, `brands`, `items`), not returned as bare arrays.
6. **The frontend is ready** — once these APIs exist, we just replace `mockHandler` calls with real fetch requests. No frontend changes needed.
