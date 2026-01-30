import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Better Auth Tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  country: text("country"), // ISO 3166-1 alpha-2 country code for regional provider detection
  preferredLanguage: text("preferredLanguage").notNull().default("en"), // Preferred language: "en" or "ar"
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Subscription table for Polar webhook data
export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  createdAt: timestamp("createdAt").notNull(),
  modifiedAt: timestamp("modifiedAt"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  recurringInterval: text("recurringInterval").notNull(),
  status: text("status").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd").notNull(),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").notNull().default(false),
  canceledAt: timestamp("canceledAt"),
  startedAt: timestamp("startedAt").notNull(),
  endsAt: timestamp("endsAt"),
  endedAt: timestamp("endedAt"),
  customerId: text("customerId").notNull(),
  productId: text("productId").notNull(),
  discountId: text("discountId"),
  checkoutId: text("checkoutId").notNull(),
  customerCancellationReason: text("customerCancellationReason"),
  customerCancellationComment: text("customerCancellationComment"),
  metadata: text("metadata"), // JSON string
  customFieldData: text("customFieldData"), // JSON string
  userId: text("userId").references(() => user.id),

  // Payment provider tracking (supports dual-provider system)
  paymentProvider: text("paymentProvider").notNull().default("polar"), // 'polar' | 'paymob'

  // Paymob-specific fields (nullable for backward compatibility)
  paymobIntentionId: text("paymobIntentionId"),
  paymobSubscriptionPlanId: integer("paymobSubscriptionPlanId"),
  paymobCustomerId: text("paymobCustomerId"),

  // Streampay-specific fields (nullable for backward compatibility)
  streampaySubscriptionId: text("streampaySubscriptionId"),
  streampayConsumerId: text("streampayConsumerId"),
  streampayPaymentLinkId: text("streampayPaymentLinkId"),
});

// Payment Configuration table - stores payment provider settings for admin panel
export const paymentConfig = pgTable("payment_config", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull().unique(), // 'polar' | 'paymob' | 'streampay'
  enabled: boolean("enabled").notNull().default(true),
  priority: integer("priority").notNull().default(0), // Higher = preferred
  supportedCountries: text("supported_countries"), // JSON array of country codes
  sandboxMode: boolean("sandbox_mode").notNull().default(true),
  apiPublicKey: text("api_public_key"), // API key for authentication
  apiSecretKey: text("api_secret_key"), // Encrypted secret key
  webhookUrl: text("webhook_url"), // Webhook URL for the provider
  webhookSecret: text("webhook_secret"), // Encrypted webhook secret
  webhookEvents: text("webhook_events"), // JSON array of event types to subscribe to
  lastTestedAt: timestamp("last_tested_at"), // Last connection test timestamp
  lastTestStatus: text("last_test_status"), // 'success', 'failed', 'pending'
  lastTestMessage: text("last_test_message"), // Test result message
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// ============================================================================
// Google Ads Tables
// ============================================================================

// Google Ads Account table - stores OAuth tokens and account metadata
export const googleAdsAccount = pgTable("google_ads_account", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Google Ads Identifiers
  customerId: text("customerId").notNull(), // Google Ads Customer ID (10 digits)
  loginCustomerId: text("loginCustomerId").notNull(), // Login Customer ID for API access (same as customerId for individual accounts)
  accountName: text("accountName").notNull(), // Descriptive name from Google Ads
  managerCustomerId: text("managerCustomerId"), // Optional MCC account ID

  // OAuth Tokens
  // FIXED: Made accessToken nullable to match SQL schema (tokens expire)
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken").notNull(),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  scope: text("scope"),

  // Account Status
  status: text("status").notNull().default("active"), // active, disconnected, error
  lastSyncedAt: timestamp("lastSyncedAt"), // Last successful data fetch
  syncError: text("syncError"), // Last error message if any

  // Metadata
  currency: text("currency"), // Account currency code (USD, EUR, etc.)
  timezone: text("timezone"), // Account timezone

  // NEW: Multi-tenant settings
  isPrimary: boolean("isPrimary").notNull().default(false), // User's default account
  accountLabel: text("accountLabel"), // User-defined nickname

  // Timestamps
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => ({
  // NEW: Unique constraint to prevent duplicate connections
  uniqueUserCustomer: unique("unique_user_customer").on(table.userId, table.customerId),
}));

// ============================================================================
// Structured Cache Tables
// These tables replace the JSON blob approach for better querying
// ============================================================================

// Google Ads Cached Campaigns - stores campaign snapshots for analytics
export const googleAdsCachedCampaigns = pgTable("google_ads_cached_campaigns", {
  id: text("id").primaryKey(),
  accountId: text("accountId")
    .notNull()
    .references(() => googleAdsAccount.id, { onDelete: "cascade" }),

  // Campaign identifiers
  campaignId: text("campaignId").notNull(), // Google Ads campaign ID
  name: text("name").notNull(),

  // Campaign attributes
  type: text("type").notNull(), // SEARCH, DISPLAY, VIDEO, PERFORMANCE_MAX, etc.
  status: text("status").notNull(), // ENABLED, PAUSED, REMOVED

  // Budget & spend
  budget: text("budget").notNull(), // Stored as text (decimal)
  spend: text("spend").notNull(),

  // Metrics
  impressions: integer("impressions").notNull(),
  clicks: integer("clicks").notNull(),
  conversions: text("conversions").notNull(),
  conversionValue: text("conversionValue").notNull(),

  // Performance metrics
  ctr: text("ctr").notNull(),
  avgCpc: text("avgCpc").notNull(),
  cpa: text("cpa").notNull(),
  roas: text("roas").notNull(),

  // Impression share (optional)
  searchImpressionShare: text("searchImpressionShare"),
  searchLostIsRank: text("searchLostIsRank"),
  searchLostIsBudget: text("searchLostIsBudget"),

  // Cache management
  dataDate: timestamp("dataDate").notNull(), // Snapshot date
  expiresAt: timestamp("expiresAt").notNull(),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  // Unique compound index for cache lookups
  uniqueCacheKey: unique("unique_cache_key").on(table.accountId, table.campaignId, table.dataDate),
}));

