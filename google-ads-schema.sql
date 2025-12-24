-- Google Ads Database Schema for Neon PostgreSQL
-- Run this SQL in your Neon database to set up all Google Ads tables

-- ============================================================================
-- 1. Google Ads Account Table
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

  -- OAuth Tokens
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

  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Foreign Key (assumes user table exists)
  CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES "user"(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_google_ads_account_user_id ON google_ads_account("userId");
CREATE INDEX IF NOT EXISTS idx_google_ads_account_customer_id ON google_ads_account("customerId");
CREATE INDEX IF NOT EXISTS idx_google_ads_account_status ON google_ads_account(status);

-- ============================================================================
-- 2. Google Ads Metrics Cache Table
-- Caches API responses to minimize API calls and improve performance
-- ============================================================================
CREATE TABLE IF NOT EXISTS google_ads_metrics_cache (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "accountId" TEXT NOT NULL,

  -- Time Range
  "startDate" TEXT NOT NULL,
  "endDate" TEXT NOT NULL,

  -- Cached Data (JSON serialized)
  "dailyMetrics" TEXT,
  campaigns TEXT,
  "adGroups" TEXT,
  keywords TEXT,
  "geoData" TEXT,

  -- Cache Management
  "cacheKey" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP NOT NULL,

  -- Timestamps
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Foreign Key
  CONSTRAINT fk_account FOREIGN KEY ("accountId") REFERENCES google_ads_account(id) ON DELETE CASCADE
);

-- Create indexes for cache lookups
CREATE INDEX IF NOT EXISTS idx_google_ads_cache_account ON google_ads_metrics_cache("accountId");
CREATE INDEX IF NOT EXISTS idx_google_ads_cache_key ON google_ads_metrics_cache("cacheKey");
CREATE INDEX IF NOT EXISTS idx_google_ads_cache_expires ON google_ads_metrics_cache("expiresAt");

-- ============================================================================
-- 3. Trigger to Auto-Update updatedAt timestamp
-- ============================================================================
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

-- Apply trigger to google_ads_metrics_cache
DROP TRIGGER IF EXISTS update_google_ads_cache_updated_at ON google_ads_metrics_cache;
CREATE TRIGGER update_google_ads_cache_updated_at
  BEFORE UPDATE ON google_ads_metrics_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. Cleanup Function for Expired Cache
-- Run this periodically to clean up expired cache entries
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM google_ads_metrics_cache
  WHERE "expiresAt" < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a cron job to run cleanup daily (if pg_cron extension is available)
-- SELECT cron.schedule('cleanup-google-ads-cache', '0 2 * * *', 'SELECT cleanup_expired_cache()');

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- Check if tables were created successfully:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'google_ads%';

-- Check indexes:
-- SELECT indexname FROM pg_indexes WHERE tablename LIKE 'google_ads%';

-- ============================================================================
-- 5. Migration for Existing Tables
-- Run this if you already have the google_ads_account table without loginCustomerId
-- ============================================================================
-- Add loginCustomerId column to existing table
ALTER TABLE google_ads_account ADD COLUMN IF NOT EXISTS "loginCustomerId" TEXT NOT NULL DEFAULT "customerId";

-- Create index for loginCustomerId
CREATE INDEX IF NOT EXISTS idx_google_ads_account_login_customer_id ON google_ads_account("loginCustomerId");
