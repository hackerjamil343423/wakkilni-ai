/**
 * Paymob Webhook Handler
 * Processes webhooks from Paymob payment gateway
 */

import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/payment/service";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    // NOTE: Paymob sends HMAC as query parameter named 'hmac', not as header
    const { searchParams } = new URL(request.url);
    const signature = searchParams.get("hmac");

    // Verify webhook signature
    const verification = await PaymentService.verifyWebhook(payload, signature, "paymob");

    if (!verification.valid) {
      console.error("Paymob webhook verification failed:", verification.error);
      return NextResponse.json({ error: verification.error || "Invalid signature" }, { status: 401 });
    }

    // Process webhook
    await PaymentService.processWebhook(payload, "paymob");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Paymob webhook processing error:", error);

    // Always return 200 for webhooks to prevent retries
    // Errors are logged but webhook succeeds
    return NextResponse.json({ success: true });
  }
}

// Paymob also sends GET requests for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: "Paymob webhook endpoint is active" });
}
