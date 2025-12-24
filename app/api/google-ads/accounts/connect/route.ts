import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { googleAdsAccount } from "@/db/schema";
import { refreshAccessToken } from "@/lib/google-ads/oauth-client";
import { eq, and } from "drizzle-orm";
import { GoogleAdsApi } from "google-ads-api";

/**
 * POST /api/google-ads/accounts/connect
 * Stores selected Google Ads accounts after OAuth authorization
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
    const { refreshToken, customerIds } = body;

    if (!refreshToken || !customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { error: "Refresh token and customer IDs are required" },
        { status: 400 }
      );
    }

    // Initialize Google Ads API client
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    });

    const connectedAccounts = [];

    // Store each selected account
    for (const customerId of customerIds) {
      // Check if account already exists for this user
      const existing = await db
        .select()
        .from(googleAdsAccount)
        .where(
          and(
            eq(googleAdsAccount.userId, session.user.id),
            eq(googleAdsAccount.customerId, customerId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Account already connected, skip
        connectedAccounts.push({
          customerId,
          status: "already_connected",
        });
        continue;
      }

      try {
        // Get access token for this account using OAuth2Client
        const tokens = await refreshAccessToken(refreshToken);

        // Insert new account
        const cleanCustomerId = customerId.replace(/-/g, ""); // Remove dashes
        await db.insert(googleAdsAccount).values({
          userId: session.user.id,
          customerId: cleanCustomerId,
          loginCustomerId: cleanCustomerId, // For individual accounts, loginCustomerId equals customerId
          accountName: `Account ${customerId}`, // Placeholder, can be updated later
          refreshToken: refreshToken,
          accessToken: tokens.access_token || null,
          tokenExpiresAt: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : null,
          scope: tokens.scope || null,
        });

        connectedAccounts.push({
          customerId,
          status: "connected",
        });
      } catch (error) {
        console.error(`Error connecting account ${customerId}:`, error);
        connectedAccounts.push({
          customerId,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully connected ${connectedAccounts.filter(a => a.status === "connected").length} account(s)`,
      accounts: connectedAccounts,
    });
  } catch (error) {
    console.error("Error connecting Google Ads accounts:", error);
    return NextResponse.json(
      {
        error: "Failed to connect accounts",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
