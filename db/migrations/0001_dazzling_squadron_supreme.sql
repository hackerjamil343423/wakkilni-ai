CREATE TABLE "google_ads_account" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"customerId" text NOT NULL,
	"accountName" text NOT NULL,
	"managerCustomerId" text,
	"accessToken" text NOT NULL,
	"refreshToken" text NOT NULL,
	"tokenExpiresAt" timestamp NOT NULL,
	"scope" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"lastSyncedAt" timestamp,
	"syncError" text,
	"currency" text,
	"timezone" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "google_ads_metrics_cache" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"startDate" text NOT NULL,
	"endDate" text NOT NULL,
	"dailyMetrics" text,
	"campaigns" text,
	"adGroups" text,
	"keywords" text,
	"geoData" text,
	"cacheKey" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "google_ads_metrics_cache_cacheKey_unique" UNIQUE("cacheKey")
);
--> statement-breakpoint
ALTER TABLE "google_ads_account" ADD CONSTRAINT "google_ads_account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "google_ads_metrics_cache" ADD CONSTRAINT "google_ads_metrics_cache_accountId_google_ads_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."google_ads_account"("id") ON DELETE cascade ON UPDATE no action;