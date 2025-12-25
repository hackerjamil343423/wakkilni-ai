-- ============================================================================
-- Google Ads Database Schema for Neon PostgreSQL
-- Complete schema with all tables, indexes, and triggers
-- ============================================================================

-- ============================================================================
-- 1. Google Ads Account Table (Updated)
-- Stores OAuth tokens and account metadata for connected Google Ads accounts
-- ============================================================================

CREATE TABLE IF NOT EXISTS google_ads_account (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,

  -- Google Ads Identifiers
  "customerId" TEXT NOT NULL,
  "loginCustomerId" TEXT NOT NULL,
  "accountName" TEXT NOT NULL,
  "managerCustomerId" TEXT,

  -- OAuth Tokens (FIXED: accessToken is now nullable)
  "accessToken" TEXT,
  "refreshToken" TEXT NOT NULL,
  "tokenExpiresAt" TIMESTAMP,
  scope TEXT,

  -- Account Status
  status TEXT NOT NULL DEFAULT 'active',
  "lastSyncedAt" TIMESTAMP,
  "syncError" TEXT,

  -- Metadata
  currency TEXT,
  timezone TEXT,

  -- NEW: Multi-tenant settings
  "isPrimary" BOOLEAN DEFAULT false NOT NULL,
  "accountLabel" TEXT,

  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Foreign Key
  CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE,

  -- NEW: Unique constraint to prevent duplicate connections
  CONSTRAINT unique_user_customer UNIQUE ("userId", "customerId")
);

-- Create indexes for google_ads_account
CREATE INDEX IF NOT EXISTS idx_google_ads_account_user_id ON google_ads_account("userId");
CREATE INDEX IF NOT EXISTS idx_google_ads_account_customer_id ON google_ads_account("customerId");
CREATE INDEX IF NOT EXISTS idx_google_ads_account_status ON google_ads_account(status);
CREATE INDEX IF NOT EXISTS idx_google_ads_account_user_status ON google_ads_account("userId", status);
CREATE INDEX IF NOT EXISTS idx_google_ads_account_primary ON google_ads_account("userId", "isPrimary");

-- ============================================================================
-- 2. Structured Cache Tables
-- These tables replace the JSON blob approach for better querying
-- ============================================================================

-- 2.1 Google Ads Cached Campaigns
CREATE TABLE IF NOT EXISTS google_ads_cached_campaigns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "accountId" TEXT NOT NULL,

  -- Campaign identifiers
  "campaignId" TEXT NOT NULL,
  name TEXT NOT NULL,

  -- Campaign attributes
  type TEXT NOT NULL,
  status TEXT NOT NULL,

  -- Budget & spend
  budget TEXT NOT NULL,
  spend TEXT NOT NULL,

  -- Metrics
  impressions INTEGER NOT NULL,
  clicks INTEGER NOT NULL,
  conversions TEXT NOT NULL,
  "conversionValue" TEXT NOT NULL,

  -- Performance metrics
  ctr TEXT NOT NULL,
  "avgCpc" TEXT NOT NULL,
  cpa TEXT NOT NULL,
  roas TEXT NOT NULL,

  -- Impression share (optional)
  "searchImpressionShare" TEXT,
  "searchLostIsRank" TEXT,
  "searchLostIsBudget" TEXT,

  -- Cache management
  "dataDate" TIMESTAMP NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,

  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_cached_campaigns_account FOREIGN KEY ("accountId") REFERENCES google_ads_account(id) ON DELETE CASCADE,
  CONSTRAINT unique_cache_key UNIQUE ("accountId", "campaignId", "dataDate")
);

-- Indexes for cached campaigns
CREATE INDEX IF NOT EXISTS idx_cached_campaigns_account ON google_ads_cached_campaigns("accountId");
CREATE INDEX IF NOT EXISTS idx_cached_campaigns_date ON google_ads_cached_campaigns("dataDate");
CREATE INDEX IF NOT EXISTS idx_cached_campaigns_expires ON google_ads_cached_campaigns("expiresAt");
CREATE INDEX IF NOT EXISTS idx_cached_campaigns_status ON google_ads_cached_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_cached_campaigns_account_date ON google_ads_cached_campaigns("accountId", "dataDate");

