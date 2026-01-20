CREATE TABLE "google_ads_account_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"snapshotDate" timestamp NOT NULL,
	"totalSpend" text NOT NULL,
	"totalImpressions" integer NOT NULL,
	"totalClicks" integer NOT NULL,
	"totalConversions" text NOT NULL,
	"totalConversionValue" text NOT NULL,
	"avgCtr" text NOT NULL,
	"avgCpa" text NOT NULL,
	"avgRoas" text NOT NULL,
	"activeCampaigns" integer NOT NULL,
	"pausedCampaigns" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_snapshot" UNIQUE("accountId","snapshotDate")
);
--> statement-breakpoint
CREATE TABLE "google_ads_activity_log" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"accountId" text,
	"action" text NOT NULL,
	"resourceType" text,
	"resourceId" text,
	"oldValue" text,
	"newValue" text,
	"ipAddress" text,
	"userAgent" text,
	"success" boolean NOT NULL,
	"errorMessage" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "google_ads_cached_ad_groups" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"adGroupId" text NOT NULL,
	"campaignId" text NOT NULL,
	"name" text NOT NULL,
	"status" text NOT NULL,
	"spend" text NOT NULL,
	"impressions" integer NOT NULL,
	"clicks" integer NOT NULL,
	"conversions" text NOT NULL,
	"ctr" text NOT NULL,
	"avgCpc" text NOT NULL,
	"cpa" text NOT NULL,
	"dataDate" timestamp NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_cache_key" UNIQUE("accountId","adGroupId","dataDate")
);
--> statement-breakpoint
CREATE TABLE "google_ads_cached_campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"campaignId" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"budget" text NOT NULL,
	"spend" text NOT NULL,
	"impressions" integer NOT NULL,
	"clicks" integer NOT NULL,
	"conversions" text NOT NULL,
	"conversionValue" text NOT NULL,
	"ctr" text NOT NULL,
	"avgCpc" text NOT NULL,
	"cpa" text NOT NULL,
	"roas" text NOT NULL,
	"searchImpressionShare" text,
	"searchLostIsRank" text,
	"searchLostIsBudget" text,
	"dataDate" timestamp NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_cache_key" UNIQUE("accountId","campaignId","dataDate")
);
--> statement-breakpoint
CREATE TABLE "google_ads_cached_daily_metrics" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"date" timestamp NOT NULL,
	"spend" text NOT NULL,
	"impressions" integer NOT NULL,
	"clicks" integer NOT NULL,
	"conversions" text NOT NULL,
	"conversionValue" text NOT NULL,
	"ctr" text NOT NULL,
	"avgCpc" text NOT NULL,
	"cpa" text NOT NULL,
	"roas" text NOT NULL,
	"qualityScore" integer,
	"searchImpressionShare" text,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_cache_key" UNIQUE("accountId","date")
);
--> statement-breakpoint
CREATE TABLE "google_ads_cached_geo_performance" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"countryCode" text NOT NULL,
	"countryName" text NOT NULL,
	"spend" text NOT NULL,
	"impressions" integer NOT NULL,
	"clicks" integer NOT NULL,
	"conversions" text NOT NULL,
	"roas" text NOT NULL,
	"ctr" text NOT NULL,
	"cpa" text NOT NULL,
	"dataDate" timestamp NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_cache_key" UNIQUE("accountId","countryCode","dataDate")
);
--> statement-breakpoint
CREATE TABLE "google_ads_cached_keywords" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"keywordId" text NOT NULL,
	"adGroupId" text NOT NULL,
	"text" text NOT NULL,
	"matchType" text NOT NULL,
	"status" text NOT NULL,
	"qualityScore" integer,
	"expectedCtr" text,
	"adRelevance" text,
	"landingPageExperience" text,
	"spend" text NOT NULL,
	"impressions" integer NOT NULL,
	"clicks" integer NOT NULL,
	"conversions" text NOT NULL,
	"ctr" text NOT NULL,
	"avgCpc" text NOT NULL,
	"cpa" text NOT NULL,
	"dataDate" timestamp NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_cache_key" UNIQUE("accountId","keywordId","dataDate")
);
--> statement-breakpoint
CREATE TABLE "google_ads_cached_recommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"recommendationId" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"impact" text NOT NULL,
	"estimatedConversions" text,
	"estimatedClicks" integer,
	"estimatedSpendReduction" text,
	"applyable" boolean NOT NULL,
	"dismissed" boolean DEFAULT false NOT NULL,
	"appliedAt" timestamp,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_cache_key" UNIQUE("accountId","recommendationId")
);
--> statement-breakpoint
CREATE TABLE "google_ads_user_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"defaultAccountId" text,
	"defaultDateRange" text DEFAULT '30d' NOT NULL,
	"dashboardLayout" text,
	"kpiSelection" text,
	"chartPreferences" text,
	"emailAlertsEnabled" boolean DEFAULT true NOT NULL,
	"alertThresholds" text,
	"weeklyReportEnabled" boolean DEFAULT true NOT NULL,
	"currencyDisplay" text DEFAULT 'USD' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "meta_ads_account" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"accountId" text NOT NULL,
	"accountName" text NOT NULL,
	"businessId" text,
	"accessToken" text,
	"tokenExpiresAt" timestamp,
	"scope" text,
	"status" text DEFAULT 'active' NOT NULL,
	"lastSyncedAt" timestamp,
	"syncError" text,
	"currency" text,
	"timezone" text,
	"isPrimary" boolean DEFAULT false NOT NULL,
	"accountLabel" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_user_account" UNIQUE("userId","accountId")
);
--> statement-breakpoint
CREATE TABLE "meta_ads_account_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"snapshotDate" timestamp NOT NULL,
	"totalSpend" text NOT NULL,
	"totalImpressions" integer NOT NULL,
	"totalClicks" integer NOT NULL,
	"totalReach" integer NOT NULL,
	"totalLeads" integer NOT NULL,
	"totalPurchases" integer NOT NULL,
	"totalConversions" text NOT NULL,
	"totalConversionValue" text NOT NULL,
	"avgCtr" text NOT NULL,
	"avgCpa" text NOT NULL,
	"avgRoas" text NOT NULL,
	"avgFrequency" text NOT NULL,
	"activeCampaigns" integer NOT NULL,
	"pausedCampaigns" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_meta_snapshot" UNIQUE("accountId","snapshotDate")
);
--> statement-breakpoint
CREATE TABLE "meta_ads_activity_log" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"accountId" text,
	"action" text NOT NULL,
	"resourceType" text,
	"resourceId" text,
	"oldValue" text,
	"newValue" text,
	"ipAddress" text,
	"userAgent" text,
	"success" boolean NOT NULL,
	"errorMessage" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meta_ads_cached_ad_sets" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"adSetId" text NOT NULL,
	"campaignId" text NOT NULL,
	"name" text NOT NULL,
	"status" text NOT NULL,
	"targeting" text,
	"dailyBudget" text,
	"lifetimeBudget" text,
	"spend" text NOT NULL,
	"impressions" integer NOT NULL,
	"clicks" integer NOT NULL,
	"reach" integer NOT NULL,
	"frequency" text NOT NULL,
	"leads" integer DEFAULT 0 NOT NULL,
	"purchases" integer DEFAULT 0 NOT NULL,
	"conversions" text NOT NULL,
	"ctr" text NOT NULL,
	"cpc" text NOT NULL,
	"cpm" text NOT NULL,
	"cpa" text NOT NULL,
	"dataDate" timestamp NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_meta_adset_cache" UNIQUE("accountId","adSetId","dataDate")
);
--> statement-breakpoint
CREATE TABLE "meta_ads_cached_ads" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"adId" text NOT NULL,
	"adSetId" text NOT NULL,
	"campaignId" text NOT NULL,
	"name" text NOT NULL,
	"status" text NOT NULL,
	"creativeId" text,
	"adFormat" text,
	"headline" text,
	"primaryText" text,
	"description" text,
	"callToAction" text,
	"thumbnailUrl" text,
	"spend" text NOT NULL,
	"impressions" integer NOT NULL,
	"clicks" integer NOT NULL,
	"reach" integer NOT NULL,
	"leads" integer DEFAULT 0 NOT NULL,
	"purchases" integer DEFAULT 0 NOT NULL,
	"conversions" text NOT NULL,
	"ctr" text NOT NULL,
	"cpc" text NOT NULL,
	"cpm" text NOT NULL,
	"cpa" text NOT NULL,
	"dataDate" timestamp NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_meta_ad_cache" UNIQUE("accountId","adId","dataDate")
);
--> statement-breakpoint
CREATE TABLE "meta_ads_cached_campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"campaignId" text NOT NULL,
	"name" text NOT NULL,
	"objective" text NOT NULL,
	"status" text NOT NULL,
	"dailyBudget" text,
	"lifetimeBudget" text,
	"spend" text NOT NULL,
	"impressions" integer NOT NULL,
	"clicks" integer NOT NULL,
	"reach" integer NOT NULL,
	"frequency" text NOT NULL,
	"leads" integer DEFAULT 0 NOT NULL,
	"purchases" integer DEFAULT 0 NOT NULL,
	"conversions" text NOT NULL,
	"conversionValue" text NOT NULL,
	"ctr" text NOT NULL,
	"cpc" text NOT NULL,
	"cpm" text NOT NULL,
	"cpp" text NOT NULL,
	"cpa" text NOT NULL,
	"roas" text NOT NULL,
	"dataDate" timestamp NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_meta_campaign_cache" UNIQUE("accountId","campaignId","dataDate")
);
--> statement-breakpoint
CREATE TABLE "meta_ads_cached_creative_performance" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"adId" text NOT NULL,
	"creativeId" text NOT NULL,
	"adFormat" text NOT NULL,
	"spend" text NOT NULL,
	"impressions" integer NOT NULL,
	"clicks" integer NOT NULL,
	"reach" integer NOT NULL,
	"frequency" text NOT NULL,
	"postEngagements" integer DEFAULT 0 NOT NULL,
	"postReactions" integer DEFAULT 0 NOT NULL,
	"postComments" integer DEFAULT 0 NOT NULL,
	"postShares" integer DEFAULT 0 NOT NULL,
	"postSaves" integer DEFAULT 0 NOT NULL,
	"photoViews" integer DEFAULT 0 NOT NULL,
	"linkClicks" integer DEFAULT 0 NOT NULL,
	"videoViews" integer,
	"videoViewsP25" integer,
	"videoViewsP50" integer,
	"videoViewsP75" integer,
	"videoViewsP95" integer,
	"videoViewsP100" integer,
	"videoAvgTimeWatched" text,
	"videoThruPlays" integer,
	"costPerVideoView" text,
	"costPerThruPlay" text,
	"leads" integer DEFAULT 0 NOT NULL,
	"purchases" integer DEFAULT 0 NOT NULL,
	"addToCart" integer DEFAULT 0 NOT NULL,
	"checkoutInitiated" integer DEFAULT 0 NOT NULL,
	"conversions" text NOT NULL,
	"conversionValue" text NOT NULL,
	"ctr" text NOT NULL,
	"cpc" text NOT NULL,
	"cpm" text NOT NULL,
	"cpp" text NOT NULL,
	"cpa" text NOT NULL,
	"costPerLead" text,
	"costPerPurchase" text,
	"roas" text NOT NULL,
	"relevanceScore" text,
	"qualityRanking" text,
	"engagementRateRanking" text,
	"conversionRateRanking" text,
	"dataDate" timestamp NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_meta_creative_cache" UNIQUE("accountId","adId","dataDate")
);
--> statement-breakpoint
CREATE TABLE "meta_ads_cached_daily_metrics" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"date" timestamp NOT NULL,
	"spend" text NOT NULL,
	"impressions" integer NOT NULL,
	"clicks" integer NOT NULL,
	"reach" integer NOT NULL,
	"frequency" text NOT NULL,
	"leads" integer DEFAULT 0 NOT NULL,
	"purchases" integer DEFAULT 0 NOT NULL,
	"conversions" text NOT NULL,
	"conversionValue" text NOT NULL,
	"ctr" text NOT NULL,
	"cpc" text NOT NULL,
	"cpm" text NOT NULL,
	"cpp" text NOT NULL,
	"cpa" text NOT NULL,
	"roas" text NOT NULL,
	"postEngagements" integer DEFAULT 0 NOT NULL,
	"pageEngagements" integer DEFAULT 0 NOT NULL,
	"linkClicks" integer DEFAULT 0 NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_meta_daily_cache" UNIQUE("accountId","date")
);
--> statement-breakpoint
CREATE TABLE "meta_ads_cached_frequency_analysis" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"frequencyBucket" text NOT NULL,
	"frequencyMin" integer NOT NULL,
	"frequencyMax" integer,
	"reach" integer NOT NULL,
	"impressions" integer NOT NULL,
	"spend" text NOT NULL,
	"leads" integer DEFAULT 0 NOT NULL,
	"purchases" integer DEFAULT 0 NOT NULL,
	"conversions" text NOT NULL,
	"cpa" text NOT NULL,
	"cpm" text NOT NULL,
	"roas" text NOT NULL,
	"dataDate" timestamp NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_meta_frequency_cache" UNIQUE("accountId","frequencyBucket","dataDate")
);
--> statement-breakpoint
CREATE TABLE "meta_ads_cached_funnel_data" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"stage" text NOT NULL,
	"stageOrder" integer NOT NULL,
	"count" integer NOT NULL,
	"dropoffRate" text,
	"conversionRate" text,
	"previousCount" integer,
	"changePercentage" text,
	"dataDate" timestamp NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_meta_funnel_cache" UNIQUE("accountId","stage","dataDate")
);
--> statement-breakpoint
CREATE TABLE "meta_ads_cached_geo_performance" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"countryCode" text NOT NULL,
	"countryName" text NOT NULL,
	"region" text,
	"city" text,
	"spend" text NOT NULL,
	"impressions" integer NOT NULL,
	"clicks" integer NOT NULL,
	"reach" integer NOT NULL,
	"leads" integer DEFAULT 0 NOT NULL,
	"purchases" integer DEFAULT 0 NOT NULL,
	"conversions" text NOT NULL,
	"conversionValue" text NOT NULL,
	"roas" text NOT NULL,
	"ctr" text NOT NULL,
	"cpa" text NOT NULL,
	"cpc" text NOT NULL,
	"dataDate" timestamp NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_meta_geo_cache" UNIQUE("accountId","countryCode","dataDate")
);
--> statement-breakpoint
CREATE TABLE "meta_ads_user_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"defaultAccountId" text,
	"defaultDateRange" text DEFAULT '30d' NOT NULL,
	"defaultAttributionWindow" text DEFAULT '7d_click' NOT NULL,
	"dashboardLayout" text,
	"kpiSelection" text,
	"chartPreferences" text,
	"emailAlertsEnabled" boolean DEFAULT true NOT NULL,
	"alertThresholds" text,
	"weeklyReportEnabled" boolean DEFAULT true NOT NULL,
	"currencyDisplay" text DEFAULT 'USD' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_meta_user" UNIQUE("userId")
);
--> statement-breakpoint
ALTER TABLE "google_ads_account" ALTER COLUMN "accessToken" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "google_ads_account" ALTER COLUMN "tokenExpiresAt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "google_ads_account" ALTER COLUMN "scope" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "google_ads_account" ADD COLUMN "loginCustomerId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "google_ads_account" ADD COLUMN "isPrimary" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "google_ads_account" ADD COLUMN "accountLabel" text;--> statement-breakpoint
ALTER TABLE "google_ads_account_snapshots" ADD CONSTRAINT "google_ads_account_snapshots_accountId_google_ads_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."google_ads_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_ads_activity_log" ADD CONSTRAINT "google_ads_activity_log_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_ads_activity_log" ADD CONSTRAINT "google_ads_activity_log_accountId_google_ads_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."google_ads_account"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_ads_cached_ad_groups" ADD CONSTRAINT "google_ads_cached_ad_groups_accountId_google_ads_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."google_ads_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_ads_cached_campaigns" ADD CONSTRAINT "google_ads_cached_campaigns_accountId_google_ads_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."google_ads_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_ads_cached_daily_metrics" ADD CONSTRAINT "google_ads_cached_daily_metrics_accountId_google_ads_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."google_ads_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_ads_cached_geo_performance" ADD CONSTRAINT "google_ads_cached_geo_performance_accountId_google_ads_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."google_ads_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_ads_cached_keywords" ADD CONSTRAINT "google_ads_cached_keywords_accountId_google_ads_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."google_ads_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_ads_cached_recommendations" ADD CONSTRAINT "google_ads_cached_recommendations_accountId_google_ads_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."google_ads_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_ads_user_settings" ADD CONSTRAINT "google_ads_user_settings_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_ads_user_settings" ADD CONSTRAINT "google_ads_user_settings_defaultAccountId_google_ads_account_id_fk" FOREIGN KEY ("defaultAccountId") REFERENCES "public"."google_ads_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_ads_account" ADD CONSTRAINT "meta_ads_account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_ads_account_snapshots" ADD CONSTRAINT "meta_ads_account_snapshots_accountId_meta_ads_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."meta_ads_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_ads_activity_log" ADD CONSTRAINT "meta_ads_activity_log_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_ads_activity_log" ADD CONSTRAINT "meta_ads_activity_log_accountId_meta_ads_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."meta_ads_account"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_ads_cached_ad_sets" ADD CONSTRAINT "meta_ads_cached_ad_sets_accountId_meta_ads_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."meta_ads_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_ads_cached_ads" ADD CONSTRAINT "meta_ads_cached_ads_accountId_meta_ads_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."meta_ads_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_ads_cached_campaigns" ADD CONSTRAINT "meta_ads_cached_campaigns_accountId_meta_ads_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."meta_ads_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_ads_cached_creative_performance" ADD CONSTRAINT "meta_ads_cached_creative_performance_accountId_meta_ads_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."meta_ads_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_ads_cached_daily_metrics" ADD CONSTRAINT "meta_ads_cached_daily_metrics_accountId_meta_ads_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."meta_ads_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_ads_cached_frequency_analysis" ADD CONSTRAINT "meta_ads_cached_frequency_analysis_accountId_meta_ads_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."meta_ads_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_ads_cached_funnel_data" ADD CONSTRAINT "meta_ads_cached_funnel_data_accountId_meta_ads_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."meta_ads_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_ads_cached_geo_performance" ADD CONSTRAINT "meta_ads_cached_geo_performance_accountId_meta_ads_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."meta_ads_account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_ads_user_settings" ADD CONSTRAINT "meta_ads_user_settings_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meta_ads_user_settings" ADD CONSTRAINT "meta_ads_user_settings_defaultAccountId_meta_ads_account_id_fk" FOREIGN KEY ("defaultAccountId") REFERENCES "public"."meta_ads_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_ads_account" ADD CONSTRAINT "unique_user_customer" UNIQUE("userId","customerId");