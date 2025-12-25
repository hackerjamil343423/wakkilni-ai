/**
 * Google Ads Account Snapshots API
 * Historical snapshots for trend analysis and performance tracking
 */

import { db } from "@/db";
import { googleAdsAccountSnapshots, googleAdsAccount } from "@/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface AccountSnapshot {
  id: string;
  accountId: string;
  snapshotDate: Date;
  totalSpend: string;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: string;
  totalConversionValue: string;
  avgCtr: string;
  avgCpa: string;
  avgRoas: string;
  activeCampaigns: number;
  pausedCampaigns: number;
  createdAt: Date;
}

export interface CreateSnapshotInput {
  accountId: string;
  snapshotDate: Date;
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalConversionValue: number;
  avgCtr: number;
  avgCpa: number;
  avgRoas: number;
  activeCampaigns: number;
  pausedCampaigns: number;
}

/**
 * Create a manual snapshot for an account
 */
export async function createAccountSnapshot(
  input: CreateSnapshotInput
): Promise<AccountSnapshot> {
  const [snapshot] = await db
    .insert(googleAdsAccountSnapshots)
    .values({
      id: nanoid(),
      accountId: input.accountId,
      snapshotDate: input.snapshotDate,
      totalSpend: input.totalSpend.toString(),
      totalImpressions: input.totalImpressions,
      totalClicks: input.totalClicks,
      totalConversions: input.totalConversions.toString(),
      totalConversionValue: input.totalConversionValue.toString(),
      avgCtr: input.avgCtr.toString(),
      avgCpa: input.avgCpa.toString(),
      avgRoas: input.avgRoas.toString(),
      activeCampaigns: input.activeCampaigns,
      pausedCampaigns: input.pausedCampaigns,
    })
    .returning();

  return snapshot as AccountSnapshot;
}

/**
 * Create snapshot from campaign data
 */
export async function createSnapshotFromCampaigns(
  accountId: string,
  campaigns: Array<{
    status: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    conversionValue: number;
    ctr: number;
    cpa: number;
    roas: number;
  }>,
  snapshotDate: Date = new Date()
): Promise<AccountSnapshot> {
  // Calculate aggregates
  const activeCampaigns = campaigns.filter((c) => c.status === "ENABLED").length;
  const pausedCampaigns = campaigns.filter((c) => c.status === "PAUSED").length;

  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const totalConversionValue = campaigns.reduce((sum, c) => sum + c.conversionValue, 0);

  // Calculate weighted averages
  const avgCtr = totalClicks > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
  const avgRoas = totalSpend > 0 ? totalConversionValue / totalSpend : 0;

  return await createAccountSnapshot({
    accountId,
    snapshotDate,
    totalSpend,
    totalImpressions,
    totalClicks,
    totalConversions,
    totalConversionValue,
    avgCtr,
    avgCpa,
    avgRoas,
    activeCampaigns,
    pausedCampaigns,
  });
}

/**
 * Get snapshots for an account within a date range
 */
export async function getAccountSnapshots(
  accountId: string,
  startDate: Date,
  endDate: Date
): Promise<AccountSnapshot[]> {
  const snapshots = await db
    .select()
    .from(googleAdsAccountSnapshots)
    .where(
      and(
        eq(googleAdsAccountSnapshots.accountId, accountId),
        gte(googleAdsAccountSnapshots.snapshotDate, startDate),
        lte(googleAdsAccountSnapshots.snapshotDate, endDate)
      )
    )
    .orderBy(desc(googleAdsAccountSnapshots.snapshotDate));

  return snapshots as AccountSnapshot[];
}

/**
 * Get the latest snapshot for an account
 */
export async function getLatestSnapshot(
  accountId: string
): Promise<AccountSnapshot | null> {
  const snapshots = await db
    .select()
    .from(googleAdsAccountSnapshots)
    .where(eq(googleAdsAccountSnapshots.accountId, accountId))
    .orderBy(desc(googleAdsAccountSnapshots.snapshotDate))
    .limit(1);

  return snapshots.length > 0 ? (snapshots[0] as AccountSnapshot) : null;
}

/**
 * Get snapshots by date (useful for daily reports)
 */
export async function getSnapshotsByDate(
  accountIds: string[],
  date: Date
): Promise<AccountSnapshot[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const snapshots = await db
    .select()
    .from(googleAdsAccountSnapshots)
    .where(
      and(
        // accountIds.length > 0 ? eq(...) : undefined, // TODO: Add proper array support
        gte(googleAdsAccountSnapshots.snapshotDate, startOfDay),
        lte(googleAdsAccountSnapshots.snapshotDate, endOfDay)
      )
    )
    .orderBy(desc(googleAdsAccountSnapshots.snapshotDate));

  return snapshots as AccountSnapshot[];
}

/**
 * Compare two snapshots
 */
