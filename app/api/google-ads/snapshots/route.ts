import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getAccountSnapshots,
  getLatestSnapshot,
  createSnapshotFromCampaigns,
  compareSnapshots,
} from "@/lib/google-ads/snapshots";
import { GoogleAdsService } from "@/lib/google-ads/service";
import { requireSnapshotOwnership } from "@/lib/google-ads/ownership";

/**
 * GET /api/google-ads/snapshots
 * Get historical snapshots for an account
 * Requires account ownership verification
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get("accountId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const latest = searchParams.get("latest") === "true";

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    // Verify account ownership for snapshots
    await requireSnapshotOwnership(session.user.id, accountId);

    if (latest) {
      const snapshot = await getLatestSnapshot(accountId);
      return NextResponse.json({
        success: true,
        data: snapshot,
      });
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    const snapshots = await getAccountSnapshots(
      accountId,
      new Date(startDate),
      new Date(endDate)
    );

    return NextResponse.json({
      success: true,
      data: snapshots,
      meta: {
        accountId,
        startDate,
        endDate,
        count: snapshots.length,
      },
    });
  } catch (error) {
    console.error("Error fetching snapshots:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("do not have access")) {
      return NextResponse.json(
        { error: "Forbidden", message: errorMessage },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch snapshots",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/google-ads/snapshots
 * Create a manual snapshot for an account
 * Requires account ownership verification
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { accountId, snapshotDate } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    // Verify account ownership for snapshots
    await requireSnapshotOwnership(session.user.id, accountId);

    // Fetch campaigns from Google Ads
    const googleAdsService = new GoogleAdsService(session.user.id);

    // Get customer ID from account ID (you'll need to map this)
    // For now, assuming accountId is the Google Ads customer ID
    const campaigns = await googleAdsService.getCampaigns({
      customerId: accountId,
      startDate: snapshotDate ? new Date(snapshotDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    });

    // Create snapshot from campaign data
    const snapshot = await createSnapshotFromCampaigns(
      accountId,
      campaigns.map((c) => ({
        status: c.status,
        spend: c.spend,
        impressions: c.impressions,
        clicks: c.clicks,
        conversions: c.conversions,
        conversionValue: c.conversionValue,
        ctr: c.ctr,
        cpa: c.cpa,
        roas: c.roas,
      })),
      snapshotDate ? new Date(snapshotDate) : new Date()
    );

    return NextResponse.json({
      success: true,
      data: snapshot,
      message: "Snapshot created successfully",
    });
  } catch (error) {
    console.error("Error creating snapshot:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("do not have access")) {
      return NextResponse.json(
        { error: "Forbidden", message: errorMessage },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create snapshot",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