// Google Ads Cached Ad Groups - stores ad group performance data
export const googleAdsCachedAdGroups = pgTable("google_ads_cached_ad_groups", {
  id: text("id").primaryKey(),
  accountId: text("accountId")
    .notNull()
    .references(() => googleAdsAccount.id, { onDelete: "cascade" }),

  // Ad group identifiers
  adGroupId: text("adGroupId").notNull(),
  campaignId: text("campaignId").notNull(), // Parent campaign
  name: text("name").notNull(),
  status: text("status").notNull(),

  // Metrics
  spend: text("spend").notNull(),
  impressions: integer("impressions").notNull(),
  clicks: integer("clicks").notNull(),
  conversions: text("conversions").notNull(),

  // Performance metrics
  ctr: text("ctr").notNull(),
  avgCpc: text("avgCpc").notNull(),
  cpa: text("cpa").notNull(),

  // Cache management
  dataDate: timestamp("dataDate").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  uniqueCacheKey: unique("unique_cache_key").on(table.accountId, table.adGroupId, table.dataDate),
}));

// Google Ads Cached Keywords - stores keyword data with quality scores
export const googleAdsCachedKeywords = pgTable("google_ads_cached_keywords", {
  id: text("id").primaryKey(),
  accountId: text("accountId")
    .notNull()
    .references(() => googleAdsAccount.id, { onDelete: "cascade" }),

  // Keyword identifiers
  keywordId: text("keywordId").notNull(),
  adGroupId: text("adGroupId").notNull(),
  text: text("text").notNull(),
  matchType: text("matchType").notNull(), // EXACT, PHRASE, BROAD
  status: text("status").notNull(),

  // Quality Score components
  qualityScore: integer("qualityScore"),
  expectedCtr: text("expectedCtr"), // ABOVE_AVERAGE, AVERAGE, BELOW_AVERAGE
  adRelevance: text("adRelevance"),
  landingPageExperience: text("landingPageExperience"),

  // Metrics
  spend: text("spend").notNull(),
  impressions: integer("impressions").notNull(),
  clicks: integer("clicks").notNull(),
  conversions: text("conversions").notNull(),

  // Performance metrics
  ctr: text("ctr").notNull(),
  avgCpc: text("avgCpc").notNull(),
  cpa: text("cpa").notNull(),

  // Cache management
  dataDate: timestamp("dataDate").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  uniqueCacheKey: unique("unique_cache_key").on(table.accountId, table.keywordId, table.dataDate),
}));

