import { NextRequest, NextResponse } from "next/server";
import { GoogleAdsApi } from "google-ads-api";
import { db } from "@/db";
import { googleAdsAccount } from "@/db/schema";
import { getTokensFromCode } from "@/lib/google-ads/oauth-client";
import { withRetry, isRetryableError } from "@/lib/google-ads/retry";

/**
 * GET /api/google-ads/oauth/callback
 * Handles OAuth callback from Google
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // User ID
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/google-ads?error=${error}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/google-ads?error=missing_parameters`
      );
    }

    // Exchange authorization code for tokens using OAuth2Client
    const tokens = await getTokensFromCode(code);

    if (!tokens.refresh_token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/google-ads?error=no_refresh_token`
      );
    }

    // Initialize Google Ads API client for listing customers
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    });

    // Fetch accessible customers using the refresh token with retry logic
    let customersResponse;
    try {
      customersResponse = await withRetry(
        () => client.listAccessibleCustomers(tokens.refresh_token),
        {
          maxAttempts: 3,
          baseDelayMs: 1000, // 1s, 2s, 4s delays
        }
      );
    } catch (error) {
      console.error("Failed to list customers after retries:", error);
      const errorType = isRetryableError(error) ? "network_error" : "list_customers_failed";
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/google-ads?error=${errorType}`
      );
    }

    // Extract customer IDs from resource names (format: "customers/1234567890")
    const customerResourceNames = customersResponse?.resource_names || customersResponse || [];
    const customers = (Array.isArray(customerResourceNames) ? customerResourceNames : [])
      .map((resourceName: string) => {
        // Handle both "customers/123" format and plain "123" format
        if (resourceName.includes('/')) {
          return resourceName.split('/').pop() || '';
        }
        return resourceName.replace(/-/g, '');
      })
      .filter((id: string) => id.length > 0);

    if (!customers || customers.length === 0) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/google-ads/connect/no-accounts`
      );
    }

    // If only one account, auto-connect it
    if (customers.length === 1) {
      const customerId = customers[0].replace(/-/g, "");

      // Store tokens in database
      await db.insert(googleAdsAccount).values({
        userId: state, // User ID from state parameter
        customerId,
        loginCustomerId: customerId, // For individual accounts, loginCustomerId equals customerId
        accountName: `Account ${customerId}`, // Placeholder name
        refreshToken: tokens.refresh_token,
        accessToken: tokens.access_token || null,
        tokenExpiresAt: tokens.expires_in
          ? new Date(Date.now() + tokens.expires_in * 1000)
          : null,
        scope: tokens.scope || null,
      });

      // Redirect to dashboard with success
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/google-ads?connected=true&customerId=${customerId}`
      );
    }

    // Multiple accounts - redirect to selection page
    // Store data in URL (encoded) for selection page
    // Note: For production, use server-side session storage or encrypted tokens
    const selectionData = {
      userId: state,
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token || null,
      expiresIn: tokens.expires_in,
      scope: tokens.scope || null,
      customers: customers,
    };

    // Encode data (in production, store server-side with random token)
    const encodedData = Buffer.from(JSON.stringify(selectionData)).toString('base64url');

    // Redirect to account selection page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/google-ads/connect/select-accounts?data=${encodedData}`
    );
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/google-ads?error=oauth_failed`
    );
  }
}
