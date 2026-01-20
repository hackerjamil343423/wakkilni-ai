/**
 * Token management for Meta Ads OAuth
 *
 * Meta uses long-lived tokens (60 days) instead of refresh tokens.
 * Tokens must be exchanged for new long-lived tokens before they expire.
 */

import { db } from "@/db";
import { metaAdsAccount } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { refreshTokenIfNeeded } from "./oauth-client";

/**
 * Get access token for a user and account
 *
 * Automatically refreshes the token if it's expiring soon (< 30 days remaining).
 *
 * @param userId - User ID
 * @param accountId - Optional Meta Ad Account ID (act_xxxx format)
 * @returns Valid access token
 */
export async function getAccessToken(
  userId: string,
  accountId?: string
): Promise<string> {
  const conditions = [eq(metaAdsAccount.userId, userId)];

  if (accountId) {
    conditions.push(eq(metaAdsAccount.accountId, accountId));
  }

  const result = await db
    .select()
    .from(metaAdsAccount)
    .where(and(...conditions))
    .limit(1);

  if (!result || result.length === 0) {
    throw new Error(
      "No Meta Ads tokens found. Please connect your Meta Ads account."
    );
  }

  const tokenData = result[0];

  if (!tokenData.accessToken || !tokenData.tokenExpiresAt) {
    throw new Error(
      "Invalid token data. Please reconnect your Meta Ads account."
    );
  }

  // Check if token needs to be refreshed (< 30 days remaining)
  const expiresAt = tokenData.tokenExpiresAt.getTime();
  const now = Date.now();
  const daysUntilExpiry = (expiresAt - now) / (1000 * 60 * 60 * 24);

  // If token is still valid and has > 30 days, return it
  if (daysUntilExpiry >= 30) {
    return tokenData.accessToken;
  }

  // If token is expired or expiring soon, refresh it
  const newTokens = await refreshTokenIfNeeded(tokenData.accessToken, expiresAt);

  if (newTokens) {
    // Update database with new access token
    await db
      .update(metaAdsAccount)
      .set({
        accessToken: newTokens.access_token,
        tokenExpiresAt: new Date(newTokens.expires_at),
        updatedAt: new Date(),
      })
      .where(eq(metaAdsAccount.id, tokenData.id));

    return newTokens.access_token;
  }

  // If no refresh was needed, return existing token
  return tokenData.accessToken;
}

/**
 * Check if user has connected Meta Ads account
 *
 * @param userId - User ID
 * @returns True if user has at least one connected account
 */
export async function hasConnectedAccount(userId: string): Promise<boolean> {
  const result = await db
    .select()
    .from(metaAdsAccount)
    .where(eq(metaAdsAccount.userId, userId))
    .limit(1);

  return result.length > 0;
}

/**
 * Get all connected Meta Ad accounts for a user
 *
 * @param userId - User ID
 * @returns Array of account objects with id, accountId, accountName, status, etc.
 */
export async function getConnectedAccounts(userId: string) {
  const results = await db
    .select()
    .from(metaAdsAccount)
    .where(eq(metaAdsAccount.userId, userId));

  return results.map((account) => ({
    id: account.id,
    accountId: account.accountId,
    accountName: account.accountName,
    businessId: account.businessId,
    status: account.status,
    currency: account.currency,
    timezone: account.timezone,
    isPrimary: account.isPrimary,
    accountLabel: account.accountLabel,
    lastSyncedAt: account.lastSyncedAt,
    createdAt: account.createdAt,
  }));
}

/**
 * Get account by ID for a user (with ownership verification)
 *
 * @param userId - User ID
 * @param accountId - Meta Ad Account ID (act_xxxx format) or internal database ID
 * @returns Account data or null if not found
 */
export async function getAccount(userId: string, accountId: string) {
  const result = await db
    .select()
    .from(metaAdsAccount)
    .where(
      and(
        eq(metaAdsAccount.userId, userId),
        // Check both database ID and Meta account ID
        accountId.startsWith('act_')
          ? eq(metaAdsAccount.accountId, accountId)
          : eq(metaAdsAccount.id, accountId)
      )
    )
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const account = result[0];
  return {
    id: account.id,
    accountId: account.accountId,
    accountName: account.accountName,
    businessId: account.businessId,
    status: account.status,
    currency: account.currency,
    timezone: account.timezone,
    isPrimary: account.isPrimary,
    accountLabel: account.accountLabel,
    lastSyncedAt: account.lastSyncedAt,
    syncError: account.syncError,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}

/**
 * Get primary account for a user
 *
 * @param userId - User ID
 * @returns Primary account or first account if no primary is set
 */
export async function getPrimaryAccount(userId: string) {
  // First try to get the account marked as primary
  const primaryResult = await db
    .select()
    .from(metaAdsAccount)
    .where(
      and(
        eq(metaAdsAccount.userId, userId),
        eq(metaAdsAccount.isPrimary, true)
      )
    )
    .limit(1);

  if (primaryResult.length > 0) {
    const account = primaryResult[0];
    return {
      id: account.id,
      accountId: account.accountId,
      accountName: account.accountName,
      businessId: account.businessId,
      status: account.status,
      currency: account.currency,
      timezone: account.timezone,
      isPrimary: account.isPrimary,
      accountLabel: account.accountLabel,
      lastSyncedAt: account.lastSyncedAt,
      createdAt: account.createdAt,
    };
  }

  // If no primary account, return first account
  const anyResult = await db
    .select()
    .from(metaAdsAccount)
    .where(eq(metaAdsAccount.userId, userId))
    .limit(1);

  if (anyResult.length === 0) {
    return null;
  }

  const account = anyResult[0];
  return {
    id: account.id,
    accountId: account.accountId,
    accountName: account.accountName,
    businessId: account.businessId,
    status: account.status,
    currency: account.currency,
    timezone: account.timezone,
    isPrimary: account.isPrimary,
    accountLabel: account.accountLabel,
    lastSyncedAt: account.lastSyncedAt,
    createdAt: account.createdAt,
  };
}

/**
 * Update account's last synced timestamp
 *
 * @param accountDbId - Internal database ID
 */
export async function updateLastSynced(accountDbId: string): Promise<void> {
  await db
    .update(metaAdsAccount)
    .set({
      lastSyncedAt: new Date(),
      syncError: null, // Clear any previous errors
      updatedAt: new Date(),
    })
    .where(eq(metaAdsAccount.id, accountDbId));
}

/**
 * Update account's sync error
 *
 * @param accountDbId - Internal database ID
 * @param error - Error message
 */
export async function updateSyncError(
  accountDbId: string,
  error: string
): Promise<void> {
  await db
    .update(metaAdsAccount)
    .set({
      syncError: error,
      status: 'error',
      updatedAt: new Date(),
    })
    .where(eq(metaAdsAccount.id, accountDbId));
}
