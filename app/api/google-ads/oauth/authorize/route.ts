import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { generateAuthUrl } from "@/lib/google-ads/oauth-client";

/**
 * GET /api/google-ads/oauth/authorize
 * Redirects user to Google OAuth consent screen
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Generate OAuth authorization URL
    const authUrl = await generateAuthUrl(session.user.id);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Error generating OAuth URL:", error);
    return NextResponse.json(
      {
        error: "Failed to generate authorization URL",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
