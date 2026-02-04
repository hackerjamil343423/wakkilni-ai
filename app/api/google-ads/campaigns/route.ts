import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { GoogleAdsService } from "@/lib/google-ads/service";
import { requireAccountOwnership } from "@/lib/google-ads/ownership";
import { getCachedCampaigns, cacheCampaigns } from "@/lib/google-ads/cache";

/**
 * GET /api/google-ads/campaigns
 * Fetches all campaigns with optional filters
 * Uses cache when available to reduce API calls
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customerId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const campaignTypes = searchParams.get("campaignTypes")?.split(",");
    const campaignStatuses = searchParams.get("campaignStatuses")?.split(",");

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    // Verify account ownership - user can only access their own connected accounts
    const account = await requireAccountOwnership(session.user.id, customerId);

    // Check cache first (only for unfiltered requests to avoid stale filtered data)
    if (!campaignTypes?.length && !campaignStatuses?.length) {
      const cached = await getCachedCampaigns(account.id);
      if (cached) {
        return NextResponse.json({
          success: true,
          data: cached,
          cached: true,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Initialize Google Ads service
    const googleAdsService = new GoogleAdsService(session.user.id);

    // Fetch campaigns
    const campaigns = await googleAdsService.getCampaigns({
      customerId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      campaignTypes,
      campaignStatuses,
    });

    // Cache the results (only for unfiltered requests)
    if (!campaignTypes?.length && !campaignStatuses?.length) {
      cacheCampaigns(account.id, campaigns).catch((err) =>
        console.error("Failed to cache campaigns:", err)
      );
    }

    return NextResponse.json({
      success: true,
      data: campaigns,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);

    // Handle ownership verification errors specifically
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("do not have access")) {
      return NextResponse.json(
        { error: "Forbidden", message: errorMessage },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch campaigns",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
