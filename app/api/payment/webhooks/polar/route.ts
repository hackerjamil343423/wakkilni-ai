/**
 * Polar Webhook Handler
 * Processes webhooks from Polar.sh payment gateway
 * Note: This is a dedicated endpoint for Polar webhooks
 * The actual processing is still handled by Better Auth plugin in lib/auth.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/payment/service";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const signature = request.headers.get("polar-signature");

    // Verify webhook signature
    const verification = await PaymentService.verifyWebhook(payload, signature, "polar");

    if (!verification.valid) {
      console.error("Polar webhook verification failed:", verification.error);
      return NextResponse.json({ error: verification.error || "Invalid signature" }, { status: 401 });
    }

    // Process webhook (delegated to Better Auth plugin)
    await PaymentService.processWebhook(payload, "polar");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Polar webhook processing error:", error);

    // Always return 200 for webhooks to prevent retries
    // Errors are logged but webhook succeeds
    return NextResponse.json({ success: true });
  }
}

// Polar also sends GET requests for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: "Polar webhook endpoint is active" });
}
