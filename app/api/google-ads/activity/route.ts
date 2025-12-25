import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getUserActivityLog,
  getFailedActivities,
} from "@/lib/google-ads/audit-log";

/**
 * GET /api/google-ads/activity
 * Get user activity log
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const filter = searchParams.get("filter"); // 'all', 'failed'

    let activities;

    if (filter === "failed") {
      activities = await getFailedActivities(session.user.id, limit);
    } else {
      activities = await getUserActivityLog(session.user.id, limit, offset);
    }

    // Parse JSON fields for response
    const parsedActivities = activities.map((activity) => ({
      ...activity,
      oldValue: activity.oldValue ? JSON.parse(activity.oldValue) : undefined,
      newValue: activity.newValue ? JSON.parse(activity.newValue) : undefined,
    }));

    return NextResponse.json({
      success: true,
      data: parsedActivities,
      meta: {
        limit,
        offset,
        count: parsedActivities.length,
      },
    });
  } catch (error) {
    console.error("Error fetching activity log:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch activity log",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
