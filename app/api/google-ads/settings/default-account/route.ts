import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { setDefaultAccount } from "@/lib/google-ads/user-settings";
import { logAccountConnected } from "@/lib/google-ads/audit-log";

/**
 * POST /api/google-ads/settings/default-account
 * Set the default Google Ads account for a user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    const settings = await setDefaultAccount(session.user.id, accountId);

    // Log the action
    await logAccountConnected(session.user.id, accountId, {
      customerId: accountId,
      accountName: "Default Account",
    });

    return NextResponse.json({
      success: true,
      data: settings,
      message: "Default account updated successfully",
    });
  } catch (error) {
    console.error("Error setting default account:", error);
    return NextResponse.json(
      {
        error: "Failed to set default account",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
