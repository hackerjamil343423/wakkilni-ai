import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { polarClient } from "@polar-sh/better-auth";

export const authClient = createAuthClient({
  // Prefer dedicated auth URL, fallback to public app URL.
  baseURL: process.env.BETTER_AUTH_BASE_URL || process.env.NEXT_PUBLIC_APP_URL,
  plugins: [organizationClient(), polarClient()],
});

// Re-export payment client for convenience
export { paymentClient } from "@/lib/payment/client";
