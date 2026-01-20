Meta Ads Backend Implementation Plan
Overview
Implement a production-ready Meta Ads backend to replace mock data in the fully-functional dashboard. The implementation will mirror the existing Google Ads architecture, supporting OAuth authentication, API integration, caching, and multi-account management.

Current State: Meta Ads dashboard has 14 components using 100% mock data
Target State: Full Meta Marketing API integration with real-time data
Reference: Google Ads implementation (lib/google-ads/*, app/api/google-ads/*)

Critical Files to Create/Modify
Database Schema
db/schema.ts - Add Meta Ads tables (lines 88-481 show Google Ads pattern to replicate)
metaAdsAccount - OAuth tokens and account metadata
metaAdsCachedCampaigns - Campaign performance snapshots
metaAdsCachedAdSets - Ad set metrics
metaAdsCachedAds - Ad creative data
metaAdsCachedDailyMetrics - Daily aggregated metrics
metaAdsCachedCreativePerformance - 40+ creative metrics
metaAdsCachedGeoPerformance - Geographic breakdown
metaAdsCachedFunnelData - Conversion funnel stages
metaAdsCachedFrequencyAnalysis - Frequency distribution
metaAdsUserSettings - Dashboard preferences
metaAdsActivityLog - Audit trail
metaAdsAccountSnapshots - Historical trends
Service Layer (lib/meta-ads/)
oauth-client.ts - Meta OAuth 2.0 flow (template: lib/google-ads/oauth-client.ts)
api-client.ts - Meta Marketing API wrapper (base URL: https://graph.facebook.com/v19.0)
service.ts - Business logic layer (template: lib/google-ads/service.ts)
token-manager.ts - Token lifecycle management (Meta uses 60-day long-lived tokens)
transformers.ts - Meta API → App type conversions
cache.ts - Caching strategy with TTL
ownership.ts - Multi-tenant authorization
audit-log.ts - Activity tracking
retry.ts - Can reuse Google Ads version with Meta error codes
API Routes (app/api/meta-ads/)
oauth/authorize/route.ts - Initiate OAuth flow
oauth/callback/route.ts - Handle OAuth callback, token exchange
accounts/route.ts - GET/PATCH connected accounts
accounts/connect/route.ts - Connect selected ad account
disconnect/route.ts - Disconnect account(s)
campaigns/route.ts - Campaign list with metrics
ad-sets/route.ts - Ad set performance
ads/route.ts - Ad creative data
metrics/daily/route.ts - Daily time-series metrics
creatives/route.ts - Creative performance (40+ metrics)
insights/funnel/route.ts - Conversion funnel
insights/geo/route.ts - Geographic performance
insights/frequency/route.ts - Frequency analysis
insights/demographics/route.ts - Demographic breakdowns
settings/route.ts - User settings
activity/route.ts - Activity log
snapshots/route.ts - Historical snapshots
React Hooks
lib/meta-ads/hooks/useMetaAds.ts - All data hooks (template: lib/google-ads/hooks/useGoogleAds.ts)
useCampaigns(), useDailyMetrics(), useAds(), useCreativePerformance()
useFunnelData(), useGeoPerformance(), useFrequencyAnalysis(), useDemographics()
useMetaAdsConnection() - Account management
Frontend Integration
app/dashboard/meta-ads/page.tsx - Replace mock data with API calls
app/dashboard/meta-ads/_components/* - Update all 14 components to use real data
Environment Variables
.env - Add Meta API credentials:

META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_API_VERSION=v19.0
Implementation Steps
Phase 1: Database Schema (Day 1)
Add all Meta Ads tables to db/schema.ts following Google Ads pattern
Create Drizzle migration: npx drizzle-kit generate
Apply migration: npx drizzle-kit migrate
Verify tables in Neon dashboard
Key Considerations:

Use text type for monetary values (precision)
Add composite unique constraints for cache keys: (accountId, resourceId, dataDate)
Ensure cascade deletes: user deletion → account deletion → cache deletion
Add indexes on userId, accountId, dataDate, expiresAt
Phase 2: OAuth Implementation (Days 2-3)
Implement lib/meta-ads/oauth-client.ts:

generateAuthUrl(state) → https://www.facebook.com/v19.0/dialog/oauth
getTokensFromCode(code) → Exchange for short-lived token
exchangeForLongLivedToken(shortToken) → 60-day token
refreshTokenIfNeeded(tokenData) → Renew before expiry
Implement OAuth routes:

/api/meta-ads/oauth/authorize - Redirect to Meta consent
/api/meta-ads/oauth/callback - Handle callback, list ad accounts
Test OAuth flow end-to-end

Meta OAuth Differences:

Two-tier tokens: short-lived (1 hour) → long-lived (60 days)
No traditional refresh token - must exchange tokens before expiry
Required scopes: ads_read, ads_management, business_management
Phase 3: Core Services (Days 4-5)
Implement lib/meta-ads/api-client.ts:

Base URL: https://graph.facebook.com/v19.0
Methods: getCampaigns(), getAdSets(), getAds(), getAccountInsights()
Handle Meta's rate limits (200 calls/hour per account)
Implement lib/meta-ads/transformers.ts:

Transform Meta's actions array to flat metrics (e.g., actions[{type: 'lead'}] → leads: 25)
Handle video metrics extraction
Map cost_per_action_type array to individual CPA values
Implement lib/meta-ads/token-manager.ts:

getAccessToken(userId, accountId) - Auto-refresh if expiring
refreshTokenIfNeeded(tokenData) - Exchange if < 30 days remaining
getConnectedAccounts(userId)
Implement lib/meta-ads/ownership.ts:

requireAccountOwnership(userId, accountId) - Verify and throw if unauthorized
Critical: Meta API returns conversions in complex nested structures. Transformers must handle:


// Meta response
{ actions: [{ action_type: 'lead', value: 25 }] }
// Transform to
{ leads: 25 }
Phase 4: Business Logic Layer (Days 6-7)
Implement lib/meta-ads/service.ts:

MetaAdsService class with methods for each data type
Methods: getCampaigns(), getDailyMetrics(), getCreativePerformance(), etc.
Integrate caching strategy
Implement lib/meta-ads/cache.ts:

Cache TTLs: campaigns (15 min), daily metrics (30 min), creatives (1 hour)
getCachedData<T>(cacheKey, fetchFn, ttl)
invalidateCache(accountId, cacheType)
Implement lib/meta-ads/audit-log.ts:

Log all account operations: connect, disconnect, data sync
Capture IP address, user agent, success/failure
Caching Strategy:

Check database cache first
If expired or missing, fetch from Meta API
Transform and store in cache with TTL
Return data to caller
Phase 5: Account Management APIs (Day 8)
Implement /api/meta-ads/accounts/route.ts:

GET: List connected accounts
PATCH: Update account name/label
Implement /api/meta-ads/accounts/connect/route.ts:

Store selected ad account after OAuth
Support multi-account selection
Implement /api/meta-ads/disconnect/route.ts:

Revoke Meta token via API
Delete from database (cascade deletes cache)
Support disconnect single or all accounts
Security Pattern (apply to ALL routes):


const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
await requireAccountOwnership(session.user.id, accountId);
Phase 6: Data Fetching APIs (Days 9-11)
Implement core data routes:

/api/meta-ads/campaigns - Campaign list with performance
/api/meta-ads/ad-sets - Ad set metrics
/api/meta-ads/ads - Ad creative data
/api/meta-ads/metrics/daily - Daily aggregated metrics (last 90 days)
/api/meta-ads/creatives - Creative performance with 40+ metrics
Query parameters for all routes:

accountId (required)
startDate, endDate (ISO format)
status[] (filter by status)
campaignIds[] (filter by campaigns)
Meta API Fields Required:

Campaigns: campaign_id, campaign_name, objective, status, daily_budget, lifetime_budget, spend, impressions, clicks, actions, ctr, cpc, cpm
Creatives: All engagement, video, conversion, cost, and quality metrics
Use Meta's fields parameter to request specific data
Phase 7: Insights APIs (Days 12-13)
Implement /api/meta-ads/insights/funnel:

Calculate 5-stage funnel: Impressions → Clicks → Page Views → Leads → Purchases
Calculate dropoff rates between stages
Compare to previous period
Implement /api/meta-ads/insights/geo:

Use Meta's breakdowns=['country'] parameter
Support country, region, city levels
Include spend, impressions, conversions, ROAS per location
Implement /api/meta-ads/insights/frequency:

Use Meta's frequency distribution insights
Group by buckets: 1, 2, 3, 4, 5+
Calculate reach, spend, CPA per bucket
Implement /api/meta-ads/insights/demographics:

Use breakdowns=['age', 'gender']
Return performance by demographic segment
Breakdowns Syntax:


// Meta API request
GET /act_{account_id}/insights?breakdowns=['country']&fields=spend,impressions,actions
Phase 8: React Hooks (Days 14-15)
Create lib/meta-ads/hooks/useMetaAds.ts with hooks for:

Data fetching: campaigns, metrics, ads, creatives, funnel, geo, frequency, demographics
Connection management: accounts, active account, switch, connect, disconnect
Hook pattern (following Google Ads):


export function useCampaigns(options: UseMetaAdsDataOptions) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!options.enabled) return;
    // Fetch from API
  }, [options.customerId, options.startDate, options.endDate]);

  return { data, loading, error, refetch: fetch };
}
Connection hook with localStorage for active account persistence:

export function useMetaAdsConnection() {
  // Load accounts, track active, provide switching
  // Store activeAccountId in localStorage
}
Phase 9: Frontend Integration (Days 16-17)
Update app/dashboard/meta-ads/page.tsx:

Replace mock data generators with API hooks
Add connection check and redirect logic
Handle loading and error states
Update all 14 dashboard components:

KPI Grid: Use useDailyMetrics() for real metrics
Trend Chart: Use useDailyMetrics() for time-series
Creative Table: Use useCreativePerformance() for 40+ metrics
Funnel: Use useFunnelData()
Geographic: Use useGeoPerformance()
Frequency: Use useFrequencyAnalysis()
Add connection management UI:

Connect button when no accounts
Account switcher in header
Disconnect option in settings
Pattern for Each Component:


// Before (mock data)
const [campaigns, setCampaigns] = useState(generateCampaignData());

// After (real data)
const { data: campaigns, loading } = useCampaigns({
  accountId: activeAccountId,
  startDate: filters.dateRange.from,
  endDate: filters.dateRange.to,
  enabled: !!activeAccountId
});
Phase 10: Testing & Verification (Days 18-20)
See Verification Checklist below for comprehensive testing.

Meta API Integration Details
OAuth Scopes Required

const OAUTH_SCOPES = [
  'ads_read',           // Read ad data
  'ads_management',     // Manage ads
  'business_management', // Access business assets
  'pages_read_engagement' // Page metrics (optional)
]
Token Lifecycle (Meta-Specific)
User authorizes → Short-lived token (1 hour)
Exchange for long-lived token (60 days)
Before expiry (< 30 days remaining), exchange for new long-lived token
Store new token in database
Rate Limits
Account-level: 200 calls/hour per ad account
User-level: 200 calls/hour per user
App-level: 200 calls/hour (cumulative)
Handling: Implement exponential backoff, check x-business-use-case-usage header
Attribution Windows (Frontend Filter)

const ATTRIBUTION_SETTINGS = {
  '1d_click': { click_days: 1, view_days: 0 },
  '7d_click': { click_days: 7, view_days: 0 },
  '28d_click': { click_days: 28, view_days: 0 },
  '1d_view': { click_days: 1, view_days: 1 },
}
Error Codes to Handle

const META_ERRORS = {
  1: 'API Unknown - Retry',
  2: 'API Service - Retry',
  4: 'Too Many Calls - Backoff',
  17: 'User Too Many Calls - Backoff',
  190: 'Token Expired - Refresh',
  200: 'Permission Denied - Show Error',
  2500: 'Account Disabled - Show Error',
}
Critical Considerations
1. Data Transformation Complexity
Challenge: Meta returns conversions in nested action arrays


// Meta API response
{
  actions: [
    { action_type: 'lead', value: 25 },
    { action_type: 'purchase', value: 8 }
  ],
  cost_per_action_type: [
    { action_type: 'lead', value: '42.50' },
    { action_type: 'purchase', value: '156.32' }
  ]
}

// Must transform to flat structure
{
  leads: 25,
  purchases: 8,
  costPerLead: 42.50,
  costPerPurchase: 156.32
}
Solution: Create robust transformer functions that extract values by action_type

2. Video Metrics Handling
Video metrics are only present for video creatives. Transformers must:

Check if video metrics exist before accessing
Return null or 0 for non-video creatives
Handle partial video completion data
3. Multi-Account Management
Support users with multiple ad accounts
Persist active account selection in localStorage
Validate account ownership on every API call
Handle account switching without page reload
4. Caching Strategy
Tier 1 - Hot Data (15 min TTL): Daily metrics (last 7 days), active campaigns
Tier 2 - Warm Data (1 hour TTL): Creative performance, geo data, frequency
Tier 3 - Cold Data (6 hour TTL): Historical snapshots, archived campaigns

5. Security Measures
Token Encryption: Use Neon's encrypted storage for tokens
CSRF Protection: Validate OAuth state parameter matches user ID
Ownership Checks: Every API call must verify requireAccountOwnership()
Audit Logging: Log all account operations with IP/user-agent
Input Validation: Sanitize all query parameters
Verification Checklist
OAuth Flow
 Environment variables configured correctly
 Authorization URL redirects to Meta consent screen
 Callback exchanges code for short-lived token
 Short-lived token exchanges for long-lived token (60 days)
 State parameter prevents CSRF attacks
 Multiple ad accounts handled correctly
 Single ad account auto-connects
 Tokens stored in database with expiry
Database
 All 12 tables created successfully
 Foreign key constraints working
 Cascade deletes functioning (user → account → cache)
 Unique constraints prevent duplicate connections
 Indexes improve query performance
API Routes
 All 17 routes implemented
 Authentication verified on every route
 Account ownership checked before data access
 Error responses follow standard format
 Rate limiting handled gracefully
Service Layer
 Meta API client makes successful requests
 Transformers convert Meta data to app types correctly
 Actions array extraction working (leads, purchases, etc.)
 Caching reduces redundant API calls
 Token refresh automatic before expiry
 Retry logic handles network failures
Frontend Integration
 Mock data completely replaced with API calls
 All 14 dashboard components render real data
 KPI Grid shows accurate metrics
 Trend charts display time-series correctly
 Creative table shows 40+ metrics
 Funnel visualization accurate
 Geographic map displays country data
 Loading states prevent blank screens
 Error states show user-friendly messages
 Multi-account switching works without reload
Performance
 Dashboard loads in < 2 seconds
 API responses return in < 500ms
 Cache hit rate > 70%
 No N+1 database queries
 Efficient batch API requests
Security
 Tokens never exposed in client-side code
 CSRF protection active
 Account ownership verified on all operations
 Activity log capturing all events
 Rate limiting prevents abuse
End-to-End Testing
New User Flow:

Navigate to Meta Ads dashboard → Redirected to connect page
Click "Connect Meta Ads" → OAuth consent screen
Authorize → Select ad account → Redirected to dashboard
Dashboard loads with real data from Meta API
Multi-Account Flow:

User has 3 ad accounts connected
Switch between accounts using dropdown
Data updates without page reload
Active account persists on refresh
Disconnect Flow:

Disconnect single account → Cache cleared, token revoked
Disconnect all accounts → Redirected to connect page
Error Handling:

Simulate expired token → Auto-refresh works
Simulate rate limit → Exponential backoff triggers
Simulate network error → Retry logic attempts 3 times
Simulate permission error → User-friendly error message
Success Criteria
✅ OAuth Working: Users can connect Meta ad accounts via OAuth
✅ Data Flowing: All dashboard components display real Meta API data
✅ No Mock Data: mock-data.ts no longer used in production
✅ Performance: Dashboard loads quickly with cached data
✅ Multi-Account: Users can switch between multiple ad accounts
✅ Security: Account ownership verified, tokens secure, CSRF protected
✅ Error Handling: Graceful degradation with user-friendly messages
✅ Audit Trail: All operations logged for compliance

Estimated Timeline
Total: 20 working days (4 weeks)

Week 1: Database + OAuth (Days 1-5)
Week 2: Services + Account APIs (Days 6-10)
Week 3: Data APIs + Insights (Days 11-15)
Week 4: Hooks + Frontend + Testing (Days 16-20)
Reference Files
Templates to Follow:

lib/google-ads/oauth-client.ts - OAuth pattern
lib/google-ads/service.ts - Service layer architecture
app/api/google-ads/oauth/callback/route.ts - OAuth callback handling
db/schema.ts (lines 88-481) - Database schema pattern
Frontend Types to Match:

app/dashboard/meta-ads/types.ts - Exact data structures expected by UI
Environment Reference:

.env.example - Add Meta credentials following Google Ads pattern