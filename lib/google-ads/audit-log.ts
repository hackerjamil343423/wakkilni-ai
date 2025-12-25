/**
 * Google Ads Activity Log API
 * Audit trail for compliance - tracks all user actions
 */

import { db } from "@/db";
import { googleAdsActivityLog } from "@/db/schema";
import { eq, and, desc, lte } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";

export interface ActivityLogEntry {
  id: string;
  userId: string;
  accountId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  oldValue?: string; // JSON
  newValue?: string; // JSON
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
}

export interface LogActivityParams {
  userId: string;
  accountId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

/**
 * Log an activity event
 */
export async function logActivity(params: LogActivityParams): Promise<ActivityLogEntry> {
  const [entry] = await db
    .insert(googleAdsActivityLog)
    .values({
      id: nanoid(),
      userId: params.userId,
      accountId: params.accountId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      oldValue: params.oldValue ? JSON.stringify(params.oldValue) : undefined,
      newValue: params.newValue ? JSON.stringify(params.newValue) : undefined,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      success: params.success,
      errorMessage: params.errorMessage,
    })
    .returning();

  return entry as ActivityLogEntry;
}

/**
 * Get request context (IP address and user agent)
 */
export async function getRequestContext(): Promise<{
  ipAddress: string | undefined;
  userAgent: string | undefined;
}> {
  const headersList = await headers();

  // Get IP address from various possible headers
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
    headersList.get("x-real-ip") ||
    headersList.get("cf-connecting-ip") ||
    undefined;

  const userAgent = headersList.get("user-agent") || undefined;

  return { ipAddress, userAgent };
}

/**
 * Log activity with automatic request context extraction
 */
export async function logActivityWithContext(
  params: Omit<LogActivityParams, "ipAddress" | "userAgent">
): Promise<ActivityLogEntry> {
  const context = await getRequestContext();

  return await logActivity({
    ...params,
    ...context,
  });
}

/**
 * Get activity log for a user
 */
export async function getUserActivityLog(
  userId: string,
  limit: number = 100,
  offset: number = 0
): Promise<ActivityLogEntry[]> {
  const entries = await db
    .select()
    .from(googleAdsActivityLog)
    .where(eq(googleAdsActivityLog.userId, userId))
    .orderBy(desc(googleAdsActivityLog.createdAt))
    .limit(limit)
    .offset(offset);

  return entries as ActivityLogEntry[];
}

/**
 * Get activity log for a specific account
 */
export async function getAccountActivityLog(
  accountId: string,
  limit: number = 100,
  offset: number = 0
): Promise<ActivityLogEntry[]> {
  const entries = await db
    .select()
    .from(googleAdsActivityLog)
    .where(eq(googleAdsActivityLog.accountId, accountId))
    .orderBy(desc(googleAdsActivityLog.createdAt))
    .limit(limit)
    .offset(offset);

  return entries as ActivityLogEntry[];
}

/**
 * Get activity log filtered by action type
 */
export async function getActivityByAction(
  userId: string,
  action: string,
  limit: number = 50
): Promise<ActivityLogEntry[]> {
  const entries = await db
    .select()
    .from(googleAdsActivityLog)
    .where(
      and(
        eq(googleAdsActivityLog.userId, userId),
        eq(googleAdsActivityLog.action, action)
      )
    )
    .orderBy(desc(googleAdsActivityLog.createdAt))
    .limit(limit);

  return entries as ActivityLogEntry[];
}

/**
 * Get failed activities (errors)
 */
export async function getFailedActivities(
  userId: string,
  limit: number = 50
): Promise<ActivityLogEntry[]> {
  const entries = await db
    .select()
    .from(googleAdsActivityLog)
    .where(
      and(
        eq(googleAdsActivityLog.userId, userId),
        eq(googleAdsActivityLog.success, false)
      )
    )
    .orderBy(desc(googleAdsActivityLog.createdAt))
    .limit(limit);

  return entries as ActivityLogEntry[];
}

/**
 * Get activity log for a specific resource
 */
export async function getResourceActivity(
  userId: string,
  resourceType: string,
  resourceId: string,
  limit: number = 50
): Promise<ActivityLogEntry[]> {
  const entries = await db
    .select()
    .from(googleAdsActivityLog)
    .where(
      and(
        eq(googleAdsActivityLog.userId, userId),
        eq(googleAdsActivityLog.resourceType, resourceType),
        eq(googleAdsActivityLog.resourceId, resourceId)
      )
    )
    .orderBy(desc(googleAdsActivityLog.createdAt))
    .limit(limit);

  return entries as ActivityLogEntry[];
}

/**
 * Clean up old activity log entries
 */
export async function cleanupOldActivityLog(
  userId: string,
  olderThanDays: number = 90
): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  await db
    .delete(googleAdsActivityLog)
    .where(
      and(
        eq(googleAdsActivityLog.userId, userId),
        lte(googleAdsActivityLog.createdAt, cutoffDate)
      )
    );
}

