# Configuration Guide

This guide covers all configuration options for the WADA BMAD application.

---

## Environment Configuration

### Environment Files

| File                    | Purpose              | Deployment        |
| ----------------------- | -------------------- | ----------------- |
| `.env`                  | Base defaults        | Not committed     |
| `.env.local`            | Local overrides      | Not committed     |
| `.env.development`      | Dev-specific         | Not committed     |
| `.env.production`       | Production defaults  | Not committed     |
| `.env.production.local` | Local prod overrides | Not committed     |

### Environment Variable Priority

```
.env.local > .env.production > .env.development > .env
```

---

## Supabase Configuration

### Local Development

The web app is built with Create React App, which only inlines variables that
start with `REACT_APP_` into the browser bundle. Prefix the names accordingly.

```bash
# .env.local
REACT_APP_SUPABASE_URL=http://localhost:54321
REACT_APP_SUPABASE_ANON_KEY=your-local-anon-key
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your-local-service-key
```

### Production

```bash
# .env.production.local
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Supabase Studio

Access local Supabase Studio at: http://localhost:54323

---

## Feature Flags

### Available Feature Flags

Configuration in `libs/api-client/src/config.ts`:

```typescript
export const featureFlags = {
  // Enable mock certification verification (default: true in dev)
  USE_MOCK_CERTIFICATIONS: process.env.NODE_ENV === 'development',

  // Enable real-time subscriptions
  ENABLE_REALTIME: true,

  // Enable offline mode (PWA)
  ENABLE_OFFLINE: true,

  // Show debug logs
  DEBUG_MODE: process.env.NODE_ENV === 'development',
};
```

---

## API Configuration

### Certification Service

```typescript
// libs/api-client/src/certification-service.ts

const CERTIFICATION_CONFIG = {
  // Cache duration in milliseconds (default: 24 hours)
  CACHE_DURATION_MS: 24 * 60 * 60 * 1000,

  // Maximum barcodes to cache
  MAX_CACHE_SIZE: 1000,

  // Enable external API verification
  VERIFY_WITH_EXTERNAL_APIS: true,

  // External API timeouts (ms)
  API_TIMEOUT: 5000,
};
```

### Mock Barcodes (Test Data)

The `supabase/seed.sql` file inserts sample supplements with barcodes that can
be used for testing:

| Barcode        | Product                                  | Certifications      |
| -------------- | ---------------------------------------- | ------------------- |
| `123456789012` | Whey Protein Isolate (Optimum Nutrition) | NSF, Informed Sport |
| `123456789013` | Creatine Monohydrate (MuscleTech)        | NSF, Informed Sport |
| `123456789014` | BCAA Complex (Scivation)                 | Informed Sport      |
| `123456789015` | Multivitamin (Centrum)                   | NSF                 |
| `123456789016` | Fish Oil (Nordic Naturals)               | NSF                 |

Verification is **database-driven**: `CertificationService` calls the
`verify_supplement_by_barcode` RPC, which joins `supplements` →
`supplement_certifications` → `certifications` and returns the real
certification rows from the database. A supplement is reported as verified
only when the database contains at least one linked certification.

---

## Database Configuration

### Row Level Security (RLS)

RLS is enabled on all tables. Default policies:

| Table                    | Public Read | Authenticated Write   | Notes                              |
| ------------------------ | ----------- | --------------------- | ---------------------------------- |
| `athlete_profiles`       | No          | Owner only            | Users can only access own profile  |
| `supplements`            | Yes         | Authenticated         | Anyone can view, auth users can edit |
| `certifications`         | Yes         | Authenticated         | Anyone can view, auth users can edit |
| `logbook_entries`        | No          | Owner only            | Coaches/admins can view athletes   |
| `user_preferences`       | No          | Owner only            | Users can only access own preferences |
| `educational_content`    | Published   | Author/admin          | Drafts visible to author only      |
| `content_categories`     | Active      | Admin only            | Public sees active categories      |
| `affiliate_links`        | Active      | Creator/admin         | Creators manage their own links    |
| `content_affiliate_links`| Active      | No client writes      | Placements are read-only from client |
| `user_content_engagement`| Own rows    | Own rows              | Users manage their own engagement  |
| `content_analytics`      | Author/admin | No client writes     | Analytics populated server-side    |
| `affiliate_clicks`       | Creator/admin | Via RPC only         | Inserted by `track_affiliate_click` |
| `affiliate_conversions`  | Creator/admin | Creator/admin        | Creators record own-link conversions |

### Realtime Subscriptions

Enable for specific tables:

```typescript
// In Supabase Dashboard > Database > Replication
// Enable replication for:
// - logbook_entries
// - athlete_profiles
```

---

## PWA Configuration

### Service Worker

Location: `apps/web-pwa/public/sw.js`

Generated by Workbox during build. Configuration in `vite.config.ts`:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    vitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
        ],
      },
    }),
  ],
});
```