-- 2.2 Google Ads Cached Ad Groups
CREATE TABLE IF NOT EXISTS google_ads_cached_ad_groups (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "accountId" TEXT NOT NULL,

  -- Ad group identifiers
  "adGroupId" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL,

  -- Metrics
  spend TEXT NOT NULL,
  impressions INTEGER NOT NULL,
  clicks INTEGER NOT NULL,
  conversions TEXT NOT NULL,

  -- Performance metrics
  ctr TEXT NOT NULL,
  "avgCpc" TEXT NOT NULL,
  cpa TEXT NOT NULL,

  -- Cache management
  "dataDate" TIMESTAMP NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,

  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_cached_ad_groups_account FOREIGN KEY ("accountId") REFERENCES google_ads_account(id) ON DELETE CASCADE,
  CONSTRAINT unique_cache_key UNIQUE ("accountId", "adGroupId", "dataDate")
);

-- Indexes for cached ad groups
CREATE INDEX IF NOT EXISTS idx_cached_ad_groups_account ON google_ads_cached_ad_groups("accountId");
CREATE INDEX IF NOT EXISTS idx_cached_ad_groups_campaign ON google_ads_cached_ad_groups("campaignId");
CREATE INDEX IF NOT EXISTS idx_cached_ad_groups_expires ON google_ads_cached_ad_groups("expiresAt");

-- 2.3 Google Ads Cached Keywords
CREATE TABLE IF NOT EXISTS google_ads_cached_keywords (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "accountId" TEXT NOT NULL,

  -- Keyword identifiers
  "keywordId" TEXT NOT NULL,
  "adGroupId" TEXT NOT NULL,
  text TEXT NOT NULL,
  "matchType" TEXT NOT NULL,
  status TEXT NOT NULL,

  -- Quality Score components
  "qualityScore" INTEGER,
  "expectedCtr" TEXT,
  "adRelevance" TEXT,
  "landingPageExperience" TEXT,

  -- Metrics
  spend TEXT NOT NULL,
  impressions INTEGER NOT NULL,
  clicks INTEGER NOT NULL,
  conversions TEXT NOT NULL,

  -- Performance metrics
  ctr TEXT NOT NULL,
  "avgCpc" TEXT NOT NULL,
  cpa TEXT NOT NULL,

  -- Cache management
  "dataDate" TIMESTAMP NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,

  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_cached_keywords_account FOREIGN KEY ("accountId") REFERENCES google_ads_account(id) ON DELETE CASCADE,
  CONSTRAINT unique_cache_key UNIQUE ("accountId", "keywordId", "dataDate")
);

-- Indexes for cached keywords
CREATE INDEX IF NOT EXISTS idx_cached_keywords_account ON google_ads_cached_keywords("accountId");
CREATE INDEX IF NOT EXISTS idx_cached_keywords_ad_group ON google_ads_cached_keywords("adGroupId");
CREATE INDEX IF NOT EXISTS idx_cached_keywords_quality ON google_ads_cached_keywords("qualityScore");
CREATE INDEX IF NOT EXISTS idx_cached_keywords_expires ON google_ads_cached_keywords("expiresAt");

-- 2.4 Google Ads Cached Daily Metrics
CREATE TABLE IF NOT EXISTS google_ads_cached_daily_metrics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "accountId" TEXT NOT NULL,

  -- Date
  date TIMESTAMP NOT NULL,

  -- Metrics
  spend TEXT NOT NULL,
  impressions INTEGER NOT NULL,
  clicks INTEGER NOT NULL,
  conversions TEXT NOT NULL,
  "conversionValue" TEXT NOT NULL,

  -- Performance metrics
  ctr TEXT NOT NULL,
  "avgCpc" TEXT NOT NULL,
  cpa TEXT NOT NULL,
  roas TEXT NOT NULL,
  "qualityScore" INTEGER,

  -- Impression share (optional)
  "searchImpressionShare" TEXT,

  -- Cache management
  "expiresAt" TIMESTAMP NOT NULL,

  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_cached_daily_account FOREIGN KEY ("accountId") REFERENCES google_ads_account(id) ON DELETE CASCADE,
  CONSTRAINT unique_cache_key UNIQUE ("accountId", date)
);

