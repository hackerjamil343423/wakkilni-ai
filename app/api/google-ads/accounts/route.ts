import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { googleAdsAccount } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/google-ads/accounts
 *
 * Fetches all connected Google Ads accounts for the authenticated user.
 * Returns account information including connection status and last sync time.
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to access this resource" },
        { status: 401 }
      );
    }

    // Fetch all accounts for this user, ordered by most recently connected
    const accounts = await db
      .select({
        id: googleAdsAccount.id,
        customerId: googleAdsAccount.customerId,
        loginCustomerId: googleAdsAccount.loginCustomerId,
        accountName: googleAdsAccount.accountName,
        status: googleAdsAccount.status,
        lastSyncedAt: googleAdsAccount.lastSyncedAt,
        createdAt: googleAdsAccount.createdAt,
        updatedAt: googleAdsAccount.updatedAt,
        isPrimary: googleAdsAccount.isPrimary,
      })
      .from(googleAdsAccount)
      .where(eq(googleAdsAccount.userId, session.user.id))
      .orderBy(desc(googleAdsAccount.createdAt));

    // Transform accounts for frontend response
    const transformedAccounts = accounts.map(account => ({
      id: account.id,
      customerId: account.customerId,
      loginCustomerId: account.loginCustomerId,
      accountName: account.accountName || `Account ${account.customerId}`,
      status: account.status || "active",
      isPrimary: account.isPrimary || false,
      lastSyncedAt: account.lastSyncedAt || account.updatedAt || account.createdAt,
    }));

    return NextResponse.json({
      success: true,
      accounts: transformedAccounts,
      count: transformedAccounts.length,
    });

  } catch (error) {
    console.error("Error fetching Google Ads accounts:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch accounts",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
