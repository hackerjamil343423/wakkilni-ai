# Google Ads Backend Implementation

This document provides an overview of the Google Ads backend implementation for the Wakklni-Ai application.

## Architecture Overview

The backend is built with a layered architecture:

```
┌─────────────────────────────────────────────────┐
│              Frontend (Next.js)                  │
│  - Dashboard UI                                  │
│  - React Hooks (useGoogleAds)                   │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│           API Routes (/api/google-ads)           │
│  - campaigns, keywords, metrics, etc.            │
│  - OAuth flow (authorize, callback)              │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│       Google Ads Service Layer                   │
│  - API Client Management                         │
│  - Data Fetching Logic                          │
│  - Error Handling                               │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│          Cache Layer (PostgreSQL)                │
│  - Cached campaigns, keywords, metrics          │
│  - Token storage                                │
│  - Request logging                              │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│          Google Ads API                          │
│  - Official Google Ads API                       │
│  - OAuth 2.0 Authentication                     │
└─────────────────────────────────────────────────┘
```

## Key Components

### 1. API Routes (`app/api/google-ads/`)

#### Campaign Routes
- `GET /api/google-ads/campaigns` - Fetch campaigns with filters
- `GET /api/google-ads/ad-groups` - Fetch ad groups
- `GET /api/google-ads/keywords` - Fetch keywords with quality scores

#### Metrics Routes
- `GET /api/google-ads/metrics` - Fetch daily aggregated metrics
- `GET /api/google-ads/geo` - Fetch geographic performance

#### Recommendations Routes
- `GET /api/google-ads/recommendations` - Fetch AI recommendations
- `POST /api/google-ads/recommendations` - Apply a recommendation

#### OAuth Routes
- `GET /api/google-ads/oauth/authorize` - Start OAuth flow
- `GET /api/google-ads/oauth/callback` - Handle OAuth callback
- `POST /api/google-ads/disconnect` - Disconnect account

### 2. Service Layer (`lib/google-ads/`)

#### GoogleAdsService (`service.ts`)
Main service class that handles all Google Ads API interactions:
- `getCampaigns()` - Fetch campaigns with metrics
- `getAdGroups()` - Fetch ad groups
- `getKeywords()` - Fetch keywords with quality scores
- `getDailyMetrics()` - Fetch time-series metrics
- `getRecommendations()` - Fetch optimization recommendations
- `applyRecommendation()` - Apply a recommendation
- `getGeoPerformance()` - Fetch geographic data

#### Token Manager (`token-manager.ts`)
Handles OAuth token management:
- `getRefreshToken()` - Retrieve stored refresh token
- `getAccessToken()` - Get or refresh access token
- `hasConnectedAccount()` - Check connection status
- `getConnectedCustomers()` - List all connected accounts

#### Cache Manager (`cache.ts`)
Implements caching strategy to reduce API calls:
- `cacheCampaigns()` - Store campaign data
- `getCachedCampaigns()` - Retrieve cached campaigns
- `cacheDailyMetrics()` - Store metrics data
- `getCachedDailyMetrics()` - Retrieve cached metrics
- `clearExpiredCache()` - Clean up expired entries
- `invalidateCustomerCache()` - Clear all cache for a customer

#### Transformers (`transformers.ts`)
Convert Google Ads API responses to application format:
- `transformCampaign()` - Campaign data transformation
- `transformAdGroup()` - Ad group transformation
- `transformKeyword()` - Keyword with quality scores
- `transformMetrics()` - Daily metrics transformation
- `transformRecommendation()` - Recommendation transformation
- `transformGeoPerformance()` - Geographic data transformation

### 3. Database Schema (`db/schema.ts`)

#### Tables

**google_ads_tokens**
- Stores OAuth refresh and access tokens
- Linked to user accounts
- Includes customer ID and token expiration

**cached_campaigns**
- Stores campaign performance data
- Includes all key metrics (spend, conversions, ROAS)
- Time-based expiration

**cached_ad_groups**
- Ad group level performance
- Linked to campaigns

**cached_keywords**
- Keyword metrics and quality scores
- Quality component breakdown

**cached_daily_metrics**
- Time-series aggregated metrics
- Used for trend charts

**cached_recommendations**
- AI-powered optimization suggestions
- Impact estimation

**cached_geo_performance**
- Geographic performance by country
- ROAS and conversion data