-- Indexes for cached daily metrics
CREATE INDEX IF NOT EXISTS idx_cached_daily_account ON google_ads_cached_daily_metrics("accountId");
CREATE INDEX IF NOT EXISTS idx_cached_daily_date ON google_ads_cached_daily_metrics(date);
CREATE INDEX IF NOT EXISTS idx_cached_daily_expires ON google_ads_cached_daily_metrics("expiresAt");
CREATE INDEX IF NOT EXISTS idx_cached_daily_account_date ON google_ads_cached_daily_metrics("accountId", date);

-- 2.5 Google Ads Cached Recommendations
CREATE TABLE IF NOT EXISTS google_ads_cached_recommendations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "accountId" TEXT NOT NULL,

  -- Recommendation identifiers
  "recommendationId" TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Impact & estimates
  impact TEXT NOT NULL,
  "estimatedConversions" TEXT,
  "estimatedClicks" INTEGER,
  "estimatedSpendReduction" TEXT,

  -- Status
  applyable BOOLEAN NOT NULL,
  dismissed BOOLEAN DEFAULT false NOT NULL,
  "appliedAt" TIMESTAMP,

  -- Cache management
  "expiresAt" TIMESTAMP NOT NULL,

  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_cached_recommendations_account FOREIGN KEY ("accountId") REFERENCES google_ads_account(id) ON DELETE CASCADE,
  CONSTRAINT unique_cache_key UNIQUE ("accountId", "recommendationId")
);

-- Indexes for cached recommendations
CREATE INDEX IF NOT EXISTS idx_cached_recommendations_account ON google_ads_cached_recommendations("accountId");
CREATE INDEX IF NOT EXISTS idx_cached_recommendations_impact ON google_ads_cached_recommendations("impact");
CREATE INDEX IF NOT EXISTS idx_cached_recommendations_dismissed ON google_ads_cached_recommendations("dismissed");
CREATE INDEX IF NOT EXISTS idx_cached_recommendations_expires ON google_ads_cached_recommendations("expiresAt");

-- 2.6 Google Ads Cached Geo Performance
CREATE TABLE IF NOT EXISTS google_ads_cached_geo_performance (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "accountId" TEXT NOT NULL,

  -- Geographic identifiers
  "countryCode" TEXT NOT NULL,
  "countryName" TEXT NOT NULL,

  -- Metrics
  spend TEXT NOT NULL,
  impressions INTEGER NOT NULL,
  clicks INTEGER NOT NULL,
  conversions TEXT NOT NULL,

  -- Performance metrics
  roas TEXT NOT NULL,
  ctr TEXT NOT NULL,
  cpa TEXT NOT NULL,

  -- Cache management
  "dataDate" TIMESTAMP NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,

  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_cached_geo_account FOREIGN KEY ("accountId") REFERENCES google_ads_account(id) ON DELETE CASCADE,
  CONSTRAINT unique_cache_key UNIQUE ("accountId", "countryCode", "dataDate")
);

-- Indexes for cached geo performance
CREATE INDEX IF NOT EXISTS idx_cached_geo_account ON google_ads_cached_geo_performance("accountId");
CREATE INDEX IF NOT EXISTS idx_cached_geo_country ON google_ads_cached_geo_performance("countryCode");
CREATE INDEX IF NOT EXISTS idx_cached_geo_expires ON google_ads_cached_geo_performance("expiresAt");

-- ============================================================================
-- 3. SaaS Enhancement Tables
-- ============================================================================

