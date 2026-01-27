/**
 * Paymob Payment Provider
 * Implementation of IPaymentProvider interface for Paymob
 */

import type {
  CheckoutOptions,
  CheckoutResult,
  CustomerPortalResult,
  WebhookVerificationResult,
  Subscription,
} from "../../types";
import type { IPaymentProvider } from "../base";
import type { PaymobIntentionRequest, PaymobWebhookObject } from "./types";
import {
  createIntention,
  buildCheckoutUrl,
  toCents,
  formatDate,
  addDays,
} from "./api";
import {
  verifyPaymobHmac,
  extractPaymobWebhookObject,
  getPaymobWebhookEventType,
} from "./webhook-verifier";
import { PAYMOB_CONFIG } from "../../config";
import { db } from "@/db/drizzle";
import { subscription as subscriptionTable } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Paymod Payment Provider
 */
export class PaymobProvider implements IPaymentProvider {
  readonly name = "paymob" as const;

  // ========================================================================
  // Public Methods
  // ========================================================================

  /**
   * Create a checkout session for Paymob
   */
  async createCheckout(options: CheckoutOptions): Promise<CheckoutResult> {
    // Validate configuration
    if (!PAYMOB_CONFIG.apiKey) {
      throw new Error("PAYMOB_SECRET_KEY environment variable is required");
    }
    if (!PAYMOB_CONFIG.publicKey) {
      throw new Error("PAYMOB_PUBLIC_KEY environment variable is required");
    }
    if (!PAYMOB_CONFIG.integrationId3DS) {
      throw new Error("PAYMOB_INTEGRATION_ID_3DS environment variable is required");
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

    // Build intention request
    const intentionData: PaymobIntentionRequest = {
      amount: toCents(1000), // $10.00 in cents - adjust based on product
      currency: "SAR",
      payment_methods: [PAYMOB_CONFIG.integrationId3DS],
      items: [
        {
          name: "Starter Plan",
          amount: toCents(1000),
          quantity: 1,
        },
      ],
      billing_data: {
        first_name: user.name?.split(" ")[0] || "User",
        last_name: user.name?.split(" ").slice(1).join(" ") || "",
        email: user.email,
        phone_number: "+966500000000", // Default or get from user profile
        city: "Riyadh",
        country: "SA",
      },
      customer: {
        first_name: user.name?.split(" ")[0] || "User",
        last_name: user.name?.split(" ").slice(1).join(" ") || "",
        email: user.email,
        phone_number: "+966500000000",
      },
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhooks/paymob`,
      redirection_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payment?success=true`,
      subscription_plan_id: PAYMOB_CONFIG.starterPlanId,
      subscription_start_date: formatDate(addDays(new Date(), 30)), // Start in 30 days
    };

    // Create intention
    const intention = await createIntention(PAYMOB_CONFIG.apiKey, intentionData);

    // Build checkout URL
    const checkoutUrl = buildCheckoutUrl(PAYMOB_CONFIG.publicKey, intention.client_secret);

    return {
      checkoutUrl,
      checkoutId: intention.id,
      provider: "paymob",
    };
  }

  /**
   * Create customer portal
   * Note: Paymob doesn't have a hosted portal, so we return a custom management page
   */
  async createCustomerPortal(subscriptionId: string): Promise<CustomerPortalResult> {
    // Paymob doesn't have a hosted customer portal
    // Return to our custom payment management page
    return {
      portalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payment?subscription=${subscriptionId}`,
      provider: "paymob",
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

    // For Paymob, we handle cancellation by updating the database
    // In production, you would also call Paymob's cancellation API if available
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
    if (!PAYMOB_CONFIG.hmacSecret) {
      return {
        valid: false,
        error: "Paymob HMAC secret not configured",
      };
    }

    const isValid = verifyPaymobHmac(payload, signature, PAYMOB_CONFIG.hmacSecret);

    if (!isValid) {
      return {
        valid: false,
        error: "Invalid HMAC signature",
      };
    }

    const obj = extractPaymobWebhookObject(payload);
    if (!obj) {
      return {
        valid: false,
        error: "Invalid webhook payload structure",
      };
    }

    const eventType = getPaymobWebhookEventType(payload);

    return {
      valid: true,
      payload: {
        type: eventType || "TRANSACTION_UNKNOWN",
        data: obj,
        provider: "paymob",
      },
    };
  }

  /**
   * Process webhook payload
   */
  async processWebhook(payload: unknown): Promise<void> {
    const obj = extractPaymobWebhookObject(payload);
    if (!obj) {
      console.error("Invalid Paymob webhook payload");
      return;
    }

    const eventType = getPaymobWebhookEventType(payload);
    console.log("Processing Paymob webhook:", eventType, obj.id);

    try {
      // Only process successful transactions
      if (obj.success) {
        await this.handleSuccessfulTransaction(obj);
      } else if (obj.error_occured) {
        await this.handleFailedTransaction(obj);
      }
    } catch (error) {
      console.error("Error processing Paymob webhook:", error);
      // Don't throw - webhook should always return success
    }
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  /**
   * Handle successful transaction
   */
  private async handleSuccessfulTransaction(obj: PaymobWebhookObject): Promise<void> {
    // Check if this is a subscription transaction
    const subscriptionId = obj.subscription_id
      ? `paymob_sub_${obj.subscription_id}`
      : `paymob_txn_${obj.id}`;

    // Check if subscription already exists
    const [existingSubscription] = await db
      .select()
      .from(subscriptionTable)
      .where(eq(subscriptionTable.id, subscriptionId))
      .limit(1);

    const now = new Date();
    const periodEnd = addDays(now, 30); // 30-day billing cycle

    const subscriptionData = {
      id: subscriptionId,
      createdAt: now,
      modifiedAt: now,
      amount: obj.amount_cents,
      currency: obj.currency,
      recurringInterval: "month",
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      startedAt: now,
      endsAt: periodEnd,
      endedAt: null,
      customerId: obj.owner.toString(),
      productId: obj.subscription_plan_id?.toString() || "paymob_starter",
      checkoutId: obj.id,
      paymentProvider: "paymob",
      paymobIntentionId: obj.id,
      paymobSubscriptionPlanId: obj.subscription_plan_id || null,
      paymobCustomerId: obj.owner.toString(),
      userId: null, // Will be linked separately
    };

    if (existingSubscription) {
      // Update existing subscription
      await db
        .update(subscriptionTable)
        .set({
          ...subscriptionData,
          modifiedAt: now,
        })
        .where(eq(subscriptionTable.id, subscriptionId));
    } else {
      // Insert new subscription
      await db.insert(subscriptionTable).values(subscriptionData);
    }

    console.log("Paymob subscription processed:", subscriptionId);
  }

  /**
   * Handle failed transaction
   */
  private async handleFailedTransaction(obj: PaymobWebhookObject): Promise<void> {
    const subscriptionId = obj.subscription_id
      ? `paymob_sub_${obj.subscription_id}`
      : `paymob_txn_${obj.id}`;

    // Update subscription status if it exists
    await db
      .update(subscriptionTable)
      .set({
        status: "past_due",
        modifiedAt: new Date(),
      })
      .where(eq(subscriptionTable.id, subscriptionId));

    console.log("Paymob transaction failed:", obj.id);
  }
}
