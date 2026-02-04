import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { googleAdsAccount, googleAdsOauthSession } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { nanoid } from "nanoid";

interface ConnectAccountBody {
  refreshToken?: string;
  sessionId?: string;
  customerIds: string[];
}

interface AccountResult {
  customerId: string;
  status: "connected" | "already_connected" | "failed";
  error?: string;
}

/**
 * POST /api/google-ads/accounts/connect
 *
 * Stores selected Google Ads accounts after OAuth authorization.
 * Handles multiple accounts, skips duplicates, and provides detailed results.
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to connect accounts" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body: ConnectAccountBody = await request.json();
    const { refreshToken: directToken, sessionId, customerIds } = body;

    // Resolve refresh token: either from direct param or from session lookup
    let refreshToken: string;

    if (sessionId) {
      // Look up token from OAuth session (secure path - tokens never leave server)
      const now = new Date();
      const sessions = await db
        .select({
          refreshToken: googleAdsOauthSession.refreshToken,
          accessToken: googleAdsOauthSession.accessToken,
          tokenExpiresAt: googleAdsOauthSession.tokenExpiresAt,
          scope: googleAdsOauthSession.scope,
        })
        .from(googleAdsOauthSession)
        .where(
          and(
            eq(googleAdsOauthSession.id, sessionId),
            eq(googleAdsOauthSession.userId, session.user.id),
            gte(googleAdsOauthSession.expiresAt, now)
          )
        )
        .limit(1);

      if (sessions.length === 0) {
        return NextResponse.json(
          { error: "Bad Request", message: "Session not found or expired. Please try connecting again." },
          { status: 400 }
        );
      }

      refreshToken = sessions[0].refreshToken;
    } else if (directToken) {
      refreshToken = directToken;
    } else {
      return NextResponse.json(
        { error: "Bad Request", message: "Either sessionId or refreshToken is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: "Bad Request", message: "At least one customer ID is required" },
        { status: 400 }
      );
    }

    const results: AccountResult[] = [];
    const now = new Date();

    // Process each account
    for (const rawCustomerId of customerIds) {
      // Clean customer ID (remove dashes and spaces)
      const cleanCustomerId = rawCustomerId.replace(/[\s-]/g, "");

      // Validate customer ID format (should be 10 digits)
      if (!/^\d{10}$/.test(cleanCustomerId)) {
        results.push({
          customerId: rawCustomerId,
          status: "failed",
          error: `Invalid customer ID format: ${rawCustomerId}`,
        });
        continue;
      }

      try {
        // Check if account already exists
        const existing = await db
          .select({ id: googleAdsAccount.id })
          .from(googleAdsAccount)
          .where(
            and(
              eq(googleAdsAccount.userId, session.user.id),
              eq(googleAdsAccount.customerId, cleanCustomerId)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          results.push({
            customerId: cleanCustomerId,
            status: "already_connected",
          });
          continue;
        }

        // Insert new account
        await db.insert(googleAdsAccount).values({
          id: nanoid(),
          userId: session.user.id,
          customerId: cleanCustomerId,
          loginCustomerId: cleanCustomerId,
          accountName: `Account ${cleanCustomerId}`,
          refreshToken,
          accessToken: null,
          tokenExpiresAt: null,
          scope: "https://www.googleapis.com/auth/adwords",
          status: "active",
          lastSyncedAt: now,
          createdAt: now,
          updatedAt: now,
        });

        results.push({
          customerId: cleanCustomerId,
          status: "connected",
        });

      } catch (error) {
        console.error(`Error connecting account ${cleanCustomerId}:`, error);
        results.push({
          customerId: cleanCustomerId,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Calculate summary statistics
    const connectedCount = results.filter(r => r.status === "connected").length;
    const alreadyConnectedCount = results.filter(r => r.status === "already_connected").length;
    const failedCount = results.filter(r => r.status === "failed").length;

    // Clean up the OAuth session after successful connection
    if (sessionId) {
      db.delete(googleAdsOauthSession)
        .where(eq(googleAdsOauthSession.id, sessionId))
        .catch((err) => console.error("Failed to cleanup OAuth session:", err));
    }

    return NextResponse.json({
      success: true,
      message: `Connected ${connectedCount} account${connectedCount !== 1 ? 's' : ''}${
        alreadyConnectedCount > 0 ? `, ${alreadyConnectedCount} already connected` : ''
      }${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
      results: {
        connected: connectedCount,
        alreadyConnected: alreadyConnectedCount,
        failed: failedCount,
        total: results.length,
      },
      accounts: results,
    });

  } catch (error) {
    console.error("Error connecting Google Ads accounts:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect accounts",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