export function compareSnapshots(
  snapshot1: AccountSnapshot,
  snapshot2: AccountSnapshot
): {
  spendChange: number;
  spendChangePercent: number;
  impressionsChange: number;
  impressionsChangePercent: number;
  clicksChange: number;
  clicksChangePercent: number;
  conversionsChange: number;
  conversionsChangePercent: number;
  ctrChange: number;
  cpaChange: number;
  roasChange: number;
} {
  const spend1 = parseFloat(snapshot1.totalSpend);
  const spend2 = parseFloat(snapshot2.totalSpend);
  const conversions1 = parseFloat(snapshot1.totalConversions);
  const conversions2 = parseFloat(snapshot2.totalConversions);
  const ctr1 = parseFloat(snapshot1.avgCtr);
  const ctr2 = parseFloat(snapshot2.avgCtr);
  const cpa1 = parseFloat(snapshot1.avgCpa);
  const cpa2 = parseFloat(snapshot2.avgCpa);
  const roas1 = parseFloat(snapshot1.avgRoas);
  const roas2 = parseFloat(snapshot2.avgRoas);

  return {
    spendChange: spend2 - spend1,
    spendChangePercent: spend1 > 0 ? ((spend2 - spend1) / spend1) * 100 : 0,
    impressionsChange: snapshot2.totalImpressions - snapshot1.totalImpressions,
    impressionsChangePercent:
      snapshot1.totalImpressions > 0
        ? ((snapshot2.totalImpressions - snapshot1.totalImpressions) / snapshot1.totalImpressions) * 100
        : 0,
    clicksChange: snapshot2.totalClicks - snapshot1.totalClicks,
    clicksChangePercent:
      snapshot1.totalClicks > 0
        ? ((snapshot2.totalClicks - snapshot1.totalClicks) / snapshot1.totalClicks) * 100
        : 0,
    conversionsChange: conversions2 - conversions1,
    conversionsChangePercent: conversions1 > 0 ? ((conversions2 - conversions1) / conversions1) * 100 : 0,
    ctrChange: ctr2 - ctr1,
    cpaChange: cpa2 - cpa1,
    roasChange: roas2 - roas1,
  };
}

/**
 * Get trend data for an account (period over period comparison)
 */
export async function getAccountTrend(
  accountId: string,
  period1Start: Date,
  period1End: Date,
  period2Start: Date,
  period2End: Date
): Promise<{
  period1Snapshots: AccountSnapshot[];
  period2Snapshots: AccountSnapshot[];
  aggregates1: {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    avgCtr: number;
    avgCpa: number;
    avgRoas: number;
  };
  aggregates2: {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    avgCtr: number;
    avgCpa: number;
    avgRoas: number;
  };
  change: {
    spendChangePercent: number;
    impressionsChangePercent: number;
    clicksChangePercent: number;
    conversionsChangePercent: number;
    ctrChange: number;
    cpaChange: number;
    roasChange: number;
  };
}> {
  const period1Snapshots = await getAccountSnapshots(accountId, period1Start, period1End);
  const period2Snapshots = await getAccountSnapshots(accountId, period2Start, period2End);

  const aggregateSnapshots = (snapshots: AccountSnapshot[]) => {
    if (snapshots.length === 0) {
      return {
        totalSpend: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        avgCtr: 0,
        avgCpa: 0,
        avgRoas: 0,
      };
    }

    const totalSpend = snapshots.reduce((sum, s) => sum + parseFloat(s.totalSpend), 0);
    const totalImpressions = snapshots.reduce((sum, s) => sum + s.totalImpressions, 0);
    const totalClicks = snapshots.reduce((sum, s) => sum + s.totalClicks, 0);
    const totalConversions = snapshots.reduce((sum, s) => sum + parseFloat(s.totalConversions), 0);
    const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
    const avgRoas = totalSpend > 0 ? (snapshots.reduce((sum, s) => sum + parseFloat(s.totalConversionValue), 0)) / totalSpend : 0;

    return {
      totalSpend,
      totalImpressions,
      totalClicks,
      totalConversions,
      avgCtr,
      avgCpa,
      avgRoas,
    };
  };

  const aggregates1 = aggregateSnapshots(period1Snapshots);
  const aggregates2 = aggregateSnapshots(period2Snapshots);

  const change = {
    spendChangePercent: aggregates2.totalSpend > 0 ? ((aggregates1.totalSpend - aggregates2.totalSpend) / aggregates2.totalSpend) * 100 : 0,
    impressionsChangePercent: aggregates2.totalImpressions > 0 ? ((aggregates1.totalImpressions - aggregates2.totalImpressions) / aggregates2.totalImpressions) * 100 : 0,
    clicksChangePercent: aggregates2.totalClicks > 0 ? ((aggregates1.totalClicks - aggregates2.totalClicks) / aggregates2.totalClicks) * 100 : 0,
    conversionsChangePercent: aggregates2.totalConversions > 0 ? ((aggregates1.totalConversions - aggregates2.totalConversions) / aggregates2.totalConversions) * 100 : 0,
    ctrChange: aggregates1.avgCtr - aggregates2.avgCtr,
    cpaChange: aggregates1.avgCpa - aggregates2.avgCpa,
    roasChange: aggregates1.avgRoas - aggregates2.avgRoas,
  };

  return {
    period1Snapshots,
    period2Snapshots,
    aggregates1,
    aggregates2,
    change,
  };
}

/**
 * Delete a snapshot
 */
export async function deleteSnapshot(snapshotId: string): Promise<void> {
  await db
    .delete(googleAdsAccountSnapshots)
    .where(eq(googleAdsAccountSnapshots.id, snapshotId));
}

/**
 * Delete old snapshots (cleanup)
 */
export async function deleteOldSnapshots(
  accountId: string,
  olderThanDays: number = 365
): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  await db
    .delete(googleAdsAccountSnapshots)
    .where(
      and(
        eq(googleAdsAccountSnapshots.accountId, accountId),
        lte(googleAdsAccountSnapshots.snapshotDate, cutoffDate)
      )
    );
}

/**
 * Delete all snapshots for an account
 */
export async function deleteAccountSnapshots(accountId: string): Promise<void> {
  await db
    .delete(googleAdsAccountSnapshots)
    .where(eq(googleAdsAccountSnapshots.accountId, accountId));
}
