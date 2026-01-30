/**
 * Admin Payment Credentials API
 * PUT /api/admin/payments/config/:provider/credentials - Update API credentials
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updatePaymentCredentials } from "@/lib/payment/admin/service";
import type { PaymentProvider } from "@/lib/payment/types";

interface RouteContext {
  params: Promise<{ provider: string }>;
}

/**
 * PUT /api/admin/payments/config/:provider/credentials
 * Update API credentials for a payment provider
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // Verify admin authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider } = await context.params;
    const validProviders: PaymentProvider[] = ["polar", "paymob", "streampay"];

    if (!validProviders.includes(provider as PaymentProvider)) {
      return NextResponse.json(
        { error: `Invalid provider: ${provider}` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { publicKey, secretKey } = body;

    if (!publicKey || !secretKey) {
      return NextResponse.json(
        { error: "publicKey and secretKey are required" },
        { status: 400 }
      );
    }

    const updatedConfig = await updatePaymentCredentials(
      provider as PaymentProvider,
      publicKey,
      secretKey
    );

    return NextResponse.json({ config: updatedConfig });
  } catch (error) {
    console.error("Error updating payment credentials:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update credentials" },
      { status: 500 }
    );
  }
}
