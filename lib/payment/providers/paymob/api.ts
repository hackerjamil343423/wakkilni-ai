/**
 * Paymob API Client
 * Wrapper for Paymob API endpoints
 */

import type {
  PaymobAuthRequest,
  PaymobAuthResponse,
  PaymobIntentionRequest,
  PaymobIntentionResponse,
  PaymobCreateSubscriptionPlanRequest,
  PaymobSubscriptionPlan,
} from "./types";

// ============================================================================
// Configuration
// ============================================================================

const API_BASE = process.env.PAYMOB_API_URL || "https://ksa.paymob.com/v1";
const TOKEN_CACHE_DURATION = 3600 * 1000; // 1 hour in milliseconds

// ============================================================================
// Token Cache
// ============================================================================

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get authentication token (with caching)
 */
async function getAuthToken(apiKey: string): Promise<string> {
  // Check if cached token is still valid
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  // Request new token
  // NOTE: Paymob uses /api/auth/tokens endpoint (not /v1/auth/tokens)
  const response = await fetch("https://ksa.paymob.com/api/auth/tokens", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ api_key: apiKey }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(`Paymob auth failed: ${JSON.stringify(error)}`);
  }

  const data = (await response.json()) as PaymobAuthResponse;

  // Cache the token
  cachedToken = data.token;
  tokenExpiry = Date.now() + TOKEN_CACHE_DURATION;

  return data.token;
}

/**
 * Clear cached token (useful for testing or forced refresh)
 */
export function clearAuthTokenCache(): void {
  cachedToken = null;
  tokenExpiry = 0;
}

// ============================================================================
// Intention API
// ============================================================================

/**
 * Create a payment intention (checkout session)
 */
export async function createIntention(
  apiKey: string,
  intentionData: PaymobIntentionRequest
): Promise<PaymobIntentionResponse> {
  const token = await getAuthToken(apiKey);

  const response = await fetch(`${API_BASE}/intention`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(intentionData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(`Paymob intention creation failed: ${JSON.stringify(error)}`);
  }

  return (await response.json()) as PaymobIntentionResponse;
}

// ============================================================================
// Subscription Plan API
// ============================================================================

/**
 * Create a subscription plan
 * Note: This only needs to be done once per plan
 */
export async function createSubscriptionPlan(
  apiKey: string,
  planData: PaymobCreateSubscriptionPlanRequest
): Promise<PaymobSubscriptionPlan> {
  const token = await getAuthToken(apiKey);

  const response = await fetch(`${API_BASE}/acceptance/subscription-plans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(planData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(`Paymob subscription plan creation failed: ${JSON.stringify(error)}`);
  }

  return (await response.json()) as PaymobSubscriptionPlan;
}

/**
 * List subscription plans
 */
export async function listSubscriptionPlans(apiKey: string): Promise<PaymobSubscriptionPlan[]> {
  const token = await getAuthToken(apiKey);

  const response = await fetch(`${API_BASE}/acceptance/subscription-plans`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(`Paymob subscription plan listing failed: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data as PaymobSubscriptionPlan[];
}

/**
 * Get subscription plan by ID
 */
export async function getSubscriptionPlan(
  apiKey: string,
  planId: number
): Promise<PaymobSubscriptionPlan | null> {
  const plans = await listSubscriptionPlans(apiKey);
  return plans.find((plan) => plan.id === planId) || null;
}

// ============================================================================
// Transaction API (optional - for querying transactions)
// ============================================================================

/**
 * Get transaction by ID
 */
export async function getTransaction(
  apiKey: string,
  transactionId: string
): Promise<Record<string, unknown>> {
  const token = await getAuthToken(apiKey);

  const response = await fetch(`${API_BASE}/transactions/${transactionId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(`Paymob transaction fetch failed: ${JSON.stringify(error)}`);
  }

  return (await response.json()) as Record<string, unknown>;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Build checkout URL from intention response
 */
export function buildCheckoutUrl(
  publicKey: string,
  clientSecret: string
): string {
  const baseUrl = process.env.PAYMOB_UNIFIED_CHECKOUT_URL || "https://ksa.paymob.com/unifiedcheckout/";
  return `${baseUrl}?publicKey=${publicKey}&clientSecret=${clientSecret}`;
}

/**
 * Calculate amount in cents from decimal amount
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Calculate amount in decimal from cents
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Format date as YYYY-MM-DD for Paymob API
 */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get next billing date (typically 30 days from now for subscriptions)
 */
export function getNextBillingDate(days = 30): string {
  return formatDate(addDays(new Date(), days));
}
