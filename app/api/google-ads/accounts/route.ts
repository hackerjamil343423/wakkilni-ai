import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { googleAdsAccount } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/google-ads/accounts
 * Fetches all connected Google Ads accounts for the logged-in user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all accounts for this user
    const accounts = await db
      .select({
        id: googleAdsAccount.id,
        customerId: googleAdsAccount.customerId,
        accountName: googleAdsAccount.accountName,
        createdAt: googleAdsAccount.createdAt,
        updatedAt: googleAdsAccount.updatedAt,
      })
      .from(googleAdsAccount)
      .where(eq(googleAdsAccount.userId, session.user.id))
      .orderBy(googleAdsAccount.createdAt);

    return NextResponse.json({
      success: true,
      accounts: accounts.map(account => ({
        id: account.id,
        customerId: account.customerId,
        accountName: account.accountName,
        status: "active", // Can be enhanced later with actual status checks
        lastSyncedAt: account.updatedAt || account.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching Google Ads accounts:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch accounts",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
