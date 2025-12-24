import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Better Auth Tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
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
});

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
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken").notNull(),
  tokenExpiresAt: timestamp("tokenExpiresAt").notNull(),
  scope: text("scope").notNull(),

  // Account Status
  status: text("status").notNull().default("active"), // active, disconnected, error
  lastSyncedAt: timestamp("lastSyncedAt"), // Last successful data fetch
  syncError: text("syncError"), // Last error message if any

  // Metadata
  currency: text("currency"), // Account currency code (USD, EUR, etc.)
  timezone: text("timezone"), // Account timezone

  // Timestamps
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Google Ads Metrics Cache table - caches API responses to minimize API calls
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
