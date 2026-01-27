/**
 * Payment Configuration
 * Centralized configuration for payment providers
 */

import type { PaymentProvider } from "./types";

// ============================================================================
// Environment Variables
// ============================================================================

/**
 * Default payment provider (fallback when auto-detection fails)
 */
export const DEFAULT_PAYMENT_PROVIDER: PaymentProvider =
  (process.env.DEFAULT_PAYMENT_PROVIDER as PaymentProvider) || "polar";

/**
 * Paymob configuration
 */
export const PAYMOB_CONFIG = {
  apiKey: process.env.PAYMOB_SECRET_KEY || "",
  publicKey: process.env.PAYMOB_PUBLIC_KEY || "",
  hmacSecret: process.env.PAYMOB_HMAC_SECRET || "",
  integrationId3DS: parseInt(process.env.PAYMOB_INTEGRATION_ID_3DS || "0", 10),
  integrationIdMOTO: parseInt(process.env.PAYMOB_INTEGRATION_ID_3DS || "0", 10),
  starterPlanId: parseInt(process.env.PAYMOB_STARTER_PLAN_ID || "0", 10),
  apiUrl: process.env.PAYMOB_API_URL || "https://ksa.paymob.com/v1",
  unifiedCheckoutUrl: process.env.PAYMOB_UNIFIED_CHECKOUT_URL || "https://ksa.paymob.com/unifiedcheckout/",
  sandbox: process.env.PAYMOB_SANDBOX !== "false", // Default to sandbox
} as const;

/**
 * Polar configuration
 */
export const POLAR_CONFIG = {
  accessToken: process.env.POLAR_ACCESS_TOKEN || "",
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET || "",
  successUrl: process.env.POLAR_SUCCESS_URL || "/success?checkout_id={CHECKOUT_ID}",
  sandbox: process.env.POLAR_SERVER === "sandbox" || true,
  starterTier: process.env.NEXT_PUBLIC_STARTER_TIER || "",
  starterSlug: process.env.NEXT_PUBLIC_STARTER_SLUG || "",
} as const;

/**
 * App URLs
 */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ============================================================================
// Supported Countries for Regional Detection
// ============================================================================

/**
 * Countries that should use Paymob (KSA/GCC region)
 */
export const PAYMOB_SUPPORTED_COUNTRIES: string[] = process.env.PAYMOB_SUPPORTED_COUNTRIES
  ? process.env.PAYMOB_SUPPORTED_COUNTRIES.split(",").map((c) => c.trim().toUpperCase())
  : ["SA", "AE", "KW", "QA", "BH", "OM", "EG"]; // Saudi Arabia, UAE, Kuwait, Qatar, Bahrain, Oman, Egypt

/**
 * All supported countries with their preferred provider
 */
export const COUNTRY_PROVIDER_MAP: Record<string, PaymentProvider> = Object.fromEntries(
  PAYMOB_SUPPORTED_COUNTRIES.map((country) => [country, "paymob"])
);

// ============================================================================
// Product Configuration
// ============================================================================

/**
 * Product mapping for different providers
 */
export const PRODUCTS = {
  polar: {
    starter: {
      id: POLAR_CONFIG.starterTier,
      slug: POLAR_CONFIG.starterSlug,
    },
  },
  paymob: {
    starter: {
      id: PAYMOB_CONFIG.starterPlanId.toString(),
      slug: "starter",
    },
  },
} as const;

// ============================================================================
// Currency Configuration
// ============================================================================

/**
 * Currency codes supported by each provider
 */
export const PROVIDER_CURRENCIES = {
  polar: ["USD", "EUR"],
  paymob: ["SAR", "EGP", "AED", "USD"],
} as const;

/**
 * Default currency per provider
 */
export const PROVIDER_DEFAULT_CURRENCY = {
  polar: "USD",
  paymob: "SAR",
} as const;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Check if Paymob is properly configured
 */
export function isPaymobConfigured(): boolean {
  return !!(
    PAYMOB_CONFIG.apiKey &&
    PAYMOB_CONFIG.publicKey &&
    PAYMOB_CONFIG.hmacSecret &&
    PAYMOB_CONFIG.integrationId3DS &&
    PAYMOB_CONFIG.starterPlanId
  );
}

/**
 * Check if Polar is properly configured
 */
export function isPolarConfigured(): boolean {
  return !!(POLAR_CONFIG.accessToken && POLAR_CONFIG.webhookSecret && POLAR_CONFIG.starterTier);
}

/**
 * Get all available payment providers
 */
export function getAvailableProviders(): PaymentProvider[] {
  const providers: PaymentProvider[] = [];

  if (isPolarConfigured()) {
    providers.push("polar");
  }

  if (isPaymobConfigured()) {
    providers.push("paymob");
  }

  return providers;
}

/**
 * Get the provider to use for a given country
 */
export function getProviderForCountry(countryCode: string): PaymentProvider {
  return COUNTRY_PROVIDER_MAP[countryCode.toUpperCase()] || DEFAULT_PAYMENT_PROVIDER;
}
