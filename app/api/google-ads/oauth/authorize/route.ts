import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { generateAuthUrl } from "@/lib/google-ads/oauth-client";

/**
 * GET /api/google-ads/oauth/authorize
 *
 * Initiates the Google Ads OAuth 2.0 flow by redirecting the user to Google's consent screen.
 *
 * Flow:
 * 1. Verifies user is authenticated
 * 2. Generates OAuth authorization URL with user ID as state parameter
 * 3. Redirects user to Google to grant permissions
 *
 * After user grants permission, Google redirects to /api/google-ads/oauth/callback
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated session
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "You must be logged in to connect Google Ads accounts"
        },
        { status: 401 }
      );
    }

    // Generate OAuth authorization URL
    // The state parameter includes the user ID for verification in callback
    const authUrl = await generateAuthUrl(session.user.id);

    // Redirect user to Google's consent screen
    return NextResponse.redirect(authUrl);

  } catch (error) {
    console.error("Error generating Google Ads OAuth URL:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Failed to generate authorization URL",
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
