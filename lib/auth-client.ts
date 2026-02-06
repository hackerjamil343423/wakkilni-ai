import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { polarClient } from "@polar-sh/better-auth";

export const authClient = createAuthClient({
  // Keep this optional; if unset, Better Auth client uses same-origin.
  baseURL: process.env.BETTER_AUTH_BASE_URL,
  plugins: [organizationClient(), polarClient()],
});

// Re-export payment client for convenience
export { paymentClient } from "@/lib/payment/client";