**api_request_logs**
- Request logging for debugging
- Rate limit monitoring

### 4. Frontend Hooks (`lib/google-ads/hooks/`)

React hooks for data fetching:
- `useCampaigns()` - Fetch and manage campaign data
- `useDailyMetrics()` - Fetch time-series metrics
- `useKeywords()` - Fetch keyword data
- `useRecommendations()` - Fetch and apply recommendations
- `useGeoPerformance()` - Fetch geographic data
- `useGoogleAdsConnection()` - Manage connection status

## Data Flow

### 1. OAuth Connection Flow

```
User clicks "Connect"
  → GET /api/google-ads/oauth/authorize
  → Redirect to Google OAuth
  → User authorizes
  → GET /api/google-ads/oauth/callback
  → Exchange code for tokens
  → Store tokens in database
  → Redirect to dashboard
```

### 2. Data Fetching Flow

```
Frontend requests data
  → API route checks authentication
  → Check cache for recent data
  ├─ Cache HIT: Return cached data
  └─ Cache MISS:
      → Fetch from Google Ads API
      → Transform data format
      → Cache the results
      → Return to frontend
```

### 3. Caching Strategy

- **Campaigns**: 1 hour cache
- **Daily Metrics**: 30 minutes cache
- **Recommendations**: 2 hours cache
- **Keywords**: 1 hour cache
- **Geo Data**: 1 hour cache

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# Database
DATABASE_URL=postgresql://...

# Google Ads API
GOOGLE_ADS_CLIENT_ID=your_client_id
GOOGLE_ADS_CLIENT_SECRET=your_client_secret
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token
GOOGLE_ADS_LOGIN_CUSTOMER_ID=your_customer_id

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Installation

1. Install dependencies:
```bash
npm install google-ads-api drizzle-orm postgres
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. Run database migrations:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

## API Usage Examples

### Fetch Campaigns

```typescript
const response = await fetch('/api/google-ads/campaigns?customerId=1234567890');
const { data } = await response.json();
```

### Fetch Daily Metrics

```typescript
const params = new URLSearchParams({
  customerId: '1234567890',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

const response = await fetch(`/api/google-ads/metrics?${params}`);
const { data } = await response.json();
```

### Apply Recommendation

```typescript
const response = await fetch('/api/google-ads/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerId: '1234567890',
    recommendationId: 'customers/123/recommendations/456'
  })
});
```

## Error Handling

All API routes implement consistent error handling:

```typescript
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

Common error codes:
- `401` - Unauthorized (not logged in)
- `400` - Bad Request (missing parameters)
- `500` - Server Error (API or database error)

## Rate Limiting

The Google Ads API has rate limits:
- **Basic access**: 15,000 operations/day
- **Standard access**: 1,500,000 operations/day

Mitigation strategies:
1. Aggressive caching
2. Batch requests when possible
3. Request logging for monitoring
4. Automatic retry with exponential backoff

## Security

Security measures implemented:
1. **OAuth 2.0** - Industry-standard authentication
2. **Token encryption** - Sensitive tokens stored securely
3. **HTTPS only** - All API calls over secure connection
4. **Session validation** - Every request validates user session
5. **SQL injection prevention** - Using Drizzle ORM prepared statements
6. **Rate limiting** - Prevents abuse

## Performance Optimization

1. **Caching** - Reduces API calls by 80%+
2. **Database indexing** - Fast lookups on customer ID, dates
3. **Parallel requests** - Fetch multiple data types concurrently
4. **Request deduplication** - Prevents duplicate API calls
5. **Lazy loading** - Load non-critical data in background

## Monitoring

Track important metrics:
- API request count and latency
- Cache hit/miss ratio
- Error rates by endpoint
- Token refresh frequency

Query the `api_request_logs` table for insights.

## Troubleshooting

See `GOOGLE_ADS_SETUP.md` for detailed troubleshooting guide.

## Next Steps

Future enhancements:
1. Add more Google Ads API endpoints (Shopping, Video, Display)
2. Implement real-time notifications for performance changes
3. Add automated bidding recommendations
4. Create custom alert rules
5. Export data to CSV/Excel
6. Schedule automated reports

## Support

For issues or questions:
1. Check `GOOGLE_ADS_SETUP.md`
2. Review API logs in database
3. Consult Google Ads API documentation
4. Check application logs

## License

See main README for license information.