### Offline Capabilities

| Feature          | Status | Implementation         |
| ---------------- | ------ | ---------------------- |
| Static assets    | ✅     | Service Worker cache   |
| API responses    | ✅     | Network-first strategy |
| User data        | ⚠️     | LocalStorage (partial) |
| Barcode scanning | ✅     | Works offline          |

---

## Application Configuration

### Authentication

```typescript
// libs/api-client/src/config.ts

export const authConfig = {
  // Session timeout in minutes
  SESSION_TIMEOUT: 30,

  // Refresh token interval in minutes
  TOKEN_REFRESH_INTERVAL: 25,

  // Enable password reset
  ENABLE_PASSWORD_RESET: true,

  // Require email verification
  REQUIRE_EMAIL_VERIFICATION: false,
};
```

### Logbook Settings

```typescript
// apps/web-pwa/src/hooks/useSecureLogbook.ts

const LOGBOOK_CONFIG = {
  // Maximum entries to display
  DEFAULT_LIMIT: 50,

  // Enable audit trail
  ENABLE_AUDIT_TRAIL: true,

  // Compliance check interval (days)
  COMPLIANCE_CHECK_DAYS: 7,
};
```

---

## Build Configuration

### Development

```bash
npm run dev
# or
npx nx serve web-pwa
```

### Production Build

```bash
npm run build
# or
npx nx build web-pwa --configuration=production
```

### Environment-Specific Builds

```bash
# Development
nx build web-pwa --configuration=development

# Staging
nx build web-pwa --configuration=staging

# Production
nx build web-pwa --configuration=production
```

---

## Deployment Configuration

### Vercel

Create `vercel.json` in `apps/web-pwa/`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/apps/web-pwa/browser",
  "installCommand": "npm install",
  "framework": "react",
  "env": {
    "REACT_APP_SUPABASE_URL": "@supabase-url",
    "REACT_APP_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### Docker

Build image:

```bash
docker build -f Dockerfile.web -t wada-bmad:latest .
```

Run container:

```bash
docker run -p 3000:80 wada-bmad:latest
```

### Coolify

Configure environment variables in Coolify dashboard:

- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_SUPABASE_SERVICE_ROLE_KEY`

---

## Security Configuration

### CORS Settings

Edit `supabase/config.toml`:

```toml
[api]
enabled = true
cors_allowed_origins = [
  "http://localhost:3000",
  "https://your-domain.com",
  "https://www.your-domain.com"
]
```

### Rate Limiting

Not implemented in MVP. For production:

```typescript
// libs/api-client/src/config.ts
export const rateLimitConfig = {
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_VERIFICATION_REQUESTS_PER_MINUTE: 10,
};
```

---

## Monitoring Configuration

### Supabase Analytics

Access at: https://supabase.com/dashboard/project/<project>/analytics

### Application Logs

Configure in deployment platform:

```bash
# Vercel - automatic
# Docker - mount volume for logs
# Coolify - in dashboard
```

### Error Tracking (Future)

Recommended: Sentry

```bash
npm install @sentry/react @sentry/tracing
```

---

## Next Steps

- [Setup Guide](setup.md) - Complete setup procedures
- [Usage Guide](usage.md) - Using the application
- [UAT Guide](uat-guide.md) - Testing the application
