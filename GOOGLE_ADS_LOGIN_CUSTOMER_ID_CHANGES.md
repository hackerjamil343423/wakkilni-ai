# Google Ads Login Customer ID Implementation

## Session Date
2025-12-24

## Overview
Updated the Google Ads integration to support multi-tenant SaaS architecture where each user connects their own Google Ads account, with each account storing its own `login_customer_id` in the database instead of using a shared environment variable.

## Problem Statement
The original implementation used a single `GOOGLE_ADS_LOGIN_CUSTOMER_ID` environment variable for all Google Ads accounts. This approach works for Manager Account (MCC) structures but is not suitable for a SaaS platform where each user connects their own individual Google Ads account.

## Solution
Store `login_customer_id` per account in the database, allowing each Google Ads account to use its own login customer ID (typically the same as `customer_id` for individual accounts).

## Files Modified

### 1. Database Schema (`db/schema.ts`)
**Change:** Added `loginCustomerId` column to `googleAdsAccount` table

```typescript
// Before
customerId: text("customerId").notNull(),
accountName: text("accountName").notNull(),

// After
customerId: text("customerId").notNull(),
loginCustomerId: text("loginCustomerId").notNull(), // NEW
accountName: text("accountName").notNull(),
```

### 2. SQL Schema (`google-ads-schema.sql`)
**Changes:**
- Added `loginCustomerId` column to table definition
- Added migration for existing databases
- Created index for `loginCustomerId`

```sql
-- Added to table definition
"loginCustomerId" TEXT NOT NULL,

-- Added migration
ALTER TABLE google_ads_account ADD COLUMN IF NOT EXISTS "loginCustomerId" TEXT NOT NULL DEFAULT "customerId";
CREATE INDEX IF NOT EXISTS idx_google_ads_account_login_customer_id ON google_ads_account("loginCustomerId");
```

### 3. Google Ads Client (`lib/google-ads-client.ts`)
**Change:** Use `loginCustomerId` from database instead of environment variable

```typescript
// Before
return client.Customer({
  customer_id: account.customerId,
  refresh_token: account.refreshToken,
  access_token: accessToken,
  login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID, // Shared env var
});

// After
return client.Customer({
  customer_id: account.customerId,
  refresh_token: account.refreshToken,
  access_token: accessToken,
  login_customer_id: account.loginCustomerId, // From database per account
});
```

### 4. OAuth Callback (`app/api/google-ads/oauth/callback/route.ts`)
**Changes:**
- Store `loginCustomerId` when connecting accounts
- Fixed field name inconsistency (`accessTokenExpiresAt` → `tokenExpiresAt`)

```typescript
// Before
await db.insert(googleAdsAccount).values({
  userId: state,
  customerId,
  accountName: `Account ${customerId}`,
  refreshToken: tokens.refresh_token,
  accessToken: tokens.access_token || null,
  accessTokenExpiresAt: tokens.expires_in ? ... : null, // Wrong field name
  scope: tokens.scope || null,
});

// After
await db.insert(googleAdsAccount).values({
  userId: state,
  customerId,
  loginCustomerId: customerId, // NEW: Same as customerId for individual accounts
  accountName: `Account ${customerId}`,
  refreshToken: tokens.refresh_token,
  accessToken: tokens.access_token || null,
  tokenExpiresAt: tokens.expires_in ? ... : null, // Fixed field name
  scope: tokens.scope || null,
});
```

### 5. Account Connect Endpoint (`app/api/google-ads/accounts/connect/route.ts`)
**Changes:**
- Store `loginCustomerId` when connecting accounts
- Added missing `GoogleAdsApi` import
- Fixed field name inconsistency