/**
 * Delete all activity for a user (GDPR compliance)
 */
export async function deleteUserActivity(userId: string): Promise<void> {
  await db
    .delete(googleAdsActivityLog)
    .where(eq(googleAdsActivityLog.userId, userId));
}

// ============================================================================
// Predefined Action Types
// ============================================================================

export const ActivityActions = {
  // Account actions
  ACCOUNT_CONNECTED: "ACCOUNT_CONNECTED",
  ACCOUNT_DISCONNECTED: "ACCOUNT_DISCONNECTED",
  ACCOUNT_REAUTHORIZED: "ACCOUNT_REAUTHORIZED",
  ACCOUNT_STATUS_CHANGED: "ACCOUNT_STATUS_CHANGED",

  // Data sync actions
  DATA_SYNCED: "DATA_SYNCED",
  DATA_SYNC_FAILED: "DATA_SYNC_FAILED",
  CAMPAIGNS_FETCHED: "CAMPAIGNS_FETCHED",
  KEYWORDS_FETCHED: "KEYWORDS_FETCHED",

  // Settings actions
  SETTINGS_UPDATED: "SETTINGS_UPDATED",
  DEFAULT_ACCOUNT_CHANGED: "DEFAULT_ACCOUNT_CHANGED",
  ALERT_THRESHOLDS_UPDATED: "ALERT_THRESHOLDS_UPDATED",
  DASHBOARD_LAYOUT_UPDATED: "DASHBOARD_LAYOUT_UPDATED",

  // Recommendation actions
  RECOMMENDATION_APPLIED: "RECOMMENDATION_APPLIED",
  RECOMMENDATION_DISMISSED: "RECOMMENDATION_DISMISSED",

  // Cache actions
  CACHE_CLEARED: "CACHE_CLEARED",
  CACHE_INVALIDATED: "CACHE_INVALIDATED",

  // Snapshot actions
  SNAPSHOT_CREATED: "SNAPSHOT_CREATED",
  SNAPSHOT_DELETED: "SNAPSHOT_DELETED",
} as const;

export type ActivityAction = (typeof ActivityActions)[keyof typeof ActivityActions];

// ============================================================================
// Convenience Functions for Common Actions
// ============================================================================

/**
 * Log account connection
 */
export async function logAccountConnected(
  userId: string,
  accountId: string,
  accountDetails: { customerId: string; accountName: string }
): Promise<ActivityLogEntry> {
  return await logActivityWithContext({
    userId,
    accountId,
    action: ActivityActions.ACCOUNT_CONNECTED,
    resourceType: "google_ads_account",
    resourceId: accountId,
    newValue: accountDetails,
    success: true,
  });
}

/**
 * Log account disconnection
 */
export async function logAccountDisconnected(
  userId: string,
  accountId: string,
  accountDetails: { customerId: string; accountName: string }
): Promise<ActivityLogEntry> {
  return await logActivityWithContext({
    userId,
    action: ActivityActions.ACCOUNT_DISCONNECTED,
    resourceType: "google_ads_account",
    resourceId: accountId,
    oldValue: accountDetails,
    success: true,
  });
}

/**
 * Log data sync
 */
export async function logDataSync(
  userId: string,
  accountId: string,
  success: boolean,
  errorMessage?: string
): Promise<ActivityLogEntry> {
  return await logActivityWithContext({
    userId,
    accountId,
    action: success ? ActivityActions.DATA_SYNCED : ActivityActions.DATA_SYNC_FAILED,
    resourceType: "google_ads_sync",
    success,
    errorMessage,
  });
}

/**
 * Log recommendation applied
 */
export async function logRecommendationApplied(
  userId: string,
  accountId: string,
  recommendationId: string,
  recommendationType: string
): Promise<ActivityLogEntry> {
  return await logActivityWithContext({
    userId,
    accountId,
    action: ActivityActions.RECOMMENDATION_APPLIED,
    resourceType: "recommendation",
    resourceId: recommendationId,
    newValue: { type: recommendationType },
    success: true,
  });
}

/**
 * Log settings updated
 */
export async function logSettingsUpdated(
  userId: string,
  settingType: string,
  oldValue?: unknown,
  newValue?: unknown
): Promise<ActivityLogEntry> {
  return await logActivityWithContext({
    userId,
    action: ActivityActions.SETTINGS_UPDATED,
    resourceType: settingType,
    oldValue,
    newValue,
    success: true,
  });
}

/**
 * Log error/failure
 */
export async function logError(
  userId: string,
  action: string,
  errorMessage: string,
  accountId?: string
): Promise<ActivityLogEntry> {
  return await logActivityWithContext({
    userId,
    accountId,
    action,
    success: false,
    errorMessage,
  });
}
