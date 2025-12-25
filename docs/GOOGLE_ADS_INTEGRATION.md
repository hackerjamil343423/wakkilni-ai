# Google Ads Integration Documentation

## Overview

This application provides a complete Google Ads integration that allows users to:
1. Connect their Google Ads accounts via OAuth 2.0
2. View and manage multiple Google Ads accounts
3. Disconnect accounts when needed
4. Store OAuth tokens for long-term access

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. User clicks "Connect" in Platform Settings                             │
│           ↓                                                                 │
│  2. Redirect to Google OAuth Consent Screen                                │
│           ↓                                                                 │
│  3. Google redirects back with authorization code                          │
│           ↓                                                                 │
│  4. Exchange code for access & refresh tokens                              │
│           ↓                                                                 │
│  5. Fetch accessible Google Ads accounts from API                          │
│           ↓                                                                 │
│  6. User selects which accounts to connect                                 │
│           ↓                                                                 │
│  7. Store accounts in database with tokens                                 │
│           ↓                                                                 │
│  8. Redirect to Platform Settings for account management                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## OAuth Flow Details

### Step 1: Initiate OAuth
**Endpoint:** `GET /api/google-ads/oauth/authorize`

**Purpose:** Starts the OAuth 2.0 flow by generating a Google authorization URL.

**Process:**
1. Verifies user is authenticated via Better Auth
2. Generates OAuth authorization URL with user ID as `state` parameter
3. Redirects user to Google's consent screen

**Environment Variables Required:**
- `GOOGLE_ADS_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_ADS_CLIENT_SECRET` - Google OAuth client secret
- `NEXT_PUBLIC_APP_URL` - Used for callback URL construction

---

### Step 2: OAuth Callback
**Endpoint:** `GET /api/google-ads/oauth/callback`

**Purpose:** Handles Google's OAuth callback, exchanges code for tokens, and fetches accessible accounts.

**Process:**
1. Validates `state` parameter matches user ID (security check)
2. Exchanges authorization code for access & refresh tokens
3. **Attempts to fetch accessible customers via Google Ads API**
4. **Handles network errors with retry logic (5 attempts, exponential backoff)**
5. If successful: redirects to account selection page
6. If API fails: redirects with error but still allows manual account entry

**Error Handling:**
- ECONNRESET, ETIMEDOUT, ECONNREFUSED - Retries with exponential backoff
- Invalid state - Returns 400 error
- Token exchange failure - Returns 500 error

---

### Step 3: Connect Selected Accounts
**Endpoint:** `POST /api/google-ads/accounts/connect`

**Purpose:** Stores selected Google Ads accounts in the database.

**Request Body:**
```json
{
  "refreshToken": "1//09...",
  "customerIds": ["5417101958", "9554848070"]
}
```

**Process:**
1. Validates refresh token is provided
2. Validates customer IDs are 10-digit numbers
3. Checks for duplicates (userId + customerId must be unique)
4. Inserts each account into database
5. Returns detailed results for each account (connected/already_connected/failed)

**Response:**
```json
{
  "success": true,
  "message": "Connected 2 accounts",
  "results": {
    "connected": 2,
    "alreadyConnected": 0,
    "failed": 0,
    "total": 2
  },
  "accounts": [...]
}
```

---

### Step 4: List Connected Accounts
**Endpoint:** `GET /api/google-ads/accounts`

**Purpose:** Fetches all connected Google Ads accounts for the authenticated user.

**Response:**
```json
{
  "success": true,
  "accounts": [
    {
      "id": "nanoid",
      "customerId": "5417101958",
      "loginCustomerId": "5417101958",
      "accountName": "My Account",
      "status": "active",
      "isPrimary": false,
      "lastSyncedAt": "2025-12-25T10:00:00Z"
    }
  ],
  "count": 1
}
```

---

### Step 5: Disconnect Account
**Endpoint:** `POST /api/google-ads/disconnect`

**Purpose:** Disconnects one or all Google Ads accounts.

**Request Body:**
```json
{
  "customerId": "5417101958"  // OR { "all": true }
}
```

**Process:**
1. Verifies account ownership
2. Deletes account(s) from database
3. Invalidates cached data
4. Returns success message with count

---

## Database Schema

### Table: `google_ads_account`