// Google Ads Cached Daily Metrics - stores daily aggregated metrics
export const googleAdsCachedDailyMetrics = pgTable("google_ads_cached_daily_metrics", {
  id: text("id").primaryKey(),
  accountId: text("accountId")
    .notNull()
    .references(() => googleAdsAccount.id, { onDelete: "cascade" }),

  // Date
  date: timestamp("date").notNull(),

  // Metrics
  spend: text("spend").notNull(),
  impressions: integer("impressions").notNull(),
  clicks: integer("clicks").notNull(),
  conversions: text("conversions").notNull(),
  conversionValue: text("conversionValue").notNull(),

  // Performance metrics
  ctr: text("ctr").notNull(),
  avgCpc: text("avgCpc").notNull(),
  cpa: text("cpa").notNull(),
  roas: text("roas").notNull(),
  qualityScore: integer("qualityScore"),

  // Impression share (optional)
  searchImpressionShare: text("searchImpressionShare"),

  // Cache management
  expiresAt: timestamp("expiresAt").notNull(),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  uniqueCacheKey: unique("unique_cache_key").on(table.accountId, table.date),
}));

// Google Ads Cached Recommendations - stores Google Ads AI recommendations
export const googleAdsCachedRecommendations = pgTable("google_ads_cached_recommendations", {
  id: text("id").primaryKey(),
  accountId: text("accountId")
    .notNull()
    .references(() => googleAdsAccount.id, { onDelete: "cascade" }),

  // Recommendation identifiers
  recommendationId: text("recommendationId").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),

  // Impact & estimates
  impact: text("impact").notNull(), // HIGH, MEDIUM, LOW
  estimatedConversions: text("estimatedConversions"),
  estimatedClicks: integer("estimatedClicks"),
  estimatedSpendReduction: text("estimatedSpendReduction"),

  // Status
  applyable: boolean("applyable").notNull(),
  dismissed: boolean("dismissed").notNull().default(false),
  appliedAt: timestamp("appliedAt"),

  // Cache management
  expiresAt: timestamp("expiresAt").notNull(),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  uniqueCacheKey: unique("unique_cache_key").on(table.accountId, table.recommendationId),
}));

// Google Ads Cached Geo Performance - stores geographic performance data
export const googleAdsCachedGeoPerformance = pgTable("google_ads_cached_geo_performance", {
  id: text("id").primaryKey(),
  accountId: text("accountId")
    .notNull()
    .references(() => googleAdsAccount.id, { onDelete: "cascade" }),

  // Geographic identifiers
  countryCode: text("countryCode").notNull(),
  countryName: text("countryName").notNull(),

  // Metrics
  spend: text("spend").notNull(),
  impressions: integer("impressions").notNull(),
  clicks: integer("clicks").notNull(),
  conversions: text("conversions").notNull(),

  // Performance metrics
  roas: text("roas").notNull(),
  ctr: text("ctr").notNull(),
  cpa: text("cpa").notNull(),

  // Cache management
  dataDate: timestamp("dataDate").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  uniqueCacheKey: unique("unique_cache_key").on(table.accountId, table.countryCode, table.dataDate),
}));

// ============================================================================
// SaaS Enhancement Tables
// ============================================================================

// Google Ads User Settings - stores user dashboard preferences
export const googleAdsUserSettings = pgTable("google_ads_user_settings", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Default dashboard settings
  defaultAccountId: text("defaultAccountId").references(() => googleAdsAccount.id),
  defaultDateRange: text("defaultDateRange").notNull().default("30d"), // 7d, 30d, 90d, custom

  // Dashboard preferences (JSON for flexibility)
  dashboardLayout: text("dashboardLayout"), // JSON: widget positions, sizes
  kpiSelection: text("kpiSelection"), // JSON: which KPIs to show
  chartPreferences: text("chartPreferences"), // JSON: chart colors, types

  // Notification settings
  emailAlertsEnabled: boolean("emailAlertsEnabled").notNull().default(true),
  alertThresholds: text("alertThresholds"), // JSON: CPA, spend thresholds
  weeklyReportEnabled: boolean("weeklyReportEnabled").notNull().default(true),

  // Display settings
  currencyDisplay: text("currencyDisplay").notNull().default("USD"),
  timezone: text("timezone").notNull().default("UTC"),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => ({
  // One settings record per user
  uniqueUser: unique("unique_user").on(table.userId),
}));