```typescript
// Added import
import { GoogleAdsApi } from "google-ads-api";

// Updated insert
const cleanCustomerId = customerId.replace(/-/g, "");
await db.insert(googleAdsAccount).values({
  userId: session.user.id,
  customerId: cleanCustomerId,
  loginCustomerId: cleanCustomerId, // NEW
  accountName: `Account ${customerId}`,
  refreshToken: refreshToken,
  accessToken: tokens.access_token || null,
  tokenExpiresAt: tokens.expiry_date ? ... : null, // Fixed
  scope: tokens.scope || null,
});
```

## Migration Required

For existing databases with the `google_ads_account` table, run:

```sql
-- Add the new column
ALTER TABLE google_ads_account
ADD COLUMN IF NOT EXISTS "loginCustomerId" TEXT NOT NULL DEFAULT "customerId";

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_google_ads_account_login_customer_id
ON google_ads_account("loginCustomerId");
```

## How It Works Now

1. **User connects Google Ads account** via OAuth flow
2. **OAuth callback** stores both `customerId` and `loginCustomerId` (same value)
3. **API calls** use `loginCustomerId` from database instead of shared env var
4. **Each account** operates independently with its own credentials

## Benefits

- **Multi-tenant SaaS ready**: Each user connects their own account
- **No MCC required**: Individual accounts work without Manager Account structure
- **Better isolation**: Each account uses its own login context
- **Scalability**: Supports unlimited independent Google Ads accounts

## Commit Information

**Commit Hash:** `2f6dbaf`
**Branch:** `main`
**Repository:** `wakkilni-ai`

**Commit Message:**
```
feat: add loginCustomerId to Google Ads account schema

- Add loginCustomerId column to googleAdsAccount table
- Update Google Ads client to use loginCustomerId from database instead of env var
- Update OAuth callback and connect endpoint to store loginCustomerId
- Add SQL migration for existing databases

This change enables multi-tenant SaaS support where each user connects
their own Google Ads account, with each account using its own login_customer_id
(typically the same as customer_id for individual accounts).
```

## Files Changed (23 files, 3564 insertions)

### API Routes (11 files)
- `app/api/google-ads/accounts/connect/route.ts` (updated)
- `app/api/google-ads/accounts/route.ts` (new)
- `app/api/google-ads/ad-groups/route.ts` (new)
- `app/api/google-ads/campaigns/route.ts` (new)
- `app/api/google-ads/disconnect/route.ts` (new)
- `app/api/google-ads/geo/route.ts` (new)
- `app/api/google-ads/keywords/route.ts` (new)
- `app/api/google-ads/metrics/route.ts` (new)
- `app/api/google-ads/oauth/authorize/route.ts` (new)
- `app/api/google-ads/oauth/callback/route.ts` (updated)
- `app/api/google-ads/recommendations/route.ts` (new)

### Library Files (9 files)
- `lib/google-ads-auth.ts` (new)
- `lib/google-ads-client.ts` (new - updated)
- `lib/google-ads-transformer.ts` (new)
- `lib/google-ads/cache.ts` (new)
- `lib/google-ads/credentials.ts` (new)
- `lib/google-ads/hooks/useGoogleAds.ts` (new)
- `lib/google-ads/oauth-client.ts` (new)
- `lib/google-ads/service.ts` (new)
- `lib/google-ads/token-manager.ts` (new)
- `lib/google-ads/transformers.ts` (new)

### Database (2 files)
- `db/schema.ts` (updated)
- `google-ads-schema.sql` (new)

## Next Steps

1. **Run migration** on production database
2. **Test OAuth flow** with a new Google Ads account
3. **Verify API calls** work with the new `loginCustomerId` setup
4. **Remove deprecated env var** `GOOGLE_ADS_LOGIN_CUSTOMER_ID` from `.env` (optional, no longer needed)

## Notes

- `GOOGLE_ADS_LOGIN_CUSTOMER_ID` environment variable is now optional and not used in the codebase
- Each Google Ads account's `loginCustomerId` is stored in the database
- For individual accounts, `loginCustomerId` equals `customerId`
- For MCC accounts, `loginCustomerId` would be the MCC ID (if needed in future)
