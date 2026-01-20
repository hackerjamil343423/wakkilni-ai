/**
 * Meta Ads OAuth Callback Endpoint
 * Handles OAuth callback from Meta
 *
 * Flow:
 * 1. Exchange authorization code for short-lived token (1 hour)
 * 2. Exchange short-lived token for long-lived token (60 days)
 * 3. Fetch accessible ad accounts
 * 4. If 1 account: auto-connect and redirect to dashboard
 * 5. If multiple accounts: redirect to selection page
 * 6. On error: redirect with error details
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { metaAdsAccount } from "@/db/schema";
import {
  getTokensFromCode,
  exchangeForLongLivedToken,
  getAdAccounts,
  type MetaAdAccount,
} from "@/lib/meta-ads/oauth-client";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { logAccountConnected } from "@/lib/meta-ads/audit-log";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // User ID for CSRF protection
    const error = searchParams.get("error");
    const errorReason = searchParams.get("error_reason");
    const errorDescription = searchParams.get("error_description");

    // Handle Meta OAuth errors
    if (error) {
      console.error("Meta OAuth error:", { error, errorReason, errorDescription });
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/meta-ads?error=${error}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/meta-ads?error=missing_parameters`
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
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/meta-ads?error=invalid_state`
      );
    }

    // Step 1: Exchange authorization code for short-lived token (1 hour)
    let shortLivedToken: string;
    try {
      const tokens = await getTokensFromCode(code);
      shortLivedToken = tokens.access_token;
    } catch (error) {
      console.error("Failed to exchange code for token:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/meta-ads?error=token_exchange_failed`
      );
    }

    // Step 2: Exchange short-lived token for long-lived token (60 days)
    let longLivedTokenData;
    try {
      longLivedTokenData = await exchangeForLongLivedToken(shortLivedToken);
    } catch (error) {
      console.error("Failed to exchange for long-lived token:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/meta-ads?error=long_lived_token_failed`
      );
    }

    // Step 3: Fetch accessible ad accounts
    let adAccounts: MetaAdAccount[] = [];
    try {
      adAccounts = await getAdAccounts(longLivedTokenData.access_token);
    } catch (error) {
      console.error("Failed to fetch ad accounts:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/meta-ads?error=fetch_accounts_failed`
      );
    }

    if (!adAccounts || adAccounts.length === 0) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/meta-ads?error=no_accounts`
      );
    }

    // Get request headers for audit log
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined;
    const userAgent = headersList.get('user-agent') || undefined;

    // Step 4: If only one account, auto-connect it
    if (adAccounts.length === 1) {
      const account = adAccounts[0];

      try {
        // Store account in database
        await db.insert(metaAdsAccount).values({
          id: nanoid(),
          userId: state,
          accountId: account.id,
          accountName: account.name,
          businessId: account.business?.id || null,
          accessToken: longLivedTokenData.access_token,
          tokenExpiresAt: new Date(longLivedTokenData.expires_at),
          scope: 'ads_read,ads_management,business_management',
          currency: account.currency || null,
          timezone: account.timezone_name || null,
          isPrimary: true, // First account is primary
          status: 'active',
        });

        // Log the connection
        await logAccountConnected(
          state,
          account.id,
          account.name,
          ipAddress,
          userAgent
        );
      } catch (dbError) {
        console.error("Failed to store account in database:", dbError);
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/meta-ads?error=database_error`
        );
      }

      // Redirect to dashboard with success
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/meta-ads?connected=true`
      );
    }

    // Step 5: Multiple accounts - redirect to selection page
    const selectionData = {
      userId: state,
      accessToken: longLivedTokenData.access_token,
      expiresAt: longLivedTokenData.expires_at,
      accounts: adAccounts.map((acc) => ({
        id: acc.id,
        name: acc.name,
        accountId: acc.account_id,
        currency: acc.currency,
        timezone: acc.timezone_name,
        businessId: acc.business?.id,
        businessName: acc.business?.name,
      })),
    };

    // Encode data for URL transmission
    const encodedData = Buffer.from(JSON.stringify(selectionData)).toString('base64url');

    // Redirect to account selection page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/meta-ads/connect/select-accounts?data=${encodedData}`
    );

  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/meta-ads?error=oauth_failed`
    );
  }
}
