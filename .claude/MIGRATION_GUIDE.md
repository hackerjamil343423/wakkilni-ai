# Database Migration Guide - Meta Ads Integration

## Status
✅ Migration file ready: `db/migrations/0002_lovely_master_chief.sql`
⏳ Needs manual application (Neon MCP is in read-only mode)

## Option 1: Apply via Neon Console (Recommended)

1. **Navigate to Neon Console**
   - Go to https://console.neon.tech
   - Select project: `wakkilni` (snowy-wave-66763293)
   - Select branch: `production` (br-twilight-salad-ag20yyed)

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Create a new query

3. **Copy Migration SQL**
   - Open `db/migrations/0002_lovely_master_chief.sql`
   - Copy the entire file content

4. **Execute Migration**
   - Paste the SQL into the Neon SQL Editor
   - Click "Run" to execute
   - Verify all tables are created successfully

5. **Verify Tables Created**
   Run this query to verify:
   ```sql
   SELECT tablename
   FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename LIKE '%meta_ads%'
   ORDER BY tablename;
   ```

   Expected tables:
   - meta_ads_account
   - meta_ads_account_snapshots
   - meta_ads_activity_log
   - meta_ads_cached_ad_sets
   - meta_ads_cached_ads
   - meta_ads_cached_campaigns
   - meta_ads_cached_creative_performance
   - meta_ads_cached_daily_metrics
   - meta_ads_cached_frequency_analysis
   - meta_ads_cached_funnel_data
   - meta_ads_cached_geo_performance
   - meta_ads_user_settings

## Option 2: Apply via Drizzle Kit

When the network connection is stable, run:

```bash
npx drizzle-kit push
```

This will:
- Connect to your Neon database using DATABASE_URL from .env
- Apply all pending migrations
- Create all Meta Ads tables

## Option 3: Apply via Direct Connection

If you have `psql` or another PostgreSQL client:

```bash
# Get connection string from Neon Console
# Then run:
psql "YOUR_CONNECTION_STRING" < db/migrations/0002_lovely_master_chief.sql
```

## What This Migration Creates

### Meta Ads Tables (12 tables)

1. **meta_ads_account** - OAuth tokens and account metadata
   - Stores access tokens (60-day long-lived tokens)
   - Multi-account support with unique constraint
   - Primary account designation

2. **meta_ads_cached_campaigns** - Campaign performance
   - Spend, impressions, clicks, reach, frequency
   - Leads, purchases, conversions
   - CTR, CPC, CPM, CPA, ROAS metrics

3. **meta_ads_cached_ad_sets** - Ad set metrics
   - Targeting data and budget info
   - All performance metrics

4. **meta_ads_cached_ads** - Individual ad data
   - Creative details (headline, text, CTA)
   - Thumbnail URLs
   - Full performance metrics

5. **meta_ads_cached_daily_metrics** - Time-series data
   - Daily breakdown of all metrics
   - Used for trend charts

6. **meta_ads_cached_creative_performance** - 40+ creative metrics
   - Post engagements (reactions, comments, shares)
   - Video metrics (P25, P50, P75, P95, P100)
   - Conversion tracking
   - Quality rankings

7. **meta_ads_cached_geo_performance** - Geographic breakdown
   - Country, region, city performance
   - All metrics by location

8. **meta_ads_cached_funnel_data** - Conversion funnel
   - 5-stage funnel tracking
   - Dropoff and conversion rates

9. **meta_ads_cached_frequency_analysis** - Frequency distribution
   - Frequency buckets (1, 2, 3, 4, 5+)
   - Performance by frequency

10. **meta_ads_user_settings** - Dashboard preferences
    - Default account, date range, attribution window
    - Alert thresholds, email preferences
    - Currency and timezone settings

11. **meta_ads_activity_log** - Audit trail
    - All account operations logged
    - Compliance tracking

12. **meta_ads_account_snapshots** - Historical trends
    - Daily account snapshots
    - Long-term performance tracking

