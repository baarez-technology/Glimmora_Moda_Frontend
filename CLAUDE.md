# Moda Glimmora — Developer Notes

## API Proxy Setup (Critical for Deployment)

All API service files **must use relative paths** (e.g. `/api/v1/...`) — never build absolute URLs using `NEXT_PUBLIC_API_URL` in client-side service files.

### Why

Vercel serves the frontend over **HTTPS**. The backend at `http://backend` is plain HTTP. Browsers block mixed-content requests (HTTPS page → HTTP resource), so any service file that constructs `http://backend/api/v1/...` and calls it from the browser will be **blocked in production**.

### How the proxy works

`next.config.js` rewrites all `/api/v1/*` requests to the backend **server-side**:

```js
async rewrites() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  return [
    { source: '/api/v1/:path*', destination: `${apiBase}/api/v1/:path*` }
  ];
}
```

The browser calls `/api/v1/...` (relative, HTTPS), Next.js proxies it to the backend over HTTP from the server — no mixed-content issue.

### Correct pattern (follow this in all service files)

```ts
// CORRECT — relative path, proxied by Next.js
const res = await fetch('/api/v1/brand/orders', { headers: authHeaders() });

// WRONG — direct HTTP URL, blocked by browser on HTTPS deployments
const API_BASE = process.env.NEXT_PUBLIC_API_URL; // do NOT use this for fetch calls
const res = await fetch(`${API_BASE}/api/v1/brand/orders`, { ... });
```

### Files following this pattern

- `src/services/brand-order.service.ts` — uses relative paths
- `src/services/private-collection.service.ts` — uses relative paths
- `src/services/sourcing.service.ts` — uses relative paths (reference implementation)
