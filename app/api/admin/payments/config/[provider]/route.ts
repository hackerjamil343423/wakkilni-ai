/**
 * Admin Payment Configuration API - Per Provider
 * GET /api/admin/payments/config/:provider - Get provider config
 * PUT /api/admin/payments/config/:provider - Update provider config
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPaymentConfig, updatePaymentConfig } from "@/lib/payment/admin/service";
import { getAdminAuthError } from "@/lib/payment/admin/authz";
import type { PaymentProvider } from "@/lib/payment/types";

interface RouteContext {
  params: Promise<{ provider: string }>;
}

/**
 * GET /api/admin/payments/config/:provider
 * Get payment configuration for a specific provider
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Verify admin authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const authError = getAdminAuthError(session);
    if (authError) {
      return NextResponse.json({ error: authError.error }, { status: authError.status });
    }

    const { provider } = await context.params;
    const validProviders: PaymentProvider[] = ["polar", "paymob", "streampay"];

    if (!validProviders.includes(provider as PaymentProvider)) {
      return NextResponse.json(
        { error: `Invalid provider: ${provider}` },
        { status: 400 }
      );
    }

    const config = await getPaymentConfig(provider as PaymentProvider);

    if (!config) {
      return NextResponse.json(
        { error: `Configuration not found for provider: ${provider}` },
        { status: 404 }
      );
    }

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Error fetching payment config:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment configuration" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/payments/config/:provider
 * Update payment configuration for a specific provider
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // Verify admin authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const authError = getAdminAuthError(session);
    if (authError) {
      return NextResponse.json({ error: authError.error }, { status: authError.status });
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

    const updatedConfig = await updatePaymentConfig(
      provider as PaymentProvider,
      body
    );

    return NextResponse.json({ config: updatedConfig });
  } catch (error) {
    console.error("Error updating payment config:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update payment configuration" },
      { status: 500 }
    );
  }
}
