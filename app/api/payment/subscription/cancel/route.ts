/**
 * Cancel Subscription API Route
 * Cancels an active subscription
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
    const { subscriptionId, cancelAtPeriodEnd = false } = body;

    if (!subscriptionId) {
      return NextResponse.json({ error: "subscriptionId is required" }, { status: 400 });
    }

    await PaymentService.cancelSubscription(subscriptionId, cancelAtPeriodEnd);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to cancel subscription",
      },
      { status: 500 }
    );
  }
}
