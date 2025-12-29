import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { GoogleAdsService } from "@/lib/google-ads/service";
import { requireAccountOwnership } from "@/lib/google-ads/ownership";

/**
 * GET /api/google-ads/recommendations
 * Fetches Google Ads optimization recommendations
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

    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required" },
        { status: 400 }
      );
    }

    // Verify account ownership
    await requireAccountOwnership(session.user.id, customerId);

    const googleAdsService = new GoogleAdsService(session.user.id);

    const recommendations = await googleAdsService.getRecommendations(customerId);

    return NextResponse.json({
      success: true,
      data: recommendations,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("do not have access")) {
      return NextResponse.json(
        { error: "Forbidden", message: errorMessage },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch recommendations",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/google-ads/recommendations
 * Apply a recommendation
 * Requires account ownership verification
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { customerId, recommendationId } = body;

    if (!customerId || !recommendationId) {
      return NextResponse.json(
        { error: "Customer ID and Recommendation ID are required" },
        { status: 400 }
      );
    }

    // Verify account ownership
    await requireAccountOwnership(session.user.id, customerId);

    const googleAdsService = new GoogleAdsService(session.user.id);

    const result = await googleAdsService.applyRecommendation(customerId, recommendationId);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error applying recommendation:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("do not have access")) {
      return NextResponse.json(
        { error: "Forbidden", message: errorMessage },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to apply recommendation",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
