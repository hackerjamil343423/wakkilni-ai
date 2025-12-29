import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { GoogleAdsService } from "@/lib/google-ads/service";
import { requireAccountOwnership } from "@/lib/google-ads/ownership";

/**
 * GET /api/google-ads/geo
 * Fetches geographic performance data
 * Requires account ownership verification
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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    // Verify account ownership
    await requireAccountOwnership(session.user.id, customerId);

    const googleAdsService = new GoogleAdsService(session.user.id);

    const geoData = await googleAdsService.getGeoPerformance({
      customerId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: geoData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching geo data:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("do not have access")) {
      return NextResponse.json(
        { error: "Forbidden", message: errorMessage },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch geo data",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
