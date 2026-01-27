/**
 * Paymob Webhook Verifier
 * HMAC SHA-512 signature verification for Paymob webhooks
 */

import crypto from "crypto";
import type { PaymobWebhookObject, PAYMOB_HMAC_KEYS } from "./types";

/**
 * Extract value from object using dot notation
 * @param obj - Object to extract from
 * @param path - Dot-separated path (e.g., "order.id")
 * @returns The value at the path
 */
function extractValue(obj: any, path: string): string {
  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return "";
    }
    current = current[key];
  }

  return String(current ?? "");
}

/**
 * Construct the HMAC string from webhook payload
 * @param payload - Webhook payload object
 * @returns Concatenated string for HMAC calculation
 */
function constructHmacString(payload: PaymobWebhookObject): string {
  const keys = [
    "amount_cents",
    "created_at",
    "currency",
    "error_occured",
    "has_parent_transaction",
    "obj.id",
    "integration_id",
    "is_3d_secure",
    "is_auth",
    "is_capture",
    "is_refunded",
    "is_standalone_payment",
    "is_voided",
    "order.id",
    "order.created_at",
    "owner",
    "pending",
    "source_data.pan",
    "source_data.sub_type",
    "source_data.type",
    "success",
  ] as const;

  return keys
    .map((key) => {
      if (key.startsWith("obj.")) {
        // Extract from obj (root object)
        const objKey = key.substring(4);
        return extractValue(payload, objKey);
      } else if (key.startsWith("order.")) {
        // Extract from order
        return extractValue(payload.order || {}, key.substring(6));
      } else if (key.startsWith("source_data.")) {
        // Extract from source_data
        return extractValue(payload.source_data || {}, key.substring(13));
      } else {
        // Direct property
        return extractValue(payload, key);
      }
    })
    .join("");
}

/**
 * Verify Paymob webhook signature
 * @param payload - Raw webhook payload (object)
 * @param signature - HMAC signature from x-hmac header
 * @param hmacSecret - Paymob HMAC secret from dashboard
 * @returns True if signature is valid
 */
export function verifyPaymobHmac(
  payload: unknown,
  signature: string | null,
  hmacSecret: string
): boolean {
  if (!signature || !hmacSecret) {
    return false;
  }

  try {
    const obj = payload as PaymobWebhookObject;

    // Construct the HMAC string
    const hmacString = constructHmacString(obj);

    // Calculate HMAC SHA-512
    const calculatedHmac = crypto
      .createHmac("sha512", hmacSecret)
      .update(hmacString)
      .digest("hex");

    // Compare with received signature
    return crypto.timingSafeEqual(
      Buffer.from(calculatedHmac, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch (error) {
    console.error("Error verifying Paymob HMAC:", error);
    return false;
  }
}

/**
 * Extract Paymob webhook object from full payload
 * @param payload - Raw webhook payload (may have wrapper)
 * @returns The Paymob webhook object
 */
export function extractPaymobWebhookObject(payload: unknown): PaymobWebhookObject | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  // Check if payload has obj property (standard Paymob format)
  if ("obj" in payload && payload.obj) {
    return payload.obj as PaymobWebhookObject;
  }

  // Check if payload is already the object
  if ("id" in payload && "amount_cents" in payload) {
    return payload as PaymobWebhookObject;
  }

  return null;
}

/**
 * Get webhook event type from payload
 * @param payload - Webhook payload
 * @returns Event type string (e.g., "TRANSACTION_SUCCESS", "TRANSACTION_FAILED")
 */
export function getPaymobWebhookEventType(payload: unknown): string | null {
  const obj = extractPaymobWebhookObject(payload);

  if (!obj) {
    return null;
  }

  if (obj.success) {
    return "TRANSACTION_SUCCESS";
  } else if (obj.error_occured) {
    return "TRANSACTION_FAILED";
  } else if (obj.pending) {
    return "TRANSACTION_PENDING";
  }

  return "TRANSACTION_UNKNOWN";
}

/**
 * Log HMAC calculation for debugging
 * @param payload - Webhook payload
 * @param hmacSecret - HMAC secret
 * @returns Debug information
 */
export function debugHmacCalculation(
  payload: unknown,
  hmacSecret: string
): {
  hmacString: string;
  calculatedHmac: string;
  keys: Array<{ key: string; value: string }>;
} {
  const obj = payload as PaymobWebhookObject;

  const keys = [
    "amount_cents",
    "created_at",
    "currency",
    "error_occured",
    "has_parent_transaction",
    "obj.id",
    "integration_id",
    "is_3d_secure",
    "is_auth",
    "is_capture",
    "is_refunded",
    "is_standalone_payment",
    "is_voided",
    "order.id",
    "order.created_at",
    "owner",
    "pending",
    "source_data.pan",
    "source_data.sub_type",
    "source_data.type",
    "success",
  ] as const;

  const keyValuePairs = keys.map((key) => {
    let value: string;

    if (key.startsWith("obj.")) {
      value = extractValue(obj, key.substring(4));
    } else if (key.startsWith("order.")) {
      value = extractValue(obj.order || {}, key.substring(6));
    } else if (key.startsWith("source_data.")) {
      value = extractValue(obj.source_data || {}, key.substring(13));
    } else {
      value = extractValue(obj, key);
    }

    return { key, value };
  });

  const hmacString = keyValuePairs.map((kv) => kv.value).join("");
  const calculatedHmac = crypto
    .createHmac("sha512", hmacSecret)
    .update(hmacString)
    .digest("hex");

  return {
    hmacString,
    calculatedHmac,
    keys: keyValuePairs,
  };
}