// Google Ads Activity Log - audit trail for compliance
export const googleAdsActivityLog = pgTable("google_ads_activity_log", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("accountId")
    .references(() => googleAdsAccount.id, { onDelete: "set null" }),

  // Action details
  action: text("action").notNull(), // ACCOUNT_CONNECTED, DATA_SYNCED, SETTINGS_UPDATED, etc.
  resourceType: text("resourceType"), // CAMPAIGN, KEYWORD, ACCOUNT, etc.
  resourceId: text("resourceId"), // ID of affected resource

  // Changes
  oldValue: text("oldValue"), // JSON: previous state
  newValue: text("newValue"), // JSON: new state

  // Request context
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),

  // Result
  success: boolean("success").notNull(),
  errorMessage: text("errorMessage"),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// Google Ads Account Snapshots - historical snapshots for trend analysis
export const googleAdsAccountSnapshots = pgTable("google_ads_account_snapshots", {
  id: text("id").primaryKey(),
  accountId: text("accountId")
    .notNull()
    .references(() => googleAdsAccount.id, { onDelete: "cascade" }),

  // Snapshot date
  snapshotDate: timestamp("snapshotDate").notNull(),

  // Aggregate metrics (account-level)
  totalSpend: text("totalSpend").notNull(),
  totalImpressions: integer("totalImpressions").notNull(),
  totalClicks: integer("totalClicks").notNull(),
  totalConversions: text("totalConversions").notNull(),
  totalConversionValue: text("totalConversionValue").notNull(),

  // Derived metrics
  avgCtr: text("avgCtr").notNull(),
  avgCpa: text("avgCpa").notNull(),
  avgRoas: text("avgRoas").notNull(),

  // Campaign counts
  activeCampaigns: integer("activeCampaigns").notNull(),
  pausedCampaigns: integer("pausedCampaigns").notNull(),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  uniqueSnapshot: unique("unique_snapshot").on(table.accountId, table.snapshotDate),
}));

// ============================================================================
// Legacy Cache Table (will be dropped after migration)
// ============================================================================

