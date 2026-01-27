/**
 * Server-side Regional Provider Detection
 * Determines which payment provider to use based on user location (server-side only)
 */

import type { PaymentProvider } from "./types";
import { PAYMOB_SUPPORTED_COUNTRIES } from "./config";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { detectProviderForCountry } from "./detection";

/**
 * Detect user's country from request headers
 * Priority order:
 * 1. Cloudflare country header (cf-ipcountry)
 * 2. Vercel country header (x-vercel-ip-country)
 * 3. User profile country (from session)
 * 4. Default to US
 */
export async function detectUserCountry(): Promise<string> {
  // Try Cloudflare country header
  const headersList = await headers();
  const cfCountry = headersList.get("cf-ipcountry");
  if (cfCountry && cfCountry.length === 2) {
    return cfCountry.toUpperCase();
  }

  // Try Vercel country header
  const vercelCountry = headersList.get("x-vercel-ip-country");
  if (vercelCountry && vercelCountry.length === 2) {
    return vercelCountry.toUpperCase();
  }

  // Try user profile country from session
  try {
    const session = await auth.api.getSession({
      headers: headersList,
    });

    // Note: Better Auth user doesn't have metadata by default
    // You may need to extend the user schema or store country separately
    if (session?.user && "country" in session.user && session.user.country) {
      const userCountry = session.user.country as string;
      if (userCountry && userCountry.length === 2) {
        return userCountry.toUpperCase();
      }
    }
  } catch (error) {
    // Ignore session errors, fall back to default
  }

  // Default to US (will use Polar)
  return "US";
}

/**
 * Get the appropriate payment provider for the current request
 */
export async function getProviderForRequest(): Promise<PaymentProvider> {
  const country = await detectUserCountry();
  return detectProviderForCountry(country);
}
