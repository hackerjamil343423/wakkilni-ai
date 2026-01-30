/**
 * Streampay Webhook Verification Utilities
 * HMAC-SHA256 signature verification for Streampay webhooks
 */

import { createHmac, timingSafeEqual } from "crypto";

/**
 * Extract timestamp and signature from the webhook signature header
 * Format: t={timestamp},v1={signature}
 *
 * @param signatureHeader - The X-Webhook-Signature header value
 * @returns Object with timestamp and signature, or null if invalid
 */
export function parseWebhookSignature(signatureHeader: string): { timestamp: string; signature: string } | null {
  try {
    const parts = signatureHeader.split(",").reduce<Record<string, string>>((acc, part) => {
      const [key, value] = part.split("=");
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {});

    const timestamp = parts["t"];
    const signature = parts["v1"];

    if (!timestamp || !signature) {
      return null;
    }

    return { timestamp, signature };
  } catch {
    return null;
  }
}

/**
 * Verify the webhook signature using HMAC-SHA256
 *
 * @param payload - Raw webhook request body as string or Buffer
 * @param signatureHeader - The X-Webhook-Signature header value
 * @param secret - The webhook secret key
 * @returns True if signature is valid, false otherwise
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signatureHeader: string,
  secret: string
): boolean {
  try {
    const parsed = parseWebhookSignature(signatureHeader);
    if (!parsed) {
      return false;
    }

    const { timestamp, signature } = parsed;

    // Create the message to sign: {timestamp}.{payload}
    const payloadString = typeof payload === "string" ? payload : payload.toString("utf-8");
    const message = `${timestamp}.${payloadString}`;

    // Compute HMAC-SHA256
    const hmac = createHmac("sha256", secret);
    hmac.update(message);
    const computedSignature = hmac.digest("hex");

    // Use constant-time comparison to prevent timing attacks
    return timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature));
  } catch {
    return false;
  }
}

/**
 * Check if the webhook timestamp is within acceptable time range
 * Prevents replay attacks by ensuring the webhook is recent
 *
 * @param timestamp - The timestamp from the webhook signature
 * @param maxAgeSeconds - Maximum age in seconds (default: 5 minutes)
 * @returns True if timestamp is within acceptable range
 */
export function isWebhookTimestampValid(timestamp: string, maxAgeSeconds: number = 300): boolean {
  try {
    const webhookTime = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    const timeDiff = Math.abs(now - webhookTime);

    return timeDiff <= maxAgeSeconds;
  } catch {
    return false;
  }
}
