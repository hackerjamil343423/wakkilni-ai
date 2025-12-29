import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { googleAdsAccount } from "@/db/schema";
import { getTokensFromCode } from "@/lib/google-ads/oauth-client";
import { withRetry, isRetryableError } from "@/lib/google-ads/retry";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * GET /api/google-ads/oauth/callback
 * Handles OAuth callback from Google
 *
 * Flow:
 * 1. Exchange authorization code for tokens
 * 2. List accessible Google Ads accounts
 * 3. If 1 account: auto-connect and redirect to dashboard
 * 4. If multiple accounts: redirect to selection page
 * 5. On error: redirect with error details
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

    // Validate state parameter matches authenticated user (CSRF protection)
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id || session.user.id !== state) {
      console.error("OAuth state mismatch - potential CSRF attack", {
        sessionUserId: session?.user?.id,
        stateUserId: state,
      });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/google-ads?error=invalid_state`
      );
    }

    // Step 1: Exchange authorization code for tokens using OAuth2Client
    const tokens = await getTokensFromCode(code);

    if (!tokens.refresh_token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/google-ads?error=no_refresh_token`
      );
    }

    // Store refresh token in typed variable after null check
    const refreshToken: string = tokens.refresh_token;

    // Step 2: List accessible customers using google-ads-api library
    // This is the most reliable method as it uses the official SDK
    const { GoogleAdsApi } = await import("google-ads-api");

    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    });

    let customers: string[] = [];

    try {
      // Use withRetry for robust error handling
      const response = await withRetry(
        async () => {
          return await client.listAccessibleCustomers(refreshToken);
        },
        {
          maxAttempts: 5,
          baseDelayMs: 2000,
          maxDelayMs: 30000,
          shouldRetry: (error: Error) => {
            // Retry on network errors
            const errorCode = (error as NodeJS.ErrnoException).code;
            const isNetworkError = isRetryableError(error);

            // Also retry on Google Ads API-specific errors
            const isGoogleAdsError = error.message.includes('google-ads-api') ||
                                    error.message.includes('Grpc') ||
                                    error.message.includes('deadline');

            return isNetworkError || isGoogleAdsError;
          }
        }
      );

      // Extract customer IDs from resource names (format: "customers/1234567890")
      const customerResourceNames = response?.resource_names || response || [];
      customers = (Array.isArray(customerResourceNames) ? customerResourceNames : [])
        .map((resourceName: string) => {
          if (resourceName.includes('/')) {
            return resourceName.split('/').pop() || '';
          }
          return resourceName.replace(/-/g, '');
        })
        .filter((id: string) => id.length > 0);

    } catch (apiError) {
      console.error("Failed to list customers from Google Ads API:", apiError);

      const errorCode = (apiError as NodeJS.ErrnoException).code;
      const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);

      console.error("API Error details:", {
        code: errorCode,
        message: errorMessage,
        stack: apiError instanceof Error ? apiError.stack : undefined
      });

      // Map specific errors to user-friendly messages
      const errorParam = errorCode === 'ECONNRESET' ? 'connection_reset' :
                        errorCode === 'ETIMEDOUT' ? 'timeout' :
                        errorCode === 'ECONNREFUSED' ? 'connection_refused' :
                        'api_error';

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/google-ads?error=${errorParam}`
      );
    }

    if (!customers || customers.length === 0) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/google-ads?error=no_accounts`
      );
    }

    // Step 3: If only one account, auto-connect it
    if (customers.length === 1) {
      const customerId = customers[0].replace(/-/g, "");

      try {
        // Store token in database
        await db.insert(googleAdsAccount).values({
          id: nanoid(),
          userId: state,
          customerId,
          loginCustomerId: customerId,
          accountName: `Account ${customerId}`,
          refreshToken: refreshToken,
          accessToken: tokens.access_token || null,
          tokenExpiresAt: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : null,
          scope: tokens.scope || null,
        });
      } catch (dbError) {
        console.error("Failed to store account in database:", dbError);
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/google-ads?error=database_error`
        );
      }

      // Redirect to dashboard with success
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/google-ads/settings/accounts?connected=true`
      );
    }

    // Step 4: Multiple accounts - redirect to selection page
    const selectionData = {
      userId: state,
      refreshToken: refreshToken,
      accessToken: tokens.access_token || null,
      expiresIn: tokens.expiry_date
        ? Math.floor((tokens.expiry_date - Date.now()) / 1000)
        : null,
      scope: tokens.scope || null,
      customers: customers,
    };

    // Encode data for URL transmission
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
