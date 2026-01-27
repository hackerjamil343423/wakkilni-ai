/**
 * Get Payment Provider API Route
 * Returns the payment provider for the current user (for UI display)
 */

import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/payment/service";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get user's payment provider (does not require authentication for detection)
    const provider = await PaymentService.getUserProvider();
    const country = await PaymentService.getUserCountry();

    return NextResponse.json({
      provider,
      country,
      wouldUsePaymob: provider === "paymob",
    });
  } catch (error) {
    console.error("Get provider error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get provider",
      },
      { status: 500 }
    );
  }
}
