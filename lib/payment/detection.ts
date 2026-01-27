/**
 * Regional Provider Detection
 * Determines which payment provider to use based on user location
 */

import type { PaymentProvider } from "./types";
import { PAYMOB_SUPPORTED_COUNTRIES, DEFAULT_PAYMENT_PROVIDER } from "./config";

// ============================================================================
// Country Detection
// ============================================================================

/**
 * Detect which payment provider to use for a given country
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Payment provider to use
 */
export function detectProviderForCountry(countryCode: string): PaymentProvider {
  return PAYMOB_SUPPORTED_COUNTRIES.includes(countryCode.toUpperCase()) ? "paymob" : "polar";
}

/**
 * Get country code for a payment provider
 * Useful for testing and debugging
 */
export function getCountryForProvider(provider: PaymentProvider): string[] {
  if (provider === "paymob") {
    return PAYMOB_SUPPORTED_COUNTRIES;
  }
  // Return all other countries (not exhaustive)
  return ["US", "GB", "CA", "AU", "DE", "FR", "ES", "IT", "NL", "JP", "SG", "IN", "BR"];
}

// ============================================================================
// Client-Side Detection (for browser usage)
// ============================================================================

/**
 * Detect country on client side using timezone
 * @returns Likely country code based on timezone
 */
export function detectCountryFromTimezone(): string {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Map common timezones to countries
  const timezoneMap: Record<string, string> = {
    "Asia/Riyadh": "SA",
    "Asia/Dubai": "AE",
    "Asia/Kuwait": "KW",
    "Asia/Qatar": "QA",
    "Asia/Bahrain": "BH",
    "Asia/Muscat": "OM",
    "Africa/Cairo": "EG",
    "America/New_York": "US",
    "Europe/London": "GB",
    "Europe/Paris": "FR",
    "Europe/Berlin": "DE",
    "Asia/Tokyo": "JP",
  };

  return timezoneMap[timezone] || "US";
}

/**
 * Get provider for client-side usage
 * Uses timezone as a fallback for country detection
 */
export function getProviderForClient(): PaymentProvider {
  const country = detectCountryFromTimezone();
  return detectProviderForCountry(country);
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Check if a country is supported by Paymob
 */
export function isPaymobCountry(countryCode: string): boolean {
  return PAYMOB_SUPPORTED_COUNTRIES.includes(countryCode.toUpperCase());
}

/**
 * Get all supported country codes for Paymob
 */
export function getPaymobCountries(): readonly string[] {
  return PAYMOB_SUPPORTED_COUNTRIES;
}

/**
 * Get the default provider (fallback)
 */
export function getDefaultProvider(): PaymentProvider {
  return DEFAULT_PAYMENT_PROVIDER;
}