-- 3.1 Google Ads User Settings
CREATE TABLE IF NOT EXISTS google_ads_user_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,

  -- Default dashboard settings
  "defaultAccountId" TEXT,
  "defaultDateRange" TEXT DEFAULT '30d' NOT NULL,

  -- Dashboard preferences (JSON for flexibility)
  "dashboardLayout" TEXT,
  "kpiSelection" TEXT,
  "chartPreferences" TEXT,

  -- Notification settings
  "emailAlertsEnabled" BOOLEAN DEFAULT true NOT NULL,
  "alertThresholds" TEXT,
  "weeklyReportEnabled" BOOLEAN DEFAULT true NOT NULL,

  -- Display settings
  "currencyDisplay" TEXT DEFAULT 'USD' NOT NULL,
  timezone TEXT DEFAULT 'UTC' NOT NULL,

  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_user_settings_user FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_settings_default_account FOREIGN KEY ("defaultAccountId") REFERENCES google_ads_account(id) ON DELETE SET NULL,
  CONSTRAINT unique_user UNIQUE ("userId")
);

-- Indexes for user settings
CREATE INDEX IF NOT EXISTS idx_user_settings_user ON google_ads_user_settings("userId");

-- 3.2 Google Ads Activity Log
CREATE TABLE IF NOT EXISTS google_ads_activity_log (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "accountId" TEXT,

  -- Action details
  action TEXT NOT NULL,
  "resourceType" TEXT,
  "resourceId" TEXT,

  -- Changes
  "oldValue" TEXT,
  "newValue" TEXT,

  -- Request context
  "ipAddress" TEXT,
  "userAgent" TEXT,

  -- Result
  success BOOLEAN NOT NULL,
  "errorMessage" TEXT,

  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_activity_log_user FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE,
  CONSTRAINT fk_activity_log_account FOREIGN KEY ("accountId") REFERENCES google_ads_account(id) ON DELETE SET NULL
);

-- Indexes for activity log
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON google_ads_activity_log("userId");
CREATE INDEX IF NOT EXISTS idx_activity_log_account ON google_ads_activity_log("accountId");
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON google_ads_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON google_ads_activity_log("createdAt");
CREATE INDEX IF NOT EXISTS idx_activity_log_user_created ON google_ads_activity_log("userId", "createdAt");

-- 3.3 Google Ads Account Snapshots
CREATE TABLE IF NOT EXISTS google_ads_account_snapshots (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "accountId" TEXT NOT NULL,

  -- Snapshot date
  "snapshotDate" TIMESTAMP NOT NULL,

  -- Aggregate metrics (account-level)
  "totalSpend" TEXT NOT NULL,
  "totalImpressions" INTEGER NOT NULL,
  "totalClicks" INTEGER NOT NULL,
  "totalConversions" TEXT NOT NULL,
  "totalConversionValue" TEXT NOT NULL,

  -- Derived metrics
  "avgCtr" TEXT NOT NULL,
  "avgCpa" TEXT NOT NULL,
  "avgRoas" TEXT NOT NULL,

  -- Campaign counts
  "activeCampaigns" INTEGER NOT NULL,
  "pausedCampaigns" INTEGER NOT NULL,

  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_snapshots_account FOREIGN KEY ("accountId") REFERENCES google_ads_account(id) ON DELETE CASCADE,
  CONSTRAINT unique_snapshot UNIQUE ("accountId", "snapshotDate")
);

-- Indexes for snapshots
CREATE INDEX IF NOT EXISTS idx_snapshots_account ON google_ads_account_snapshots("accountId");
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON google_ads_account_snapshots("snapshotDate");
CREATE INDEX IF NOT EXISTS idx_snapshots_account_date ON google_ads_account_snapshots("accountId", "snapshotDate");

-- ============================================================================
-- 4. Triggers and Functions
-- ============================================================================

