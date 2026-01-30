/**
 * Streampay Payment Provider
 * Implementation of IPaymentProvider interface for Streampay
 */

import type {
  CheckoutOptions,
  CheckoutResult,
  CustomerPortalResult,
  WebhookVerificationResult,
} from "../../types";
import type { IPaymentProvider } from "../base";
import type {
  StreampayWebhookPayload,
  StreampayInvoice,
  StreampaySubscription as StreampaySubscriptionType,
} from "./types";
import {
  createPaymentLink,
  getInvoice,
  cancelSubscription as cancelStreampaySubscription,
  buildRedirectUrls,
} from "./api";
import {
  verifyWebhookSignature,
  isWebhookTimestampValid,
  parseWebhookSignature,
} from "./webhooks";
import { STREAMPAY_CONFIG } from "../../config";
import { db } from "@/db/drizzle";
import { subscription as subscriptionTable } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Streampay Payment Provider
 */
export class StreampayProvider implements IPaymentProvider {
  readonly name = "streampay" as const;

  // ========================================================================
  // Public Methods
  // ========================================================================

  /**
   * Create a checkout session for Streampay
   */
  async createCheckout(options: CheckoutOptions): Promise<CheckoutResult> {
    // Validate configuration
    if (!STREAMPAY_CONFIG.apiKey || !STREAMPAY_CONFIG.apiSecret) {
      throw new Error("STREAMPAY_API_KEY and STREAMPAY_API_SECRET environment variables are required");
    }
    if (!STREAMPAY_CONFIG.starterProductId) {
      throw new Error("STREAMPAY_STARTER_PRODUCT_ID environment variable is required");
    }

    // Get user data for billing
    const { auth } = await import("@/lib/auth");
    const { headers } = await import("next/headers");
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("User must be authenticated to create checkout");
    }

    const user = session.user;

    // Build redirect URLs
    const { success_redirect_url, failure_redirect_url } = buildRedirectUrls(
      options.successUrl || "/dashboard/payment?success=true",
      options.cancelUrl || "/dashboard/payment?success=false"
    );

    // Create payment link
    const paymentLink = await createPaymentLink({
      name: `Subscription for ${user.email || user.name}`,
      description: "Starter Plan Subscription",
      items: [
        {
          product_id: STREAMPAY_CONFIG.starterProductId,
          quantity: 1,
        },
      ],
      success_redirect_url,
      failure_redirect_url,
      contact_information_type: "EMAIL",
      currency: STREAMPAY_CONFIG.currency,
      max_number_of_payments: 1,
      custom_metadata: {
        user_id: user.id,
        product_id: options.productId,
        ...options.metadata,
      },
    });

