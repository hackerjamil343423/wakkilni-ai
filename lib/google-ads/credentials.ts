/**
 * Google Ads API Credentials Management
 */

export interface GoogleAdsCredentials {
  clientId: string;
  clientSecret: string;
  developerToken: string;
  refreshToken?: string;
}

/**
 * Get Google Ads credentials for a specific user
 * In a production environment, these would be stored securely in a database
 * and retrieved per-user basis
 */
export function getGoogleAdsCredentials(userId: string): GoogleAdsCredentials {
  // Read from environment variables
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

  if (!clientId || !clientSecret || !developerToken) {
    throw new Error(
      "Missing Google Ads credentials. Please set GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, and GOOGLE_ADS_DEVELOPER_TOKEN in your environment variables."
    );
  }

  return {
    clientId,
    clientSecret,
    developerToken,
  };
}

/**
 * Validate Google Ads credentials
 */
export function validateCredentials(credentials: GoogleAdsCredentials): boolean {
  return !!(
    credentials.clientId &&
    credentials.clientSecret &&
    credentials.developerToken
  );
}
