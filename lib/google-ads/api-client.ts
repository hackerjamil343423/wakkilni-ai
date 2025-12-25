/**
 * Google Ads API client with timeout and retry support
 * Direct REST API calls with proper timeout configuration
 */

import { withRetry } from './retry';

interface ListAccessibleCustomersResponse {
  resourceNames?: string[];
}

/**
 * Create a timeout promise that rejects after specified milliseconds
 */
function createTimeout(ms: number, message: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * List accessible customers using Google Ads REST API directly
 * This provides better timeout control than the library method
 *
 * @param accessToken - Valid OAuth access token
 * @param apiVersion - Google Ads API version (default: v21)
 * @returns List of customer resource names
 */
export async function listAccessibleCustomers(
  accessToken: string,
  apiVersion: string = 'v21'
): Promise<string[]> {
  const url = `https://googleads.googleapis.com/${apiVersion}/customers:listAccessibleCustomers`;

  return withRetry(
    async () => {
      const response = await fetchWithTimeout(
        url,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
          },
        },
        60000 // 60 second timeout for this request
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Google Ads API error (${response.status}): ${errorText}`
        );
      }

      const data: ListAccessibleCustomersResponse = await response.json();
      return data.resourceNames || [];
    },
    {
      maxAttempts: 5,
      baseDelayMs: 2000,
      maxDelayMs: 30000,
    }
  );
}

/**
 * Validate an access token by making a test API call
 *
 * @param accessToken - OAuth access token to validate
 * @returns True if token is valid
 */
export async function validateAccessToken(accessToken: string): Promise<boolean> {
  try {
    await listAccessibleCustomers(accessToken);
    return true;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
}

/**
 * Get customer information using REST API
 *
 * @param customerId - Customer ID (10-digit number, can include hyphens)
 * @param accessToken - Valid OAuth access token
 * @param loginCustomerId - Manager account ID if accessing as a manager
 * @returns Customer data
 */
export async function getCustomer(
  customerId: string,
  accessToken: string,
  loginCustomerId?: string
): Promise<any> {
  // Clean customer ID (remove hyphens)
  const cleanCustomerId = customerId.replace(/-/g, '');
  const url = `https://googleads.googleapis.com/v21/customers/${cleanCustomerId}`;

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
  };

  if (loginCustomerId) {
    headers['login-customer-id'] = loginCustomerId.replace(/-/g, '');
  }

  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Ads API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Search Google Ads using GAQL query
 *
 * @param customerId - Customer ID
 * @param query - GAQL query string
 * @param accessToken - Valid OAuth access token
 * @param loginCustomerId - Manager account ID if applicable
 * @returns Search results
 */
export async function searchGoogleAds(
  customerId: string,
  query: string,
  accessToken: string,
  loginCustomerId?: string
): Promise<any> {
  const cleanCustomerId = customerId.replace(/-/g, '');
  const url = `https://googleads.googleapis.com/v21/customers/${cleanCustomerId}/googleAds:search`;

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
  };

  if (loginCustomerId) {
    headers['login-customer-id'] = loginCustomerId.replace(/-/g, '');
  }

  const response = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    },
    120000 // 2 minute timeout for search queries
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Ads API error (${response.status}): ${errorText}`);
  }

  return response.json();
}
