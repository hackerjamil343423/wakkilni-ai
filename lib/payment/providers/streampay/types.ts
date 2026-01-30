/**
 * Streampay API Types
 * Types for Streampay API responses and requests
 */

// ============================================================================
// Product Types
// ============================================================================

export type ProductType = "ONE_OFF" | "RECURRING";

export type RecurringInterval = "WEEK" | "MONTH" | "SEMESTER" | "YEAR";

export interface StreampayProduct {
  id: string;
  name: string;
  description?: string;
  type: ProductType;
  recurring_interval?: RecurringInterval;
  recurring_interval_count?: number;
  price: string;
  currency: string;
  is_active: boolean;
  is_one_time: boolean;
  is_price_exempt_from_vat: boolean;
  is_price_inclusive_of_vat: boolean;
  price_excluding_vat?: string;
  vat_amount?: string;
  is_used_in_finalized_invoice?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductRequest {
  name: string;
  price: number | string;
  type: ProductType;
  description?: string;
  is_one_time?: boolean;
  recurring_interval?: RecurringInterval;
  recurring_interval_count?: number;
  is_price_exempt_from_vat?: boolean;
  is_price_inclusive_of_vat?: boolean;
}

// ============================================================================
// Consumer Types
// ============================================================================

export type CommunicationMethod = "WHATSAPP" | "EMAIL" | "SMS";

export interface StreampayConsumer {
  id: string;
  name: string;
  phone_number?: string;
  email?: string;
  external_id?: string;
  iban?: string;
  alias?: string;
  comment?: string;
  preferred_language?: string;
  communication_methods?: CommunicationMethod[];
  is_deleted: boolean;
  created_at: string;
  branch?: {
    id: string;
    name: string;
  };
  last_invoice_activity?: {
    id: string;
    org_invoice_number: number;
    subscription_id?: string;
  };
}

export interface CreateConsumerRequest {
  name: string;
  phone_number?: string;
  email?: string;
  external_id?: string;
  iban?: string;
  alias?: string;
  comment?: string;
  preferred_language?: string;
  communication_methods?: CommunicationMethod[];
}

// ============================================================================
// Payment Link Types
// ============================================================================

export type ContactInformationType = "PHONE" | "EMAIL";

export interface PaymentLinkItem {
  product_id: string;
  quantity: number;
  coupons?: string[];
}

export interface StreampayPaymentLink {
  url: string;
  id: string;
  name: string;
  description?: string;
  status: string;
  amount: string;
  original_amount?: string;
  currency: string;
  items: PaymentLinkItem[];
  organization_consumer_id?: string;
  contact_information_type?: ContactInformationType;
  max_number_of_payments?: number;
  success_redirect_url: string;
  failure_redirect_url: string;
  custom_metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentLinkRequest {
  name: string;
  items: PaymentLinkItem[];
  success_redirect_url: string;
  failure_redirect_url: string;
  description?: string;
  organization_consumer_id?: string;
  contact_information_type?: ContactInformationType;
  currency?: string;
  max_number_of_payments?: number;
  custom_metadata?: Record<string, unknown>;
}

// ============================================================================
// Invoice Types
// ============================================================================

export type InvoiceStatus = "DRAFT" | "CREATED" | "SENT" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELED" | "EXPIRED";

export type PaymentMethod = "OPENBANKING" | "PAYMENTGATEWAY";

export type InvoiceType = "ONE_OFF" | "ONE_OFF_FUTURE" | "RECURRING" | "INSTALLMENTS";

export interface StreampayInvoice {
  id: string;
  org_invoice_number: number;
  description?: string;
  total_amount: string;
  original_amount: string;
  item_level_discounted_amount?: string;
  total_vat_amount: string;
  total_price_excluding_vat: string;
  currency: string;
  status: InvoiceStatus;
  payment_method?: PaymentMethod;
  invoice_type?: InvoiceType;
  subscription_id?: string;
  subscription?: StreampaySubscription;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Subscription Types
// ============================================================================

export type SubscriptionStatus = "INACTIVE" | "ACTIVE" | "EXPIRED" | "CANCELED" | "FROZEN";

export interface SubscriptionItem {
  product_id: string;
  quantity: number;
  coupons?: string[];
}

export interface StreampaySubscription {
  id: string;
  description?: string;
  amount: string;
  original_amount: string;
  currency: string;
  recurring_interval: RecurringInterval;
  recurring_interval_count: number;
  status: SubscriptionStatus;
  current_cycle_number: number;
  cancel_at_period_end: boolean;
  cancel_at_cycle_number?: number;
  started_at: string;
  ended_at?: string;
  organization_consumer_id: string;
  latest_invoice_id: string;
  items: SubscriptionItem[];
  latest_freeze?: {
    id: string;
    start: string;
    end?: string;
  };
}

// ============================================================================
// Webhook Types
// ============================================================================

export type WebhookEventType =
  | "PAYMENT_SUCCEEDED"
  | "PAYMENT_FAILED"
  | "PAYMENT_CANCELED"
  | "PAYMENT_REFUNDED"
  | "PAYMENT_MARKED_AS_PAID"
  | "INVOICE_CREATED"
  | "INVOICE_SENT"
  | "INVOICE_ACCEPTED"
  | "INVOICE_REJECTED"
  | "INVOICE_COMPLETED"
  | "INVOICE_CANCELED"
  | "INVOICE_UPDATED"
  | "SUBSCRIPTION_CREATED"
  | "SUBSCRIPTION_ACTIVATED"
  | "SUBSCRIPTION_INACTIVATED"
  | "SUBSCRIPTION_CANCELED"
  | "SUBSCRIPTION_FROZEN"
  | "SUBSCRIPTION_CYCLE_RENEWAL_FAILED"
  | "SUBSCRIPTION_CANCEL_AT_PERIOD_END"
  | "SUBSCRIPTION_FREEZE_NOW"
  | "SUBSCRIPTION_UNFREEZE_NOW"
  | "SUBSCRIPTION_UNFREEZE_FUTURE"
  | "SUBSCRIPTION_FREEZE_CANCEL"
  | "PAYMENT_LINK_PAY_ATTEMPT_FAILED";

export type WebhookEntityType = "PAYMENT" | "INVOICE" | "SUBSCRIPTION" | "PAYMENT_LINK";

export interface StreampayWebhookPayload {
  event_type: WebhookEventType;
  entity_type: WebhookEntityType;
  entity_id: string;
  entity_url: string;
  status: string;
  data: unknown;
  timestamp: string;
}

export interface StreampayWebhookHeaders {
  "content-type": string;
  "user-agent": string;
  "x-webhook-event": WebhookEventType;
  "x-webhook-entity-type": WebhookEntityType;
  "x-webhook-entity-id": string;
  "x-webhook-signature": string;
  "x-webhook-timestamp": string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface StreampayErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}