| Column | Type | Description |
|--------|------|-------------|
| `id` | text (PK) | Unique identifier (nanoid) |
| `userId` | text (FK) | Reference to user table (cascade delete) |
| `customerId` | text | Google Ads Customer ID (10 digits) |
| `loginCustomerId` | text | Login Customer ID for API access |
| `accountName` | text | Descriptive account name |
| `managerCustomerId` | text | Optional MCC account ID |
| `accessToken` | text | OAuth access token (nullable, expires) |
| `refreshToken` | text | OAuth refresh token (permanent) |
| `tokenExpiresAt` | timestamp | Access token expiry time |
| `scope` | text | OAuth scope granted |
| `status` | text | Account status (active/disconnected/error) |
| `lastSyncedAt` | timestamp | Last successful data fetch |
| `syncError` | text | Last error message if any |
| `currency` | text | Account currency code |
| `timezone` | text | Account timezone |
| `isPrimary` | boolean | User's default account |
| `accountLabel` | text | User-defined nickname |
| `createdAt` | timestamp | Connection timestamp |
| `updatedAt` | timestamp | Last update timestamp |

**Unique Constraint:** `(userId, customerId)` - Prevents duplicate connections

**Cascade Rules:**
- `userId` → `user.id` with `onDelete: cascade`
- All cache tables → `google_adsAccount.id` with `onDelete: cascade`

---

## Client Libraries

### File: `lib/google-ads/oauth-client.ts`

**Functions:**

| Function | Purpose |
|----------|---------|
| `createOAuth2Client()` | Creates configured OAuth2 client instance |
| `generateAuthUrl(state)` | Generates Google authorization URL |
| `getTokensFromCode(code)` | Exchanges auth code for tokens with retry |
| `refreshAccessToken(refreshToken)` | Gets new access token using refresh token |

**Features:**
- Environment variable validation
- Exponential backoff retry for token operations
- Refresh token validation

---

### File: `lib/google-ads/api-client.ts`

**Functions:**

| Function | Purpose |
|----------|---------|
| `listAccessibleCustomers(accessToken)` | Fetches accessible accounts via REST API |
| `validateAccessToken(accessToken)` | Tests if token is valid |
| `getCustomer(customerId, accessToken)` | Fetches customer details |
| `searchGoogleAds(customerId, query, accessToken)` | Executes GAQL queries |

**Features:**
- Direct REST API calls (bypasses library limitations)
- 60-second timeout for customer list
- 120-second timeout for search queries
- Retry logic with exponential backoff

---

### File: `lib/google-ads/retry.ts`

**Utility:** `withRetry(asyncFn, options)`

**Options:**
- `maxAttempts` - Maximum retry attempts (default: 3)
- `baseDelayMs` - Initial delay before retry (default: 1000ms)
- `maxDelayMs` - Maximum delay between attempts (default: 10000ms)
- `shouldRetry` - Custom function to determine if error is retryable

**Retryable Errors:**
- ECONNRESET - Connection reset by peer
- ETIMEDOUT - Connection timeout
- ECONNREFUSED - Connection refused
- ENOTFOUND - DNS lookup failed
- EPIPE - Broken pipe
- Google Ads API errors (Grpc, deadline exceeded)

---

## Environment Variables

### Required for Google Ads OAuth

