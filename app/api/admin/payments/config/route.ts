/**
 * Admin Payment Configuration API
 * GET /api/admin/payments/config - Get all payment provider configs
 * PUT /api/admin/payments/config/:provider - Update provider config
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllPaymentConfigs, updatePaymentConfig } from "@/lib/payment/admin/service";
import type { PaymentProvider } from "@/lib/payment/types";

/**
 * GET /api/admin/payments/config
 * Get all payment provider configurations
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin role check
    // For now, any authenticated user can access

    const configs = await getAllPaymentConfigs();

    return NextResponse.json({ configs });
  } catch (error) {
    console.error("Error fetching payment configs:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment configurations" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/payments/config
 * Update payment configuration (body should include provider)
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin role check

    const body = await request.json();
    const { provider, ...updateData } = body;

    if (!provider) {
      return NextResponse.json(
        { error: "Provider is required" },
        { status: 400 }
      );
    }

    const validProviders: PaymentProvider[] = ["polar", "paymob", "streampay"];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: `Invalid provider: ${provider}` },
        { status: 400 }
      );
    }

    const updatedConfig = await updatePaymentConfig(provider, updateData);

    return NextResponse.json({ config: updatedConfig });
  } catch (error) {
    console.error("Error updating payment config:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update payment configuration" },
      { status: 500 }
    );
  }
}
