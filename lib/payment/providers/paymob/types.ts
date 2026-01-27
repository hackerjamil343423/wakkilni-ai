/**
 * Paymob API Types
 * TypeScript definitions for Paymob API requests and responses
 */

// ============================================================================
// Authentication
// ============================================================================

export interface PaymobAuthRequest {
  apiKey: string;
}

export interface PaymobAuthResponse {
  token: string;
  // Token is typically valid for 1 hour
}

// ============================================================================
// Intention (Checkout Session)
// ============================================================================

export interface PaymobIntentionRequest {
  amount: number; // in cents
  currency: string;
  payment_methods: number[]; // Array of integration IDs
  items: PaymobIntentionItem[];
  billing_data: PaymobBillingData;
  customer: PaymobCustomer;
  notification_url: string;
  redirection_url: string;

  // Subscription fields
  subscription_plan_id?: number;
  subscription_start_date?: string; // YYYY-MM-DD format

  // Optional fields
  order?: {
    id?: string;
    description?: string;
  };
  special_order_reference?: string;
}

export interface PaymobIntentionItem {
  name: string;
  amount: number;
  description?: string;
  quantity: number;
}

export interface PaymobBillingData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  city: string;
  country: string;
  state?: string;
  street?: string;
  building?: string;
  floor?: string;
  apartment?: string;
  postal_code?: string;
}

export interface PaymobCustomer {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

export interface PaymobIntentionResponse {
  id: string; // Intention ID
  client_secret: string; // Used for checkout redirect
  amount: number;
  currency: string;
  payment_methods: number[];
  created_at: string;
  expiration_date: string;
}

// ============================================================================
// Subscription Plan
// ============================================================================

export interface PaymobSubscriptionPlan {
  id: number;
  frequency: number; // Days between billing cycles
  name: string;
  amount_cents: number;
  currency: string;
  integration: number; // Integration ID (MOTO)
  created_at: string;
}

export interface PaymobCreateSubscriptionPlanRequest {
  frequency: number;
  name: string;
  amount_cents: number;
  integration: number;
}

// ============================================================================
// Webhook Payload
// ============================================================================

export interface PaymobWebhookPayload {
  obj: PaymobWebhookObject;
  type: string;
}

export interface PaymobWebhookObject {
  id: string;
  amount_cents: number;
  created_at: string;
  currency: string;
  current_transaction: string;
  error_occured: boolean;
  has_parent_transaction: boolean;
  integration_id: number;
  is_3d_secure: boolean;
  is_auth: boolean;
  is_capture: boolean;
  is_refunded: boolean;
  is_standalone_payment: boolean;
  is_voided: boolean;
  order: {
    id: number;
    created_at: string;
    shipping_data?: PaymobBillingData;
    gateway_order_reference?: string;
  };
  owner: number;
  parent_transaction: string | null;
  pending: boolean;
  source_data: {
    type: string;
    sub_type: string;
    pan: string;
    issuer?: string;
  };
  success: boolean;
  token?: string;
  transaction_type: string;
  // Subscription fields
  subscription_id?: number;
  subscription_plan_id?: number;
}

// ============================================================================
// HMAC Verification Keys
// ============================================================================

/**
 * IMPORTANT: Paymob HMAC is sent as a QUERY parameter named 'hmac', not as a header
 * The webhook URL will be: https://yourapp.com/api/payment/webhooks/paymob?hmac=<calculated_hmac>
 *
 * Keys in lexicographic order for HMAC calculation
 * Source: Paymob documentation - https://developers.paymob.com/ksa/manage-callback/hmac
 */
export const PAYMOB_HMAC_KEYS = [
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

// ============================================================================
// Transaction Types
// ============================================================================

export type PaymobTransactionType =
  | "AUTH"
  | "CAPTURE"
  | "REFUND"
  | "VOID"
  | "SALE";

export type PaymodSourceType =
  | "CARD"
  | "WALLET"
  | "INSTALLMENTS"
  | "BANK_ACCOUNT"
  | "PAY_N_PLAY";

// ============================================================================
// Error Types
// ============================================================================

export interface PaymobErrorResponse {
  error: {
    type: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// ============================================================================
// Unified Checkout URL
// ============================================================================

/**
 * Construct the unified checkout URL
 * @param publicKey - Paymob public key
 * @param clientSecret - Client secret from intention response
 * @param iframeMode - Whether to use iframe mode (default: false)
 * @returns Full checkout URL
 */
export function buildCheckoutUrl(
  publicKey: string,
  clientSecret: string,
  iframeMode = false
): string {
  const baseUrl = "https://ksa.paymob.com/unifiedcheckout/";

  if (iframeMode) {
    return `${baseUrl}?publicKey=${publicKey}&clientSecret=${clientSecret}&iframe=true`;
  }

  return `${baseUrl}?publicKey=${publicKey}&clientSecret=${clientSecret}`;
}