```env
# Google OAuth Configuration
GOOGLE_ADS_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=your-client-secret
GOOGLE_ADS_DEVELOPER_TOKEN=your-developer-token

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Required for Database

```env
# Neon PostgreSQL
DATABASE_URL=postgresql://user:password@host/database
```

---

## Frontend Pages

### 1. Platform Settings
**Path:** `/dashboard/connect-platform`

**Features:**
- List of all ad platforms (Google Ads, Meta Ads, TikTok Ads)
- Connect button initiates OAuth flow
- 3-dot menu appears when `platform.connected === true`
- Disconnect option with confirmation dialog

---

### 2. Select Accounts (After OAuth)
**Path:** `/dashboard/google-ads/connect/select-accounts`

**Features:**
- Displays accessible Google Ads accounts
- Multi-select checkboxes for account selection
- "Connect Selected" button stores accounts
- Auto-redirects to settings after successful connection

---

### 3. Account Management
**Path:** `/dashboard/google-ads/settings/accounts`

**Features:**
- List all connected accounts
- View account status (active/disconnected/error)
- Disconnect individual accounts
- Set primary account
- View last sync time

---

## Error Handling

### Network Errors

The application handles transient network errors with exponential backoff:

| Error | Handling |
|-------|----------|
| ECONNRESET | Retry up to 5 times with 2s base delay |
| ETIMEDOUT | Retry up to 5 times with 2s base delay |
| ECONNREFUSED | Retry up to 5 times with 2s base delay |
| CONNECT_TIMEOUT (DB) | Retries with 30s connection timeout |

### User-Facing Error Messages

| Scenario | Message |
|----------|---------|
| Network failure during OAuth | "Network error connecting to Google Ads. Please try again." |
| Invalid customer ID format | "Invalid customer ID format. Must be 10 digits." |
| Account already connected | "This account is already connected." |
| No accounts found | "No accessible Google Ads accounts found." |

---

## Security Considerations

1. **State Parameter:** User ID is passed as `state` to prevent CSRF attacks
2. **Token Storage:** Refresh tokens are stored encrypted in database
3. **User Ownership:** All API routes verify user owns the account
4. **Cascade Delete:** User deletion removes all associated accounts
5. **Environment Validation:** Required env vars checked on startup

---

## Future Enhancements

### Planned Features

1. **Automatic Token Refresh:** Background job to refresh expired access tokens
2. **Data Sync:** Scheduled sync of campaigns, ad groups, keywords
3. **Analytics Dashboard:** Display performance metrics
4. **Recommendations:** Show Google Ads optimization suggestions
5. **Multi-Currency Support:** Handle accounts in different currencies
6. **MCC Support:** Better support for Manager Accounts

### Cache Tables (Prepared but not yet used)

- `google_ads_cached_campaigns` - Campaign snapshots
- `google_ads_cached_ad_groups` - Ad group performance
- `google_ads_cached_keywords` - Keyword data with quality scores
- `google_ads_cached_daily_metrics` - Daily aggregated metrics
- `google_ads_cached_recommendations` - Google Ads AI recommendations
- `google_ads_cached_geo_performance` - Geographic performance data

---

## Troubleshooting

### Issue: "Error: read ECONNRESET"

**Cause:** Network connection to Google Ads API was reset

**Solutions:**
1. Check internet connection stability
2. Verify no firewall blocking Google APIs
3. Retry the operation (automatic with exponential backoff)
4. Check Google Ads API status page

---

### Issue: "Missing required environment variables"

**Cause:** `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, or `NEXT_PUBLIC_APP_URL` not set

**Solution:** Add missing variables to `.env` file

---

### Issue: "Invalid customer ID format"

**Cause:** Customer ID is not 10 digits

**Solution:** Customer IDs should be in format: `1234567890` (no dashes or spaces)

---

### Issue: "Module not found: Can't resolve '@/components/ui/alert-dialog'"

**Cause:** Build cache issue after adding new components

**Solution:**
1. Clear Next.js cache: `rm -rf .next`
2. Restart dev server: `npm run dev`

---

## Related Files

### Backend API Routes
- `app/api/google-ads/oauth/authorize/route.ts`
- `app/api/google-ads/oauth/callback/route.ts`
- `app/api/google-ads/accounts/route.ts`
- `app/api/google-ads/accounts/connect/route.ts`
- `app/api/google-ads/disconnect/route.ts`

### Client Libraries
- `lib/google-ads/oauth-client.ts`
- `lib/google-ads/api-client.ts`
- `lib/google-ads/retry.ts`
- `lib/google-ads/cache.ts`

### Database
- `db/schema.ts` - Google Ads tables
- `db/index.ts` - Connection pool configuration

### Frontend Pages
- `app/dashboard/connect-platform/page.tsx`
- `app/dashboard/google-ads/connect/select-accounts/page.tsx`
- `app/dashboard/google-ads/settings/accounts/page.tsx`

### UI Components
- `app/dashboard/connect-platform/_components/platform-card.tsx`
- `app/dashboard/connect-platform/_components/platform-card-menu.tsx`
- `app/dashboard/connect-platform/_components/platform-disconnect-dialog.tsx`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-25 | Initial implementation with OAuth flow and account management |
| 1.1 | 2025-12-25 | Added retry logic, optimized database pool, improved error handling |

---

## Support

For issues or questions about the Google Ads integration:
1. Check this documentation first
2. Review error messages in browser console and server logs
3. Verify environment variables are correctly set
4. Check Google Ads API status: https://status.cloud.google.com/
