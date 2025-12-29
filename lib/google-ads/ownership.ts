import { db } from "@/db";
import { googleAdsAccount, googleAdsAccountSnapshots } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Verifies that the authenticated user owns the specified Google Ads account.
 * This prevents users from accessing other users' account data.
 *
 * @param userId - The authenticated user's ID
 * @param customerId - The Google Ads customer ID to check
 * @returns The account record if ownership is verified, null otherwise
 */
export async function verifyAccountOwnership(
  userId: string,
  customerId: string
) {
  const accounts = await db
    .select()
    .from(googleAdsAccount)
    .where(
      and(
        eq(googleAdsAccount.userId, userId),
        eq(googleAdsAccount.customerId, customerId)
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
 * @param customerId - The Google Ads customer ID to check
 * @returns The account record
 * @throws Error with user-friendly message if ownership not verified
 */
export async function requireAccountOwnership(
  userId: string,
  customerId: string
) {
  const account = await verifyAccountOwnership(userId, customerId);

  if (!account) {
    throw new Error(
      "You do not have access to this Google Ads account. Please connect your account first."
    );
  }

  return account;
}

/**
 * Gets all Google Ads accounts for a user.
 * Use this to populate account selectors and verify access.
 *
 * @param userId - The authenticated user's ID
 * @returns Array of user's Google Ads accounts
 */
export async function getUserAccounts(userId: string) {
  return db
    .select({
      id: googleAdsAccount.id,
      customerId: googleAdsAccount.customerId,
      accountName: googleAdsAccount.accountName,
      status: googleAdsAccount.status,
      createdAt: googleAdsAccount.createdAt,
    })
    .from(googleAdsAccount)
    .where(eq(googleAdsAccount.userId, userId));
}

/**
 * Verifies that the authenticated user owns the specified snapshot.
 * This prevents users from accessing other users' snapshot data.
 *
 * @param userId - The authenticated user's ID
 * @param accountId - The account ID (customerId) associated with the snapshot
 * @returns true if ownership verified, false otherwise
 */
export async function verifySnapshotOwnership(
  userId: string,
  accountId: string
): Promise<boolean> {
  const account = await db
    .select({ id: googleAdsAccount.id })
    .from(googleAdsAccount)
    .where(
      and(
        eq(googleAdsAccount.userId, userId),
        eq(googleAdsAccount.customerId, accountId)
      )
    )
    .limit(1);

  return account.length > 0;
}

/**
 * Verifies snapshot ownership and throws an error if not verified.
 *
 * @param userId - The authenticated user's ID
 * @param accountId - The account ID (customerId) associated with the snapshot
 * @throws Error with user-friendly message if ownership not verified
 */
export async function requireSnapshotOwnership(
  userId: string,
  accountId: string
): Promise<void> {
  const hasAccess = await verifySnapshotOwnership(userId, accountId);
  if (!hasAccess) {
    throw new Error(
      "You do not have access to snapshots for this account. Please connect your account first."
    );
  }
}