// Google Ads Metrics Cache table - caches API responses to minimize API calls
// DEPRECATED: This table uses JSON blobs and will be replaced by structured cache tables
export const googleAdsMetricsCache = pgTable("google_ads_metrics_cache", {
  id: text("id").primaryKey(),
  accountId: text("accountId")
    .notNull()
    .references(() => googleAdsAccount.id, { onDelete: "cascade" }),

  // Time Range
  startDate: text("startDate").notNull(), // YYYY-MM-DD format
  endDate: text("endDate").notNull(), // YYYY-MM-DD format

  // Cached Data (JSON serialized)
  dailyMetrics: text("dailyMetrics"), // DailyMetrics[] as JSON
  campaigns: text("campaigns"), // Campaign[] as JSON
  adGroups: text("adGroups"), // AdGroup[] as JSON
  keywords: text("keywords"), // Keyword[] as JSON
  geoData: text("geoData"), // GeoPerformance[] as JSON

  // Cache Management
  cacheKey: text("cacheKey").notNull().unique(), // Hash of accountId + date range
  expiresAt: timestamp("expiresAt").notNull(), // TTL for cache invalidation

  // Timestamps
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// ============================================================================
// Meta Ads Tables
// ============================================================================

// Meta Ads Account table - stores OAuth tokens and account metadata
export const metaAdsAccount = pgTable("meta_ads_account", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Meta Ads Identifiers
  accountId: text("accountId").notNull(), // Meta Ad Account ID (act_xxxxxxxxxxxx)
  accountName: text("accountName").notNull(), // Descriptive name from Meta
  businessId: text("businessId"), // Optional Business Manager ID

  // OAuth Tokens (Meta uses long-lived tokens, 60 days)
  accessToken: text("accessToken"),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  scope: text("scope"),

  // Account Status
  status: text("status").notNull().default("active"), // active, disconnected, error
  lastSyncedAt: timestamp("lastSyncedAt"), // Last successful data fetch
  syncError: text("syncError"), // Last error message if any

  // Metadata
  currency: text("currency"), // Account currency code (USD, EUR, etc.)
  timezone: text("timezone"), // Account timezone

  // Multi-tenant settings
  isPrimary: boolean("isPrimary").notNull().default(false), // User's default account
  accountLabel: text("accountLabel"), // User-defined nickname

  // Timestamps
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => ({
  // Unique constraint to prevent duplicate connections
  uniqueUserAccount: unique("unique_user_account").on(table.userId, table.accountId),
}));

// ============================================================================
// Structured Cache Tables
// ============================================================================

// Meta Ads Cached Campaigns - stores campaign snapshots for analytics
export const metaAdsCachedCampaigns = pgTable("meta_ads_cached_campaigns", {
  id: text("id").primaryKey(),
  accountId: text("accountId")
    .notNull()
    .references(() => metaAdsAccount.id, { onDelete: "cascade" }),

  // Campaign identifiers
  campaignId: text("campaignId").notNull(), // Meta campaign ID
  name: text("name").notNull(),

  // Campaign attributes
  objective: text("objective").notNull(), // OUTCOME_LEADS, OUTCOME_SALES, OUTCOME_AWARENESS, etc.
  status: text("status").notNull(), // ACTIVE, PAUSED, DELETED

  // Budget & spend
  dailyBudget: text("dailyBudget"), // Daily budget (can be null)
  lifetimeBudget: text("lifetimeBudget"), // Lifetime budget (can be null)
  spend: text("spend").notNull(),

  // Metrics
  impressions: integer("impressions").notNull(),
  clicks: integer("clicks").notNull(),
  reach: integer("reach").notNull(),
  frequency: text("frequency").notNull(),

  // Conversion metrics
  leads: integer("leads").notNull().default(0),
  purchases: integer("purchases").notNull().default(0),
  conversions: text("conversions").notNull(),
  conversionValue: text("conversionValue").notNull(),

  // Performance metrics
  ctr: text("ctr").notNull(),
  cpc: text("cpc").notNull(),
  cpm: text("cpm").notNull(),
  cpp: text("cpp").notNull(), // Cost per 1000 people reached
  cpa: text("cpa").notNull(),
  roas: text("roas").notNull(),

  // Cache management
  dataDate: timestamp("dataDate").notNull(), // Snapshot date
  expiresAt: timestamp("expiresAt").notNull(),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  // Unique compound index for cache lookups
  uniqueCacheKey: unique("unique_meta_campaign_cache").on(table.accountId, table.campaignId, table.dataDate),
}));

// Meta Ads Cached Ad Sets - stores ad set performance data
export const metaAdsCachedAdSets = pgTable("meta_ads_cached_ad_sets", {
  id: text("id").primaryKey(),
  accountId: text("accountId")
    .notNull()
    .references(() => metaAdsAccount.id, { onDelete: "cascade" }),

  // Ad set identifiers
  adSetId: text("adSetId").notNull(),
  campaignId: text("campaignId").notNull(), // Parent campaign
  name: text("name").notNull(),
  status: text("status").notNull(),

  // Targeting
  targeting: text("targeting"), // JSON: targeting criteria

  // Budget
  dailyBudget: text("dailyBudget"),
  lifetimeBudget: text("lifetimeBudget"),

  // Metrics
  spend: text("spend").notNull(),
  impressions: integer("impressions").notNull(),
  clicks: integer("clicks").notNull(),
  reach: integer("reach").notNull(),
  frequency: text("frequency").notNull(),

  // Conversions
  leads: integer("leads").notNull().default(0),
  purchases: integer("purchases").notNull().default(0),
  conversions: text("conversions").notNull(),

  // Performance metrics
  ctr: text("ctr").notNull(),
  cpc: text("cpc").notNull(),
  cpm: text("cpm").notNull(),
  cpa: text("cpa").notNull(),

  // Cache management
  dataDate: timestamp("dataDate").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  uniqueCacheKey: unique("unique_meta_adset_cache").on(table.accountId, table.adSetId, table.dataDate),
}));

