/**
 * Cache management for Google Ads data
 * Implements caching strategy to reduce API calls and improve performance
 */

import { db } from "@/db";
import {
  googleAdsCachedCampaigns as cachedCampaigns,
  googleAdsCachedAdGroups as cachedAdGroups,
  googleAdsCachedKeywords as cachedKeywords,
  googleAdsCachedDailyMetrics as cachedDailyMetrics,
  googleAdsCachedRecommendations as cachedRecommendations,
  googleAdsCachedGeoPerformance as cachedGeoPerformance,
} from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import {
  Campaign,
  AdGroup,
  Keyword,
  DailyMetrics,
  Recommendation,
  GeoPerformance,
} from "@/app/dashboard/google-ads/types";

/**
 * Default cache duration in minutes
 */
const DEFAULT_CACHE_DURATION = 60; // 1 hour
const METRICS_CACHE_DURATION = 30; // 30 minutes for metrics
const RECOMMENDATIONS_CACHE_DURATION = 120; // 2 hours for recommendations

/**
 * Cache campaigns data
 */
export async function cacheCampaigns(
  customerId: string,
  campaigns: Campaign[],
  dataDate: Date = new Date()
): Promise<void> {
  const expiresAt = new Date(Date.now() + DEFAULT_CACHE_DURATION * 60 * 1000);

  const values = campaigns.map((campaign) => ({
    customerId,
    campaignId: campaign.id,
    name: campaign.name,
    type: campaign.type,
    status: campaign.status,
    budget: campaign.budget.toString(),
    spend: campaign.spend.toString(),
    impressions: campaign.impressions,
    clicks: campaign.clicks,
    conversions: campaign.conversions.toString(),
    conversionValue: campaign.conversionValue.toString(),
    ctr: campaign.ctr.toString(),
    avgCpc: campaign.avgCpc.toString(),
    cpa: campaign.cpa.toString(),
    roas: campaign.roas.toString(),
    searchImpressionShare: campaign.searchImpressionShare?.toString(),
    searchLostIsRank: campaign.searchLostIsRank?.toString(),
    searchLostIsBudget: campaign.searchLostIsBudget?.toString(),
    dataDate,
    expiresAt,
  }));

  await db.insert(cachedCampaigns).values(values).onConflictDoNothing();
}

/**
 * Get cached campaigns
 */
export async function getCachedCampaigns(
  customerId: string,
  dataDate?: Date
): Promise<Campaign[] | null> {
  const now = new Date();

  const conditions = [
    eq(cachedCampaigns.customerId, customerId),
    gte(cachedCampaigns.expiresAt, now),
  ];

  if (dataDate) {
    conditions.push(eq(cachedCampaigns.dataDate, dataDate));
  }

  const results = await db
    .select()
    .from(cachedCampaigns)
    .where(and(...conditions));

  if (results.length === 0) return null;

  return results.map((row) => ({
    id: row.campaignId,
    name: row.name,
    type: row.type as any,
    status: row.status as any,
    budget: parseFloat(row.budget || "0"),
    spend: parseFloat(row.spend),
    impressions: row.impressions,
    clicks: row.clicks,
    conversions: parseFloat(row.conversions),
    conversionValue: parseFloat(row.conversionValue),
    ctr: parseFloat(row.ctr),
    avgCpc: parseFloat(row.avgCpc),
    cpa: parseFloat(row.cpa),
    roas: parseFloat(row.roas),
    searchImpressionShare: row.searchImpressionShare
      ? parseFloat(row.searchImpressionShare)
      : undefined,
    searchLostIsRank: row.searchLostIsRank
      ? parseFloat(row.searchLostIsRank)
      : undefined,
    searchLostIsBudget: row.searchLostIsBudget
      ? parseFloat(row.searchLostIsBudget)
      : undefined,
  }));
}

/**
 * Cache daily metrics
 */
export async function cacheDailyMetrics(
  customerId: string,
  metrics: DailyMetrics[]
): Promise<void> {
  const expiresAt = new Date(Date.now() + METRICS_CACHE_DURATION * 60 * 1000);

  const values = metrics.map((metric) => ({
    customerId,
    date: new Date(metric.date),
    spend: metric.spend.toString(),
    impressions: metric.impressions,
    clicks: metric.clicks,
    conversions: metric.conversions.toString(),
    conversionValue: metric.conversionValue.toString(),
    ctr: metric.ctr.toString(),
    avgCpc: metric.avgCpc.toString(),
    cpa: metric.cpa.toString(),
    roas: metric.roas.toString(),
    searchImpressionShare: metric.searchImpressionShare?.toString(),
    expiresAt,
  }));

  await db.insert(cachedDailyMetrics).values(values).onConflictDoNothing();
}

