# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Database Operations
```bash
npx drizzle-kit generate    # Generate migrations from schema changes
npx drizzle-kit push        # Push schema directly to database (development)
npx drizzle-kit studio      # Open Drizzle Studio for database inspection
```

### TypeScript Check
```bash
npx tsc --noEmit    # Verify TypeScript compilation without building
```

## Architecture Overview

### Platform Integration System

This codebase uses a **centralized platform configuration system** for managing advertising platform integrations (Google Ads, Meta Ads, TikTok, Snapchat, Google Analytics, Salla, Zid).

**Key Files:**
- [`lib/platform/config.ts`](lib/platform/config.ts) - Single source of truth for all platform metadata (ids, names, icons, OAuth paths, dashboard paths, availability status)
- [`lib/platform/hooks/usePlatformConnections.ts`](lib/platform/hooks/usePlatformConnections.ts) - Hook for checking connection status of all platforms via parallel API calls

**How it works:**
1. **Sidebar** (`app/dashboard/_components/sidebar.tsx`) dynamically shows only connected platforms using `usePlatformConnections()` hook
2. **Connect Platform Page** (`app/dashboard/connect-platform/page.tsx`) uses centralized `PLATFORMS` array to render platform cards
3. Platform availability is controlled via `available: boolean` in platform config (false = "Coming Soon")

**Adding a new platform:**
1. Add platform entry to `PLATFORMS` array in [`lib/platform/config.ts`](lib/platform/config.ts)
2. Create OAuth flow at `{oauthPath}` and accounts API at `{connectionCheckPath}`
3. Create dashboard page at `{dashboardPath}`
4. No changes needed to sidebar or connect-platform page - they automatically pick up new platforms

### Google Ads Integration

**Directory Structure:**
```
lib/google-ads/
├── oauth-client.ts        # OAuth 2.0 flow (authorization code, refresh tokens)
├── token-manager.ts       # Token refresh logic with retry
├── api-client.ts          # Google Ads API client wrapper
├── service.ts             # High-level data fetching operations
├── credentials.ts         # Credential management
├── retry.ts               # Retry logic with exponential backoff
├── cache.ts               # Caching utilities
├── transformers.ts        # API response to domain models
├── ownership.ts           # Multi-account ownership verification
├── user-settings.ts       # User preferences management
├── snapshots.ts           # Historical snapshot management
├── audit-log.ts           # Activity logging
└── hooks/
    └── useGoogleAds.ts    # React hooks for components
```

**OAuth Token Strategy:**
- Uses authorization code flow with PKCE
- Stores `refreshToken` (persistent) and `accessToken` (expires in 1 hour)
- `accessToken` is nullable in DB schema (expires, gets refreshed on demand)
- Token refresh handled via `lib/google-ads/token-manager.ts`

**Database Tables:**
- `googleAdsAccount` - OAuth tokens and account metadata
- `googleAdsCachedCampaigns`, `googleAdsCachedAdGroups`, `googleAdsCachedKeywords` - Structured cache with TTL
- `googleAdsCachedDailyMetrics` - Daily aggregated metrics
- `googleAdsCachedRecommendations` - AI recommendations
- `googleAdsCachedGeoPerformance` - Geographic data
- `googleAdsUserSettings` - User dashboard preferences
- `googleAdsActivityLog` - Audit trail

### Meta Ads Integration

**Directory Structure:**
```
lib/meta-ads/
├── oauth-client.ts        # Meta OAuth 2.0 (two-tier token system)
├── token-manager.ts       # Long-lived token management (60 days)
├── api-client.ts          # Meta Graph API client wrapper
├── service.ts             # High-level data fetching operations
├── retry.ts               # Retry logic with exponential backoff
├── cache.ts               # Caching utilities
├── transformers.ts        # API response to domain models
├── ownership.ts           # Multi-account ownership verification
├── audit-log.ts           # Activity logging
└── hooks/
    └── useMetaAds.ts      # React hooks for components
```

**OAuth Token Strategy (Meta-specific):**
- Uses **two-tier token system**:
  1. Short-lived tokens (1 hour) from initial OAuth
  2. Long-lived tokens (60 days) obtained by exchanging short-lived tokens
