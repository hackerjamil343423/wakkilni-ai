/**
 * Cache management for Meta Ads data
 * Implements tiered caching strategy to reduce API calls and improve performance
 *
 * Tier 1 - Hot Data (15 min TTL): Daily metrics (last 7 days), active campaigns
 * Tier 2 - Warm Data (1 hour TTL): Creative performance, geo data, frequency
 * Tier 3 - Cold Data (6 hour TTL): Historical snapshots, archived campaigns
 */

import { db } from "@/db";
import {
  metaAdsCachedCampaigns,
  metaAdsCachedAdSets,
  metaAdsCachedAds,
  metaAdsCachedDailyMetrics,
  metaAdsCachedCreativePerformance,
  metaAdsCachedGeoPerformance,
  metaAdsCachedFunnelData,
  metaAdsCachedFrequencyAnalysis,
} from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { nanoid } from "nanoid";

/**
 * Cache duration tiers (in minutes)
 */
export const CACHE_TIERS = {
  HOT: 15,   // Daily metrics, active campaigns
  WARM: 60,  // Creative performance, geo data
  COLD: 360, // Historical snapshots
} as const;

/**
 * Generic cache getter
 */
async function getCached<T>(
  table: any,
  accountId: string,
  additionalConditions?: any[]
): Promise<T[] | null> {
  const now = new Date();

  const conditions = [
    eq(table.accountId, accountId),
    gte(table.expiresAt, now),
  ];

  if (additionalConditions) {
    conditions.push(...additionalConditions);
  }

  const results = await db
    .select()
    .from(table)
    .where(and(...conditions));

  return results.length > 0 ? results as T[] : null;
}

/**
 * Invalidate all cache for an account
 */
export async function invalidateAccountCache(accountId: string): Promise<void> {
  // Set expiry to past for all cached data
  const pastDate = new Date(0);

  await Promise.all([
    db.update(metaAdsCachedCampaigns)
      .set({ expiresAt: pastDate })
      .where(eq(metaAdsCachedCampaigns.accountId, accountId)),
    db.update(metaAdsCachedAdSets)
      .set({ expiresAt: pastDate })
      .where(eq(metaAdsCachedAdSets.accountId, accountId)),
    db.update(metaAdsCachedAds)
      .set({ expiresAt: pastDate })
      .where(eq(metaAdsCachedAds.accountId, accountId)),
    db.update(metaAdsCachedDailyMetrics)
      .set({ expiresAt: pastDate })
      .where(eq(metaAdsCachedDailyMetrics.accountId, accountId)),
  ]);
}

/**
 * Calculate cache expiry based on tier
 */
export function calculateExpiry(tier: keyof typeof CACHE_TIERS): Date {
  return new Date(Date.now() + CACHE_TIERS[tier] * 60 * 1000);
}

/**
 * Get or fetch data with caching
 */
export async function withCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  cacheFn: (data: T) => Promise<void>,
  getCacheFn: () => Promise<T | null>
): Promise<T> {
  // Try to get from cache first
  const cached = await getCacheFn();
  if (cached) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Cache it (don't await to avoid blocking)
  cacheFn(data).catch((error) => {
    console.error(`Failed to cache data for ${cacheKey}:`, error);
  });

  return data;
}

/**
 * Cache campaigns
 */
export async function cacheCampaigns(
  accountDbId: string,
  campaigns: any[],
  dataDate: Date = new Date()
): Promise<void> {
  const expiresAt = calculateExpiry('HOT');

  const values = campaigns.map((campaign) => ({
    id: nanoid(),
    accountId: accountDbId,
    ...campaign,
    dataDate,
    expiresAt,
  }));

  await db.insert(metaAdsCachedCampaigns).values(values).onConflictDoNothing();
}

/**
 * Get cached campaigns
 */
export async function getCachedCampaigns(
  accountDbId: string
): Promise<any[] | null> {
  return getCached(metaAdsCachedCampaigns, accountDbId);
}

/**
 * Cache daily metrics
 */
export async function cacheDailyMetrics(
  accountDbId: string,
  metrics: any[]
): Promise<void> {
  const expiresAt = calculateExpiry('HOT');

  const values = metrics.map((metric) => ({
    id: nanoid(),
    accountId: accountDbId,
    date: new Date(metric.date),
    ...metric,
    expiresAt,
  }));

  await db.insert(metaAdsCachedDailyMetrics).values(values).onConflictDoNothing();
}

/**
 * Get cached daily metrics
 */
export async function getCachedDailyMetrics(
  accountDbId: string,
  startDate: Date,
  endDate: Date
): Promise<any[] | null> {
  const now = new Date();

  const results = await db
    .select()
    .from(metaAdsCachedDailyMetrics)
    .where(
      and(
        eq(metaAdsCachedDailyMetrics.accountId, accountDbId),
        gte(metaAdsCachedDailyMetrics.date, startDate),
        and(...[
          gte(metaAdsCachedDailyMetrics.expiresAt, now)
        ])
      )
    );

  return results.length > 0 ? results : null;
}
