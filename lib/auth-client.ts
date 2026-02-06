import { createAuthClient } from "better-auth/react";
import { polarClient } from "@polar-sh/better-auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [polarClient()],
});

// Re-export payment client for convenience
export { paymentClient } from "@/lib/payment/client";