// Meta Ads Cached Ads - stores individual ad creative data
export const metaAdsCachedAds = pgTable("meta_ads_cached_ads", {
  id: text("id").primaryKey(),
  accountId: text("accountId")
    .notNull()
    .references(() => metaAdsAccount.id, { onDelete: "cascade" }),

  // Ad identifiers
  adId: text("adId").notNull(),
  adSetId: text("adSetId").notNull(),
  campaignId: text("campaignId").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull(),

  // Creative data
  creativeId: text("creativeId"),
  adFormat: text("adFormat"), // SINGLE_IMAGE, CAROUSEL, VIDEO, etc.
  headline: text("headline"),
  primaryText: text("primaryText"),
  description: text("description"),
  callToAction: text("callToAction"),
  thumbnailUrl: text("thumbnailUrl"),

  // Metrics
  spend: text("spend").notNull(),
  impressions: integer("impressions").notNull(),
  clicks: integer("clicks").notNull(),
  reach: integer("reach").notNull(),

  // Conversions
  leads: integer("leads").notNull().default(0),
  purchases: integer("purchases").notNull().default(0),
  conversions: text("conversions").notNull(),

  // Performance metrics
  ctr: text("ctr").notNull(),
  cpc: text("cpc").notNull(),
  cpm: text("cpm").notNull(),
  cpa: text("cpa").notNull(),

  // Cache management
  dataDate: timestamp("dataDate").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  uniqueCacheKey: unique("unique_meta_ad_cache").on(table.accountId, table.adId, table.dataDate),
}));

// Meta Ads Cached Daily Metrics - stores daily aggregated metrics
export const metaAdsCachedDailyMetrics = pgTable("meta_ads_cached_daily_metrics", {
  id: text("id").primaryKey(),
  accountId: text("accountId")
    .notNull()
    .references(() => metaAdsAccount.id, { onDelete: "cascade" }),

  // Date
  date: timestamp("date").notNull(),

  // Metrics
  spend: text("spend").notNull(),
  impressions: integer("impressions").notNull(),
  clicks: integer("clicks").notNull(),
  reach: integer("reach").notNull(),
  frequency: text("frequency").notNull(),

  // Conversions
  leads: integer("leads").notNull().default(0),
  purchases: integer("purchases").notNull().default(0),
  conversions: text("conversions").notNull(),
  conversionValue: text("conversionValue").notNull(),

  // Performance metrics
  ctr: text("ctr").notNull(),
  cpc: text("cpc").notNull(),
  cpm: text("cpm").notNull(),
  cpp: text("cpp").notNull(),
  cpa: text("cpa").notNull(),
  roas: text("roas").notNull(),

  // Engagement metrics
  postEngagements: integer("postEngagements").notNull().default(0),
  pageEngagements: integer("pageEngagements").notNull().default(0),
  linkClicks: integer("linkClicks").notNull().default(0),

  // Cache management
  expiresAt: timestamp("expiresAt").notNull(),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  uniqueCacheKey: unique("unique_meta_daily_cache").on(table.accountId, table.date),
}));

// Meta Ads Cached Creative Performance - stores detailed creative metrics (40+ metrics)
export const metaAdsCachedCreativePerformance = pgTable("meta_ads_cached_creative_performance", {
  id: text("id").primaryKey(),
  accountId: text("accountId")
    .notNull()
    .references(() => metaAdsAccount.id, { onDelete: "cascade" }),

  // Creative identifiers
  adId: text("adId").notNull(),
  creativeId: text("creativeId").notNull(),
  adFormat: text("adFormat").notNull(),

  // Basic metrics
  spend: text("spend").notNull(),
  impressions: integer("impressions").notNull(),
  clicks: integer("clicks").notNull(),
  reach: integer("reach").notNull(),
  frequency: text("frequency").notNull(),

  // Engagement metrics
  postEngagements: integer("postEngagements").notNull().default(0),
  postReactions: integer("postReactions").notNull().default(0),
  postComments: integer("postComments").notNull().default(0),
  postShares: integer("postShares").notNull().default(0),
  postSaves: integer("postSaves").notNull().default(0),
  photoViews: integer("photoViews").notNull().default(0),
  linkClicks: integer("linkClicks").notNull().default(0),

  // Video metrics (only for video ads)
  videoViews: integer("videoViews"),
  videoViewsP25: integer("videoViewsP25"), // 25% complete
  videoViewsP50: integer("videoViewsP50"), // 50% complete
  videoViewsP75: integer("videoViewsP75"), // 75% complete
  videoViewsP95: integer("videoViewsP95"), // 95% complete
  videoViewsP100: integer("videoViewsP100"), // 100% complete
  videoAvgTimeWatched: text("videoAvgTimeWatched"),
  videoThruPlays: integer("videoThruPlays"),
  costPerVideoView: text("costPerVideoView"),
  costPerThruPlay: text("costPerThruPlay"),

  // Conversion metrics
  leads: integer("leads").notNull().default(0),
  purchases: integer("purchases").notNull().default(0),
  addToCart: integer("addToCart").notNull().default(0),
  checkoutInitiated: integer("checkoutInitiated").notNull().default(0),
  conversions: text("conversions").notNull(),
  conversionValue: text("conversionValue").notNull(),

  // Cost metrics
  ctr: text("ctr").notNull(),
  cpc: text("cpc").notNull(),
  cpm: text("cpm").notNull(),
  cpp: text("cpp").notNull(),
  cpa: text("cpa").notNull(),
  costPerLead: text("costPerLead"),
  costPerPurchase: text("costPerPurchase"),
  roas: text("roas").notNull(),

  // Quality metrics
  relevanceScore: text("relevanceScore"),
  qualityRanking: text("qualityRanking"), // ABOVE_AVERAGE, AVERAGE, BELOW_AVERAGE
  engagementRateRanking: text("engagementRateRanking"),
  conversionRateRanking: text("conversionRateRanking"),

  // Cache management
  dataDate: timestamp("dataDate").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  uniqueCacheKey: unique("unique_meta_creative_cache").on(table.accountId, table.adId, table.dataDate),
}));

