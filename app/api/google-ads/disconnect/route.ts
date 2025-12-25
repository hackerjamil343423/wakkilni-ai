import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { googleAdsAccount } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { invalidateCustomerCache } from "@/lib/google-ads/cache";

interface DisconnectBody {
  customerId?: string;
  all?: boolean;
}

/**
 * POST /api/google-ads/disconnect
 *
 * Disconnects one or all Google Ads accounts for the authenticated user.
 * Clears tokens and cached data for the disconnected accounts.
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to disconnect accounts" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body: DisconnectBody = await request.json();
    const { customerId, all } = body;

    if (!customerId && !all) {
      return NextResponse.json(
        { error: "Bad Request", message: "Either 'customerId' or 'all=true' must be provided" },
        { status: 400 }
      );
    }

    const now = new Date();

    if (all) {
      // Get all accounts before deletion (for cache invalidation)
      const accountsToDelete = await db
        .select({ customerId: googleAdsAccount.customerId })
        .from(googleAdsAccount)
        .where(eq(googleAdsAccount.userId, session.user.id));

      // Delete all accounts for this user
      await db
        .delete(googleAdsAccount)
        .where(eq(googleAdsAccount.userId, session.user.id));

      // Clear cache for all deleted accounts
      for (const account of accountsToDelete) {
        try {
          await invalidateCustomerCache(account.customerId);
        } catch (cacheError) {
          console.warn(`Failed to invalidate cache for ${account.customerId}:`, cacheError);
          // Continue even if cache invalidation fails
        }
      }

      return NextResponse.json({
        success: true,
        message: `Disconnected ${accountsToDelete.length} account${accountsToDelete.length !== 1 ? 's' : ''} successfully`,
        count: accountsToDelete.length,
      });
    }

    // Disconnect single account
    if (!customerId) {
      return NextResponse.json(
        { error: "Bad Request", message: "Customer ID is required when disconnecting a single account" },
        { status: 400 }
      );
    }

    // Clean customer ID (remove dashes)
    const cleanCustomerId = customerId.replace(/-/g, "");

    // Verify account exists and belongs to user
    const existingAccount = await db
      .select({ id: googleAdsAccount.id })
      .from(googleAdsAccount)
      .where(
        and(
          eq(googleAdsAccount.userId, session.user.id),
          eq(googleAdsAccount.customerId, cleanCustomerId)
        )
      )
      .limit(1);

    if (existingAccount.length === 0) {
      return NextResponse.json(
        { error: "Not Found", message: "Account not found or you don't have permission to disconnect it" },
        { status: 404 }
      );
    }

    // Delete the account
    await db
      .delete(googleAdsAccount)
      .where(
        and(
          eq(googleAdsAccount.userId, session.user.id),
          eq(googleAdsAccount.customerId, cleanCustomerId)
        )
      );

    // Clear cached data for this customer
    try {
      await invalidateCustomerCache(cleanCustomerId);
    } catch (cacheError) {
      console.warn(`Failed to invalidate cache for ${cleanCustomerId}:`, cacheError);
      // Continue even if cache invalidation fails
    }

    return NextResponse.json({
      success: true,
      message: "Account disconnected successfully",
      customerId: cleanCustomerId,
    });

  } catch (error) {
    console.error("Error disconnecting Google Ads account:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to disconnect account",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