### Google Ads Updates (also in this migration)

The migration also adds some missing Google Ads tables and updates:
- google_ads_account_snapshots
- google_ads_activity_log
- google_ads_cached_ad_groups
- google_ads_cached_keywords
- google_ads_cached_recommendations
- google_ads_user_settings
- Foreign key constraints
- Additional columns to google_ads_account

## After Migration

Once the migration is applied, you can immediately test the Meta Ads integration:

1. **Start your dev server**
   ```bash
   npm run dev
   ```

2. **Navigate to Meta Ads dashboard**
   ```
   http://localhost:3000/dashboard/meta-ads
   ```

3. **Connect your Meta Ads account**
   - Click "Connect Meta Ads"
   - Authorize on Meta
   - Select account(s)
   - View real-time data

## Verification Queries

After applying the migration, run these queries to verify everything is set up correctly:

```sql
-- Check Meta Ads tables exist
SELECT count(*)
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'meta_ads%';
-- Expected: 12

-- Check foreign key constraints
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name LIKE 'meta_ads%'
ORDER BY tc.table_name;

-- Check indexes and unique constraints
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename LIKE 'meta_ads%'
ORDER BY tablename, indexname;
```

## Rollback (If Needed)

If you need to rollback the migration:

```sql
-- Drop Meta Ads tables in reverse order (due to foreign keys)
DROP TABLE IF EXISTS meta_ads_user_settings CASCADE;
DROP TABLE IF EXISTS meta_ads_cached_geo_performance CASCADE;
DROP TABLE IF EXISTS meta_ads_cached_funnel_data CASCADE;
DROP TABLE IF EXISTS meta_ads_cached_frequency_analysis CASCADE;
DROP TABLE IF EXISTS meta_ads_cached_daily_metrics CASCADE;
DROP TABLE IF EXISTS meta_ads_cached_creative_performance CASCADE;
DROP TABLE IF EXISTS meta_ads_cached_campaigns CASCADE;
DROP TABLE IF EXISTS meta_ads_cached_ads CASCADE;
DROP TABLE IF EXISTS meta_ads_cached_ad_sets CASCADE;
DROP TABLE IF EXISTS meta_ads_activity_log CASCADE;
DROP TABLE IF EXISTS meta_ads_account_snapshots CASCADE;
DROP TABLE IF EXISTS meta_ads_account CASCADE;

-- Rollback Google Ads changes
ALTER TABLE google_ads_account DROP COLUMN IF EXISTS loginCustomerId;
ALTER TABLE google_ads_account DROP COLUMN IF EXISTS isPrimary;
ALTER TABLE google_ads_account DROP COLUMN IF EXISTS accountLabel;
ALTER TABLE google_ads_account DROP CONSTRAINT IF EXISTS unique_user_customer;

DROP TABLE IF EXISTS google_ads_user_settings CASCADE;
DROP TABLE IF EXISTS google_ads_cached_recommendations CASCADE;
DROP TABLE IF EXISTS google_ads_cached_keywords CASCADE;
DROP TABLE IF EXISTS google_ads_cached_geo_performance CASCADE;
DROP TABLE IF EXISTS google_ads_cached_daily_metrics CASCADE;
DROP TABLE IF EXISTS google_ads_cached_campaigns CASCADE;
DROP TABLE IF EXISTS google_ads_cached_ad_groups CASCADE;
DROP TABLE IF EXISTS google_ads_activity_log CASCADE;
DROP TABLE IF EXISTS google_ads_account_snapshots CASCADE;
```

## Need Help?

If you encounter any issues:
1. Check the Neon Console logs
2. Verify your connection string in `.env`
3. Ensure DATABASE_URL is set correctly
4. Check Neon project status (not sleeping)

---

**Migration File**: `db/migrations/0002_lovely_master_chief.sql`
**Total Statements**: 521 lines
**Estimated Time**: 1-2 minutes
**Risk Level**: Low (creates new tables, no data modification)
