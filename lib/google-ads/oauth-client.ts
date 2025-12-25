/**
 * Google OAuth2 client helpers for Google Ads authentication
 *
 * Uses google-auth-library for OAuth operations with retry logic for resilience.
 *
 * @see https://developers.google.com/ads/api/docs/first-call/overview
 */

import { OAuth2Client, Credentials } from 'google-auth-library';
import { withRetry } from './retry';

/**
 * Required environment variables for Google Ads OAuth
 */
const REQUIRED_ENV = {
  GOOGLE_ADS_CLIENT_ID: process.env.GOOGLE_ADS_CLIENT_ID,
  GOOGLE_ADS_CLIENT_SECRET: process.env.GOOGLE_ADS_CLIENT_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

/**
 * Validate that all required environment variables are set
 */
function validateEnv() {
  const missing = Object.entries(REQUIRED_ENV)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * OAuth scopes for Google Ads API
 */
const OAUTH_SCOPE = 'https://www.googleapis.com/auth/adwords';

/**
 * Create a configured OAuth2 client for Google Ads
 *
 * @returns OAuth2Client instance
 */
export function createOAuth2Client(): OAuth2Client {
  validateEnv();

  return new OAuth2Client(
    REQUIRED_ENV.GOOGLE_ADS_CLIENT_ID!,
    REQUIRED_ENV.GOOGLE_ADS_CLIENT_SECRET!,
    `${REQUIRED_ENV.NEXT_PUBLIC_APP_URL}/api/google-ads/oauth/callback`
  );
}

/**
 * Generate Google OAuth authorization URL
 *
 * Creates an authorization URL that redirects users to Google's consent screen.
 * Uses offline access type to obtain a refresh token for long-term access.
 *
 * @param state - User ID or session identifier to verify callback
 * @returns Authorization URL to redirect user to
 */
export async function generateAuthUrl(state: string): Promise<string> {
  const client = createOAuth2Client();

  return client.generateAuthUrl({
    access_type: 'offline', // Request refresh token for long-term access
    scope: OAUTH_SCOPE,
    state,
    prompt: 'consent', // Force consent screen to ensure refresh token is returned
  });
}

/**
 * Exchange authorization code for tokens
 *
 * Exchanges the authorization code received from Google's OAuth callback
 * for access and refresh tokens. Includes retry logic for network resilience.
 *
 * @param code - Authorization code from OAuth callback
 * @returns Tokens object with access_token, refresh_token, expiry_date, scope
 */
export async function getTokensFromCode(code: string): Promise<Credentials> {
  const client = createOAuth2Client();

  return withRetry(
    async () => {
      const { tokens } = await client.getToken(code);

      if (!tokens.refresh_token) {
        throw new Error('No refresh token returned from Google. Ensure prompt=consent was used.');
      }

      return tokens;
    },
    {
      maxAttempts: 5,
      baseDelayMs: 2000,
      maxDelayMs: 30000,
    }
  );
}

/**
 * Refresh an access token using a refresh token
 *
 * When an access token expires, use the refresh token to obtain a new access token
 * without requiring user interaction.
 *
 * @param refreshToken - The refresh token to use
 * @returns New credentials with fresh access_token and expiry_date
 */
export async function refreshAccessToken(refreshToken: string): Promise<Credentials> {
  validateEnv();

  const client = new OAuth2Client(
    REQUIRED_ENV.GOOGLE_ADS_CLIENT_ID!,
    REQUIRED_ENV.GOOGLE_ADS_CLIENT_SECRET!
  );

  client.setCredentials({ refresh_token: refreshToken });

  return withRetry(
    async () => {
      const { credentials } = await client.refreshAccessToken();
      return credentials;
    },
    {
      maxAttempts: 3,
      baseDelayMs: 1000,
      maxDelayMs: 10000,
    }
  );
}