// Meta Ads Cached Geo Performance - stores geographic performance data
export const metaAdsCachedGeoPerformance = pgTable("meta_ads_cached_geo_performance", {
  id: text("id").primaryKey(),
  accountId: text("accountId")
    .notNull()
    .references(() => metaAdsAccount.id, { onDelete: "cascade" }),

  // Geographic identifiers
  countryCode: text("countryCode").notNull(),
  countryName: text("countryName").notNull(),
  region: text("region"), // Optional state/province
  city: text("city"), // Optional city

  // Metrics
  spend: text("spend").notNull(),
  impressions: integer("impressions").notNull(),
  clicks: integer("clicks").notNull(),
  reach: integer("reach").notNull(),

  // Conversions
  leads: integer("leads").notNull().default(0),
  purchases: integer("purchases").notNull().default(0),
  conversions: text("conversions").notNull(),
  conversionValue: text("conversionValue").notNull(),

  // Performance metrics
  roas: text("roas").notNull(),
  ctr: text("ctr").notNull(),
  cpa: text("cpa").notNull(),
  cpc: text("cpc").notNull(),

  // Cache management
  dataDate: timestamp("dataDate").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  uniqueCacheKey: unique("unique_meta_geo_cache").on(table.accountId, table.countryCode, table.dataDate),
}));

// Meta Ads Cached Funnel Data - stores conversion funnel stages
export const metaAdsCachedFunnelData = pgTable("meta_ads_cached_funnel_data", {
  id: text("id").primaryKey(),
  accountId: text("accountId")
    .notNull()
    .references(() => metaAdsAccount.id, { onDelete: "cascade" }),

  // Funnel stages
  stage: text("stage").notNull(), // IMPRESSIONS, CLICKS, PAGE_VIEWS, LEADS, PURCHASES
  stageOrder: integer("stageOrder").notNull(), // 1, 2, 3, 4, 5

  // Metrics
  count: integer("count").notNull(),
  dropoffRate: text("dropoffRate"), // Percentage dropped from previous stage
  conversionRate: text("conversionRate"), // Percentage from impressions

  // Comparison to previous period
  previousCount: integer("previousCount"),
  changePercentage: text("changePercentage"),

  // Cache management
  dataDate: timestamp("dataDate").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  uniqueCacheKey: unique("unique_meta_funnel_cache").on(table.accountId, table.stage, table.dataDate),
}));

