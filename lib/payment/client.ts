/**
 * Payment Client
 * Client-side utilities for payment operations
 */

"use client";

import type { CheckoutOptions, CheckoutResult, CustomerPortalResult } from "./types";
import { detectCountryFromTimezone, getProviderForClient } from "./detection";

// ============================================================================
// Client Configuration
// ============================================================================

const API_BASE = typeof window !== "undefined"
  ? window.location.origin
  : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ============================================================================
// Payment Client
// ============================================================================

/**
 * Payment Client for browser-side operations
 */
export const paymentClient = {
  /**
   * Create checkout session
   * Provider is auto-selected based on user location
   */
  async checkout(options: CheckoutOptions): Promise<CheckoutResult> {
    const response = await fetch(`${API_BASE}/api/payment/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Checkout failed");
    }

    const result = await response.json();

    // Redirect to checkout URL
    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl;
    }

    return result;
  },

  /**
   * Create checkout session with specific provider
   */
  async checkoutWithProvider(
    provider: "polar" | "paymob",
    options: CheckoutOptions
  ): Promise<CheckoutResult> {
    const response = await fetch(`${API_BASE}/api/payment/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...options, provider }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Checkout failed");
    }

    const result = await response.json();

    // Redirect to checkout URL
    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl;
    }

    return result;
  },

  /**
   * Open customer portal
   */
  async customerPortal(subscriptionId: string): Promise<CustomerPortalResult> {
    const response = await fetch(`${API_BASE}/api/payment/portal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to open customer portal");
    }

    const result = await response.json();

    // Redirect to portal URL
    if (result.portalUrl) {
      window.location.href = result.portalUrl;
    }

    return result;
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = false): Promise<void> {
    const response = await fetch(`${API_BASE}/api/payment/subscription/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subscriptionId, cancelAtPeriodEnd }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || "Failed to cancel subscription");
    }
  },

  /**
   * Get user's payment provider (client-side detection)
   */
  async getProvider(): Promise<"polar" | "paymob"> {
    try {
      // Try server-side detection first
      const response = await fetch(`${API_BASE}/api/payment/provider`);
      if (response.ok) {
        const data = await response.json();
        return data.provider;
      }
    } catch {
      // Fall back to client-side detection
    }

    // Client-side fallback
    return getProviderForClient();
  },

  /**
   * Get user's detected country code (client-side)
   */
  getCountry(): string {
    return detectCountryFromTimezone();
  },

  /**
   * Check if user would use Paymob (client-side detection)
   */
  wouldUsePaymob(): boolean {
    return getProviderForClient() === "paymob";
  },
};

// ============================================================================
// React Hook
// ============================================================================

import { useEffect, useState } from "react";

export interface UsePaymentResult {
  provider: "polar" | "paymob" | null;
  country: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * React hook for payment provider detection
 */
export function usePayment(): UsePaymentResult {
  const [state, setState] = useState<UsePaymentResult>({
    provider: null,
    country: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchPaymentInfo() {
      try {
        const [provider, country] = await Promise.all([
          paymentClient.getProvider(),
          Promise.resolve(paymentClient.getCountry()),
        ]);

        setState({
          provider,
          country,
          loading: false,
          error: null,
        });
      } catch (error) {
        setState({
          provider: null,
          country: null,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load payment info",
        });
      }
    }

    fetchPaymentInfo();
  }, []);

  return state;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format currency based on provider and currency code
 */
export function formatCurrency(amount: number, currency: string, provider: "polar" | "paymob"): string {
  const locale = provider === "paymob" ? "ar-SA" : "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount / 100); // Amount is in cents
}

/**
 * Get currency symbol for a provider
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    SAR: "ر.س",
    AED: "د.إ",
    EGP: "ج.م",
    KWD: "د.ك",
    QAR: "ر.ق",
    BHD: "د.ب",
    OMR: "ر.ع",
  };

  return symbols[currency] || currency;
}

/**
 * Get provider name for display
 */
export function getProviderName(provider: "polar" | "paymob"): string {
  const names = {
    polar: "Polar",
    paymob: "Paymob",
  };

  return names[provider];
}

/**
 * Get localized payment methods for a provider
 */
export function getPaymentMethods(provider: "polar" | "paymob"): string[] {
  const methods = {
    polar: ["Credit Card", "Debit Card", "Apple Pay", "Google Pay"],
    paymob: ["Credit Card", "MADA", "Tabby", "Tamara", "Apple Pay", "Google Pay", "stcPay"],
  };

  return methods[provider];
}
