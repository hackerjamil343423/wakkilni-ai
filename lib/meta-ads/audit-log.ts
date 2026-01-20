/**
 * Audit logging for Meta Ads operations
 * Tracks all account operations for compliance and debugging
 */

import { db } from "@/db";
import { metaAdsActivityLog } from "@/db/schema";
import { nanoid } from "nanoid";

export type AuditAction =
  | 'ACCOUNT_CONNECTED'
  | 'ACCOUNT_DISCONNECTED'
  | 'DATA_SYNCED'
  | 'SETTINGS_UPDATED'
  | 'CACHE_INVALIDATED'
  | 'TOKEN_REFRESHED';

export type ResourceType =
  | 'ACCOUNT'
  | 'CAMPAIGN'
  | 'ADSET'
  | 'AD'
  | 'SETTINGS';

export interface AuditLogEntry {
  userId: string;
  accountId?: string | null;
  action: AuditAction;
  resourceType?: ResourceType;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

/**
 * Log an audit event
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await db.insert(metaAdsActivityLog).values({
      id: nanoid(),
      userId: entry.userId,
      accountId: entry.accountId || null,
      action: entry.action,
      resourceType: entry.resourceType || null,
      resourceId: entry.resourceId || null,
      oldValue: entry.oldValue ? JSON.stringify(entry.oldValue) : null,
      newValue: entry.newValue ? JSON.stringify(entry.newValue) : null,
      ipAddress: entry.ipAddress || null,
      userAgent: entry.userAgent || null,
      success: entry.success,
      errorMessage: entry.errorMessage || null,
      createdAt: new Date(),
    });
  } catch (error) {
    // Don't throw errors from audit logging - just log them
    console.error('Failed to write audit log:', error);
  }
}

/**
 * Log account connection
 */
export async function logAccountConnected(
  userId: string,
  accountId: string,
  accountName: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAudit({
    userId,
    accountId,
    action: 'ACCOUNT_CONNECTED',
    resourceType: 'ACCOUNT',
    resourceId: accountId,
    newValue: { accountName },
    ipAddress,
    userAgent,
    success: true,
  });
}

/**
 * Log account disconnection
 */
export async function logAccountDisconnected(
  userId: string,
  accountId: string,
  accountName: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAudit({
    userId,
    accountId,
    action: 'ACCOUNT_DISCONNECTED',
    resourceType: 'ACCOUNT',
    resourceId: accountId,
    oldValue: { accountName },
    ipAddress,
    userAgent,
    success: true,
  });
}

/**
 * Log data sync
 */
export async function logDataSynced(
  userId: string,
  accountId: string,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  await logAudit({
    userId,
    accountId,
    action: 'DATA_SYNCED',
    resourceType: 'ACCOUNT',
    resourceId: accountId,
    success,
    errorMessage,
  });
}

/**
 * Log token refresh
 */
export async function logTokenRefreshed(
  userId: string,
  accountId: string,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  await logAudit({
    userId,
    accountId,
    action: 'TOKEN_REFRESHED',
    resourceType: 'ACCOUNT',
    resourceId: accountId,
    success,
    errorMessage,
  });
}
