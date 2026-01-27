/**
 * Polar Payment Provider
 * Wrapper for existing Polar.sh payment integration
 */

import type {
  CheckoutOptions,
  CheckoutResult,
  CustomerPortalResult,
  WebhookVerificationResult,
} from "../../types";
import type { IPaymentProvider } from "../base";
import { POLAR_CONFIG } from "../../config";
import { db } from "@/db/drizzle";
import { subscription as subscriptionTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

/**
 * Polar Payment Provider
 * Wraps the existing Polar.sh integration
 */
export class PolarProvider implements IPaymentProvider {
  readonly name = "polar" as const;

  // ========================================================================
  // Public Methods
  // ========================================================================

  /**
   * Create a checkout session for Polar
   * Uses the existing Better Auth integration
   */
  async createCheckout(options: CheckoutOptions): Promise<CheckoutResult> {
    // Import auth client dynamically to avoid circular dependency
    const { authClient } = await import("@/lib/auth-client");

    // Call Polar checkout through Better Auth
    const result = await authClient.checkout({
      products: [options.productId],
      slug: options.slug,
    });

    // Polar redirects directly, so we return a placeholder
    // The actual redirect happens in the auth client
    return {
      checkoutUrl: "", // Polar handles redirect internally
      checkoutId: options.productId, // Use product ID as checkout ID
      provider: "polar",
    };
  }

  /**
   * Create customer portal for Polar
   * Uses the existing Better Auth integration
   */
  async createCustomerPortal(subscriptionId: string): Promise<CustomerPortalResult> {
    // Import auth client dynamically
    const { authClient } = await import("@/lib/auth-client");

    // Call Polar customer portal through Better Auth
    const result = await authClient.customer.portal();

    // Polar handles redirect internally
    return {
      portalUrl: "", // Polar handles redirect internally
      provider: "polar",
    };
  }

  /**
   * Cancel subscription for Polar
   * Note: Polar doesn't have a direct cancel API, users cancel through the portal
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = false): Promise<void> {
    // Polar subscriptions should be canceled through the customer portal
    // We update the local database to reflect the cancellation
    await db
      .update(subscriptionTable)
      .set({
        status: "canceled",
        canceledAt: new Date(),
        cancelAtPeriodEnd,
      })
      .where(eq(subscriptionTable.id, subscriptionId));
  }

  /**
   * Verify Polar webhook signature
   * Polar uses HMAC SHA-256 with the webhook secret
   */
  verifyWebhook(payload: unknown, signature: string | null): WebhookVerificationResult {
    if (!POLAR_CONFIG.webhookSecret) {
      return {
        valid: false,
        error: "Polar webhook secret not configured",
      };
    }

    if (!signature) {
      return {
        valid: false,
        error: "Missing webhook signature",
      };
    }

    // Polar uses HMAC SHA-256 for webhook verification
    const expectedSignature = crypto
      .createHmac("sha256", POLAR_CONFIG.webhookSecret)
      .update(JSON.stringify(payload))
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      return {
        valid: false,
        error: "Invalid webhook signature",
      };
    }

    // Extract webhook type from payload
    const webhookPayload = payload as { type?: string; data?: unknown };

    return {
      valid: true,
      payload: {
        type: webhookPayload.type || "unknown",
        data: webhookPayload.data,
        provider: "polar",
      },
    };
  }

  /**
   * Process webhook payload
   * For Polar, webhooks are handled by Better Auth plugin
   * This method is provided for consistency with the interface
   */
  async processWebhook(payload: unknown): Promise<void> {
    // Polar webhooks are processed by the Better Auth plugin in lib/auth.ts
    // This method is a no-op for consistency with the interface
    console.log("Polar webhook processing delegated to Better Auth plugin");

    // Extract and log webhook type for debugging
    const webhookPayload = payload as { type?: string };
    console.log("Webhook type:", webhookPayload.type);
  }
}
