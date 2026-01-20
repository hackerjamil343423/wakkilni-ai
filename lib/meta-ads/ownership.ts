import { db } from "@/db";
import { metaAdsAccount } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Verifies that the authenticated user owns the specified Meta Ads account.
 * This prevents users from accessing other users' account data.
 *
 * @param userId - The authenticated user's ID
 * @param accountId - The Meta Ad Account ID (act_xxxx format) or internal database ID
 * @returns The account record if ownership is verified, null otherwise
 */
export async function verifyAccountOwnership(
  userId: string,
  accountId: string
) {
  const accounts = await db
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

  return accounts[0] || null;
}

/**
 * Verifies ownership and throws an error if not verified.
 * Use this in API routes for cleaner error handling.
 *
 * @param userId - The authenticated user's ID
 * @param accountId - The Meta Ad Account ID (act_xxxx format) or internal database ID
 * @returns The account record
 * @throws Error with user-friendly message if ownership not verified
 */
export async function requireAccountOwnership(
  userId: string,
  accountId: string
) {
  const account = await verifyAccountOwnership(userId, accountId);

  if (!account) {
    throw new Error(
      "You do not have access to this Meta Ads account. Please connect your account first."
    );
  }

  return account;
}

/**
 * Gets all Meta Ads accounts for a user.
 * Use this to populate account selectors and verify access.
 *
 * @param userId - The authenticated user's ID
 * @returns Array of user's Meta Ads accounts
 */
export async function getUserAccounts(userId: string) {
  return db
    .select({
      id: metaAdsAccount.id,
      accountId: metaAdsAccount.accountId,
      accountName: metaAdsAccount.accountName,
      status: metaAdsAccount.status,
      currency: metaAdsAccount.currency,
      timezone: metaAdsAccount.timezone,
      isPrimary: metaAdsAccount.isPrimary,
      accountLabel: metaAdsAccount.accountLabel,
      lastSyncedAt: metaAdsAccount.lastSyncedAt,
      createdAt: metaAdsAccount.createdAt,
    })
    .from(metaAdsAccount)
    .where(eq(metaAdsAccount.userId, userId));
}

/**
 * Verifies that the authenticated user owns the specified account by internal database ID.
 * This prevents users from accessing other users' snapshot and cache data.
 *
 * @param userId - The authenticated user's ID
 * @param accountDbId - The internal database ID (not act_xxxx format)
 * @returns true if ownership verified, false otherwise
 */
export async function verifyAccountOwnershipByDbId(
  userId: string,
  accountDbId: string
): Promise<boolean> {
  const account = await db
    .select({ id: metaAdsAccount.id })
    .from(metaAdsAccount)
    .where(
      and(
        eq(metaAdsAccount.userId, userId),
        eq(metaAdsAccount.id, accountDbId)
      )
    )
    .limit(1);

  return account.length > 0;
}

/**
 * Verifies account ownership by database ID and throws an error if not verified.
 *
 * @param userId - The authenticated user's ID
 * @param accountDbId - The internal database ID
 * @throws Error with user-friendly message if ownership not verified
 */
export async function requireAccountOwnershipByDbId(
  userId: string,
  accountDbId: string
): Promise<void> {
  const hasAccess = await verifyAccountOwnershipByDbId(userId, accountDbId);
  if (!hasAccess) {
    throw new Error(
      "You do not have access to this account. Please connect your account first."
    );
  }
}
