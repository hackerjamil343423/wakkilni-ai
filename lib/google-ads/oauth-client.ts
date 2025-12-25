/**
 * Google OAuth2 client helpers for Google Ads authentication
 * Uses google-auth-library for OAuth operations
 */

import { OAuth2Client } from 'google-auth-library';
import { withRetry } from './retry';

/**
 * Create a configured OAuth2 client for Google Ads
 */
export function createOAuth2Client() {
  return new OAuth2Client(
    process.env.GOOGLE_ADS_CLIENT_ID,
    process.env.GOOGLE_ADS_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/google-ads/oauth/callback`
  );
}

/**
 * Generate Google OAuth authorization URL
 * @param state - User ID or session identifier to verify callback
 * @returns Authorization URL to redirect user to
 */
export async function generateAuthUrl(state: string): Promise<string> {
  const client = createOAuth2Client();

  return client.generateAuthUrl({
    access_type: 'offline', // Request refresh token
    scope: 'https://www.googleapis.com/auth/adwords',
    state,
    prompt: 'consent', // Force consent screen to ensure refresh token
  });
}

/**
 * Exchange authorization code for tokens
 * @param code - Authorization code from OAuth callback
 * @returns Tokens object with access_token, refresh_token, etc.
 */
export async function getTokensFromCode(code: string) {
  const client = createOAuth2Client();

  return withRetry(
    async () => {
      const { tokens } = await client.getToken(code);
      return tokens;
    },
    { maxAttempts: 3, baseDelayMs: 1000 }
  );
}

/**
 * Refresh an access token using a refresh token
 * @param refreshToken - The refresh token to use
 * @returns New credentials with fresh access_token
 */
export async function refreshAccessToken(refreshToken: string) {
  const client = new OAuth2Client(
    process.env.GOOGLE_ADS_CLIENT_ID,
    process.env.GOOGLE_ADS_CLIENT_SECRET
  );

  client.setCredentials({ refresh_token: refreshToken });

  return withRetry(
    async () => {
      const { credentials } = await client.refreshAccessToken();
      return credentials;
    },
    { maxAttempts: 3, baseDelayMs: 1000 }
  );
}