/**
 * Get cached daily metrics
 */
export async function getCachedDailyMetrics(
  customerId: string,
  startDate: Date,
  endDate: Date
): Promise<DailyMetrics[] | null> {
  const now = new Date();

  const results = await db
    .select()
    .from(cachedDailyMetrics)
    .where(
      and(
        eq(cachedDailyMetrics.customerId, customerId),
        gte(cachedDailyMetrics.date, startDate),
        lte(cachedDailyMetrics.date, endDate),
        gte(cachedDailyMetrics.expiresAt, now)
      )
    );

  if (results.length === 0) return null;

  return results.map((row) => ({
    date: row.date.toISOString().split("T")[0],
    spend: parseFloat(row.spend),
    impressions: row.impressions,
    clicks: row.clicks,
    conversions: parseFloat(row.conversions),
    conversionValue: parseFloat(row.conversionValue),
    ctr: parseFloat(row.ctr),
    avgCpc: parseFloat(row.avgCpc),
    cpa: parseFloat(row.cpa),
    roas: parseFloat(row.roas),
    searchImpressionShare: row.searchImpressionShare
      ? parseFloat(row.searchImpressionShare)
      : undefined,
  }));
}

/**
 * Cache recommendations
 */
export async function cacheRecommendations(
  customerId: string,
  recommendations: Recommendation[]
): Promise<void> {
  const expiresAt = new Date(
    Date.now() + RECOMMENDATIONS_CACHE_DURATION * 60 * 1000
  );

  const values = recommendations.map((rec) => ({
    customerId,
    recommendationId: rec.id,
    type: rec.type,
    title: rec.title,
    description: rec.description,
    impact: rec.impact,
    estimatedConversions: rec.estimatedConversions?.toString(),
    estimatedClicks: rec.estimatedClicks,
    applyable: rec.applyable,
    expiresAt,
  }));

  await db.insert(cachedRecommendations).values(values).onConflictDoNothing();
}

/**
 * Get cached recommendations
 */
export async function getCachedRecommendations(
  customerId: string
): Promise<Recommendation[] | null> {
  const now = new Date();

  const results = await db
    .select()
    .from(cachedRecommendations)
    .where(
      and(
        eq(cachedRecommendations.customerId, customerId),
        gte(cachedRecommendations.expiresAt, now),
        eq(cachedRecommendations.dismissed, false)
      )
    );

  if (results.length === 0) return null;

  return results.map((row) => ({
    id: row.recommendationId,
    type: row.type,
    title: row.title,
    description: row.description,
    impact: row.impact as any,
    estimatedConversions: row.estimatedConversions
      ? parseFloat(row.estimatedConversions)
      : undefined,
    estimatedClicks: row.estimatedClicks || undefined,
    applyable: row.applyable,
  }));
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<void> {
  const now = new Date();

  await Promise.all([
    db.delete(cachedCampaigns).where(lte(cachedCampaigns.expiresAt, now)),
    db.delete(cachedAdGroups).where(lte(cachedAdGroups.expiresAt, now)),
    db.delete(cachedKeywords).where(lte(cachedKeywords.expiresAt, now)),
    db.delete(cachedDailyMetrics).where(lte(cachedDailyMetrics.expiresAt, now)),
    db.delete(cachedRecommendations).where(
      lte(cachedRecommendations.expiresAt, now)
    ),
    db.delete(cachedGeoPerformance).where(
      lte(cachedGeoPerformance.expiresAt, now)
    ),
  ]);
}

/**
 * Invalidate all cache for a customer
 */
export async function invalidateCustomerCache(customerId: string): Promise<void> {
  await Promise.all([
    db.delete(cachedCampaigns).where(eq(cachedCampaigns.customerId, customerId)),
    db.delete(cachedAdGroups).where(eq(cachedAdGroups.customerId, customerId)),
    db.delete(cachedKeywords).where(eq(cachedKeywords.customerId, customerId)),
    db
      .delete(cachedDailyMetrics)
      .where(eq(cachedDailyMetrics.customerId, customerId)),
    db
      .delete(cachedRecommendations)
      .where(eq(cachedRecommendations.customerId, customerId)),
    db
      .delete(cachedGeoPerformance)
      .where(eq(cachedGeoPerformance.customerId, customerId)),
  ]);
}
