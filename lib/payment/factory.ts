/**
 * Payment Provider Factory
 * Factory pattern for provider instantiation and selection
 */

import type { IPaymentProvider } from "./providers/base";
import type { PaymentProvider } from "./types";
import { detectUserCountry } from "./detection.server";
import { detectProviderForCountry } from "./detection";

// Lazy load providers to avoid circular dependencies
let polarProviderInstance: IPaymentProvider | null = null;
let paymobProviderInstance: IPaymentProvider | null = null;

/**
 * Get provider instance by name
 */
async function getProviderInstance(name: PaymentProvider): Promise<IPaymentProvider> {
  switch (name) {
    case "polar":
      if (!polarProviderInstance) {
        const { PolarProvider } = await import("./providers/polar/index");
        polarProviderInstance = new PolarProvider();
      }
      return polarProviderInstance;

    case "paymob":
      if (!paymobProviderInstance) {
        const { PaymobProvider } = await import("./providers/paymob/index");
        paymobProviderInstance = new PaymobProvider();
      }
      return paymobProviderInstance;

    default:
      throw new Error(`Unsupported payment provider: ${name}`);
  }
}

/**
 * Payment Provider Factory
 */
export class PaymentProviderFactory {
  /**
   * Get provider instance by name
   * @param providerName - The provider name ('polar' | 'paymob')
   * @returns Provider instance
   */
  static async getProvider(providerName: PaymentProvider): Promise<IPaymentProvider> {
    return getProviderInstance(providerName);
  }

  /**
   * Auto-detect provider based on user location
   * Uses request headers to determine country and select appropriate provider
   * @returns Provider instance based on user's country
   */
  static async getProviderForRequest(): Promise<IPaymentProvider> {
    const userCountry = await detectUserCountry();
    const provider = detectProviderForCountry(userCountry);
    return getProviderInstance(provider);
  }

  /**
   * Get provider for a specific country code
   * @param countryCode - ISO 3166-1 alpha-2 country code
   * @returns Provider instance for the country
   */
  static async getProviderForCountry(countryCode: string): Promise<IPaymentProvider> {
    const provider = detectProviderForCountry(countryCode);
    return getProviderInstance(provider);
  }

  /**
   * Get all available providers
   * @returns Array of available provider instances
   */
  static async getAllProviders(): Promise<IPaymentProvider[]> {
    const providers: PaymentProvider[] = [];

    try {
      const polar = await getProviderInstance("polar");
      providers.push("polar");
    } catch {
      // Polar not configured
    }

    try {
      const paymob = await getProviderInstance("paymob");
      providers.push("paymob");
    } catch {
      // Paymob not configured
    }

    const instances = await Promise.all(
      providers.map((name) => getProviderInstance(name))
    );

    return instances;
  }

  /**
   * Reset cached provider instances
   * Useful for testing or when configuration changes
   */
  static resetCache(): void {
    polarProviderInstance = null;
    paymobProviderInstance = null;
  }
}
