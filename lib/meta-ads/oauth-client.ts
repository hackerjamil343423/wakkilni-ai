/**
 * Meta OAuth2 client helpers for Meta Ads authentication
 *
 * Meta uses a two-tier token system:
 * 1. Short-lived tokens (1 hour) obtained from initial OAuth flow
 * 2. Long-lived tokens (60 days) obtained by exchanging short-lived tokens
 *
 * Unlike Google, Meta doesn't use traditional refresh tokens. Instead,
 * long-lived tokens must be exchanged for new long-lived tokens before expiry.
 *
 * @see https://developers.facebook.com/docs/facebook-login/guides/access-tokens
 * @see https://developers.facebook.com/docs/marketing-apis/overview/authentication
 */

import { withRetry } from './retry';

/**
 * Required environment variables for Meta Ads OAuth
 */
const REQUIRED_ENV = {
  META_APP_ID: process.env.META_APP_ID,
  META_APP_SECRET: process.env.META_APP_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  META_API_VERSION: process.env.META_API_VERSION || 'v19.0',
};

/**
 * Validate that all required environment variables are set
 */
function validateEnv() {
  const missing = Object.entries(REQUIRED_ENV)
    .filter(([key, value]) => !value && key !== 'META_API_VERSION') // META_API_VERSION has default
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * OAuth scopes for Meta Ads API
 */
const OAUTH_SCOPES = [
  'ads_read',           // Read ad data
  'ads_management',     // Manage ads
  'business_management', // Access business assets
  'pages_read_engagement' // Page metrics (optional but useful)
];

/**
 * Meta API base URLs
 */
const META_GRAPH_API = `https://graph.facebook.com/${REQUIRED_ENV.META_API_VERSION}`;
const META_OAUTH_DIALOG = `https://www.facebook.com/${REQUIRED_ENV.META_API_VERSION}/dialog/oauth`;

/**
 * Meta token response interface
 */
export interface MetaTokens {
  access_token: string;
  token_type: 'bearer';
  expires_in: number; // Seconds until expiration
}

/**
 * Long-lived token response interface
 */
export interface MetaLongLivedTokens extends MetaTokens {
  expires_at: number; // Unix timestamp when token expires
}

/**
 * Generate Meta OAuth authorization URL
 *
 * Creates an authorization URL that redirects users to Meta's consent screen.
 *
 * @param state - User ID or session identifier to verify callback (CSRF protection)
 * @returns Authorization URL to redirect user to
 */
export async function generateAuthUrl(state: string): Promise<string> {
  validateEnv();

  const params = new URLSearchParams({
    client_id: REQUIRED_ENV.META_APP_ID!,
    redirect_uri: `${REQUIRED_ENV.NEXT_PUBLIC_APP_URL}/api/meta-ads/oauth/callback`,
    state,
    scope: OAUTH_SCOPES.join(','),
    response_type: 'code',
    // Force re-authentication to ensure we get fresh tokens
    auth_type: 'rerequest',
  });

  return `${META_OAUTH_DIALOG}?${params.toString()}`;
}

/**
 * Exchange authorization code for short-lived access token
 *
 * This is the first step in Meta's two-tier token system.
 * The resulting token expires in 1 hour.
 *
 * @param code - Authorization code from OAuth callback
 * @returns Short-lived access token (1 hour expiration)
 */
export async function getTokensFromCode(code: string): Promise<MetaTokens> {
  validateEnv();

  const params = new URLSearchParams({
    client_id: REQUIRED_ENV.META_APP_ID!,
    client_secret: REQUIRED_ENV.META_APP_SECRET!,
    redirect_uri: `${REQUIRED_ENV.NEXT_PUBLIC_APP_URL}/api/meta-ads/oauth/callback`,
    code,
  });

  return withRetry(
    async () => {
      const response = await fetch(`${META_GRAPH_API}/oauth/access_token?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Meta token exchange failed: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data as MetaTokens;
    },
    {
      maxAttempts: 5,
      baseDelayMs: 2000,
      maxDelayMs: 30000,
    }
  );
}

/**
 * Exchange short-lived token for long-lived token
 *
 * Converts a 1-hour short-lived token into a 60-day long-lived token.
 * This should be done immediately after obtaining the short-lived token.
 *
 * @param shortLivedToken - Short-lived access token from getTokensFromCode
 * @returns Long-lived access token (60 days expiration)
 */
export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<MetaLongLivedTokens> {
  validateEnv();

  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: REQUIRED_ENV.META_APP_ID!,
    client_secret: REQUIRED_ENV.META_APP_SECRET!,
    fb_exchange_token: shortLivedToken,
  });

  return withRetry(
    async () => {
      const response = await fetch(`${META_GRAPH_API}/oauth/access_token?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Meta long-lived token exchange failed: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json() as MetaTokens;

      // Calculate expiration timestamp
      const expiresAt = Date.now() + (data.expires_in * 1000);

      return {
        ...data,
        expires_at: expiresAt,
      };
    },
    {
      maxAttempts: 3,
      baseDelayMs: 1000,
      maxDelayMs: 10000,
    }
  );
}

/**
 * Refresh a long-lived token by exchanging it for a new long-lived token
 *
 * Meta doesn't use traditional refresh tokens. Instead, long-lived tokens
 * can be exchanged for new long-lived tokens before they expire.
 *
 * Should be called when token has < 30 days remaining.
 *
 * @param currentLongLivedToken - Current long-lived access token
 * @returns New long-lived access token (60 days expiration)
 */
export async function refreshTokenIfNeeded(
  currentLongLivedToken: string,
  expiresAt: number
): Promise<MetaLongLivedTokens | null> {
  const now = Date.now();
  const daysUntilExpiry = (expiresAt - now) / (1000 * 60 * 60 * 24);

  // Only refresh if less than 30 days remaining
  if (daysUntilExpiry >= 30) {
    return null;
  }

  validateEnv();

  const params = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: REQUIRED_ENV.META_APP_ID!,
    client_secret: REQUIRED_ENV.META_APP_SECRET!,
    fb_exchange_token: currentLongLivedToken,
  });

  return withRetry(
    async () => {
      const response = await fetch(`${META_GRAPH_API}/oauth/access_token?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Meta token refresh failed: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json() as MetaTokens;

      // Calculate new expiration timestamp
      const newExpiresAt = Date.now() + (data.expires_in * 1000);

      return {
        ...data,
        expires_at: newExpiresAt,
      };
    },
    {
      maxAttempts: 3,
      baseDelayMs: 1000,
      maxDelayMs: 10000,
    }
  );
}

/**
 * Get user's ad accounts from Meta Graph API
 *
 * Fetches all ad accounts the user has access to.
 * Call this after OAuth to let user select which account(s) to connect.
 *
 * @param accessToken - Valid Meta access token
 * @returns Array of ad account objects
 */
export async function getAdAccounts(accessToken: string): Promise<MetaAdAccount[]> {
  return withRetry(
    async () => {
      const response = await fetch(
        `${META_GRAPH_API}/me/adaccounts?fields=id,name,account_id,currency,timezone_name,business&access_token=${accessToken}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to fetch ad accounts: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    },
    {
      maxAttempts: 3,
      baseDelayMs: 1000,
      maxDelayMs: 10000,
    }
  );
}

/**
 * Revoke Meta access token
 *
 * Revokes the access token, effectively disconnecting the account.
 *
 * @param accessToken - Token to revoke
 */
export async function revokeToken(accessToken: string): Promise<void> {
  validateEnv();

  return withRetry(
    async () => {
      const params = new URLSearchParams({
        access_token: accessToken,
      });

      const response = await fetch(
        `${META_GRAPH_API}/me/permissions?${params.toString()}`,
        {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to revoke token: ${error.error?.message || response.statusText}`);
      }
    },
    {
      maxAttempts: 3,
      baseDelayMs: 1000,
      maxDelayMs: 5000,
    }
  );
}

/**
 * Meta Ad Account interface
 */
export interface MetaAdAccount {
  id: string; // Format: act_XXXXXXXXXX
  name: string;
  account_id: string; // Numeric account ID without 'act_' prefix
  currency: string;
  timezone_name: string;
  business?: {
    id: string;
    name: string;
  };
}