    return {
      checkoutUrl: paymentLink.url,
      checkoutId: paymentLink.id,
      provider: "streampay",
    };
  }

  /**
   * Create customer portal
   * Note: Streampay doesn't have a hosted portal, so we return a custom management page
   */
  async createCustomerPortal(subscriptionId: string): Promise<CustomerPortalResult> {
    // Streampay doesn't have a hosted customer portal
    // Return to our custom payment management page
    return {
      portalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payment?subscription=${subscriptionId}`,
      provider: "streampay",
    };
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = false): Promise<void> {
    // Get subscription record
    const [subscriptionRecord] = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.id, subscriptionId))
      .limit(1);

    if (!subscriptionRecord) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    // Call Streampay API to cancel subscription
    if (subscriptionRecord.streampaySubscriptionId) {
      try {
        await cancelStreampaySubscription(subscriptionRecord.streampaySubscriptionId, cancelAtPeriodEnd);
      } catch (error) {
        console.error("Failed to cancel Streampay subscription:", error);
        // Continue to update local database even if API call fails
      }
    }

    // Update local database
    await db
      .update(subscriptionTable)
      .set({
        status: "canceled",
        canceledAt: new Date(),
        cancelAtPeriodEnd,
        // If not canceling at period end, set endsAt
        endsAt: cancelAtPeriodEnd ? subscriptionRecord.endsAt : new Date(),
      })
      .where(eq(subscriptionTable.id, subscriptionId));
  }

  /**
   * Verify webhook signature
   */
  verifyWebhook(payload: unknown, signature: string | null): WebhookVerificationResult {
    if (!STREAMPAY_CONFIG.webhookSecret) {
      return {
        valid: false,
        error: "Streampay webhook secret not configured",
      };
    }

    if (!signature) {
      return {
        valid: false,
        error: "Missing webhook signature",
      };
    }

    // Parse signature to get timestamp
    const parsed = parseWebhookSignature(signature);
    if (!parsed) {
      return {
        valid: false,
        error: "Invalid webhook signature format",
      };
    }

    // Check timestamp is within acceptable range (5 minutes)
    if (!isWebhookTimestampValid(parsed.timestamp, 300)) {
      return {
        valid: false,
        error: "Webhook timestamp is too old or in the future",
      };
    }

    // Verify signature
    const rawPayload = typeof payload === "string" ? payload : JSON.stringify(payload);
    const isValid = verifyWebhookSignature(rawPayload, signature, STREAMPAY_CONFIG.webhookSecret);

    if (!isValid) {
      return {
        valid: false,
        error: "Invalid webhook signature",
      };
    }

    // Parse webhook payload
    const webhookPayload = payload as StreampayWebhookPayload;

    return {
      valid: true,
      payload: {
        type: webhookPayload.event_type,
        data: webhookPayload.data,
        provider: "streampay",
      },
    };
  }

  /**
   * Process webhook payload
   */
  async processWebhook(payload: unknown): Promise<void> {
    const webhookPayload = payload as StreampayWebhookPayload;
    console.log("Processing Streampay webhook:", webhookPayload.event_type, webhookPayload.entity_id);

    try {
      switch (webhookPayload.event_type) {
        case "PAYMENT_SUCCEEDED":
          await this.handlePaymentSucceeded(webhookPayload);
          break;
        case "PAYMENT_FAILED":
          await this.handlePaymentFailed(webhookPayload);
          break;
        case "INVOICE_COMPLETED":
          await this.handleInvoiceCompleted(webhookPayload);
          break;
        case "SUBSCRIPTION_CANCELED":
          await this.handleSubscriptionCanceled(webhookPayload);
          break;
        case "SUBSCRIPTION_CYCLE_RENEWAL_FAILED":
          await this.handleSubscriptionRenewalFailed(webhookPayload);
          break;
        case "SUBSCRIPTION_CREATED":
        case "SUBSCRIPTION_ACTIVATED":
          await this.handleSubscriptionActivated(webhookPayload);
          break;
        default:
          console.log("Unhandled Streampay webhook event:", webhookPayload.event_type);
      }
    } catch (error) {
      console.error("Error processing Streampay webhook:", error);
      // Don't throw - webhook should always return success
    }
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  /**
   * Handle successful payment
   */
  private async handlePaymentSucceeded(payload: StreampayWebhookPayload): Promise<void> {
    // Payment succeeded - invoice will be created/updated
    // We'll handle subscription creation in INVOICE_COMPLETED or SUBSCRIPTION_ACTIVATED
    console.log("Streampay payment succeeded:", payload.entity_id);
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(payload: StreampayWebhookPayload): Promise<void> {
    // Update subscription status if we can find it
    const data = payload.data as { subscription_id?: string };
    if (data.subscription_id) {
      await db
        .update(subscriptionTable)
        .set({
          status: "past_due",
          modifiedAt: new Date(),
        })
        .where(eq(subscriptionTable.streampaySubscriptionId, data.subscription_id));
    }
    console.log("Streampay payment failed:", payload.entity_id);
  }

  /**
   * Handle invoice completed (payment finalized)
   */
  private async handleInvoiceCompleted(payload: StreampayWebhookPayload): Promise<void> {
    // Get invoice details to verify
    const invoice = await getInvoice(payload.entity_id);
    console.log("Streampay invoice completed:", invoice.id, invoice.status);

    // If this is a subscription invoice, handle renewal
    if (invoice.subscription_id) {
      await this.handleSubscriptionRenewal(invoice);
    }
  }

  /**
   * Handle subscription activation/creation
   */
  private async handleSubscriptionActivated(payload: StreampayWebhookPayload): Promise<void> {
    const data = payload.data as StreampaySubscriptionType;
    console.log("Streampay subscription activated:", data.id);

    // Check if subscription already exists
    const [existingSubscription] = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.streampaySubscriptionId, data.id))
      .limit(1);

    const now = new Date();
    const startedAt = new Date(data.started_at);

    // Calculate period end based on recurring interval
    const periodEnd = new Date(startedAt);
    switch (data.recurring_interval) {
      case "WEEK":
        periodEnd.setDate(periodEnd.getDate() + 7 * data.recurring_interval_count);
        break;
      case "MONTH":
        periodEnd.setMonth(periodEnd.getMonth() + data.recurring_interval_count);
        break;
      case "SEMESTER":
        periodEnd.setMonth(periodEnd.getMonth() + 6 * data.recurring_interval_count);
        break;
      case "YEAR":
        periodEnd.setFullYear(periodEnd.getFullYear() + data.recurring_interval_count);
        break;
    }

    const subscriptionData = {
      id: `streampay_sub_${data.id}`,
      createdAt: now,
      modifiedAt: now,
      amount: parseFloat(data.amount) / 100, // Convert from cents if needed
      currency: data.currency,
      recurringInterval: data.recurring_interval.toLowerCase() as "month" | "year" | "week",
      status: data.status.toLowerCase() as "active" | "canceled" | "past_due" | "incomplete",
      currentPeriodStart: startedAt,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: data.cancel_at_period_end,
      canceledAt: null,
      startedAt,
      endsAt: data.ended_at ? new Date(data.ended_at) : periodEnd,
      endedAt: data.ended_at ? new Date(data.ended_at) : null,
      customerId: data.organization_consumer_id,
      productId: STREAMPAY_CONFIG.starterProductId,
      checkoutId: data.id,
      paymentProvider: "streampay" as const,
      streampaySubscriptionId: data.id,
      streampayConsumerId: data.organization_consumer_id,
      userId: null, // Will be linked separately via metadata
    };

    if (existingSubscription) {
      // Update existing subscription
      await db
        .update(subscriptionTable)
        .set(subscriptionData)
        .where(eq(subscriptionTable.streampaySubscriptionId, data.id));
    } else {
      // Insert new subscription
      await db.insert(subscriptionTable).values(subscriptionData);
    }

    console.log("Streampay subscription processed:", data.id);
  }

  /**
   * Handle subscription renewal
   */
  private async handleSubscriptionRenewal(invoice: StreampayInvoice): Promise<void> {
    console.log("Streampay subscription renewal:", invoice.subscription_id);

    // Update subscription's period end
    if (invoice.subscription) {
      const subscription = invoice.subscription;
      const now = new Date();
      const periodEnd = new Date(now);

      // Calculate new period end based on recurring interval
      switch (subscription.recurring_interval) {
        case "WEEK":
          periodEnd.setDate(periodEnd.getDate() + 7 * subscription.recurring_interval_count);
          break;
        case "MONTH":
          periodEnd.setMonth(periodEnd.getMonth() + subscription.recurring_interval_count);
          break;
        case "SEMESTER":
          periodEnd.setMonth(periodEnd.getMonth() + 6 * subscription.recurring_interval_count);
          break;
        case "YEAR":
          periodEnd.setFullYear(periodEnd.getFullYear() + subscription.recurring_interval_count);
          break;
      }

      await db
        .update(subscriptionTable)
        .set({
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          modifiedAt: now,
        })
        .where(eq(subscriptionTable.streampaySubscriptionId, subscription.id));
    }
  }

  /**
   * Handle subscription canceled
   */
  private async handleSubscriptionCanceled(payload: StreampayWebhookPayload): Promise<void> {
    const data = payload.data as StreampaySubscriptionType;
    console.log("Streampay subscription canceled:", data.id);

    await db
      .update(subscriptionTable)
      .set({
        status: "canceled",
        canceledAt: new Date(),
        endsAt: data.ended_at ? new Date(data.ended_at) : new Date(),
        endedAt: data.ended_at ? new Date(data.ended_at) : new Date(),
        modifiedAt: new Date(),
      })
      .where(eq(subscriptionTable.streampaySubscriptionId, data.id));
  }

  /**
   * Handle subscription renewal failed
   */
  private async handleSubscriptionRenewalFailed(payload: StreampayWebhookPayload): Promise<void> {
    const data = payload.data as { subscription_id?: string };
    console.log("Streampay subscription renewal failed:", payload.entity_id);

    if (data.subscription_id) {
      await db
        .update(subscriptionTable)
        .set({
          status: "past_due",
          modifiedAt: new Date(),
        })
        .where(eq(subscriptionTable.streampaySubscriptionId, data.subscription_id));
    }
  }
}
