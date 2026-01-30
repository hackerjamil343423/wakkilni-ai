/**
 * Unified Payment Types
 * Shared interfaces for multi-provider payment system
 */

// ============================================================================
// Core Types
// ============================================================================

export type PaymentProvider = "polar" | "paymob" | "streampay";

export type SubscriptionStatus = "active" | "canceled" | "revoked" | "past_due" | "incomplete";

export type RecurringInterval = "month" | "year";

// ============================================================================
// Checkout Types
// ============================================================================

export interface CheckoutOptions {
  productId: string;
  slug?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface CheckoutResult {
  checkoutUrl: string;
  checkoutId: string;
  provider: PaymentProvider;
}

// ============================================================================
// Customer Portal Types
// ============================================================================

export interface CustomerPortalResult {
  portalUrl: string;
  provider: PaymentProvider;
}

// ============================================================================
// Subscription Types
// ============================================================================

export interface Subscription {
  id: string;
  userId: string | null;
  productId: string;
  amount: number;
  currency: string;
  recurringInterval: RecurringInterval;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  startedAt: Date;
  endsAt: Date | null;
  endedAt: Date | null;
  customerId: string;
  checkoutId: string;
  paymentProvider: PaymentProvider;

  // Provider-specific fields
  paymobIntentionId?: string | null;
  paymobSubscriptionPlanId?: number | null;
  paymobCustomerId?: string | null;
  streampaySubscriptionId?: string | null;
  streampayConsumerId?: string | null;
  streampayPaymentLinkId?: string | null;

  createdAt: Date;
  modifiedAt: Date | null;
}

// ============================================================================
// Webhook Types
// ============================================================================

export interface WebhookPayload {
  type: string;
  data: unknown;
  provider: PaymentProvider;
}

export interface WebhookVerificationResult {
  valid: boolean;
  payload?: WebhookPayload;
  error?: string;
}

// ============================================================================
// Product/Tier Types
// ============================================================================

export interface Product {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  recurringInterval: RecurringInterval;
  slug?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider: PaymentProvider,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "PaymentError";
  }
}

export class CheckoutError extends PaymentError {
  constructor(message: string, provider: PaymentProvider, originalError?: unknown) {
    super(message, "CHECKOUT_ERROR", provider, originalError);
    this.name = "CheckoutError";
  }
}

export class WebhookError extends PaymentError {
  constructor(message: string, provider: PaymentProvider, originalError?: unknown) {
    super(message, "WEBHOOK_ERROR", provider, originalError);
    this.name = "WebhookError";
  }
}

export class ProviderError extends PaymentError {
  constructor(message: string, provider: PaymentProvider, originalError?: unknown) {
    super(message, "PROVIDER_ERROR", provider, originalError);
    this.name = "ProviderError";
  }
}