- No traditional refresh tokens - long-lived tokens must be exchanged before expiry
- Token refresh logic in `lib/meta-ads/oauth-client.ts` (`refreshTokenIfNeeded()`)

**Database Tables:**
- `metaAdsAccount` - OAuth tokens and account metadata
- `metaAdsCachedCampaigns`, `metaAdsCachedAdSets`, `metaAdsCachedAds` - Structured cache with TTL
- `metaAdsCachedDailyMetrics` - Daily aggregated metrics
- `metaAdsCachedCreativePerformance` - 40+ creative metrics including video metrics
- `metaAdsCachedGeoPerformance` - Geographic data
- `metaAdsCachedFunnelData` - Conversion funnel stages
- `metaAdsCachedFrequencyAnalysis` - Frequency distribution buckets
- `metaAdsUserSettings` - User dashboard preferences
- `metaAdsActivityLog` - Audit trail

### Authentication (Better Auth)

**Configuration:** [`lib/auth.ts`](lib/auth.ts)

**Features:**
- Google OAuth provider
- Polar.sh subscription integration (checkout, customer portal, webhooks, usage tracking)
- Drizzle adapter for PostgreSQL
- Next.js cookies for session management

**Auth Tables:** `user`, `session`, `account`, `verification`, `subscription`

### Database Schema

**File:** [`db/schema.ts`](db/schema.ts)

**Key Patterns:**
- All IDs are `text` type (not UUID)
- Timestamps use `timestamp()` with `defaultNow()`
- Foreign key references use `onDelete: "cascade"` for automatic cleanup
- Unique constraints use inline `unique()` function from drizzle-orm

**Decimal Values:**
- Monetary and metric values stored as `text` (not `numeric`/`decimal`)
- Converted at runtime via `transformers.ts` files

### API Route Organization

```
app/api/
├── google-ads/
│   ├── oauth/authorize + callback    # OAuth flow endpoints
│   ├── accounts                      # List, connect, set primary
│   ├── disconnect                    # POST /api/google-ads/disconnect
│   ├── campaigns                     # Campaign data
│   ├── metrics                       # Daily metrics
│   ├── ad-groups                     # Ad group data
│   ├── keywords                      # Keyword data with quality scores
│   ├── recommendations               # AI recommendations
│   ├── geo                           # Geographic performance
│   ├── snapshots                     # Historical snapshots
│   ├── settings                      # User preferences
│   └── activity                      # Activity log
└── meta-ads/
    ├── oauth/authorize + callback    # OAuth flow endpoints
    ├── accounts                      # List, connect, set primary
    ├── disconnect                    # DELETE /api/meta-ads/disconnect
    ├── campaigns                     # Campaign data
    ├── metrics/daily                 # Daily metrics
    ├── ad-sets                       # Ad set data
    ├── ads                           # Ad data
    ├── creatives                     # Creative performance (40+ metrics)
    ├── insights/
    │   ├── geo                       # Geographic performance
    │   ├── frequency                 # Frequency distribution
    │   ├── demographics              # Demographic data
    │   └── funnel                    # Conversion funnel
```

**Important:** Meta Ads uses `DELETE` for disconnect, Google Ads uses `POST`.

### Shared Components

- `app/dashboard/_components/disconnect-dialog.tsx` - Shared disconnect confirmation for both Google Ads and Meta Ads

### Import Path Conventions

- Use `@/` alias for all imports from project root
- Use `@/components/ui/` for shadcn components
- Use `@/lib/platform/config` for platform configuration
- Example: `import { PLATFORMS } from "@/lib/platform/config";`

### Environment Variables Required

```
# Database
DATABASE_URL="your-neon-database-url"

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Ads
GOOGLE_ADS_CLIENT_ID="your-google-ads-client-id"
GOOGLE_ADS_CLIENT_SECRET="your-google-ads-client-secret"
GOOGLE_ADS_DEVELOPER_TOKEN="your-developer-token"

# Meta Ads
META_APP_ID="your-meta-app-id"
META_APP_SECRET="your-meta-app-secret"
META_API_VERSION="v19.0"  # optional, defaults to v19.0

# Polar.sh
POLAR_ACCESS_TOKEN="your-polar-access-token"
POLAR_WEBHOOK_SECRET="your-webhook-secret"
NEXT_PUBLIC_STARTER_TIER="your-starter-product-id"
```
