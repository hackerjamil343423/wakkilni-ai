import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { GoogleAdsService } from "@/lib/google-ads/service";

/**
 * GET /api/google-ads/campaigns
 * Fetches all campaigns with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
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

    return NextResponse.json({
      success: true,
      data: campaigns,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch campaigns",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
