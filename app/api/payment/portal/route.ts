/**
 * Payment Portal API Route
 * Opens customer portal for subscription management
 */

import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/payment/service";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return NextResponse.json({ error: "subscriptionId is required" }, { status: 400 });
    }

    const result = await PaymentService.createCustomerPortal(subscriptionId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to open portal",
      },
      { status: 500 }
    );
  }
}
