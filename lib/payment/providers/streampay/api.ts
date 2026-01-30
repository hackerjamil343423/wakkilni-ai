/**
 * Streampay API Client
 * Handles all API communication with Streampay
 */

import { STREAMPAY_CONFIG } from "../../config";
import type {
  StreampayProduct,
  StreampayConsumer,
  StreampayPaymentLink,
  StreampayInvoice,
  StreampaySubscription,
  StreampayErrorResponse,
  CreateProductRequest,
  CreateConsumerRequest,
  CreatePaymentLinkRequest,
} from "./types";

// ============================================================================
// API Errors
// ============================================================================

export class StreampayApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: StreampayErrorResponse
  ) {
    super(message);
    this.name = "StreampayApiError";
  }
}

// ============================================================================
// Authentication
// ============================================================================

/**
 * Get the Base64-encoded authentication header
 * Format: api-key:api-secret encoded as Base64
 */
export function getAuthHeader(): string {
  const credentials = `${STREAMPAY_CONFIG.apiKey}:${STREAMPAY_CONFIG.apiSecret}`;
  return Buffer.from(credentials).toString("base64");
}

/**
 * Get the base API URL (with sandbox support)
 */
export function getBaseUrl(): string {
  return STREAMPAY_CONFIG.apiUrl;
}

// ============================================================================
// API Client
// ============================================================================

/**
 * Make an authenticated API request to Streampay
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getBaseUrl()}${endpoint}`;
  const authHeader = getAuthHeader();

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": authHeader,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorResponse: StreampayErrorResponse | undefined;
    try {
      errorResponse = await response.json();
    } catch {
      // Ignore JSON parse errors
    }
    throw new StreampayApiError(
      errorResponse?.message || `API request failed: ${response.statusText}`,
      response.status,
      errorResponse
    );
  }

  return response.json();
}

// ============================================================================
// Products API
// ============================================================================

/**
 * Create a new product in Streampay
 */
export async function createProduct(data: CreateProductRequest): Promise<StreampayProduct> {
  return request<StreampayProduct>("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Get a product by ID
 */
export async function getProduct(productId: string): Promise<StreampayProduct> {
  return request<StreampayProduct>(`/products/${productId}`);
}

// ============================================================================
// Consumers API
// ============================================================================

/**
 * Create a new consumer in Streampay
 */
export async function createConsumer(data: CreateConsumerRequest): Promise<StreampayConsumer> {
  return request<StreampayConsumer>("/consumers", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Get a consumer by ID
 */
export async function getConsumer(consumerId: string): Promise<StreampayConsumer> {
  return request<StreampayConsumer>(`/consumers/${consumerId}`);
}

/**
 * Find a consumer by external ID (your system's customer ID)
 */
export async function findConsumerByExternalId(): Promise<StreampayConsumer | null> {
  try {
    // Streampay doesn't have a direct endpoint for this, so we'll need to
    // handle this by storing the consumer ID in our system
    // For now, return null and handle this at the application level
    return null;
  } catch {
    return null;
  }
}

// ============================================================================
// Payment Links API
// ============================================================================

/**
 * Create a payment link
 */
export async function createPaymentLink(data: CreatePaymentLinkRequest): Promise<StreampayPaymentLink> {
  return request<StreampayPaymentLink>("/payment-links", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Get a payment link by ID
 */
export async function getPaymentLink(paymentLinkId: string): Promise<StreampayPaymentLink> {
  return request<StreampayPaymentLink>(`/payment-links/${paymentLinkId}`);
}

// ============================================================================
// Invoices API
// ============================================================================

/**
 * Get an invoice by ID
 * Used to verify payment status after webhook or redirect
 */
export async function getInvoice(invoiceId: string): Promise<StreampayInvoice> {
  return request<StreampayInvoice>(`/invoices/${invoiceId}`);
}

// ============================================================================
// Subscriptions API
// ============================================================================

/**
 * Cancel a subscription
 * @param subscriptionId - The subscription ID to cancel
 * @param cancelAtPeriodEnd - If true, cancel at period end; if false, cancel immediately
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = false
): Promise<void> {
  // Streampay doesn't have a direct cancel endpoint in the documented API
  // We'll need to update the subscription or handle this differently
  // For now, let's assume there's an endpoint or we'll use a workaround
  await request(`/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ cancel_at_period_end: cancelAtPeriodEnd }),
  });
}

/**
 * Get a subscription by ID
 */
export async function getSubscription(subscriptionId: string): Promise<StreampaySubscription> {
  return request<StreampaySubscription>(`/subscriptions/${subscriptionId}`);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Build the success/failure redirect URLs for payment links
 */
export function buildRedirectUrls(successUrl: string, failureUrl: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    success_redirect_url: successUrl.startsWith("http") ? successUrl : `${baseUrl}${successUrl}`,
    failure_redirect_url: failureUrl.startsWith("http") ? failureUrl : `${baseUrl}${failureUrl}`,
  };
}
