/**
 * Google Ads OAuth Helpers
 * Handles OAuth flow for Google Ads API integration
 */

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string;
}

/**
 * Generates Google OAuth URL for Google Ads API access
 * @param state - CSRF protection token
 * @param redirectUri - OAuth callback URL
 * @returns OAuth authorization URL
 */
export function generateOAuthUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/adwords", // Google Ads scope
    access_type: "offline", // Get refresh token
    prompt: "consent", // Force consent screen to get refresh token
    state: state, // CSRF protection
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchanges authorization code for access and refresh tokens
 * @param code - Authorization code from OAuth callback
 * @param redirectUri - Same redirect URI used in OAuth initiation
 * @returns OAuth tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<OAuthTokens> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to exchange code for tokens: ${error.error_description || error.error}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    scope: data.scope,
  };
}

/**
 * Refreshes an access token using a refresh token
 * @param refreshToken - Refresh token from initial OAuth flow
 * @returns New access token and expiration
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresAt: Date;
}> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to refresh access token: ${error.error_description || error.error}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };
}

/**
 * Revokes a refresh token (optional - for disconnect flow)
 * @param refreshToken - Refresh token to revoke
 */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  const response = await fetch(
    `https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(refreshToken)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  if (!response.ok) {
    console.warn("Failed to revoke refresh token:", await response.text());
    // Don't throw - disconnection can proceed even if revocation fails
  }
}