// Meta Ads Cached Frequency Analysis - stores frequency distribution data
export const metaAdsCachedFrequencyAnalysis = pgTable("meta_ads_cached_frequency_analysis", {
  id: text("id").primaryKey(),
  accountId: text("accountId")
    .notNull()
    .references(() => metaAdsAccount.id, { onDelete: "cascade" }),

  // Frequency bucket
  frequencyBucket: text("frequencyBucket").notNull(), // 1, 2, 3, 4, 5+
  frequencyMin: integer("frequencyMin").notNull(),
  frequencyMax: integer("frequencyMax"), // null for "5+" bucket

  // Metrics
  reach: integer("reach").notNull(),
  impressions: integer("impressions").notNull(),
  spend: text("spend").notNull(),

  // Conversions
  leads: integer("leads").notNull().default(0),
  purchases: integer("purchases").notNull().default(0),
  conversions: text("conversions").notNull(),

  // Performance metrics
  cpa: text("cpa").notNull(),
  cpm: text("cpm").notNull(),
  roas: text("roas").notNull(),

  // Cache management
  dataDate: timestamp("dataDate").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  uniqueCacheKey: unique("unique_meta_frequency_cache").on(table.accountId, table.frequencyBucket, table.dataDate),
}));

// ============================================================================
// SaaS Enhancement Tables
// ============================================================================

// Meta Ads User Settings - stores user dashboard preferences
export const metaAdsUserSettings = pgTable("meta_ads_user_settings", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Default dashboard settings
  defaultAccountId: text("defaultAccountId").references(() => metaAdsAccount.id),
  defaultDateRange: text("defaultDateRange").notNull().default("30d"), // 7d, 30d, 90d, custom
  defaultAttributionWindow: text("defaultAttributionWindow").notNull().default("7d_click"), // 1d_click, 7d_click, 28d_click, 1d_view

  // Dashboard preferences (JSON for flexibility)
  dashboardLayout: text("dashboardLayout"), // JSON: widget positions, sizes
  kpiSelection: text("kpiSelection"), // JSON: which KPIs to show
  chartPreferences: text("chartPreferences"), // JSON: chart colors, types

  // Notification settings
  emailAlertsEnabled: boolean("emailAlertsEnabled").notNull().default(true),
  alertThresholds: text("alertThresholds"), // JSON: CPA, spend thresholds
  weeklyReportEnabled: boolean("weeklyReportEnabled").notNull().default(true),

  // Display settings
  currencyDisplay: text("currencyDisplay").notNull().default("USD"),
  timezone: text("timezone").notNull().default("UTC"),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => ({
  // One settings record per user
  uniqueUser: unique("unique_meta_user").on(table.userId),
}));

// Meta Ads Activity Log - audit trail for compliance
export const metaAdsActivityLog = pgTable("meta_ads_activity_log", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("accountId")
    .references(() => metaAdsAccount.id, { onDelete: "set null" }),

  // Action details
  action: text("action").notNull(), // ACCOUNT_CONNECTED, DATA_SYNCED, SETTINGS_UPDATED, etc.
  resourceType: text("resourceType"), // CAMPAIGN, AD, ADSET, ACCOUNT, etc.
  resourceId: text("resourceId"), // ID of affected resource

  // Changes
  oldValue: text("oldValue"), // JSON: previous state
  newValue: text("newValue"), // JSON: new state

  // Request context
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),

  // Result
  success: boolean("success").notNull(),
  errorMessage: text("errorMessage"),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// Meta Ads Account Snapshots - historical snapshots for trend analysis
export const metaAdsAccountSnapshots = pgTable("meta_ads_account_snapshots", {
  id: text("id").primaryKey(),
  accountId: text("accountId")
    .notNull()
    .references(() => metaAdsAccount.id, { onDelete: "cascade" }),

  // Snapshot date
  snapshotDate: timestamp("snapshotDate").notNull(),

  // Aggregate metrics (account-level)
  totalSpend: text("totalSpend").notNull(),
  totalImpressions: integer("totalImpressions").notNull(),
  totalClicks: integer("totalClicks").notNull(),
  totalReach: integer("totalReach").notNull(),
  totalLeads: integer("totalLeads").notNull(),
  totalPurchases: integer("totalPurchases").notNull(),
  totalConversions: text("totalConversions").notNull(),
  totalConversionValue: text("totalConversionValue").notNull(),

  // Derived metrics
  avgCtr: text("avgCtr").notNull(),
  avgCpa: text("avgCpa").notNull(),
  avgRoas: text("avgRoas").notNull(),
  avgFrequency: text("avgFrequency").notNull(),

  // Campaign counts
  activeCampaigns: integer("activeCampaigns").notNull(),
  pausedCampaigns: integer("pausedCampaigns").notNull(),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  uniqueSnapshot: unique("unique_meta_snapshot").on(table.accountId, table.snapshotDate),
}));
