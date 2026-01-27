/**
 * Base Payment Provider Interface
 * All payment providers must implement this interface
 */

import type {
  CheckoutOptions,
  CheckoutResult,
  CustomerPortalResult,
  WebhookVerificationResult,
  PaymentProvider,
} from "../types";

export interface IPaymentProvider {
  /**
   * Unique provider identifier
   */
  readonly name: PaymentProvider;

  /**
   * Create a checkout session for a product
   * @param options - Checkout configuration
   * @returns Checkout URL and checkout ID
   */
  createCheckout(options: CheckoutOptions): Promise<CheckoutResult>;

  /**
   * Create a customer portal session for subscription management
   * @param subscriptionId - The subscription ID to manage
   * @returns Customer portal URL
   */
  createCustomerPortal(subscriptionId: string): Promise<CustomerPortalResult>;

  /**
   * Cancel a subscription
   * @param subscriptionId - The subscription ID to cancel
   * @param cancelAtPeriodEnd - If true, cancel at period end; if false, cancel immediately
   */
  cancelSubscription(subscriptionId: string, cancelAtPeriodEnd?: boolean): Promise<void>;

  /**
   * Verify webhook signature
   * @param payload - Raw webhook payload
   * @param signature - Webhook signature from headers
   * @returns Verification result with parsed payload if valid
   */
  verifyWebhook(payload: unknown, signature: string | null): WebhookVerificationResult;

  /**
   * Process a verified webhook payload
   * @param payload - Parsed webhook payload
   */
  processWebhook(payload: unknown): Promise<void>;
}

/**
 * Base provider configuration
 */
export interface ProviderConfig {
  /**
   * API key or access token
   */
  apiKey: string;

  /**
   * Webhook secret for signature verification
   */
  webhookSecret: string;

  /**
   * Base API URL (for different regions)
   */
  apiUrl?: string;

  /**
   * Whether to use sandbox/test mode
   */
  sandbox?: boolean;
}