-- 4.1 Auto-update updatedAt timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to google_ads_account
DROP TRIGGER IF EXISTS update_google_ads_account_updated_at ON google_ads_account;
CREATE TRIGGER update_google_ads_account_updated_at
  BEFORE UPDATE ON google_ads_account
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to google_ads_user_settings
DROP TRIGGER IF EXISTS update_google_ads_user_settings_updated_at ON google_ads_user_settings;
CREATE TRIGGER update_google_ads_user_settings_updated_at
  BEFORE UPDATE ON google_ads_user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4.2 Cleanup function for expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM google_ads_cached_campaigns WHERE "expiresAt" < NOW();
  DELETE FROM google_ads_cached_ad_groups WHERE "expiresAt" < NOW();
  DELETE FROM google_ads_cached_keywords WHERE "expiresAt" < NOW();
  DELETE FROM google_ads_cached_daily_metrics WHERE "expiresAt" < NOW();
  DELETE FROM google_ads_cached_recommendations WHERE "expiresAt" < NOW();
  DELETE FROM google_ads_cached_geo_performance WHERE "expiresAt" < NOW();

  RAISE NOTICE 'Cache cleanup completed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- 4.3 Activity log trigger for tracking account changes
CREATE OR REPLACE FUNCTION log_google_ads_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO google_ads_activity_log (
      "userId", "accountId", "action", "resourceType", "resourceId",
      "newValue", "success"
    )
    VALUES (
      NEW."userId", NEW.id, 'ACCOUNT_CONNECTED', 'google_ads_account', NEW.id,
      jsonb_build_object('customerId', NEW."customerId", 'accountName', NEW."accountName"),
      true
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log significant status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO google_ads_activity_log (
        "userId", "accountId", "action", "resourceType", "resourceId",
        "oldValue", "newValue", "success"
      )
      VALUES (
        NEW."userId", NEW.id, 'STATUS_CHANGED', 'google_ads_account', NEW.id,
        jsonb_build_object('status', OLD.status),
        jsonb_build_object('status', NEW.status),
        true
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO google_ads_activity_log (
      "userId", "action", "resourceType", "resourceId", "oldValue", "success"
    )
    VALUES (
      OLD."userId", 'ACCOUNT_DISCONNECTED', 'google_ads_account', OLD.id,
      jsonb_build_object('customerId', OLD."customerId"),
      true
    );
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply activity log trigger
DROP TRIGGER IF EXISTS log_google_ads_account_activity ON google_ads_account;
CREATE TRIGGER log_google_ads_account_activity
  AFTER INSERT OR UPDATE OR DELETE ON google_ads_account
  FOR EACH ROW
  EXECUTE FUNCTION log_google_ads_activity();

-- ============================================================================
-- 5. Migration for Existing Tables
-- Run this if you already have the google_ads_account table without the new columns
-- ============================================================================

-- Step 1: Fix accessToken nullability
-- ALTER TABLE google_ads_account ALTER COLUMN "accessToken" DROP NOT NULL;

-- Step 2: Add unique constraint (handle duplicates first)
-- WITH ranked_accounts AS (
--   SELECT
--     id,
--     "userId",
--     "customerId",
--     ROW_NUMBER() OVER (
--       PARTITION BY "userId", "customerId"
--       ORDER BY "createdAt" DESC
--     ) as rn
--   FROM google_ads_account
-- )
-- DELETE FROM google_ads_account
-- WHERE id IN (
--   SELECT id FROM ranked_accounts WHERE rn > 1
-- );

-- ALTER TABLE google_ads_account
--   ADD CONSTRAINT unique_user_customer UNIQUE ("userId", "customerId");

-- Step 3: Add new columns
-- ALTER TABLE google_ads_account
--   ADD COLUMN IF NOT EXISTS "isPrimary" boolean DEFAULT false NOT NULL,
--   ADD COLUMN IF NOT EXISTS "accountLabel" text;

-- ============================================================================
-- 6. Verification Queries
-- ============================================================================

-- Check if tables were created successfully:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'google_ads%';

-- Check indexes:
-- SELECT indexname FROM pg_indexes WHERE tablename LIKE 'google_ads%';

-- ============================================================================
-- 7. Optional: Schedule Cache Cleanup
-- Run this if pg_cron extension is available
-- ============================================================================

-- SELECT cron.schedule('cleanup-google-ads-cache', '0 2 * * *', 'SELECT cleanup_expired_cache()');
