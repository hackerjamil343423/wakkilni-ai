/**
 * Streampay Webhook Handler
 * Processes webhooks from Streampay payment gateway
 */

import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/payment/service";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    // Streampay sends signature in the X-Webhook-Signature header
    const signature = request.headers.get("x-webhook-signature");

    // Verify webhook signature
    const verification = await PaymentService.verifyWebhook(payload, signature, "streampay");

    if (!verification.valid) {
      console.error("Streampay webhook verification failed:", verification.error);
      return NextResponse.json({ error: verification.error || "Invalid signature" }, { status: 401 });
    }

    // Process webhook
    await PaymentService.processWebhook(payload, "streampay");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Streampay webhook processing error:", error);

    // Always return 200 for webhooks to prevent retries
    // Errors are logged but webhook succeeds
    return NextResponse.json({ success: true });
  }
}

// Streampay may send GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ status: "Streampay webhook endpoint is active" });
}
