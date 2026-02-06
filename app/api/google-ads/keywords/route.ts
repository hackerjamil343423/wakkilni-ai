import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { GoogleAdsService } from "@/lib/google-ads/service";
import { requireAccountOwnership } from "@/lib/google-ads/ownership";
import { getCachedKeywords, cacheKeywords } from "@/lib/google-ads/cache";

/**
 * GET /api/google-ads/keywords
 * Fetches keywords with quality score data
 * Uses cache when available (1 hour TTL)
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

    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customerId");
    const adGroupIds = searchParams.get("adGroupIds")?.split(",");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    // Verify account ownership
    const account = await requireAccountOwnership(session.user.id, customerId);

    // Check cache first (only for unfiltered requests)
    if (!adGroupIds) {
      const cached = await getCachedKeywords(account.id);
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached,
          cached: true,
          timestamp: new Date().toISOString(),
        });
      }
    }

    const googleAdsService = new GoogleAdsService(session.user.id);

    const keywords = await googleAdsService.getKeywords({
      customerId,
      adGroupIds,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    // Cache the results (only unfiltered)
    if (!adGroupIds) {
      cacheKeywords(account.id, keywords).catch((err) =>
        console.error("Failed to cache keywords:", err)
      );
    }

    return NextResponse.json({
      success: true,
      data: keywords,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching keywords:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("do not have access")) {
      return NextResponse.json(
        { error: "Forbidden", message: errorMessage },
        { status: 403 }
      );
    }

    if (errorMessage.includes("Missing Google Ads credentials")) {
      return NextResponse.json(
        { error: "Configuration error", message: "Google Ads API credentials are not configured. Please set GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, and GOOGLE_ADS_DEVELOPER_TOKEN." },
        { status: 503 }
      );
    }

    if (errorMessage.includes("No Google Ads account found") || errorMessage.includes("No Google Ads tokens")) {
      return NextResponse.json(
        { error: "Account not connected", message: "Please reconnect your Google Ads account." },
        { status: 404 }
      );
    }

    if (errorMessage.includes("invalid_grant") || errorMessage.includes("UNAUTHENTICATED") || errorMessage.includes("Token has been expired or revoked") || errorMessage.includes("refresh")) {
      return NextResponse.json(
        { error: "Token expired", message: "Your Google Ads authorization has expired. Please disconnect and reconnect your Google Ads account." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch keywords",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
