import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { googleAdsAccount } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { invalidateCustomerCache } from "@/lib/google-ads/cache";

/**
 * POST /api/google-ads/disconnect
 * Disconnects Google Ads account and clears tokens
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { customerId, all } = body;

    if (!customerId && !all) {
      return NextResponse.json(
        { error: "Customer ID or 'all' parameter is required" },
        { status: 400 }
      );
    }

    if (all) {
      // Delete all accounts for this user
      const accounts = await db
        .select()
        .from(googleAdsAccount)
        .where(eq(googleAdsAccount.userId, session.user.id));

      await db
        .delete(googleAdsAccount)
        .where(eq(googleAdsAccount.userId, session.user.id));

      // Clear cache for all accounts
      for (const account of accounts) {
        await invalidateCustomerCache(account.customerId);
      }

      return NextResponse.json({
        success: true,
        message: "All Google Ads accounts disconnected successfully",
      });
    } else {
      // Delete single account
      await db
        .delete(googleAdsAccount)
        .where(
          and(
            eq(googleAdsAccount.userId, session.user.id),
            eq(googleAdsAccount.customerId, customerId)
          )
        );

      // Clear cached data for this customer
      await invalidateCustomerCache(customerId);

      return NextResponse.json({
        success: true,
        message: "Google Ads account disconnected successfully",
      });
    }
  } catch (error) {
    console.error("Error disconnecting Google Ads:", error);
    return NextResponse.json(
      {
        error: "Failed to disconnect account",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
