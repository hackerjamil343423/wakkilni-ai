/**
 * Admin Payment Test Connection API
 * POST /api/admin/payments/config/:provider/test - Test provider connection
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { testConnection } from "@/lib/payment/admin/service";
import { getAdminAuthError } from "@/lib/payment/admin/authz";
import type { PaymentProvider } from "@/lib/payment/types";

interface RouteContext {
  params: Promise<{ provider: string }>;
}

/**
 * POST /api/admin/payments/config/:provider/test
 * Test connection to a payment provider
 */
export async function POST(request: NextRequest, context: RouteContext) {
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

    const result = await testConnection(provider as PaymentProvider);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error testing payment connection:", error);
    return NextResponse.json(
      {
        result: {
          success: false,
          message: error instanceof Error ? error.message : "Connection test failed",
        },
      },
      { status: 500 }
    );
  }
}
