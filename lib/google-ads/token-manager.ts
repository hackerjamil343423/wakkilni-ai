/**
 * Token management for Google Ads OAuth
 */

import { db } from "@/db";
import { googleAdsAccount } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { GoogleAdsApi } from "google-ads-api";

/**
 * Get refresh token for a user and customer
 */
export async function getRefreshToken(
  userId: string,
  customerId?: string
): Promise<string> {
  const conditions = [eq(googleAdsAccount.userId, userId)];

  if (customerId) {
    conditions.push(eq(googleAdsAccount.customerId, customerId));
  }

  const result = await db
    .select()
    .from(googleAdsAccount)
    .where(and(...conditions))
    .limit(1);

  if (!result || result.length === 0) {
    throw new Error(
      "No Google Ads tokens found. Please connect your Google Ads account."
    );
  }

  return result[0].refreshToken;
}

/**
 * Get or refresh access token
 */
export async function getAccessToken(
  userId: string,
  customerId?: string
): Promise<string> {
  const conditions = [eq(googleAdsAccount.userId, userId)];

  if (customerId) {
    conditions.push(eq(googleAdsAccount.customerId, customerId));
  }

  const result = await db
    .select()
    .from(googleAdsAccount)
    .where(and(...conditions))
    .limit(1);

  if (!result || result.length === 0) {
    throw new Error(
      "No Google Ads tokens found. Please connect your Google Ads account."
    );
  }

  const tokenData = result[0];

  // Check if access token is still valid
  if (
    tokenData.accessToken &&
    tokenData.accessTokenExpiresAt &&
    tokenData.accessTokenExpiresAt > new Date()
  ) {
    return tokenData.accessToken;
  }

  // Refresh the access token
  const client = new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
  });

  const newTokens = await client.refreshAccessToken(tokenData.refreshToken);

  // Update database with new access token
  await db
    .update(googleAdsAccount)
    .set({
      accessToken: newTokens.access_token,
      accessTokenExpiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
      updatedAt: new Date(),
    })
    .where(eq(googleAdsAccount.id, tokenData.id));

  return newTokens.access_token;
}

/**
 * Check if user has connected Google Ads account
 */
export async function hasConnectedAccount(userId: string): Promise<boolean> {
  const result = await db
    .select()
    .from(googleAdsAccount)
    .where(eq(googleAdsAccount.userId, userId))
    .limit(1);

  return result.length > 0;
}

/**
 * Get all connected customer IDs for a user
 */
export async function getConnectedCustomers(
  userId: string
): Promise<string[]> {
  const results = await db
    .select()
    .from(googleAdsAccount)
    .where(eq(googleAdsAccount.userId, userId));

  return results.map((r) => r.customerId);
}
