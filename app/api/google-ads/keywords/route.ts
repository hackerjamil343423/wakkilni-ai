import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { GoogleAdsService } from "@/lib/google-ads/service";

/**
 * GET /api/google-ads/keywords
 * Fetches keywords with quality score data
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

    const googleAdsService = new GoogleAdsService(session.user.id);

    const keywords = await googleAdsService.getKeywords({
      customerId,
      adGroupIds,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: keywords,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching keywords:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch keywords",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
