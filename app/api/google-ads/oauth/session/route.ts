import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { googleAdsOauthSession } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";

/**
 * GET /api/google-ads/oauth/session?id={sessionId}
 * Retrieves OAuth session data (customer list) for account selection.
 * Returns only customer IDs - tokens stay server-side.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const sessionId = request.nextUrl.searchParams.get("id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Look up session - must belong to the authenticated user and not be expired
    const now = new Date();
    const results = await db
      .select({
        id: googleAdsOauthSession.id,
        userId: googleAdsOauthSession.userId,
        customers: googleAdsOauthSession.customers,
        expiresAt: googleAdsOauthSession.expiresAt,
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

    if (results.length === 0) {
      return NextResponse.json(
        { error: "Session not found or expired. Please try connecting again." },
        { status: 404 }
      );
    }

    const oauthSession = results[0];
    const customers: string[] = JSON.parse(oauthSession.customers);

    return NextResponse.json({
      success: true,
      sessionId: oauthSession.id,
      customers,
    });
  } catch (error) {
    console.error("Error fetching OAuth session:", error);
    return NextResponse.json(
      { error: "Failed to retrieve session data" },
      { status: 500 }
    );
  }
}
