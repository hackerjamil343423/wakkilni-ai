/**
 * Admin Payment Webhook Configuration API
 * GET /api/admin/payments/config/:provider/webhook - Get webhook config
 * PUT /api/admin/payments/config/:provider/webhook - Update webhook config
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateWebhookConfig } from "@/lib/payment/admin/service";
import { getAdminAuthError } from "@/lib/payment/admin/authz";
import type { PaymentProvider } from "@/lib/payment/types";

interface RouteContext {
  params: Promise<{ provider: string }>;
}

/**
 * PUT /api/admin/payments/config/:provider/webhook
 * Update webhook configuration for a payment provider
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
    const { webhookUrl, webhookSecret, webhookEvents } = body;

    if (!webhookUrl || !webhookSecret) {
      return NextResponse.json(
        { error: "webhookUrl and webhookSecret are required" },
        { status: 400 }
      );
    }

    const updatedConfig = await updateWebhookConfig(
      provider as PaymentProvider,
      webhookUrl,
      webhookSecret,
      webhookEvents
    );

    return NextResponse.json({ config: updatedConfig });
  } catch (error) {
    console.error("Error updating webhook config:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update webhook configuration" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/payments/config/:provider/webhook
 * Get webhook configuration (not implemented - use main config endpoint)
 */
export async function GET() {
  return NextResponse.json(
    { message: "Use GET /api/admin/payments/config/:provider to get full config including webhook settings" },
    { status: 200 }
  );
}
