/**
 * Unified Payment Service
 * Main entry point for payment operations
 * Handles provider selection and provides a simple API for payment operations
 */

import type {
  CheckoutOptions,
  CheckoutResult,
  CustomerPortalResult,
  PaymentProvider,
  Subscription,
  SubscriptionStatus,
} from "./types";
import { PaymentProviderFactory } from "./factory";
import { detectUserCountry, getProviderForRequest } from "./detection.server";
import { detectProviderForCountry } from "./detection";
import { DEFAULT_PAYMENT_PROVIDER } from "./config";

/**
 * Unified Payment Service
 */
export class PaymentService {
  /**
   * Create checkout session with automatic provider selection
   * Provider is selected based on user's detected country
   */
  static async createCheckout(options: CheckoutOptions): Promise<CheckoutResult> {
    const provider = await PaymentProviderFactory.getProviderForRequest();
    return provider.createCheckout(options);
  }

  /**
   * Create checkout session with specific provider
   * Use this when you need to override auto-selection
   */
  static async createCheckoutWithProvider(
    provider: PaymentProvider,
    options: CheckoutOptions
  ): Promise<CheckoutResult> {
    const providerInstance = await PaymentProviderFactory.getProvider(provider);
    return providerInstance.createCheckout(options);
  }

  /**
   * Create checkout session for a specific country
   * Useful for pre-determining provider based on known user location
   */
  static async createCheckoutForCountry(
    countryCode: string,
    options: CheckoutOptions
  ): Promise<CheckoutResult> {
    const providerInstance = await PaymentProviderFactory.getProviderForCountry(countryCode);
    return providerInstance.createCheckout(options);
  }

  /**
   * Create customer portal session
   * Provider is determined from the subscription
   */
  static async createCustomerPortal(subscriptionId: string): Promise<CustomerPortalResult> {
    // Import here to avoid circular dependency
    const { db } = await import("@/db/drizzle");
    const { subscription } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    // Get subscription to determine provider
    const [subscriptionRecord] = await db
      .select({ paymentProvider: subscription.paymentProvider })
      .from(subscription)
      .where(eq(subscription.id, subscriptionId))
      .limit(1);

    if (!subscriptionRecord) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    const providerInstance = await PaymentProviderFactory.getProvider(
      subscriptionRecord.paymentProvider as PaymentProvider
    );

    return providerInstance.createCustomerPortal(subscriptionId);
  }

  /**
   * Cancel subscription
   * Provider is determined from the subscription
   */
  static async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd = false
  ): Promise<void> {
    // Import here to avoid circular dependency
    const { db } = await import("@/db/drizzle");
    const { subscription } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    // Get subscription to determine provider
    const [subscriptionRecord] = await db
      .select({ paymentProvider: subscription.paymentProvider })
      .from(subscription)
      .where(eq(subscription.id, subscriptionId))
      .limit(1);

    if (!subscriptionRecord) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    const providerInstance = await PaymentProviderFactory.getProvider(
      subscriptionRecord.paymentProvider as PaymentProvider
    );

    return providerInstance.cancelSubscription(subscriptionId, cancelAtPeriodEnd);
  }

  /**
   * Get provider for current user (for UI display, etc.)
   */
  static async getUserProvider(): Promise<PaymentProvider> {
    try {
      return await getProviderForRequest();
    } catch {
      return DEFAULT_PAYMENT_PROVIDER;
    }
  }

  /**
   * Get user's detected country code
   */
  static async getUserCountry(): Promise<string> {
    try {
      return await detectUserCountry();
    } catch {
      return "US";
    }
  }

  /**
   * Check if user would use Paymob based on their location
   */
  static async wouldUsePaymob(): Promise<boolean> {
    const country = await this.getUserCountry();
    return detectProviderForCountry(country) === "paymob";
  }

  /**
   * Get subscription details with provider info
   */
  static async getSubscriptionDetails(
    subscriptionId: string
  ): Promise<Subscription & { provider: PaymentProvider }> {
    // Import here to avoid circular dependency
    const { db } = await import("@/db/drizzle");
    const { subscription } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    const [subscriptionRecord] = await db
      .select()
      .from(subscription)
      .where(eq(subscription.id, subscriptionId))
      .limit(1);

    if (!subscriptionRecord) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    return {
      ...subscriptionRecord,
      recurringInterval: subscriptionRecord.recurringInterval as "month" | "year",
      status: subscriptionRecord.status as SubscriptionStatus,
      paymentProvider: subscriptionRecord.paymentProvider as PaymentProvider,
      provider: subscriptionRecord.paymentProvider as PaymentProvider,
    };
  }

  /**
   * Verify webhook (auto-detects provider from payload)
   */
  static async verifyWebhook(
    payload: unknown,
    signature: string | null,
    provider: PaymentProvider
  ) {
    const providerInstance = await PaymentProviderFactory.getProvider(provider);
    return providerInstance.verifyWebhook(payload, signature);
  }

  /**
   * Process webhook
   */
  static async processWebhook(payload: unknown, provider: PaymentProvider): Promise<void> {
    const providerInstance = await PaymentProviderFactory.getProvider(provider);
    return providerInstance.processWebhook(payload);
  }
}
